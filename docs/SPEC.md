# SchedBridge AI — Frontend Master Plan & Antigravity Prompt Pack

**Scope:** frontend only. The backend is replaced by a typed mock-service layer, so every button works now and the real backend can be swapped in later without touching the UI.
**Look:** `docs/reference/ref-3-screens.png` (your three-phone image) is the visual source of truth.
**Content:** your SIH 26122 research report is the source of truth for domain logic.

---

## 0. How to run this in Antigravity

**Setup (10 minutes)**

1. Create an empty folder `schedbridge-app` and open it in Antigravity.
2. Save **this file** as `docs/SPEC.md`.
3. Save your three-screen image as `docs/reference/ref-3-screens.png`.
4. Crop the photos you need from it into `public/images/`: `hero-worker.jpg`, `pipeline-trench.jpg`, `refinery-pipes.jpg`, `thumb-welding.jpg`, `thumb-trenching.jpg`, `avatar-rahul.jpg`. If they look soft on a large screen, replace them later with licensed photos of the same subject. Never hotlink.
5. Agent Manager → **New Task**. Use **Planning** mode for P00–P05 and P08–P13 (multi-file work). **Fast** mode is fine for fix lists.
6. Paste **one prompt per task**, in order. Attach the reference image wherever a prompt says *attach reference*.
7. After every task: open the running app at 390×844, compare it with the reference, and only then start the next prompt. Use the **Fix list** template at the end of §10 for deviations.

**Run order**

| # | Prompt | What exists when it is done |
|---|---|---|
| P00 | Bootstrap | Project, folders, rules, progress file |
| P01 | Tokens + type | Colors, fonts, spacing, `/dev/kit` page |
| P02 | UI primitives | Every reusable component, in the kit page |
| P03 | App shell | Device frame, bottom nav with raised center button, routing, role guard |
| P04 | Mock data layer | Fixtures, stores, demo clock, audit hash chain |
| P05 | Auth flow | Welcome (ref 1), intro, login, demo accounts, PIN reset, access request, project picker |
| P06 | Home ×4 roles | Reference screen 2, plus planner, PM and admin variants |
| P07 | Project detail | Reference screen 3 shell: Overview, Evidence, Teams |
| P08 | Time Agent | Voice/text capture, clarification, confirm, delay report, offline queue |
| P09 | Reports + events | Reports list, event detail, planner↔supervisor reply loop, notifications |
| P10 | Planner Workbench | Queue + Match Review (reference screen 3) with every sheet and state |
| P11 | Schedule | WBS tree, Gantt-lite, activity detail, search |
| P12 | Ingest + export | Excel mapper, DPR review, XER import, P6 update export |
| P13 | PM | Analytics (4 tabs), Ask, delay detail |
| P14 | Audit, profile, settings, admin | Hash-chain verify, matching rules, users, dictionary |
| P15 | Desktop / tablet | Rail nav, dual-pane workbench, wide Gantt |
| P16 | Offline, i18n, a11y | Service worker, EN/HI, accessibility pass |
| P17 | QA | Pixel comparison, dead-control sweep, Playwright demo path |

---

## 1. Project rules (paste as an Antigravity workspace Rule and save as `docs/RULES.md`)

```text
PROJECT RULES — SchedBridge AI (frontend only)

SCOPE
- Frontend only. No backend, no network calls except static assets.
- All data flows through interfaces in src/services/*, implemented by src/mocks/*.
  Service method names and payloads mirror these future endpoints:
  ingest/voice, ingest/document, schedule/import, workbench/pending,
  workbench/{id}/approve.

SOURCE OF TRUTH
- docs/reference/ref-3-screens.png is the visual reference. docs/SPEC.md §4 tokens
  override personal taste. If SPEC and the image disagree, follow the image and log
  the difference in docs/PROGRESS.md.

INTERACTION CONTRACT
- No dead controls. Every button, tab, chip, pill, row, icon and link produces a
  visible, correct outcome (navigation, sheet, state change, downloaded file).
- If the real behavior needs a backend, run the simulated outcome through the mock
  service. Never use console.log, alert(), href="#", or "coming soon" toasts.
- If a control is truly out of scope, remove it. Do not leave it inert.

BANNED
- Gradients on any UI surface, text, button, chart or background. The only overlay
  allowed on photos is a flat rgba(20,33,61,0.28) scrim, and only when legibility needs it.
- Glassmorphism, blur cards, glows, neon, sparkle/magic-wand icons, emoji in UI,
  "Powered by AI" badges, chatbot bubble UIs, stock-illustration people, decorative blobs.
- Default shadcn styling, Bootstrap-looking tables, donut/pie charts, rainbow charts,
  grids of 12 identical cards, uppercase tracking on labels (two exceptions: the panel
  labels FIELD EVIDENCE and AI MATCH from the reference).
- Scroll-triggered fade-ups, hover lifts on every card, confetti, shimmer skeletons.

COPY
- Sentence case. Plain EPC vocabulary. Verb-first buttons that say exactly what happens
  (Approve Match, Choose Another, Submit). An action keeps the same name across its flow
  (button says Approve Match → toast says Match approved).
- Errors say what happened and how to fix it. No apologies, no filler, no "Oops".
- Never write: unlock, supercharge, seamless, revolutionize, magic, effortless.

CODE
- TypeScript strict, no any. Components under 200 lines. No raw hex outside the tokens file.
  Spacing only from the scale. Every screen has loading, empty and error states.
- Touch targets ≥ 44px (primary field actions ≥ 56px). Visible focus ring. Respect
  prefers-reduced-motion. data-testid on every interactive element.

WORKFLOW
- After each task: typecheck, lint, build. Open 390×844, screenshot, compare to the
  reference, list deviations. Do not refactor unrelated files.
- Update docs/PROGRESS.md at the end of every task: done, deviations, next.
```

---

## 2. Decisions where your sources disagree

| Topic | Conflict | Decision in this spec |
|---|---|---|
| Auto-accept threshold | Report §V says >90%. Report §AP says <75% forces review. The reference shows a **94%** match still waiting for approval. | Thresholds are settings. Default: **auto-accept ≥ 95**, review 60–95, unmatched < 60. Anything that would set an **Actual Finish** never auto-accepts. Moving the slider to 90 reproduces §V. |
| Same 08:42 event | Home shows it **Verified**; Match screen shows it awaiting approval. | It is the before/after of one approval. Two seed snapshots: `reference` (Home exactly as pictured) and `demo-start` (event pending, flips to Verified live on approve). |
| "14 Activities" | The schedule has ~200 activities. | 14 = activities in progress. The Schedule screen shows all 200. |
| "View in P6" | No P6 connection exists. | Label stays. Destination is the in-app network view with sub-label "Baseline: P6 XER v3". |
| Who sees the Match screen | Greeting is a supervisor; Match card is a planner tool. | Reference screen 3 is the **Planner's** view. Supervisors get a read-only Activities tab. |
| Monospace numerals | Brief puts confidence % and metrics in SF Mono. Reference hero numerals look proportional. | Hero numerals (47, 12, 03, 94%, 68%) use the display family with tabular figures. Mono is for IDs, timestamps, data date, freshness clock, chainage, small inline figures. One token (`--font-hero-num`) flips this. |
| SF Pro | Apple licence does not allow embedding SF on non-Apple platforms. | System stack: real SF on Apple devices, Inter (self-hosted) elsewhere. SF Mono → JetBrains Mono fallback. |
| Center button | Reference has a mic. Only supervisors capture voice. | Center button is per role: Supervisor = mic, Planner = ingest (+), PM = Ask, Admin = add (+). Same navy circle, same position. |

---

## 3. Reference decode (what the image actually contains)

**Screen 1 — Welcome.** Full-bleed photo of a crew laying pipe (worker in yellow helmet, tablet in hand). Thin light headline top-left over the photo: "From / Sites to / a Smarter / Tomorrow". A white sheet with grabber, radius ≈ 28, overlaps the lower 38% of the photo. Sheet contents, centered: logo mark + wordmark **SCHEDBRIDGE AI** (navy), headline "Turn field progress into schedule intelligence." (bold, navy, 2 lines), one grey sentence, full-width navy pill **Get Started ›**, then "Already have an account? **Log In**", then a hairline-flanked caption "Planning-to-Execution Intelligence".

**Screen 2 — Home.** Greeting row: round avatar, "Hello," small grey, **Rahul Patil** bold navy, project name grey; notification bell with red dot. Search field, pill radius, filter icon at right. Pill tabs: **All** (filled navy), Progress, Tasks, Evidence (each with a small outline icon). Three KPI tiles: **47** Verified (green dot), **12** Review (amber dot), **03** Delays (red dot), each with a tiny outline icon top-right. "Active Project" + See All. Project card: photo, white panel overlapping the photo's bottom edge, title, **68%** with "Physical Progress" and a navy progress bar, then Data Date and Activities. "Today's Events" + See All, rows with 48px photo thumbnail, title, time, status pill. Bottom nav: Home, Reports, raised navy mic circle, Schedule, Profile.

**Screen 3 — Project / Activity Matching.** Header: back, project name, "10 km execution package", search, bell, more. Refinery-pipes hero photo with a small caption bottom-right. White panel overlaps the photo. Underline tabs: Overview, **Activities** (active), Evidence, Teams. Title **Activity Matching**, red sub-line "12 events require review". Two side-by-side bordered cards:
- **FIELD EVIDENCE:** Voice Report player (play button + waveform), quoted transcript, time 08:42 AM, "Supervisor: Rahul Patil"; **Extracted Information** chips: Welding, Spool 17, Line 24-XX, Completed (green).
- **AI MATCH:** Recommended Schedule Activity, **PIP-24-017** / Weld Piping System 24-XX, **94%** Confidence, Matching Reasons chips (Piping, Line 24-XX, Welding, Active activity), Logic Check **Passed** (green pill), Evidence Linked "Voice → Event → Match → Approval".

Below: full-width navy **Approve Match**; two outline buttons **Choose Another** and **Unmatched** (red outline, red text). Stat strip: Data Freshness **00:03**, Verified Today **47**, Pending Review **12**. Schedule Context with "View in P6": three nodes PIP-24-016 Install Pipe → **PIP-24-017 Weld Piping System 24-XX** (navy, selected) → PIP-24-018 NDT & Coating.

**Signature motifs to preserve everywhere**

1. Photo on top, white panel overlapping it with top radius 24–28.
2. Navy pill for the one primary action per screen.
3. Compact KPI tiles with a colored status dot and a big tabular number.
4. Filled-navy active pill / underline active tab.
5. Rounded chips for extracted or matched facts.
6. Raised navy center button in the nav bar.

**Fix rather than copy:** overlay text on photos must stay legible (flat scrim only); the reference Match screen is dense, so at widths under 360px the two cards stack.

---

## 4. Design system

### 4.1 Color

