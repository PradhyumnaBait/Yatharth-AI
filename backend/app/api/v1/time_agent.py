from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.providers.extraction import extraction_provider

router = APIRouter(prefix="/time-agent", tags=["time-agent"])

class TimeAgentTurnRequest(BaseModel):
    rawText: str
    state: str = "idle"
    clarificationField: Optional[str] = None
    clarificationAnswer: Optional[str] = None
    extractedInfo: Optional[Dict[str, Any]] = None

@router.post("/turn")
async def time_agent_turn(req: TimeAgentTurnRequest):
    """
    Time Agent Turn State Machine (D18).
    Processes field report text without substituting canned transcripts.
    """
    if not req.rawText.strip():
        raise HTTPException(status_code=400, detail="Cannot process empty report text.")

    info = await extraction_provider.extract_fields(req.rawText)
    extracted_dict = info.model_dump()

    # Apply clarification answer if provided
    if req.clarificationField and req.clarificationAnswer:
        extracted_dict[req.clarificationField] = req.clarificationAnswer

    # Determine if clarification is required
    clarification_question = None
    next_state = "confirm"

    # If action is present but object is missing, ask for clarification
    if extracted_dict.get("action") and not extracted_dict.get("object"):
        clarification_question = {
            "field": "object",
            "question": f"Which specific spool, joint, or line for {extracted_dict['action']}?",
            "quickReplies": ["Spool 17", "Spool 18", "Joint M-01", "Line 24-XX"]
        }
        next_state = "clarify"
    elif extracted_dict.get("action") and not extracted_dict.get("location"):
        clarification_question = {
            "field": "location",
            "question": f"What is the location or KP chainage for {extracted_dict['action']}?",
            "quickReplies": ["KP 184.2", "KP 180.0–185.0", "Section 4B", "Refinery Unit 3"]
        }
        next_state = "clarify"

    return {
        "rawText": req.rawText,
        "extractedInfo": extracted_dict,
        "state": next_state,
        "clarificationQuestion": clarification_question
    }
