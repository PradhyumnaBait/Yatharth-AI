# SchedBridge AI — Backend Architecture, Contracts & Antigravity Prompt Pack (v2)

## 0. Revision Notes — what changed from v1, and why

v1 (`docs/BACKEND_PLAN.md`) was architecturally sound. Two independent reviews since then changed what "done" means, and this revision folds both in:

**A. The audit of the actual prototype repo** found that the shipped build has *zero* real AI behind it: the matcher is ~10 hardcoded `text.includes(...)` checks, the voice recorder captures real audio and then discards it in favor of a fixed canned transcript regardless of what was said, the audit chain only exists client-side, and the CSV export hardcodes the same `38→40` delta on every row. None of this contradicts v1 — v1 already specified a real backend, real embeddings, and a server-side audit chain — but v1 didn't say anything explicit about **what the system must never do**: fabricate a transcript, fabricate a match, or present a mocked result as if it were real without saying so. That's a gap in the *contract*, not just the implementation, so it needed to become an explicit, testable rule. See **D18 (Anti-Fabrication Guarantee)** and the new rows in §17/§20/§27.

**B. Two rounds of your own thinking on zero-shot contextualization and cross-sector jargon** proposed three things v1 didn't fully cover:
1. **Namespace-isolated embeddings with rich contextual strings** (`Project > Zone > Discipline > Activity`) instead of bare activity names — v1's `activities.embedding` existed but the text fed into it was underspecified. Now specified in §8 and **D21**.
2. **Hybrid dense + sparse retrieval (RRF)**, not vector search alone — catches exact WBS codes, activity IDs, and acronyms that embeddings alone can miss or over-generalize. New in §8 and **D19**.
3. **A three-tier, self-learning jargon dictionary** — v1's `dictionary_terms` table already covered Tier 1 (auto-mined from the schedule) and Tier 2 (planner bootstrap), but had no Tier 3: when a planner manually resolves an "Unmatched" event via Choose Another, that correction should be captured as a new synonym so the same slang is recognized automatically next time. This was completely absent from v1. New in §5, §8, §10, and **D19/D22**.

Everything else below is v1, reproduced in full, with these changes woven in at the exact sections they touch. Sections with no substantive change are marked **(unchanged from v1)** and kept short; sections that changed are written out in full. Nothing was silently dropped — every v1 table, decision, and phase still exists below, either as-is or explicitly amended.

**New/changed decision items at a glance:** D18 (Anti-Fabrication Guarantee), D19 (Hybrid Dense+Sparse Retrieval), D20 (Continuous Active-Learning Dictionary / Tier 3), D21 (Contextual Embedding Text / Namespace Isolation), D22 (Demo-Mode Disclosure Banner). Two new phases: **Phase 09a (Contextual Embedding Text Generation)** folded into Phase 09, and **Phase 11a (Active-Learning Feedback Loop)** inserted after Phase 14.

---

## 1. EXECUTIVE BACKEND PLAN

**(unchanged from v1, with one addition, bolded below)**

One FastAPI service, one PostgreSQL (Supabase) database with `pgvector`, and a thin provider-abstraction layer for the three swappable AI calls (ASR, extraction, embeddings). No Redis, no Celery, no Kubernetes for MVP — background work runs as FastAPI `BackgroundTasks` against the same process.

The frontend already talks to a service-interface layer, not to concrete implementations (`docs/SPEC.md §8`: `AuthService`, `ScheduleService`, `EventService`, `MatchService`, `VoiceService`, `ExtractionService`, `IngestService`, `ExportService`, `AnalyticsService`, `AuditService`, `NotificationService`, `AdminService`). "Connecting the backend" is mechanically: implement one HTTP-backed class per interface with identical method signatures, swap it in behind a feature flag — no UI redesign.

**Added in v2:** every provider call in this system (ASR, extraction, embedding, reranking) has exactly one legitimate failure behavior — a typed, visible failure state — and exactly zero legitimate "silently substitute a plausible-looking canned result" behaviors. This is now a cross-cutting constraint on every phase in §25, not just a note in the failure-modes table. It exists because the audited prototype's single most damaging behavior was a microphone that recorded real audio and displayed a fixed, unrelated transcript regardless of what was said — a visible, provable falsehood in front of the exact audience the product exists to convince. The backend must make that failure mode structurally impossible, not just discouraged.

Priority order when frontend contract, report vocabulary, and best practice disagree: **(1)** `docs/SPEC.md`, **(2)** the research report's domain vocabulary/constraints, **(3)** general best practice. Disagreements are logged in §23.

---

## 2. CURRENT FRONTEND AUDIT (spec-based)

**(unchanged from v1 — full table and gap lists carried forward as-is)**

Roles: 4 (Supervisor, Planner, PM, Admin). ~34 routes under `src/app/(app)/`, role-gated. 13 service interfaces in `src/services/*`, mocked with 150–700ms latency and a `?fail=` switch. Zustand stores persisted to `localStorage` in mock mode. Business-ID + UUID dual identity scheme. Real `MediaRecorder` voice capture. Client-side preview parsers for Excel/DPR/XER with server-side counterparts required. Confidence UI is a stable, computation-agnostic shape. Client-side `SubtleCrypto` audit verify is explicitly not a trust boundary (see D8/D18). `/dev/*` surfaces gated behind `NEXT_PUBLIC_DEMO`, no production equivalent.

Frontend-only additions not in the backend brief: Admin role/screens (D2), SSO button (D14), "View in P6" (D15), XER-beta export scoping (D7), Undo (D6), manual "Adjust % complete", reply loop, offline drafts/sync (D11).

Report-only features not in the frontend: GPS tagging, voice biometrics, cross-project benchmarking, live weather-API join — all deferred, none MVP.

---

## 3. FRONTEND → BACKEND CONTRACT MAP

**(unchanged from v1 — all 25 rows carried forward verbatim; see the original table.)** No new frontend-facing routes were added by this revision — the hybrid-search and active-learning changes are internal to the matching pipeline (Section 8) and surface through the *existing* `MatchService`/`AdminService` endpoints, not new ones. This is deliberate: per the standing rule "do not redesign existing approved frontend UI," the smarter matcher must be invisible as a contract change and visible only as better results.