| Token | Hex | Use |
|---|---|---|
| `--sb-navy` | `#14213D` | Identity: primary buttons, active pill/tab, headlines, logo, center button, selected schedule node |
| `--sb-navy-pressed` | `#0D162B` | Pressed state (derived) |
| `--sb-navy-tint` | `#E8ECF3` | Selected rows, neutral highlight (derived) |
| `--sb-white` | `#FFFFFF` | Cards, sheets, nav bar |
| `--sb-bg` | `#F4F6F8` | App background, inset tiles |
| `--sb-border` | `#E7EBF0` | Hairlines, card borders |
| `--sb-ink` | `#14213D` | Primary text (same as navy) |
| `--sb-ink-2` | `#4A5468` | Secondary text (derived) |
| `--sb-ink-3` | `#6B7485` | Captions, placeholders. Meets 4.5:1 on white (derived) |
| `--sb-verified` / ink / tint | `#34C759` / `#1B7F3B` / `#E8F8ED` | Dot, text-on-tint, pill background |
| `--sb-review` / ink / tint | `#FFB020` / `#8A5300` / `#FFF4DC` | Same roles |
| `--sb-critical` / ink / tint | `#FF453A` / `#C42B21` / `#FFECEA` | Same roles |
| `--sb-scrim` | `rgba(20,33,61,0.28)` | Flat photo scrim only |

Bright status hexes are for dots, bars and icons. Text on tints always uses the darker ink value.

### 4.2 Typography

