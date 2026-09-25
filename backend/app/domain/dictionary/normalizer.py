import re
from typing import Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.entities import DictionaryTerm

class EPCNormalizer:
    """
    Normalizes field text against 3-tier dictionary terms.
    Tier 1 (Schedule-mined) + Tier 2 (Planner bootstrap) + Tier 3 (Corroborated Active-Learned).
    """
    def __init__(self, term_mappings: Optional[Dict[str, str]] = None):
        self.term_mappings = term_mappings or {}

    @classmethod
    async def load_from_db(cls, session: AsyncSession, project_id: Optional[str] = None) -> "EPCNormalizer":
        query = select(DictionaryTerm).where(DictionaryTerm.is_active == True)
        if project_id:
            query = query.where(
                (DictionaryTerm.project_id == project_id) | (DictionaryTerm.project_id == None)
            )
        result = await session.execute(query)
        terms = result.scalars().all()
        
        mappings = {}
        for t in terms:
            mappings[t.term.lower()] = t.canonical
        return cls(mappings)

    def normalize(self, raw_text: str) -> str:
        text = raw_text
        for term, canonical in self.term_mappings.items():
            pattern = re.compile(re.escape(term), re.IGNORECASE)
            text = pattern.sub(canonical, text)
        return text
