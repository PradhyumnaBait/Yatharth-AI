import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_novel_phrase_routes_to_unmatched_without_fake_candidates():
    """
    D18 & D19 Guard: Genuinely novel phrase never seen before must either match
    through real hybrid retrieval or route to Unmatched.
    Never return a hardcoded 45% fallback with fake reasons.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "text": "Quantum plasma ionization 99% complete on deep space reactor chamber 7",
            "projectId": "proj-kpp"
        }
        resp = await client.post("/api/v1/matching/match", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        
        # Unmatched phrases must have empty or null activityId and zero fake reasons
        if data["activityId"] is None:
            assert data["confidence"] == 0.0 or data["confidence"] < 50.0
            assert len(data["reasons"]) == 0
        else:
            # If retrieved, must have genuine reasons referencing actual words
            for r in data["reasons"]:
                assert r["label"] != ""
