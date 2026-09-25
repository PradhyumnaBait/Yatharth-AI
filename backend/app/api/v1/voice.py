from fastapi import APIRouter, UploadFile, File, HTTPException, status
from backend.app.schemas.dtos import TranscribeResponse
from backend.app.providers.asr import asr_provider, ASRError

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Real voice transcription endpoint.
    Strictly zero canned/fabricated fallback transcripts (D18).
    """
    audio_bytes = await file.read()
    if not audio_bytes or len(audio_bytes) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio recording was empty or too short."
        )

    try:
        result = await asr_provider.transcribe(audio_bytes, filename=file.filename or "recording.webm")
        return TranscribeResponse(
            transcript=result.transcript,
            language=result.language
        )
    except ASRError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ASR transcription service error: {str(e)}"
        )
