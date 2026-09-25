# SchedBridge AI — Information Architecture & Route Sitemap (New IA)

**Document**: `docs/NEW_IA_SITEMAP.md`
**Status**: Target Architecture Specification
**Source Baseline**: `docs/ROUTE_AUDIT.md` (29 Audited Routes)

---

## 1. Top-Level Information Architecture (4 Core Pillars)

The redesigned SchedBridge AI Information Architecture groups all product capabilities into four role-oriented pillars with unified sub-navigation:

```
SCHEDBRIDGE AI
├── 1. FIELD (Site Operations)
│   ├── Home (`/home?role=supervisor`)
│   ├── Capture (`/capture`)
│   └── Reports (`/reports`)
│
├── 2. PLANNER (Schedule Engineering & Triage)
│   ├── Review / Workbench (`/workbench`)
│   ├── Schedule (`/schedule`)
│   ├── Ingest (`/ingest`)
│   └── Export (`/export`)
│
├── 3. MANAGEMENT (Executive Controls & Oversight)
│   ├── Overview (`/analytics?tab=overview` or `/home?role=pm`)
│   ├── Variance (`/analytics?tab=variance`)
│   ├── Delays (`/delays` or `/analytics?tab=delays`)
│   └── Memory (`/analytics?tab=memory`)
│
└── 4. ADMIN (Governance & System Operations)
    ├── Users (`/admin/users`)
    ├── Rules & Settings (`/settings`)
    └── Projects (`/admin/projects`)
```

---

## 2. Comprehensive Route Migration & Action Table

Every route identified in `docs/ROUTE_AUDIT.md` is categorized with an architectural action:
* **KEEP top-level**: Retained as a primary navigable destination in the primary navigation rail/bar.
* **FOLD into parent as a tab-section**: Consolidated into a multi-tab parent view to eliminate page bouncing.
* **MERGE with a sibling route**: Combined into a single cohesive dual-pane/unified route.
* **DEMOTE to a settings sub-page**: Accessible via settings/profile drawer rather than main navigation.
* **EXCLUDE from nav entirely**: System utility, redirect stub, or developer test harness (accessible via direct URL / debug only).

