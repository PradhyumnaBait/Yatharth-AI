from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.entities import Project
from backend.app.schemas.dtos import ProjectDTO, PhaseDTO, CrewTeamDTO

router = APIRouter(prefix="/projects", tags=["projects"])

# Canonical Phase distribution for Kandla-Panipat Pipeline
CANONICAL_PHASES = [
    PhaseDTO(id="phase-trenching", name="Trenching", weight=15, planned=100, dprReported=98, verified=96),
    PhaseDTO(id="phase-stringing", name="Stringing", weight=10, planned=100, dprReported=100, verified=100),
    PhaseDTO(id="phase-welding", name="Welding", weight=20, planned=95, dprReported=91, verified=85),
    PhaseDTO(id="phase-ndt", name="NDT", weight=10, planned=80, dprReported=76, verified=70),
    PhaseDTO(id="phase-coating", name="Coating", weight=10, planned=75, dprReported=72, verified=66),
    PhaseDTO(id="phase-lowering", name="Lowering", weight=12, planned=75, dprReported=70, verified=65),
    PhaseDTO(id="phase-backfill", name="Backfill", weight=8, planned=70, dprReported=62, verified=60),
    PhaseDTO(id="phase-hydrotest", name="Hydrotest", weight=10, planned=0, dprReported=0, verified=0),
    PhaseDTO(id="phase-restoration", name="Restoration", weight=5, planned=0, dprReported=0, verified=0),
]

CANONICAL_TEAMS = [
    CrewTeamDTO(id="team-1", name="Welding Crew B", foreman="Rahul Patil", contractor="L&T Construction", headcount=14, reportsToday=6, lastReportTime="08:42 AM", verifiedRate=94, phone="+91 98201 44102"),
    CrewTeamDTO(id="team-2", name="Civil & Trenching Crew", foreman="Dinesh Rathod", contractor="Punj Lloyd", headcount=22, reportsToday=4, lastReportTime="09:17 AM", verifiedRate=88, phone="+91 98201 55219"),
    CrewTeamDTO(id="team-3", name="Lowering & Backfill Team", foreman="Suresh Yadav", contractor="Kalpataru", headcount=18, reportsToday=2, lastReportTime="Yesterday", verifiedRate=91, phone="+91 98201 66328"),
    CrewTeamDTO(id="team-4", name="NDT Testing Crew", foreman="Anil Verma", contractor="TUV Rheinland", headcount=8, reportsToday=3, lastReportTime="08:15 AM", verifiedRate=96, phone="+91 98201 77437"),
]

@router.get("", response_model=List[ProjectDTO])
async def get_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project))
    projects = result.scalars().all()
    return [
        ProjectDTO(
            id=p.id,
            name=p.name,
            description=p.description,
            data_date=p.data_date,
            physical_progress=p.physical_progress,
            planned_progress=p.planned_progress,
            baseline_version=p.baseline_version,
            is_populated=p.is_populated,
            activeActivitiesCount=14 if p.is_populated else 0,
            totalActivitiesCount=200 if p.is_populated else 0
        )
        for p in projects
    ]

@router.get("/{project_id}", response_model=ProjectDTO)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Project).where(Project.id == project_id)
    p = (await db.execute(stmt)).scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectDTO(
        id=p.id,
        name=p.name,
        description=p.description,
        data_date=p.data_date,
        physical_progress=p.physical_progress,
        planned_progress=p.planned_progress,
        baseline_version=p.baseline_version,
        is_populated=p.is_populated,
        activeActivitiesCount=14 if p.is_populated else 0,
        totalActivitiesCount=200 if p.is_populated else 0
    )

@router.get("/{project_id}/phases", response_model=List[PhaseDTO])
async def get_project_phases(project_id: str):
    return CANONICAL_PHASES

@router.get("/{project_id}/teams", response_model=List[CrewTeamDTO])
async def get_project_teams(project_id: str):
    return CANONICAL_TEAMS
