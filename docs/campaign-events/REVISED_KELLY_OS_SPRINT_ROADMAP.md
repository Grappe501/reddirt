# Revised Kelly OS Sprint Roadmap

**Replaces:** forward SaaS-first sequencing in `MASTER_CAMPAIGN_OS_ROADMAP.md` for **execution order** (master doc remains dependency reference).

**Pause:** Multi-tenant productization until Kelly presentation-ready.

---

## Phase A — Stability gate (immediate)

| Item | Done? |
|------|-------|
| Typecheck repair on feature branch | ✅ @ `1be16b0` (re-verify on merge) |
| `npm run build` proof | ✅ local |
| Feature branch push | ✅ |
| Merge to `main` + Netlify | ⬜ Steve decision after `npm run check` on merge |
| Unstaged workspace cleanup | ⬜ (email/compliance edits separate) |

---

## Phase B — Training + role OS

| Sprint slice | Deliverables |
|--------------|--------------|
| B1 | Training module JSON + tooltip IDs on top 5 routes |
| B2 | `training-unlock-manager` + progress localStorage |
| B3 | Five copilot surfaces (volunteer, intern, field, social, comms) — read-only V1 |
| B4 | Expand onboarding with time-available + quiz checkpoints |
| B5 | Supervisor approval UI for level 2 unlocks |

**Docs:** `CAMPAIGN_OS_TRAINING_LAYER.md`, `ROLE_COPILOT_EXPANSION_PLAN.md`

---

## Phase C — Dashboard module system

| Sprint slice | Deliverables |
|--------------|--------------|
| C1 | Render blueprint → `/admin/dashboards/custom/[id]` |
| C2 | Pin/hide modules; simple/advanced toggle |
| C3 | Role default layouts (treasurer, CM, candidate) |
| C4 | AI-suggested module diff on command center |

**Builds on:** Sprint 10.5 registry + builder UI

---

## Phase D — Communications + relationship engine

| Sprint slice | Deliverables |
|--------------|--------------|
| D1 | Contact graph scaffold + host follow-up workbench |
| D2 | Outreach templates (human send) |
| D3 | Volunteer nurture queue |
| D4 | Coalition tracking (manual V1) |

**Was:** Sprint 12 in old map

---

## Phase E — County + field ops

| Sprint slice | Deliverables |
|--------------|--------------|
| E1 | countyWorkbench integration packet |
| E2 | Field manager dashboard + county priorities |
| E3 | Volunteer/county memory V2 (structured fields) |

---

## Phase F — Compliance hardening

| Sprint slice | Deliverables |
|--------------|--------------|
| F1 | Treasurer flow end-to-end Mar–May |
| F2 | Receipt review queue polish |
| F3 | Filing packet + export readiness |
| F4 | FIN-1 mapper spike (human-gated) |

---

## Phase G — Long-term memory + tool builder

| Sprint slice | Deliverables |
|--------------|--------------|
| G1 | Memory review approve UI |
| G2 | Pattern mining from observations |
| G3 | L3 tool-builder tickets in sprint planning |
| G4 | Auto contract draft PRs (supervised) |

---

## Phase H — Presentation / demo polish

| Sprint slice | Deliverables |
|--------------|--------------|
| H1 | Cohesive admin routes (Kelly header everywhere) |
| H2 | Netlify production deploy |
| H3 | Demo scripts: training, dashboard, reimbursement, event planning |
| H4 | Steve sign-off → **then** consider SaaS Phase I |

---

## SaaS (deferred)

Original Sprint 10 tenancy/intelligence remains **scaffold**. Resume only after Phase H sign-off:

- Hosted auth per tenant  
- Billing  
- Ledger isolation  
- Client portals  

---

## Sprint numbering going forward

| New ID | Name |
|--------|------|
| 11 (planning) | Kelly OS audit + training/copilot contracts (this pass) |
| 12 | Stability merge + reimbursement completion |
| 13 | Training layer V1 |
| 14 | Dashboard module render |
| 15 | Copilots V1 |
| 16 | Comms engine |
| 17 | County/field |
| 18 | Compliance hardening |
| 19 | Tool-builder L3 |
| 20 | Demo polish gate |
| 21+ | SaaS (optional) |

---

## Commands (each phase end)

```bash
cd RedDirt
npm run agents:test-single-campaign-hardening
npm run agents:test-dashboard-nav
npm run check   # before main merge only
```
