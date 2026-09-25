import httpx
from typing import Optional
from backend.app.config import settings
from backend.app.providers.base import ASRProviderInterface, ASRResult

class ASRError(Exception):
    """Raised when ASR transcription fails. Strictly zero canned fallback (D18)."""
    pass

class RealASRProvider(ASRProviderInterface):
    """
    Real ASR provider calling Groq or OpenAI Whisper.
    Enforces D18: Never returns a canned, default, or simulated transcript.
    """
    def __init__(self, groq_key: Optional[str] = None, openai_key: Optional[str] = None):
        self.groq_key = groq_key or settings.GROQ_API_KEY
        self.openai_key = openai_key or settings.OPENAI_API_KEY

    async def transcribe(self, audio_bytes: bytes, filename: str = "recording.webm") -> ASRResult:
        if not audio_bytes or len(audio_bytes) < 100:
            raise ASRError("Audio recording was empty or too short (< 1s).")

        # 1. Try Groq Whisper (fastest)
        if self.groq_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    files = {"file": (filename, audio_bytes, "audio/webm")}
                    data = {"model": "whisper-large-v3-turbo", "response_format": "json"}
                    headers = {"Authorization": f"Bearer {self.groq_key}"}
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/audio/transcriptions",
                        headers=headers,
                        files=files,
                        data=data
                    )
                    if resp.status_code == 200:
                        payload = resp.json()
                        text = payload.get("text", "").strip()
                        if text:
                            return ASRResult(
                                transcript=text,
                                language=payload.get("language", "en")
                            )
            except Exception as e:
                # Log transport error and continue to next or fail
                pass

        # 2. Try OpenAI Whisper
        if self.openai_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    files = {"file": (filename, audio_bytes, "audio/webm")}
                    data = {"model": "whisper-1", "response_format": "json"}
                    headers = {"Authorization": f"Bearer {self.openai_key}"}
                    resp = await client.post(
                        "https://api.openai.com/v1/audio/transcriptions",
                        headers=headers,
                        files=files,
                        data=data
                    )
                    if resp.status_code == 200:
                        payload = resp.json()
                        text = payload.get("text", "").strip()
                        if text:
                            return ASRResult(
                                transcript=text,
                                language=payload.get("language", "en")
                            )
            except Exception:
                pass

        # D18 CONTRACT INVARIANT: If provider is not configured or failed, RAISE ERROR.
        # NEVER substitute canned data or fixture text!
        raise ASRError(
            "Couldn't transcribe audio. No active ASR provider configured or audio unclear. "
            "Please configure GROQ_API_KEY or OPENAI_API_KEY, or type the report manually."
        )

# Default singleton instance
asr_provider = RealASRProvider()
