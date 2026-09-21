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
