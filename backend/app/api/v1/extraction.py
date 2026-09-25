from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.schemas.dtos import ExtractedInfoDTO
from backend.app.providers.extraction import extraction_provider, ExtractionError

router = APIRouter(prefix="/extraction", tags=["extraction"])

class ExtractRequest(BaseModel):
    text: str

@router.post("/extract", response_model=ExtractedInfoDTO)
async def extract_fields(req: ExtractRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    try:
        extracted = await extraction_provider.extract_fields(req.text)
        return ExtractedInfoDTO(
            action=extracted.action,
            object=extracted.object,
            location=extracted.location,
            status=extracted.status,
            quantity=extracted.quantity,
            unit=extracted.unit
        )
    except ExtractionError as e:
        raise HTTPException(status_code=422, detail=str(e))
