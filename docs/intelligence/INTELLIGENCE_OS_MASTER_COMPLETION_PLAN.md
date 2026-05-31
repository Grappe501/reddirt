# Intelligence OS — Master Completion Plan (Phases 11–17)

**Active lane:** `RedDirt/` only  
**Audience:** Steve, Ernie (Codex script author), Burt (Cursor executor)  
**Baseline:** Public-brief-grade pass complete (~70–75% architecture; ~30% intelligence depth)  
**Updated:** 2026-05-31

---

## Executive answer for Ernie

**Will Phases 11–17 complete the system?**

| Scope | Answer |
|-------|--------|
| **Intelligence OS (RedDirt admin)** | **Yes, if Phases 11–17 execute.** That finishes governed AI briefs, claim ledger, county/opposition/debate depth, daily COS orchestration, and production hardening for this subsystem. |
| **Entire Kelly SOS campaign platform** | **No.** Email Services, WorkflowIntake/forms queue, public site (`sos-public/`), voter-file ingest, fundraising, and full countyWorkbench data population are **separate major subsystems** not covered here. |
| **Minimum to pivot to Email** | **Phases 11 + 12 only** (~2 consolidated build passes). Unlocks citation-backed AI briefs with human review — enough to draft email copy from governed evidence without auto-send. |
| **Recommended stop before Email** | **Through Phase 15** (~6–8 consolidated passes). Strong opposition + debate + brief engine; defer Phase 16–17 integration until after Email MVP. |

**Bottom line for Ernie:** Treat this as **depth + evidence + deployment hardening**, not greenfield architecture. The skeleton is built; remaining work fills archives, wires live LLM behind governance, and moves JSON queues to Postgres.

---

## Current state snapshot

| Area | Score / status |
|------|----------------|
| Architecture & governance | ~93/100 |
| Intelligence OS overall | ~70–75% |
| County field intelligence | 6 internal-source / 69 shell / 0 public-ready |
| Opposition brief | 65/100 (0/7 retrieval COMPLETE) |
| Debate brief | 59/100 (1 direct clip) |
| Message intelligence | 61/100 |
| Live LLM | **Deferred** (contracts only) |
| NSI-16 weekly packet | **Live** (orchestrator) |
| Institutional memory (75 counties) | **Empty** |
| Production JSON persistence | Single-operator OK; multi-instance blocked |

Reference: `docs/intelligence/PUBLIC_BRIEF_GRADE_INTELLIGENCE_BUILD_REPORT.md`

---

## Build-pass model (Ernie ↔ Burt)

Each **build pass** = one reviewable slice with a fixed handoff.

| Role | Responsibility |
|------|----------------|
| **Ernie** | Author the next pass **script** (paste block): scope, files, acceptance criteria, tests, hard constraints. One pass = one PR-sized unit. |
| **Burt** | Execute the pass in `RedDirt/`, fix until green inside slice, write **completion report**, list **files changed** + **commands run**, prepare commit message when Steve asks, document **Netlify push checklist**, tell Ernie **exact next pass**. |
| **Steve** | Approves pass order, merge, Netlify promote, human research assignments (retrieval tasks, clip indexing). |

### Per-pass deliverables (Burt)

1. `docs/intelligence/build-reports/PASS-{NN}-{slug}-BUILD_REPORT.md`
2. Validation block: `typecheck`, `build`, `email:no-send-scan`, pass-specific tests
3. Handoff footer: **Next pass for Ernie to script** + **Horizon (passes N+2, N+3)**

### Netlify push checklist (every deploy pass)

```text
1. cd RedDirt && npm run check (or typecheck + build)
2. git commit in RedDirt repo (Steve-approved message)
3. git push origin <branch>
4. Netlify: confirm RedDirt site build from branch
5. Smoke: /admin/intelligence, /admin/intelligence/command-center, /admin/intelligence/debate-command
6. Verify no secret values in build logs
7. Append docs/KELLY_SOS_BUILD_LOG.md if Steve wants audit trail
```

---

## Consolidated roadmap (7 phases → 8 build passes)

Original 75–90 steps consolidated to **8 passes** by merging interdependent work and tiering county expansion.