Stacks:
- **UI:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif`. Load Inter with `next/font`. On Apple devices this renders real SF Pro with automatic optical sizing.
- **Mono:** `"SF Mono", ui-monospace, "JetBrains Mono", Menlo, monospace`.
- Global: `font-variant-numeric: tabular-nums lining-nums` on every number.

| Token | Size / line | Weight | Tracking | Use |
|---|---|---|---|---|
| `num-xl` | 44 / 48 | 600 | −0.02em | 94% confidence |
| `num-l` | 34 / 38 | 600 | −0.02em | KPI tiles (47, 12, 03), 68% progress |
| `display-thin` | 32 / 38 | 300 | −0.01em | Welcome overlay headline (white) |
| `title-1` | 24 / 30 | 700 | −0.015em | Welcome sheet headline, login headline |
| `title-2` | 22 / 28 | 600 | −0.015em | Screen titles ("Activity Matching") |
| `title-3` | 17 / 22 | 600 | −0.01em | Section headers, card titles |
| `body` | 15 / 22 | 400 | 0 | Paragraphs |
| `callout` | 14 / 20 | 500 | 0 | Pills, list primary text, buttons |
| `caption` | 12 / 16 | 400–500 | 0 | Secondary lines, chips |
| `panel-label` | 11 / 14 | 600 | +0.04em, uppercase | **Only** FIELD EVIDENCE, AI MATCH |
| `mono-m` | 13 / 18 | 500 | 0 | Activity IDs, data date, freshness clock |
| `mono-s` | 12 / 16 | 500 | 0 | Timestamps, chainage, hashes |

### 4.3 Spacing, radius, elevation

- 4-pt grid. Screen side padding **16**. Card padding **14–16**. Gaps **8 / 12 / 16 / 24**.
- Radii: sheet top **28**, cards **20**, KPI tiles and inner cards **16**, thumbnails **12**, chips/pills/primary buttons **999**.
- Shadows (no gradients): `e1: 0 1px 2px rgba(20,33,61,.04)`, `e2: 0 6px 20px rgba(20,33,61,.06)`, `e3 (center button, sheets): 0 10px 30px rgba(20,33,61,.14)`. Cards on `--sb-bg` use e1 + 1px border; floating elements use e2/e3.

### 4.4 Iconography and imagery

- Lucide, stroke 1.5, 20px in lists, 24px in nav. Outline only; the mic in the center button and the active nav item may be filled.
- Photography: real construction/pipeline/refinery images, full-bleed, unfiltered, flat scrim only.
- Logo: recreate the mark from the reference as a clean SVG (an upward arrow over a bridge span), navy. Wordmark **SCHEDBRIDGE AI**, semibold, slight positive tracking.

### 4.5 Components

| Component | Spec |
|---|---|
| **Button primary** | Navy, white text, height 52 (56 for field CTAs), pill, `callout` 600. Pressed: navy-pressed + scale .98. Loading: inline spinner, label stays. |
| **Button outline** | White, 1px navy border, navy text, same size. **Destructive outline** uses `critical-ink` text and critical border (the reference "Unmatched"). |
| **Pill filter** | Height 36, padding 0 14, pill. Active: navy fill, white text. Inactive: white, 1px border, navy text, 16px outline icon. |
| **Underline tabs** | Text `callout`; active navy 600 with 2px navy underline; inactive `ink-3`. Full-width hairline beneath. |
| **Segmented control** | Height 36, `--sb-bg` track, white thumb with e1, used for 2–4 short options. |
| **Search field** | Height 48, pill, white, 1px border, leading search icon, trailing filter icon button (44px target). |
| **KPI tile** | Radius 16, white, e1. Number `num-l` navy. Row beneath: 8px status dot + label `caption`. Tiny outline icon top-right in `ink-3`. Whole tile is a tap target. |
| **Project card** | Photo 16:9 (height ≈ 168) + white panel overlapping by 24, top radius 24. Title `title-3`, progress `num-l` + label, 6px navy bar on `--sb-border` track (optional planned marker: 2px tick), meta row with icon + label + `mono-m` value. |
| **Event row** | 48px thumbnail (photo or source glyph on navy-tint), title `callout` 600 navy ("Welding — Line 24-XX"), time `mono-s` `ink-3`, status pill right. Divider hairline. |
| **Status pill** | Height 28, pill, 14px icon + `caption` 600, tint background, ink text. See table below. |
| **Chip** | Height 28, pill, `--sb-bg` fill, navy text `caption` 500. Green variant = confirmed status. Tappable chips show a 1px border on press and open an edit sheet. |
| **Bottom nav** | White, top hairline, height 64 + safe area. Items: 24px icon + 11px sentence-case label; active navy 600, inactive `ink-3`. **Center button:** 64px navy circle raised ≈ 20px, 6px white ring, e3, white 28px icon, 56px minimum hit area. |
| **Sheet** | White, top radius 28, grabber (36×4, `--sb-border`), scrim `rgba(20,33,61,.4)`, drag to dismiss, max height 90%. |
| **Dialog** | Destructive confirms only (sign out, discard, delete). |
| **Toast** | Bottom, above nav, navy background, white text, optional **Undo**. 4s (8s when Undo is present). |
| **Skeleton** | Flat `--sb-bg` blocks, 1.2s opacity pulse. No shimmer sweep. |
| **Waveform** | 3px bars, 2px gap, navy played / `--sb-border` unplayed. Live version reads the mic through an AnalyserNode. |
| **Evidence chain** | Horizontal 4-step "Voice → Event → Match → Approval". Complete steps navy; pending steps `ink-3` with a dashed connector. |
| **Schedule context** | Three rounded nodes joined by arrows; selected = navy fill, white text; others `--sb-bg`. Node shows `mono-s` ID + name + status dot. |
| **Confidence badge** | Number in `mono-m` with tier dot (green ≥ auto-accept, amber review, red unmatched). |
| **Offline banner** | Amber-tint strip under the header: "Offline · 3 reports saved on device" + **Sync now**. |

**Status vocabulary (used identically everywhere)**

| Status | Color | Icon | Meaning |
|---|---|---|---|
| Verified | green | check-circle | Approved by planner, or auto-accepted |
| Review | amber | clock | Needs planner decision |
| Unmatched | red | help-circle | No confident schedule match |
| Delay | red | alert-triangle | Delay reported |
| Rejected | grey | x-circle | Planner rejected / duplicate |
| Saved offline | grey | cloud-off | Queued on device |
| Reply needed | navy-tint | message-circle | Planner asked the supervisor a question |

### 4.6 Motion

- Sheets: spring (stiffness 320, damping 32). Page push: 240ms ease-out horizontal slide. Toasts 180ms.
- Button press: scale .98, 90ms. No hover lifts on touch layouts.
- Live things move: waveform, freshness clock. Nothing else animates on its own.
- `prefers-reduced-motion`: replace slides/springs with 120ms opacity.

---

## 5. Roles, logins and navigation

### 5.1 Demo accounts (shown only when `NEXT_PUBLIC_DEMO=true`)

| Role | Name | Employee ID | PIN | Organisation | Lands on |
|---|---|---|---|---|---|
| Field Supervisor | Rahul Patil | SUP-0412 | 123456 | Sterling Infra EPC (fictional) | `/home` (reference screen 2) |
| Project Controls Planner | Meera Nair | PLN-0107 | 123456 | Sterling Infra EPC | `/home` (planner variant) |
| Project Manager | Arvind Deshmukh | PM-0031 | 123456 | Owner's project team | `/home` (PM variant) |
| Project Admin | Sana Qureshi | ADM-0002 | 123456 | Sterling Infra EPC | `/home` (admin variant) |

### 5.2 What each role can do

| Capability | Supervisor | Planner | PM | Admin |
|---|---|---|---|---|
| Capture voice/text progress and delay reports | ✓ | — | — | — |
| See own reports and their status | ✓ | — | — | — |
| Read the schedule and activity detail | ✓ | ✓ | ✓ | ✓ |
| Review, approve, reject, re-match events | — | ✓ | — | — |
| Ask a supervisor for clarification | — | ✓ | — | — |
| Upload DPR / Excel / .xer, export P6 update | — | ✓ | — | — |
| Change matching thresholds | — | ✓ | — | ✓ |
| Analytics, truth gap, delays, project memory | — | read | ✓ | read |
| Ask (natural-language schedule queries) | — | — | ✓ | — |
| Audit trail | own events | ✓ | ✓ | ✓ |
| Users, access requests, dictionary, projects | — | — | — | ✓ |

UI rule: a control the role cannot use is **not rendered**. It is never greyed out with no explanation.

### 5.3 Bottom navigation by role

| Slot | Supervisor | Planner | PM | Admin |
|---|---|---|---|---|
| 1 | Home | Home | Home | Home |
| 2 | Reports | Workbench | Analytics | Users |
| **Center** | **Mic** → Time Agent | **+** → Ingest sheet | **Ask** | **+** → Add sheet |
| 4 | Schedule | Schedule | Schedule | Dictionary |
| 5 | Profile | Profile | Profile | Profile |

---

## 6. Screen inventory and specs

Priority: **P1** = on the 3-minute demo path. **P2** = complete product. **P3** = last.

| ID | Screen | Roles | Route | Pri |
|---|---|---|---|---|
| A1 | Welcome (ref 1) | all | `/welcome` | P1 |
| A2 | Intro (3 cards) | all | `/welcome/intro` | P2 |
| A3 | Login | all | `/login` | P1 |
| A4 | Demo accounts sheet | all | overlay on `/login` | P1 |
| A5 | Forgot PIN | all | sheet on `/login` | P2 |
| A6 | Request access | all | `/request-access` | P2 |
| A7 | Project picker | all | `/select-project` | P1 |
| A8 | Permissions primer | Supervisor | sheet after first login | P2 |
| S1 | Notifications | all | `/notifications` | P2 |
| S2 | Search | all | `/search` | P2 |
| S3 | Project detail (ref 3 shell) | all | `/project/[id]` | P1 |
| S4 | Activity detail | all | `/activity/[id]` | P1 |
| S5 | Event detail | Sup, Planner, PM | `/event/[id]` | P1 |
| S6 | Schedule | all | `/schedule` | P1 |
| S7 | Audit trail | Planner, PM, Admin | `/audit` | P2 |
| S8 | Profile | all | `/profile` | P1 |
| S9 | Settings | all | `/settings` | P2 |
| SU1 | Supervisor Home (ref 2) | Supervisor | `/home` | P1 |
| SU2 | Capture (Time Agent) | Supervisor | `/capture` | P1 |
| SU3 | Reports | Supervisor | `/reports` | P1 |
| PL1 | Planner Home | Planner | `/home` | P1 |
| PL2 | Workbench queue | Planner | `/workbench` | P1 |
| PL3 | Match Review (ref 3) | Planner | `/workbench/[eventId]` | P1 |
| PL4 | Ingest sheet | Planner | sheet | P2 |
| PL5 | Excel mapper | Planner | `/ingest/excel` | P2 |
| PL6 | DPR review | Planner | `/ingest/dpr` | P2 |
| PL7 | XER import | Planner | `/ingest/xer` | P2 |
| PL8 | P6 update export | Planner | `/export` | P1 |
| PM1 | PM Home | PM | `/home` | P1 |
| PM2 | Analytics | PM | `/analytics` | P1 |
| PM3 | Ask | PM | `/ask` | P3 |
| PM4 | Delay detail | PM | `/delays/[category]` | P2 |
| AD1 | Admin Home | Admin | `/home` | P3 |
| AD2 | Users & roles | Admin | `/admin/users` | P3 |
| AD3 | Dictionary | Admin | `/admin/dictionary` | P3 |
| AD4 | Projects & baselines | Admin | `/admin/projects` | P3 |

Notation: **Control → Result**. "Sheet" = bottom sheet. Every screen also has loading, empty and error states per §7.

---

### A1 · Welcome — reference screen 1

**Job:** brand entry and route to onboarding or login.

**Layout:** full-bleed photo (`hero-worker.jpg`, object-cover, top 62% of viewport). Overlay headline top-left in `display-thin`, white, over a flat scrim. White sheet overlapping the photo: grabber, logo lockup, `title-1` headline, one `body` sentence in `ink-2`, primary pill, "Already have an account? **Log In**", hairline-flanked caption.

| Control | Result |
|---|---|
| **Get Started ›** | First launch → A2. If onboarding already seen → A3. |
| **Log In** (text link) | A3. |
| Grabber (drag up / tap) | Sheet expands to show three one-line value points (Capture by voice · Linked to the right activity · Verified by your planner). Drag down / tap collapses. |

**States:** if already signed in, skip to role Home.

### A2 · Intro — 3 cards

**Job:** explain the loop in three beats; ask nothing.

Three full-bleed photo cards with the same overlapping white panel: **Speak your update** (Hindi, English or a mix) → **We link it to the schedule activity** → **Your planner verifies it, the schedule stays current**. Page dots (navy = current).

| Control | Result |
|---|---|
| Next | Advances a card; on card 3 the button reads **Continue** → A3. |
| Skip (top-right) | A3. Marks onboarding seen. |
| Swipe | Moves between cards. |

### A3 · Login

**Job:** authenticate by employee ID + PIN.

**Layout:** small logo lockup top-left, language chip top-right (English · हिन्दी · मराठी · ગુજરાતી). Title "Sign in to your project". Sub "Use your employee ID and 6-digit PIN." Fields: **Employee ID** (mono, uppercase-normalised), **PIN** (masked dots, numeric keypad, show/hide eye). Primary **Sign in**. Outline **Continue with company SSO**. Text links **Forgot PIN?** and **Request access**. When demo flag is on: **Demo accounts** link.

| Control | Result |
|---|---|
| Sign in | Disabled until ID and 6 digits are entered. Validates against mock users (700ms). Success → A7 if user has >1 project, otherwise role Home; supervisor first login shows A8. |
| Wrong PIN | Inline error "PIN doesn't match this employee ID. 2 tries left." After 3 → locked for 30s with a visible countdown. |
| Unknown ID | Inline error "No account found for SUP-9999. Check the ID or request access." |
| Continue with company SSO | Opens A4 acting as the identity-provider chooser ("Sign in as…"). |
| Forgot PIN? | A5 sheet. |
| Request access | A6. |
| Demo accounts | A4. |
| Language chip | Sheet with languages; choosing one switches UI strings immediately (EN/HI complete, others fall back to EN with a note). |

### A4 · Demo accounts (sheet)

Four rows: avatar, name, role, employee ID (`mono-s`). Tapping a row signs in as that user immediately (skips PIN). Footer caption: "Demo data is synthetic."

### A5 · Forgot PIN (sheet, 3 steps)

1. **Employee ID** → **Send code**. 2. **6-digit code** (auto-advancing boxes; resend timer 30s; demo hint shows the code `482913`). 3. **New PIN** + **Confirm PIN** → **Save PIN** → success state with **Back to sign in**. Wrong code shows an inline error; mismatched PINs disable Save with a reason line.

### A6 · Request access

**Job:** ask an admin for an account.

Fields: Full name, Employee ID or mobile, Contractor/organisation (select), Project code (select), Requested role (segmented: Supervisor / Planner / PM). **Submit request** → success state with a request reference (`REQ-0087`) and **Back to sign in**. The request appears in Admin → Users → Requests (AD2) and creates an admin notification.

### A7 · Project picker

**Job:** choose the active project.

Cards (photo thumbnail, name, role on this project, data date `mono-s`). Three fixtures (§9.1). Tapping sets the active project and goes to Home. Reachable later by tapping the project name on Home, or Profile → Switch project.

### A8 · Permissions primer (sheet, supervisors)

Three rows: **Microphone** (required to record), **Notifications**, **Location** (optional, tags reports with KP). Each has **Allow** (triggers the real browser prompt) and **Not now**. Primary **Continue**. If the microphone is denied, the Capture screen defaults to typing and shows one line explaining how to re-enable.

---

### SU1 · Supervisor Home — reference screen 2 (pixel-match)

**Job:** what happened today, what needs me, where do I report.

**Layout (top → bottom):** header row · search · pill tabs · KPI tiles · body section (changes with the pill) · bottom nav.

| Control | Result |
|---|---|
| Avatar | S8 Profile. |
| Project name | A7 sheet variant (switch project). |
| Bell (red dot = unread) | S1 Notifications. Dot clears when all are read. |
| Search field | S2, keyboard open. |
| Filter icon | Sheet: Discipline, Status, Area/KP range → applies to S2 results. |
| **All** pill | Body = Active Project card + Today's Events (as in the reference). |
| **Progress** pill | Body = phase progress list (9 phases, verified % bar with planned tick). Tap a phase → S3 Activities tab filtered to it. |
| **Tasks** pill | Body = this week's work packages assigned to the supervisor's crew (checklist rows: activity ID, name, planned dates, status). Row button **Report** → SU2 prefilled with that activity. |
| **Evidence** pill | Body = 2-column grid of today's voice notes and photos with status pills. Tap → S5. |
| KPI **47 Verified** | SU3 Reports filtered to Verified, All crews. |
| KPI **12 Review** | SU3 filtered to Review. |
| KPI **03 Delays** | SU3 filtered to Delay. |
| Project card | S3 Overview. |
| **See All** (Active Project) | A7 list. |
| **See All** (Today's Events) | SU3, Today. |
| Event row | S5. |
| Center mic | SU2. |

KPI scope label: "Today, all crews". **Snapshot `reference`** must match the image exactly: 47 / 12 / 03, 68%, Data Date 20 Sep 2026, 14, Welding — Line 24-XX 08:42 AM Verified, Trenching — KP 184.2 09:17 AM Review.

### SU2 · Capture — the Time Agent

**Job:** get a complete, structured progress or delay report from the field in under 15 seconds, with one clarifying question at most.

**Entry:** center mic (full-screen modal rising from the button), or **Report** on a task row (prefilled).

**Header:** close (X) · context line "Kandla–Panipat · 20 Sep 2026" · language chip (Hindi + English default) · **Type instead** toggle.

**State machine:** `idle → listening → transcribing → transcript → (clarify)* → confirm → submitting → submitted | queued`

| State | What the screen shows | Controls → Result |
|---|---|---|
| **idle** | 88px navy mic button, "Tap and speak your update", 3 example chips ("Spool 17 welding done", "Trenching 200 m at KP 184.2", "Crane not available, lowering stopped") | Mic → listening. Example chip → fills transcript, jumps to transcript. |
| **listening** | Live waveform from the real microphone, timer `mono-m` | Tap mic to stop → transcribing. **Cancel** → idle. Auto-stops at 60s. |
| **transcribing** | 700ms indeterminate flat line | — |
| **transcript** | Editable text card, detected-language chip, extracted fields appear beneath | Tap text to edit; **Re-record** → idle; **Continue** → clarify or confirm. |
| **clarify** | One question card only (never a chat log): e.g. "Which line or area was this for?" with quick-reply chips (Line 24-XX, Line 24-YY, KP 184.2) and a small mic for a spoken answer | Chip or mic answer fills the missing slot → confirm. Max 2 questions. **Skip** → confirm with the slot marked Unspecified. |
| **confirm** | Structured card: **Action**, **Object**, **Location**, **Status** (Started / In progress / Completed / Delay), optional **Quantity** (e.g. 200 m). Then **Add photo**, **Add note**. | Each chip → picker sheet to edit. **Add photo** → real camera/gallery input, thumbnail strip, remove (×). **Submit** (primary). **Re-record**. |
| **delay branch** | Status = Delay reveals category chips (Weather · RFI pending · Material · Equipment/crane · Permit/ROU · Manpower · Client hold · Other) and an optional affected-activity picker | Category required before Submit is enabled. |
| **submitting** | Button spinner, 500ms | — |
| **submitted** | Check icon, "Sent 08:42:11", event ID `mono-m`, "Your planner will verify it." | **Report another** → idle. **Done** → Home. |
| **queued** (offline) | Grey cloud-off, "Saved on this device. It will send when you're back online." | Same buttons. Item appears in SU3 → Queued. |

**Simulated extraction:** rule-based, deterministic (§10 P08). It must produce the spec's expected chips for the hero phrases in §9.4.

**Errors:** microphone denied → typing mode + one-line fix. Recording < 1s → "Too short — hold the update for a few seconds."

### SU3 · Reports

**Job:** the supervisor's log, and what happened to each item.

**Layout:** title, **Mine | All crews** segmented, underline tabs **Today · Drafts · Queued · History**, filter icon, list of event rows. At the top, if any events are in *Reply needed*, a navy-tint banner "2 questions from your planner" (tap → the first).

| Control | Result |
|---|---|
| Tabs | Today = this data date; Drafts = unsent captures (Resume → SU2); Queued = offline items; History = previous days, grouped by date. |
| Mine / All crews | Filters by author. |
| Filter icon | Sheet: status, source, discipline, date. |
| Row | S5. |
| Queued row: **Retry** / **Delete** | Retry re-runs sync; Delete asks via dialog. |
| Queued header: **Sync now** | Sends all queued items with a progress line; toast "3 reports sent." |
| Pull to refresh | Re-reads store; last-updated stamp updates. |

Empty states: Today "Nothing reported yet. Tap the mic to send your first update." · Drafts "No drafts." · Queued "Everything is sent." · History "No earlier reports."

---

### PL1 · Planner Home

Same skeleton as SU1 so the product feels like one app; the **content answers planner questions**.

- Header, search ("Find an activity" searches the schedule), filter icon: identical.
- Pills: **All · Queue · Alerts · Imports**.
- KPI tiles: **12 Review** (amber), **47 Verified** (green), **02 Warnings** (red: out-of-sequence + conflicts).
- Body (**All**): Active Project card (68%, Data Date, and **Freshness `00:03`** replacing "Activities") · **Needs your review** list (top 3 by priority: warnings first, then lowest confidence) with confidence badge · See All.

| Control | Result |
|---|---|
| **Queue** pill | Top 10 queue rows. Row → PL3. |
| **Alerts** pill | Out-of-sequence and conflicting-report cards. Each has **Open** → PL3 on that event. |
| **Imports** pill | Recent imports: baseline v3 (.xer), DPR PDFs, Excel files, with counts and time. Row → import result summary sheet. |
| KPI Review | PL2 → Review segment. |
| KPI Verified | PL2 → Done segment. |
| KPI Warnings | PL2 → Warnings segment. |
| Row in "Needs your review" | PL3. |
| Center **+** | PL4 Ingest sheet. |

### PL2 · Workbench queue

**Job:** triage everything waiting for a human.

**Layout:** title "Workbench", segmented/underline tabs **Review 9 · Unmatched 3 · Warnings 2 · Done**, sort menu, filter icon, **Select** button, list.

**Row:** source glyph (mic / Excel / PDF), raw text in 2 lines, `mono-s` suggested activity ID + name, confidence badge, time.

| Control | Result |
|---|---|
| Row | PL3 opened at that event, with the queue position (3 of 9). |
| Sort | Sheet: Priority (default) · Confidence low→high · Newest · Discipline. |
| Filter | Sheet: source, discipline, contractor, date. |
| **Select** | Multi-select mode. Bar: **Approve selected (n)**. Items whose Logic Check ≠ Passed are not selectable and show why ("Predecessor incomplete"). Approving shows the same diff sheet as PL3 with a table for n items. |
| Done tab | Approved / rejected / marked out-of-scope items with actor and time. Row → S5. |

Empty: "Queue is clear. Last approval 3 minutes ago. Data date 20 Sep 2026."

### PL3 · Match Review — reference screen 3

**Job:** the one screen where a planner decides. Route renders the S3 shell (header, hero photo, tabs) with **Activities** active.

**Layout (top → bottom):** title "Activity Matching" · red line "12 events require review" · pager (‹ 1 of 12 ›) · two-card row · action buttons · stat strip · Schedule Context.

**FIELD EVIDENCE card**

| Control | Result |
|---|---|
| Play / pause | Plays the recording. Fixture events without an audio file speak the transcript with browser text-to-speech (hi-IN / en-IN). Real recordings from SU2 replay the actual audio. Waveform is scrubbable. |
| Transcript | Opens a sheet: original text, English normalisation, detected language, source, device time. |
| Extracted chips (Welding · Spool 17 · Line 24-XX · Completed) | Tap → edit sheet for that field. Saving re-runs matching; candidates, confidence and reasons update live. |
| Supervisor name | Small profile sheet with crew and phone (tap-to-call). |

**AI MATCH card**

| Control | Result |
|---|---|
| Activity ID / name | S4 for that activity. |
| **94%** | Sheet "Why 94%": factor rows (semantic similarity 0.88 · discipline match · location match · action match · baseline status active) and the top 3 candidates with their scores. |
| Reason chips | Tap → highlights the matching words in the transcript card and scrolls to it. |
| **Logic Check: Passed** | Sheet with each check and its result: predecessors complete? · discipline filter · not already 100% · date sanity · duplicate report. Failed checks are red with the fix. |
| Evidence Linked | Sheet with the 4-step chain, actor and timestamp at each step. |

**Actions**

| Control | Result |
|---|---|
| **Approve Match** | Sheet "What will change" — a diff table: `Physical % 38 → 40`, `Actual Start unchanged (12 Sep 2026)`, `Actual Finish not set`, `Evidence 17 of 42 spools`, `Data date 20 Sep 2026`. Buttons **Confirm approval** / **Cancel**. Confirm → status Verified, activity progress updated, audit entry appended, freshness resets to 00:00, toast **Match approved · Undo** (8s), auto-advances to the next event. **Undo** reverses the change and appends a reversal entry. |
| **Choose Another** | Sheet: search box + top 5 candidates (ID, name, confidence, reasons) + **Browse schedule** (WBS tree picker). Picking one opens the same diff sheet with the note "Manual match — recorded as override". Optional reason chips: Wrong area · Wrong discipline · Better fit. |
| **Unmatched** (red outline) | Sheet "Why doesn't this match?" with reasons (Out-of-scope work · Missing schedule activity · Need more information · Duplicate report) and matching actions: **Ask supervisor** (question composer with templates; sets *Reply needed* and notifies the supervisor) · **Request new activity** (creates a draft fragnet request listed in Imports/Alerts) · **Mark out-of-scope** · **Reject as duplicate**. Each writes an audit entry and removes the event from the queue. |
| Pager ‹ › / swipe / keys J K | Previous / next event. Desktop keys: **A** approve, **C** choose another, **U** unmatched. |

**Stat strip:** Data Freshness (live `mm:ss`, then `1h 12m`, `2d 4h`) · Verified Today · Pending Review — all bound to the store; tapping any opens PL2 on the relevant tab.

**Schedule Context:** nodes are tappable (→ S4 of that activity). **View in P6** opens the in-app network view (predecessors and successors two levels deep, relationship type and lag, status color) with the caption "Baseline: P6 XER v3, imported 12 Sep 2026".

**Variants (all must exist, driven by fixtures):**

| Variant | What changes |
|---|---|
| **Out-of-sequence** (E-2093) | Amber banner above the buttons: "PIP-24-017 is not complete. Approving starts PIP-24-018 out of sequence (Retained Logic)." Logic Check pill = **Warning**. Actions become **Approve with override** (requires a reason chip), **Hold & ask supervisor**, **Reject**. |
| **Accumulator** (E-2091, E-2092) | AI MATCH card gets a progress meter "17 of 42 spools · 40%" or "+200 m of 5,000 m · 92% → 96%". Copy says the parent activity stays open. |
| **Distribute** (E-2094) | Card shows "This report covers 3 activities": checkbox rows PIP-30-005/006/007 with per-row confidence; **Approve 3 activities**. |
| **Unmatched** (E-2095) | AI MATCH shows "No confident match", best guess at 41% greyed, reasons empty. **Approve Match** is replaced by **Choose Another** (primary) and **Unmatched** actions. |
| **Conflict** (E-2097 vs E-2098) | Red banner: "Two contractors report 100% on PIP-24-010 on different dates." Side-by-side both reports. Actions: **Keep first report**, **Keep second report**, **Ask both supervisors**. |
| **Loading** | Skeleton of both cards. |
| **All caught up** | Empty state with last approval time and a **Go to Home** button. |

### PL4 · Ingest (sheet from the center +)

Four large rows, each with an icon, title and one line:
**Upload DPR (PDF)** → PL6 · **Upload Excel report** → PL5 · **Import schedule (.xer)** → PL7 · **Type an entry** → SU2-style text capture on behalf of a crew (adds a "Entered by planner" source tag).
On desktop the sheet accepts drag-and-drop and routes by file extension.

### PL5 · Excel mapper

**Job:** turn a contractor spreadsheet into events.

**Steps (stepper header 1 · 2 · 3):**
1. **File:** real file picker (.xlsx/.csv) parsed in the browser, or **Use sample file** (`DPR_Contractor_B_20Sep.xlsx`).
2. **Map columns:** each schema field (Date, Task details, Location/Line, Quantity, % done, Contractor) gets a select of detected headers, pre-suggested. Live preview of the first 8 rows below.
3. **Process:** **Process N rows** → progress bar → summary "31 auto-matched · 9 need review · 3 unmatched" → **Open Workbench**.

Rows become events (source: Excel) in the store and appear in PL2 immediately. Mapping can be saved per contractor (checkbox "Remember this mapping").

### PL6 · DPR review

**Job:** pull activity-level statements out of a PDF DPR.

Choose the bundled sample DPR or pick a PDF (rendered with pdf.js). Left/top: page view with highlighted paragraphs. Below: extracted statements as selectable cards (checkbox, text, detected action/location). **Send N to matching** → events (source: DPR PDF) in the store → toast with **Open Workbench**. Statements the extractor is unsure about show an amber "Check" tag. For any PDF that isn't the bundled sample, extraction uses the sample result set and says so in one line.

### PL7 · XER import

**Job:** load the baseline.

1. **File:** real `.xer` picker or **Use sample baseline**.
2. **Parse summary:** project name, data date, counts (WBS nodes, activities, relationships, calendars), detected scheduling option (Retained Logic / Progress Override), warnings (e.g. "3 activities have no predecessors"). A collapsible WBS tree preview.
3. **Confirm:** **Import as Baseline v3** (dialog naming what will be replaced) → success → S6.

The XER file is tab-delimited text with `%T` table headers. Write a small client-side parser for `PROJECT`, `PROJWBS`, `TASK`, `TASKPRED` so a real file shows real counts.

### PL8 · P6 update export

**Job:** produce the update file the planner imports into P6.

**Layout:** scope selector (Approved since last export · Custom date range), format segmented **CSV (P6 import)** / **XER (beta)**, preview table, warnings, **Generate file**, export history.

| Control | Result |
|---|---|
| Preview table | Columns: Activity ID (`mono-s`), Field (Actual Start · Actual Finish · Physical % Complete), Old → New, Source event. Row checkbox includes/excludes it. Row with an override shows a red flag "Out-of-sequence override". |
| Info card | "P6 must import with **Retained Logic**. Out-of-sequence items are flagged above." |
| **Generate file** | Builds a real file in the browser and downloads `SchedBridge_P6_Update_20SEP2026_1.csv`. Adds a history row. |
| History row | **Download** again, **Details** (counts and who exported). |

Progress is exported as **Physical % Complete only**. There is no duration-percent field anywhere in the product.

---

### PM1 · PM Home

Same skeleton as SU1.

- Pills: **All · Progress · Delays · Memory**.
- KPI tiles: **0.92 SPI** (amber dot), **03 Delays** (red dot), **00:03 Freshness** (green dot).
- Body (**All**): Active Project card with a **planned marker** on the progress bar (74%) · **Truth gap** row "DPR-reported 71% · Verified 68% · Gap 3 pts" (tap → PM2 Truth Gap) · **Top delay causes** (3 rows with days lost; tap → PM4).

| Control | Result |
|---|---|
| **Progress** pill | Mini S-curve (planned vs actual) + phase table. Tap → PM2 Progress. |
| **Delays** pill | Ranked delay causes, period toggle 7d / 30d. Row → PM4. |
| **Memory** pill | Top 2 insight cards. Tap → PM2 Memory. |
| Center **Ask** | PM3. |

### PM2 · Analytics

Underline tabs **Progress · Truth Gap · Delays · Memory**. Charts are hand-built SVG (d3-scale/d3-shape only).

| Tab | Content | Controls → Result |
|---|---|---|
| **Progress** | S-curve (cumulative physical %, planned = grey line, actual = navy line, data-date vertical line, touch scrubber with tooltip). Three numerals: Physical 68% · Planned 74% · SPI 0.92. Phase table (planned / verified / gap). | Range toggle Weekly / Monthly. Row → S3 Activities tab filtered by phase. **Export CSV** downloads the table. |
| **Truth Gap** | One sentence: "Reported progress runs 3 points ahead of verified progress." Horizontal paired bars per phase (reported = outline, verified = navy) with the gap in points. | Row → sheet listing "reported, not yet verified" events for that phase; each → S5. |
| **Delays** | Ranked horizontal bars per cause: events, days lost, and an "On critical path" tag. | Period toggle 7d / 30d / All. Row → PM4. |
| **Memory** | Insight cards (§9.7) and a table "Planned vs actual duration by activity type". | Season filter (All / Monsoon / Dry). Card → sheet with n, method and the activities behind it (each → S4). **Export CSV**. |

### PM3 · Ask

**Job:** answer schedule questions from the live data. Not a chatbot: one question, one answer card.

Input + suggested chips: "Which piping tasks are delayed?" · "What is driving the delay?" · "What did trenching achieve this week?" · "Show out-of-sequence work" · "What is pending review?" · "Is welding on the critical path?". Keyword-routed to six query handlers over the mock store. Each answer card: one-line answer, compact table, source line "12 events · data date 20 Sep 2026", **Open in Schedule** / **Open in Workbench** button. Unsupported question → "I can answer questions about delays, progress by phase, out-of-sequence work, review queue and critical path." plus the chips again.

### PM4 · Delay detail

Header with category, days lost, period. Sections: **Affected activities** (ID, name, days late, critical-path tag) → S4 · **Reports** (raw supervisor quote, source, time, supervisor) → S5 · **Timeline** (dot per day, weather shown for the Weather category). Button **Download delay log (CSV)**.

---

### AD1 · Admin Home
Same skeleton. KPI tiles: **38 Users**, **04 Requests** (amber), **03 Projects**. Body: **Access requests** (Approve / Reject inline) and quick links (Dictionary, Projects). Center **+** → sheet: **Invite user** · **Add synonym** · **Create project**.

### AD2 · Users & roles
Underline tabs **Users · Requests · Roles**. Users: searchable list (avatar, name, role, project, last active); row → sheet with **Change role**, **Reset PIN**, **Deactivate** (dialog). Requests: pending cards with **Approve** (choose role and project) / **Reject** (reason). Roles: the §5.2 matrix, read-only, so admins can see what each role can do. **Invite user** sheet: name, ID, role, project → adds to the list.

### AD3 · Dictionary
Underline tabs **Synonyms · Disciplines · Units**. Synonyms: term → canonical (e.g. `Hydro → Hydrotest`, `F/R/P → Fabrication / Rework / Punch`, `NDT → Non-destructive testing`). Disciplines: keyword → discipline (`Spool` → Piping). Units: `mtr`, `m`, `meter`, `metre` → metre. Add/edit sheet includes **Test a phrase**: type a sentence and see which terms are recognised, live. Changes feed the mock matcher.

### AD4 · Projects & baselines
Project cards → detail: baseline versions (v1–v3 with date, activities, who imported), data date, thresholds (auto-accept, review, unmatched — same sliders as S9), **Archive project** (dialog).

---

### S1 · Notifications
Underline tabs **All · Needs action**. Grouped Today / Earlier. Item = icon, one-line text, time. Tap opens the target (event, workbench, analytics, request). **Mark all read**. Examples: Supervisor "Meera asked: which spool range?" · Planner "12 events need review" / "Out-of-sequence warning on PIP-24-018" · PM "SPI fell below 0.95" · Admin "New access request REQ-0087".

### S2 · Search
Autofocus. Empty state: recent searches and 4 suggestions ("Hydrotest", "Spool 17", "KP 184", "Crane"). Segmented **Activities · Events**. Results use the dictionary (searching "hydro" finds Hydrotest). Activity result: `mono-m` ID, name, WBS path, status pill, physical %. Filter sheet (discipline, status, KP range). Supervisor result row has a **Report** button → SU2 prefilled. No results: "No activity matches 'xyz'. Try a line number or activity ID."

### S3 · Project detail — reference screen 3 shell
Header: back · project name · "10 km execution package" · search · bell · **⋯** (sheet: Switch project · Project info · Export summary). Hero photo with small caption (project tagline, configurable). White panel overlaps. Underline tabs.

| Tab | Content (per role) |
|---|---|
| **Overview** | Physical 68% with planned marker · Data Date + Freshness · Forecast finish vs planned finish · phase progress list (tap → Activities filtered) · latest 3 delay alerts. |
| **Activities** | **Planner:** PL3 Match Review (queue pager). **Supervisor / PM / Admin:** read-only activity list grouped by phase, status filter chips, progress bars, critical toggle (PM); row → S4; supervisor rows also show **Report**. |
| **Evidence** | Filter chips (All · Voice · Photos · DPR · Excel). List/grid of every evidence item with status pill and linked activity ID. Tap → S5. |
| **Teams** | Cards per crew: name, contractor, foreman, headcount today, reports today, last report time, verified rate. Tap → sheet: members, recent events (→ S5), **Call foreman** (tel: link). |

### S4 · Activity detail
Header: `mono-m` ID · name · status pill. Underline tabs:

| Tab | Content |
|---|---|
| **Overview** | Planned vs actual start/finish (baseline vs current), physical %, quantity, discipline, WBS path, calendar. |
| **Progress** | The accumulator: meter "17 of 42 spools", and the list of contributing events with each one's share and status → S5. |
| **Logic** | Predecessors and successors with relationship type, lag, status color; out-of-sequence flags. Nodes → their S4. |
| **History** | Audit entries for this activity (time, actor, change, hash prefix). |

Planner-only: **Adjust % complete** (sheet: new value, reason chips, required) writes an audit entry. Supervisor: **Report progress** → SU2 prefilled.

### S5 · Event detail
Status pill, source, timestamp. Evidence card (audio player / Excel row / DPR excerpt), transcript + normalised text, extracted chips, match block (activity, confidence, reasons) or "Awaiting planner" for supervisors, evidence chain, photos, note, and a **Conversation** thread (planner questions and supervisor replies). Supervisor sees **Reply** on a question → SU2-style voice/text reply that attaches to the event and returns it to the planner's queue. Planner sees **Open in Workbench**.

### S6 · Schedule
Header "Schedule", Data Date pill (`mono-s`), search icon. Segmented **List · Gantt**. Toggles: **Critical**, **Late**, and for supervisors a default filter **My work packages**.

- **List:** collapsible WBS tree, row = ID, name, status dot, physical %.
- **Gantt-lite:** sticky left column (ID + name, 132px), horizontally scrolling timeline. Planned bar = grey, actual bar = navy on top, remaining forecast = navy outline, vertical Data Date line, critical activities have a red outline. Zoom Week / Month.
- Tap row or bar → S4.

### S7 · Audit trail
Filters: actor, action type, date. Each entry: time (`mono-s`), actor, action, activity ID, old → new, source event, hash prefix (first 8 characters, `mono-s`). **Verify chain** recomputes SHA-256 over the whole chain in the browser (SubtleCrypto): "Chain intact · 1,284 entries" (green) or "Break at entry #812" (red, jumps to it). **Export CSV**. Dev-only **Tamper an entry** button proves the check.

### S8 · Profile
Avatar, name, role pill, employee ID (`mono-m`), organisation, project. Supervisor stat row: reports this week · verified rate · average time to verify. Rows: Settings · Language · Notifications · Switch project · Help. Dev rows (demo flag): **Switch demo user** (keeps data). **Sign out** → dialog → A3.

### S9 · Settings
Sections: **Language** (UI, voice default) · **Offline** (connection status, queued count, **Sync now**, dev-only **Simulate offline** toggle) · **Notifications** (toggles per type) · **Display** (text size: Default / Large) · **Matching rules** (Planner, Admin only: two sliders, Auto-accept ≥ and Unmatched <, with a tier preview bar. Locked info rows: "Actual Finish is never auto-accepted", "Progress measure: Physical % complete", "P6 option assumed: Retained Logic") · **About** (version, "Prototype build", data snapshot name, **Reset demo data**).

---

## 7. Cross-cutting behavior

**Interaction contract.** Every control does something visible (see §1). Where a real system would call the backend, call the mock service, which waits 150–700ms and then mutates the store.

**Demo clock.** All times come from `demoNow()`, fixed at **20 Sep 2026, 09:24 IST**, ticking forward in real time from there. A setting switches to the real clock. Data Freshness = `demoNow() − lastApprovedAt`.

**Loading, empty, error.** Every list and screen: skeleton (flat pulse) → content; empty state = one line saying what is missing + one action; error = what failed + **Retry**. Mock services can be told to fail (`?fail=workbench`) to prove the error states.

**Offline.** Connection state from `navigator.onLine` plus the dev toggle. Offline: amber banner under the header; capture works and writes to an IndexedDB queue; on reconnect the queue flushes automatically with a toast. Planner screens show cached data with a "Last updated" stamp and disable writes with one line of explanation.

**Undo.** Approve, reject, out-of-scope and re-match actions offer 8s Undo. Undo appends a reversal entry to the audit chain.

**Audit chain.** Every mutation appends `{id, ts, actor, action, activityId, old, new, sourceEventId, prevHash, hash}` where `hash = SHA-256(prevHash + canonicalJSON(entry))`.

**Keyboard (desktop).** `/` focuses search, `Esc` closes sheets, Workbench keys A / C / U / J / K, Tab order matches visual order, focus is trapped inside sheets and restored on close.

**Accessibility.** Labels on every icon button. KPI tiles announce "47 verified events today". Status is never conveyed by color alone (icon + word). Contrast ≥ 4.5:1 for text. Minimum target 44px, 56px for supervisor primary actions.

**i18n.** English and Hindi complete for Auth, SU1, SU2, SU3, A-series, S1, S8, S9. Keys in `src/i18n/{en,hi}.json`. Numbers stay Western digits.

**Dev tools (demo flag only).** `/dev/kit` (component gallery matching the reference), `/dev/reset?snapshot=reference|demo-start`, `/dev/roles` (quick switch), `?frame=off` (hide device frame), `?fail=<service>`.

**Device frame.** On viewports wider than 500px, render the app inside a 390×844 phone frame (rounded bezel, dynamic island, 9:41 status bar) so it looks like the reference. The fake status bar and notch exist **only** in this frame. On real phones the OS provides them; the app just respects safe-area insets.

**Responsive (P15).** ≥ 1024px and role Planner / PM / Admin: the bottom nav becomes a left rail (icon + label), Workbench becomes list (left) + Match Review (right), Gantt uses full width, analytics use a 2-column grid. Supervisors stay in the phone layout.

---

## 8. Architecture and folder structure

**Stack:** Next.js (App Router) · TypeScript strict · Tailwind (tokens as CSS variables mapped into the theme) · Radix primitives (headless only) · Zustand (+ persist) · Framer Motion · Lucide · date-fns · d3-scale / d3-shape · idb · SheetJS · pdfjs-dist · next-intl · Serwist · Playwright.

```text
schedbridge-app/
  docs/                    SPEC.md  RULES.md  PROGRESS.md  reference/
  public/                  images/  audio/  sample/ (sample.xer, dpr sample, contractor xlsx)
  src/
    app/
      (public)/            welcome  login  request-access  select-project
      (app)/               layout.tsx (auth guard + role shell)
        home  reports  workbench  analytics  ask  schedule  profile  settings
        capture  notifications  search  audit  export
        project/[id]  activity/[id]  event/[id]  delays/[category]
        ingest/(excel|dpr|xer)
        admin/(users|dictionary|projects)
      dev/                 kit  reset  roles
    design/                tokens.css  tailwind-theme.ts  fonts.ts
    components/
      ui/                  Button Chip StatusPill Card Sheet Dialog Toast Tabs Segmented
                           SearchField KpiTile Avatar Skeleton EmptyState FormField PinInput
      domain/              ProjectCard EventRow Waveform VoiceRecorder ConfidenceBadge
                           EvidenceChain ScheduleContext ActivityRow FreshnessClock
                           OfflineBanner Stepper GanttLite SCurve PairedBars
      shell/               DeviceFrame BottomNav RailNav ProjectShell RoleGuard PageHeader
    features/
      auth  home  capture  reports  workbench  schedule  ingest  export
      analytics  ask  audit  settings  admin  notifications
    services/              interfaces + types only
    mocks/
      fixtures/            users projects wbs activities events teams analytics dictionary
      services/            implementations with simulated latency and failure switches
      seed.ts  clock.ts  matcher.ts  extractor.ts  askRouter.ts
    store/                 auth project events activities audit ui offline
    lib/                   format.ts hash.ts xer-parser.ts csv.ts download.ts
    i18n/                  en.json hi.json
  tests/e2e/               demo-path.spec.ts  dead-controls.spec.ts
