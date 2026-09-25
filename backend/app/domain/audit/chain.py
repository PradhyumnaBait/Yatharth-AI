import json
from typing import Dict, Any, Tuple, Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.entities import AuditLog
from backend.app.domain.auth.security import sha256_hash

class AuditChainService:
    """
    Server-side tamper-evident SHA-256 hash chain (D8).
    Formula: entry_hash = SHA256(prev_hash || canonical_json(payload))
    """
    GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    async def append_log_entry(
        self,
        session: AsyncSession,
        project_id: str,
        actor: str,
        action: str,
        activity_id: str,
        new_value: str,
        source_event_id: Optional[str] = None
    ) -> AuditLog:
        # 1. Fetch latest entry to get sequence_no and prev_hash
        stmt = (
            select(AuditLog)
            .where(AuditLog.project_id == project_id)
            .order_by(AuditLog.sequence_no.desc())
            .limit(1)
        )
        latest = (await session.execute(stmt)).scalars().first()

        next_seq = (latest.sequence_no + 1) if latest else 1
        prev_hash = latest.entry_hash if latest else self.GENESIS_HASH

        # 2. Canonical JSON string (sorted keys, no extra whitespace)
        canonical_payload = json.dumps({
            "sequence_no": next_seq,
            "actor": actor,
            "action": action,
            "activity_id": activity_id,
            "new_value": new_value,
            "source_event_id": source_event_id or "",
        }, sort_keys=True)

        # 3. Calculate entry hash
        entry_hash = sha256_hash(prev_hash + canonical_payload)

        log_entry = AuditLog(
            project_id=project_id,
            sequence_no=next_seq,
            actor=actor,
            action=action,
            activity_id=activity_id,
            new_value=new_value,
            source_event_id=source_event_id,
            payload_canonical_json=canonical_payload,
            prev_hash=prev_hash,
            entry_hash=entry_hash
        )
        session.add(log_entry)
        await session.flush()
        return log_entry

    async def verify_chain(
        self,
        session: AsyncSession,
        project_id: str
    ) -> Tuple[bool, Optional[int]]:
        """
        Validates cryptographic integrity from genesis to head.
        Returns (valid, brokenAtIndex).
        """
        stmt = (
            select(AuditLog)
            .where(AuditLog.project_id == project_id)
            .order_by(AuditLog.sequence_no.asc())
        )
        entries = (await session.execute(stmt)).scalars().all()
        if not entries:
            return True, None

        expected_prev_hash = self.GENESIS_HASH
        for idx, entry in enumerate(entries):
            # Check link to previous hash
            if entry.prev_hash != expected_prev_hash:
                return False, idx

            # Recompute expected hash
            calculated_hash = sha256_hash(entry.prev_hash + entry.payload_canonical_json)
            if calculated_hash != entry.entry_hash:
                return False, idx

            expected_prev_hash = entry.entry_hash

        return True, None

audit_chain_service = AuditChainService()
