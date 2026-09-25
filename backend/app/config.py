import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "SchedBridge AI Backend"
    API_V1_STR: str = "/api/v1"
    DEMO_MODE: bool = True  # D22 Demo-mode disclosure banner
    
    # Database URL: Supports PostgreSQL (Supabase) via asyncpg or SQLite for local dev
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite+aiosqlite:///{BASE_DIR}/schedbridge.db"
    )
    
    # Auth & Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "schedbridge-super-secret-jwt-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    LOGIN_MAX_FAILED_ATTEMPTS: int = 3
    LOGIN_LOCKOUT_SECONDS: int = 30
    
    # Matching Engine Thresholds (Centralized per D1)
    AUTO_ACCEPT_THRESHOLD: float = 95.0
    UNMATCHED_THRESHOLD: float = 50.0
    MIN_CORROBORATIONS: int = 2  # D20 Tier 3 active-learning gating
    RRF_K: int = 60  # D19 Reciprocal Rank Fusion constant
    
    # AI Providers (ASR, Extraction, Embedding, Reranker)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Storage directory for evidence uploads (audio, photos, pdfs, xlsx)
    EVIDENCE_STORAGE_DIR: str = str(BASE_DIR / "storage" / "evidence")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure evidence storage directory exists
os.makedirs(settings.EVIDENCE_STORAGE_DIR, exist_ok=True)