```

**Service interfaces (names only):** `AuthService`, `ProjectService`, `ScheduleService`, `EventService`, `MatchService`, `VoiceService`, `ExtractionService`, `IngestService`, `ExportService`, `AnalyticsService`, `AuditService`, `NotificationService`, `AdminService`. All async, all return typed results, all failable via `?fail=`.

**Voice.** `VoiceService.record()` uses `MediaRecorder` + `AnalyserNode` for the real waveform and audio blob. `VoiceService.transcribe()` defaults to the scripted mock (returns the fixture transcript that matches the phrase or the next scripted phrase). Optional setting "Live transcription (experimental)" uses the browser Web Speech API where available. The interface is what the real Bhashini call will implement later.

---

## 9. Mock data contract (synthetic — label it as such)

### 9.1 Projects
1. **Kandla–Panipat Pipeline — Package 3** · 10 km execution package · KP 178.0–188.0 · data date **20 Sep 2026** · physical **68%** · planned 74% · 14 activities in progress · 200 total.
2. **Duliajan Gathering Station Upgrade** · data date 19 Sep 2026 · 41%.
3. **Numaligarh Tank Farm Expansion** · data date 18 Sep 2026 · 23%.
Only project 1 is fully populated. Projects 2 and 3 open into a consistent read-only state with a short summary.

### 9.2 Phases (weights and progress; 68 / 71 / 74 must reconcile)

| Phase | Weight | Planned | DPR-reported | Verified |
|---|---|---|---|---|
| Trenching | 15% | 100 | 98 | 96 |
| Stringing | 10% | 100 | 100 | 100 |
| Welding | 20% | 95 | 91 | 85 |
| NDT | 10% | 80 | 76 | 70 |
| Coating | 10% | 75 | 72 | 66 |
| Lowering | 12% | 75 | 70 | 65 |
| Backfill | 8% | 70 | 62 | 60 |
| Hydrotest | 10% | 0 | 0 | 0 |
| Restoration | 5% | 0 | 0 | 0 |
| **Overall** | | **74** | **71** | **68** |

SPI = 68 / 74 = **0.92**.

### 9.3 Key activities

| ID | Name | Phase | Status | Phys % |
|---|---|---|---|---|
| CIV-12-003 | Excavate Trench KP 180.0–185.0 | Trenching | In progress | 92 |
| PIP-24-010 | String Pipe Line 24-XX | Stringing | Complete | 100 |
| PIP-24-016 | Install Pipe Line 24-XX | Stringing | Complete | 100 |
| **PIP-24-017** | **Weld Piping System 24-XX** | Welding | In progress | 38 (16 of 42 spools) |
| **PIP-24-018** | **NDT & Coating Line 24-XX** | NDT | Not started | 0 |
| PIP-24-021 | Lower Pipe KP 181.0–183.0 | Lowering | In progress | 60 |
| CIV-12-007 | Backfill KP 178.0–181.0 | Backfill | In progress | 60 |
| PIP-24-024 | Hydrotest Line 24-XX | Hydrotest | Not started | 0 |
| PIP-30-005 / 006 / 007 | Weld Joint M-01-J1 / J2 / J3 (24″ manifold) | Welding | In progress | 0 each |
| CIV-15-001 | Pig Launcher Excavation | Trenching | Complete | 100 |

Logic: PIP-24-016 → **PIP-24-017** → PIP-24-018 → PIP-24-024 (all Finish-to-Start, no lag). Generate the remaining ~185 activities procedurally across the nine phases with plausible IDs, dates and dependencies.

### 9.4 Hero events

| ID | Source | Text | Match | Conf. | Queue state |
|---|---|---|---|---|---|
| E-2091 | Voice, Rahul Patil, 08:42 | "Line 24-XX ki spool 17 welding complete ho gayi hai." | PIP-24-017 | **94%** | Review (Logic Passed; accumulator 38 → 40%) |
| E-2092 | Voice, 09:17 | "KP 184.2 pe do sau meter trenching ho gayi." | CIV-12-003 | 78% | Review (accumulator +200 m; 92 → 96%) |
| E-2093 | Excel, Contractor B | "24XX-SP-012 Coating 100%" | PIP-24-018 | 82% | Review + **out-of-sequence** (PIP-24-017 incomplete) |
| E-2094 | Voice | "24 inch manifold ke saare joints weld ho gaye." | PIP-30-005/006/007 | 88% | Review (distribute) |
| E-2095 | Voice | "Pig launcher ki foundation ka PCC curing shuru hai." | none (best guess 41%) | 41% | Unmatched |
| E-2096 | Voice | "Kal se crane nahi aayi, lowering ruka hua hai." | PIP-24-021 | 90% | Delay — Equipment/crane |
| E-2097 / 2098 | Excel A / Excel B | Both "String Pipe Line 24-XX 100%" on different dates | PIP-24-010 | 96 / 96 | Warning — conflict |
| E-2103 | Voice | "Barish ki wajah se trench mein paani bhar gaya, kaam band." | CIV-12-003 | 84% | Delay — Weather |
| E-2104 | DPR PDF | "Coating work halted awaiting RFI-0387 approval on field joint coating spec." | PIP-24-018 | 91% | Delay — RFI |
| E-2101 / 2102 | Voice / Excel | "F/R/P chalu hai" · "SP-031 rework" | none | 52 / 47 | Unmatched |

**Counts on Home (snapshot `demo-start`):** Verified **47** · Review **12** (9 review-tier + 3 unmatched; 2 of the 12 carry warnings) · Delays **03**. Generate the remaining verified and review events procedurally across the last 7 days so every number is derived from the store, never hard-coded in a component.

**Matcher behavior:** deterministic scoring by token overlap with the dictionary, plus fixed overrides so the hero events return exactly the values above. A new supervisor report "Line 24-XX spool N welding complete" returns PIP-24-017 at `94 − (N mod 3)` %.

### 9.5 Delay causes (last 30 days)

| Category | Events | Days lost | Critical path |
|---|---|---|---|
| Equipment / crane | 9 | 11 | Yes (Lowering) |
| Weather | 7 | 6 | No |
| RFI / engineering | 5 | 4 | Yes (Coating) |
| Material | 3 | 3 | No |
| Permit / ROU | 2 | 2 | No |
| Manpower | 1 | 1 | No |

### 9.6 People and crews
Users per §5.1. Crews: **Piping Crew A** (Suresh Yadav, 18), **Welding Crew B** (Imran Sheikh, 14), **Civil Crew** (Dinesh Rathod, 26), **NDT & Coating** (Joseph D'Souza, 9). Contractors: Sterling Infra EPC; Rathi Welding Contractors. All fictional.

### 9.7 Project memory (synthetic, 3 past projects, 128 matched activities)
- Trenching, Jun–Sep: **+38%** duration vs plan (n = 41), dewatering and rain.
- Lowering-in with a single crane allocated: **+27%** (n = 19).
- Field-joint coating started with an open RFI: **+22%** (n = 14).
- Hydrotest: within **±5%** of plan (n = 12).

### 9.8 Audit seed
About 1,280 entries generated by replaying the seeded events, all hash-chained at seed time so **Verify chain** passes on first open.

---

## 10. Prompt pack

Paste one per Antigravity task, in order. Every prompt assumes `docs/SPEC.md`, `docs/RULES.md` and the reference image exist.

### P00 — Bootstrap

```text
TASK P00 — Bootstrap the project.
Read docs/SPEC.md §1, §8.

