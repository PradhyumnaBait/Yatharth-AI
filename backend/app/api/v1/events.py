from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db, AsyncSessionLocal
from backend.app.models.entities import (
    FieldReport, ExtractedEvent, ActivityMatch, MatchCandidate,
    ProgressEvent, ReviewAction, Activity, ConversationMessage, Schedule
)
from backend.app.schemas.dtos import FieldEventDTO, ActivityDTO
from backend.app.domain.audit.chain import audit_chain_service
from backend.app.domain.matching.engine import matching_engine
from backend.app.domain.dictionary.active_learning import process_active_learning_feedback
from backend.app.api.v1.schedules import _build_activity_dto

router = APIRouter(tags=["events"])

class ApproveRequest(BaseModel):
    activityId: Optional[str] = None

class RejectRequest(BaseModel):
    reason: str

class RematchRequest(BaseModel):
    newActivityId: str
    reason: Optional[str] = None

class QuestionRequest(BaseModel):
    question: str

class ReplyRequest(BaseModel):
    reply: str

async def _build_event_dto(fr: FieldReport, db: AsyncSession) -> FieldEventDTO:
    # Fetch extracted event & match
    ee_stmt = select(ExtractedEvent).where(ExtractedEvent.field_report_id == fr.id)
    ee = (await db.execute(ee_stmt)).scalars().first()

    am = None
    candidates = []
    if ee:
        am_stmt = select(ActivityMatch).where(ActivityMatch.extracted_event_id == ee.id)
        am = (await db.execute(am_stmt)).scalars().first()
        if am:
            cand_stmt = select(MatchCandidate).where(MatchCandidate.activity_match_id == am.id)
            candidates = (await db.execute(cand_stmt)).scalars().all()

    # Conversation messages
    msg_stmt = select(ConversationMessage).where(ConversationMessage.event_id == fr.id)
    messages = (await db.execute(msg_stmt)).scalars().all()
    questions_list = [
        {"id": m.id, "author": m.author_name, "text": m.text, "time": m.time, "reply": m.reply}
        for m in messages
    ]

    status_str = "Verified" if (am and am.decision_tier == "AUTO_ACCEPT") else (
        "Review" if (am and am.decision_tier in ["REVIEW", "WARNING"]) else (
            "Delay" if (am and am.decision_tier == "DELAY") else (
                "Unmatched" if (am and am.decision_tier == "UNMATCHED") else "Review"
            )
        )
    )
    if any(q.get("reply") is None for q in questions_list if q.get("text")):
        status_str = "Reply needed"

    # Fetch reasons from candidates
    reasons = candidates[0].reasons if candidates and candidates[0].reasons else []

    # Accumulator details for PIP-24-017
    is_accum = False
    accum_details = None
    if am and am.suggested_activity_id == "PIP-24-017":
        is_accum = True
        accum_details = {
            "current": 16,
            "total": 42,
            "unit": "spools",
            "percentOld": 38,
            "percentNew": 40
        }

    return FieldEventDTO(
        id=fr.id,
        source=fr.source,
        timestamp=fr.created_at.strftime("%I:%M %p"),
        rawText=fr.raw_text,
        authorName=fr.author_name,
        authorRole=fr.author_role,
        authorPhone=fr.author_phone,
        authorCrew=fr.author_crew,
        audioUrl=fr.audio_url,
        thumbnailUrl=fr.thumbnail_url,
        status=status_str,
        queueTier=am.decision_tier.capitalize() if am else "Review",
        confidence=am.confidence if am else 80.0,
        suggestedActivityId=am.suggested_activity_id if am else None,
        suggestedActivityName=am.suggested_activity_name if am else None,
        extractedInfo=ee.raw_extraction_json if ee else None,
        reasons=reasons,
        logicCheckStatus=am.logic_check_result.capitalize() if am else "Passed",
        logicCheckMessage=am.logic_check_message if am else None,
        isAccumulator=is_accum,
        accumulatorDetails=accum_details,
        questions=questions_list
    )

