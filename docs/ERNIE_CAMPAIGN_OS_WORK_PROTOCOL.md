# Ernie — Campaign OS work protocol

**Audience:** New AI threads (Ernie / Burt / any agent) joining Kelly SOS build in `RedDirt/`  
**Last updated:** Phase 2A — Live CampaignState API

---

## Your role

You are building **Kelly Grappe for Arkansas Secretary of State** — a **single-campaign**, **AI-native operating system**. You are **not** building generic SaaS, multi-tenant CRM, or white-label election software in this phase.

**North star (every tool, doc, and line of code):**

> How does this improve the AI's understanding of the entire campaign?

**Architecture principle:**

> The orchestration layer sits **above** isolated verticals and **below** human execution.

That means **Intelligence-Gated Human Operations**:

- AI synthesizes, diagnoses, recommends, prioritizes, predicts  
- Humans approve  
- Systems execute only after explicit human gates  

**Never:** autonomous mass email, GCal writes, finance posts, voter export, or unsourced opponent claims.

---

## Strategic roadmap (what to hold)

| Phase | Name | Status |
|-------|------|--------|
| **1** | Kelly Campaign OS (single tenant) | **ACTIVE** — depth over scale |
| **3** | Political Intelligence Platform (knowledge graph) | Future — after Kelly proven |
| **4** | AI Campaign Orchestration (cognitive layer) | **IN PROGRESS** — Phase 2A live |
| **2** | Multi-candidate framework | **HOLD** until late |
| **5** | SaaS commercialization | **HOLD** until late |

**Do not optimize for:** tenant isolation, billing, white labeling, generalized auth matrices, reusable election templates.

**Kelly OS is the laboratory.** Depth is the moat.

---

## Workspace rules

| Rule | Detail |
|------|--------|
| Active lane | `H:\SOSWebsite\RedDirt` only |
| Branch | `feature/kelly-schedule-settlement-dashboard` |
| `main` merge | Only when Steve approves + gates green |
| Cross-lane | No imports from `sos-public`, `ajax`, `phatlip`, `countyWorkbench` into RedDirt |
| Commands | Run from `RedDirt/` (`npm run …`) |
| Commits | Only when Steve asks; message = why not what |
| Secrets | Never in chat, commits, docs, or tests |
| PII | No real PII in smoke tests |
| Repair loop | Stop if preflight fails, secrets detected, cross-lane edit needed, migration break, same test fails twice |

---

## Read first (new thread)

1. `H:\SOSWebsite\START_HERE_FOR_AI.md`
2. `H:\SOSWebsite\CURSOR_CODEX_COORDINATION_PROTOCOL.md`
3. `RedDirt/docs/ERNIE_CAMPAIGN_OS_WORK_PROTOCOL.md` (this file)
4. `RedDirt/docs/campaign-events/ORCHESTRATION_BUILD_ROADMAP.md`
5. `RedDirt/docs/campaign-events/CAMPAIGN_ORCHESTRATION_INTELLIGENCE_ARCHITECTURE.md`
6. `RedDirt/docs/campaign-events/ORCHESTRATION_PHASE_2A_LIVE_CAMPAIGN_STATE_HANDOFF.md`

---

## Core abstraction: CampaignState

`CampaignState` is the **machine-readable representation of campaign reality** — strategic, operational, intelligence, and learning layers unified.

**Live API:** `GET /api/agents/orchestration-state?period=2026-04`

**Builder:** `src/lib/agents/orchestration/build-orchestration-payload.ts`

**Tests:**

```bash
npm run agents:test-orchestration-state
npm run agents:test-orchestration-plan
npm run typecheck
```

---

## Eight-layer orchestration model

1. Signal — observations, dashboards, domain bundles  
2. Context — unified campaign context, domain composers  
3. Reasoning — diagnosis, blockers, opportunities, risks  
4. Planning — cross-domain workflows, action packages  
5. Human Gate — safe / gated / forbidden matrix  
6. Execution Prep — drafts, packets, route links (no auto-send)  
7. Learning — memory candidates, observations, tool-builder  
8. UX Delivery — command center, copilots, dashboards (Phase 4+)

---

## Current sprint focus

**Phase 2A ✅** — Live CampaignState API (backend foundation)  
**Phase 2B next** — Command center orchestration panel (UI)  
**Phase 3** — Workflow execution packages wired to OS preparer  
**Do not start** — multi-tenant, SaaS billing, candidate abstraction

---

## Completion report format

When Steve asks for a handoff, include:

- Active lane  
- Files changed  
- Commands run + results  
- Whether CampaignState is live (`operatingMode`, `isLive`)  
- API route smoke  
- Human gates preserved  
- Remaining blockers  
- Recommended next sprint  

---

*Kelly single-tenant · Intelligence-gated · Campaign brain first*
