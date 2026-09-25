from typing import Dict, Any, Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.entities import MatchingConfig, Schedule
from backend.app.domain.dictionary.normalizer import EPCNormalizer
from backend.app.providers.extraction import extraction_provider
from backend.app.domain.matching.retrieval import hybrid_retrieval_engine
from backend.app.providers.reranker import reranker_provider
from backend.app.domain.logic.schedule_logic import schedule_logic_engine

class MatchingEngine:
    """
    End-to-end matching pipeline:
    1. Normalization (3-tier dictionary)
    2. Extraction (EPC tokens / LLM)
    3. Hybrid dense + sparse retrieval (RRF k=60)
    4. Reranking with reason chips
    5. Schedule logic checks
    6. Confidence calculation & decision tier routing
    """
    async def process_report_text(
        self,
        session: AsyncSession,
        project_id: str,
        raw_text: str,
        discipline_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Fetch current schedule for project
        sched_stmt = select(Schedule).where(
            Schedule.project_id == project_id,
            Schedule.is_current == True
        )
        schedule = (await session.execute(sched_stmt)).scalars().first()
        if not schedule:
            raise ValueError(f"No active schedule found for project {project_id}")

        # Fetch matching thresholds
        cfg_stmt = select(MatchingConfig).where(MatchingConfig.project_id == project_id)
        config = (await session.execute(cfg_stmt)).scalars().first()
        auto_accept_th = config.auto_accept_threshold if config else 95.0
        unmatched_th = config.unmatched_threshold if config else 50.0

        # 2. Normalize raw text using 3-tier EPC dictionary
        normalizer = await EPCNormalizer.load_from_db(session, project_id)
        normalized_text = normalizer.normalize(raw_text)

        # 3. Extract EPC fields
        extracted = await extraction_provider.extract_fields(normalized_text)

        # 4. Construct hybrid search query
        query_parts = []
        if extracted.action: query_parts.append(extracted.action)
        if extracted.object: query_parts.append(extracted.object)
        if extracted.location: query_parts.append(extracted.location)
        search_query = " ".join(query_parts) if query_parts else normalized_text

        # 5. Hybrid Retrieval (Dense cosine + Sparse GIN/token overlap, fused with RRF k=60)
        fused_candidates = await hybrid_retrieval_engine.retrieve_candidates(
            session=session,
            schedule_id=schedule.id,
            query=search_query,
            discipline_filter=discipline_hint,
            top_k=5
        )

        if not fused_candidates:
            # D18: Real honest empty result, no fake candidates
            return {
                "activityId": None,
                "activityName": None,
                "confidence": 0.0,
                "reasons": [],
                "topCandidates": [],
                "queueTier": "Unmatched",
                "logicCheckStatus": "Passed",
                "extractedInfo": extracted.model_dump(),
                "retrievalSources": "none"
            }

        # 6. Reranking
        reranked = await reranker_provider.rerank(normalized_text, fused_candidates)
        top_match = reranked[0]
        
        # 7. Schedule Logic Check
        logic_res = await schedule_logic_engine.evaluate_match(
            session=session,
            activity_id=top_match.activity_id,
            reported_unit=extracted.object,
            reported_quantity=float(extracted.quantity) if extracted.quantity and extracted.quantity.replace(".", "", 1).isdigit() else None
        )

        # 8. Confidence & Routing
        confidence = top_match.score
        if logic_res.status == "WARNING":
            # Logic check warning applies a 5% confidence penalty for tiering
            confidence = max(0.0, confidence - 5.0)

        # Determine Queue Tier
        is_delay = False
        if extracted.status == "Halted" or "delay" in normalized_text.lower() or "halt" in normalized_text.lower():
            is_delay = True

        if is_delay:
            queue_tier = "Delay"
        elif logic_res.status == "WARNING":
            queue_tier = "Warning"
        elif confidence >= auto_accept_th and logic_res.status == "PASSED":
            queue_tier = "Verified"  # Auto-accept
        elif confidence >= unmatched_th:
            queue_tier = "Review"
        else:
            queue_tier = "Unmatched"

        top_candidates_dto = [
            {"id": c.activity_id, "name": c.activity_name, "confidence": c.score}
            for c in reranked
        ]

        # Find retrieval source tag for top candidate
        top_fused = next((f for f in fused_candidates if f["id"] == top_match.activity_id), None)
        retrieval_source = top_fused["retrieval_sources"] if top_fused else "both"

        return {
            "activityId": top_match.activity_id if queue_tier != "Unmatched" else None,
            "activityName": top_match.activity_name if queue_tier != "Unmatched" else None,
            "confidence": confidence,
            "reasons": top_match.reasons,
            "topCandidates": top_candidates_dto,
            "queueTier": queue_tier,
            "logicCheckStatus": logic_res.status.capitalize(),
            "logicCheckMessage": logic_res.message,
            "extractedInfo": extracted.model_dump(),
            "retrievalSources": retrieval_source
        }

matching_engine = MatchingEngine()