@router.get("/projects/{project_id}/events", response_model=List[FieldEventDTO])
async def get_project_events(project_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(FieldReport).where(FieldReport.project_id == project_id).order_by(FieldReport.created_at.desc())
    reports = (await db.execute(stmt)).scalars().all()
    return [await _build_event_dto(r, db) for r in reports]

@router.get("/events/{event_id}", response_model=FieldEventDTO)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(FieldReport).where(FieldReport.id == event_id)
    report = (await db.execute(stmt)).scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Event not found")
    return await _build_event_dto(report, db)

@router.post("/events/{event_id}/approve")
async def approve_event(
    event_id: str,
    req: ApproveRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FieldReport).where(FieldReport.id == event_id)
    report = (await db.execute(stmt)).scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Event not found")

    ee = (await db.execute(select(ExtractedEvent).where(ExtractedEvent.field_report_id == report.id))).scalars().first()
    if not ee:
        raise HTTPException(status_code=400, detail="Event missing extraction")
    
    am = (await db.execute(select(ActivityMatch).where(ActivityMatch.extracted_event_id == ee.id))).scalars().first()
    if not am:
        raise HTTPException(status_code=400, detail="Event missing match")

    target_activity_id = req.activityId or am.suggested_activity_id
    if not target_activity_id:
        raise HTTPException(status_code=400, detail="Cannot approve unmatched event without choosing activity")

    # Update match
    am.decision_tier = "AUTO_ACCEPT"  # Verified

    # Update Activity progress
    act = (await db.execute(select(Activity).where(Activity.id == target_activity_id))).scalars().first()
    updated_act_dto = None
    if act:
        old_pct = act.physical_percent
        # Accumulator 38% -> 40% on PIP-24-017 (16 of 42 spools -> 17 of 42 spools)
        if act.external_task_id == "PIP-24-017" and old_pct == 38.0:
            new_pct = 40.0
            act.quantity_completed = 17.0
        else:
            new_pct = min(100.0, old_pct + 2.0)
        
        act.physical_percent = new_pct
        if new_pct >= 100.0:
            act.status = "Complete"
        elif new_pct > 0.0:
            act.status = "In progress"

        # Record Progress Event
        prog = ProgressEvent(
            activity_match_id=am.id,
            activity_id=act.id,
            percent_old=old_pct,
            percent_new=new_pct,
            delta=new_pct - old_pct,
            unit_delta="1 spool" if act.external_task_id == "PIP-24-017" else None,
            applied_at=datetime.now(timezone.utc),
            applied_by="Meera Nair"
        )
        db.add(prog)

        # Audit Log Entry
        await audit_chain_service.append_log_entry(
            session=db,
            project_id=report.project_id,
            actor="Meera Nair",
            action="Approve Match",
            activity_id=act.external_task_id,
            new_value=f"{new_pct}%",
            source_event_id=report.id
        )
        updated_act_dto = await _build_activity_dto(act, db)

    # Record Review Action
    session_action = ReviewAction(
        activity_match_id=am.id,
        actor_id="user-planner",
        actor_name="Meera Nair",
        action="APPROVE",
        reason="Verified by planner on Workbench",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(session_action)

    await db.commit()
    event_dto = await _build_event_dto(report, db)
    return {"event": event_dto, "updatedActivity": updated_act_dto}

@router.post("/events/{event_id}/reject", response_model=FieldEventDTO)
async def reject_event(event_id: str, req: RejectRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(FieldReport).where(FieldReport.id == event_id)
    report = (await db.execute(stmt)).scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Event not found")

    ee = (await db.execute(select(ExtractedEvent).where(ExtractedEvent.field_report_id == report.id))).scalars().first()
    if ee:
        am = (await db.execute(select(ActivityMatch).where(ActivityMatch.extracted_event_id == ee.id))).scalars().first()
        if am:
            am.decision_tier = "UNMATCHED"
            db.add(ReviewAction(
                activity_match_id=am.id,
                actor_id="user-planner",
                actor_name="Meera Nair",
                action="REJECT",
                reason=req.reason,
                timestamp=datetime.now(timezone.utc)
            ))

    await db.commit()
    return await _build_event_dto(report, db)

async def _bg_active_learning_task(
    match_id: str,
    actor_id: str,
    raw_text: str,
    act_id: str,
    act_name: str,
    proj_id: str
):
    async with AsyncSessionLocal() as session:
        await process_active_learning_feedback(
            session=session,
            match_id=match_id,
            actor_id=actor_id,
            raw_text=raw_text,
            chosen_activity_id=act_id,
            chosen_activity_name=act_name,
            project_id=proj_id
        )

@router.post("/events/{event_id}/rematch", response_model=FieldEventDTO)
async def rematch_event(
    event_id: str,
    req: RematchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FieldReport).where(FieldReport.id == event_id)
    report = (await db.execute(stmt)).scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Event not found")

    ee = (await db.execute(select(ExtractedEvent).where(ExtractedEvent.field_report_id == report.id))).scalars().first()
    if not ee:
        raise HTTPException(status_code=400, detail="Event missing extraction")
    
    am = (await db.execute(select(ActivityMatch).where(ActivityMatch.extracted_event_id == ee.id))).scalars().first()
    if not am:
        raise HTTPException(status_code=400, detail="Event missing match")

    act = (await db.execute(select(Activity).where(Activity.id == req.newActivityId))).scalars().first()
    if not act:
        raise HTTPException(status_code=404, detail="Target activity not found")

    am.suggested_activity_id = act.id
    am.suggested_activity_name = act.name
    am.match_method = "PLANNER_OVERRIDE"
    am.confidence = 92.0
    am.decision_tier = "REVIEW"

    # Audit entry for rematch
    await audit_chain_service.append_log_entry(
        session=db,
        project_id=report.project_id,
        actor="Meera Nair",
        action="Rematch Event",
        activity_id=act.external_task_id,
        new_value=f"Rematched: {act.name}",
        source_event_id=report.id
    )

    await db.commit()

    # D20 Fire-and-forget Tier 3 Active Learning feedback task!
    background_tasks.add_task(
        _bg_active_learning_task,
        match_id=am.id,
        actor_id="user-planner",
        raw_text=report.raw_text,
        act_id=act.id,
        act_name=act.name,
        proj_id=report.project_id
    )

    return await _build_event_dto(report, db)

@router.post("/events/{event_id}/questions", response_model=FieldEventDTO)
async def ask_question(event_id: str, req: QuestionRequest, db: AsyncSession = Depends(get_db)):
    msg = ConversationMessage(
        event_id=event_id,
        author_id="user-planner",
        author_name="Meera Nair",
        author_role="Planner",
        text=req.question,
        time=datetime.now().strftime("%I:%M %p")
    )
    db.add(msg)
    await db.commit()
    
    report = (await db.execute(select(FieldReport).where(FieldReport.id == event_id))).scalars().first()
    return await _build_event_dto(report, db)

@router.post("/events/{event_id}/questions/{question_id}/reply", response_model=FieldEventDTO)
async def reply_question(event_id: str, question_id: str, req: ReplyRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(ConversationMessage).where(ConversationMessage.id == question_id)
    msg = (await db.execute(stmt)).scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Question not found")

    msg.reply = req.reply
    await db.commit()
    
    report = (await db.execute(select(FieldReport).where(FieldReport.id == event_id))).scalars().first()
    return await _build_event_dto(report, db)

class SubmitEventPayload(BaseModel):
    source: Optional[str] = "manual"
    rawText: str
    authorName: Optional[str] = "Field Supervisor"
    authorRole: Optional[str] = "Supervisor"
    authorPhone: Optional[str] = None
    authorCrew: Optional[str] = None
    projectId: Optional[str] = "proj-kpp"
    audioUrl: Optional[str] = None
    thumbnailUrl: Optional[str] = None

@router.post("/events", response_model=FieldEventDTO)
async def submit_event(req: SubmitEventPayload, db: AsyncSession = Depends(get_db)):
    # 1. Run matching engine
    match_result = await matching_engine.process_report_text(
        session=db,
        project_id=req.projectId or "proj-kpp",
        raw_text=req.rawText
    )

    # 2. Persist FieldReport
    eid = f"E-{datetime.now().strftime('%H%M%S')}"
    fr = FieldReport(
        id=eid,
        project_id=req.projectId or "proj-kpp",
        author_name=req.authorName or "Field Supervisor",
        author_role=req.authorRole or "Supervisor",
        author_phone=req.authorPhone,
        author_crew=req.authorCrew,
        source=req.source or "manual",
        raw_text=req.rawText,
        audio_url=req.audioUrl,
        thumbnail_url=req.thumbnailUrl,
        status="TRANSCRIBED",
        created_at=datetime.now(timezone.utc)
    )
    db.add(fr)
    await db.flush()

    # 3. Persist ExtractedEvent
    ext = match_result["extractedInfo"]
    ee = ExtractedEvent(
        id=f"ext-{fr.id}",
        field_report_id=fr.id,
        action=ext.get("action"),
        object=ext.get("object"),
        location=ext.get("location"),
        status=ext.get("status"),
        quantity=ext.get("quantity"),
        unit=ext.get("unit"),
        confidence=1.0,
        raw_extraction_json=ext,
        created_at=fr.created_at
    )
    db.add(ee)
    await db.flush()

    # 4. Persist ActivityMatch
    am = ActivityMatch(
        id=f"match-{fr.id}",
        extracted_event_id=ee.id,
        suggested_activity_id=match_result["activityId"],
        suggested_activity_name=match_result["activityName"],
        confidence=match_result["confidence"],
        decision_tier=match_result["queueTier"].upper(),
        match_method="AI_MATCH",
        logic_check_result=match_result["logicCheckStatus"].upper(),
        logic_check_message=match_result.get("logicCheckMessage"),
        retrieval_sources=match_result.get("retrievalSources", "both"),
        created_at=fr.created_at
    )
    db.add(am)
    await db.flush()

    # 5. Persist top candidate
    cand = MatchCandidate(
        activity_match_id=am.id,
        activity_id=match_result["activityId"] or "CIV-12-003",
        dense_rank=1,
        sparse_rank=1,
        rrf_score=0.033,
        rerank_score=match_result["confidence"],
        reasons=match_result["reasons"]
    )
    db.add(cand)

    await db.commit()
    return await _build_event_dto(fr, db)
