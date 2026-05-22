# VAN / MiniVAN Competitive Analysis & Ernie Superiority Plan

**Audience:** Ernie (and Steve)  
**Lane:** `RedDirt/` Kelly Campaign OS  
**Date:** May 2026  
**Benchmark:** Industry standard **NGP VAN** ecosystem (VoteBuilder, MiniVAN, OpenVPB, EveryAction integrations) — referred to in campaigns as “VAN” / mobile “MiniVAN.”

> **Note:** This repo does not reference a product literally named “Voter Access Network.” In Democratic field organizing, **VAN** (Voter Activation Network) is the usual benchmark. This document treats **VAN + MiniVAN** as the competitive bar unless Ernie names a different vendor.

---

## 1. Executive summary (for Ernie)

**What VAN is best at:** Mobile field execution — walk lists, turf, canvass/phone result codes, volunteer shift assignment, and a mature voter file UI used by thousands of campaigns.

**What Kelly Campaign OS is best at today:** Everything *around* winning a statewide race that VAN does poorly or not at all — **event operations, candidate approval, travel/reimbursement, finance/compliance, hot wash learning, county strategy, AI-gated communications, and a unified command center** with **499 catalogued agent capabilities** (297 functional/partial).

**Honest gap:** We do **not** yet outperform VAN on **door-to-door execution, predictive phone banks, or turf cutting at scale**. Phone/text bank is **doctrine + scaffold**, not a shipped dialer.

**Strategy to win:** Do not become “VAN with a website.” Become the **AI-orchestrated Campaign Operating System** that:

1. **Owns** campaign command (events, money, compliance, narrative, approvals).  
2. **Integrates** VAN where Arkansas rules and party contracts require it (export/import, not duplicate voter warehouse).  
3. **Builds** a compliant field layer (mobile + dispositions + REL-2) that beats VAN on **relational organizing, consent, and AI coaching** — not on legacy UX alone.

**Readiness:** ~75% catalog maturity; **field execution ~25%** vs VAN’s ~95% for core canvass/phone.

---

## 2. VAN / MiniVAN — what they ship (competitive baseline)

| Domain | VAN / MiniVAN capability | Why campaigns buy it |
|--------|--------------------------|----------------------|
| **Voter file** | Official roll, history, demographics, voting history flags | Legal list source, targeting |
| **Turf & walks** | Cut turfs, assign to volunteers, map-based canvassing | Scale door knocks |
| **MiniVAN** | Offline-capable mobile app, list sync, standard result codes | Field reliability |
| **Phone banks** | Predictive dialer, call scripts, dispositions, volunteer sessions | High contact volume |
| **Text / P2P** | Peer-to-peer texting (vendor-dependent), opt-out handling | Scale SMS |
| **Volunteer mgmt** | Shifts, events, roles, hours (basic) | Schedule labor |
| **Activist codes** | Contact history, survey questions, tags | Targeting & reporting |
| **Compliance** | Fundraising limits (NGP), some reporting | Legal guardrails |
| **Reporting** | Canvass/phone KPIs, turf completion | Field managers |

**VAN weaknesses (our opportunity):**

- Weak **event OS** (rallies, reimbursements, run-of-show, candidate approval packages).  
- Weak **statewide county strategy** for 75 counties as first-class objects.  
- Weak **hot wash → organizational learning** loop.  
- **AI** is bolt-on or absent; no unified “run the campaign” brain.  
- **Relational / Power of 5** is not native (contacts are voter-file-centric, not volunteer-network-centric).  
- **Compliance** for SOS/travel/FIN is not the product core.  
- Rigid **human workflows**; little adaptive guidance for new campaign managers.

---

## 3. Kelly Campaign OS — how we are built (comparison)

### 3.1 Architecture (cohesive OS vs point tools)