| Pass | Consolidated phase | Original phases | Est. duration |
|------|-------------------|-----------------|---------------|
| **P1** | Governed LLM + evidence packets | 11 (steps 1–7) | 1 pass |
| **P2** | Claim ledger + review promotion | 11 (8–10) + 12 | 1 pass |
| **P3** | Opposition archive closure (MVP) | 14 (steps 1–6, 12) | 1 pass |
| **P4** | Debate war room + film room | 14 (7–11) + 15 (1–5) | 1 pass |
| **P5** | Debate drills + simulators | 15 (6–10) | 1 pass |
| **P6** | County tier-1 expansion (10 counties) | 13 (tiered) | 1 pass |
| **P7** | County tier-2 rollout (65 counties) | 13 (remainder) | 1–2 passes |
| **P8** | COS orchestration upgrade | 16 (extend existing) | 1 pass |
| **P9** | Production hardening | 17 | 1 pass |

**Email pivot option:** Stop after **P2** (minimum) or **P5** (recommended).

---

## Phase detail (consolidated)

### Pass P1 — Governed LLM + evidence packets (Phase 11A)

**Goal:** Operator-triggered LLM drafting from evidence-only input.

| Step | Work |
|------|------|
| 1 | Evidence packet generator (from governed briefs + evidence index) |
| 2 | Citation packet attachment (source anchors required) |
| 3 | Claim extraction + verified/inferred/unsupported classification |
| 4 | Source confidence scoring per claim |
| 5 | Operator button on brief UI → `buildLlmBriefDraftRequest()` |
| 6 | Wire to existing `/admin/intelligence/llm-review-queue` |
| 7 | Hallucination / unsupported-claim detector (deterministic pre-check) |

**Acceptance:** `liveLlmEnabled` true only when env + operator trigger; all output NON_PUBLISHABLE; test script proves queue-only routing.

**Do not:** Auto-publish, auto-send, mutate canonical goals.

---

### Pass P2 — Claim ledger + review promotion (Phase 11B + 12)

**Goal:** Every brief statement traceable to sources.

| Step | Work |
|------|------|
| 1 | Claim ledger schema (JSON first, Postgres-ready) |
| 2 | Source ↔ claim linking (reuse KH citation locker patterns) |
| 3 | Evidence depth score per claim |
| 4 | Unsupported + contradictory source detectors |
| 5 | Research gap auto-generator from ledger gaps |
| 6 | Human promotion workflow: DRAFT → READY_FOR_HUMAN_REVIEW → HUMAN_APPROVED |
| 7 | Audit trail for claim status changes |
| 8 | Brief publishability gate reads ledger (still default NOT_PUBLISHABLE) |

**Acceptance:** "Show me every source for this attack line" works in admin UI; governance tests pass.

---

### Pass P3 — Opposition archive closure MVP (Phase 14A)

**Goal:** Close the biggest research blockers (0/7 retrieval, thin writings).

| Step | Work |
|------|------|
| 1 | Retrieval task workflow: assign → IN_PROGRESS → COMPLETE paths |
| 2 | Speech/writings archive indexing (honest gap flags remain until sourced) |
| 3 | Video/debate archive indexing (target: 3+ direct clips) |
| 4 | Voting record + bill summary cross-links |
| 5 | Timeline engine (bill + media events) |
| 6 | Quote extraction with citation locker binding |
| 7 | Research gap closure dashboard |

**Acceptance:** ≥3 retrieval tasks COMPLETE with citations; opposition brief confidence ≥75; no unsourced claims in export-ready tier.

**Human dependency:** Steve/research team must supply source URLs/files — Burt builds intake + indexing, not fabricate evidence.

---

### Pass P4 — Debate war room + film room (Phase 14B + 15A)

| Step | Work |
|------|------|
| 1 | Film room expansion (clip metadata, topic tags, drill links) |
| 2 | Video indexing pipeline (manual upload + URL registry) |
| 3 | Argument library (from bill anchors + scenarios) |
| 4 | Rebuttal library (extend KH-2 corpus) |
| 5 | Cross-exam question bank |

**Acceptance:** Debate brief confidence ≥70; film room ≥3 direct clips indexed; debate-command UI shows lanes + unsafe claims.

---