1. Create a Next.js (App Router) + TypeScript (strict) + Tailwind project in this folder.
2. Install: zustand, framer-motion, lucide-react, date-fns, d3-scale, d3-shape, idb,
   xlsx, pdfjs-dist, next-intl, a Serwist PWA plugin, @playwright/test, and the Radix
   primitives you need (dialog, tabs, popover, slider). Headless only. Do not add shadcn.
3. Create the exact folder structure in SPEC §8 (empty index files are fine).
4. Create the workspace Rule from SPEC §1 and save the same text to docs/RULES.md.
5. Create docs/PROGRESS.md with a checklist P00–P17.
6. Scripts: dev, build, typecheck, lint, test:e2e. Add .env.example with NEXT_PUBLIC_DEMO=true.
Do not build any UI.

Acceptance: dev server serves a blank page; typecheck, lint and build pass;
the folder tree matches SPEC §8.
```

### P01 — Design tokens, fonts, kit page

```text
TASK P01 — Design tokens and typography. Attach reference: docs/reference/ref-3-screens.png
Read docs/SPEC.md §4.1, §4.2, §4.3, §4.6.

1. src/design/tokens.css: every color, radius, shadow, spacing and type token from SPEC §4
   as CSS variables. Map them into Tailwind theme (colors, borderRadius, boxShadow,
   fontSize with line-height and tracking, fontFamily). No raw hex anywhere else.
