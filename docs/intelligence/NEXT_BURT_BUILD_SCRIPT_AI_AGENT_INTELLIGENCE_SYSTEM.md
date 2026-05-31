# NEXT BURT BUILD SCRIPT — AI Agent Intelligence System

**Ready-to-paste implementation script for the next major pass**  
**Lane:** RedDirt/ only  
**Date:** 2026-05-31  
**Goal:** Fully functional AI-agent-driven Intelligence Command Center + Debate prep room + County intelligence — human-reviewed drafting only, deployment-safe governance, no fake completion claims.

---

## Pre-flight (operator / agent)

```powershell
cd H:\SOSWebsite\RedDirt

# Read first (do not skip)
# docs/intelligence/INTELLIGENCE_OPPOSITION_DEBATE_FULL_PROGRESS_REPORT.md
# docs/intelligence/AI_AGENT_INTELLIGENCE_SYSTEM_DEPLOYMENT_PLAN.md
# docs/county-registration-goals-verification.md

npm run typecheck
npm run email:no-send-scan
```

**Hard stops:**
- Do not mutate `CountyCampaignStats.registrationGoal` values  
- Do not overwrite canonical county data  
- Do not introduce live sends  
- Do not publish LLM-generated claims  
- Do not bypass human review  
- Do not touch sos-public, ajax, phatlip, countyWorkbench lanes (read bridge only)

---

## Pass 1 — County goal split-brain fix (READ PATH ONLY)

**Problem:** `county-workbench-adapter.ts` exposes vote-share proxy as `registrationGoal`.

### 1.1 Rename proxy field in types

**File:** `src/lib/agents/county-intelligence/county-kpi-types.ts`

- Add `planningVoteTargetProxy: number | null`  
- Add `planningVoteTargetSource: "arkansasStateAlignedTargets2022"`  
- Deprecate alias: keep `registrationGoal` as optional computed display field **only if** canonical DB goal null — document in JSDoc  
- Add `canonicalRegistrationGoal: number | null`  
- Add `canonicalRegistrationGoalSource: "CountyCampaignStats" | null`

### 1.2 Adapter read path

**File:** `src/lib/agents/county-intelligence/county-workbench-adapter.ts`

- Import Prisma read helper (new): `getCanonicalCountyRegistrationGoal(countySlug)`  
- Set `planningVoteTargetProxy` from `targetDemVotesStatewide50`  
- Set `canonicalRegistrationGoal` from Prisma (read-only)  
- Set display `registrationGoal` = `canonicalRegistrationGoal ?? null` (do **not** fall back to proxy without explicit `goalDisplayMode: "proxy-labeled"`)  
- Update `goalSource` field to distinguish `"canonical-db" | "not-set" | "planning-estimate-proxy"`

**New file:** `src/lib/campaign-engine/county-registration-goal-read.ts`

```typescript
// Read-only — never write registrationGoal from this module
export async function getCanonicalCountyRegistrationGoal(countySlug: string): Promise<number | null>
```

Wire to existing `listCountyRegistrationGoals()` or direct Prisma query by county slug.

### 1.3 UI label fix

**Files:**
- `src/components/admin/county-intelligence/CountyCommandCenterPanel.tsx`  
- `src/components/admin/orchestration/OrchestrationCountyAgentRuntimePanel.tsx`  
- Any component showing `registrationGoal` from adapter

Show dual line when both exist:
- **Campaign registration goal (canonical):** value or `Not set in admin`  
- **Planning vote target (estimate):** proxy value with warning badge  

### 1.4 Tests

**New script:** `scripts/test-county-goal-read-path.ts`

- Assert adapter returns `canonicalRegistrationGoal` separately from proxy  
- Assert no code path sets proxy into Prisma  
- Run: `npm run agents:test-county-intelligence` (must still pass)

### 1.5 Acceptance

- [ ] Admin county editor goal unchanged after pass  
- [ ] Intelligence panels show canonical vs proxy distinctly  
- [ ] No mutation of voter goals anywhere in diff  

---

## Pass 2 — Debate Command Center computed readiness

**Problem:** Hardcoded scores in `debateCommandCenter.ts` (71, 74, 80, …).

### 2.1 Computed score function

**New file:** `src/lib/opposition/debateReadinessSignals.ts`

Inputs:
- `loadKimHammerWorkbench()` gap counts  
- `summarizeDebateScenarioPrep()` HIGH/MEDIUM risk counts  
- Export-ready claim count from evidence index  
- Open retrieval task count  
- LLM review queue pending count (optional weight)