### Pass P5 — Debate drills + simulators (Phase 15B)

| Step | Work |
|------|------|
| 1 | Kelly answer simulator (governed, INTERNAL_DRAFT) |
| 2 | Time-pressure drill cards |
| 3 | Mock debate engine (scenario-driven) |
| 4 | Opponent persona model (evidence-bound) |
| 5 | Daily prep recommendations → human action queue |

**Acceptance:** Debate prep brief ≥80; daily orchestrator includes drill priorities.

---

### Pass P6 — County tier-1 (10 counties) (Phase 13A)

**Tier-1 counties:** Pope, Pulaski, Faulkner, Benton, Washington, Sebastian, Craighead, Garland, Jefferson, Saline.

| Step | Work |
|------|------|
| 1 | Canonical registration goal verification (GOALS-VERIFY-1) |
| 2 | Election + registration + turnout history slots |
| 3 | Local validators: hospitals, schools, chambers, festivals, churches, media |
| 4 | Event inventory link |
| 5 | Institutional memory seed per county |
| 6 | Messaging opportunity tags (INTERNAL ONLY) |
| 7 | Re-classify public-brief readiness honestly |

**Acceptance:** 10 counties move from SHELL_ONLY to FIELD_PLANNING_ONLY or INTERNAL_MESSAGE_SOURCE_ONLY with populated research gaps; 0 false PUBLIC_BRIEF_READY.

---

### Pass P7 — County tier-2 (remaining 65) (Phase 13B)

Same template as P6, batch by region (5 passes of ~13 counties if split further).

**Acceptance:** All 75 classified with non-empty research task lists; institutional memory stub per county.

---

### Pass P8 — Campaign OS orchestration (Phase 16)

**Extend existing** — do not rebuild.

| Step | Work |
|------|------|
| 1 | Wire calendar/events into daily packet |
| 2 | Travel + field plan signals |
| 3 | Email draft opportunities (no send) → link to Email OS when ready |
| 4 | Fundraising signal read-only hooks |
| 5 | Unified "Kelly today" answer block |
| 6 | County visit recommendation engine |
| 7 | Weekly message recommendation (INTERNAL) |

**Acceptance:** AI Brain answers 8 canonical questions with cross-system source tags.

---

### Pass P9 — Production hardening (Phase 17)

| Step | Work |
|------|------|
| 1 | Human action queue → Postgres migration |
| 2 | LLM review queue → Postgres |
| 3 | Claim ledger → Postgres |
| 4 | Supabase/Prisma pool tuning (fix max-clients during build) |
| 5 | RBAC review for intelligence routes |
| 6 | Multi-operator concurrency test |
| 7 | Audit log retention |
| 8 | Backup/recovery doc |
| 9 | Monitoring hooks |
| 10 | Final governance audit script |

**Acceptance:** `lane:preflight` green; no JSON-only queue in production path; governance score maintained.

---

## Gaps not in original Phases 11–17

Add to plan — these block "complete" even if 11–17 finish:

| Gap | Why it matters | Suggested pass |
|-----|----------------|----------------|
| **WorkflowIntake / forms queue** | Kelly SOS Day 3 slice — public form → DB → admin review | Separate lane pass (not intelligence) |
| **Institutional memory empty (75 counties)** | Orchestrator warns; county briefs thin | P6–P7 |
| **Canonical reg goal backfill** | Split-brain risk in field messaging | P6 (tier-1 first) |
| **Export control center ↔ brief promotion** | KH-4 export workflow must gate public adaptation | P2 |
| **Research task human assignment UI** | 0/7 retrieval COMPLETE is ops, not code-only | P3 (+ Steve) |
| **countyWorkbench data population** | 69 shell counties need external data ingest | P6–P7 (+ countyWorkbench lane) |
| **Email OS** | Explicitly next major subsystem after intel stop point | Post P2 or P5 |
| **sos-public public site** | Cross-lane; integration packet required | Out of scope |
| **Prisma pool exhaustion on build** | Seen during `next build` static gen | P9 early |

---

## Consolidation rationale (speed)

