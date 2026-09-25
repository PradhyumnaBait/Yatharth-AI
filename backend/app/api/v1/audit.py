from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.entities import AuditLog
from backend.app.schemas.dtos import AuditEntryDTO, VerifyAuditResponse
from backend.app.domain.audit.chain import audit_chain_service

router = APIRouter(prefix="/audit", tags=["audit"])

class AppendEntryRequest(BaseModel):
    projectId: Optional[str] = "proj-kpp"
    actor: str
    action: str
    activityId: str
    newValue: str
    sourceEventId: Optional[str] = None

@router.get("/verify", response_model=VerifyAuditResponse)
async def verify_audit_chain(
    projectId: Optional[str] = Query("proj-kpp"),
    db: AsyncSession = Depends(get_db)
):
    valid, broken_idx = await audit_chain_service.verify_chain(db, projectId)
    return VerifyAuditResponse(valid=valid, brokenAtIndex=broken_idx)

@router.get("/{project_id}", response_model=List[AuditEntryDTO])
async def get_audit_trail(
    project_id: str,
    limit: int = Query(100),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(AuditLog)
        .where(AuditLog.project_id == project_id)
        .order_by(AuditLog.sequence_no.desc())
        .limit(limit)
    )
    logs = (await db.execute(stmt)).scalars().all()
    return [
        AuditEntryDTO(
            sequence_no=l.sequence_no,
            timestamp=l.timestamp.strftime("%d %b %Y, %I:%M %p"),
            actor=l.actor,
            action=l.action,
            activity_id=l.activity_id,
            new_value=l.new_value,
            source_event_id=l.source_event_id,
            entry_hash=l.entry_hash,
            prev_hash=l.prev_hash
        )
        for l in logs
    ]

@router.post("/entries", response_model=AuditEntryDTO)
async def append_audit_entry(
    req: AppendEntryRequest,
    db: AsyncSession = Depends(get_db)
):
    log = await audit_chain_service.append_log_entry(
        session=db,
        project_id=req.projectId or "proj-kpp",
        actor=req.actor,
        action=req.action,
        activity_id=req.activityId,
        new_value=req.newValue,
        source_event_id=req.sourceEventId
    )
    await db.commit()
    return AuditEntryDTO(
        sequence_no=log.sequence_no,
        timestamp=log.timestamp.strftime("%d %b %Y, %I:%M %p"),
        actor=log.actor,
        action=log.action,
        activity_id=log.activity_id,
        new_value=log.new_value,
        source_event_id=log.source_event_id,
        entry_hash=log.entry_hash,
        prev_hash=log.prev_hash
    )