Output: `ReadinessScore[]` with formula documented in file header.

Replace hardcoded `score:` values in `buildDebateCommandCenterState()`.

### 2.2 Drill session state (minimal)

**New JSON:** `data/intelligence/debate-drill-session-log.json`  
**New file:** `src/lib/opposition/debateDrillSession.ts`

- `recordDrillCompletion(drillId, operatorNote, selfScore1to5)` — append only  
- Read in readiness computation (completion rate weight)

**Admin UI hook:** Add "Mark drill complete" on `/admin/intelligence/kim-hammer/debate-prep` drill cards — server action, admin auth only.

### 2.3 Film room MVP

**File:** `src/app/admin/(board)/intelligence/debate-command/page.tsx`

Replace placeholder prose section with:
- Clip list from `kim-hammer-debate-archive-index.json`  
- Link to source URL + governance tier  
- Empty state: "Archive gap — see intelligence-gaps task kh3b-long-tail-video-forum-record"

### 2.4 Tests

```powershell
npm run agents:test-opposition-workbench-debate-prep
npm run agents:test-kim-hammer-contrast-debate-profile
```

### 2.5 Acceptance

- [ ] No hardcoded readiness integers remain in `debateCommandCenter.ts`  
- [ ] Scores change when gap counts change (unit test)  
- [ ] Film room shows real archive entries or explicit gap message  

---

## Pass 3 — Intelligence Agent Orchestrator (deterministic daily pass)

### 3.1 Core orchestrator

**New file:** `src/lib/intelligence/agent/intelligenceAgentOrchestrator.ts`

```typescript
export type DailyAgentRunResult = {
  runId: string;
  generatedAt: string;
  priorities: DailyPriorityItem[];
  countyActions: CountyActionItem[];
  debateActions: DebateActionItem[];
  rapidResponseWatches: RapidResponseWatch[];
  suggestedResearchGaps: ResearchGapSuggestion[];
  draftsQueued: number;
  actionsSynced: number;
};

export function runDailyIntelligenceAgentPass(options?: {
  attemptLlm?: boolean;
  repoRoot?: string;
}): DailyAgentRunResult;
```

Implement Phase A–D from deployment plan (deterministic first).

### 3.2 Sub-planners

**New files:**
- `src/lib/intelligence/agent/dailyPrioritiesPlanner.ts`  
- `src/lib/intelligence/agent/countyPlanDraftBuilder.ts`  
- `src/lib/intelligence/agent/debatePrepDraftBuilder.ts`  
- `src/lib/intelligence/agent/researchGapRecommender.ts`  
- `src/lib/intelligence/agent/agentRunAuditLog.ts` → `data/intelligence/agent-run-audit-log.json`

### 3.3 Wire to command center

**File:** `src/lib/intelligence/commandCenter/intelligenceCommandCenter.ts`

- Replace weekly packet placeholder with last agent run summary (or "No run yet — trigger from Agent Daily Run")  
- Add `lastAgentRunAt`, `lastAgentRunId`, `topPrioritiesFromAgent[]`

### 3.4 Admin UI

**New route:** `src/app/admin/(board)/intelligence/agent-daily-run/page.tsx`

- Button: "Run daily intelligence pass (deterministic)"  
- Button: "Run with LLM drafting" (disabled if no OPENAI_API_KEY)  
- Show last run diff vs prior run  
- Link to action queue + LLM review queue  

**Server action:** `agent-daily-run-actions.ts` — calls orchestrator, returns result.

### 3.5 Tests

**New script:** `scripts/test-intelligence-agent-daily-run.ts`

```powershell
npm run agents:test-ai-intelligence-copilot-tools
tsx scripts/test-intelligence-agent-daily-run.ts
```

Assertions:
- All outputs NON_PUBLISHABLE  
- No sendgrid/gmail imports in agent module tree  
- `syncHumanActionQueue` called but no AUTO_COMPLETE statuses  
- Research gap suggestions do not auto-create tasks  

Add to `package.json`:
```json
"agents:test-intelligence-agent-daily-run": "tsx scripts/test-intelligence-agent-daily-run.ts"
```

### 3.6 Acceptance

- [ ] Command center shows real last-run metadata  
- [ ] Daily pass completes < 60s deterministic  
- [ ] Action queue gains SUGGESTION items with evidence dependencies  
- [ ] LLM queue gains drafts when attemptLlm true  

---

## Pass 4 — Copilot tool completion (16 generic fallbacks)

**File:** `src/lib/intelligence/aiCopilotOrchestrator.ts`

For each tool in registry with generic fallback, implement handler in `runDeterministicCopilotTool` switch:

