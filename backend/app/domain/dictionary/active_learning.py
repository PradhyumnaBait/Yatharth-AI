import logging
from typing import Optional
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.entities import (
    DictionaryTerm, DictionaryTermSource, ActivityMatch, MatchingConfig
)

logger = logging.getLogger(__name__)

async def process_active_learning_feedback(
    session: AsyncSession,
    match_id: str,
    actor_id: str,
    raw_text: str,
    chosen_activity_id: str,
    chosen_activity_name: str,
    project_id: Optional[str] = None
) -> Optional[DictionaryTerm]:
    """
    Tier 3 Active Learning Feedback Loop with Corroboration Gating (D20).
    Runs when a planner resolves an event via 'Choose Another' or manual search.
    A term activates for matching ONLY once confirmed by >= min_corroborations distinct actors.
    """
    try:
        # 1. Extract potential slang/jargon candidate tokens from raw text
        # Simple extraction: words or phrase not currently in canonical name
        words = [w for w in raw_text.split() if len(w) > 3 and not w.isdigit()]
        if not words:
            return None
        candidate_term = " ".join(words[:2])  # primary distinctive phrase

        # 2. Check if this active-learned term already exists for this project
        stmt = select(DictionaryTerm).where(
            DictionaryTerm.term.ilike(candidate_term),
            DictionaryTerm.canonical == chosen_activity_name,
            DictionaryTerm.source == "ACTIVE_LEARNED"
        )
        if project_id:
            stmt = stmt.where(DictionaryTerm.project_id == project_id)
        
        result = await session.execute(stmt)
        term_record = result.scalars().first()

        if not term_record:
            term_record = DictionaryTerm(
                project_id=project_id,
                term=candidate_term,
                canonical=chosen_activity_name,
                category="Field Slang",
                source="ACTIVE_LEARNED",
                confidence=0.5,
                learned_from_match_id=match_id,
                is_active=False  # Inactive until corroborated
            )
            session.add(term_record)
            await session.flush()

        # 3. Check if this specific match has already been recorded for this term
        src_stmt = select(DictionaryTermSource).where(
            DictionaryTermSource.dictionary_term_id == term_record.id,
            DictionaryTermSource.activity_match_id == match_id
        )
        existing_src = (await session.execute(src_stmt)).scalars().first()

        if not existing_src:
            session.add(DictionaryTermSource(
                dictionary_term_id=term_record.id,
                activity_match_id=match_id,
                actor_id=actor_id
            ))
            await session.flush()

        # 4. Check corroboration threshold (distinct actors)
        count_stmt = select(func.count(distinct(DictionaryTermSource.actor_id))).where(
            DictionaryTermSource.dictionary_term_id == term_record.id
        )
        distinct_actors = (await session.execute(count_stmt)).scalar() or 0

        # Read threshold from config
        min_corroborations = 2
        cfg_stmt = select(MatchingConfig).where(MatchingConfig.project_id == project_id)
        cfg = (await session.execute(cfg_stmt)).scalars().first()
        if cfg:
            min_corroborations = cfg.min_corroborations

        if distinct_actors >= min_corroborations:
            term_record.is_active = True
            term_record.confidence = 0.95
            logger.info(
                f"Tier 3 Active-learning term '{term_record.term}' -> '{term_record.canonical}' "
                f"CORROBORATED by {distinct_actors} distinct planners. Activated for matching."
            )

        await session.commit()
        return term_record

    except Exception as e:
        logger.error(f"Active learning feedback error: {e}", exc_info=True)
        await session.rollback()
        return None
