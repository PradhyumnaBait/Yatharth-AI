from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.entities import User, AccessRequest
from backend.app.schemas.dtos import (
    LoginRequest, UserProfileDTO, AccessRequestCreate, ResetPinRequest
)
from backend.app.domain.auth.security import (
    verify_pin, hash_pin, create_access_token
)
from backend.app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=UserProfileDTO)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    # 1. Fetch user by employee ID
    stmt = select(User).where(User.employee_id == req.employeeId)
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"No account found for {req.employeeId}. Check the ID or request access."
        )

    # 2. Check server-side lockout (3 attempts -> 30s lockout)
    now = datetime.now(timezone.utc)
    if user.locked_until and user.locked_until > now:
        remaining_secs = int((user.locked_until - now).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account locked. Try again in {remaining_secs} seconds."
        )

    # 3. Verify PIN
    if not verify_pin(req.pin, user.pin_hash):
        user.failed_attempts += 1
        if user.failed_attempts >= settings.LOGIN_MAX_FAILED_ATTEMPTS:
            user.locked_until = now + timedelta(seconds=settings.LOGIN_LOCKOUT_SECONDS)
            user.failed_attempts = 0
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Incorrect PIN. 3 failed attempts. Account locked for {settings.LOGIN_LOCKOUT_SECONDS} seconds."
            )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="PIN doesn't match this employee ID."
        )

    # Reset failed attempts on success
    user.failed_attempts = 0
    user.locked_until = None
    await db.commit()

    # Generate token
    token = create_access_token({"sub": user.id, "employee_id": user.employee_id, "role": user.role})

    return UserProfileDTO(
        id=user.id,
        employee_id=user.employee_id,
        name=user.name,
        role=user.role,
        phone=user.phone,
        avatar_url=user.avatar_url,
        accessToken=token
    )

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}

@router.post("/request-access")
async def request_access(req: AccessRequestCreate, db: AsyncSession = Depends(get_db)):
    # Generate REQ reference code
    req_code = f"REQ-{datetime.now().strftime('%M%S')}"
    req_record = AccessRequest(
        request_code=req_code,
        name=req.name,
        contact=req.contact,
        organization=req.organization,
        project_id=req.projectId,
        role=req.role,
        status="PENDING"
    )
    db.add(req_record)
    await db.commit()
    return {"requestId": req_code}

@router.post("/reset-pin")
async def reset_pin(req: ResetPinRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.employee_id == req.employeeId)
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    user.pin_hash = hash_pin(req.newPin)
    user.failed_attempts = 0
    user.locked_until = None
    await db.commit()
    return {"success": True}
