# Public-Brief-Grade Intelligence Build Report

**Active lane:** RedDirt/  
**Pass:** BURT — Public-brief-grade intelligence + NSI-16 orchestration  
**Date:** 2026-05-31  
**Status:** Complete (deterministic-first; live LLM deferred)

---

## 1. What was built

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | NSI-16 weekly packet wired to `buildWeeklyIntelligencePacket()` + daily orchestrator | **Live** |
| 2 | Governed brief types (7 brief types, statuses, publishability gates) | **Complete** |
| 3 | 75-county deterministic public messaging brief generator + JSON artifacts | **Complete** |
| 4 | Kim Hammer opposition + debate + rapid response brief generators | **Complete** |
| 5 | LLM brief drafting contracts (evidence-only input, review queue, no-publish gate) | **Contracts only** |
| 6 | Message intelligence layer (safe/risky themes, field/debate prompts) | **Complete** |
| 7 | Daily orchestrator brain answers + public-brief rollup | **Complete** |
| 8 | `/admin/intelligence` Public-Brief-Grade panel; debate-command brief section; county dashboard rollup | **Complete** |
| 9 | Governance validation script + test suite | **Pass** |
| 10 | This report + `COUNTY_PUBLIC_BRIEF_READINESS.md` | **Complete** |

---

## 2. What is now real

- **NSI-16 weekly packet** is orchestrator-composed (`status: "live"`), not placeholder. Includes priorities, county risks, debate movement, opposition gaps, human actions, unresolved claim risks, messaging opportunities, governance warnings, source systems, and not-verified section.
- **Daily intelligence agent pass** pulls county public-brief rollup, opposition/debate brief scores, message intelligence score, brain answers, and top research gaps blocking public messaging.
- **75 county JSON briefs** at `data/intelligence/briefs/county/{slug}-public-messaging.json` plus `_rollup.json`.
- **Opposition/debate brief pack** generated deterministically from evidence index, workbench, KH-3, and debate command center.
- **Message intelligence guidance** derived from governed briefs (themes, risky themes, verification needs, field/debate/county prompts).
- **Admin dashboards** show governed internal brief readiness with explicit NON_PUBLISHABLE indicators.

---

## 3. What is still deterministic

All brief content is **deterministic template + evidence scaffolding**. No live LLM inference runs in this pass. County briefs classify readiness from workbench depth, KH overlay, and goal verification state — not from generative language.

---

## 4. Live LLM status

| Setting | Value |
|---------|-------|
| `liveLlmEnabled` | **false** |
| Reason | NSI-12 deterministic-first; operator button + review queue required before live inference |
| Contracts | `llmBriefDraftContracts.ts` — evidence packet input, claim ledger, unsupported-claim detector, route to `/admin/intelligence/llm-review-queue` |
| Required env (future) | `OPENAI_API_KEY` (optional), `ADMIN_SECRET` |

---

## 5. NSI-16 placeholder replaced

**Yes.** `intelligenceCommandCenter.ts` weekly packet block calls `buildWeeklyIntelligencePacket(dailyPacket)` with `status: "live"`. Command center UI renders all orchestrator fields. Governance test confirms `status !== "placeholder"`.

---

## 6. County public-brief readiness (75 counties)

| Tier | Count |
|------|-------|
| PUBLIC_BRIEF_READY | **0** |
| INTERNAL_MESSAGE_SOURCE_ONLY | **6** (Pope, Pulaski, Faulkner + KH overlay counties) |
| FIELD_PLANNING_ONLY | **0** |
| SHELL_ONLY | **69** |
| BLOCKED | **0** |

Full matrix: `docs/intelligence/COUNTY_PUBLIC_BRIEF_READINESS.md`  
75-county workbench matrix updated with **Public brief readiness** column.

---

## 7. Opposition / debate brief readiness

| Brief | Confidence | Notes |
|-------|------------|-------|
| Kim Hammer Opposition | **65/100** | 2 export-ready claims; 0/7 retrieval COMPLETE; thin writings archive |
| Debate Prep | **59/100** | Computed from debate readiness signals; 1 direct opponent clip |
| Rapid Response Prep | **40/100** | Appendix exists; no auto-send workflow |

**Opposition/debate composite readiness:** ~**55/100** (gap-driven, honest scoring)

---

## 8. Message intelligence readiness

**Score:** ~**61/100** (mean of opposition brief 65, debate brief 59, debate overall 59)

Produces safe themes, risky themes, claims needing verification, field organizer questions, debate questions, county listening prompts, and INTERNAL ONLY email/social angles. No final public copy generated outside review queue.

---

## 9. Governance status

| Gate | Status |
|------|--------|
| Default publishability | **NOT_PUBLISHABLE** (all briefs) |
| Default status | **DRAFT_INTERNAL** or **NEEDS_RESEARCH** |
| Governance labels | INTERNAL_DRAFT, NON_PUBLISHABLE, HUMAN_REVIEW_REQUIRED, SOURCE_GROUNDED, CLAIM_CHECK_REQUIRED, NOT_PUBLIC_CONTENT |
| LLM no-publish gate | **true** |
| LLM no-send gate | **true** |
| Shell counties → PUBLIC_BRIEF_READY | **Blocked** (0 counties) |
| Canonical goals mutated | **No** |
| Auto-send / auto-publish paths | **None** |