```text
PUBLIC (forms, Ask Kelly) → INTAKE (WorkflowIntake) → LEDGER (events + factCard)
        ↓                           ↓
   VOLUNTEER / REL-2            CALENDAR TRUTH → APPROVAL → PROMOTION (gated)
        ↓                           ↓
   COMMS (ECC, drafts)          TRAVEL → REIMBURSEMENT → FINANCE / COMPLIANCE
        ↓                           ↓
   COUNTY INTEL (75)            HOT WASH → LEARNING → AI COMMAND CENTER
        ↓
   AGENT OS: observe → plan → prepare → human approve → audit
```

**Authoritative stores:** Prisma/Postgres (ledger, voter file, REL-2, comms, finance).  
**V1 JSON staging:** volunteers, communications (until Prisma sync approved).  
**AI catalog:** 499 tools, 43 lifecycles — [`/admin/campaign-events/ai-tools`](../../src/app/admin/(board)/campaign-events/ai-tools/page.tsx).

### 3.2 Feature matrix: us vs VAN

| Capability | VAN / MiniVAN | Kelly Campaign OS today | Winner today |
|------------|---------------|-------------------------|--------------|
| Mobile canvassing | **Strong** | Not built | VAN |
| Walk lists / turf | **Strong** | Not built | VAN |
| Predictive phone bank | **Strong** | Not built (doctrine only) | VAN |
| P2P / SMS scale | **Strong** (vendor) | Locked / scaffold | VAN |
| Voter file ingest | **Strong** | **Strong** (SOS pipeline, Prisma) | Tie (different vendor) |
| Voter targeting codes | **Strong** | Partial (signals, classifications) | VAN |
| Volunteer signup | Basic | **Strong** (forms, teams, Volunteer OS V1) | **Us** |
| Relational / Power of 5 | Weak | **Strong** (REL-2, unique) | **Us** |
| Event lifecycle | Weak | **Strong** (ledger, planning, hot wash) | **Us** |
| Candidate approval | None | **Strong** (packages, gated email) | **Us** |
| Travel / reimbursement | None | **Strong** | **Us** |
| Finance / compliance ops | NGP $ only | **Strong** (Sprint 8, treasurer) | **Us** |
| County-by-county OS | Weak | **Partial** (bridge + KPIs) | **Us** (direction) |
| Email / comms governance | Basic | **Strong** (ECC + gates) | **Us** |
| AI campaign manager brain | None | **Partial** (unified context, OS control) | **Us** (unique) |
| Public website + RAG | None | **Strong** (Ask Kelly) | **Us** |
| Signup sheet OCR → voter match | None | **Strong** | **Us** |

### 3.3 What “completely orchestrated with AI agent” means today

**Functional orchestration spine:**

| Component | Path | What it does |
|-----------|------|--------------|
| Unified campaign context | `assembleUnifiedCampaignContext()` | One strategic picture: finance, events, learning, operator fatigue |
| OS Control Layer | `loadOsControlBundle()` | Health score, blockers, top 3 moves, prepared actions |
| Master tool registry | 499 tools | Every capability documented with status |
| Agent runtime | intent → route → guard | Blocks auto-send / auto-write |
| Gap analyzer | campaign-gap-analyzer | Highest-impact holes |
| Next actions | next-action-engine | Role-aware “do this next” |

**Not yet functional:** Campaign Manager Copilot that explains **VAN vs us**, **field gaps**, and **daily win plan** in one Ernie-ready brief (planned — see Phase C below).

---

## 4. Cracks in our system (internal honesty)

| # | Crack | Impact | VAN comparison |
|---|-------|--------|----------------|
| 1 | **No MiniVAN-class mobile app** | Cannot deploy statewide door program | Critical gap |
| 2 | **Phone/text not shipped** | Form promises “in development” | Critical gap |
| 3 | **499 tools vs ~50 real executors** | Agent overclaims if not gated | Trust risk |
| 4 | **29 Kelly OS planning tools = 0 functional** | “Train CM” not wired | Onboarding gap |
| 5 | **Dual CRM** (Prisma + JSON volunteers/comms) | Confusion on source of truth | Ops risk |
| 6 | **VAN export/import not formalized** | Field may run parallel universe | Data silo |
| 7 | **Demo metrics** on some public surfaces | Wrong decisions if cited | Reputation |
| 8 | **Hosted DB / env** dependency | Features die without production | Launch risk |

