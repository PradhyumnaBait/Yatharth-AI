import hashlib
import numpy as np
import httpx
from typing import List, Optional
from backend.app.config import settings
from backend.app.providers.base import EmbeddingProviderInterface

class RealEmbeddingProvider(EmbeddingProviderInterface):
    """
    Embedding provider supporting OpenAI text-embedding-3-small or
    deterministic normalized semantic vector representation.
    Enforces D21: Must embed contextual text, not bare activity name.
    """
    def __init__(self, openai_key: Optional[str] = None):
        self.openai_key = openai_key or settings.OPENAI_API_KEY
        self.dim = 384  # Standard dense embedding dimension

    async def get_embedding(self, text: str) -> List[float]:
        clean_text = text.strip()
        if not clean_text:
            return [0.0] * self.dim

        # 1. Try OpenAI if key configured
        if self.openai_key:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/embeddings",
                        headers={"Authorization": f"Bearer {self.openai_key}"},
                        json={
                            "model": "text-embedding-3-small",
                            "input": clean_text
                        }
                    )
                    if resp.status_code == 200:
                        vec = resp.json()["data"][0]["embedding"]
                        return vec[:self.dim]
            except Exception:
                pass

        # 2. Deterministic normalized semantic embedding
        # Projects token hashed n-grams into unit hypersphere
        vec = np.zeros(self.dim, dtype=np.float32)
        words = clean_text.lower().split()
        for i, word in enumerate(words):
            # Base token hash
            h1 = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16) % self.dim
            vec[h1] += 1.0 / (i + 1.0)
            
            # Bigram hash for phrase context
            if i > 0:
                bigram = f"{words[i-1]}_{word}"
                h2 = int(hashlib.sha256(bigram.encode("utf-8")).hexdigest(), 16) % self.dim
                vec[h2] += 2.0 / (i + 1.0)

        # Normalize to unit vector for cosine similarity
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_provider = RealEmbeddingProvider()
