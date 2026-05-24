# AI Agent Tool Build Map

**Lane:** `RedDirt/`  
**Catalog source of truth:** `src/lib/campaign-events/ai-tools-master-catalog.ts` (+ `ai-tools-supplement.ts`)  
**UI:** `/admin/campaign-events/ai-tools`  
**Deep doc:** [`AI_AGENT_OPERATIONAL_TOOL_SYSTEM.md`](./AI_AGENT_OPERATIONAL_TOOL_SYSTEM.md)  
**Roadmap:** [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md) · **Sprint status:** [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md)

---

## Campaign Orchestration Intelligence (Sprint 16 — NEXT MAJOR MILESTONE)

| Artifact | Path |
|----------|------|
| Inventory (16 systems) | [`ORCHESTRATION_INTELLIGENCE_INVENTORY.md`](./ORCHESTRATION_INTELLIGENCE_INVENTORY.md) |
| Architecture (8 layers) | [`CAMPAIGN_ORCHESTRATION_INTELLIGENCE_ARCHITECTURE.md`](./CAMPAIGN_ORCHESTRATION_INTELLIGENCE_ARCHITECTURE.md) |
| Domain map (20 domains) | [`ORCHESTRATION_DOMAIN_MAP.md`](./ORCHESTRATION_DOMAIN_MAP.md) |
| Build roadmap | [`ORCHESTRATION_BUILD_ROADMAP.md`](./ORCHESTRATION_BUILD_ROADMAP.md) |
| Tool contracts (**39**) | `src/lib/agents/orchestration/orchestration-tool-contracts.ts` |
| Lifecycle id | `campaign_orchestration_intelligence` |
| Test | `npm run agents:test-orchestration-plan` |
| Live state test | `npm run agents:test-orchestration-state` |
| Live API | `GET /api/agents/orchestration-state` |
| Agent protocol | `docs/ERNIE_CAMPAIGN_OS_WORK_PROTOCOL.md` |

---

## Campaign Knowledge Graph + Lessons (Sprint 17 — Phase 3A)

| Artifact | Path |
|----------|------|
| Module | `src/lib/agents/orchestration/knowledge/` |
| Handoff | [`ORCHESTRATION_PHASE_3A_KNOWLEDGE_GRAPH_LESSONS_HANDOFF.md`](./ORCHESTRATION_PHASE_3A_KNOWLEDGE_GRAPH_LESSONS_HANDOFF.md) |
| Tool contracts (**20**) | `src/lib/campaign-events/ai-tools/sprint-campaign-knowledge-tools.ts` |
| Lifecycle id | `campaign_knowledge_graph` |
| Test | `npm run agents:test-campaign-knowledge` |
| Read-only API | `GET /api/agents/campaign-knowledge-state` |
| CampaignState field | `campaignState.knowledge` |

---

## Feedback + Lesson Approval Loop (Phase 3B)

| Artifact | Path |
|----------|------|
| Module | `src/lib/agents/orchestration/feedback/` |
| Handoff | [`ORCHESTRATION_PHASE_3B_FEEDBACK_LESSON_APPROVAL_HANDOFF.md`](./ORCHESTRATION_PHASE_3B_FEEDBACK_LESSON_APPROVAL_HANDOFF.md) |
| Test | `npm run agents:test-orchestration-feedback-loop` |
| Feedback API | `GET/POST /api/agents/orchestration-feedback` |
| Lesson approval API | `GET/POST /api/agents/lesson-approvals` |
| CampaignState field | `campaignState.feedbackLoop` |
| Dashboard | `/admin/orchestration` — Feedback + Lesson Approval Loop |

---

## AI Agent Tooling Brain (Phase 4A)

| Artifact | Path |
|----------|------|
| Module | `src/lib/agents/orchestration/tooling/` |
| Handoff | [`ORCHESTRATION_PHASE_4A_AGENT_TOOLING_BRAIN_HANDOFF.md`](./ORCHESTRATION_PHASE_4A_AGENT_TOOLING_BRAIN_HANDOFF.md) |
| Unified registry | `agent-tool-registry.ts` — 737 tools typical |
| Test | `npm run agents:test-agent-tooling-brain` |
| Read-only API | `GET /api/agents/orchestration-tooling-state` |
| CampaignState field | `campaignState.agentTooling` |