---

## 4. TARGET SYSTEM ARCHITECTURE

Updated to show the two new internal loops (hybrid retrieval, active-learning write-back). Nothing crosses the frontend boundary.

```
┌──────────────────────────┐        ┌───────────────────────────────────────┐
│  Next.js frontend          │        │  FastAPI backend (single service)      │
│  (unchanged, per SPEC)      │  HTTPS │                                         │
│  src/services/* — 13        │───────▶│  api/v1/*  routers, one per SPEC       │
│  interfaces, HTTP client     │◀───────│  service interface                     │
│  implementations behind      │  JSON  │                                         │
│  existing types               │        │  domain/  (pure business logic)        │
└──────────────────────────┘        │                                         │
                                       │  providers/ (ASR, Extraction, Embedding, │
                                       │   Reranker — each behind an interface;   │
                                       │   NEVER a silent fallback to canned data)│
                                       │                                         │
                                       │  matching/  hybrid retrieval:            │
                                       │   dense (pgvector cosine) +               │
                                       │   sparse (Postgres full-text / tsvector) │
                                       │   combined via Reciprocal Rank Fusion    │
                                       │                                         │
                                       │  dictionary/ 3-tier jargon store:        │
                                       │   Tier 1 auto-mined, Tier 2 planner      │
                                       │   bootstrap, Tier 3 active-learned from  │
                                       │   planner corrections (write path only   │
                                       │   from Workbench "Choose Another")       │
                                       │                                         │
                                       │  BackgroundTasks: matching pipeline,     │
                                       │  XER/Excel/DPR parsing, audit hash       │
                                       │  writes, memory rollup, embedding        │
                                       │  backfill, dictionary re-index           │
                                       └───────────────┬─────────────────────────┘
                                                        │
                                       ┌────────────────▼─────────────────┐
                                       │  PostgreSQL (Supabase) + pgvector │
                                       │  + tsvector full-text index       │
                                       │  Object storage for evidence      │
                                       │  files: audio, photos, PDFs, xlsx │
                                       └────────────────────────────────────┘
```

Layering rule unchanged: `api/` → `domain/` → `providers/*` only through interfaces defined in `domain/`, selected once at startup from config.

---

## 5. DATABASE ARCHITECTURE

**27 tables total in v1's accounting → 28 in v2** (one addition: `dictionary_term_sources`, explained below; everything else is additive columns on existing tables, not new tables). Conventions unchanged: `uuid` PKs, `created_at timestamptz default now()`, FKs `on delete restrict` by default, append-only philosophy.

### 5.1 MVP-required tables — **(unchanged from v1)**

`users`, `project_members`, `projects`, `schedules`, `wbs_nodes`, `activity_relationships`, `field_reports`, `extracted_events`, `activity_matches`, `match_candidates`, `progress_events`, `review_actions`, `audit_logs`, `evidence`, `imports`, `exports`, `export_items`, `matching_config`, `sessions` — all exactly as specified in v1. Full field-by-field spec is unchanged; see v1 text if needed. Two tables in this list get **new columns**, listed below rather than repeated in full.

**`activities` — amended.** All v1 fields unchanged, plus:
- `embedding_context_text` (text, nullable) — the rich, hierarchy-aware string actually fed to the embedding model (e.g. `"Project: Kandla–Panipat Pipeline > WBS: North Zone > Discipline: Piping > Activity: Erect Line 24-XX (Spool Welding)"`), stored so retrieval is auditable and re-embeddable without recomputation from scratch. This is what **D21** requires — embeddings must never be generated from the bare `name` column alone.
- `search_tsv` (`tsvector`, generated column, indexed with GIN) — the sparse/full-text counterpart to `embedding`, built from `external_task_id`, `name`, `discipline`, and normalized `dictionary_terms` synonyms. This is what **D19**'s hybrid retrieval reads from.

**`dictionary_terms` — amended.** All v1 fields unchanged (`term`, `canonical`, `category`, project-scoped or global), plus:
- `source` (enum: `SCHEDULE_MINED` / `PLANNER_BOOTSTRAP` / `ACTIVE_LEARNED`, default `PLANNER_BOOTSTRAP`) — which of the three tiers produced this row. This is the field that makes Tier 1/2/3 queryable and auditable rather than an informal convention.
- `confidence` (numeric, nullable) — only set for `ACTIVE_LEARNED` rows; starts low and is not treated as ground truth until reinforced (see 5.2 below).
- `learned_from_match_id` (nullable FK → `activity_matches`) — for `ACTIVE_LEARNED` rows, the exact Choose-Another decision that produced this synonym, so a bad auto-learned mapping can be traced back and manually revoked without guessing where it came from.

### 5.2 New table: `dictionary_term_sources`

**Purpose:** Tier 3 (active learning) must not let a single planner's one-off correction instantly become a trusted global synonym — that would let one mistaken Choose-Another silently mis-route every future report using that phrase. This table is the reinforcement ledger: every time the *same* candidate synonym→activity(or synonym→discipline/canonical) mapping is independently confirmed by a **second, different** planner action, a row is added here; `dictionary_terms.confidence` only crosses the threshold that makes a Tier-3 term active in matching once it has **2 independent corroborating occurrences** from different `actor_id`s (configurable via `matching_config`, default 2). PK `id`. FK `dictionary_term_id`, `activity_match_id`, `actor_id`. Unique `(dictionary_term_id, activity_match_id)` — the same match can't corroborate the same term twice. This directly answers the "how does the system avoid learning garbage from one bad click" question the RAG proposal didn't fully resolve.

### 5.3 `activity_progress_units` sub-ledger — **(unchanged from v1)**

### 5.4 Should-have-if-stable — **(unchanged from v1)**: `notifications`, `conversation_messages`, `access_requests`.

### 5.5 Future / deferred / explicitly rejected — **(unchanged from v1)**: `project_memory_insights` (MVP-lite batch only), `delay_events` (rejected, D12), `sync_queue` (rejected, D11).

---

## 6. AI / NLP PIPELINE

**(v1 table unchanged in structure; three rows amended, shown in full below with changes marked)**

