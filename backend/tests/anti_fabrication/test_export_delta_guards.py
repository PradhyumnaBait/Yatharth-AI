import pytest
import csv
import io
from backend.app.domain.export.p6_csv import generate_p6_update_csv

def test_p6_export_produces_distinct_deltas():
    """
    Direct regression test for audited prototype's hardcoded 38->40 export bug:
    Two events with different physical_percent deltas must produce TWO DIFFERENT delta values.
    """
    events = [
        {
            "external_task_id": "PIP-24-017",
            "name": "Weld Piping System 24-XX",
            "physical_percent": 40.0,
            "delta": 2.0,
            "status": "In progress"
        },
        {
            "external_task_id": "CIV-12-003",
            "name": "Excavate Trench KP 180.0–185.0",
            "physical_percent": 96.0,
            "delta": 4.0,
            "status": "In progress"
        }
    ]

    csv_output = generate_p6_update_csv(events)
    reader = csv.reader(io.StringIO(csv_output))
    rows = list(reader)
    
    assert len(rows) == 3  # Header + 2 data rows
    row1 = rows[1]
    row2 = rows[2]

    # Delta is in index 4
    delta1 = row1[4]
    delta2 = row2[4]

    assert delta1 == "+2.0%"
    assert delta2 == "+4.0%"
    assert delta1 != delta2, "Export must NOT hardcode identical deltas across all rows!"
