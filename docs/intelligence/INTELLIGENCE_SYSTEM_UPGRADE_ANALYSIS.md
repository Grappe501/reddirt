# Intelligence system — upgrade analysis (candidate iPad + AI agents)

Generated for the next full intelligence upgrade pass. **Active lane:** `RedDirt/`.

## Executive summary

The debate prep stack is **data-rich and UI-deep**, but **AI agents are mostly backend/registry** — not yet a first-class **candidate copilot** on the iPad. This pass adds:

- `NEXT_PUBLIC_CANDIDATE_IPAD_MODE=true` — 820px column, bottom nav, 48px touch targets, safe areas
- `/api/admin/intelligence/copilot-tool` — wires existing `aiCopilotOrchestrator` to the candidate UI
- **AI** tab on iPad bottom bar — quick tools without opening the full workbench

The **daily intelligence agent** (`runDailyIntelligenceAgentPassAsync`) still runs on the hub page load only — not on coaching/debate-prep routes.

---

## System map — steps and surfaces

| Step | Route | Primary function | AI today |
|------|--------|------------------|----------|
| 1 | `/admin/intelligence` | V4 hub: executive brief, themes, rehearsal, argument map | Daily packet on full hub (`OppositionIntelligenceAdminPageFull`) |
| 2 | `/admin/intelligence/kelly-debate-coaching` | Principles, narrative control, Check My Record, scripts | **NEW:** copilot dock (desktop); iPad **AI sheet** |
| 3 | `/admin/intelligence/kim-hammer/debate-prep` | 28 sections + drill-downs | None on page |
| 4 | `/admin/intelligence/debate-command` | Readiness, traps, film room | None on page |
| 5 | `/admin/intelligence/claims` | Claim review workflow | API only (`claim-review`) |
| 6 | `/admin/intelligence/video-archive-room` | Bills, offense acts, transcripts, opponent media | Whisper pipeline deferred |
| 7 | `/admin/intelligence/kim-hammer/debate-ai-workbench` | All copilot tools (deterministic + LLM queue) | **Yes** — batch on page load |
| 8 | `/admin/intelligence/kim-hammer/kh4-agent-tools` | Read-only agent registry | Registry only |
| 9 | `/admin/intelligence/action-queue` | Human retrieval tasks | Synced from daily pass |
| 10 | `/admin/intelligence/llm-review-queue` | NON_PUBLISHABLE drafts | Gateway queue |
| 11 | `/admin/intelligence/legislative-video` | Video/transcript pipeline | Transcription if `OPENAI` configured |
| 12 | `/admin/intelligence/scenario-simulation` | Traps / mock scenarios | Scenario hints in copilot context |
| 13 | `/admin/intelligence/opponents` | Hammer + Packo scaffolds | None |
| 14 | `/admin/intelligence/county-clerk-week` | 7-day clerk path | None |

**Data spine:** `kim-hammer-election-record-bill-index.json`, debate v4 packet, `ai-copilot-tool-registry.json` (37 tools), `agent-run-audit-log.json`.

---

## What is NOT integrated (gaps)

1. **No live LLM on candidate screens** — copilot tools are deterministic unless staff enables LLM queue + review.
2. **Daily agent pass** not triggered from iPad; no “refresh priorities” button.
3. **Debate coaching** does not call agents when Kelly submits a suggestion (suggestion API is storage only).
4. **Check My Record** playbook is static TS — not personalized per latest bill ingest.
5. **Video transcripts** — opponent excerpts manual; committee Whisper empty without pipeline run.
6. **Claims gate** — no inline agent that flags a Kelly draft line against ledger before submit.
7. **Packo** — scaffold only; no agent comparing Hammer vs Packo vs Kelly lines.
8. **KH-4 agents** — registered but read-only UI; no run button from candidate iPad.

---

## Candidate iPad 11" profile (this pass)

| Setting | Value |
|---------|--------|
| Env | `NEXT_PUBLIC_CANDIDATE_IPAD_MODE=true` (in `netlify.toml` for production) |
| Max width | 820px centered |
| Navigation | Bottom tab bar: Home · Coach · Prep · Record · Claims · **AI** · More |
| Touch | `min-h-12` on buttons; `touch-manipulation`; sheet modals for More / AI |
| Subnav | Desktop horizontal subnav hidden on iPad |