---

## 5. How to outperform VAN (strategy, not fantasy)

### 5.1 Three-layer product model

```text
Layer A — COMMAND (own outright)
  Events, approvals, travel, finance, compliance, county, hot wash, AI command center
  → VAN cannot compete here; we must be best-in-class.

Layer B — RELATIONSHIP (own outright)
  REL-2, Power of 5, volunteer progression, signup sheets
  → Beat VAN on relational organizing + consent narrative.

Layer C — FIELD EXECUTION (build or integrate)
  Option C1: Integrate VAN for canvass/phone until native app ships
  Option C2: Build "Kelly Field" mobile (MiniVAN-class) on our voter file + REL-2
  → Ernie decision: integrate now, build parallel in 2 phases, or hybrid
```

### 5.2 AI differentiation (what VAN will not ship)

| AI capability | Outperform VAN by… |
|---------------|-------------------|
| **Campaign Manager daily brief** | One page: blockers, counties, events, $, field gap — with links |
| **Field coach** | Script + disposition coaching; no auto-dial |
| **Crack scanner** | Stale calendar, missing receipts, weak counties, retention |
| **Truth reconciler** | Catalog says functional vs actually runs |
| **Handoff planner** | “Finish travel queue before phone bank night” |
| **Hot wash → next event** | Learning loop tied to ledger, not activist codes only |
| **Approval-safe comms** | Draft-only until human + suppression check |

---

## 6. Phased plan to market superiority

### Phase 0 — Decision (Ernie + Steve, 1 week)

| Decision | Options |
|----------|---------|
| VAN relationship | Integrate / parallel build / hybrid |
| Field scope for 2026 | Canvass only vs canvass + phone + P2P |
| SMS vendor | Twilio readiness already gated |
| Single CRM truth | Prisma authoritative; JSON → sync |

**Deliverable:** One-page **Field Execution Policy** signed by Ernie.

---

### Phase A — Cohesive OS (8–10 weeks) — *beat VAN on command*

| # | Deliverable | Outcome |
|---|-------------|---------|
| A1 | Campaign Manager Orchestration V1 (6 functional tools + dashboard panel) | Ernie-grade daily brief |
| A2 | Prisma sync for volunteers + comms contacts | One contact graph |
| A3 | Kelly OS planning tools: 10 → functional (training, copilots) | CM training in product |
| A4 | VAN import/export bridge spec (if integrate) | No duplicate voter truth |
| A5 | `SYSTEM_HEALTH` single score on command center | “Are we winning the week?” |

**Success:** Campaign manager runs **entire non-field program** in RedDirt without spreadsheets.

---

### Phase B — Field execution MVP (12–16 weeks) — *reach parity on core*

| # | Deliverable | VAN parity? |
|---|-------------|-------------|
| B1 | Turf list generator from `VoterRecord` + county | Walk lists |
| B2 | Mobile web canvass (PWA first) OR VAN sync | MiniVAN |
| B3 | Standard disposition codes → `VoterInteraction` | Activist codes |
| B4 | Volunteer shift + assignment accept/decline | Events/shifts |
| B5 | Phone bank session mode (manual dial first, predictive later) | Phone bank |
| B6 | TCPA/consent gate on every outbound | Compliance |

**Success:** Field manager runs a canvass night with **our** data or **synced VAN** data — results land in **our** ledger.

---

### Phase C — AI-orchestrated field (8 weeks, parallel) — *exceed VAN*

| # | Deliverable | Why VAN loses |
|---|-------------|---------------|
| C1 | `field-manager-copilot` functional | County priorities + turf suggestions |
| C2 | `volunteer-assignment-recommender` → accept flow | Human-gated, explained |
| C3 | Post-canvass hot wash auto-link to event/county | Closed loop |
| C4 | Relational contact → turf priority | Network-aware walks |
| C5 | Agent learns from dispositions (observations) | Improves weekly |

---

### Phase D — Market positioning (ongoing)

