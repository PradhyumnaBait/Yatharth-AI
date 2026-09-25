from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ASRResult(BaseModel):
    transcript: str
    language: str
    duration_seconds: Optional[float] = None

class ExtractedInfoSchema(BaseModel):
    action: Optional[str] = Field(None, description="Action verb e.g. Welding, Trenching, Stringing, Coating")
    object: Optional[str] = Field(None, description="Physical object e.g. Spool 17, Joint M-01, Line 24-XX")
    location: Optional[str] = Field(None, description="Chainage, KP, or zone e.g. KP 184.2, Section 4B")
    status: Optional[str] = Field(None, description="Progress state e.g. Completed, In progress, Halted")
    quantity: Optional[str] = Field(None, description="Numeric quantity e.g. 200, 16")
    unit: Optional[str] = Field(None, description="Measurement unit e.g. m, spools, joints")

class RerankCandidate(BaseModel):
    activity_id: str
    activity_name: str
    score: float
    reasons: List[Dict[str, str]]
    rerank_unavailable: bool = False

class ASRProviderInterface(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, filename: str = "audio.wav") -> ASRResult:
        """Transcribes real audio. NEVER returns canned/fabricated text (D18)."""
        pass

class ExtractionProviderInterface(ABC):
    @abstractmethod
    async def extract_fields(self, normalized_text: str) -> ExtractedInfoSchema:
        """Extracts EPC fields from text. On failure, raises exception or fails (D18)."""
        pass

class EmbeddingProviderInterface(ABC):
    @abstractmethod
    async def get_embedding(self, text: str) -> List[float]:
        """Computes dense vector from contextual text (D21)."""
        pass

class RerankerProviderInterface(ABC):
    @abstractmethod
    async def rerank(
        self,
        query: str,
        candidates: List[Dict[str, Any]]
    ) -> List[RerankCandidate]:
        """Reranks candidates against context and returns reasons."""
        pass
