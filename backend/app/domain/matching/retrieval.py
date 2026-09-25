import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.entities import Activity
from backend.app.providers.embedding import embedding_provider

class HybridRetrievalEngine:
    """
    Hybrid dense + sparse candidate retrieval with Reciprocal Rank Fusion (D19).
    Scoring: RRF(a) = Sum(1 / (k + rank_i)) where k=60.
    Namespace isolated per project/schedule (D21).
    """
    def __init__(self, k: int = 60):
        self.k = k

    async def retrieve_candidates(
        self,
        session: AsyncSession,
        schedule_id: str,
        query: str,
        discipline_filter: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        # 1. Fetch activities for the schedule
        stmt = select(Activity).where(Activity.schedule_id == schedule_id)
        if discipline_filter:
            stmt = stmt.where(Activity.phase_name.ilike(f"%{discipline_filter}%"))
        
        result = await session.execute(stmt)
        activities = result.scalars().all()
        if not activities:
            return []

        # 2. Dense retrieval (Cosine similarity over contextual embedding)
        query_vec = np.array(await embedding_provider.get_embedding(query), dtype=np.float32)
        q_norm = np.linalg.norm(query_vec)
        if q_norm > 0:
            query_vec /= q_norm

        dense_scores = []
        for act in activities:
            if not act.embedding:
                act_vec_list = await embedding_provider.get_embedding(act.embedding_context_text or act.name)
            else:
                act_vec_list = act.embedding
            
            act_vec = np.array(act_vec_list, dtype=np.float32)
            a_norm = np.linalg.norm(act_vec)
            if a_norm > 0:
                act_vec /= a_norm
            
            sim = float(np.dot(query_vec, act_vec))
            dense_scores.append((act, sim))

        dense_scores.sort(key=lambda x: x[1], reverse=True)
        dense_top = dense_scores[:10]
        dense_ranks = {act.id: rank + 1 for rank, (act, _) in enumerate(dense_top)}

        # 3. Sparse retrieval (Exact task ID, token match, and search_tsv overlap)
        q_clean = query.lower()
        q_tokens = set(q_clean.replace("-", " ").replace(".", " ").replace("%", " ").split())
        sparse_scores = []
        exact_code_matches = set()

        for act in activities:
            score = 0.0
            searchable = f"{act.external_task_id} {act.name} {act.search_tsv or ''}".lower()
            
            # Exact external_task_id match gives dominant sparse boost (catches exact WBS / Activity IDs)
            if act.external_task_id.lower() in q_clean:
                score += 10.0
                exact_code_matches.add(act.id)
            
            # Token overlap count
            for tok in q_tokens:
                if len(tok) > 2 and tok in searchable:
                    score += 1.0

            if score > 0:
                sparse_scores.append((act, score))

        sparse_scores.sort(key=lambda x: x[1], reverse=True)
        sparse_top = sparse_scores[:10]
        sparse_ranks = {act.id: rank + 1 for rank, (act, _) in enumerate(sparse_top)}

        # 4. Reciprocal Rank Fusion (RRF)
        all_candidate_ids = set(dense_ranks.keys()).union(set(sparse_ranks.keys()))
        act_map = {act.id: act for act in activities}
        fused = []

        for cid in all_candidate_ids:
            act = act_map[cid]
            d_rank = dense_ranks.get(cid)
            s_rank = sparse_ranks.get(cid)
            is_exact = cid in exact_code_matches

            rrf_score = 0.0
            source_labels = []
            if d_rank is not None:
                rrf_score += 1.0 / (self.k + d_rank)
                source_labels.append("dense")
            if s_rank is not None:
                rrf_score += 1.0 / (self.k + s_rank)
                source_labels.append("sparse")

            retrieval_source = "both" if len(source_labels) == 2 else source_labels[0]

            fused.append({
                "id": act.id,
                "name": act.name,
                "status": act.status,
                "physical_percent": act.physical_percent,
                "dense_rank": d_rank,
                "sparse_rank": s_rank,
                "rrf_score": rrf_score,
                "is_exact_code": is_exact,
                "retrieval_sources": retrieval_source,
                "score": min(0.98, max(0.45, rrf_score * 30.0 + (0.1 if is_exact else 0.0)))
            })

        # Sort descending by fused RRF score, with exact code and raw score as tie-breaker
        fused.sort(key=lambda x: (x["rrf_score"], x["is_exact_code"], x["score"]), reverse=True)
        return fused[:top_k]

hybrid_retrieval_engine = HybridRetrievalEngine()
