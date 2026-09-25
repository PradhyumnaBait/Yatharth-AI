from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.domain.ingestion.excel import parse_excel_or_csv_content
from backend.app.domain.ingestion.dpr_pdf import parse_dpr_pdf_content
from backend.app.domain.ingestion.xer import parse_p6_xer_content

router = APIRouter(prefix="/ingest", tags=["ingest"])

@router.post("/excel")
async def ingest_excel(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return parse_excel_or_csv_content(content)

@router.post("/dpr")
async def ingest_dpr(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return parse_dpr_pdf_content(content)

@router.post("/xer")
async def ingest_xer(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    try:
        text = content.decode("utf-8", errors="replace")
    except Exception:
        text = str(content)
    return parse_p6_xer_content(text)