1. **Merge 11 + 12** — LLM without claim ledger is unsafe; ledger without LLM still valuable. Ship together in P1+P2.
2. **Merge 14 + 15 film/video work** — Same archive ingestion pipeline.
3. **Tier county expansion** — 75 counties × 20 data dimensions in one pass is unreviewable. Tier-1 (10) proves template.
4. **Extend Phase 16, don't rewrite** — `intelligenceAgentOrchestrator.ts`, AI Brain panel, NSI-16 already exist.
5. **Start Postgres migration in P9 but design in P2** — Claim ledger schema should be Postgres-ready from day one.
6. **Human research parallel track** — Ernie scripts code passes; Steve assigns retrieval owners concurrently (not sequential).

---

## Recommended execution order

### Track A — Intelligence code (Ernie scripts → Burt executes)

```
P1 → P2 → [EMAIL PIVOT OPTION] → P3 → P4 → P5 → P6 → P7 → P8 → P9
```

### Track B — Human research (Steve / research team, parallel)

```
Retrieval tasks 1–3 → debate clip indexing → tier-1 county validator sourcing
```

### Track C — Platform (separate from intelligence depth)

```
WorkflowIntake slice → Email OS MVP → Netlify production promote
```

---

## Success metrics

| Metric | Now | After P2 | After P5 | After P9 |
|--------|-----|----------|----------|----------|
| PUBLIC_BRIEF_READY counties | 0 | 0 | 0–3 | 5–10 (with human approval) |
| INTERNAL_MESSAGE_SOURCE counties | 6 | 6 | 10+ | 75 |
| Opposition brief score | 65 | 70 | 85+ | 90+ |
| Debate brief score | 59 | 60 | 80+ | 85+ |
| Retrieval tasks COMPLETE | 0/7 | 0/7 | 5/7+ | 7/7 |
| Direct debate clips | 1 | 1 | 3+ | 5+ |
| Live LLM (governed) | off | on | on | on |
| Postgres queues | no | partial | partial | yes |

---

## Pass script template (for Ernie)

Ernie should author each pass using this skeleton:

```text
BURT BUILD PASS — P{N} — {TITLE}
Active lane: RedDirt/
Read first: docs/intelligence/INTELLIGENCE_OS_MASTER_COMPLETION_PLAN.md
Prior report: docs/intelligence/build-reports/PASS-{N-1}-*-BUILD_REPORT.md

Mission: {one sentence}

Hard constraints:
- No deletes. No cross-lane imports. No auto-send/publish.
- All AI output: INTERNAL_DRAFT, NON_PUBLISHABLE, HUMAN_REVIEW_REQUIRED.
- No unsourced opponent claims. No canonical goal mutation.

Build:
1. {step}
2. {step}
...

Validation:
- npm run typecheck
- npm run build
- npm run email:no-send-scan
- {pass-specific tests}

Deliverables:
- docs/intelligence/build-reports/PASS-{N}-{slug}-BUILD_REPORT.md
- Files changed list
- Commands run + results

Handoff:
- Next pass for Ernie: P{N+1} — {title}
- Horizon: P{N+2}, P{N+3}
```

---

## Immediate next actions

### For Ernie — script Pass P1 now

**Title:** Governed LLM + Evidence Packets  
**File to create:** `docs/intelligence/pass-scripts/PASS-P1-GOVERNED-LLM-EVIDENCE-PACKETS.md`  
**Scope:** Operator button, evidence packet generator, claim classification, review queue wiring, unsupported-claim detector. Keep `liveLlmEnabled` false until env verified in report.

### For Burt — after Ernie delivers P1 script

Execute P1, produce `PASS-P1-*-BUILD_REPORT.md`, run validation, commit when Steve asks, document Netlify push.

### Horizon (next three passes)

1. **P1** — Governed LLM + evidence packets *(Ernie scripts now)*
2. **P2** — Claim ledger + review promotion
3. **P3** — Opposition archive closure MVP

---

## Decision for Steve

| Option | Passes | Then |
|--------|--------|------|
| **Minimum → Email** | P1–P2 | Pivot to Email Services |
| **Recommended** | P1–P5 | Email + return for P6–P9 |
| **Full Intelligence OS** | P1–P9 | Email after P9 |

---

*This plan supersedes ad-hoc phase numbering for execution purposes. Original Phase 11–17 labels map to Pass P1–P9 above.*
