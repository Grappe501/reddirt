# Global AI / agent / tool inventory (SOSWebsite)

**Scope:** `SOSWebsite/` root and sibling lanes searched May 2026.  
**Purpose:** Single inventory for Steve’s **All-Knowing Campaign Agent** consolidation.  
**Active implementation lane for registry v0:** `RedDirt/` only (per coordination rules).

---

## Search summary

| Search terms | Primary hits |
|--------------|----------------|
| Ask Kelly / campaign guide | `RedDirt/src/components/campaign-guide/`, `/api/assistant`, public dock |
| Kelly Agent | `RedDirt/src/lib/kelly-agent/`, `/api/admin/kelly-agent/*`, `scripts/agent/*` |
| AI Agent / tool catalog | `RedDirt/src/lib/campaign-events/ai-tools-*`, `/admin/campaign-events/ai-tools` |
| OpenAI / RAG / embedding | `RedDirt/src/lib/openai/`, `SearchChunk`, ingest scripts |
| Compliance agents | `RedDirt/src/lib/compliance/ai/` |
| Email command center AI | `RedDirt/src/lib/email-command-center/ai-*` |
| County agents | `countyWorkbench/docs/agents/`, `COUNTY_BUILDER_AGENT_SPEC.md` |
| AJAX agents | `ajax/lib/agents/`, `/api/assistant/*` |
| Travel agent | `kelly-travel-reimbursement/src/lib/ai/`, Event OS travel tools |
| chatbot / LLM | Mostly Ask Kelly + comms + compliance receipt OCR |

**Folders searched:** `RedDirt/`, `countyWorkbench/`, `ajax/`, `phatlip/`, `sos-public/`, `kelly-travel-reimbursement/`, root docs.  
**Not primary (duplicate forks):** `RedDirt-main-travel-ledger/`, `RedDirt-receipts-push/` — mirror older copies; treat `RedDirt/` as canonical.

---

## Inventory legend

| Column | Meaning |
|--------|---------|
| **Kind** | `deterministic` · `llm` · `rag` · `automation` · `scaffold` · `hybrid` |
| **Unified?** | Should register in master agent (Y/N) |
| **Status** | functional · partial · scaffolded · idea |

---

## A. RedDirt — Ask Kelly (public + admin)

| Name | Path | Purpose | Status | Reads | Writes | Routes/APIs | Kind | Unified? |
|------|------|---------|--------|-------|--------|-------------|------|----------|
| Campaign guide dock | `src/components/campaign-guide/CampaignGuideDock.tsx` | Public floating “Ask Kelly” chat UI | functional | User message, pathname | UI only | Sitewide `(site)` layout | llm+rag | Y |
| Assistant API | `src/app/api/assistant/route.ts` | RAG + tool-calling completion, SSE | functional | SearchChunk, history | reply stream | `POST /api/assistant` | llm+rag | Y |
| Assistant tools (OpenAI) | `src/lib/assistant/tools.ts` | `list_upcoming_events`, `get_content_by_slug`, priorities, contact | functional | TS content modules | tool results to model | via `/api/assistant` | llm | Y |
| Assistant completion | `src/lib/assistant/run-completion.ts` | System prompt + tool loop | functional | RAG block | completion | `/api/assistant` | llm | Y |
| Playbooks / journey | `src/lib/assistant/playbooks.ts` | Path-aware prompt supplements | partial | pathname, beats | prompt text | `/api/assistant` | deterministic | Y |
| Semantic search API | `src/app/api/search/route.ts` | Keyword + semantic search | functional | SearchChunk | ranked hits | `POST /api/search` | rag | Y |
| Search UI | `src/components/search/SearchDialog.tsx` | Public search dialog | functional | user query | — | public | rag | Y |
| OpenAI client/embeddings | `src/lib/openai/*` | Shared LLM + embeddings | functional | env, text | vectors | all LLM routes | llm | Y |
| Prompts / governance | `src/lib/openai/prompts.ts` | Static policy + voice | functional | — | prompt strings | all LLM | deterministic | Y |
| Intake classifier | `src/lib/openai/classify.ts` | Form intent classification | functional | submission text | IntakeClassification | intake POST | llm | Y |
| Ask Kelly admin onboarding | `src/app/admin/(board)/ask-kelly/page.tsx` | Candidate onboarding UX | functional | copy modules | localStorage progress | `/admin/ask-kelly` | scaffold | Y |
| Ask Kelly TTS | `src/app/api/ask-kelly/tts/route.ts` | Read-aloud | partial | text | audio stream | `/api/ask-kelly/tts` | llm | N |
| Campaign guide open event | `src/lib/campaign-guide/open.ts` | CTA opens dock | functional | — | window event | homepage | deterministic | Y |