2. src/design/fonts.ts: load Inter and JetBrains Mono with next/font as fallbacks behind
   the system stacks in SPEC §4.2. Enable tabular-nums globally.
3. Add one token --font-hero-num (defaults to the UI stack) so hero numerals can be flipped to mono.
4. Base styles: background --sb-bg, text --sb-ink, focus-visible ring (2px navy, 2px white offset),
   safe-area padding utilities, prefers-reduced-motion handling.
5. Create /dev/kit with sections: Colors, Type scale (every token with sample text),
   Radii, Shadows, Spacing. Nothing else yet.

Acceptance: /dev/kit shows every token; no gradients anywhere; the palette and type look
like the reference when placed side by side; contrast of ink-3 on white ≥ 4.5:1.
```

### P02 — UI primitives

```text
TASK P02 — Core UI primitives. Attach reference.
Read docs/SPEC.md §4.4, §4.5, §4.6 and §1 (BANNED).

Build in src/components/ui and src/components/domain, exactly as specified in §4.5:
Button (primary, outline, destructive-outline, loading, disabled), PillFilter, UnderlineTabs,
Segmented, SearchField, KpiTile, Chip (default, confirmed), StatusPill (all 7 statuses),
Sheet (grabber, drag to dismiss, focus trap), Dialog, Toast (with Undo), Skeleton, EmptyState,
FormField, PinInput, Avatar, Stepper, ProjectCard, EventRow, Waveform (static + live variants),
ConfidenceBadge, EvidenceChain, ScheduleContext, FreshnessClock, OfflineBanner.

