# Intelligence upgrade phase protocol

Run **one phase at a time**. At the end of each phase, execute the full sandbox before any GitHub push.

## Phase sequence (exponential depth plan)

| Phase | Goal | Exit signal |
|-------|------|-------------|
| **0** | Pakko command center + findability | `/admin/intelligence/opponents/michael-packo` live in Phase A nav |
| **1** | Dossier & bio narrative pass | Kelly/Hammer/Pakko read like briefing books |
| **2** | New surfaces depth (diligence, Field Book) | Phase A pages have operator prose, not empty forms |
| **3** | Page-by-page depth waves (6 waves) | 5-layer standard on debate spine |
| **4** | Field Book canon loop | Route bindings + strategy migration |
| **5** | Debate glossary + hub connectivity | Glossary index + Phase B/C depth + all hub bindings |
| **6** | Debate-ready governance | Prep encounter depth + trap rebuttals + claims review wave |
| **7** | Dossier briefing closure + diligence runbook | Briefing-book bar + five-search runbook + KH wave 2 |
| **8** | Dossier research depth + ACCA panel closure | Research corpus + ACCA runbook + KH wave 3 |
| **9** | Dossier depth + debate instruction bridge | 2× dossier expansion + prep/trap/SOS bridge + coaching runbook + KH wave 4 |

## End-of-phase sandbox (required)

From `RedDirt/`:

```bash
npm run intelligence:phase-sandbox
```

This runs, in order:

1. `strategy-manual:verify`
2. `test-pakko-command-center` (Phase 0+ routes and contrast gate)
3. `test-dossier-briefing-book` (Phase 1 dossier depth)
4. `test-phase2-diligence-field-book` (Phase 2 operator prose)
5. `test-phase3-debate-spine-depth` (Phase 3 five-layer waves)
6. `test-phase4-canon-loop` (Phase 4 canon loop + strategy migration)
7. `test-phase5-glossary-connectivity` (Phase 5 glossary + hub connectivity)
8. `test-phase6-debate-ready-governance` (Phase 6 debate-ready governance)
9. `test-phase7-dossier-diligence-closure` (Phase 7 dossier briefing closure)
10. `test-phase8-dossier-research-acca-closure` (Phase 8 dossier research + ACCA closure)
11. `test-phase9-debate-instruction-bridge` (Phase 9 debate instruction bridge)
12. `agents:test-intelligence-hardening`
13. `lint:all`
14. `typecheck`
15. `build` (production Next.js build — Netlify parity)

**Do not push** if any step fails. Fix in the active lane slice only.

## Deploy protocol

After sandbox green:

1. `git add -A` (review — no secrets, no `.env`)
2. Commit with phase id in message (e.g. `Phase 0: Pakko command center and nav findability`)
3. `git push origin feature/kelly-schedule-settlement-dashboard`
4. `git push origin HEAD:main` — Netlify deploys `main`, base directory `RedDirt`

## New-link color coding

Teal highlight on nav links = routes in the current release batch until visited once. Append a new batch in `navLinkReleaseManifest.ts` per phase deploy.

## Lane colors (Phase D+)

- Rose — Phase A command
- Emerald — Kelly candidate lane
- Sky — Clerks lane
- Violet — Staff lane