---

| Artifact | Path |
|----------|------|
| Full inventory | [`GLOBAL_AI_AGENT_TOOL_INVENTORY.md`](./GLOBAL_AI_AGENT_TOOL_INVENTORY.md) |
| Architecture | [`ALL_KNOWING_CAMPAIGN_AGENT_ARCHITECTURE.md`](./ALL_KNOWING_CAMPAIGN_AGENT_ARCHITECTURE.md) |
| Learning roadmap | [`AI_AGENT_OBSERVATION_AND_LEARNING_ROADMAP.md`](./AI_AGENT_OBSERVATION_AND_LEARNING_ROADMAP.md) |
| Master registry v0 | `src/lib/agents/master-tool-registry/` |
| Global tools (20) | `src/lib/campaign-events/ai-tools/sprint-global-agent-tools.ts` |
| Hub | `/admin/ai-command-center` |
| User intelligence arch | [`USER_INTELLIGENCE_AGENT_ARCHITECTURE.md`](./USER_INTELLIGENCE_AGENT_ARCHITECTURE.md) |
| Writing agent arch | [`WRITING_AGENT_ARCHITECTURE.md`](./WRITING_AGENT_ARCHITECTURE.md) |
| UX / pathways | [`UX_PSYCHOLOGY_AND_PATHWAY_TOOLS.md`](./UX_PSYCHOLOGY_AND_PATHWAY_TOOLS.md) |
| Command center doc | [`ALL_KNOWING_AGENT_COMMAND_CENTER.md`](./ALL_KNOWING_AGENT_COMMAND_CENTER.md) |
| Sprint 1 contracts | `src/lib/campaign-events/ai-tools/sprint-agent-intelligence-tools.ts` (**35 tools**) |
| Sprint 2 contracts | `src/lib/campaign-events/ai-tools/sprint-agent-intelligence-2-tools.ts` (**15 tools**) |
| Sprint 3 contracts | `src/lib/campaign-events/ai-tools/sprint-agent-intelligence-3-tools.ts` (**16 tools**) |
| Unified runtime | `src/lib/agents/runtime/` + `npm run agents:test-runtime` |

---

## Agent Intelligence Sprint 3

| Component | Path | Status |
|-----------|------|--------|
| Unified runtime | `campaign-agent-runtime.ts` | functional V1 |
| Intent classifier | `intent-classifier.ts` | deterministic V1 |
| Safe tool router | `tool-router.ts` + `tool-execution-guard.ts` | functional V1 |
| Command palette | `AgentCommandPalette.tsx` | functional V1 |
| Ask Kelly / Kelly Agent bridge | `src/lib/agents/adapters/*` | partial (registry map, no rewrite) |
| Memory review | `/admin/ai-command-center/memory-review` | functional JSON queue |
| Runtime audit | `data/campaign-events/agent-runtime-audit.json` | functional append-only |

**Human control:** palette and runtime recommend/route only; high-risk intents blocked or flagged for approval.

---

## Agent Intelligence Sprint 1

| Lane | Catalog lifecycle ids | Count |
|------|----------------------|-------|
| User intelligence | `agent_user_intelligence` | 5 |
| Writing agent | `agent_writing` | 9 |
| UX psychology | `agent_ux_intelligence` | 9 |
| Campaign intelligence | `agent_campaign_intelligence` | 6 |
| System intelligence | `agent_system_intelligence` | 6 |

**Runtime (V1):** `next-action-engine.ts`, `campaign-gap-analyzer.ts`, `microcopy-registry.ts`, `writing-suggestion-builder.ts` — deterministic only.

---

## Catalog snapshot (code-grounded)