Rules: token-only styling; every component has all interactive states; data-testid props;
keyboard operable; no gradients; no shimmer.
Add every component with all variants to /dev/kit.

Acceptance: /dev/kit at 390px shows KpiTile ×3, ProjectCard, EventRow ×2, StatusPill ×7,
ScheduleContext and EvidenceChain visually matching the reference crops. Sheet opens/closes
with drag and Esc. Report any component that deviates from the reference in PROGRESS.md.
```

### P03 — App shell, navigation, guards

```text
TASK P03 — App shell. Attach reference.
Read docs/SPEC.md §5, §7 (Device frame, Responsive).

1. DeviceFrame: on viewports > 500px render a 390×844 phone frame with rounded bezel,
   dynamic island and a 9:41 status bar (frame only). ?frame=off disables it. On real phones
   render nothing extra and honor safe-area insets.
2. BottomNav with the raised navy 64px center button (SPEC §4.5). Items and center action
   depend on role per SPEC §5.3. Active state per spec.
3. PageHeader variants: home header, back-title header, project header.
4. ProjectShell (hero photo + overlapping white panel + UnderlineTabs) used by S3 and PL3.
5. RoleGuard + route map for every route in SPEC §6. Unauthenticated users go to /welcome.
   A role visiting a route it cannot use is redirected to its Home. Controls a role cannot
   use are not rendered.
6. Stub every route with a titled placeholder that states its screen ID and purpose from
   SPEC §6, so navigation can be tested end to end.
7. Page transitions per SPEC §4.6.

Acceptance: switching the mocked role in /dev/roles changes bottom-nav items and center
action; every nav item lands on a real (stub) route; the shell at 390×844 matches the
reference bottom bar; no layout shift when the device frame toggles.
```

### P04 — Mock data layer

```text
TASK P04 — Mock services, stores, fixtures.
Read docs/SPEC.md §7, §8, §9 completely.

1. src/services: TypeScript interfaces and types for every service in SPEC §8.
2. src/mocks/clock.ts: demoNow() fixed at 20 Sep 2026 09:24 IST ticking in real time; setting to use real time.
3. src/mocks/fixtures: users, projects, phases, activities (the key activities in §9.3 plus
   ~185 generated), dependencies, teams, hero events (§9.4), delay causes, memory insights,
   dictionary, analytics constants (§9.2, §9.5). Seeded RNG so output is reproducible.
4. Snapshots: 'reference' (Home exactly as pictured: Welding — Line 24-XX 08:42 Verified) and
   'demo-start' (E-2091 pending). /dev/reset?snapshot=... resets localStorage and reloads.
5. matcher.ts and extractor.ts: deterministic, dictionary-driven, with the fixed hero
   overrides in §9.4 (94/78/82/88/41 etc.) and the 94 − (N mod 3) rule for new spool reports.
6. Zustand stores with persist for auth, project, events, activities, audit, ui, offline.
7. Audit chain: every mutation appends an entry with SHA-256 hash chaining (lib/hash.ts,
   SubtleCrypto). Seed ~1,280 entries chained at seed time.
8. Every service call waits 150–700ms and supports ?fail=<service>.
9. Derived selectors: verified/review/delay counts, freshness, physical %, SPI. No number
   may be hard-coded in a component.

Acceptance: a unit test proves counts 47 / 12 / 03 in demo-start; approving E-2091 makes
Verified 48, Review 11, resets freshness, and appends one audit entry; the chain verifies.
```

### P05 — Auth flow

```text
TASK P05 — Auth screens A1–A8. Attach reference (screen 1).
Read docs/SPEC.md §3 (Screen 1), §5.1, §6 A1–A8.

Build A1 Welcome as a pixel match of reference screen 1: full-bleed photo, thin overlay
headline, overlapping white sheet with grabber, logo lockup, headline, sub-copy, Get Started
pill, Log In link, hairline caption. Then A2 Intro, A3 Login, A4 Demo accounts sheet,
A5 Forgot PIN (3-step sheet), A6 Request access, A7 Project picker, A8 Permissions primer
(real browser mic prompt).

Behavior exactly as SPEC: 3-attempt lockout with 30s countdown, inline errors, language chip
switching UI strings, demo accounts signing in instantly, role-based landing, request
creating a REQ entry visible later in Admin.

Acceptance: A1 at 390×844 matches the reference with no gradients; every control in the
A-series tables does what the table says; sign-in as each of the 4 demo users lands on the
correct Home stub.
```

### P06 — Home for all four roles

```text
TASK P06 — Home screens SU1, PL1, PM1, AD1. Attach reference (screen 2).
Read docs/SPEC.md §3 (Screen 2), §6 SU1, PL1, PM1, AD1.

Build SU1 as a pixel match of reference screen 2 in snapshot 'reference': header, search,
pill tabs, KPI tiles, Active Project card with overlapping panel, Today's Events, bottom nav.
Then build the planner, PM and admin variants on the SAME skeleton with the content in the spec.

Every control must work: each pill swaps the body content (SU1: Progress, Tasks, Evidence
bodies; PL1: Queue, Alerts, Imports; PM1: Progress, Delays, Memory), KPI tiles navigate with the
right filter, See All links, search and filter icons, bell with unread dot, project name switcher.
All numbers come from store selectors.

Acceptance: overlay SU1 on the reference at 390×844: KPI tile size, project card proportions,
event rows and nav bar are within 4px; approving an event in another role (P10) updates counts
here without reload; the freshness clock ticks.
```

### P07 — Project detail (reference screen 3 shell)

```text
TASK P07 — S3 Project detail. Attach reference (screen 3).
Read docs/SPEC.md §3 (Screen 3), §6 S3, S4 (stub only), S5 (stub only).

Build ProjectShell content for tabs Overview, Activities (role-adaptive: for planners render a
placeholder region where Match Review will mount in P10; supervisors/PM/admin get the
read-only activity list), Evidence, Teams. Header actions: back, search, bell, ⋯ sheet.
Hero photo with configurable caption. Overlapping white panel with underline tabs.

Overview: physical 68% with planned marker, data date, freshness, forecast vs planned finish,
phase list (tap filters Activities), latest 3 delay alerts.
Evidence: filter chips + list/grid from the events store. Teams: crew cards + detail sheet with tel: link.

Acceptance: header + hero + tabs match the reference crop; every tab has real content; phase tap
filters the Activities list; Teams sheet opens and Call uses tel:.
```

### P08 — Time Agent (supervisor capture)

```text
TASK P08 — SU2 Capture. Read docs/SPEC.md §6 SU2, §8 (Voice), §9.4, §7 (Offline).

Implement the full state machine idle → listening → transcribing → transcript → clarify(≤2) →
confirm → submitting → submitted | queued.

- Real microphone recording with a live waveform (MediaRecorder + AnalyserNode), timer, 60s cap,
  stop by tapping the mic. Save the audio blob with the event so it can replay in S5.
- Transcription via VoiceService mock: example chips and scripted phrases return the hero
  transcripts; optional "Live transcription (experimental)" via Web Speech API.
- extractor.ts fills Action / Object / Location / Status / Quantity from the transcript
  (Hindi-English romanised keywords: complete/ho gayi/ho gaya/khatam → Completed,
  shuru/chalu/start → Started, ruka/nahi aayi/barish/RFI → Delay, "do sau meter" → 200 m).
  Missing Object/Location triggers exactly one clarifying question card with quick-reply chips
  and a mic reply (never a chat log).
- Confirm card with editable chips (picker sheets), Add photo (camera/gallery), Add note.
- Delay branch with required category chips.
- Submit writes an event (source VOICE, status Review or Verified by matcher/threshold rules) to
  the store, updates supervisor Home counts and the planner queue immediately.
- Offline: writes to the IndexedDB queue, shows the queued state; reconnect flushes it.
- Language chip sheet; Type instead mode; mic-denied fallback.
- Full-screen modal rising from the center button; large touch targets (≥ 56px), high contrast,
  readable in sunlight.

Acceptance: the phrase "Line 24-XX ki spool 18 welding complete ho gayi hai" yields chips
Welding / Spool 18 / Line 24-XX / Completed, submits, and appears in the planner queue
matched to PIP-24-017 at 93%; "Spool erection finished." triggers the Location question;
offline submission is queued and later synced.
```

### P09 — Reports, event detail, notifications

```text
TASK P09 — SU3, S5, S1 and the reply loop. Read docs/SPEC.md §6 SU3, S5, S1.

Build SU3 Reports (Mine/All crews, tabs Today/Drafts/Queued/History, filters, Sync now, Retry,
Delete, pull to refresh, all empty states). Build S5 Event detail with audio playback (real blob
for recordings; browser text-to-speech for fixture events), transcript + normalised text, chips,
match block, evidence chain, photos, and the Conversation thread. Build S1 Notifications.