| Existing Route | New IA Pillar | Target Location | Action | Design Rationale & Implementation Details |
| :--- | :--- | :--- | :--- | :--- |
| `/` | *Public / Auth* | `/` | **EXCLUDE from nav** | Root router: redirects unauthenticated to `/welcome` and authenticated to `/home`. |
| `/welcome` | *Public / Auth* | `/welcome` | **EXCLUDE from nav** | Public landing page; entry point before session authentication. |
| `/welcome/intro` | *Public / Auth* | `/welcome/intro` | **FOLD into parent** | Interactive onboarding walkthrough embedded as step modal in `/welcome`. |
| `/login` | *Public / Auth* | `/login` | **EXCLUDE from nav** | Authentication & persona selector entry point. |
| `/request-access` | *Public / Auth* | `/request-access` | **DEMOTE to settings** | Demoted to modal/link on `/login` and `/profile`. |
| `/select-project` | *Global Shell* | `/profile` (Sheet) | **FOLD into parent** | Replaced by global Project Switcher dropdown/sheet in header shell. |
| `/home` | **FIELD / MGMT** | `/home` | **KEEP top-level** | Primary role-adaptive home dashboard (Supervisor, Planner, PM, Admin). |
| `/capture` | **FIELD** | `/capture` | **KEEP top-level** | Voice recording, photo attachment, and quick multilingual field report modal. |
| `/reports` | **FIELD** | `/reports` | **KEEP top-level** | Supervisor daily logs, crew submissions, and offline queue status. |
| `/workbench` | **PLANNER** | `/workbench` | **KEEP top-level** | Triage review queue; desktop dual-pane with master-detail selection. |
| `/workbench/[eventId]` | **PLANNER** | `/workbench` | **MERGE with sibling** | Merged into desktop right-hand detail pane of `/workbench` (or deep-link modal on mobile). |
| `/event/[id]` | **FIELD / PLANNER**| `/event/[id]` | **MERGE with sibling** | Unified with workbench detail view; serves as canonical standalone evidence permalink. |
| `/schedule` | **PLANNER** | `/schedule` | **KEEP top-level** | Interactive WBS hierarchy tree, Gantt-lite timeline, and activity viewer. |
| `/activity/[id]` | **PLANNER** | `/schedule` (Drawer) | **FOLD into parent** | Folded into a slide-over Activity Detail sheet within `/schedule`. |
| `/ingest/xer` | **PLANNER** | `/ingest?tab=xer` | **FOLD into parent** | Tab 1 of unified `/ingest` hub for Primavera XER schedule files. |
| `/ingest/excel` | **PLANNER** | `/ingest?tab=excel`| **FOLD into parent** | Tab 2 of unified `/ingest` hub for bulk spreadsheet progress imports. |
| `/ingest/dpr` | **PLANNER** | `/ingest?tab=dpr` | **FOLD into parent** | Tab 3 of unified `/ingest` hub for contractor Daily Progress Reports. |
| `/export` | **PLANNER** | `/export` | **KEEP top-level** | P6 XER, XML, and CSV schedule delta generation and download portal. |
| `/analytics` | **MANAGEMENT** | `/analytics` | **KEEP top-level** | Unified executive dashboard featuring Overview, S-Curves, and SPI metrics. |
| `/delays/[category]` | **MANAGEMENT** | `/analytics` (Tab) | **FOLD into parent** | Folded into `Delays` tab under `/analytics` with category filter pills. |
| `/ask` | **MANAGEMENT** | `/analytics` (Drawer)| **FOLD into parent** | Folded into floating AI Query Assistant drawer accessible across Management views. |
| `/project/[id]` | **MANAGEMENT** | `/project/[id]` | **KEEP top-level** | Deep-dive project shell with Overview, Activities, Evidence, and Teams tabs. |
| `/audit` | **MANAGEMENT** | `/audit` | **KEEP top-level** | Forensic SHA-256 tamper-evident immutable audit chain viewer. |
| `/admin` | **ADMIN** | `/admin/users` | **EXCLUDE from nav** | Legacy redirect stub; routes to default admin view (`/admin/users`). |
| `/admin/users` | **ADMIN** | `/admin/users` | **KEEP top-level** | User management table, role assignments, and access request approvals. |
| `/admin/requests` | **ADMIN** | `/admin/users?tab=req`| **MERGE with sibling**| Merged as secondary tab inside `/admin/users`. |
| `/admin/roles` | **ADMIN** | `/admin/users?tab=roles`| **MERGE with sibling**| Merged as role permission editor tab inside `/admin/users`. |
| `/admin/projects` | **ADMIN** | `/admin/projects` | **KEEP top-level** | Project metadata, baseline packages, and data date manager. |
| `/admin/dictionary`| **ADMIN** | `/settings?tab=dict` | **DEMOTE to settings**| Demoted to "Engineering Dictionary & Aliases" tab in `/settings`. |
| `/settings` | **ADMIN / Global**| `/settings` | **KEEP top-level** | Confidence slider rules, language switcher, display scale, and governance locks. |
| `/notifications` | *Global Shell* | `/notifications` | **KEEP top-level** | Global notification center accessible from header bell icon. |
| `/profile` | *Global Shell* | `/profile` | **KEEP top-level** | User profile, active persona switcher, help link, and sign-out controls. |
| `/search` | *Global Shell* | Global Search Modal | **FOLD into parent** | Global `Cmd+K` / Search modal triggered from top navigation bar. |
| `/help` | *Global Shell* | `/help` | **DEMOTE to settings** | User guide, keyboard shortcut reference, and SIH specs accessible via profile/footer. |
| `/dev/kit` | *Developer* | `/dev/kit` | **EXCLUDE from nav** | Component showcase & design system test harness (direct URL only). |
| `/dev/reset` | *Developer* | `/dev/reset` | **EXCLUDE from nav** | Test harness for deterministic Zustand store resets (direct URL only). |
| `/dev/roles` | *Developer* | `/dev/roles` | **EXCLUDE from nav** | Quick role-switch helper for development (superseded by `/profile`). |
| `/offline` | *PWA Fallback* | `/offline` | **EXCLUDE from nav** | Service worker offline fallback screen. |

---

## 3. Golden Flow Click-Path & Hop-Count Reduction

The **Golden Flow** represents the critical evaluation journey:
`Mic Tap → Voice Capture → Review Queue → Workbench Triage → Planner Approval → Schedule Export`

```
CURRENT CLICK-PATH (5–6 Hops across separate routes):
[Home / Nav] ──(1)──> [/capture] ──(2)──> [/reports or /home] ──(3)──> [/workbench] ──(4)──> [/workbench/E-2091] ──(5)──> [Approve Action] ──(6)──> [/export]

TARGET REDUCED CLICK-PATH (2 Hops with in-context sheets & dual-pane layout):
[Any Screen] ──(1: Instant Bottom Sheet)──> [Voice Capture Modal] ──(Auto-routes to Workbench)──>
[Unified Dual-Pane Workbench] ──(2: Hotkey 'A' or 1-Click Approve + Direct Export CTA)──> [Schedule Commited & Export Ready]
```

