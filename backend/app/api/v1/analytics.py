from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.entities import DelayCause, ProjectMemoryInsight
from backend.app.schemas.dtos import (
    SCurveResponse, DelayCauseDTO, MemoryInsightDTO
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/{project_id}/s-curve", response_model=SCurveResponse)
async def get_s_curve(project_id: str):
    dates = [
        "01 Aug", "08 Aug", "15 Aug", "22 Aug", "29 Aug",
        "05 Sep", "12 Sep", "20 Sep", "27 Sep", "05 Oct", "15 Oct"
    ]
    planned = [5.0, 14.0, 26.0, 40.0, 52.0, 62.0, 69.0, 74.0, 82.0, 92.0, 100.0]
    actual = [4.5, 12.0, 24.0, 36.0, 48.0, 56.0, 63.0, 68.0, None, None, None]
    return SCurveResponse(dates=dates, planned=planned, actual=actual)

@router.get("/{project_id}/delays", response_model=List[DelayCauseDTO])
async def get_delay_causes(project_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(DelayCause).where(DelayCause.project_id == project_id)
    delays = (await db.execute(stmt)).scalars().all()
    return [
        DelayCauseDTO(
            id=d.id,
            category=d.category,
            events_count=d.events_count,
            days_lost=d.days_lost,
            is_critical_path=d.is_critical_path,
            critical_activity_id=d.critical_activity_id,
            critical_activity_name=d.critical_activity_name
        )
        for d in delays
    ]

@router.get("/memory", response_model=List[MemoryInsightDTO])
async def get_project_memory(db: AsyncSession = Depends(get_db)):
    stmt = select(ProjectMemoryInsight)
    insights = (await db.execute(stmt)).scalars().all()
    return [
        MemoryInsightDTO(
            id=i.id,
            title=i.title,
            insight=i.insight,
            recommendation=i.recommendation,
            benchmark_project=i.benchmark_project,
            sample_size=i.sample_size,
            season=i.season,
            variance_percent=i.variance_percent,
            activities=i.activities or []
        )
        for i in insights
    ]