Implement the reply loop end to end: planner "Ask supervisor" (from P10) sets the event to
Reply needed and creates a notification; the supervisor sees the banner in Reports and a
Reply action in S5; replying by voice or text attaches to the event and returns it to the
planner queue with the reply shown.

Acceptance: every status pill state appears with real data; playback works for fixtures and for
a fresh recording; reply loop works across a role switch without losing data.
```

### P10 — Planner Workbench and Match Review

```text
TASK P10 — PL2 queue and PL3 Match Review. Attach reference (screen 3).
Read docs/SPEC.md §3 (Screen 3), §6 PL2, PL3, §9.3–9.4.

Build PL2 (tabs Review/Unmatched/Warnings/Done, sort, filter, Select mode with Approve selected).
Build PL3 as a pixel match of reference screen 3 inside ProjectShell: title, red count line,
pager, FIELD EVIDENCE card (player, transcript, extracted chips), AI MATCH card (activity,
94% num-xl, reasons, Logic Check, Evidence Linked), Approve Match, Choose Another, Unmatched,
stat strip (live freshness), Schedule Context.

Implement every sheet and variant in the SPEC: Why 94%, Logic Check detail, Evidence chain,
transcript, chip edit (re-runs matching live), diff-preview approval sheet, Choose Another
(candidates + Browse schedule tree), Unmatched reasons with Ask supervisor / Request new activity /
Mark out-of-scope / Reject as duplicate, out-of-sequence, accumulator, distribute, unmatched,
conflict, loading, all-caught-up. Undo toast (8s) reversing the change and appending a
reversal audit entry. Keyboard A / C / U / J / K on desktop.

Approve must: set the event Verified, update activity progress, append a hash-chained audit entry,
reset Data Freshness to 00:00, update every count app-wide, advance to the next event.

Acceptance: overlay on the reference at 390×844 within 4px on card proportions and button rows;
approving E-2091 changes PIP-24-017 from 38% to 40% and the Home counts; out-of-sequence E-2093
cannot be approved without an override reason; every button in the PL3 tables works.
```

### P11 — Schedule, activity detail, search

```text
TASK P11 — S6 Schedule, S4 Activity detail, S2 Search. Read docs/SPEC.md §6 S2, S4, S6.

S6: List (collapsible WBS tree) and Gantt-lite (SVG or CSS grid; sticky left column, horizontal
scroll, planned grey bar, actual navy bar, forecast outline, Data Date line, critical red
outline, Week/Month zoom), toggles Critical / Late / My work packages.
S4: tabs Overview, Progress (accumulator meter + contributing events), Logic (predecessors and
successors with relationship type and lag), History (audit). Planner: Adjust % complete with a
required reason. Supervisor: Report progress → SU2 prefilled.
S2: autofocus, recents, dictionary-aware results ("hydro" finds Hydrotest), Activities/Events
segmented, filter sheet, supervisor Report button.
Also implement the "View in P6" in-app network view used by PL3.

Acceptance: every row/bar opens S4; Logic tab nodes navigate; Adjust % writes an audit entry;
searching "hydro" returns PIP-24-024.
```

### P12 — Ingest and export

```text
TASK P12 — PL4, PL5, PL6, PL7, PL8. Read docs/SPEC.md §6 PL4–PL8, §8, §9.

PL4 sheet. PL5 Excel mapper: real .xlsx/.csv parsing with SheetJS, sample file fallback, column
mapping with suggestions, preview, processing progress, summary, events created in the store.
PL6 DPR review: pdf.js rendering, selectable extracted statements, Send to matching.
PL7 XER import: write a small XER parser (tab-delimited, %T table headers) for PROJECT, PROJWBS,
TASK, TASKPRED; real files show real counts; sample baseline fallback; confirm dialog; result
loads the schedule store.
PL8 Export: scope + format, preview diff table with row checkboxes and override flags, real CSV
download in the browser (XER beta = TASK table rows only), export history with re-download.
Add sample files to public/sample/.

Acceptance: uploading the sample Excel creates events visible in PL2; importing the sample .xer
updates counts on S6; Generate file downloads a valid CSV with the approved changes only;
no duration-percent field appears anywhere.
```

### P13 — PM analytics, Ask, delay detail

```text
TASK P13 — PM2, PM3, PM4. Read docs/SPEC.md §6 PM2–PM4, §9.2, §9.5, §9.7.

Charts are hand-built SVG using d3-scale and d3-shape only. No chart library, no donut/pie,
no gradients.
PM2 tabs: Progress (S-curve with planned/actual lines, Data Date line, touch scrubber, three
numerals, phase table), Truth Gap (paired bars, sentence, drill-down sheet), Delays (ranked
bars, critical-path tag, period toggle), Memory (insight cards, table, season filter, detail sheet,
CSV export). PM3 Ask: six keyword-routed handlers over the store with answer cards and open-in
buttons; unsupported questions get the supported-topics message. PM4 Delay detail with the
three sections and CSV download.

Acceptance: 68 / 71 / 74 / SPI 0.92 agree across Home, Overview and Analytics; every drill-down
opens real data; Ask answers all six suggested questions from live store data.
```

### P14 — Audit, profile, settings, admin

```text
TASK P14 — S7, S8, S9, AD1–AD4. Read docs/SPEC.md §6 S7–S9, AD1–AD4, §7 (Audit chain).

S7 Audit trail with filters, Export CSV, Verify chain (SHA-256 recompute in the browser, green
success / red break with jump-to-entry), dev-only Tamper button.
S8 Profile with role-specific stats, Switch demo user (keeps data), Sign out dialog.
S9 Settings including Matching rules sliders that immediately change tier assignments and the
tier preview bar, locked info rows, Simulate offline, Reset demo data.
AD1–AD4: users, requests (including those created in A6), roles matrix, invite sheet,
dictionary with Test a phrase (edits change matcher output), projects and baselines.

Acceptance: moving Auto-accept to 90 re-tiers events in the queue; Tamper then Verify chain
reports the break; a request created in A6 appears in AD2 and can be approved.
```

### P15 — Desktop / tablet layouts

```text
TASK P15 — Responsive layouts. Read docs/SPEC.md §7 (Responsive).

At ≥ 1024px for Planner, PM and Admin: replace bottom nav with a left rail (icon + label,
same items and center action), Workbench becomes two-pane (queue left, Match Review right, no
navigation on row click), Gantt uses full width, analytics use a 2-column grid, sheets become
right-side panels or centered dialogs. Supervisors remain in the phone layout inside the device frame.
Keep every token, radius and motif from the phone design.

Acceptance: no horizontal page scroll from 360px to 1920px; keyboard shortcuts work in the
dual-pane workbench; the same store drives both layouts.
```

### P16 — Offline, i18n, accessibility

```text
TASK P16 — PWA, EN/HI, a11y. Read docs/SPEC.md §7.

1. PWA: manifest (name SchedBridge AI, navy theme color, maskable icons), service worker
   caching the app shell and static assets, offline page, install prompt handling.
2. Offline queue polish: banner, per-item retry, auto flush on reconnect, toasts.
3. i18n: en.json and hi.json for Auth, SU1, SU2, SU3, S1, S8, S9; language switch applies
   instantly and persists.
4. Accessibility pass: labels on every icon button, focus order, focus trap and restore for
   sheets, contrast check, reduced motion, KPI announcements, no color-only status.
5. Large text setting scales the UI without breaking layouts.

Acceptance: app loads offline after first visit; capture works with the network off; switching to
Hindi changes all listed screens; axe reports no serious violations on Home, Capture, Match Review.
```

### P17 — QA, pixel comparison, dead-control sweep

```text
TASK P17 — QA. Attach reference.

1. Pixel comparison: capture SU1 (snapshot 'reference'), A1 and PL3 at 390×844 and produce a
   side-by-side against the reference crops. List every deviation over 4px and fix them.
2. Dead-control sweep: Playwright test tests/e2e/dead-controls.spec.ts that, for each role,
   visits every reachable screen, clicks every button/tab/chip/pill/row, and fails if a click
   produces no DOM, route, store or download change. Fix every failure.
3. Demo path test tests/e2e/demo-path.spec.ts implementing SPEC §11 (steps 1–9).
4. Grep the codebase for: gradient, linear-gradient, radial-gradient, console.log, alert(,
   href="#", "coming soon", TODO. Remove all except documented TODOs in PROGRESS.md.
5. Check the banned list in RULES: blur/glass, glow, sparkle icons, emoji in UI.
6. Performance: Lighthouse mobile ≥ 90 on Home; no layout shift on nav.

Deliver a QA report in docs/QA.md: deviations fixed, deviations accepted (with reason), remaining risks.
```

### Fix-list template (use after any prompt)

```text
FIX LIST — compare the running app at 390×844 with docs/reference/ref-3-screens.png (screen N).
Deviations:
1) <element> — reference: <what it looks like>; mine: <what it looks like>
2) ...
Fix only these items. Do not touch other files. Screenshot afterwards and list any remaining deviations.
```

---

## 11. Acceptance checklist and demo click-path

### 11.1 Global acceptance

- [ ] Home (`reference` snapshot), Welcome and Match Review overlay the reference within 4px.
- [ ] No gradient, blur, glow, sparkle, emoji, or shimmer anywhere.
- [ ] Every control in every screen table works. Dead-control test passes for all four roles.
- [ ] Numbers agree everywhere: 47 / 12 / 03, 68%, 74%, 0.92, 71%, 00:03.
- [ ] Approve Match changes the activity, the audit chain, the counts, the freshness clock and the export preview.
- [ ] Verify chain passes on a fresh load and fails after Tamper.
- [ ] Offline capture queues and syncs.
- [ ] A supervisor cannot see any planner-only control, and vice versa.
- [ ] Every screen has loading, empty and error states.

### 11.2 Three-minute demo path (single browser; data persists across role switches)

1. `/dev/reset?snapshot=demo-start` → **Welcome** → **Log In** → **Demo accounts** → *Rahul Patil*.
2. **Home** (47 / 12 / 03) → tap the mic → tap the example chip "Spool 17 welding done" (or speak Hindi/English) → confirm chips → **Submit**.
3. **Profile → Switch demo user** → *Meera Nair (Planner)*.
4. **Home** shows Review 13 → **Workbench** → open the new event → **Match Review**: play the recording, tap **94%**, tap **Logic Check**, tap the reason chips.
5. **Approve Match** → diff sheet → **Confirm approval** → freshness resets to 00:00, toast with Undo.
6. Open **E-2093** (out-of-sequence) → show the Retained Logic banner → **Hold & ask supervisor**.
7. **Export** → preview diff → **Generate file** → CSV downloads.
8. **Audit → Verify chain** → intact.
9. **Switch demo user** → *Arvind Deshmukh (PM)* → **Analytics**: S-curve → Truth Gap → Delays → Memory.