Priority order:
1. `counterargument-predictor`  
2. `rebuttal-builder`  
3. `quote-miner`  
4. `timeline-gap-detector`  
5. `county-burden-analyzer`  
6. `claim-strength-evaluator`  
7. Remaining opposition/debate tools

Each handler must:
- Read from Kim Hammer JSON only  
- Call `validateCopilotSafety()`  
- Include `evidenceDependencies`  
- Never set `exportReady: true`

```powershell
npm run agents:test-ai-intelligence-copilot-tools
npm run agents:test-kim-hammer-kh4-copilot-layer
```

---

## Pass 5 — NSI-16 weekly packet + change signals

**File:** `src/lib/intelligence/commandCenter/intelligenceCommandCenter.ts`

Implement `buildChangeSignals` diff engine:
- Compare SHA or `generatedAt` of: human-action-queue, llm-draft-review-queue, kim-hammer-intelligence-gaps, public-media-intake queue  
- Emit `CommandCenterChangeSignal[]` with real deltas (new items since last run ID in `data/intelligence/command-center-last-snapshot.json`)

Replace `weeklyPacket.status: "placeholder"` with composed markdown INTERNAL_DRAFT from:
- `buildMorningBriefingPaper()`  
- Last agent run priorities  
- Institutional memory summary  

---

## Pass 6 — LLM gateway Phase 2 (optional, gated)

**File:** `src/lib/intelligence/llmDraftGateway.ts`

Only after Passes 1–5 green:

1. When `isOpenAIConfigured()` and `attemptLlm === true`, call OpenAI with:
   - Template from `llm-prompt-template-registry.json`  
   - Retrieved snippets bounded to 8k chars  
   - Mandatory `GOVERNANCE_CONTENT_HEADER`  
2. Post-process with `generateGovernanceWarnings()`  
3. Still append to review queue — never auto-promote  

```powershell
# Without key: deterministic path must still pass
npm run agents:test-ai-intelligence-copilot-tools

# With key in .env.local only (never commit):
# manual smoke on /admin/intelligence/agent-daily-run
```

---

## Pass 7 — Documentation + audit refresh

Update:
- `docs/intelligence/INTELLIGENCE_OPPOSITION_DEBATE_FULL_PROGRESS_REPORT.md` — scores after pass  
- `docs/intelligence/COUNTY_WORKBENCH_75_COUNTY_READINESS_MATRIX.md` — rerun `node scripts/generate-county-readiness-matrix.mjs`  
- Mark `docs/intelligence/NSI_FULL_STATUS_AUDIT.md` NSI-16 as LIVE (stale doc fix)

---

## Final quality gate

```powershell
cd H:\SOSWebsite\RedDirt
npm run typecheck
npm run email:no-send-scan
npm run agents:test-ai-intelligence-copilot-tools
npm run agents:test-intelligence-agent-daily-run
npm run agents:test-opposition-workbench-debate-prep
npm run agents:test-county-intelligence
npm run agents:test-kim-hammer-evidence-index
npm run build
```

If `npm run build` exceeds 10 min, `npm run build:clean` acceptable.

**Stop and hand off to Steve if:**
- `lane:preflight` equivalent fails  
- Same test fails twice  
- Any secret appears in output  
- Cross-lane files required  

---

## Completion report template (paste back to Steve)

```
Active lane: RedDirt/

Files changed:
- [list]

Commands run and results:
- typecheck: PASS/FAIL
- build: PASS/FAIL
- agents:test-intelligence-agent-daily-run: PASS/FAIL
- email:no-send-scan: WARN/PASS

WorkflowIntake from /api/forms: N/A this pass

Operator review/export path:
- /admin/intelligence/agent-daily-run → llm-review-queue → action-queue → KH-4 export control

County goal split-brain:
- canonical read path: YES/NO
- goals mutated: NO (required)

Remaining blockers:
- [list]

Days 4–7 compression safe: YES/NO with reason
```

---

## Explicitly out of scope for this pass

- Postgres migration of JSON queues  
- Public-facing opposition content  
- County v2 dashboard replication beyond Benton/Washington scoping doc  
- Autonomous email send  
- Generating new county vote/registration targets  
- Closing Kim Hammer retrieval tasks without human research  

---

## Suggested thread prompt for Cursor/Codex

```
Execute NEXT_BURT_BUILD_SCRIPT_AI_AGENT_INTELLIGENCE_SYSTEM.md Passes 1–3 only.
RedDirt lane. No goal mutations. Stop after quality gate and completion report.
```
