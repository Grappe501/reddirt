# Compliance market readiness plan

## Definition

**Market ready** means a campaign treasurer and compliance operator can run April 2026 compliance end-to-end with source-backed gates, private evidence, honest red/yellow/green status, and documented human sign-off — without developer intervention for routine work.

**Not included:** Legal certification, guaranteed ACE acceptance, or automated filing submission.

## Current readiness score

Run `npm run compliance:ai-market-plan` and `npm run compliance:ai-launch-readiness`.

| Metric | Typical current value |
|--------|----------------------|
| Launch checklist | ~13% (`not_ready`) |
| Overall area completion | ~45–55% (heuristic) |
| qa-full | 66 yellow |
| Filing | red |

## Blockers by stage

### Demo (show stakeholders the product)

- [ ] Command center loads with plain-English status  
- [ ] April26 desk shows source inventory  
- [ ] Approval workbench demo item (sanitized)  
- **Blocker:** Bank CSV missing — recon demo incomplete  
- **Blocker:** 133 open items — looks “unfinished” (honest)

### Operator use (daily campaign operations)

- [ ] Bank CSV present  
- [ ] Operator coach workflow followed  
- [ ] Burn-down export drives work  
- [ ] Rules topics reviewed  
- **Blocker:** Storage local_private on production  
- **Blocker:** No Netlify verify checklist signed  

### Production filing (export package)

- [ ] Filing readiness green (source-backed)  
- [ ] All hard gates pass  
- [ ] Treasurer sign-off recorded  
- **Blocker:** 6+ filing blockers  
- **Blocker:** Unapproved queue volume  

### Public launch (Netlify + committee staff)

- [ ] Production deploy verified  
- [ ] Admin routes protected  
- [ ] No public PII exports  
- [ ] RLS on evidence bucket  
- **Blocker:** Steve env + RLS  
- **Blocker:** DB migration optional but planned  

## 7-day plan

| Day | Human | AI | Steve | Engineering |
|-----|-------|-----|-------|-------------|
| 1 | Add bank CSV | `ai-expert`, `bank:qa` | — | — |
| 2 | Recon workbench | `ai-reconciliation-coach` | — | — |
| 3 | Rules topics (top 5) | `ai-rule-coach` | — | — |
| 4 | Queue burn-down start | `operator-review-export-v2` | — | UX pass review |
| 5 | Smoke test browser | `ai-thread-handoff` | Storage env | — |
| 6 | Filing blocker triage | `ai-filing-coach` | RLS verify | — |
| 7 | Launch rehearsal checklist | `ai-daily-brief` | — | Deploy verify doc |

## 14-day plan

- Week 1: Phases 1–3 completion plan (sources, recon, rules)  
- Week 2: Phases 4–5 (queue, filing green path) + Netlify verify  
- Target: `rehearsal_ready` on launch checklist; filing may still be red until queue clear  

## 30-day plan

- Weeks 1–2: Operator-ready rehearsal  
- Week 3: Production storage + operator training (no PII in chat)  
- Week 4: Steve DB migration decision + post-migration QA if approved  
- Target: `launch_ready` checklist + filing green with sign-off  

## Source-file actions

1. `H:\SOSWebsite\Compliance\April26\bank-april-2026.csv`  
2. Optional ethics workbook  
3. Maintain GoodChange + images on disk  

## QA / signoff actions

```bash
npm run compliance:qa-full
npm run compliance:ai-expert:qa
npm run compliance:operator-review-export-v2
```

Signoff packet: `COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md` + `COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md` + treasurer written approval (external).

## UX actions

- Command center as home (`/admin/compliance/command-center`)  
- Implement `COMPLIANCE_UX_WORLD_CLASS_PLAN.md` phases  
- `npm run compliance:ai-ux-audit` after each UX release  

See also `COMPLIANCE_IMMEDIATE_IMPROVEMENTS.md` and `COMPLIANCE_PROGRESS_MATRIX.md`.