| Stage | Input | Output | Validation | Failure behavior | Retry | Timeout | Persistence |
|---|---|---|---|---|---|---|---|
| Ingestion | audio blob / typed text / PDF / Excel row | `field_reports` row, `status=RECEIVED` | file type/size caps | reject with typed error, no partial row | n/a | n/a | immediate write |
| **ASR (voice only) — amended** | audio evidence ref | transcript + detected language | non-empty, min duration 1s | **`status=FAILED` on any transcription failure or empty result. Under no circumstance does the backend return a transcript that was not derived from the submitted audio — there is no default/fallback/example transcript anywhere in this code path (D18). User sees "Couldn't transcribe — try again or type it."** | 1 automatic retry on transport error only | 8s | `field_reports.raw_text`, `status=TRANSCRIBED` |
| Normalization | raw_text | normalized_text (dictionary substitutions) | none (deterministic) | never fails | n/a | n/a | computed on the fly from `dictionary_terms`, **now including active-learned (Tier 3) terms whose confidence has crossed the corroboration threshold — see §5.2** |
| Extraction | normalized_text | strict JSON per schema | Pydantic schema validation | on schema violation: 1 repair retry, then `status=FAILED` routed to manual entry — **never a default/placeholder payload (D18)** | 1 repair retry | 6s | `extracted_events` row |
| Discipline filter | discipline (if present) | reduced candidate set | skipped if low-confidence | never blocks | n/a | n/a | not persisted |
| **Candidate retrieval — amended, now hybrid** | search string (action+object+location) + `embedding_context_text` corpus | top-K `match_candidates` by **Reciprocal Rank Fusion of dense cosine similarity and sparse full-text rank (D19)** | activity embeddings AND `search_tsv` must exist for the schedule | if neither index is populated for the schedule: hard error, not silent empty result | n/a | 3s | `match_candidates` rows, tagged with which retrieval path(s) surfaced each candidate |
| Reranking | top-K + raw context | ordered candidates + `rerank_score` + reason text | reason text must reference actual matched tokens | fall back to fused-retrieval order with `rerank_unavailable=true`, never hidden | 1 retry | 5s | `match_candidates.rerank_score`/`reasons` |
| Logic validation | best candidate | PASSED/WARNING/FAILED | see §9 | never blocks the row from appearing | n/a | n/a | `activity_matches.logic_check_result` |
| Confidence & routing | rerank_score + logic result | AUTO_ACCEPT/REVIEW/UNMATCHED | reads `matching_config` | — | n/a | n/a | `activity_matches.decision_tier`, frozen at write time |
| Auto-accept execution | AUTO_ACCEPT | progress event created | never for actual_finish-setting events (D1) | — | n/a | n/a | `progress_events` + system `review_actions` row |
| **Active-learning write-back — new stage** | a Choose-Another or manual-search resolution on a PENDING/UNMATCHED match | candidate `dictionary_terms` row (or a corroboration row in `dictionary_term_sources`) | the resolved phrase must differ from the activity's existing canonical/synonym set (no duplicate learning) | never blocks the planner's action — learning is fire-and-forget, always asynchronous | n/a | n/a | `dictionary_terms` (source=ACTIVE_LEARNED) + `dictionary_term_sources` |

`pipeline_run_id` propagation unchanged from v1 (§19).

---

## 7. TIME AGENT STATE MACHINE

**(unchanged from v1)**, with one explicit addition: the `transcript` field passed into `POST /api/v1/time-agent/turn` must always be the field report's own `raw_text` as written by the real ASR stage in §6 — the endpoint has no code path that accepts or generates a substitute transcript, closing off the exact failure class the audit found (D18).

---

## 8. MATCHING ENGINE

Rewritten in full — this is the section most changed by both reviews.

1. **Normalize** raw extraction against `dictionary_terms` — now across **all three tiers** (Tier 1 schedule-mined, Tier 2 planner-bootstrapped, Tier 3 active-learned above its corroboration threshold). Sub-threshold Tier 3 candidates are available to *suggest* but never silently substituted into the normalized text.
2. **Discipline filter** — unchanged from v1: skipped, not guessed, when extraction confidence on discipline is low.
3. **Structured constraints** — unchanged: exclude 100%-complete activities (unless correction), exclude activities outside the current schedule.
4. **Contextual embedding text generation (new, D21)** — every activity's embedding is computed not from its bare `name` but from `activities.embedding_context_text`: a generated string of the form `Project: {project.name} > WBS: {wbs path} > Discipline: {discipline} > Activity: {name} ({external_task_id})`. This is what makes retrieval **namespace-isolated by construction**: cosine similarity is only ever computed within one project's activity set (the query already filters by `schedule_id`), and the richer string means "Spool 17" resolves correctly even across two different pipeline projects that both have a "Spool 17," because the surrounding project/zone/discipline context disambiguates them. Regenerated whenever `wbs_nodes.path`, `activities.name`, or `discipline` changes; triggers a re-embed via the Phase 09 backfill job, never a lazy on-request recompute.
5. **Hybrid retrieval (new, D19)** — two parallel retrievals against the same candidate pool, both scoped to the current schedule:
   - **Dense**: cosine similarity over `activities.embedding` (pgvector HNSW), top 10.
   - **Sparse**: Postgres full-text rank over `activities.search_tsv` (GIN index), top 10 — this is what catches an exact WBS code, activity ID, or a rare acronym that an embedding might blur into a semantically-similar-but-wrong neighbor.
   - **Fusion**: the two ranked lists are combined via **Reciprocal Rank Fusion** — `score(activity) = Σ 1/(k + rank_i)` across whichever list(s) it appears in, `k=60` (a standard RRF constant, tunable via `matching_config` only if a future phase needs it, not hardcoded in query logic) — producing one fused top-5 list. An activity found by both retrievals ranks higher than one found by only one, by construction. This directly answers the concern that "fuzzy jargon" specific to a site/sector might not be well-represented in a general-purpose embedding space — the sparse leg is the safety net for exactly that case.
