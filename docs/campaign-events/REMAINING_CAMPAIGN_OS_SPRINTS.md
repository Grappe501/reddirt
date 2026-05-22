# Remaining Campaign OS Sprints (9–16)

**Lane:** `RedDirt/`  
**Last updated:** May 2026 (post Sprint 8 + Agent OS Control Layer)  
**Companion:** [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md), [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md)

The Campaign OS is no longer a travel ledger. It is an AI-driven political operating system spanning operations, scheduling, approvals, planning, travel, finance, compliance, learning loops, county intelligence, AI orchestration, workflow automation, and operator intelligence.

---

## Completed (0–8 + control layer)

| Sprint | Status | Core build |
|--------|--------|------------|
| 0 | Complete | Master Campaign OS architecture + roadmap |
| 1 | Complete | Travel reimbursement operational workflow |
| 2 | Complete | Website intake → ledger bridge |
| 3 | Complete | Google Calendar truth layer + sync visibility |
| 4 | Complete | Approval package + routing foundation |
| 5 | Complete | Calendar promotion workbench + gated Google promotion |
| 6 | Complete | Event planning drilldown workspace |
| 7 | Complete | Hot wash intelligence + county memory |
| 8 | Complete | Finance + compliance operations bridge |
| **8A** | Complete | Agent OS Control Layer (supervised observe → plan → prepare → gate) |

**8A note:** Ships much of what was originally scoped under **Sprint 11** (state snapshot, workflow planner, action preparer, gate matrix, control panel). Do not rebuild those modules in Sprint 11 — extend and wire cross-domain orchestration instead.

---

## Sprint 9 — Dashboard + navigation operating system ✅

**Status:** Complete (May 2026). See `DASHBOARD_NAVIGATION_OPERATING_SYSTEM.md`.

**Goal:** Turn the entire OS into an intuitive, edge-to-edge operational workspace.

**Build areas:** Universal navigation, operator command palette, dashboard simplification, adaptive layouts, role-aware UX, calm workflow routing, AI-guided operations, reduced operator overwhelm, dashboard orchestration.

**Candidate dashboard:** Daily command center, approval cockpit, travel/reimbursement cockpit, event prep cockpit, strategic briefing surface.

**Campaign manager dashboard:** Operational nerve center, bottleneck manager, workflow orchestrator, readiness monitor, staffing + logistics command.

**AI tools (target):** Dashboard adaptation engine, overload detector, workflow simplifier, context-aware navigation, executive briefing generator, “what should I do next?” V3, urgency prioritizer, role-based routing.

**Deliverables:** Unified left nav, floating AI assistant, persistent command center, global notifications, adaptive workspaces, system health overview, operator readiness engine.

**Today:** Dashboards and command center exist; nav is fragmented (`/admin/workbench` vs calendar vs events). **Primary readiness gap (~68%).**

---

## Sprint 10 — Multi-campaign SaaS + campaign intelligence ✅

**Status:** Complete (May 2026). See `MULTI_CAMPAIGN_SAAS_ARCHITECTURE.md`.

**Goal:** Convert Kelly’s Campaign OS into a deployable client platform.

**Build areas:** Campaign tenancy, onboarding, white-labeling, multi-campaign architecture, Netlify deployment pipeline, permissions/roles, hosted upload portals, campaign-level AI memory, organization isolation.

**Product:** Onboarding wizard, hosted dashboards, reimbursement/event/volunteer/county portals.

**AI tools:** Onboarding assistant, org setup wizard, tenant readiness checker, deployment health analyzer, campaign configuration engine, archetype builder, cross-campaign intelligence boundaries.

**Deliverables:** Reusable campaign starter template, SaaS billing scaffolding, hosted customer deployments, reusable campaign AI stack, client admin tools.

**Lane note:** County hosted portals may require an approved **integration packet** with `countyWorkbench/` — not silent cross-lane imports.

---

## Sprint 11 — Full AI orchestration layer

**Goal:** Move from AI-assisted OS to AI-supervised campaign operating system.

**Build areas:** Unified agent runtime, cross-domain orchestration, memory routing, workflow planning, supervised execution, AI operating loop, long-term learning systems.

**Already shipped (8A):** State snapshot, workflow planner, action preparer, human gate matrix, tool readiness, Campaign OS Control panel, 15 control tools, `agents:test-os-control`.

**Remaining for 11:** Cross-domain handoffs, execution prep across finance/calendar/comms, orchestration dashboards, blocker detection at scale, organizational memory routing, adaptive workflow engine beyond single-panel V1.

---

## Sprint 12 — Campaign communications + relationship engine

**Goal:** Unify email, texting, volunteer outreach, donor follow-up, coalition management, persuasion tracking, host engagement, relationship intelligence.

**Deliverables:** Unified communication workbench, host dashboards, volunteer command center, coalition intelligence, donor follow-up systems, relationship memory engine.

---

## Sprint 13 — County operating system integration

**Goal:** Fully unify RedDirt + countyWorkbench + campaign intelligence.

**Deliverables:** County operations dashboards, statewide intelligence overlays, regional trend systems, county readiness maps, county relationship intelligence.

**Requires:** Approved integration packet; no unapproved imports from `countyWorkbench/` into core RedDirt paths.

---

## Sprint 14 — Compliance + financial automation

**Goal:** Semi-automated campaign compliance operations.

**Build areas:** FIN-1 support, compliance packet generation, audit trails, receipt intelligence, financial categorization, export systems.

**Deliverables:** Treasurer workspace (partially started Sprint 8), compliance readiness dashboards, filing prep systems, audit export systems, categorized finance pipeline.

**Guardrail:** No autonomous FIN-1 posting or filing submission without human action.

---

## Sprint 15 — Full learning campaign memory engine

**Goal:** Continuously learning Campaign OS.

**Build areas:** Strategic, messaging, county, volunteer, donor, and operational pattern memory; campaign-wide intelligence synthesis.

**Partial today:** County memory + event blueprints + learning loop (Sprint 7); extend into cross-domain synthesis and evolving recommendations.

---

## Sprint 16 — The all-knowing campaign agent

**Goal:** Final convergence — orchestrator, strategist, operator, planner, explainer, trainer, workflow guide, institutional memory, recommendation engine — **human-supervised, auditable, approval-gated**.

**Deliverables:** Conversational Campaign OS, full AI orchestration layer, adaptive workflow engine, statewide campaign intelligence, market-ready political OS, reusable campaign AI infrastructure.

---

## Current readiness (approximate)

| Area | Readiness |
|------|-----------|
| Travel / reimbursement | ~88% |
| Event planning | ~85% |
| Hot wash intelligence | ~92% |
| Finance / compliance ops | ~87% |
| AI tool ecosystem | ~78% |
| Agent runtime | ~74% (8A control loop ~90% for observe/plan/prepare) |
| Dashboard UX | ~68% |
| Full Campaign OS | ~87% |
| All-knowing agent vision | ~76% |

Architecture is strong enough that each new sprint compounds intelligence and orchestration across the whole system.

---

## Recommended sequencing

1. **Sprint 9** — Highest operator impact; unblocks daily use without new infra.
2. **Sprint 11 (delta)** — Extend 8A into cross-domain orchestration; do not duplicate 8A modules.
3. **Sprint 10** — When Kelly internal OS is stable enough to tenant.
4. **Sprints 12–15** — Parallelizable by domain once nav/command center is unified.
5. **Sprint 13** — After integration packet for countyWorkbench.
6. **Sprint 16** — Convergence after 9–15 materially reduce gaps.
