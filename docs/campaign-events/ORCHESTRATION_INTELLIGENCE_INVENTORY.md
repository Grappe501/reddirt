# Orchestration Intelligence — system inventory

**Sprint:** Campaign Orchestration Intelligence Layer — Master Plan  
**Lane:** `RedDirt/` only  
**Core question:** How does this improve the AI's understanding of the entire campaign?

---

## Summary

| Cluster | Systems | Readiness | Orchestration plug-in |
|---------|---------|-----------|------------------------|
| OS control | 1 bundle | Functional | **Primary spine** — snapshot, plans, gates |
| Unified context | 1 assembler + 6 engines | Partial–functional | **Context layer** feed |
| Role copilots | 15 roles + intelligence engine | Functional | **Role action** routing |
| County intelligence | Bridge + V2 apps | Functional | **County actions** + fusion |
| Volunteer system | CRM + assignment | Partial | **Volunteer workload** |
| Communications V2 | Graph + sequences + writing | Functional | **Comms priorities** (draft-only) |
| Email OS suite | 66 tools | Catalog (local/partial git) | **Execution prep** — ECC path |
| Dashboard / nav | Builder + orchestration | Partial render | **Dashboard adaptation** |
| Training / progression | 52+ modules | Functional registry | **Training gaps** |
| Events / hot wash | Sprint 6–7 | Functional | **Event readiness** chains |
| Finance / reimbursement | Sprint 8 + ops JSON | Functional | **Close month** workflows |
| Observations / memory | File-backed | Functional | **Signal + learning** |
| Tool builder | JSON queue | Functional | **Tool gap** orchestration |
| AI command center | Hub UI | Functional | **UX delivery** target |

**Inventory progress:** `[████████░░] 85%` (audit complete; live wiring Phase 2)

---

## 1. OS control layer

| Field | Value |
|-------|--------|
| **Purpose** | Supervised operating loop: observe → plan → prepare (never auto-execute) |
| **Reads** | Ledger, finance snapshot, learning loop, dashboard snapshot, tool registry |
| **Writes** | Observations only (`os_state_snapshot_viewed`, etc.) |
| **Tools** | 15 × lifecycle `agent_os_control` |
| **Observations** | `os_*`, `system_*`, `agent_workflow_plan_generated` |
| **Routes** | `/admin/ai-command-center` |
| **Readiness** | **Functional** |
| **Gaps** | Not yet merged into master `CampaignState` builder |
| **Orchestration role** | **Signal + Planning spine** — `loadOsControlBundle` first slice |

**Key paths:** `src/lib/agents/os-control/`

---

## 2. Unified campaign context

| Field | Value |
|-------|--------|
| **Purpose** | Single tenant strategic + operator narrative |
| **Reads** | OS bundle, nav bundle, observations, finance V2, learning loop |
| **Writes** | None (read-only assembly) |
| **Tools** | `agent_campaign_intelligence`, Sprint 10 |
| **Routes** | Command center, strategic panels |
| **Readiness** | **Partial** — assembly works; not all domains in one object |
| **Gaps** | No `CampaignState` type until orchestration Phase 2 |
| **Orchestration role** | **Context layer** — `assembleUnifiedCampaignContext` |

**Key paths:** `src/lib/agents/campaign-intelligence/`

---

## 3. Cross-domain context (existing orchestration)

| Field | Value |
|-------|--------|
| **Purpose** | Path/role-based domain inference + next actions |
| **Reads** | Dashboard snapshot, observations, reimbursement status |
| **Writes** | None |
| **Routes** | Agent runtime, next-actions API |
| **Readiness** | **Functional** for path-aware hints |
| **Gaps** | Limited to ~11 `AgentDomain` ids vs 20 orchestration domains |
| **Orchestration role** | **Bridge** — extend or wrap in `load-campaign-orchestration-signals` |

**Key paths:** `src/lib/agents/orchestration/cross-domain-context-composer.ts`

---

## 4. AI command center

| Field | Value |
|-------|--------|
| **Purpose** | Campaign OS hub: panels, palette, Kelly intelligence |
| **Reads** | OS bundle, copilot briefs, tool catalog |
| **Writes** | Observations, runtime audit |
| **Routes** | `/admin/ai-command-center`, copilots, dashboard-builder, tool-builder |
| **Readiness** | **Functional** shell; orchestration panel **not built** |
| **Gaps** | No executive “campaign brain” section yet |
| **Orchestration role** | **UX delivery** — Phase 4 panel |

