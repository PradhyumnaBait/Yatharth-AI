# SchedBridge AI — Golden Demo Script (9-Scene Narrative)

**Target Presentation**: SIH 26122 (Oil India Limited) Judge Evaluation Video / Live Demo
**Primary Project Stage**: Kandla–Panipat Pipeline — Package 3 (Active execution package)
**Main Actors**: Rahul Patil (Field Supervisor), Meera Nair (Project Controls Planner)

---

## Story Overview
This 9-scene golden workflow demonstrates the complete, end-to-end journey of an EPC site progress event: from spoken voice capture in the field to AI entity extraction, Primavera P6 schedule matching, planner review, variance calculation, immutable audit logging, and institutional memory recall.

```mermaid
graph LR
    S1[1. Planned Activity] --> S2[2. Voice Report]
    S2 --> S3[3. AI Extraction]
    S3 --> S4[4. Schedule Match]
    S4 --> S5[5. Planner Review]
    S5 --> S6[6. Progress & Variance]
    S6 --> S7[7. Audit Trail]
    S7 --> S8[8. Analytics & S-Curve]
    S8 --> S9[9. Institutional Memory]
```

---

## Detailed 9-Scene Breakdown

### Scene 1: The Baseline Plan (P6 Schedule Context)
* **Screen**: Project Detail / Activities Tab (`/project/kandla-panipat-p3?tab=activities`)
* **Context**: The active Primavera P6 schedule shows activity **`PIP-24-017`**:
  * **Activity Name**: Erect Piping Line 24-XX (Spool 15–20)
  * **WBS**: `KP3.PIPING.RACK4`
  * **Planned Duration**: 12 Sept 2026 → 15 Sept 2026
  * **Baseline Status**: In Progress (38% physical complete)
* **Judge Takeaway**: SchedBridge starts with ground-truth Primavera P6 activity definitions and critical path relationships.

---

### Scene 2: Field Voice Capture (Supervisor Action)
* **Screen**: Field Capture Screen (`/capture`)
* **Actor**: Rahul Patil (Field Supervisor, `SUP-0412`)
* **Action**: Rahul taps the microphone button and records a quick multilingual field progress update:
  > *"Spool 17 erection completed at Rack 4. Hydrotest prep team standing by."*
* **UI Feedback**: Real-time waveform feedback and instant local caching (supporting offline site conditions).
* **Judge Takeaway**: Frictionless, hands-free field reporting directly from the trench or pipe rack.

---

### Scene 3: AI Entity Extraction
* **Screen**: Confirm Field Report (`/capture` confirmation sheet) / Event Detail (`/event/E-2091`)
* **AI Processing**: SchedBridge natural language parser extracts structured engineering entities from the raw audio:
  * **Discipline**: `Piping`
  * **Object**: `Spool 17`
  * **Location**: `Rack 4` (KP 182.4)
  * **Action**: `Erection / Fit-up`
  * **Status**: `Completed`
  * **Quantity**: `1 Spool (12m)`
* **Judge Takeaway**: Unstructured spoken language is converted into clean, queryable project controls data.

---

### Scene 4: AI Schedule Matching & Confidence Scoring
* **Screen**: Event Detail / Match Card (`/event/E-2091`)
* **AI Output**:
  * **Matched Activity ID**: `PIP-24-017` (*Erect Line 24-XX*)
  * **Confidence Score**: **94%** (Categorized into **Tier 2: Planner Review**)
  * **Matching Reasoning**:
    1. *Discipline Match*: Spool 17 belongs to Piping WBS `KP3.PIPING.RACK4`.
    2. *Location Alignment*: Rack 4 corresponds to Section 4B active chainage.
    3. *Precedence Check*: Predecessor activity `PIP-24-016` (Spool 16) verified complete.
* **Judge Takeaway**: Transparent, multi-factor AI reasoning eliminates the "black box" and builds planner trust.

---

