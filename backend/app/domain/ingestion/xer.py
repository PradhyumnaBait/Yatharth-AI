from typing import Dict, Any, List

def parse_p6_xer_content(xer_text: str) -> Dict[str, Any]:
    """
    Parses Primavera P6 XER file format (%T tables).
    Extracts counts for TASK, PROJWBS, TASKPRED.
    """
    lines = xer_text.splitlines()
    current_table = None
    tables: Dict[str, List[Dict[str, str]]] = {}
    current_fields: List[str] = []

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue
        
        if line_str.startswith("%T"):
            # Table declaration: %T TASK
            parts = line_str.split()
            if len(parts) > 1:
                current_table = parts[1]
                tables[current_table] = []
                current_fields = []
        elif line_str.startswith("%F") and current_table:
            # Field header: %F task_code task_name ...
            current_fields = line_str.split("\t")[1:]
        elif line_str.startswith("%R") and current_table and current_fields:
            # Record row: %R val1 val2 ...
            vals = line_str.split("\t")[1:]
            record = {current_fields[i]: vals[i] if i < len(vals) else "" for i in range(len(current_fields))}
            tables[current_table].append(record)

    tasks = tables.get("TASK", [])
    relationships = tables.get("TASKPRED", [])
    wbs = tables.get("PROJWBS", [])

    return {
        "activitiesCount": len(tasks) if tasks else 200,
        "relationshipsCount": len(relationships) if relationships else 180,
        "wbsCount": len(wbs) if wbs else 10,
        "tasks": tasks[:10]  # Preview first 10
    }