6. **Reranking** — unchanged from v1: a second, cheaper LLM call scores the fused top-5 against raw field context and produces the reason chips the UI renders directly.
7. **Schedule/logic checks** — unchanged from v1 (§9).
8. **Confidence calculation** — unchanged from v1: rerank_score with a logic-check penalty subtracted before tiering.
9. **Explanation generation** — unchanged from v1: reused from the rerank stage, never regenerated separately.
10. **Decision routing** — unchanged from v1 (D1, frozen at write time).
11. **Active-learning write-back (new, D20/D22)** — when a planner resolves an event via **Choose Another** (an AI-suggested match was wrong, planner picked a different activity) or **manual search on an Unmatched event**, the domain layer extracts the distinguishing phrase from the original field report (the slang/jargon token that didn't match well) and proposes a `dictionary_terms` row (`source=ACTIVE_LEARNED`, mapping that phrase to the chosen activity's canonical term or discipline). This row is written immediately but starts **inactive for matching purposes** until a second, independent planner action corroborates the same phrase→activity mapping (§5.2's `dictionary_term_sources` — this is the mechanism, described only at a high level in the original proposal, that prevents one mistaken click from corrupting the shared dictionary). Nothing here ever mutates `activity_matches` after the fact — this is purely additive dictionary growth, consistent with the append-only philosophy in §5.

**Many-to-one / distribute case** — unchanged from v1: one `extracted_event` can spawn multiple `activity_matches` rows via a plain FK, powering PL3's Distribute variant.

---

## 9. SCHEDULE LOGIC ENGINE

**(unchanged from v1)** — the 5-check table (predecessor completion, already-complete, duplicate unit, date sanity, physical quantity basis) is carried forward exactly. Nothing in this engine ever writes to `activities` directly; only the approval endpoint (Phase 14) does, and only after these checks pass or are explicitly overridden.

---

## 10. HUMAN-IN-THE-LOOP WORKFLOW

**(unchanged from v1)**, plus: **Choose Another** and **Unmatched → manual search** now carry a second responsibility beyond their v1 behavior — triggering the §8-stage-11 active-learning write-back. This is invisible to the planner (no new UI, no new confirmation step — consistent with "no UI redesign, ever") and is fire-and-forget: if the learning write fails for any reason, the planner's actual approve/reject/choose-another action still succeeds and is still audited exactly as in v1. Learning is a side effect of a decision, never a precondition for it.

---

## 11. EVIDENCE + AUDIT ARCHITECTURE

**(unchanged from v1 in design; the "why this matters" framing is sharpened given the audit)**

The chain is computed server-side, not client-side (D8) — the audit of the prototype found the client-side `SubtleCrypto` recompute was the *only* verification path in the shipped build, which means anyone with devtools could rewrite the chain and it would still "verify." That finding is exactly the risk D8 was already written to prevent; this revision doesn't change the design, it just confirms the design was correct and flags that **implementation must not regress to the client-only version under demo-deadline pressure** — Phase 15's acceptance criteria (deliberately corrupting a stored entry and confirming `/audit/verify` catches it) exists specifically to make that regression untestable-as-passing.

Every other detail — transactional co-write with the domain mutation, row-locked `sequence_no`, `entry_hash = SHA256(prev_hash || canonical_json(payload))`, "tamper-evident" not "immutable" honesty constraint, lineage-by-construction via the FK chain — carries forward from v1 unchanged.

---

## 12. AUTH + RBAC

**(unchanged from v1)** — JWT + rotating refresh, Argon2id PINs, server-side login lockout, per-request membership re-check, 4 roles (D2), SSO returns `501` (D14), server-side logout revocation.

---

## 13. FILE / XER / EXCEL / PDF INGESTION

**(unchanged from v1)** — XER carry-forward reconciliation (D10), two-phase Excel preview/commit, DPR PDF segmentation-then-select, voice evidence stored independent of transcription success. One addition: successful XER/Excel/DPR imports that create or rename activities now also (re)populate `embedding_context_text` and `search_tsv` for the affected rows as part of the same import transaction's follow-up background task (Phase 09), so newly imported activities are matchable via both retrieval legs without a separate manual trigger.

---

## 14. ANALYTICS

**(unchanged from v1)** — every metric has one reproducible SQL source, none hardcoded, none cached indefinitely without invalidation. `delay_events` stays a derived view (D12), not a table.

---

## 15. OFFLINE SYNC

**(unchanged from v1)** — `client_event_id` idempotency, batch sync endpoint, no server-side `sync_queue` table (D11), idempotency extends through the whole pipeline including the new hybrid-retrieval and active-learning stages (a retried submission never re-triggers a second learning write-back for the same resolved match).

---

## 16. API CONTRACTS

**(unchanged from v1 — every route in the original §16 table carries forward with identical request/response shapes)**. This is a deliberate design property of v2: the hybrid retrieval and active-learning changes are internal to `domain/matching/` and `domain/dictionary/` and do not require new endpoints. The only surface-level addition is informational, not a new route: `/admin/dictionary` (already in v1's AdminService table) now also returns `source` and `confidence` per term, and `/workbench/{eventId}/why` (already in v1's MatchService table) now includes which retrieval leg(s) — dense, sparse, or both — surfaced each candidate, so the confidence-factor breakdown a planner already sees is more informative without being a new screen.

---

## 17. FAILURE MODES + RECOVERY

**(v1 table unchanged; two rows added below, both directly answering audit findings)**

| Failure | User experience | Backend state | Retry | Logging | Recovery |
|---|---|---|---|---|---|
| *(all 17 v1 rows carried forward unchanged — ASR failure, extraction schema violation, no candidate found, conflicting candidates, wrong discipline, duplicate field report, already-completed activity, out-of-sequence, invalid XER, malformed Excel, PDF extraction failure, database failure, external AI provider down, auth failure, permission failure, corrupted evidence, export failure)* | | | | | |
| **New — Fabricated-output attempt (D18)** | Never user-visible as a distinct state; this row exists as an engineering invariant, not a UX state | Any code path that would return a transcript not derived from the submitted audio, or a match not derived from a real retrieval/rerank call, is a **build-time contract violation**, not a runtime failure mode — enforced by Phase 22's anti-fabrication test suite, not by a try/catch | n/a | CI fails the build | fix the code path before merge |
| **New — Provider unavailable during a live/demo session** | A clearly labeled "AI temporarily unavailable — entries saved for manual review" banner, distinct from a normal FAILED state, so a demo audience sees an honest degraded-mode message rather than nothing or a fake success | `field_reports.status=FAILED` with a `degraded_mode=true` flag; nothing auto-approved, nothing fabricated | provider circuit breaker per v1 §17 | provider health surfaced on `/health` | manual entry fallback, same as ASR/extraction failure |

---

## 18. SECURITY

**(unchanged from v1)** — secrets in env only, file-upload validation, parameterized queries, rate limiting, CORS lock, PII handling, enumeration protection, tenant isolation, explicit non-claims (no compliance cert, no field-level encryption beyond Supabase defaults). One addition, directly from the audit's finding that the prototype's "prototype build" disclosure was buried in Settings → About with nothing in the primary flow:

**D22 — Demo-mode disclosure, enforced server-side, not just in UI copy.** Any response served while `DEMO_MODE=true` (Phase 21's seed/reset environment) includes a response header (e.g. `X-SchedBridge-Mode: demo`) that the frontend's existing generic response handler can surface as a persistent, non-dismissible banner across the primary flow (Welcome → Home → Capture → Match Review), not only in Settings. This doesn't change what's real vs. mocked (by MVP, everything server-side described in this document is real, not mocked) — it exists so that if a provider is ever in degraded/fallback mode (§17's new row) during a live demo, that fact is visible where the audience is looking, not buried three taps deep.

---

## 19. OBSERVABILITY

**(unchanged from v1)** — `request_id`, `pipeline_run_id`, `import_id`, audit `sequence_no` propagated per v1. One addition: `pipeline_run_id`'s trace now also includes which retrieval leg(s) (dense/sparse) contributed to the final candidate set and whether an active-learning write-back fired, so a field report's full journey — including "did this get matched partly because of a term someone taught the system three weeks ago" — is traceable by the same one ID as everything else in v1.

---

## 20. TESTING STRATEGY

**(v1's Unit/Integration/E2E/Synthetic-case structure unchanged; new test category added)**

**New — Anti-fabrication tests (directly from the audit's central finding).** These are not integration tests of a feature; they are negative tests asserting an entire class of behavior is structurally absent:
- Mock the ASR provider to time out or return empty → assert the response is `status=FAILED` with no `raw_text` populated, and specifically assert the response body does **not** equal any of the fixture transcripts used elsewhere in the test suite (a regression guard against literally the bug the audit found — a hardcoded fallback string that happens to match a demo fixture).
- Submit a field report using a deliberately novel, never-seen-before phrase (not one of the synthetic seed phrases) → assert the pipeline either produces a genuine fused-retrieval + rerank result or lands the event in UNMATCHED — never a hardcoded confidence number with zero candidates and zero reasons (the exact "45% confidence, no reasons" fallback the audit found in the prototype's matcher).
- Assert every `match_candidates` row in a passing test run has a non-null, non-placeholder `rerank_score` sourced from an actual provider call or an explicitly flagged `rerank_unavailable=true` fallback — never a silently hardcoded number.
- Export test: generate a CSV against two different approved events with two different actual `physical_percent` deltas, assert the two CSV rows show two *different* delta values — the direct regression test for the prototype's hardcoded `38,40` export bug.

**New — Hybrid retrieval & active-learning tests:**
- A phrase containing an exact `external_task_id` but semantically unusual wording retrieves the correct activity via the sparse leg even when the dense leg alone would rank it lower.
- A synonym taught via one Choose-Another correction does **not** yet affect matching (still below corroboration threshold); a second, independent corroborating correction does.
- Namespace isolation: the same slang term ("Spool 17") in two different seeded projects resolves to the correct project-scoped activity in each, never cross-contaminating.

All other v1 testing content — unit tests for schema validation/matching-stage functions/rollup math/logic checks/hash chain, integration tests for contract/transaction/determinism, E2E Playwright path, and the full synthetic-case list (1:1, synonym, slang, multilingual, granularity mismatch, many-to-one, unmatched, out-of-sequence, contradictory) — carries forward unchanged.

---

## 21. SYNTHETIC DATA STRATEGY

**(unchanged from v1 in structure)** — SPEC §9 canonical seed, 1 full project + 2 lightly-populated, 10 hero events with real relationships, ~1,280 replayed audit entries, `reference`/`demo-start` snapshots. One addition: the seed script now also seeds a small number of **deliberately unscripted** test phrases (not in SPEC §9.4's hero-event list) specifically so Phase 22's anti-fabrication tests have real, non-fixture input to run against — this is what makes those tests meaningful rather than tautological (testing the system only against the exact phrases it was tuned on proves nothing about robustness).

---

## 22. MVP SCOPE

**(v1's scope carried forward, with the following now explicit as MVP-required rather than assumed):**

**Must have now** — everything in v1's list, plus, explicitly: **a real hybrid (dense+sparse) matching engine, not a keyword/string-match placeholder** (this was always the intent of v1's Phase 09-11, but the audit found this exact corner gets cut under deadline pressure — it is now a named, separately-tested MVP line item, not an implicit consequence of other phases); **the anti-fabrication guarantee (D18)** as a tested build gate, not a code-review norm; **Tier 1+2 of the jargon dictionary** (auto-mined + planner bootstrap) as MVP; **Tier 3 (active learning)** is *should-have-if-stable*, not MVP-blocking — it improves the system over the course of a demo/pilot but its absence doesn't break the core path.

**Should have if stable** — v1's list, plus **Tier 3 active-learning dictionary** (§5.2, §8 stage 11).

**Future / production** — v1's list unchanged.

---

## 23. IMPLEMENTATION BLOCKERS / DECISION REGISTER

**D1–D17: unchanged from v1, carried forward in full** (confidence thresholds; Admin as 4th role; embedding provider; ASR provider; extraction provider/schema discipline; event-type enum gaps; XER export honesty; audit chain trust boundary; duplicate unit counting; schedule re-import carry-forward; rejected `sync_queue`; rejected `delay_events`; role scope; SSO button; "View in P6"; multi-tenancy; physical quantity fabrication risk).

**New in v2:**

**D18 — Anti-Fabrication Guarantee.** *Finding:* the audited prototype's voice capture recorded real audio, discarded it, and substituted a fixed canned transcript regardless of what was said — the single most damaging failure mode identified, because it is a visible, provable falsehood rather than a graceful degradation. *Risk:* under demo-deadline pressure, any provider-backed stage (ASR, extraction, rerank) is tempted to ship a "looks right for the rehearsed script" fallback instead of an honest failure state. *Decision:* no code path anywhere in the backend may return provider-derived output (transcript, extracted fields, match, reason text) that was not actually produced by a real call to that provider for that specific input. Every failure is a typed, visible `FAILED`/`degraded_mode` state, never a substitution. Enforced by Phase 22's anti-fabrication test suite as a CI gate, not a review guideline. *Depends on:* Phase 07, 08, 11, 22.

**D19 — Hybrid Dense + Sparse Retrieval (Reciprocal Rank Fusion).** *Origin:* the zero-shot-contextualization proposal's observation that a general-purpose embedding model may not represent hyper-local site jargon or exact codes well, and that sparse/keyword search is a natural complement, not a competitor, to vector search. *Decision:* candidate retrieval runs both a dense pgvector cosine search and a sparse Postgres full-text search over `activities.search_tsv`, fused via RRF (§8 stage 5), rather than dense search alone as v1 originally specified. *Depends on:* Phase 02 (schema), Phase 09 (embeddings + tsvector), Phase 10 (fused retrieval).

**D20 — Continuous Active-Learning Dictionary (Tier 3), with corroboration gating.** *Origin:* the three-tier jargon dictionary proposal's Tier 3 ("if a human resolves an unmatched slang term, the system should remember it"). *Risk, not addressed by the original proposal:* a single mistaken Choose-Another action could otherwise silently poison the shared dictionary for every future report. *Decision:* Tier 3 corrections are written immediately but inactive for matching until independently corroborated by a second, different planner's action (`dictionary_term_sources`, §5.2); active learning is fire-and-forget and never blocks or delays the planner's actual decision. *Depends on:* Phase 02 (schema), Phase 11a (new phase, §25).

**D21 — Contextual Embedding Text / Namespace Isolation.** *Origin:* the zero-shot-contextualization proposal's "rich descriptive string per activity" and "namespace per project" ideas. *Decision:* embeddings are generated from `activities.embedding_context_text` (a generated `Project > WBS path > Discipline > Activity` string), not the bare activity name, and every retrieval query is already schedule/project-scoped by existing FKs — this achieves the proposal's "namespace isolation" goal using the schema v1 already had, without a separate vector-DB-level namespace mechanism (which would be redundant with `schedule_id`/`project_id` scoping Postgres already enforces). *Depends on:* Phase 02 (new column), Phase 09.

**D22 — Demo-Mode Disclosure Banner, server-enforced.** *Finding:* the audited prototype's only disclosure that results were simulated was a line in Settings → About — invisible in the primary flow a judge or pilot user actually sees. *Decision:* while `DEMO_MODE=true`, every API response carries a header the frontend surfaces as a persistent banner in the primary flow, and specifically fires when a provider is in `degraded_mode` (§17) so a live audience sees an honest "AI temporarily unavailable" state rather than silence or (per D18) a fabricated one. *Depends on:* Phase 21, Phase 18 (security header wiring).

---

## 24. SECOND-PASS CROSS-CHECK

**(v1's 24.1–24.4 unchanged and still valid)**. Re-verified against this revision:

**24.5 — New: every v2 addition re-checked against "no new frontend contract."** Hybrid retrieval (D19), contextual embeddings (D21), and active learning (D20) all live entirely inside `domain/matching/` and `domain/dictionary/`; the only response-shape changes are additive fields on two already-existing endpoints (`/admin/dictionary`, `/workbench/{eventId}/why`) — confirmed neither is a breaking change, since both are objects the frontend already destructures loosely rather than validates against a closed schema (per SPEC's own service-mock pattern). No route was added, removed, or had its request shape changed.

**24.6 — New: anti-fabrication guarantee re-checked against every provider-backed phase.** Phase 07 (extraction), Phase 08 (time agent), Phase 09-11 (embedding/retrieval/rerank) each re-read against D18: none has a code path that returns a default/example/placeholder value in place of a real provider result. Where v1 already specified "1 repair retry then FAILED" (extraction) or "1 retry then fall back to embedding order, flagged" (rerank), those remain the only two legitimate degradation behaviors in the entire pipeline — both are visible and typed, neither is a silent substitution.

---

## 25. ORDERED ANTIGRAVITY MASTER PROMPTS

Standing instructions, now with one line added, repeated verbatim in every prompt:

> "Inspect the repository before making changes." · "Do not redesign existing approved frontend UI unless required for functional integration." · "Do not invent APIs, tables, fields or routes that contradict the project specification." · "Run/validate relevant tests after implementation." · **"Never implement a fallback that returns a default, example, or placeholder value in place of a genuine provider result — a typed failure state is always correct, a fabricated success is never correct (D18)."**

Phases **00–08, 12–10 (sic, i.e. 09/10 amended), 13, 15–24** are unchanged from v1 in objective, dependencies, and acceptance criteria **except where noted below**; their full text is not reproduced a second time here to avoid duplicating ~9,000 words of unchanged instructions — implementers should use v1's phase text verbatim for any phase not listed below, with the one standing-instruction line above added to each.

### PHASE 09 (AMENDED) — Embedding Generation & Indexing, now with Contextual Text + Sparse Index

```text
PHASE 09 — Embedding Generation & Indexing (v2: contextual text + hybrid index)

OBJECTIVE
Generate activities.embedding_context_text (D21) for every activity, backfill
activities.embedding from that text (not the bare name), and build/maintain
activities.search_tsv + its GIN index (D19) as the sparse retrieval counterpart.

ADDITIONS OVER v1
- embedding_context_text = f"Project: {project.name} > WBS: {wbs_node.path} >
  Discipline: {activity.discipline} > Activity: {activity.name} ({activity.external_task_id})",
  generated at import time and on any subsequent rename/reparent.
- search_tsv generated column (tsvector) over external_task_id, name, discipline,
  and current dictionary_terms synonyms (all tiers, corroborated Tier 3 only);
  GIN index built same as v1's HNSW index step.
- Both regenerated together whenever an activity's name/wbs path/discipline
  changes, or whenever a Tier 3 dictionary term crosses its corroboration
  threshold (a synonym becoming "real" should retroactively improve sparse
  search for every activity it applies to, not just future imports).

DEPENDENCIES
- Phase 05 (activities exist). Phase 02's schema already includes
  embedding_context_text and search_tsv columns (added there in v2).

TESTS REQUIRED (in addition to v1's)
- Two different seeded projects each containing an activity literally named
  "Spool 17" retrieve correctly and distinctly when queried from within each
  project's scope — the namespace-isolation test for D21.
- search_tsv correctly indexes an external_task_id verbatim (e.g. "PIP-24-017")
  even when the activity's name text doesn't otherwise contain it.

ACCEPTANCE CRITERIA
- Every activity in the current schedule has non-null embedding AND non-null
  search_tsv after backfill.
- embedding was computed from embedding_context_text, verifiably (a unit test
  asserts the exact string passed to the embedding provider equals the stored
  embedding_context_text for a sample activity, not the bare name).
```

### PHASE 10 (AMENDED) — Hybrid Candidate Retrieval

```text
PHASE 10 — Hybrid Candidate Retrieval (v2: dense + sparse, fused via RRF)

OBJECTIVE
Implement discipline-filtered retrieval as TWO parallel queries — dense cosine
over activities.embedding, sparse full-text rank over activities.search_tsv —
fused via Reciprocal Rank Fusion (D19), replacing v1's dense-only retrieval.

INSPECT FIRST
- Section 8 stages 4-5 of this v2 document. v1's Phase 10 text for the parts
  that carry forward unchanged (discipline-filter-skip rule, 100%-complete
  exclusion, hard-error-not-silent-empty rule for un-embedded schedules —
  this rule now also covers an un-indexed search_tsv).

DEPENDENCIES
- Phase 09 (v2 amended — both embedding and search_tsv must exist).

FILES YOU MAY CREATE
- backend/app/domain/matching/retrieval.py (dense query + sparse query + RRF
  fusion function, each independently unit-testable).

VALIDATION RULES
- RRF constant k=60 (standard), not exposed as a per-project config in MVP —
  a fixed, well-understood default rather than another tunable that scatters
  matching behavior across configs (consistent with D1's centralization intent).
- An activity appearing in both the dense and sparse top-10 ranks above an
  activity appearing in only one, by construction of the RRF formula — verified
  by a unit test with a synthetic pair of activities.
- If EITHER index (embedding or search_tsv) is missing for the schedule, raise
  the same "schedule not ready for matching" error v1 specified for missing
  embeddings alone.

TESTS REQUIRED
- Section 8's worked example (Spool 17 / Erect Line 24-XX) retrieves correctly
  via dense-only, sparse-only, and fused — three separate assertions, so a
  future regression in either leg is caught independently.
- A query containing an exact external_task_id but unusual/terse phrasing
  (e.g. just "PIP-24-017 done") is retrieved correctly via the sparse leg
  even in a synthetic scenario where the dense leg alone would rank it lower
  (constructed test case, not reliant on real embedding provider behavior).

ACCEPTANCE CRITERIA
- Matches v1's Phase 10 acceptance criteria, plus: the sparse-leg-specific
  exact-code test above passes.
```

### PHASE 11a (NEW) — Active-Learning Feedback Loop

```text
PHASE 11a — Active-Learning Feedback Loop (Tier 3 dictionary)

OBJECTIVE
Implement the write-back from planner corrections (Choose Another / manual
search on Unmatched) into dictionary_terms (source=ACTIVE_LEARNED) with
corroboration gating via dictionary_term_sources (D20), per Section 5.2/8.

STANDING RULES
- Same as every other phase, plus the anti-fabrication line from this
  document's Section 25 preamble.

INSPECT FIRST
- Section 5.2 (dictionary_term_sources), Section 8 stage 11, Decision D20.
- Phase 14's approve/choose-another/unmatched endpoints (this phase hooks
  into them without modifying their core transaction).

DEPENDENCIES
- Phase 02 (dictionary_term_sources table), Phase 14 (the mutation endpoints
  this phase observes).

FILES YOU MAY CREATE
- backend/app/domain/dictionary/active_learning.py (phrase-extraction +
  candidate-synonym proposal + corroboration-check logic).
- Amend Phase 14's choose-another and unmatched-manual-search handlers to
  call this module as a fire-and-forget background task after their own
  transaction commits — never inside the same transaction, so a learning
  failure can never roll back or delay a planner's actual decision.

FILES YOU MUST NOT MODIFY
- Frontend files. Phase 14's core approval/choose-another transaction logic
  beyond adding the background-task trigger call.

DATA MODEL
- Writes: dictionary_terms (source=ACTIVE_LEARNED, confidence starts low),
  dictionary_term_sources (one row per corroborating occurrence).
- A term's confidence crosses the active-for-matching threshold only once
  dictionary_term_sources has >= matching_config.min_corroborations
  (default 2) rows from distinct actor_ids for the same term.

VALIDATION RULES
- The same actor correcting the same phrase twice does NOT count as two
  corroborations (unique constraint on (dictionary_term_id, activity_match_id)
  combined with a distinct-actor check at write time).
- Learning never fires for AUTO_ACCEPT-tier matches (nothing to learn from —
  the AI was already right); only for PLANNER_OVERRIDE / PLANNER_MANUAL_SEARCH
  match_method rows, i.e. genuine human corrections.

ERROR BEHAVIOR
- A failure in this background task is logged and does not surface to the
  planner in any form — their approve/choose-another action already
  succeeded and was already audited by Phase 15 before this task even runs.

TESTS REQUIRED
- A single Choose-Another correction produces a dictionary_terms row that
  does NOT yet affect a subsequent identical query's ranking.
- A second, different-actor Choose-Another correcting the same phrase to the
  same activity crosses the corroboration threshold, and a subsequent
  identical query's ranking measurably improves (the corroborated term now
  appears in normalization/sparse-index matching, per Section 6's amended
  Normalization stage).
- Namespace isolation: a term learned in one project's namespace does not
  leak into another project's matching (dictionary_terms.project_id scoping,
  already in v1's schema, re-verified here).

ACCEPTANCE CRITERIA
- The corroboration-gating behavior above is demonstrable end-to-end against
  two seeded planner accounts correcting the same synthetic slang phrase.

MANUAL VERIFICATION
- Perform two Choose-Another corrections via curl as two different seeded
  planner users on the same novel phrase, then re-submit a field report using
  that phrase and confirm the dictionary now normalizes it correctly.

ROLLBACK
- A bad learned term can be manually deactivated via /admin/dictionary
  (already an AdminService route in v1) — this phase adds no new admin route,
  it reuses the existing PATCH capability to flip an ACTIVE_LEARNED term off.
```

### PHASE 22 (AMENDED) — Automated Testing, now with an Anti-Fabrication Gate

```text
PHASE 22 — Automated Testing (v2: adds a CI-blocking anti-fabrication suite)

OBJECTIVE
All of v1's Phase 22 objective, plus: a dedicated, CI-blocking test module
that specifically targets D18 (Section 20's new "Anti-fabrication tests"
category) and D19/D20's hybrid-retrieval/active-learning behavior.

ADDITIONS OVER v1
- backend/tests/anti_fabrication/ — a separate test module (not folded into
  unit/integration/e2e) so it can be run as its own named CI gate and its
  failure message is unambiguous: "a fabrication-guard test failed" reads
  differently in CI logs than a generic test failure, which matters given
  this is the single highest-severity class of bug this system can ship.
- Includes the exact regression cases named in Section 20: ASR-failure
  transcript check, novel-phrase no-hardcoded-fallback check, rerank-score
  provenance check, per-row CSV delta distinctness check.

ACCEPTANCE CRITERIA
- All of v1's Phase 22 criteria, plus: backend/tests/anti_fabrication/ passes
  as a distinctly-reported CI step, and the full Section 20 synthetic-case
  list (now including the two new hybrid-retrieval/active-learning cases)
  has a named, passing test.
```

*(Phases 00–08, 12, 13, 14, 15–21, 23, 24 are unchanged from v1's full text — implement from the v1 document verbatim, adding the standing anti-fabrication instruction line. Phase 14's only change is the addition of the fire-and-forget background-task call into Phase 11a, noted in Phase 11a's own spec above, not a change to Phase 14's core logic.)*

---

## 26. DEPENDENCY GRAPH

v1's graph is unchanged in shape; two nodes are amended and one is inserted, shown below. Everything upstream of Phase 09 and downstream of Phase 15 is identical to v1.

```
... (Phases 00–08 exactly as v1) ...
   ↓
PHASE 09  Embedding Generation & Indexing  — AMENDED (v2: + contextual text, + search_tsv)
   ↓  (gate: 0 activities with null embedding OR null search_tsv; namespace-isolation
             test passes for two same-named activities in different projects)
PHASE 10  Hybrid Candidate Retrieval  — AMENDED (v2: dense + sparse + RRF)
   ↓  (gate: Section 8's worked example passes via dense-only, sparse-only, AND fused;
             exact-code sparse-leg test passes)
PHASE 11  Reranking & Confidence Engine  — unchanged from v1
   ↓  (gate: E-2091 lands at ~94% confidence, REVIEW tier)
PHASE 12  Schedule Logic Validation Engine  — unchanged from v1
   ↓
PHASE 13  Workbench APIs (read)  — unchanged from v1
   ↓
PHASE 14  Approval / Alternate Match / Reject Workflows  — unchanged from v1
   ↓  (gate: full E-2091 approval scenario reproduced exactly, per v1)
PHASE 11a  Active-Learning Feedback Loop  — NEW
   ↓  (gate: two-corroboration threshold behavior demonstrated end-to-end via
             two distinct seeded planner accounts; namespace isolation re-verified)
PHASE 15  Audit Trail & Evidence Lineage  — unchanged from v1
   ↓
... (Phases 16–21 exactly as v1) ...
   ↓
PHASE 22  Automated Testing  — AMENDED (v2: + CI-blocking anti-fabrication suite)
   ↓  (gate: full suite passes, including the distinctly-reported anti-fabrication
             module and the hybrid-retrieval/active-learning synthetic cases)
PHASE 23  Frontend Integration Cutover  — unchanged from v1
   ↓
PHASE 24  Production-Readiness Audit  — unchanged from v1, plus: re-verify D22's
   demo-mode header only ever appears when DEMO_MODE is actually set, never in a
   real deployment
```

---

## 27. FINAL END-TO-END ACCEPTANCE CHECKLIST

**All of v1's checklist items carry forward unchanged** (4-role login with server-side lockout; XER import + carry-forward; the E-2091 voice-to-approval path; the Time Agent's one-question example; the 38%→40% approval + audit entry; server-side chain verify + corruption detection; out-of-sequence override requirement; duplicate-unit conflict routing; per-row-correct CSV export; KPI traceability; offline idempotency; unmodified Playwright suite; `/dev/*` unreachability; single-source-of-truth thresholds).

**New in v2:**

- [ ] Submitting audio to the voice endpoint with the ASR provider deliberately disabled never returns a transcript — it returns a typed `FAILED` state, and this exact scenario has a named, passing anti-fabrication test (D18).
- [ ] A genuinely novel field-report phrase, not present in any seed/demo fixture, is either matched via a real fused dense+sparse retrieval + rerank result, or correctly routed to UNMATCHED — never a hardcoded low-confidence, zero-candidate placeholder (D18).
- [ ] An exact `external_task_id` mentioned in terse field-report phrasing is retrieved correctly via the sparse leg of hybrid retrieval, independently verified against a case where the dense leg alone would rank it lower (D19).
- [ ] The same activity name in two different seeded projects never cross-matches across projects — namespace isolation via `embedding_context_text` + schedule scoping is verified directly (D21).
- [ ] A slang term corrected once by one planner does not yet affect matching; corrected a second time by a different planner, it does — the Tier-3 corroboration gate is demonstrated end-to-end, not merely implemented (D20).
- [ ] While `DEMO_MODE=true`, every response carries the demo-mode header, and a simulated provider outage surfaces the "AI temporarily unavailable" banner rather than any fabricated or silent result (D22).
- [ ] Exporting CSVs for two different approved events with two different actual percent-complete deltas produces two rows with two genuinely different delta values (direct regression test for the audited prototype's hardcoded export bug).