| Message | Proof |
|---------|-------|
| “VAN runs doors; Kelly OS runs the campaign” | Live demos: approval → event → reimb → finance |
| “AI campaign manager with human gates” | Command center + audit trail |
| “Arkansas SOS-native + 75 counties” | County workbench bridge |
| “Relational first, file second” | REL-2 + Power of 5 |

---

## 7. What we still need (checklist for Ernie)

### P0 — Must have before claiming “superior OS”

- [ ] Field execution policy (integrate vs build)  
- [ ] Mobile canvass or certified VAN bridge  
- [ ] Phone or text bank with consent (even manual-dial MVP)  
- [ ] Campaign Manager AI brief (daily, truthful)  
- [ ] Single contact graph (Prisma)  
- [ ] Production DB + env proof on feature branch  
- [ ] Remove or label demo metrics  

### P1 — Beat VAN on effectiveness

- [ ] County staffing model tied to events  
- [ ] Volunteer retention + training completion UI  
- [ ] Predictive dialer (post manual-dial)  
- [ ] P2P with suppression (ECC + Twilio gates)  
- [ ] VAN disposition import (if integrate)  

### P2 — Market leadership polish

- [ ] Native iOS/Android field app  
- [ ] Client SaaS multi-tenant (paused for Kelly-first)  
- [ ] Full conversational agent (Sprint 16 vision)  

---

## 8. Investment framing for Ernie

| Track | Effort | Competitive effect |
|-------|--------|-------------------|
| **Command OS (A)** | Medium | **Already ahead of VAN** — finish orchestration |
| **Field parity (B)** | Large | **Required** to claim statewide field program |
| **AI field (C)** | Medium | **Differentiator** VAN cannot copy quickly |
| **VAN integration** | Small–medium | **Risk reducer** for 2026 if build lags |

**Recommended:** Fund **A + B1–B4** immediately; parallel **VAN export bridge** if party already on VAN; **B5–B6** before general election crunch.

---

## 9. One-page “Ernie brief” (talking points)

1. **We are not behind on running Kelly’s campaign office** — events, money, travel, compliance, and AI command are ahead of any VAN deployment.  
2. **We are behind on door-knocking infrastructure** — that is VAN’s home turf; we must integrate or build field mobile.  
3. **Our moat is AI + cohesion** — one system tells the CM what is broken, what to do today, and what not to auto-send.  
4. **499 agent tools are the curriculum** — 297 work today; we will not let AI promise the rest.  
5. **Superiority claim is credible after Phase A+B** — not before field MVP ships.

---

## 10. Related docs

- [`GLOBAL_AI_AGENT_TOOL_INVENTORY.md`](./GLOBAL_AI_AGENT_TOOL_INVENTORY.md)  
- [`ALL_KNOWING_CAMPAIGN_AGENT_ARCHITECTURE.md`](./ALL_KNOWING_CAMPAIGN_AGENT_ARCHITECTURE.md)  
- [`AGENT_OS_CONTROL_LAYER.md`](../AGENT_OS_CONTROL_LAYER.md) (if present) or `src/lib/agents/os-control/`  
- [`VOLUNTEER_SYSTEM_GAP_ANALYSIS.md`](./VOLUNTEER_SYSTEM_GAP_ANALYSIS.md)  
- [`COMMUNICATIONS_SYSTEM_COMPLETION_PLAN.md`](./COMMUNICATIONS_SYSTEM_COMPLETION_PLAN.md)  
- [`relational-contact-implementation-foundation.md`](../relational-contact-implementation-foundation.md)  
- [`PHONE_BANK_TEXT_BANK_AND_CONTACT_FLOW_SYSTEM.md`](../../campaign-system-manual/PHONE_BANK_TEXT_BANK_AND_CONTACT_FLOW_SYSTEM.md)

---

**Next step for Steve:** Review Phase 0 decisions with Ernie; then authorize **Phase A (CM orchestration)** + **Phase B scope** on `feature/kelly-schedule-settlement-dashboard` or a dedicated `feature/field-execution` branch.
