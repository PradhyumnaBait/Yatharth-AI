import io
import csv
from typing import List, Dict, Any
from backend.app.models.entities import Activity, ProgressEvent

def generate_p6_update_csv(
    items: List[Dict[str, Any]],
    data_date: str = "20-Sep-2026"
) -> str:
    """
    Generates Primavera P6 Update CSV with Physical % Complete ONLY.
    Strictly zero duration percent.
    Regression guard: distinct per-row physical_percent deltas.
    """
    output = io.StringIO()
    writer = csv.writer(output, lineterminator="\n")
    
    # Standard P6 CSV Header
    writer.writerow([
        "Activity ID",
        "Activity Name",
        "Status",
        "Physical % Complete",
        "Delta",
        "Data Date"
    ])

    for item in items:
        task_id = item.get("external_task_id") or item.get("activityId") or "ACT-UNKNOWN"
        name = item.get("name") or item.get("activityName") or "Activity Progress"
        status = item.get("status") or "In progress"
        pct = item.get("physical_percent") if "physical_percent" in item else item.get("physicalPercent", 0.0)
        delta = item.get("delta", 0.0)
        
        writer.writerow([
            task_id,
            name,
            status,
            f"{pct:.1f}%",
            f"{delta:+.1f}%" if delta != 0.0 else "0.0%",
            data_date
        ])

    return output.getvalue()