### Hop-Count Metrics

| Metric | Current Legacy Architecture | Target New Architecture | Delta / Benefit |
| :--- | :---: | :---: | :--- |
| **Total Navigation Hops** | **6 Hops** | **2 Hops** | **-66% Navigation Friction** |
| **Page Route Transitions** | 5 page navigations | 1 page navigation (in-context sheets) | Eliminates route reload latency |
| **Triage Time (Judge Video)** | ~45 seconds | ~12 seconds | Crisp, highly impressive demo pacing |
| **Keyboard Shortcut Path** | `Click -> Click -> Click` | `Space (Record) -> Enter (Submit) -> A (Approve)` | Zero-mouse demo execution capability |

---

## 4. Role-Based Navigation Visibility

Under the New IA, navigation dynamically filters top-level tabs based on the active persona:

* **Field Supervisor (Rahul Patil)**: `Field Home` · `Capture` · `My Reports` · `Schedule` · `Profile` · `Settings`
* **Project Controls Planner (Meera Nair)**: `Review (Workbench)` · `Schedule (P6)` · `Ingest Hub` · `Export Deltas` · `Overview` · `Profile` · `Settings`
* **Project Manager (Arvind Deshmukh)**: `Overview` · `Analytics & S-Curve` · `Delay Attribution` · `Master Schedule` · `Audit Trail` · `Profile` · `Settings`
* **Project Admin (Sana Qureshi)**: `User Governance` · `Projects & Packages` · `Rules & Settings` · `Audit Ledger` · `Home Overview` · `Profile`

---

## 5. Functional Confirmation Notes for Folded / Merged / Demoted Routes

To ensure zero feature loss, the following index confirms exactly where all functionality from folded, merged, or demoted routes is housed:

1. **`/welcome/intro` (FOLD)**: Step-by-step onboarding walkthrough and system permissions primer now lives inside the interactive onboarding sheet embedded directly on `/welcome`.
2. **`/select-project` (FOLD)**: Multi-project package selector and progress metrics now live inside the global `Switch Project` sheet accessible from `/profile` and header badges.
3. **`/activity/[id]` (FOLD)**: Activity parameters, physical % complete accumulators, and logic nodes now live in the slide-over Activity Detail sheet within `/schedule`.
4. **`/ingest/xer` (FOLD)**: Primavera P6 XER file upload, WBS hierarchy preview, and table parsing now live as Tab 1 (`XER`) in the unified `/ingest` hub and quick Ingest Sheet.
5. **`/ingest/excel` (FOLD)**: Excel spreadsheet bulk importer with column mapping interface now lives as Tab 2 (`Excel`) in the unified `/ingest` hub and quick Ingest Sheet.
6. **`/ingest/dpr` (FOLD)**: Daily Progress Report PDF parsing and statement extraction now live as Tab 3 (`DPR`) in the unified `/ingest` hub and quick Ingest Sheet.
7. **`/delays/[category]` (FOLD)**: Ranked delay root causes, impact bars, and field evidence attachments now live inside the Delay Attribution tab under `/analytics` (and directly accessible at `/delays/monsoon`).
8. **`/ask` (FOLD)**: Natural language schedule assistant with pre-built prompt chips now lives in the primary AI Query Assistant drawer across all Management views.
9. **`/search` (FOLD)**: Global engineering dictionary expansion and cross-entity search now live in the `Cmd+K` global search modal triggered from the top navigation bar.
10. **`/workbench/[eventId]` (MERGE)**: Zone 1 field evidence audio/transcript and Zone 2 AI candidate match diff review now live in the desktop right-hand detail pane of `/workbench` and modal sheet on mobile.
11. **`/event/[id]` (MERGE)**: Field event evidence playback, entity chips, and supervisor Q&A thread now live inside the unified review pane and canonical standalone permalink.
12. **`/admin/requests` (MERGE)**: Pending user role and package access approvals now live in the `Access Requests` tab inside `/admin/users`.
13. **`/admin/roles` (MERGE)**: Role permission matrix and privilege governance now live in the `Role Matrix` tab inside `/admin/users`.
14. **`/request-access` (DEMOTE)**: Self-service access request form is now accessible via the `Request Access` action on `/login` and `/profile`.
15. **`/admin/dictionary` (DEMOTE)**: Industrial engineering vocabulary, Hindi transliterations, and alias mappings now live under the `Engineering Dictionary` tab in `/settings`.
16. **`/help` (DEMOTE)**: User guide, SIH 26122 compliance FAQs, and keyboard shortcut reference now live under `/help`, accessible directly from `/profile`.