| Metric | Value |
|--------|-------|
| Lifecycle groups | 22 |
| Tools (master + supplement + agent intel, deduped) | ~269 |
| Status: **functional** | ~31 |
| Status: **partial** | ~37 |
| Status: **scaffolded** | ~18 |
| Status: **idea** | ~45 |
| Human approval required (majority of write paths) | Yes |

**Rule:** New tools → edit catalog only. Wire runtime in sprint packets; update `ai-tools-operational-meta.ts` when files exist.

**Maturity score** on AI tools page = average of status points (functional=100, partial=65, scaffolded=30, idea=5). **Not** month reimbursement readiness.

---

## Sprint → AI tools matrix

Tools below are **named in the master build plan**. Map to catalog `id` for implementation and status updates.

### Sprint 0 — Build control

| Planned agent | Catalog id (closest) | Status | Sprint action |
|---------------|---------------------|--------|---------------|
| *(none — docs only)* | — | — | Keep catalog in sync with this map |

---

### Sprint 1 — Reimbursement

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Reimbursement readiness checker | `mr-reimburse-dollar` + month-readiness | partial / functional | Extend `month-readiness` scoring for reimb finalization |
| Mileage anomaly detector | `mr-rt-miles` | functional | Add anomaly rules module (deterministic first) |
| Missing city/county resolver | `cri-infer-county`, `fc-zip-county` | partial | Queue on travel-log + review `focus=` params |
| Reimbursement summary writer | `tl-month-report` | functional | Add narrative export block on travel-report / reimbursement |
| Final packet checklist agent | *(new id recommended)* `mr-final-packet-checklist` | idea | Add to catalog; checklist UI on reimbursement page |

**Related functional tools:** `mr-origin-rule`, `mr-rt-miles`, `appr-month-wizard` (travel mode), `tl-month-report`.

---

### Sprint 2 — Intake → ledger

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Intake-to-ledger bridge | `intake-to-ledger-bridge` | **functional** | `intake-ledger-bridge.ts` on persist |
| Intake duplicate detector | `intake-duplicate-detector` | **functional** | `_intake.duplicateRisk` |
| Intake conflict detector | `intake-conflict-detector` | **functional** | `_intake.scheduleConflict` |
| Tentative event router | `tentative-event-router` | **functional** | `calendar-lane.ts` + `TENTATIVE_CALENDAR` |
| Intake summary builder | `intake-summary-builder` | **functional** | `intake-inference.ts` |
| Tentative review assistant | `tentative-review-assistant` | **functional** | `IntakeAiSummaryCard.tsx` |
| Website intake normalizer | `website-intake-normalizer` | **functional** | fact card seed from form |
| Schedule risk scanner | `schedule-risk-scanner` | **partial** | assistant flags + overlap |
| Intake classifier | `intake-classify-type` | functional | Used in bridge inference |
| Missing-info detector | `fc-missing-gaps` | functional | `inferred.missingFields` |
| Approval package builder | `appr-package-build` | partial | Existing scaffold; intake rows eligible |

---

### Sprint 3 — Google Calendar truth

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| GCal read status checker | `gcal-read-status-checker` | **functional** | `resolve-ledger-calendar-sync.ts` |
| GCal ledger match assistant | `gcal-ledger-match-assistant` | **functional** | `match-calendar-truth-to-ledger.ts` |
| Normalized JSON freshness monitor | `normalized-json-freshness-monitor` | **functional** | `normalized-json-freshness.ts` |
| Website-only event router | `website-only-event-router` | **functional** | truth `WEBSITE_ENTRY_ONLY` |
| Imported-only event router | `imported-only-event-router` | **functional** | truth `IMPORTED_FROM_NORMALIZED_JSON` |
| Stale calendar warning agent | `stale-calendar-warning-agent` | **functional** | workbench banner + dashboard |
| Tentative calendar readiness | `tentative-calendar-readiness-checker` | **partial** | lane + truth status |
| Official calendar readiness | `official-calendar-readiness-checker` | **partial** | lane + truth status |
| Calendar sync command advisor | `calendar-sync-command-advisor` | **functional** | calendar-sync dashboard CLI block |
| Conflict detector | `conf-schedule`, `conf-work-hours` | functional | GCal title/date conflict |
| Calendar freshness monitor | `intake-gcal-read` | partial | Extended via truth layer |

