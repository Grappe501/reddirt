# Kelly SOS — Section 3 launch lock & post-launch backlog

**Doc ID:** KELLY-S3-LOCK-1  
**Scope:** `H:\SOSWebsite\RedDirt`  
**Last updated:** 2026-04-26  
**Prerequisites:** Sections 1–2 artifacts ([`KELLY_SOS_DAY_6_SECTION_1_REPORT.md`](./KELLY_SOS_DAY_6_SECTION_1_REPORT.md), [`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md), [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md)).

## Purpose

Close the **7-day sprint planning loop** without destructive git: document **go/no-go**, **post-launch backlog**, and **maintenance** handoff. Matches **Day 7** in [`KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md`](./KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md).

---

## Steve go / no-go (campaign decision)

Technical preparation is **logged**. Commercial launch timing, paid media, and **apex DNS** cutover remain **campaign** decisions.

| Gate | Status (2026-04-26) |
|------|---------------------|
| Engineering quality (`npm run check`, CI workflow) | **Satisfied** — see build log |
| Intake → DB → `WorkflowIntake` (local + operator smoke) | **Satisfied** |
| Deploy docs + Netlify build script alignment | **Satisfied** (`deployment.md`, `netlify-build.sh`) |
| Section 2 technical smoke (local stand-in) | **Satisfied** — **Netlify deploy-preview** re-smoke still **recommended** before apex |
| Counsel **formal** approval of `/privacy` + `/terms` | **Pending** — **draft waiver** on file |
| Treasurer **formal** confirmation of paid-for + donate | **Pending** |
| Steve demo confidence | **Operator rehearsal** completed; **live** stakeholder demo optional |

**Go:** Steve checks “yes” when counsel/treasurer and DNS/hosting posture match campaign comfort.  
**No-go:** Hold until critical P0s below are cleared or explicitly waived in writing.

---

## P0 / P1 / P2 (rolling)

| Priority | Item | Owner |
|----------|------|--------|
| **P0** | **Netlify deploy-preview** smoke (`section2-preview-smoke.ps1` + build log row) | Ops |
| **P0** | **Counsel** final copy or timed waiver for `/privacy`, `/terms` | Steve / counsel |
| **P0** | **Treasurer** confirm GoodChange URL + `NEXT_PUBLIC_DONATE_EXTERNAL_URL` on prod | Treasurer |
| **P1** | SendGrid/Twilio live vs manual fallback per [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md) | Ops |
| **P1** | `npm run ingest` / search chunks seeded for prod demo quality | Ops |
| **P2** | Minimum-necessary **CSV export** for intake if staff need spreadsheets | Engineering |
| **P2** | Mobile + a11y formal pass | Design / QA |

---

## Post-launch backlog (explicitly not this sprint)

Per master plan: **no template extraction** during Kelly launch stabilization.

1. **Template extraction** — see workspace-level `KELLY_SOS_RECLASSIFICATION_AND_MIGRATION_MAP.md` (reference only; no execution until post-stability).
2. **Auto-confirm email** for every form submit — deferred ([`KELLY_SOS_DAY_4_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_4_COMPLETION_REPORT.md)).
3. **OpenAI** required vs optional — decision in [`KELLY_SOS_DECISION_LOG.md`](./KELLY_SOS_DECISION_LOG.md).
4. **Canonical public domain** (`sos-public` vs RedDirt only) — [`KELLY_SOS_DECISION_LOG.md`](./KELLY_SOS_DECISION_LOG.md).
5. **Fine-grained RBAC** on admin routes — campaign SOP + future engineering.

---

## Optional git freeze (non-destructive)

If Steve wants a pointer in git history:

```bash
git tag -a kelly-sos-launch-prep-2026-04 -m "Kelly SOS launch prep checkpoint — docs + smoke evidence"
git push origin kelly-sos-launch-prep-2026-04
```

Do **not** rewrite history, force-push, or delete branches without explicit approval.

---

## Handoff: Cursor “next pass”

After Section 3, default to **maintenance mode** — see [`KELLY_SOS_NEXT_PASS_SCRIPT.md`](./KELLY_SOS_NEXT_PASS_SCRIPT.md) (post-launch).

*End KELLY-S3-LOCK-1*
