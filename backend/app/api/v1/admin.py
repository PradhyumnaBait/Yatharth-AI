from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.entities import User, AccessRequest, DictionaryTerm
from backend.app.schemas.dtos import UserProfileDTO

router = APIRouter(prefix="/admin", tags=["admin"])

class RejectAccessRequest(BaseModel):
    reason: str

class UpdateDictionaryTermRequest(BaseModel):
    isActive: Optional[bool] = None
    canonical: Optional[str] = None
    confidence: Optional[float] = None

@router.get("/users", response_model=List[UserProfileDTO])
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [
        UserProfileDTO(
            id=u.id,
            employee_id=u.employee_id,
            name=u.name,
            role=u.role,
            phone=u.phone,
            avatar_url=u.avatar_url
        )
        for u in users
    ]

@router.get("/access-requests")
async def get_access_requests(db: AsyncSession = Depends(get_db)):
    stmt = select(AccessRequest).where(AccessRequest.status == "PENDING")
    requests = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": r.id,
            "requestCode": r.request_code,
            "name": r.name,
            "contact": r.contact,
            "organization": r.organization,
            "project": r.project_name or "Kandla–Panipat Pipeline — Package 3",
            "role": r.role,
            "status": r.status,
            "time": r.created_at.strftime("%I:%M %p")
        }
        for r in requests
    ]

@router.post("/access-requests/{req_id}/approve")
async def approve_access_request(req_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(AccessRequest).where((AccessRequest.id == req_id) | (AccessRequest.request_code == req_id))
    ar = (await db.execute(stmt)).scalars().first()
    if not ar:
        raise HTTPException(status_code=404, detail="Access request not found")
    ar.status = "APPROVED"
    await db.commit()
    return {"message": "Access request approved"}

@router.post("/access-requests/{req_id}/reject")
async def reject_access_request(req_id: str, req: RejectAccessRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(AccessRequest).where((AccessRequest.id == req_id) | (AccessRequest.request_code == req_id))
    ar = (await db.execute(stmt)).scalars().first()
    if not ar:
        raise HTTPException(status_code=404, detail="Access request not found")
    ar.status = "REJECTED"
    await db.commit()
    return {"message": "Access request rejected"}

@router.get("/dictionary")
async def get_dictionary_terms(
    projectId: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns dictionary terms with source and confidence per Section 16 & D20.
    """
    stmt = select(DictionaryTerm)
    if projectId:
        stmt = stmt.where((DictionaryTerm.project_id == projectId) | (DictionaryTerm.project_id == None))
    
    terms = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": t.id,
            "term": t.term,
            "canonical": t.canonical,
            "category": t.category,
            "source": t.source,
            "confidence": t.confidence,
            "isActive": t.is_active,
            "projectId": t.project_id
        }
        for t in terms
    ]

@router.patch("/dictionary/{term_id}")
async def update_dictionary_term(
    term_id: str,
    req: UpdateDictionaryTermRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(DictionaryTerm).where(DictionaryTerm.id == term_id)
    term = (await db.execute(stmt)).scalars().first()
    if not term:
        raise HTTPException(status_code=404, detail="Dictionary term not found")

    if req.isActive is not None:
        term.is_active = req.isActive
    if req.canonical is not None:
        term.canonical = req.canonical
    if req.confidence is not None:
        term.confidence = req.confidence

    await db.commit()
    await db.refresh(term)
    return {
        "id": term.id,
        "term": term.term,
        "canonical": term.canonical,
        "source": term.source,
        "confidence": term.confidence,
        "isActive": term.is_active
    }