---

### Sprint 4 / 4A — Approval package + AI toolchain

**15 V1 tools** in lifecycle `sprint4_approval_email` — contracts in `src/lib/campaign-events/ai-tools/sprint4-approval-email-tools.ts`.

| Tool id | Status |
|---------|--------|
| `email-architecture-tracer` | functional |
| `approval-email-config-checker` | functional |
| `approval-email-template-builder` | functional |
| `approval-email-subject-writer` | functional |
| `approval-email-summary-writer` | functional |
| `approval-token-builder` | functional |
| `approval-token-validator` | functional |
| `approval-action-writer` | functional |
| `approval-send-guard` | functional |
| `approval-send-audit-logger` | functional |
| `approval-inbox-router` | functional |
| `approval-email-risk-scanner` | functional |
| `approval-followup-recommender` | scaffolded |
| `approval-human-review-gate` | functional |
| `approval-google-write-blocker` | functional |

Legacy catalog ids (`appr-package-build`, `appr-email-send`) remain; Sprint 4 ids are canonical for automation.

**Ops:** `npm run campaign-events:test-approval-email -- --dry-run` · Docs: `SPRINT4_AI_TOOLCHAIN.md`, `APPROVAL_PACKAGE_EMAIL_WORKFLOW.md`

---

### Sprint 5 — Controlled GCal promotion (canonical V1 ids)

| Tool id | Status | Helper / route |
|---------|--------|----------------|
| `promotion-readiness-checker` | functional | `promotion-readiness.ts` |
| `tentative-calendar-router` | functional | Kelly tentative source |
| `official-calendar-router` | functional | Kelly confirmed source |
| `promotion-conflict-scanner` | partial | readiness + row conflicts |
| `google-payload-builder` | functional | `build-google-payload.ts` |
| `google-write-guard` | functional | `promotion-config.ts` |
| `promotion-audit-logger` | functional | `_calendarPromotionLog` |
| `promotion-risk-summary-writer` | partial | `sprint5-tool-helpers.ts` |
| `promotion-retry-handler` | partial | promote + workbench retry |
| `promotion-human-review-gate` | functional | workbench Promote buttons |
| `duplicate-google-event-detector` | partial | heuristics v1 |
| `calendar-lane-health-checker` | functional | OAuth + source readiness |
| `promotion-observation-recorder` | functional | `_aiObservations` |
| `official-calendar-safety-blocker` | functional | blocks unhealthy official writes |
| `google-write-status-summarizer` | partial | dashboards + workbench |

**Ops:** `npm run campaign-events:test-calendar-promotion -- --dry-run` · Docs: `SPRINT5_AI_TOOLCHAIN.md`, `SPRINT5_GOOGLE_WRITE_TRACE.md`

Legacy catalog `appr-promote-official` remains idea — use Sprint 5 ids above for automation.

---

### Sprint 6 — Event planning drilldown (May 2026)

| Component | Path | Status |
|-----------|------|--------|
| Planning workbook | `EventPlanningWorkbook.tsx` | functional V1 |
| Persist | `factCard._eventPlanning` | functional |
| Tools | `sprint-event-planning-6-tools.ts` (**15**) | functional/partial |

---

### Sprint 6 — Event planning drilldown (legacy matrix)

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Run-of-show generator | `ros-generator` (supplement) | idea | Drilldown tab + template |
| Pack-list generator | materials lifecycle tools | idea/scaffolded | Link `campaign-materials-inventory.json` |
| Volunteer estimator | `vol-estimate` | partial | Already in inference |
| Candidate briefing writer | `cb-daily-agenda` | scaffolded | Server draft optional |
| CM briefing writer | `cm-planner-notes` | scaffolded | Same |
| Event risk scanner | `conf-*` + inference | partial | Single “risk” panel on drilldown |

---

### Sprint 7 — Hot wash intelligence + county memory (May 2026)

