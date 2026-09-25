import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_auth_login_success_and_failure():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Success
        resp = await client.post("/api/v1/auth/login", json={"employeeId": "EMP-4821", "pin": "123456"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["employeeId"] == "EMP-4821"
        assert data["name"] == "Rahul Patil"
        assert data["role"] == "SUPERVISOR"
        assert data["accessToken"] is not None

        # Failure on wrong PIN
        resp_err = await client.post("/api/v1/auth/login", json={"employeeId": "EMP-4821", "pin": "000000"})
        assert resp_err.status_code == 401
        assert "doesn't match" in resp_err.json()["detail"].lower()

@pytest.mark.asyncio
async def test_projects_and_schedule_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Get projects
        resp = await client.get("/api/v1/projects")
        assert resp.status_code == 200
        projs = resp.json()
        assert len(projs) >= 3
        kpp = next(p for p in projs if p["id"] == "proj-kpp")
        assert kpp["physicalProgress"] == 68.0
        assert kpp["plannedProgress"] == 74.0

        # Get activities
        act_resp = await client.get("/api/v1/projects/proj-kpp/activities")
        assert act_resp.status_code == 200
        acts = act_resp.json()
        assert len(acts) == 200

        # Verify key activity PIP-24-017
        pip17 = next(a for a in acts if a["id"] == "PIP-24-017")
        assert pip17["status"] == "In progress"
        assert pip17["physicalPercent"] in [38.0, 40.0]

@pytest.mark.asyncio
async def test_hero_event_e2091_approval_scenario():
    """
    SPEC §9.4 Scenario:
    Approve E-2091 (Spool 17 welding complete on Line 24-XX).
    Flips event to Verified, advances PIP-24-017 accumulator 38% -> 40%,
    and writes cryptographic audit entry.
    """
    # Reset PIP-24-017 to 38% for idempotent testing
    from backend.app.db.session import AsyncSessionLocal
    from backend.app.models.entities import Activity
    from sqlalchemy import select
    async with AsyncSessionLocal() as session:
        act = (await session.execute(select(Activity).where(Activity.id == "PIP-24-017"))).scalars().first()
        if act:
            act.physical_percent = 38.0
            await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Fetch E-2091
        resp = await client.get("/api/v1/events/E-2091")
        assert resp.status_code == 200
        event = resp.json()
        assert event["id"] == "E-2091"
        assert event["suggestedActivityId"] == "PIP-24-017"
        assert event["confidence"] == 94.0

        # 2. Approve E-2091
        appr_resp = await client.post("/api/v1/events/E-2091/approve", json={"activityId": "PIP-24-017"})
        assert appr_resp.status_code == 200
        appr_data = appr_resp.json()
        assert appr_data["event"]["status"] == "Verified"
        assert appr_data["updatedActivity"]["physicalPercent"] == 40.0

        # 3. Check Audit Trail verify
        audit_resp = await client.get("/api/v1/audit/verify?projectId=proj-kpp")
        assert audit_resp.status_code == 200
        assert audit_resp.json()["valid"] is True

@pytest.mark.asyncio
async def test_workbench_why_explanation_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/workbench/E-2091/why")
        assert resp.status_code == 200
        data = resp.json()
        assert data["eventId"] == "E-2091"
        assert "retrievalSources" in data
        assert len(data["factors"]) >= 3

@pytest.mark.asyncio
async def test_export_p6_csv_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/v1/export/p6-csv", json={"events": []})
        assert resp.status_code == 200
        assert "Activity ID,Activity Name" in resp.text
        assert "+2.0%" in resp.text
        assert "+4.0%" in resp.text