**Orphan risk:** Admin Ask Kelly onboarding references `/admin/workbench/ask-kelly-beta` — verify route exists before demo.

---

## B. RedDirt — Kelly Agent (admin tool bundle)

| Name | Path | Purpose | Status | Reads | Writes | Routes/APIs | Kind | Unified? |
|------|------|---------|--------|-------|--------|-------------|------|----------|
| Kelly agent tools runner | `src/lib/kelly-agent/kelly-agent-tools.ts` | Bundles deterministic reports for LLM context | functional | calendar JSON, counties, media index | tool bundle JSON | `/api/admin/kelly-agent/recommend` | hybrid | Y |
| Agent context pack | `src/lib/kelly-agent/build-agent-context-pack.ts` | Assembles pack for tasks | functional | DB, files | AgentContextPack | recommend API | deterministic | Y |
| Schedule settlement | `src/lib/kelly-agent/kelly-agent-schedule-settlement.ts` | Settlement recommendations | partial | calendar items | suggestions | `/api/admin/kelly-agent/schedule-settlement` | deterministic | Y |
| Public scheduling agent | `src/lib/kelly-agent/public-scheduling-agent.ts` | Public form staff flags | partial | form body | staff flags (private) | schedule API | deterministic | Y |
| Tool: schedule readiness | `src/lib/kelly-agent/tools/schedule-readiness-tool.ts` | Pre-flight schedule | functional | calendar | report | agent bundle | deterministic | Y |
| Tool: calendar sync readiness | `tools/calendar-sync-readiness-tool.ts` | OAuth/sync health | functional | CalendarSource | report | agent bundle | deterministic | Y |
| Tool: calendar smoke test | `tools/calendar-smoke-test-tool.ts` | Smoke checks | functional | env | report | scripts + agent | deterministic | Y |
| Tool: event coverage plan | `tools/event-coverage-plan-tool.ts` | Coverage gaps | partial | events | summary | agent bundle | deterministic | Y |
| Tool: volunteer capacity | `tools/volunteer-capacity-tool.ts` | Capacity snapshot | partial | field data | summary | agent bundle | deterministic | Y |
| Tool: candidate dashboard preflight | `tools/candidate-dashboard-preflight-tool.ts` | Dashboard preflight | functional | dashboards | report | agent bundle | deterministic | Y |
| Agent scripts | `scripts/agent/*.ts` | Audit, knowledge index, tool suite | functional | data/agent/*.json | reports | CLI | deterministic | Y |
| Agent knowledge index | `data/agent/kelly-agent-knowledge-index.json` | Indexed knowledge metadata | scaffold | ingested docs | JSON | CLI ingest | rag | Y |

**Duplicate/overlap:** Kelly Agent calendar tools overlap Campaign Event OS calendar-sync + Sprint 5 promotion — **consolidate** under master registry with domain tags.

---

## C. RedDirt — Campaign Event OS (catalog + sprints)

**Canonical catalog:** `src/lib/campaign-events/ai-tools-master-catalog.ts` + `ai-tools-supplement.ts`  
**Live UI:** `/admin/campaign-events/ai-tools`  
**Approximate tool count:** 120+ catalog entries (master + supplement + Sprint 4/5/ global).

| Subsystem | Key paths | Sprint tools | Kind | Unified? |
|-----------|-----------|--------------|------|----------|
| Intake / ledger | `intake-ledger-bridge.ts`, `intake-inference.ts` | intake-* | deterministic | Y |
| Approval | `approval-package.ts`, `approval-email/*` | 15× Sprint 4 | deterministic+obs | Y |
| Calendar truth | `calendar-sync/*` | gcal-read-* | deterministic | Y |
| GCal promotion | `calendar-promotion/*` | 15× Sprint 5 | deterministic+obs | Y |
| Travel / reimbursement | `travel-report/*`, `month-readiness/*` | mr-*, rpt-* | deterministic | Y |
| Global orchestration | `ai-tools/sprint-global-agent-tools.ts` | 20× global | deterministic | Y |
| Observations | `ai-tools/observations*.ts` | all sprints | deterministic | Y |
| Inference (no OpenAI) | `infer-event-assumptions.ts`, `approval-summary-builder.ts` | — | deterministic | Y |

**Docs:** `AI_AGENT_TOOL_BUILD_MAP.md`, `SPRINT4_AI_TOOLCHAIN.md`, `SPRINT5_AI_TOOLCHAIN.md`, `AI_AGENT_OPERATIONAL_TOOL_SYSTEM.md`.

---

## D. RedDirt — Calendar / legacy Google

| Name | Path | Purpose | Status | Writes Google? | Unified? |
|------|------|---------|--------|----------------|----------|
| pushCampaignEventToGoogle | `src/lib/calendar/google-sync-engine.ts` | Legacy CampaignEvent push | functional | **Yes** | Y (flag duplicate) |
| event-lifecycle auto push | `src/lib/calendar/event-lifecycle.ts` | Background push on transitions | functional | **Yes** | Y (block from OS) |
| calendar-hq-actions | `src/app/admin/calendar-hq-actions.ts` | HQ operator push | functional | **Yes** | Y |
| promote-approved CLI | `scripts/google-calendar/promote-approved-kelly-events.ts` | Batch promote | functional | **Yes** | Y |
| Event OS promote | `calendar-promotion/promote-ledger-event.ts` | Human-gated ledger promote | functional | gated | **Canonical for OS** |

---

## E. RedDirt — Email / comms / workflow

| Name | Path | Kind | Unified? |
|------|------|------|----------|
| AI brain registry | `src/lib/email-command-center/ai-brain-registry.ts` | deterministic | Y |
| Message draft AI | `message-draft-ai.ts`, `message-studio-draft-critic-ai.ts` | llm | Y |
| Task intelligence | `ai-task-intelligence.ts` | llm | Y |
| Campaign memory readiness | `ai-campaign-memory-readiness.ts` | rag | Y |
| Comms thread AI | `src/lib/comms/ai.ts` | llm | Y |
| Email workflow heuristics | `src/lib/email-workflow/intelligence/heuristics.ts` | deterministic | Y |
| Email workflow analyzer | `email-workflow/ai/analyzer.ts` | llm | Y |

---

## F. RedDirt — Compliance / finance AI

| Name | Path | Count | Kind | Unified? |
|------|------|-------|------|----------|
| advancedComplianceAITools | `compliance-agent/advanced-tool-registry.ts` | 24 definitions | scaffold/llm | Y |
| Receipt intake OpenAI | `receipt-intake-agent/extract-receipt-with-openai.ts` | 1 | llm | Y |
| Filing readiness agent | `compliance-agent/filing-readiness-agent.ts` | 1 | llm | Y |
| Finalization inspectors | `finalization-agent/tools/*` | 10+ | deterministic | Y |
| Money classifier, bank import, reconciliation | `src/lib/compliance/ai/*-agent.ts` | 6+ | llm/hybrid | Y |
| Approval workbench agent | `approval-workbench-agent.ts` | 1 | llm | Y |

---

## G. RedDirt — Campaign engine / brain stubs

| Name | Path | Purpose | Unified? |
|------|------|---------|----------|
| ai-brain.ts | `src/lib/campaign-engine/ai-brain.ts` | Touchpoints + governance boundaries | Y |
| ai-context.ts | `src/lib/campaign-engine/ai-context.ts` | Context bundle placeholder | Y |
| ai-agent-brain-map.md | `docs/ai-agent-brain-map.md` | System map | Y |

---

## H. countyWorkbench (sibling lane)

| Name | Path | Purpose | Status | Unified? |
|------|------|---------|--------|----------|
| County Builder Agent spec | `docs/COUNTY_BUILDER_AGENT_SPEC.md` | Governed field population | doc-driven | Y (adapter later) |
| AI Agent Runbook | `docs/AI_AGENT_RUNBOOK.md` | Agent chunking rules | doc | Y |
| Source Discovery Agent | `docs/agents/COUNTY_SOURCE_DISCOVERY_AGENT.md` | Find sources | manifest | Y |
| Data Extraction Agent | `docs/agents/COUNTY_DATA_EXTRACTION_AGENT.md` | Extract fields | manifest | Y |
| Validation Agent | `docs/agents/COUNTY_VALIDATION_AGENT.md` | QA fields | manifest | Y |
| Dashboard Builder Agent | `docs/agents/COUNTY_DASHBOARD_BUILDER_AGENT.md` | Build V2 dashboard | manifest | Y |
| Region Rollup Agent | `docs/agents/REGION_ROLLUP_AGENT.md` | Rollups | manifest | Y |
| Field records store | `data/county-dashboard-field-records.json` | Runtime field DB | functional | Y (read-only import) |

**No RedDirt import** until integration packet — inventory only.

---

## I. ajax (sibling lane)

| Name | Path | Purpose | Unified? |
|------|------|---------|----------|
| Ward personas (piney, comet, dawn) | `ajax/lib/agents/personas.ts` | Ward dashboard agents | N (municipal) |
| Admin personas (ivory, agent409, …) | same | Admin floating agent | N |
| reddirt-firewall | `ajax/lib/agents/reddirt-firewall.ts` | Blocks cross-lane leakage | N |
| tool-executors | `ajax/lib/agents/tool-executors.ts` | Tool execution | N |
| Assistant API | `ajax/app/api/assistant/*` | Municipal assistant | N |

---

## J. phatlip / sos-public

| Lane | Finding |
|------|---------|
| phatlip | Data firewall docs only; no shipped agent runtime in search |
| sos-public | Marketing site; no agent tools (by design) |

---

## K. kelly-travel-reimbursement (sibling package)

| Name | Path | Kind | Unified? |
|------|------|------|----------|
| travel-reimbursement-agent | `src/lib/ai/travel-reimbursement-agent.ts` | llm (optional) | Y (merge with Event OS travel tools) |

---

## Duplicate / orphaned systems (exact paths)

| Issue | Paths |
|-------|-------|
| **Triple calendar write** | `google-sync-engine.ts`, `event-lifecycle.ts`, `calendar-promotion/promote-ledger-event.ts`, `scripts/google-calendar/promote-approved-kelly-events.ts` |
| **Dual admin AI UIs** | `/admin/campaign-events/ai-tools` vs `/admin/ai-command-center` (hub → links to former) |
| **Kelly Agent vs Event OS** | `kelly-agent/tools/calendar-*` vs `campaign-events/calendar-sync` + `calendar-promotion` |
| **Ask Kelly vs Kelly Agent** | `/api/assistant` (public RAG) vs `/api/admin/kelly-agent/recommend` (ops bundle) |
| **Catalog vs compliance registry** | `ai-tools-master-catalog.ts` vs `compliance-agent/advanced-tool-registry.ts` |
| **Docs-only county agents** | `countyWorkbench/docs/agents/*.md` — not in RedDirt catalog |
| **Fork duplicates** | `RedDirt-main-travel-ledger/src/lib/kelly-agent/` mirrors — **orphan fork** |
| **Legacy catalog id** | `appr-promote-official` (idea) superseded by Sprint 5 `promotion-*` tools |
| **Email appr-email-send** | catalog `idea` but Sprint 4 `approval-send-guard` is functional |

---

## What should move into master registry (priority)

1. **P0:** All Campaign Event OS catalog + Sprint 4/5/ global contracts (`src/lib/agents/master-tool-registry/` v0 started).  
2. **P1:** Kelly Agent tool bundle — map each `kelly-agent/tools/*` to registry entries.  
3. **P1:** Ask Kelly OpenAI tools from `assistant/tools.ts`.  
4. **P2:** Compliance `advancedComplianceAITools` + finalization inspectors.  
5. **P2:** Email command center AI roles from `ai-brain-registry.ts`.  
6. **P3:** countyWorkbench manifest agents (IDs only, adapter stubs).  
7. **Exclude:** AJAX personas unless municipal packet approved.

---

## Registry implementation (this pass)

| Artifact | Path |
|----------|------|
| Types | `src/lib/agents/master-tool-registry/types.ts` |
| Aggregator (RedDirt catalog) | `src/lib/agents/master-tool-registry/index.ts` |
| Global tools | `src/lib/campaign-events/ai-tools/sprint-global-agent-tools.ts` |
| Hub route | `/admin/ai-command-center` |

---

## Agent Intelligence Sprint 2 (May 2026)

| Domain | Count | Status |
|--------|-------|--------|
| Live orchestration (`agent_intelligence_sprint2`) | **15** | functional/partial V1 |

**Runtime:** `AgentObservationTracker`, `cross-domain-context-composer`, `workflow-friction-detector`, `agent-memory-write-planner`, next-action V2

---

## Agent Intelligence Sprint 1 (May 2026)

| Domain | Code | Tools | Status |
|--------|------|-------|--------|
| User intelligence | `src/lib/agents/user-intelligence/` | 5 contracts | scaffolded V1 |
| Writing agent | `src/lib/agents/writing-agent/` | 9 contracts | scaffolded V1 |
| UX intelligence | `src/lib/agents/ux-intelligence/` | 9 contracts | scaffolded V1 |
| Campaign intelligence | `src/lib/agents/campaign-intelligence/` | 6 contracts | deterministic V1 |
| System intelligence | `sprint-agent-intelligence-tools.ts` | 6 contracts | scaffolded V1 |
| **Total new contracts** | `sprint-agent-intelligence-tools.ts` | **35** | catalog + registry |

**Hub:** `/admin/ai-command-center` (`AiCommandCenterHub.tsx`)  
**Observations:** `user-observations.ts` + extended `AiObservationEvent` union

---

*Last updated: Agent Intelligence Sprint 1 (May 2026).*