| Component | Path | Status |
|-----------|------|--------|
| Intelligence workspace | `hot-wash/HotWashIntelligenceWorkspace.tsx` | functional V1 |
| Persist | `factCard._hotWashIntelligence` | functional |
| County memory | `county-memory/` JSON store | functional additive |
| Event blueprints | `event-blueprints/blueprint-store.ts` | functional V1 |
| Learning loop | `campaign-learning-loop.ts` | functional |
| Tools | `sprint-event-intelligence-7-tools.ts` (**20**) | functional / planned (speech-quote) |
| Observations | `user-observations.ts` Sprint 7 events | functional |

**Docs:** `HOT_WASH_INTELLIGENCE_SYSTEM.md`, `COUNTY_MEMORY_ENGINE.md`, `EVENT_BLUEPRINT_SYSTEM.md`, `CAMPAIGN_LEARNING_LOOP.md`

**Test:** `npm run campaign-events:test-hot-wash-intelligence`

**V2:** Whisper transcription, OCR, face detection, vector chunking — scaffolds only in V1.

---

### Communications Intelligence V2 (May 2026)

| Component | Path | Status |
|-----------|------|--------|
| Relationship graph | `src/lib/communications/relationship-intelligence/` | functional |
| Sequences | `src/lib/communications/sequences/` | functional |
| Writing orchestration | `src/lib/communications/writing-orchestration/` | functional |
| Memory | `src/lib/communications/memory/` | functional |
| Intelligence dashboard | `/admin/communications/intelligence` | functional |
| Message Studio | `/admin/communications/studio` | functional V1 |
| Tools V2 (41) | `sprint-communications-intelligence-v2-tools.ts` | functional |
| Email OS Suite (66) | `sprint-email-os-agent-tools.ts` | functional |

**Docs:** `COMMUNICATIONS_INTELLIGENCE_SYSTEM.md`, `RELATIONSHIP_INTELLIGENCE_GRAPH.md`, `COMMUNICATION_SEQUENCE_ENGINE.md`

**Tests:** `communications:test-intelligence`, `communications:test-relationships`, `communications:test-writing-orchestration`

---

### County Intelligence Bridge V1 + V2 (May 2026)

| Component | Path | Status |
|-----------|------|--------|
| Workbench adapter | `county-intelligence/county-workbench-adapter.ts` | functional read-only |
| Action packages | `county-action-package-builder.ts` | functional |
| Copilot applications | `county-copilot-applications.ts` | functional |
| Command center | `/admin/county-intelligence` | functional |
| Tools V1 (20) | `sprint-county-intelligence-tools.ts` | functional |
| Tools V2 (15) | `sprint-county-intelligence-v2-tools.ts` | functional |
| Lifecycle | `county_intelligence_bridge` | 35 tools merged in supplement |

**Docs:** `COUNTY_INTELLIGENCE_ENGINE.md`, `COUNTY_COPILOT_APPLICATIONS.md`, `COUNTY_ACTION_PACKAGE_SYSTEM.md`

**Tests:** `agents:test-county-intelligence`, `agents:test-county-copilots`

---

### Agent OS Control Layer (May 2026)

| Component | Path | Status |
|-----------|------|--------|
| State snapshot | `campaign-os-state-snapshot.ts` | functional |
| Workflow planner | `os-workflow-planner.ts` | functional |
| Action preparer | `agent-action-preparer.ts` | functional |
| Gate matrix | `human-approval-gate-matrix.ts` | functional |
| Tool readiness | `tool-execution-readiness.ts` | functional |
| Command center | `CampaignOsControlPanel.tsx` | functional |
| Tools (15) | `sprint-agent-os-control-tools.ts` | functional |

**Test:** `npm run agents:test-os-control`

---

### Sprint 8 — Finance + compliance operations (May 2026)

| Component | Path | Status |
|-----------|------|--------|
| Event financial ops | `finance/EventFinancialOperationsWorkspace.tsx` | functional V1 |
| Reimbursement ops | `ReimbursementOperationsPanel.tsx` | functional V1 |
| Document pipeline | `finance-document-store.ts` | functional (no OCR) |
| Tools (20) | `sprint-campaign-finance-8-tools.ts` | functional / partial |