### Scene 5: Planner Review & Human-in-the-Loop Sign-Off
* **Screen**: Planner Workbench (`/workbench`)
* **Actor**: Meera Nair (Project Controls Planner, `PLN-0107`)
* **Action**:
  1. Meera reviews the 94% match in the incoming triage queue.
  2. She listens to the original voice recording snippet.
  3. She presses **`Approve`** (or hotkey `A`).
  4. An 8-second safety undo banner appears with hotkey `U`.
* **Judge Takeaway**: The human planner remains the final authority on schedule integrity before P6 updates commit.

---

### Scene 6: Actual Finish Recording & Variance Detection
* **Screen**: Project Detail / Activities (`/project/kandla-panipat-p3`)
* **Outcome**:
  * **Physical Progress Delta**: Activity `PIP-24-017` updates from 38% → **100% (Completed)**.
  * **Actual Finish Date**: Recorded as **21 Sept 2026** (vs Planned: **15 Sept 2026**).
  * **Schedule Variance**: **+6 Days Delay** identified automatically.
* **Judge Takeaway**: Progress calculation is governed strictly by physical % complete rather than arbitrary subjective estimates.

---

### Scene 7: Cryptographic Audit Trail & Provenance
* **Screen**: Audit Chain Ledger (`/audit`)
* **Record**: An immutable ledger record is appended:
  * **Entry ID**: `AUD-1281`
  * **Timestamp**: `2026-09-20T14:32:00Z`
  * **Actor**: `Meera Nair (PLN-0107)`
  * **Action**: `Approve Match`
  * **Source Event**: `E-2091 (Audio: Spool 17 erection)`
  * **Delta**: `38% → 100% | Status: In Progress → Verified`
  * **Cryptographic Hash**: `sha256:7f8a9b2...`
* **Judge Takeaway**: 100% tamper-evident traceability from site worker's voice recording to Primavera P6 schedule entry.

---

### Scene 8: S-Curve & Schedule Analytics Impact
* **Screen**: Analytics & S-Curve (`/analytics`)
* **Metrics**:
  * **Schedule Performance Index (SPI)**: Recalculated dynamically at `0.92`.
  * **Truth Gap**: Identifies a 3% delta between contractor DPR claims (71%) and physically verified field progress (68%).
  * **Delay Attribution**: Categorizes the 6-day variance under *Vendor Fabrication Delay (Spool Delivery)*.
* **Judge Takeaway**: Executives and project managers get real-time, defensible schedule intelligence without waiting for end-of-month reconciliation.

---

### Scene 9: Institutional Memory & Historical Context
* **Screen**: Project Memory Insights (`/analytics` / Memory Drawer)
* **Historical Reference**: SchedBridge surfaces an insight from the completed *Duliajan Gathering Station Upgrade (2025)*:
  * *"Similar delay pattern detected on Spool Rack 4 welding during monsoon season (June 2025). Recommend accelerating hydrotest staging for PIP-24-018 to mitigate downstream slip."*
* **Judge Takeaway**: Past project experience is automatically contextualized and surfaced to protect future project milestones.

---

## Golden Demo Quick Reference Table

| Scene # | Stage | Route | Key Element Shown |
| :---: | :--- | :--- | :--- |
| **1** | Planned Baseline | `/project/kandla-panipat-p3` | Activity `PIP-24-017` (12–15 Sept baseline) |
| **2** | Field Capture | `/capture` | Rahul's voice update: *"Spool 17 erection completed"* |
| **3** | AI Extraction | `/event/E-2091` | Extracted: Piping / Spool 17 / Rack 4 / Completed |
| **4** | AI Matching | `/event/E-2091` | Match to `PIP-24-017` at **94% confidence** |
| **5** | Planner Review | `/workbench` | Meera Nair reviews and approves match |
| **6** | Progress & Variance | `/project/kandla-panipat-p3` | Progress: 38% → 100%, Variance: **+6 days** |
| **7** | Audit Trail | `/audit` | Immutable SHA-256 record `AUD-1281` |
| **8** | Analytics Impact | `/analytics` | SPI: `0.92`, Truth Gap: `3%`, S-Curve delta |
| **9** | Institutional Memory | `/analytics` | Historical lessons from *Duliajan Gathering Station* |
