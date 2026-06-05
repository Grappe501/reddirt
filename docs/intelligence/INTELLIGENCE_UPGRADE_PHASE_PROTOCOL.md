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
8. `agents:test-intelligence-hardening`
9. `lint:all`
10. `typecheck`
11. `build` (production Next.js build — Netlify parity)

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
