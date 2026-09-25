from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.entities import Notification
from backend.app.schemas.dtos import NotificationDTO

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationDTO])
async def get_notifications(db: AsyncSession = Depends(get_db)):
    stmt = select(Notification).order_by(Notification.created_at.desc())
    notes = (await db.execute(stmt)).scalars().all()
    return [
        NotificationDTO(
            id=n.id,
            title=n.title,
            time=n.time,
            unread=n.unread,
            target_route=n.target_route
        )
        for n in notes
    ]

@router.post("/mark-read")
async def mark_all_read(db: AsyncSession = Depends(get_db)):
    await db.execute(update(Notification).values(unread=False))
    await db.commit()
    return {"message": "All notifications marked as read"}
