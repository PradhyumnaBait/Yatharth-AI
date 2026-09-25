from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.entities import Activity, Schedule, ActivityRelationship
from backend.app.schemas.dtos import ActivityDTO, RelationshipDTO, UpdateProgressRequest
from backend.app.domain.audit.chain import audit_chain_service

router = APIRouter(tags=["schedules"])

async def _build_activity_dto(act: Activity, db: AsyncSession) -> ActivityDTO:
    # Fetch relationships
    pred_stmt = select(ActivityRelationship).where(ActivityRelationship.successor_id == act.id)
    succ_stmt = select(ActivityRelationship).where(ActivityRelationship.predecessor_id == act.id)
    
    preds = (await db.execute(pred_stmt)).scalars().all()
    succs = (await db.execute(succ_stmt)).scalars().all()

    return ActivityDTO(
        id=act.id,
        name=act.name,
        phase_id=act.phase_id,
        phase_name=act.phase_name,
        status=act.status,
        physical_percent=act.physical_percent,
        planned_start=act.planned_start,
        planned_finish=act.planned_finish,
        actual_start=act.actual_start,
        actual_finish=act.actual_finish,
        quantity_total=act.quantity_total,
        quantity_completed=act.quantity_completed,
        unit=act.unit,
        is_critical=act.is_critical,
        is_out_of_sequence=act.is_out_of_sequence,
        predecessors=[RelationshipDTO(id=p.predecessor_id, type=p.type, lag=p.lag) for p in preds],
        successors=[RelationshipDTO(id=s.successor_id, type=s.type, lag=s.lag) for s in succs]
    )

@router.get("/projects/{project_id}/activities", response_model=List[ActivityDTO])
async def get_project_activities(
    project_id: str,
    phaseId: Optional[str] = Query(None),
    isCritical: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    sched_stmt = select(Schedule).where(Schedule.project_id == project_id, Schedule.is_current == True)
    schedule = (await db.execute(sched_stmt)).scalars().first()
    if not schedule:
        return []

    stmt = select(Activity).where(Activity.schedule_id == schedule.id)
    if phaseId:
        stmt = stmt.where(Activity.phase_id == phaseId)
    if isCritical is not None:
        stmt = stmt.where(Activity.is_critical == isCritical)

    result = await db.execute(stmt)
    activities = result.scalars().all()

    return [await _build_activity_dto(a, db) for a in activities]

@router.get("/activities/{activity_id}", response_model=ActivityDTO)
async def get_activity(activity_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Activity).where(Activity.id == activity_id)
    act = (await db.execute(stmt)).scalars().first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    return await _build_activity_dto(act, db)

@router.patch("/activities/{activity_id}/progress", response_model=ActivityDTO)
async def update_activity_progress(
    activity_id: str,
    req: UpdateProgressRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Activity).where(Activity.id == activity_id)
    act = (await db.execute(stmt)).scalars().first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")

    old_pct = act.physical_percent
    act.physical_percent = req.physicalPercent
    if req.physicalPercent >= 100.0:
        act.status = "Complete"
    elif req.physicalPercent > 0.0:
        act.status = "In progress"

    # Transactional audit log write
    sched = (await db.execute(select(Schedule).where(Schedule.id == act.schedule_id))).scalars().first()
    project_id = sched.project_id if sched else "proj-kpp"
    
    await audit_chain_service.append_log_entry(
        session=db,
        project_id=project_id,
        actor="Meera Nair",
        action="Manual Progress Adjustment",
        activity_id=act.external_task_id,
        new_value=f"{req.physicalPercent}%",
        source_event_id=req.reason
    )

    await db.commit()
    await db.refresh(act)
    return await _build_activity_dto(act, db)