**Key paths:** `src/components/admin/campaign-events/KellyOsIntelligencePanels.tsx`, `AiCommandCenterHub.tsx`

---

## 5. Role copilots (15)

| Field | Value |
|-------|--------|
| **Purpose** | Per-role briefs, tasks, readiness, dashboard modules |
| **Reads** | Unified context, training progress, county/comms lite merge |
| **Writes** | None |
| **Tools** | 35 × `kelly_os_copilot_tooling` |
| **Observations** | Copilot-specific (partial UI wiring) |
| **Routes** | `/admin/ai-command-center/copilots` |
| **Readiness** | **Functional** |
| **Gaps** | Full county KPIs server-only; client uses lite merge |
| **Orchestration role** | **Role action router** + CM/candidate daily plans |

**Key paths:** `src/lib/agents/role-copilots/`

---

## 6. County intelligence V2

| Field | Value |
|-------|--------|
| **Purpose** | 75-county KPIs, Power of 5, action packages, event/hot wash guidance |
| **Reads** | countyWorkbench JSON (read-only bridge) |
| **Writes** | County memory candidates (human-gated) |
| **Tools** | 35 × `county_intelligence_bridge` |
| **Observations** | 10 × `county_*` |
| **Routes** | `/admin/county-intelligence` |
| **Readiness** | **Functional** (server); dashboard blocks registered not all rendered |
| **Orchestration role** | **County actions**, weak-county workflows, fusion with volunteer/comms |

**Key paths:** `src/lib/agents/county-intelligence/`

---

## 7. Volunteer system

| Field | Value |
|-------|--------|
| **Purpose** | Segments, assignments, training hooks |
| **Reads** | Volunteer store / Prisma (partial) |
| **Writes** | Assignments (human-gated) |
| **Tools** | `volunteer_system` sprint |
| **Routes** | `/admin/volunteers` |
| **Readiness** | **Partial** — engines exist; statewide CRM depth varies |
| **Orchestration role** | **Volunteer workload balancer**, event staffing chains |

**Key paths:** `src/lib/campaign-events/volunteers/`

---

## 8. Communications intelligence V2

| Field | Value |
|-------|--------|
| **Purpose** | Relationship graph, sequences, writing orchestration, copilot apps |
| **Reads** | Communications JSON store, Prisma snapshot |
| **Writes** | Drafts only; no autonomous send |
| **Tools** | ~66+ × `communications_system` |
| **Routes** | `/admin/communications`, `/intelligence`, `/studio` |
| **Readiness** | **Functional** deterministic engines |
| **Gaps** | Contact persistence thin in UI; ECC canonical for send |
| **Orchestration role** | **Communications priorities**, retention routers |

**Key paths:** `src/lib/communications/`

---

## 9. Email OS agent suite

| Field | Value |
|-------|--------|
| **Purpose** | ECC, SendGrid, inbox, comms bridge tool catalog |
| **Reads** | Email workflow, comms intelligence |
| **Writes** | Drafts, queues — **never** mass send without gate |
| **Tools** | 66 × `email_os_suite` |
| **Routes** | ECC workbench |
| **Readiness** | **Catalog functional**; many paths Prisma-dependent |
| **Orchestration role** | **Execution prep** after orchestration recommends comms move |

---

## 10. Dashboard builder + navigation OS

| Field | Value |
|-------|--------|
| **Purpose** | Role blueprints, block registry, nav bundle |
| **Reads** | training-unlock-engine, component registry |
| **Writes** | Local/JSON blueprint saves |
| **Tools** | `dashboard_nav_sprint9`, `single_campaign_hardening` |
| **Routes** | `/admin/ai-command-center/dashboard-builder` |
| **Readiness** | **Registry functional**; preview renderers partial |
| **Orchestration role** | **Dashboard adaptation planner** |

**Key paths:** `src/lib/agents/dashboard-builder/`, `src/lib/dashboard-orchestration/`

---

## 11. Onboarding / training / progression

