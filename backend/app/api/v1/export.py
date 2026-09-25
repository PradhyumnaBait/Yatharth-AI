from typing import List, Dict, Any
from fastapi import APIRouter, Response
from pydantic import BaseModel
from backend.app.domain.export.p6_csv import generate_p6_update_csv

router = APIRouter(prefix="/export", tags=["export"])

class ExportCsvRequest(BaseModel):
    events: List[Dict[str, Any]] = []

@router.post("/p6-csv")
async def export_p6_csv(req: ExportCsvRequest):
    # Default sample approved events if empty list provided
    sample_events = req.events if req.events else [
        {
            "activityId": "PIP-24-017",
            "activityName": "Weld Piping System 24-XX",
            "physicalPercent": 40.0,
            "delta": 2.0,
            "status": "In progress"
        },
        {
            "activityId": "CIV-12-003",
            "activityName": "Excavate Trench KP 180.0–185.0",
            "physicalPercent": 96.0,
            "delta": 4.0,
            "status": "In progress"
        }
    ]
    csv_text = generate_p6_update_csv(sample_events)
    return Response(content=csv_text, media_type="text/csv")
