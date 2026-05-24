# Kelly Single-Campaign OS Completion Plan

**Status:** Active master plan (replaces forward SaaS expansion)  
**Tenant:** `kelly-sos-2026` only in production/demo  
**SaaS:** Scaffold frozen until presentation-ready sign-off from Steve

---

## North star

One polished **Kelly Grappe for SOS** operating system where every role sees the right work, training, and dashboard modules—guided by AI, gated by humans, deployable on Netlify from `main`.

---

## Priority stack (ordered)

| # | Track | Outcome | Current |
|---|-------|---------|---------|
| 1 | **Stability gate** | `npm run check` green on deploy branch | Feature branch verified @ `1be16b0`; `main` merge pending |
| 2 | **Netlify / main** | Safe deploy of Kelly admin + public surfaces | Do not merge broken `main` |
| 3 | **Reimbursement completion** | Mar / Apr / May MTD packets finalized | Sprint 1 functional; operator execution |
| 4 | **Dashboard polish** | CM, candidate, workbench, reimbursement, command center cohesive | Sprint 9 + 10.5; drilldown headers remain |
| 5 | **Role onboarding + training** | Every role has path, tooltips, unlocks | Wizard V1; training layer designed |
| 6 | **Copilot expansion** | 5 new role copilots + existing roles | Stubs + docs only |
| 7 | **Event planning polish** | Execution sheet + workbook demo-ready | Sprint 6 functional |
| 8 | **Hot wash / county memory V2** | Stronger memory signals, no fake ML | Sprint 7 V1 |
| 9 | **Finance / compliance hardening** | Treasurer + filing readiness | Sprint 8; FIN-1 V2 |
| 10 | **AI OS control maturity** | Gap → ticket → supervised build | Functional — feeds orchestration |
| 11 | **Communications engine** | Contacts, outreach, nurture | **V2 functional** — Comms Intelligence sprint |
| 12 | **County workbench bridge** | Field manager + county priorities | **V2 functional** — county command center |
| **13** | **Campaign Orchestration Intelligence** | **Unified campaign brain** | **Phase 4B live** — cross-domain agent orchestrator |
| 14 | **Long-term memory** | Approved memory + pattern mining | **Phase 3B functional** — feedback + lesson approval |
| 15 | **SaaS** | Multi-tenant product | **After** Kelly presentation-ready |

---

## Explicitly paused

- Multi-tenant billing and hosted auth  
- Prominent campaign switcher (dev flag only)  
- Client portal SaaS (`/admin/campaign-portals` de-emphasized)  
- Ledger `tenantId` isolation enforcement  
- Autonomous AI writes (email, GCal, finance)

---

## Phase gates

### Gate A — Deployable

- [ ] Feature branch merged to `main` after full `check`  
- [ ] Netlify env documented (no dev tenancy flag)  
- [ ] Smoke: hardening + dashboard-nav + sprint-10 scripts  

### Gate B — Demo-ready

- [ ] Presentation score ≥ 82 with real snapshot  
- [ ] Demo script: onboarding → blueprint → reimbursement → one event  
- [ ] No stale calendar JSON in demo month  

### Gate C — Production-ready

- Gate B + compliance exports + training supervisor gates + observation retention  

---

## Dependencies

```text
Stability → Deploy → Reimbursement truth → Dashboard polish
       → Training/unlocks → Copilots → Module render
       → Comms/county (done) → Orchestration layer (Phase 2+) → Memory V2 → SaaS (later)
```

---

## Success definition

Steve can open Kelly Campaign OS on Netlify, onboard a volunteer treasurer in minutes, show a safe dashboard blueprint, finalize a month reimbursement narrative, and walk one event plan—without explaining unfinished SaaS scaffolding.
