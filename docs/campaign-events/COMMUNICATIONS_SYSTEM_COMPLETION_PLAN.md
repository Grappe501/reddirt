# Communications System Completion Plan

**Goal:** Fully operational Kelly SOS email system — safe, audited, human-gated.

---

## Phase A — Config & readiness (now)

- [x] Repo-wide inventory (`EMAIL_SYSTEM_DEEP_INVENTORY.md`)
- [x] Truth report (`EMAIL_ARCHITECTURE_TRUTH_REPORT.md`)
- [x] Provider readiness script (`campaign-events:test-email-readiness`)
- [x] `/admin/communications` command center
- [ ] Add missing env to `.env.example` (approval + diagnostics)
- [ ] Netlify env parity checklist
- [ ] Single webhook runbook (ECC vs legacy)

---

## Phase B — Contact graph

- [ ] ECC import → Prisma as authoritative
- [ ] Merge V1 JSON store with import pipeline (no duplicate sends)
- [ ] Contact dedupe across WorkflowIntake + volunteers
- [ ] Consent labels on every profile
- [ ] countyWorkbench leader emails — manual verified only

---

## Phase C — Lists & segments

- [ ] Volunteer segment in ECC audiences
- [ ] Host segment
- [ ] Campaign team static list
- [ ] County-based segments (bridge county intelligence)
- [ ] Export CSV from communications center → ECC import

---

## Phase D — Templates & AI writing

- [x] V1 template library (6 seeds)
- [ ] Wire `campaign-email-drafter` + `kelly-voice-email-adapter` to Message Studio
- [ ] Volunteer workflow templates (9 types)
- [ ] Team briefing templates per role
- [ ] Host/event templates linked to drilldown

---

## Phase E — Volunteer & team workflows

- [ ] Welcome/onboarding email path (after consent)
- [ ] Event assignment + reminder (manual send)
- [ ] Daily/weekly team brief from command center data
- [ ] Treasurer/finance gap emails (draft only)

---

## Phase F — Mass email / all-contact

- [ ] Complete suppression checklist
- [ ] Legal/compliance sign-off
- [ ] Test send to internal list only
- [ ] Throttling + SendGrid reputation monitoring
- [ ] **Explicit Steve approval** before enabling broadcast > N recipients

---

## Phase G — Analytics & replies

- [ ] SendGrid event dashboard in ECC
- [ ] Reply pathway documentation (Gmail workflow)
- [ ] Performance learning planner → observations

---

## Phase H — Production

- [ ] `npm run check` green on deploy branch
- [ ] Hosted DB migration proof
- [ ] Operator training + dry-run script
- [ ] sos-public → RedDirt `/api/forms` migration

---

## Commands

```bash
cd RedDirt
npm run campaign-events:test-email-readiness
npm run campaign-events:test-communications
npm run campaign-events:test-approval-email -- --dry-run
```

---

## Success definition

Steve can open `/admin/communications`, see truthful provider status, discover all contact sources, draft role-aware templates with AI, import audiences to ECC, and send only through governed ECC paths with audit and suppression — never hidden bulk send.
