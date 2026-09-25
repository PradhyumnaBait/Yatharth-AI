from fastapi import APIRouter
from backend.app.config import settings

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    has_asr = bool(settings.GROQ_API_KEY or settings.OPENAI_API_KEY)
    has_llm = bool(settings.OPENAI_API_KEY or settings.GROQ_API_KEY or settings.GEMINI_API_KEY)
    degraded = not (has_asr and has_llm)

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "demoMode": settings.DEMO_MODE,
        "degradedMode": degraded,
        "providers": {
            "asr": "connected" if has_asr else "local_fallback",
            "extraction": "connected" if has_llm else "local_epc_parser",
            "embeddings": "connected" if settings.OPENAI_API_KEY else "local_semantic_vectors",
            "reranker": "active"
        }
    }
