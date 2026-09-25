# Frontend Route Audit — SchedBridge AI (Yatharth)

Audited at: 2026-09-25
Target: Next.js App Router Frontend (`src/app`)

| Route | Status | Notes |
| :--- | :--- | :--- |
| `/` | OK | Root route; redirects unauthenticated users to `/welcome` and authenticated users to active role-based home (`/home`). |
| `/welcome` | OK | Welcome / Landing screen (A1) featuring industrial hero, value proposition cards, role switchers, and "Get Started" CTA. |
| `/welcome/intro` | OK | Step-by-step onboarding walkthrough and system permissions primer with interactive stepper navigation. |
| `/login` | OK | Authentication portal with quick demo login presets for 4 personas (Supervisor, Planner, PM, Admin), credentials input, and lockout safeguards. |
| `/request-access` | OK | Self-service role and project access request form with validation and pending request submission feedback. |
| `/select-project` | OK | Multi-project selector listing active packages (Kandla–Panipat, Duliajan, Numaligarh) with physical/planned progress and status badges. |
| `/home` | OK | Primary role-adaptive home dashboard rendering SU1 (Supervisor), PL1 (Planner), PM1 (Project Manager), or AD1 (Admin) views based on active persona. |
| `/capture` | OK | SU2 Field voice and manual execution log capture interface with live audio waveform recorder, Hindi/Hinglish transcript parser, and entity chips. |
| `/reports` | OK | SU3 Field supervisor reports log with "Mine" vs "All Crews" filter, status tabs, and offline queue status indicator. |
| `/workbench` | OK | PL2 Planner triage queue with confidence score badges, multi-attribute filter pills, multi-select batch approval, and dual-pane layout on desktop (≥1024px). |
| `/workbench/[eventId]` | OK | PL3 Match Review screen (tested at `/workbench/E-2091`) displaying Zone 1 Field Evidence audio/transcript and Zone 2 AI Candidate Match (94%), with approval diff sheet and factor breakdown. |
| `/schedule` | OK | S6 Master Schedule view with interactive WBS hierarchy tree, Gantt-lite timeline visualization, zoom levels, and search filter. |
| `/activity/[id]` | OK | S4 Activity Detail view (tested at `/activity/PIP-24-017`) showing execution parameters, accumulator progress meter (17 of 42 spools, 40%), logic nodes, and audit history. |
| `/analytics` | OK | PM2 Project Analytics dashboard with 3 primary metrics (68% Physical, 74% Planned, 0.92 SPI), progress S-curve, Truth Gap analysis, and CSV export. |
| `/delays/[category]` | OK | PM4 Delay category deep-dive (tested at `/delays/monsoon`) displaying ranked root cause bars, variance metrics, and supervisor field evidence logs. |
| `/event/[id]` | OK | S5 Field Event Detail view (tested at `/event/E-2091`) rendering audio playback player, verbatim transcript, extracted entity chips, and matched activity link. |
| `/export` | OK | Schedule export utility supporting Primavera P6 XML, XER, and CSV schedule delta format downloads. |
| `/ingest/dpr` | OK | PL6 Daily Progress Report (DPR) PDF parser showing simulated document preview, extracted statement checkboxes, and batch match routing. |
| `/ingest/excel` | OK | PL4 Spreadsheet bulk importer with column mapping interface, row validation check, and batch ingestion. |
| `/ingest/xer` | OK | PL5 Primavera P6 XER schedule file parser with WBS hierarchy tree preview and activity mapping table. |
| `/notifications` | OK | S1 Notification Center with Priority/All filter tabs, direct triage deeplinks, mark-as-read, and supervisor question/reply loop banner. |
| `/profile` | OK | User profile view displaying persona credentials, employee ID, assigned organization, active project badge, and session controls. |
| `/project/[id]` | OK | S3 Project Shell view (tested at `/project/kandla-panipat-p3`) with Overview tab, Activities list, Evidence gallery, and Team contact cards. |
| `/search` | OK | S2 Global search overlay with domain dictionary expansion ("hydro" → PIP-24-024 Hydrotest), recent search history, and direct result navigation. |
| `/settings` | OK | User and system configuration screen with offline simulation toggle, theme contrast modes, and English / Hindi language localization switcher. |
| `/ask` | OK | PM3 Natural Language Query assistant interface with pre-built prompt chips and structured tabular answers. |
| `/audit` | OK | Forensic SHA-256 tamper-evident immutable audit chain viewer with live cryptographic integrity verification button (`verify-chain-button`). |
| `/admin` | OK | Administrative root redirect handler; routes immediately to `/home?role=admin`. |
| `/admin/users` | OK | AD1 User Management table (38 users), role assignment dropdowns, inline request approval, and active status toggles. |
| `/admin/projects` | OK | Admin project configuration manager for setting active project data dates, baseline versions, and package metadata. |
| `/admin/dictionary` | OK | Industrial vocabulary dictionary manager with domain synonyms, Hindi transliterations, and alias mappings. |
| `/admin/requests` | OK | Admin convenience route; redirects to `/admin/users?tab=requests`. |
| `/admin/roles` | OK | Admin convenience route; redirects to `/admin/users?tab=roles`. |
| `/dev/kit` | OK | Design system developer showcase rendering atomic buttons, status pills, KPI tiles, audio waveforms, sheets, and typography tokens. |
| `/dev/reset` | OK | Test harness for resetting Zustand `localStorage` stores to deterministic snapshots (`demo-start`, `reference`). |
| `/dev/roles` | OK | Developer role switcher enabling one-click switching between Supervisor, Planner, PM, and Admin personas. |
| `/offline` | OK | Standalone PWA offline fallback page indicating cached data availability. |
