import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from backend.app.main import app
from backend.app.db.session import AsyncSessionLocal
from backend.app.models.entities import Activity, DictionaryTerm
from backend.app.domain.dictionary.active_learning import process_active_learning_feedback
from backend.app.domain.matching.retrieval import hybrid_retrieval_engine

@pytest.mark.asyncio
async def test_d21_contextual_embedding_text_structure():
    """
    D21 Requirement: embedding_context_text must be rich string:
    'Project: ... > WBS: ... > Discipline: ... > Activity: ... (external_task_id)'
    Never bare activity name alone.
    """
    async with AsyncSessionLocal() as session:
        stmt = select(Activity).where(Activity.external_task_id == "PIP-24-017")
        act = (await session.execute(stmt)).scalars().first()
        assert act is not None
        assert act.embedding_context_text is not None
        ctx = act.embedding_context_text
        assert "Project:" in ctx
        assert "WBS:" in ctx
        assert "Discipline: Welding" in ctx
        assert "Activity: Weld Piping System 24-XX" in ctx
        assert "(PIP-24-017)" in ctx
        assert ctx != act.name

@pytest.mark.asyncio
async def test_d19_exact_code_retrieved_via_sparse_leg():
    """
    D19 Requirement: An exact external_task_id mentioned in terse phrasing
    must be retrieved via the sparse leg of hybrid retrieval.
    """
    async with AsyncSessionLocal() as session:
        candidates = await hybrid_retrieval_engine.retrieve_candidates(
            session=session,
            schedule_id="sched-kpp-v3",
            query="PIP-24-017 100% complete",
            top_k=5
        )
        assert len(candidates) > 0
        top_cand = candidates[0]
        assert top_cand["id"] == "PIP-24-017"
        assert top_cand["sparse_rank"] is not None

@pytest.mark.asyncio
async def test_d20_active_learning_corroboration_gating():
    """
    D20 Requirement: A single Choose-Another correction leaves term inactive;
    a second corroboration by a different planner activates it.
    """
    import uuid
    unique_phrase = f"slang_{uuid.uuid4().hex[:6]}"
    async with AsyncSessionLocal() as session:
        # 1. First planner correction
        term1 = await process_active_learning_feedback(
            session=session,
            match_id=f"test-match-{uuid.uuid4().hex[:6]}",
            actor_id="planner-user-1",
            raw_text=f"{unique_phrase} fabrication done",
            chosen_activity_id="PIP-24-017",
            chosen_activity_name="Weld Piping System 24-XX",
            project_id="proj-kpp"
        )
        assert term1 is not None
        # First correction must NOT activate term yet (threshold = 2)
        assert term1.is_active is False

        # 2. Second planner correction by DIFFERENT actor
        term2 = await process_active_learning_feedback(
            session=session,
            match_id=f"test-match-{uuid.uuid4().hex[:6]}",
            actor_id="planner-user-2",
            raw_text=f"{unique_phrase} fabrication ready",
            chosen_activity_id="PIP-24-017",
            chosen_activity_name="Weld Piping System 24-XX",
            project_id="proj-kpp"
        )
        assert term2 is not None
        # Second independent corroboration must activate term!
        assert term2.is_active is True
        assert term2.confidence == 0.95

@pytest.mark.asyncio
async def test_d22_demo_mode_header_present():
    """
    D22 Requirement: While DEMO_MODE=true, every API response carries
    the X-SchedBridge-Mode: demo header.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.headers.get("X-SchedBridge-Mode") == "demo"
        assert "X-Request-Id" in resp.headers
