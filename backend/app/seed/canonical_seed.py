import asyncio
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy import select, delete
from backend.app.db.session import AsyncSessionLocal, engine, Base
from backend.app.models.entities import (
    User, Project, ProjectMember, Schedule, WBSNode, Activity, ActivityRelationship,
    ActivityProgressUnit, FieldReport, ExtractedEvent, ActivityMatch, MatchCandidate,
    ProgressEvent, ReviewAction, AuditLog, DictionaryTerm, MatchingConfig,
    DelayCause, ProjectMemoryInsight, Notification, AccessRequest
)
from backend.app.domain.auth.security import hash_pin, sha256_hash

def get_now() -> datetime:
    # 20 Sep 2026 09:24 IST / 03:54 UTC
    return datetime(2026, 9, 20, 3, 54, 0, tzinfo=timezone.utc)

async def seed_canonical_data():
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        existing_users = await session.execute(select(User))
        if existing_users.scalars().first():
            print("Database already contains data. Skipping or re-seeding...")
            return

        print("Seeding canonical data per SPEC §9 and Backend Plan v2...")

        # 1. Projects
        kpp = Project(
            id="proj-kpp",
            code="KPP-PKG3",
            name="Kandla–Panipat Pipeline — Package 3",
            description="10 km execution package · KP 178.0–188.0 · 24-inch crude pipeline",
            data_date="20 Sep 2026",
            physical_progress=68.0,
            planned_progress=74.0,
            baseline_version="v3",
            is_populated=True,
            created_at=get_now()
        )
        dgs = Project(
            id="proj-dgs",
            code="DGS-UPG",
            name="Duliajan Gathering Station Upgrade",
            description="Upstream oil & gas gathering station facility modernization",
            data_date="19 Sep 2026",
            physical_progress=41.0,
            planned_progress=45.0,
            baseline_version="v1",
            is_populated=False,
            created_at=get_now()
        )
        ntf = Project(
            id="proj-ntf",
            code="NTF-EXP",
            name="Numaligarh Tank Farm Expansion",
            description="Expansion of crude oil storage tanks and containment systems",
            data_date="18 Sep 2026",
            physical_progress=23.0,
            planned_progress=30.0,
            baseline_version="v2",
            is_populated=False,
            created_at=get_now()
        )
        session.add_all([kpp, dgs, ntf])
        await session.flush()

        # 2. Users (SPEC §9: 4 Roles with PIN 123456)
        hashed_pin = hash_pin("123456")
        users = [
            User(
                id="user-supervisor",
                employee_id="EMP-4821",
                name="Rahul Patil",
                role="SUPERVISOR",
                phone="+91 98201 44102",
                avatar_url="/images/avatar-rahul.jpg",
                pin_hash=hashed_pin,
                failed_attempts=0,
                created_at=get_now()
            ),
            User(
                id="user-planner",
                employee_id="EMP-1042",
                name="Meera Nair",
                role="PLANNER",
                phone="+91 98201 23456",
                avatar_url="/images/avatar-meera.jpg",
                pin_hash=hashed_pin,
                failed_attempts=0,
                created_at=get_now()
            ),
            User(
                id="user-pm",
                employee_id="EMP-0819",
                name="Sanjay Gupta",
                role="PM",
                phone="+91 98201 98765",
                avatar_url="/images/avatar-sanjay.jpg",
                pin_hash=hashed_pin,
                failed_attempts=0,
                created_at=get_now()
            ),
            User(
                id="user-admin",
                employee_id="EMP-9001",
                name="Priya Sharma",
                role="ADMIN",
                phone="+91 98201 11223",
                avatar_url="/images/avatar-priya.jpg",
                pin_hash=hashed_pin,
                failed_attempts=0,
                created_at=get_now()
            ),
        ]
        session.add_all(users)
        await session.flush()

        # Memberships
        for u in users:
            session.add(ProjectMember(
                project_id="proj-kpp",
                user_id=u.id,
                role=u.role
            ))

        # 3. Schedule & WBS for KPP
        schedule = Schedule(
            id="sched-kpp-v3",
            project_id="proj-kpp",
            version="v3",
            is_baseline=False,
            data_date="20 Sep 2026",
            is_current=True,
            created_at=get_now()
        )
        session.add(schedule)
        await session.flush()

        wbs_root = WBSNode(
            id="wbs-root",
            schedule_id=schedule.id,
            code="KPP",
            name="Kandla–Panipat Pipeline",
            parent_id=None,
            path="Kandla–Panipat Pipeline"
        )
        session.add(wbs_root)
        await session.flush()

        # Phases as WBS children
        phase_defs = [
            ("phase-trenching", "Trenching", "Civil", 15),
            ("phase-stringing", "Stringing", "Piping", 10),
            ("phase-welding", "Welding", "Welding", 20),
            ("phase-ndt", "NDT", "Testing", 10),
            ("phase-coating", "Coating", "Coating", 10),
            ("phase-lowering", "Lowering", "Mechanical", 12),
            ("phase-backfill", "Backfill", "Civil", 8),
            ("phase-hydrotest", "Hydrotest", "Testing", 10),
            ("phase-restoration", "Restoration", "Civil", 5),
        ]

        wbs_nodes = {}
        for pid, pname, discipline, weight in phase_defs:
            node = WBSNode(
                id=f"wbs-{pid}",
                schedule_id=schedule.id,
                code=pname[:4].upper(),
                name=pname,
                parent_id=wbs_root.id,
                path=f"Kandla–Panipat Pipeline > {pname}"
            )
            session.add(node)
            wbs_nodes[pid] = node
        await session.flush()

        # 4. Canonical Activities (SPEC §9.3)
        # Helper to generate D21 contextual string
        def make_context_text(p_name: str, wbs_path: str, disc: str, act_name: str, task_id: str) -> str:
            return f"Project: {p_name} > WBS: {wbs_path} > Discipline: {disc} > Activity: {act_name} ({task_id})"

        # Helper to generate D19 sparse tokens
        def make_search_tsv(task_id: str, act_name: str, disc: str, extra: str = "") -> str:
            return f"{task_id} {act_name} {disc} {extra}".lower()

        key_activities_data = [
            {
                "id": "CIV-12-003",
                "name": "Excavate Trench KP 180.0–185.0",
                "phase_id": "phase-trenching",
                "phase_name": "Trenching",
                "discipline": "Civil",
                "status": "In progress",
                "physical_percent": 92.0,
                "planned_start": "2026-08-10",
                "planned_finish": "2026-09-24",
                "actual_start": "2026-08-12",
                "quantity_total": 5000.0,
                "quantity_completed": 4600.0,
                "unit": "m",
                "is_critical": False,
                "is_out_of_sequence": False
            },
            {
                "id": "PIP-24-010",
                "name": "String Pipe Line 24-XX",
                "phase_id": "phase-stringing",
                "phase_name": "Stringing",
                "discipline": "Piping",
                "status": "Complete",
                "physical_percent": 100.0,
                "planned_start": "2026-08-20",
                "planned_finish": "2026-09-05",
                "actual_start": "2026-08-20",
                "actual_finish": "2026-09-04",
                "quantity_total": 42.0,
                "quantity_completed": 42.0,
                "unit": "spools",
                "is_critical": False,
                "is_out_of_sequence": False
            },
            {
                "id": "PIP-24-016",
                "name": "Install Pipe Line 24-XX",
                "phase_id": "phase-stringing",
                "phase_name": "Stringing",
                "discipline": "Piping",
                "status": "Complete",
                "physical_percent": 100.0,
                "planned_start": "2026-09-01",
                "planned_finish": "2026-09-12",
                "actual_start": "2026-09-01",
                "actual_finish": "2026-09-12",
                "quantity_total": 42.0,
                "quantity_completed": 42.0,
                "unit": "spools",
                "is_critical": True,
                "is_out_of_sequence": False
            },
            {
                "id": "PIP-24-017",
                "name": "Weld Piping System 24-XX",
                "phase_id": "phase-welding",
                "phase_name": "Welding",
                "discipline": "Welding",
                "status": "In progress",
                "physical_percent": 38.0,
                "planned_start": "2026-09-08",
                "planned_finish": "2026-09-28",
                "actual_start": "2026-09-08",
                "quantity_total": 42.0,
                "quantity_completed": 16.0,
                "unit": "spools",
                "is_critical": True,
                "is_out_of_sequence": False
            },
            {
                "id": "PIP-24-018",
                "name": "NDT & Coating Line 24-XX",
                "phase_id": "phase-ndt",
                "phase_name": "NDT",
                "discipline": "Testing",
                "status": "Not started",
                "physical_percent": 0.0,
                "planned_start": "2026-09-22",
                "planned_finish": "2026-10-05",
                "quantity_total": 42.0,
                "quantity_completed": 0.0,
                "unit": "spools",
                "is_critical": True,
                "is_out_of_sequence": False
            },
            {
                "id": "PIP-24-021",
                "name": "Lower Pipe KP 181.0–183.0",
                "phase_id": "phase-lowering",
                "phase_name": "Lowering",
                "discipline": "Mechanical",
                "status": "In progress",
                "physical_percent": 60.0,
                "planned_start": "2026-09-14",
                "planned_finish": "2026-09-26",
                "actual_start": "2026-09-14",
                "quantity_total": 2000.0,
                "quantity_completed": 1200.0,
                "unit": "m",
                "is_critical": False,
                "is_out_of_sequence": False
            },
            {
                "id": "CIV-12-007",
                "name": "Backfill KP 178.0–181.0",
                "phase_id": "phase-backfill",
                "phase_name": "Backfill",
                "discipline": "Civil",
                "status": "In progress",
                "physical_percent": 60.0,
                "planned_start": "2026-09-15",
                "planned_finish": "2026-09-27",
                "actual_start": "2026-09-15",
                "quantity_total": 3000.0,
                "quantity_completed": 1800.0,
                "unit": "m",
                "is_critical": False,
                "is_out_of_sequence": False
            },
            {
                "id": "PIP-24-024",
                "name": "Hydrotest Line 24-XX",
                "phase_id": "phase-hydrotest",
                "phase_name": "Hydrotest",
                "discipline": "Testing",
                "status": "Not started",
                "physical_percent": 0.0,
                "planned_start": "2026-10-06",
                "planned_finish": "2026-10-15",
                "quantity_total": 10000.0,
                "quantity_completed": 0.0,
                "unit": "m",
                "is_critical": True,
                "is_out_of_sequence": False
            },
            {
                "id": "PIP-30-005",
                "name": "Weld Joint M-01-J1 (24″ manifold)",
                "phase_id": "phase-welding",
                "phase_name": "Welding",
                "discipline": "Welding",
                "status": "In progress",
                "physical_percent": 0.0,
                "planned_start": "2026-09-18",
                "planned_finish": "2026-09-25",
                "quantity_total": 1.0,
                "quantity_completed": 0.0,
                "unit": "joint",
                "is_critical": False,
                "is_out_of_sequence": False
            },
            {
                "id": "PIP-30-006",
                "name": "Weld Joint M-01-J2 (24″ manifold)",
                "phase_id": "phase-welding",
                "phase_name": "Welding",
                "discipline": "Welding",
                "status": "In progress",
                "physical_percent": 0.0,
                "planned_start": "2026-09-18",
                "planned_finish": "2026-09-25",
                "quantity_total": 1.0,
                "quantity_completed": 0.0,
                "unit": "joint",
                "is_critical": False,
                "is_out_of_sequence": False
            },
            {
                "id": "PIP-30-007",
                "name": "Weld Joint M-01-J3 (24″ manifold)",
                "phase_id": "phase-welding",
                "phase_name": "Welding",
                "discipline": "Welding",
                "status": "In progress",
                "physical_percent": 0.0,
                "planned_start": "2026-09-18",
                "planned_finish": "2026-09-25",
                "quantity_total": 1.0,
                "quantity_completed": 0.0,
                "unit": "joint",
                "is_critical": False,
                "is_out_of_sequence": False
            },
            {
                "id": "CIV-15-001",
                "name": "Pig Launcher Excavation",
                "phase_id": "phase-trenching",
                "phase_name": "Trenching",
                "discipline": "Civil",
                "status": "Complete",
                "physical_percent": 100.0,
                "planned_start": "2026-08-01",
                "planned_finish": "2026-08-15",
                "actual_start": "2026-08-01",
                "actual_finish": "2026-08-14",
                "quantity_total": 1200.0,
                "quantity_completed": 1200.0,
                "unit": "m3",
                "is_critical": False,
                "is_out_of_sequence": False
            }
        ]

        # Generate total 200 activities matching SPEC §9 distribution
        # 14 in progress, ~110 complete, ~76 not started
        created_activities = {}
        for act in key_activities_data:
            wbs_p = wbs_nodes[act["phase_id"]].path
            ctx_text = make_context_text("Kandla–Panipat Pipeline — Package 3", wbs_p, act["discipline"], act["name"], act["id"])
            tsv_text = make_search_tsv(act["id"], act["name"], act["discipline"], "spool welding pipe trench")
            
            db_act = Activity(
                id=act["id"],
                schedule_id=schedule.id,
                external_task_id=act["id"],
                name=act["name"],
                phase_id=act["phase_id"],
                phase_name=act["phase_name"],
                status=act["status"],
                physical_percent=act["physical_percent"],
                planned_start=act.get("planned_start"),
                planned_finish=act.get("planned_finish"),
                actual_start=act.get("actual_start"),
                actual_finish=act.get("actual_finish"),
                quantity_total=act.get("quantity_total"),
                quantity_completed=act.get("quantity_completed"),
                unit=act.get("unit"),
                is_critical=act["is_critical"],
                is_out_of_sequence=act["is_out_of_sequence"],
                embedding_context_text=ctx_text,
                search_tsv=tsv_text,
                created_at=get_now()
            )
            session.add(db_act)
            created_activities[act["id"]] = db_act

        # Generate additional activities up to 200
        phase_list = list(phase_defs)
        in_progress_count = sum(1 for a in key_activities_data if a["status"] == "In progress")
        target_in_progress = 14
        
        for i in range(len(key_activities_data) + 1, 201):
            phase_idx = (i * 7) % len(phase_list)
            p_id, p_name, p_disc, _ = phase_list[phase_idx]
            
            task_code = f"{p_disc[:3].upper()}-{20 + (i % 30):02d}-{i:03d}"
            act_name = f"{p_name} Section {i % 25 + 1} KM {178 + (i % 10)}.{i % 10}"
            
            if in_progress_count < target_in_progress and i % 10 == 0:
                st = "In progress"
                pct = float((i * 13) % 80 + 10)
                in_progress_count += 1
            elif i % 2 == 0:
                st = "Complete"
                pct = 100.0
            else:
                st = "Not started"
                pct = 0.0
                
            wbs_p = wbs_nodes[p_id].path
            ctx = make_context_text("Kandla–Panipat Pipeline — Package 3", wbs_p, p_disc, act_name, task_code)
            tsv = make_search_tsv(task_code, act_name, p_disc)

            db_act = Activity(
                id=task_code,
                schedule_id=schedule.id,
                external_task_id=task_code,
                name=act_name,
                phase_id=p_id,
                phase_name=p_name,
                status=st,
                physical_percent=pct,
                planned_start="2026-08-15",
                planned_finish="2026-10-15",
                actual_start="2026-08-15" if st != "Not started" else None,
                actual_finish="2026-09-10" if st == "Complete" else None,
                quantity_total=100.0,
                quantity_completed=100.0 if st == "Complete" else (pct if st == "In progress" else 0.0),
                unit="units",
                is_critical=(i % 7 == 0),
                is_out_of_sequence=False,
                embedding_context_text=ctx,
                search_tsv=tsv,
                created_at=get_now()
            )
            session.add(db_act)
            created_activities[task_code] = db_act

        await session.flush()

        # Dependencies for key chain: PIP-24-016 -> PIP-24-017 -> PIP-24-018 -> PIP-24-024
        relationships = [
            ActivityRelationship(predecessor_id="CIV-12-003", successor_id="PIP-24-010", type="FS", lag=0),
            ActivityRelationship(predecessor_id="PIP-24-010", successor_id="PIP-24-016", type="FS", lag=0),
            ActivityRelationship(predecessor_id="PIP-24-016", successor_id="PIP-24-017", type="FS", lag=0),
            ActivityRelationship(predecessor_id="PIP-24-017", successor_id="PIP-24-018", type="FS", lag=0),
            ActivityRelationship(predecessor_id="PIP-24-018", successor_id="PIP-24-024", type="FS", lag=0),
        ]
        session.add_all(relationships)

        # Progress units for PIP-24-017 (Spools 1 to 16 completed)
        for s_num in range(1, 17):
            session.add(ActivityProgressUnit(
                activity_id="PIP-24-017",
                unit_label=f"Spool {s_num}",
                status="COMPLETED",
                completed_at=get_now() - timedelta(days=(17 - s_num))
            ))

        # 5. Matching Configuration
        session.add(MatchingConfig(
            project_id="proj-kpp",
            auto_accept_threshold=95.0,
            unmatched_threshold=50.0,
            min_corroborations=2,
            rrf_k=60
        ))

        # 6. Dictionary (Tier 1 & Tier 2)
        dict_terms = [
            ("Hydro", "Hydrotest", "Testing", "SCHEDULE_MINED"),
            ("F/R/P", "Fabrication / Rework / Punch", "General", "PLANNER_BOOTSTRAP"),
            ("NDT", "Non-destructive testing", "Testing", "SCHEDULE_MINED"),
            ("UT", "Ultrasonic Testing", "Testing", "PLANNER_BOOTSTRAP"),
            ("RT", "Radiography Testing", "Testing", "PLANNER_BOOTSTRAP"),
            ("MPT", "Magnetic Particle Testing", "Testing", "PLANNER_BOOTSTRAP"),
            ("Golden joint", "Tie-in Weld", "Welding", "PLANNER_BOOTSTRAP"),
            ("PCC", "Plain Cement Concrete", "Civil", "SCHEDULE_MINED"),
            ("RCC", "Reinforced Cement Concrete", "Civil", "SCHEDULE_MINED"),
            ("Holiday test", "Coating Integrity Test", "Coating", "PLANNER_BOOTSTRAP"),
            ("Dewatering", "Trench Pumping", "Civil", "PLANNER_BOOTSTRAP"),
            ("Spool", "Piping Spool", "Piping", "SCHEDULE_MINED"),
            ("Trenching", "Excavate Trench", "Civil", "SCHEDULE_MINED"),
        ]
        for term, can, cat, src in dict_terms:
            session.add(DictionaryTerm(
                project_id="proj-kpp",
                term=term,
                canonical=can,
                category=cat,
                source=src,
                confidence=1.0 if src != "ACTIVE_LEARNED" else None,
                is_active=True,
                created_at=get_now()
            ))

        # 7. Hero Field Reports & Extracted Events (SPEC §9.4)
        hero_reports = [
            {
                "id": "E-2091",
                "source": "voice",
                "text": "Line 24-XX ki spool 17 welding complete ho gayi hai.",
                "author_name": "Rahul Patil",
                "author_role": "Field Supervisor",
                "author_phone": "+91 98201 44102",
                "author_crew": "Welding Crew B",
                "thumb": "/images/thumb-welding.jpg",
                "status": "Review",
                "conf": 94.0,
                "tier": "REVIEW",
                "sugg_id": "PIP-24-017",
                "sugg_name": "Weld Piping System 24-XX",
                "extract": {"action": "Welding", "object": "Spool 17", "location": "Line 24-XX", "status": "Completed"},
                "reasons": [{"label": "Piping", "matchedText": "Line 24-XX"}, {"label": "Line 24-XX", "matchedText": "Line 24-XX"}, {"label": "Welding", "matchedText": "welding"}, {"label": "Active activity", "matchedText": "In progress"}],
                "logic_res": "PASSED",
                "logic_msg": "Predecessor PIP-24-016 complete. Retained Logic validated."
            },
            {
                "id": "E-2092",
                "source": "voice",
                "text": "KP 184.2 pe do sau meter trenching ho gayi.",
                "author_name": "Dinesh Rathod",
                "author_role": "Civil Supervisor",
                "author_crew": "Civil Crew",
                "thumb": "/images/thumb-trenching.jpg",
                "status": "Review",
                "conf": 78.0,
                "tier": "REVIEW",
                "sugg_id": "CIV-12-003",
                "sugg_name": "Excavate Trench KP 180.0–185.0",
                "extract": {"action": "Trenching", "location": "KP 184.2", "quantity": "200", "unit": "m", "status": "In progress"},
                "reasons": [{"label": "Trenching", "matchedText": "trenching"}, {"label": "KP 184.2 range", "matchedText": "KP 184.2"}],
                "logic_res": "PASSED",
                "logic_msg": None
            },
            {
                "id": "E-2093",
                "source": "excel",
                "text": "24XX-SP-012 Coating 100%",
                "author_name": "Contractor B",
                "author_role": "Subcontractor Lead",
                "status": "Review",
                "conf": 82.0,
                "tier": "WARNING",
                "sugg_id": "PIP-24-018",
                "sugg_name": "NDT & Coating Line 24-XX",
                "extract": {"action": "Coating", "object": "24XX-SP-012", "status": "Complete"},
                "reasons": [{"label": "Coating", "matchedText": "Coating"}, {"label": "Line 24-XX", "matchedText": "24XX"}],
                "logic_res": "WARNING",
                "logic_msg": "PIP-24-017 is not complete. Approving starts PIP-24-018 out of sequence (Retained Logic)."
            },
            {
                "id": "E-2094",
                "source": "voice",
                "text": "24 inch manifold ke saare joints weld ho gaye.",
                "author_name": "Rahul Patil",
                "author_role": "Field Supervisor",
                "status": "Review",
                "conf": 88.0,
                "tier": "REVIEW",
                "sugg_id": "PIP-30-005",
                "sugg_name": "Weld Joint M-01-J1 (24″ manifold)",
                "extract": {"action": "Welding", "object": "Manifold Joints", "location": "Manifold M-01", "status": "Complete"},
                "reasons": [{"label": "Manifold", "matchedText": "manifold"}, {"label": "Welding", "matchedText": "weld"}],
                "logic_res": "PASSED",
                "logic_msg": None
            },
            {
                "id": "E-2095",
                "source": "voice",
                "text": "Pig launcher ki foundation ka PCC curing shuru hai.",
                "author_name": "Rahul Patil",
                "author_role": "Field Supervisor",
                "status": "Unmatched",
                "conf": 41.0,
                "tier": "UNMATCHED",
                "sugg_id": None,
                "sugg_name": None,
                "extract": {"action": "Curing", "object": "PCC Foundation", "location": "Pig Launcher", "status": "In progress"},
                "reasons": [],
                "logic_res": "PASSED",
                "logic_msg": None
            },
            {
                "id": "E-2096",
                "source": "voice",
                "text": "Kal se crane nahi aayi, lowering ruka hua hai.",
                "author_name": "Dinesh Rathod",
                "author_role": "Civil Supervisor",
                "status": "Delay",
                "conf": 90.0,
                "tier": "DELAY",
                "sugg_id": "PIP-24-021",
                "sugg_name": "Lower Pipe KP 181.0–183.0",
                "extract": {"action": "Lowering", "status": "Halted", "location": "KP 181.0-183.0"},
                "reasons": [{"label": "Lowering", "matchedText": "lowering"}],
                "logic_res": "PASSED",
                "logic_msg": None
            },
            {
                "id": "E-2097",
                "source": "excel",
                "text": "String Pipe Line 24-XX 100%",
                "author_name": "Contractor A",
                "author_role": "Subcontractor Lead",
                "status": "Review",
                "conf": 96.0,
                "tier": "WARNING",
                "sugg_id": "PIP-24-010",
                "sugg_name": "String Pipe Line 24-XX",
                "extract": {"action": "Stringing", "object": "Line 24-XX", "status": "100%"},
                "reasons": [{"label": "Stringing", "matchedText": "String Pipe"}],
                "logic_res": "WARNING",
                "logic_msg": "Conflict: Duplicate progress report submitted with competing quantity."
            },
            {
                "id": "E-2101",
                "source": "voice",
                "text": "F/R/P chalu hai",
                "author_name": "Rahul Patil",
                "author_role": "Field Supervisor",
                "status": "Unmatched",
                "conf": 52.0,
                "tier": "UNMATCHED",
                "sugg_id": None,
                "sugg_name": None,
                "extract": {"action": "F/R/P", "status": "In progress"},
                "reasons": [],
                "logic_res": "PASSED",
                "logic_msg": None
            },
            {
                "id": "E-2102",
                "source": "excel",
                "text": "SP-031 rework",
                "author_name": "Contractor B",
                "author_role": "Subcontractor Lead",
                "status": "Unmatched",
                "conf": 47.0,
                "tier": "UNMATCHED",
                "sugg_id": None,
                "sugg_name": None,
                "extract": {"action": "Rework", "object": "SP-031"},
                "reasons": [],
                "logic_res": "PASSED",
                "logic_msg": None
            },
            {
                "id": "E-2103",
                "source": "voice",
                "text": "Barish ki wajah se trench mein paani bhar gaya, kaam band.",
                "author_name": "Dinesh Rathod",
                "author_role": "Civil Supervisor",
                "status": "Delay",
                "conf": 84.0,
                "tier": "DELAY",
                "sugg_id": "CIV-12-003",
                "sugg_name": "Excavate Trench KP 180.0–185.0",
                "extract": {"action": "Trenching", "status": "Halted", "location": "KP 180.0-185.0"},
                "reasons": [{"label": "Trenching", "matchedText": "trench"}],
                "logic_res": "PASSED",
                "logic_msg": None
            },
            {
                "id": "E-2104",
                "source": "pdf",
                "text": "Coating work halted awaiting RFI-0387 approval on field joint coating spec.",
                "author_name": "Contractor C",
                "author_role": "DPR Lead",
                "status": "Delay",
                "conf": 91.0,
                "tier": "DELAY",
                "sugg_id": "PIP-24-018",
                "sugg_name": "NDT & Coating Line 24-XX",
                "extract": {"action": "Coating", "status": "Halted", "location": "Field Joints"},
                "reasons": [{"label": "Coating", "matchedText": "Coating"}],
                "logic_res": "PASSED",
                "logic_msg": None
            }
        ]

        for h in hero_reports:
            fr = FieldReport(
                id=h["id"],
                project_id="proj-kpp",
                author_id="user-supervisor",
                author_name=h["author_name"],
                author_role=h["author_role"],
                author_phone=h.get("author_phone"),
                author_crew=h.get("author_crew"),
                source=h["source"],
                raw_text=h["text"],
                thumbnail_url=h.get("thumb"),
                status="TRANSCRIBED",
                created_at=get_now()
            )
            session.add(fr)
            
            ee = ExtractedEvent(
                id=f"ext-{h['id']}",
                field_report_id=fr.id,
                action=h["extract"].get("action"),
                object=h["extract"].get("object"),
                location=h["extract"].get("location"),
                status=h["extract"].get("status"),
                quantity=h["extract"].get("quantity"),
                unit=h["extract"].get("unit"),
                confidence=1.0,
                raw_extraction_json=h["extract"],
                created_at=get_now()
            )
            session.add(ee)

            am = ActivityMatch(
                id=f"match-{h['id']}",
                extracted_event_id=ee.id,
                suggested_activity_id=h["sugg_id"],
                suggested_activity_name=h["sugg_name"],
                confidence=h["conf"],
                decision_tier=h["tier"],
                match_method="AI_MATCH",
                logic_check_result=h["logic_res"],
                logic_check_message=h["logic_msg"],
                retrieval_sources="both",
                created_at=get_now()
            )
            session.add(am)

            if h["sugg_id"]:
                cand = MatchCandidate(
                    activity_match_id=am.id,
                    activity_id=h["sugg_id"],
                    dense_rank=1,
                    sparse_rank=1,
                    rrf_score=0.033,
                    rerank_score=h["conf"],
                    reasons=h["reasons"]
                )
                session.add(cand)

        # Generate verified events to reach 47 Verified / 12 Review / 03 Delays
        # We already have 7 Review + 3 Delays + 2 Unmatched from hero events.
        # Let's seed 47 Verified events across the past 7 days:
        for v_idx in range(1, 48):
            eid = f"E-VER-{v_idx:03d}"
            target_act_id = "PIP-24-010" if v_idx % 2 == 0 else "PIP-24-016"
            
            fr = FieldReport(
                id=eid,
                project_id="proj-kpp",
                author_id="user-supervisor",
                author_name="Rahul Patil",
                author_role="Field Supervisor",
                source="voice",
                raw_text=f"Verified work item {v_idx} on pipeline completed according to specification.",
                status="TRANSCRIBED",
                created_at=get_now() - timedelta(hours=v_idx * 3)
            )
            session.add(fr)
            
            ee = ExtractedEvent(
                id=f"ext-{eid}",
                field_report_id=fr.id,
                action="Verification",
                status="Complete",
                confidence=1.0,
                created_at=fr.created_at
            )
            session.add(ee)
            
            am = ActivityMatch(
                id=f"match-{eid}",
                extracted_event_id=ee.id,
                suggested_activity_id=target_act_id,
                suggested_activity_name="String Pipe Line 24-XX",
                confidence=96.0,
                decision_tier="AUTO_ACCEPT",
                match_method="AI_MATCH",
                logic_check_result="PASSED",
                created_at=fr.created_at
            )
            session.add(am)

            # Mark as approved
            session.add(ReviewAction(
                activity_match_id=am.id,
                actor_id="user-planner",
                actor_name="Meera Nair",
                action="APPROVE",
                reason="Automatic verification passed logic checks.",
                timestamp=fr.created_at + timedelta(minutes=5)
            ))

        # Add 3 more review events to hit exactly 12 Review queue items (9 review + 3 unmatched)
        extra_reviews = [
            ("E-2098", "String Pipe Line 24-XX 100%", "Contractor B", "PIP-24-010", 96.0, "WARNING"),
            ("E-2099", "Joint M-01 inspection pending", "Rahul Patil", "PIP-30-005", 86.0, "REVIEW"),
            ("E-2100", "Hydrotest valve setup", "Dinesh Rathod", "PIP-24-024", 75.0, "REVIEW"),
        ]
        for eid, text, auth, act_id, conf, tier in extra_reviews:
            fr = FieldReport(
                id=eid,
                project_id="proj-kpp",
                author_id="user-supervisor",
                author_name=auth,
                author_role="Supervisor",
                source="excel" if "Contractor" in auth else "voice",
                raw_text=text,
                status="TRANSCRIBED",
                created_at=get_now() - timedelta(minutes=45)
            )
            session.add(fr)
            ee = ExtractedEvent(
                id=f"ext-{eid}",
                field_report_id=fr.id,
                action="Progress",
                status="In progress",
                confidence=1.0,
                created_at=fr.created_at
            )
            session.add(ee)
            am = ActivityMatch(
                id=f"match-{eid}",
                extracted_event_id=ee.id,
                suggested_activity_id=act_id,
                suggested_activity_name="Key Activity",
                confidence=conf,
                decision_tier=tier,
                match_method="AI_MATCH",
                logic_check_result="PASSED" if tier != "WARNING" else "WARNING",
                logic_check_message="Predecessor check warning" if tier == "WARNING" else None,
                created_at=fr.created_at
            )
            session.add(am)

        # 8. Cryptographic Audit Trail (1,280 entries with SHA-256 links)
        print("Generating cryptographic audit chain (1,280 entries)...")
        prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"
        audit_entries = []
        for seq in range(1, 1281):
            timestamp = get_now() - timedelta(minutes=(1281 - seq) * 7)
            actor = "Meera Nair" if seq % 2 == 0 else "System (Auto-Accept)"
            act_id = "PIP-24-017" if seq % 3 == 0 else ("PIP-24-010" if seq % 3 == 1 else "CIV-12-003")
            action = "Approve Match" if seq % 5 != 0 else "Progress Override"
            new_val = f"{(seq % 100) + 1}%"
            src_event = f"E-{2000 + (seq % 100)}"
            
            canonical_payload = json.dumps({
                "sequence_no": seq,
                "actor": actor,
                "action": action,
                "activity_id": act_id,
                "new_value": new_val,
                "source_event_id": src_event,
                "timestamp": timestamp.isoformat()
            }, sort_keys=True)
            
            entry_hash = sha256_hash(prev_hash + canonical_payload)
            
            audit_entries.append(AuditLog(
                project_id="proj-kpp",
                sequence_no=seq,
                timestamp=timestamp,
                actor=actor,
                action=action,
                activity_id=act_id,
                new_value=new_val,
                source_event_id=src_event,
                payload_canonical_json=canonical_payload,
                prev_hash=prev_hash,
                entry_hash=entry_hash
            ))
            prev_hash = entry_hash

        session.add_all(audit_entries)

        # 9. Delay Causes (SPEC §9.5)
        delays = [
            DelayCause(project_id="proj-kpp", category="Weather", events_count=8, days_lost=4, is_critical_path=True, critical_activity_id="PIP-24-017", critical_activity_name="Weld Piping System 24-XX"),
            DelayCause(project_id="proj-kpp", category="Equipment / crane", events_count=5, days_lost=3, is_critical_path=False, critical_activity_id="PIP-24-021", critical_activity_name="Lower Pipe KP 181.0–183.0"),
            DelayCause(project_id="proj-kpp", category="RFI", events_count=4, days_lost=2, is_critical_path=True, critical_activity_id="PIP-24-018", critical_activity_name="NDT & Coating Line 24-XX"),
        ]
        session.add_all(delays)

        # 10. Project Memory Insights
        insights = [
            ProjectMemoryInsight(
                project_id="proj-kpp",
                title="Monsoon Trench Slump Rate",
                insight="Trench excavation in sandy-loam soils slumps at 2.4x the dry-season rate when rainfall exceeds 15mm/24h.",
                recommendation="Advance lowering crews within 48h of trench certification during July-September window.",
                benchmark_project="Gujarat Gas Interconnect 2024",
                sample_size=34,
                season="Monsoon",
                variance_percent=24.0,
                activities=["CIV-12-003", "CIV-12-007"]
            ),
            ProjectMemoryInsight(
                project_id="proj-kpp",
                title="Field Joint Coating Curing Lag",
                insight="Two-part epoxy field joint coating takes 180 min to touch-dry when ambient humidity exceeds 85%, creating Lowering hold points.",
                recommendation="Deploy induction heating pre-collars to accelerate cure cycles.",
                benchmark_project="Kandla Phase 1",
                sample_size=120,
                season="All",
                variance_percent=18.0,
                activities=["PIP-24-018"]
            )
        ]
        session.add_all(insights)

        # 11. Initial Notifications & Access Requests
        session.add(Notification(
            user_id="user-planner",
            title="3 new field reports ready for Match Review",
            time="09:18 AM",
            unread=True,
            target_route="/workbench"
        ))
        session.add(AccessRequest(
            request_code="REQ-0087",
            name="Vikram Mehta",
            contact="vikram.mehta@lntenc.com",
            organization="L&T Construction",
            project_id="proj-kpp",
            project_name="Kandla–Panipat Pipeline — Package 3",
            role="SUPERVISOR",
            status="PENDING",
            created_at=get_now() - timedelta(hours=2)
        ))

        await session.commit()
        print("Canonical seed completed successfully! 200 activities, 10 hero events, 47 verified, 1,280 audit entries.")

if __name__ == "__main__":
    asyncio.run(seed_canonical_data())
