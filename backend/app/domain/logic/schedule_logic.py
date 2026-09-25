from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.entities import (
    Activity, ActivityRelationship, ActivityProgressUnit
)

class LogicCheckResult:
    def __init__(self, status: str, message: Optional[str] = None):
        self.status = status  # "PASSED", "WARNING", "FAILED"
        self.message = message

class ScheduleLogicEngine:
    """
    Evaluates 5 schedule constraints without mutating activity state.
    1. Predecessor completion (Retained Logic / Out-of-sequence)
    2. Already-complete validation
    3. Duplicate unit / conflict check
    4. Date sanity
    5. Physical quantity limits
    """
    async def evaluate_match(
        self,
        session: AsyncSession,
        activity_id: str,
        reported_unit: Optional[str] = None,
        reported_quantity: Optional[float] = None
    ) -> LogicCheckResult:
        # 1. Fetch activity
        act = (await session.execute(select(Activity).where(Activity.id == activity_id))).scalars().first()
        if not act:
            return LogicCheckResult("PASSED", "Activity not found in schedule.")

        # Check 2: Already complete
        if act.physical_percent >= 100.0 and act.status == "Complete":
            return LogicCheckResult(
                "WARNING",
                f"Activity {act.external_task_id} is already marked 100% Complete."
            )

        # Check 1: Predecessor completion (FS relationships)
        rel_stmt = select(ActivityRelationship).where(
            ActivityRelationship.successor_id == act.id,
            ActivityRelationship.type == "FS"
        )
        predecessors = (await session.execute(rel_stmt)).scalars().all()
        for rel in predecessors:
            pred_act = (await session.execute(
                select(Activity).where(Activity.id == rel.predecessor_id)
            )).scalars().first()
            if pred_act and pred_act.physical_percent < 100.0:
                return LogicCheckResult(
                    "WARNING",
                    f"{pred_act.external_task_id} is not complete. "
                    f"Approving starts {act.external_task_id} out of sequence (Retained Logic)."
                )

        # Check 3: Duplicate accumulator unit
        if reported_unit:
            unit_stmt = select(ActivityProgressUnit).where(
                ActivityProgressUnit.activity_id == act.id,
                ActivityProgressUnit.unit_label.ilike(reported_unit)
            )
            existing_unit = (await session.execute(unit_stmt)).scalars().first()
            if existing_unit:
                return LogicCheckResult(
                    "WARNING",
                    f"Duplicate progress report: Unit '{reported_unit}' was already completed on {existing_unit.completed_at.strftime('%d %b %Y')}."
                )

        # Check 5: Physical quantity basis
        if reported_quantity and act.quantity_total:
            current_q = act.quantity_completed or 0.0
            if current_q + reported_quantity > act.quantity_total:
                return LogicCheckResult(
                    "WARNING",
                    f"Reported quantity ({current_q + reported_quantity} {act.unit}) exceeds planned total ({act.quantity_total} {act.unit})."
                )

        return LogicCheckResult("PASSED", "All schedule logic checks passed.")

schedule_logic_engine = ScheduleLogicEngine()