Governance score: **~93/100** (unchanged from prior audit; strengthened by brief defaults)

---

## 10. What cannot be used publicly yet

- **All 75 county public messaging briefs** — shell counties especially dangerous
- **Kim Hammer opposition claims** beyond 2 export-ready (human + KH-4 export workflow)
- **Debate rebuttals and drill cards** without candidate/comms sign-off
- **Any LLM draft** in review queue without human promotion
- **Proxy vote targets** must never appear as registration goals in public copy
- **County-specific localized promises** without canonical goal verification and local validator research

---

## 11. Files changed (this pass)

### Core brief system
- `src/lib/intelligence/briefs/governedBriefTypes.ts`
- `src/lib/intelligence/briefs/countyPublicBriefGenerator.ts`
- `src/lib/intelligence/briefs/oppositionDebateBriefGenerator.ts`
- `src/lib/intelligence/briefs/weeklyIntelligenceBrief.ts`
- `src/lib/intelligence/briefs/messageIntelligenceLayer.ts`
- `src/lib/intelligence/briefs/briefRegistry.ts`
- `src/lib/intelligence/briefs/llmBriefDraftContracts.ts`
- `src/lib/intelligence/intelligenceAgentOrchestrator.ts`
- `src/lib/intelligence/commandCenter/intelligenceCommandCenter.ts`
- `src/lib/intelligence/commandCenter/types.ts`

### Dashboards
- `src/components/admin/intelligence/PublicBriefGradeIntelligencePanel.tsx`
- `src/components/admin/intelligence/AiIntelligenceBrainPanel.tsx`
- `src/app/admin/(board)/intelligence/page.tsx`
- `src/app/admin/(board)/intelligence/debate-command/page.tsx`
- `src/app/admin/(board)/intelligence/command-center/CommandCenterDashboard.tsx`
- `src/app/admin/(board)/county-intelligence/page.tsx`
- `src/components/admin/county-intelligence/CountyCommandCenterPanel.tsx`

### Scripts & tests
- `scripts/generate-county-public-brief-artifacts.ts`
- `scripts/generate-county-readiness-matrix.mjs`
- `scripts/test-governed-brief-governance.ts`
- `package.json` (`intelligence:generate-county-briefs`, `agents:test-governed-brief-governance`)

### Generated artifacts
- `data/intelligence/briefs/county/*.json` (75 briefs + `_rollup.json`)
- `docs/intelligence/COUNTY_PUBLIC_BRIEF_READINESS.md`
- `docs/intelligence/COUNTY_WORKBENCH_75_COUNTY_READINESS_MATRIX.md` (public-brief-readiness column)

---

## 12. Commands run and results

| Command | Result |
|---------|--------|
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** (Prisma pool warnings during static gen — non-blocking) |
| `npm run intelligence:generate-county-briefs` | **PASS** — 75 briefs + readiness doc |
| `node scripts/generate-county-readiness-matrix.mjs` | **PASS** — 75 rows |
| `npm run agents:test-governed-brief-governance` | **PASS** — 17/17 checks |
| `npm run agents:test-intelligence-agent-daily-run` | **PASS** |
| `npm run agents:test-county-intelligence` | **PASS** |
| `npm run agents:test-ai-intelligence-copilot-tools` | **PASS** |
| `npm run agents:test-kim-hammer-evidence-index` | **PASS** |
| `npm run agents:test-strategic-scenario-simulation` | **PASS** |
| `npm run email:no-send-scan` | **WARN** (expected baseline — no ECC send paths) |

---

## 13. Failures / known blockers

| Item | Status |
|------|--------|
| Pre-existing `agents:test-opposition-workbench-debate-prep` bill count drift (18 vs 29) | **Not in scope** — data drift, not brief governance |
| 0/7 opposition retrieval tasks COMPLETE | **Research blocker** — briefs correctly flag |
| 1 direct debate clip | **Film room blocker** — briefs correctly flag |
| 0 counties PUBLIC_BRIEF_READY | **Expected** — by design until evidence + human approval |
| Live LLM drafting | **Deferred** — contracts ready, operator button not wired |
| Prisma max connections during build static gen | **Environmental** — build still succeeded |

---

## 14. Next recommended pass

1. **Wire operator LLM draft button** behind NSI-12 review queue (evidence packet in → claim ledger out → queue only).
2. **Close top 3 opposition retrieval tasks** to raise opposition brief confidence above 70.
3. **Index 2+ opponent debate/forum clips** for film room and debate brief lift.
4. **Canonical registration goal backfill** for v2 counties (Pope, Pulaski, Faulkner) — prerequisite for any county approaching PUBLIC_BRIEF_READY.
5. **Institutional memory seed** for top 5 KH overlay counties to move INTERNAL_MESSAGE_SOURCE_ONLY toward field-deployable.
6. **Days 4–7 compression:** Safe for internal operator use; **not safe** for public county messaging or opposition claims without human review pass.

---

## WorkflowIntake / Kelly SOS slice note

This pass is intelligence/brief governance — not form submission. WorkflowIntake from `/api/forms` unchanged. Operator review/export path for forms remains prior slice work.