| Field | Value |
|-------|--------|
| **Purpose** | Role placement, 52+ modules, L1–L3 unlocks |
| **Reads** | training-modules-data, progression registries |
| **Writes** | Progress (local + server store partial) |
| **Tools** | `kelly_os_intelligence`, planning stubs |
| **Routes** | `/admin/training`, onboarding wizard |
| **Readiness** | **Functional** guidance; server RBAC deferred |
| **Orchestration role** | **Training gaps** → unlock router |

**Key paths:** `src/lib/agents/training/`, `onboarding/`, `progression/`

---

## 12. Event planning + hot wash / county memory

| Field | Value |
|-------|--------|
| **Purpose** | Drilldown, run-of-show, hot wash learning, county memory rollup |
| **Reads** | Ledger, factCard, media signals |
| **Writes** | Learning artifacts (gated) |
| **Tools** | `event_planning_sprint6`, `event_intelligence_sprint7`, `hot_wash_learning` |
| **Routes** | Workbench, media |
| **Readiness** | **Functional** V1; V2 county hot wash wired |
| **Orchestration role** | **Event readiness**, hot wash → county strategy |

**Key paths:** `src/lib/campaign-events/hot-wash-intelligence/`, `county-memory/`

---

## 13. Finance / reimbursement / compliance

| Field | Value |
|-------|--------|
| **Purpose** | Treasurer packets, compliance readiness, receipt pipeline |
| **Reads** | Reimbursement ops JSON, finance intelligence V2 |
| **Writes** | Export/print human-only |
| **Tools** | `campaign_finance_sprint8`, `mileage_reimbursement`, compliance |
| **Routes** | Reimbursement, finance, compliance admin |
| **Readiness** | **Functional** for Kelly demo paths |
| **Orchestration role** | **Close month reimbursement** workflow template |

---

## 14. Calendar / promotion

| Field | Value |
|-------|--------|
| **Purpose** | Intake, sync truth, GCal promotion (human-gated) |
| **Reads** | Ledger, GCal sync state |
| **Writes** | Promotion queue only with approval |
| **Tools** | `calendar_intake`, `sprint5_calendar_promotion` |
| **Readiness** | **Functional** with human gates |
| **Orchestration role** | **Calendar blockers** in signal layer |

---

## 15. Observations + memory + tool builder

| Field | Value |
|-------|--------|
| **Purpose** | UX friction, memory candidates, engineering tickets |
| **Reads** | `user-observations.json`, runtime audit |
| **Writes** | Observations append; memory review queue |
| **Tools** | Agent intelligence sprints, orchestration miners (new) |
| **Readiness** | **Functional** file-backed |
| **Orchestration role** | **Learning layer** — observation miner, memory candidates |

**Key paths:** `user-intelligence/`, `memory/`, `tool-builder/`

---

## 16. Master tool registry

| Field | Value |
|-------|--------|
| **Purpose** | Aggregate all sprint catalogs for agent runtime |
| **Reads** | master-catalog + supplement merge |
| **Writes** | None |
| **Readiness** | **Functional** |
| **Orchestration role** | Tool gap orchestrator + readiness bands |

**Key paths:** `src/lib/agents/master-tool-registry/`, `ai-tools-supplement.ts`

---

## Orchestration lifecycle (new)

| Field | Value |
|-------|--------|
| **Lifecycle id** | `campaign_orchestration_intelligence` |
| **Tools** | **39** contracts (Sprint 16) |
| **Status** | **Planning / partial** — skeleton + deterministic reasoning V1 |
| **Test** | `npm run agents:test-orchestration-plan` |

---

## Plug-in matrix (how systems join the brain)

```text
Signals:  observations + OS snapshot + domain bundles (county, comms, volunteer, finance…)
    ↓
Context:  unified campaign context + domain composers + role composers
    ↓
Reason:   campaign-state → diagnosis (blockers, opportunities, risks)
    ↓
Plan:     cross-domain workflow templates + action packages
    ↓
Gate:     human-approval-gate-matrix + orchestration enforcers
    ↓
Prep:     prepared actions, drafts, route links, checklists
    ↓
Learn:    memory candidates, tool-builder queue, hot wash
    ↓
UX:       AI command center orchestration panel (Phase 4)
```

---

*See also: `CAMPAIGN_ORCHESTRATION_INTELLIGENCE_ARCHITECTURE.md`, `ORCHESTRATION_DOMAIN_MAP.md`*
