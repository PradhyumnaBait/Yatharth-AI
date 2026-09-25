import pytest
from backend.app.db.session import AsyncSessionLocal
from backend.app.domain.logic.schedule_logic import schedule_logic_engine

@pytest.mark.asyncio
async def test_schedule_logic_out_of_sequence_warning():
    """PIP-24-018 has predecessor PIP-24-017 which is 38%. Must return WARNING out of sequence."""
    async with AsyncSessionLocal() as session:
        res = await schedule_logic_engine.evaluate_match(
            session=session,
            activity_id="PIP-24-018"
        )
        assert res.status == "WARNING"
        assert "not complete" in res.message.lower()

@pytest.mark.asyncio
async def test_schedule_logic_already_complete_warning():
    """PIP-24-010 is 100% complete. Must return WARNING."""
    async with AsyncSessionLocal() as session:
        res = await schedule_logic_engine.evaluate_match(
            session=session,
            activity_id="PIP-24-010"
        )
        assert res.status == "WARNING"
        assert "already" in res.message.lower()

@pytest.mark.asyncio
async def test_schedule_logic_duplicate_accumulator_unit_warning():
    """PIP-24-017 has Spool 1..16 completed. Reporting Spool 16 must return duplicate warning."""
    async with AsyncSessionLocal() as session:
        res = await schedule_logic_engine.evaluate_match(
            session=session,
            activity_id="PIP-24-017",
            reported_unit="Spool 16"
        )
        assert res.status == "WARNING"
        assert "duplicate" in res.message.lower()

@pytest.mark.asyncio
async def test_schedule_logic_valid_spool_17_passes():
    """PIP-24-017 reporting Spool 17 (not yet completed) with completed predecessor must PASS."""
    async with AsyncSessionLocal() as session:
        res = await schedule_logic_engine.evaluate_match(
            session=session,
            activity_id="PIP-24-017",
            reported_unit="Spool 17"
        )
        assert res.status == "PASSED"
