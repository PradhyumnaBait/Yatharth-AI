import csv
import io
from typing import Dict, Any, List

def parse_excel_or_csv_content(content_bytes: bytes) -> Dict[str, Any]:
    """
    Parses contractor Excel/CSV reports into row events.
    """
    try:
        text = content_bytes.decode("utf-8", errors="replace")
    except Exception:
        text = str(content_bytes)

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        return {"totalRows": 0, "events": []}

    header = [h.strip().lower() for h in rows[0]]
    events = []
    for r_idx, row in enumerate(rows[1:], start=2):
        if not row or not any(row):
            continue
        row_dict = {header[i]: row[i].strip() if i < len(row) else "" for i in range(len(header))}
        
        # Look for description or activity name
        raw_text = row_dict.get("description") or row_dict.get("activity") or row_dict.get("task") or " ".join(row)
        events.append({
            "id": f"EXCEL-ROW-{r_idx}",
            "source": "excel",
            "rawText": raw_text,
            "status": "Review",
            "queueTier": "Review",
            "confidence": 85.0
        })

    return {
        "totalRows": len(events),
        "events": events
    }