**Test:** `npm run campaign-events:test-finance-operations`

**V2:** FIN-1 mapper, OCR, automated filing export.

### Sprint 8 — Finance / compliance (legacy matrix)

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Compliance category suggester | compliance lifecycle | idea | Map to `FinancialTransaction` categories |
| Reimbursement-to-FIN mapper | `tl-event-link` | idea | **V2 after Sprint 8 ops** |
| Receipt matcher | compliance/receipts JSON + FIN | idea | Link `ComplianceDocument` |
| Audit packet builder | compliance exports | idea | Align `data/compliance/` exports |
| Finance anomaly detector | `mr-reimburse-dollar` | functional | Cross-check ledger vs FIN rows |

---

### Sprint 9 — Dashboards

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Dashboard priority agent | CM/candidate briefing tools | scaffolded | Command center widget |
| Next-action recommender | `ai-agent-runbook` stages | functional doc | Surface on dashboards |
| Campaign health summarizer | BRAIN-OPS truth snapshot | partial | Reuse `getTruthSnapshot` |
| Candidate daily brief agent | `cb-daily-agenda` | scaffolded | Email/print brief (no auto send) |
| CM daily ops brief agent | `cm-planner-notes` | scaffolded | Same |

---

### Sprint 10 — Client product

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Client onboarding agent | `saas_client_dashboard` group | idea | Tenant setup wizard |
| Campaign setup wizard | `saas-planner-scaffold` | scaffolded | Generalize Franklin planner |
| Product demo narrator | *(new)* | idea | Demo mode only |
| Tenant config checker | *(new)* | idea | Preflight for client env |
| Client health report agent | `saas-*` | idea | Weekly ops PDF/email draft |

---

## Implementation order (AI layer)

Across sprints, prefer this **tooling** sequence:

1. **Deterministic** helpers (queues, counts, conflicts) — no OpenAI required.
2. **Draft / scaffold** outputs saved on `factCard` or `metadataJson` — human publishes.
3. **OpenAI optional** paths behind `OPENAI_API_KEY` — same guardrails as email AI / intake classify.
4. **Outbound** tools last — always behind config flags + human approval.

---

## Files to touch when wiring a tool

| Concern | File |
|---------|------|
| Register tool | `ai-tools-master-catalog.ts` or `ai-tools-supplement.ts` |
| Files + routes + checklist | `ai-tools-operational-meta.ts` |
| Dashboard sections | `ai-tools-command-center.ts` |
| Operator runbook | `ai-agent-runbook.ts` |
| UI | `AiToolsCommandCenter.tsx` |

---

## Agent runbook (13 stages)

End-to-end process stages live in `src/lib/campaign-events/ai-agent-runbook.ts`. Align sprint work to stages:

1. Intake → 2. Classify → 3. Ledger row → 4. Review → 5. Travel → 6. Reimbursement → 7. Approval → 8. Calendar promote → 9. Execute event → 10. Hot wash → 11. Finance → 12. Report → 13. Learn

Update runbook stage notes when a sprint closes.

---

## Sprint 14 — Volunteer OS (25 tools)

| Contract file | `src/lib/campaign-events/ai-tools/sprint-volunteer-tools.ts` |
| Lifecycle | `volunteer_system` (order 45) |
| Hub | `/admin/volunteers` |
| Test | `npm run campaign-events:test-volunteer-system` |
| Docs | `VOLUNTEER_MANAGEMENT_SYSTEM.md`, `VOLUNTEER_COPILOTS.md` |

---

## Maintenance checklist

After each sprint:

- [ ] New tools added to catalog with unique `id`
- [ ] `deriveOperationalMeta()` picks up routes from `implementationFiles`
- [ ] Status bumped (`idea` → `scaffolded` → `partial` → `functional`)
- [ ] This map’s sprint table updated
- [ ] No duplicate catalog in deprecated `ai-tools-catalog.ts`
