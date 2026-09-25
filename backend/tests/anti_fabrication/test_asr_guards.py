import pytest
from backend.app.providers.asr import RealASRProvider, ASRError

BANNED_FIXTURE_TRANSCRIPTS = [
    "Line 24-XX ki spool 18 welding complete ho gayi hai.",
    "Line 24-XX ki spool 17 welding complete ho gayi hai.",
    "KP 184.2 pe do sau meter trenching ho gayi.",
    "Activity PIP-24-017 field progress completed."
]

@pytest.mark.asyncio
async def test_asr_empty_audio_raises_typed_error_never_canned():
    """D18 Anti-fabrication: Empty or corrupt audio must raise ASRError, NEVER canned text."""
    provider = RealASRProvider(groq_key="", openai_key="")
    
    with pytest.raises(ASRError) as exc_info:
        await provider.transcribe(b"")
    
    assert "empty or too short" in str(exc_info.value).lower()
    for canned in BANNED_FIXTURE_TRANSCRIPTS:
        assert canned not in str(exc_info.value)

@pytest.mark.asyncio
async def test_asr_unconfigured_provider_fails_transparently():
    """D18 Anti-fabrication: When no provider key is configured, fail with honest typed error."""
    provider = RealASRProvider(groq_key="", openai_key="")
    fake_audio = b"RIFF" + b"\x00" * 200  # 204 bytes fake wave
    
    with pytest.raises(ASRError) as exc_info:
        await provider.transcribe(fake_audio)
        
    error_msg = str(exc_info.value)
    assert "Couldn't transcribe audio" in error_msg
    # Ensure none of the canned demo fixture texts are secretly returned
    for canned in BANNED_FIXTURE_TRANSCRIPTS:
        assert canned != error_msg