Staff builds can set `NEXT_PUBLIC_CANDIDATE_IPAD_MODE=false` for full sidebar + subnav.

---

## 20 AI agent tools for intelligence & debate prep

Each item maps to an existing registry tool where noted, or a **proposed** new tool for the next upgrade.

| # | Agent job | What it does for Kelly | Registry / build |
|---|-----------|------------------------|------------------|
| 1 | **Check My Record responder** | When Hammer uses the slogan, outputs 6-beat answer + act list from live bill index | **Proposed** — wrap `kellyOffensiveNarrativeControl` + bill index |
| 2 | **Debate question generator** | Moderator-style questions anchored to verified bills | `debate-question-generator` ✓ |
| 3 | **30/60/90 answer builder** | Timed skeletons with evidence dependencies | `answer-builder-30-60-90` ✓ |
| 4 | **What not to say detector** | Blocked narratives before stage | `what-not-to-say-detector` ✓ |
| 5 | **Trap question detector** | Flags risky moderator paths | `trap-question-detector` ✓ |
| 6 | **Rebuttal builder** | Internal rebuttal blocks post-claims review | `rebuttal-builder` ✓ |
| 7 | **Counterargument predictor** | Hammer likely replies to Kelly act cites | `counterargument-predictor` ✓ |
| 8 | **Bridge line builder** | Pivot from topic to SOS service frame | `bridge-line-builder` ✓ |
| 9 | **Bill impact analyzer** | Plain English + county harm per anchor bill | `bill-impact-analyzer` ✓ |
| 10 | **Claim strength evaluator** | Scores if a line is safe to say tonight | `claim-strength-evaluator` ✓ |
| 11 | **Quote miner** | Pull quotable Hammer lines from citation locker | `quote-miner` ✓ |
| 12 | **Contradiction scout** | Hammer promise vs 2025 petition votes | `contradiction-scout` ✓ |
| 13 | **Morning brief synthesizer** | Daily debate priorities on hub load | `morning-brief-synthesizer` + `runDailyIntelligenceAgentPassAsync` |
| 14 | **Packo lane advisor** | Friendly Packo lines + what not to say (no vote-L on stage) | **Proposed** — `kellyOffensiveDebateStrategy` context |
| 15 | **Direct democracy act explainer** | One-act plain English + trap for Act 768 etc. | **Proposed** — `hammerDirectDemocracyOffensive` |
| 16 | **Road story slotter** | Turns Kelly voice note into governed story slot draft | **Proposed** — writes `kelly-road-stories.json` draft only |
| 17 | **Opponent media summarizer** | YouTube/TBP excerpt → debate use note | **Proposed** — feeds `opponent-media-transcripts.json` |
| 18 | **Committee video moment finder** | Suggests in/out for clip once transcripts exist | **Proposed** — legislative pipeline |
| 19 | **Live suggestion triage** | Ranks Kelly coaching submissions for staff | **Proposed** — debate-coaching suggestion API |
| 20 | **Post-debate debrief** | Compares what was said vs claims ledger gaps | **Proposed** — memory + claims |

**Already wired on iPad (this pass):** quick run for items 2–6 via `/api/admin/intelligence/copilot-tool` and **AI** bottom sheet.

---

## Recommended next upgrade sequence

1. **P0** — `Check My Record` live agent (#1) + claim check on coaching submit (#19)
2. **P0** — Daily pass “Refresh” on iPad Home (#13)
3. **P1** — Packo advisor + direct democracy explainer on coaching (#14–15)
4. **P1** — Whisper + committee moment finder (#18)
5. **P2** — LLM layer with mandatory `llm-review-queue` before any candidate sees prose (#13 gateway)

---

## Commands

```bash
npm run agents:test-kelly-offensive-principles
npm run agents:test-video-archive-room
npm run agents:test-candidate-ipad-intelligence
```

---

## Governance (unchanged)

All agent outputs remain `NON_PUBLISHABLE` · `HUMAN_REVIEW_REQUIRED`. iPad mode does not bypass claims ledger or export controls.
