import pytest
from sqlalchemy import select
from backend.app.db.session import AsyncSessionLocal
from backend.app.domain.audit.chain import audit_chain_service
from backend.app.models.entities import AuditLog

@pytest.mark.asyncio
async def test_audit_chain_verification_and_tamper_detection():
    """
    Asserts server-side audit chain verifies valid when untampered,
    and accurately catches tamper when payload or hash is mutated.
    """
    async with AsyncSessionLocal() as session:
        # 1. Verify existing intact chain
        valid, broken_idx = await audit_chain_service.verify_chain(session, "proj-kpp")
        assert valid is True
        assert broken_idx is None

        # 2. Append a new verified entry
        new_entry = await audit_chain_service.append_log_entry(
            session=session,
            project_id="proj-kpp",
            actor="Meera Nair",
            action="Test Progress",
            activity_id="PIP-24-017",
            new_value="42%"
        )
        await session.commit()

        # 3. Verify intact again with new entry
        valid, broken_idx = await audit_chain_service.verify_chain(session, "proj-kpp")
        assert valid is True
        assert broken_idx is None

        # 4. Deliberately tamper with the entry
        try:
            tampered_entry = (await session.execute(
                select(AuditLog).where(AuditLog.id == new_entry.id)
            )).scalars().first()
            tampered_entry.payload_canonical_json = '{"tampered": true}'
            await session.commit()

            # 5. Verify that audit chain catches the break!
            valid_after_tamper, broken_after = await audit_chain_service.verify_chain(session, "proj-kpp")
            assert valid_after_tamper is False
            assert broken_after is not None
        finally:
            # Delete test entry so database remains in clean 1,280 seed state
            entry_to_del = (await session.execute(
                select(AuditLog).where(AuditLog.id == new_entry.id)
            )).scalars().first()
            if entry_to_del:
                await session.delete(entry_to_del)
                await session.commit()
