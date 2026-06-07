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
| **10** | Strategy & political philosophy command | Unified inventory + enriched graph + manual crosswalk |
| **11 (P0)** | Campaign system manual surfacing | 252 files browsable in intelligence + category guides |
| **11 (P1)** | Kelly SOS strategic plan command | 22 chapters in intelligence + full chapter depth |
| **11 (P2)** | Movement philosophy + staff strategy command | docs/philosophy + VOL-CORE-1 + staff lane migration bridge |
| **11 (P3)** | Strategy doctrine JSON command | 9 SDI-1 artifacts in data/strategy-doctrine/ |
| **11 (P4)** | Philosophy graph claims review | 8 NSI-4 nodes bound to claim ledger |
| **11 (P5)** | Field Book chunk promotion | ~2,795 chunks in 11 promotion batches + canon workflow |
| **11 (P6)** | Strategy alignment chunk preview | 8 SDI-1 preview lanes + doctrine crosswalk before Field Book promotion |
| **11 (P7)** | Briefing papers chunk attach | 8 attach lanes merge P6 previews into governed paper deep sections |
| **11 (P8)** | Field Book promotion execution | 8 execution waves complete P5→P8 canon pipeline |

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
12. `test-phase10-strategy-philosophy-command` (Phase 10 strategy & philosophy command)
13. `test-phase11-campaign-system-surfacing` (Phase 11 P0 campaign system manual)
14. `test-phase11-p1-kelly-strategic-plan` (Phase 11 P1 Kelly strategic plan)
15. `test-phase11-p2-movement-philosophy-staff-strategy` (Phase 11 P2 movement philosophy + staff strategy)
16. `test-phase11-p3-strategy-doctrine` (Phase 11 P3 strategy doctrine JSON)
17. `test-phase11-p4-philosophy-graph-claims-review` (Phase 11 P4 philosophy graph claims)
18. `test-phase11-p5-field-book-chunk-promotion` (Phase 11 P5 Field Book chunk promotion)
19. `test-phase11-p6-strategy-alignment-chunk-preview` (Phase 11 P6 strategy alignment chunk preview)
20. `test-phase11-p7-briefing-papers-chunk-attach` (Phase 11 P7 briefing papers chunk attach)
21. `test-phase11-p8-field-book-promotion-execution` (Phase 11 P8 Field Book promotion execution)
22. `test-phase11-p9-stack-closure` (Phase 11 P9 stack closure)
23. `test-phase15-p0-p1-candidate-command` (Phase 15 P0+P1 candidate command experience)
24. `test-phase15-p2-kelly-prep-week` (Phase 15 P2 Kelly prep week)
25. `test-phase15-p3-stage-safe-filter` (Phase 15 P3 stage-safe filter)
26. `test-phase15-p4-top-tier-surfacing` (Phase 15 P4 top-tier surfacing)
27. `test-phase15-p5-evidence-honesty` (Phase 15 P5 evidence honesty badges)
28. `test-phase15-p6-demo-mode` (Phase 15 P6 demo mode)
29. `test-phase15-p7-ipad-polish` (Phase 15 P7 iPad polish)
30. `test-phase15-p8-staff-backstage` (Phase 15 P8 staff backstage route guards)
31. `test-phase15-cce-closure` (Phase 15 P9 CCE closure)
32. `test-phase16-p0-session-launcher` (Phase 16 P0 session launcher)
33. `test-phase16-p1-run-of-show` (Phase 16 P1 timed run-of-show)
34. `test-phase16-p2-encounters` (Phase 16 P2 encounter scenarios)
35. `test-phase16-p3-drill-queue` (Phase 16 P3 drill queue)
36. `test-phase16-p4-session-debrief` (Phase 16 P4 session debrief)
37. `test-phase16-p5-ipad-drill-player` (Phase 16 P5 iPad drill player)
38. `test-phase16-p6-session-memory` (Phase 16 P6 session memory)
39. `test-phase16-p7-staff-coach` (Phase 16 P7 staff coach overlay)
40. `test-phase16-p8-live-event` (Phase 16 P8 live event mode)
41. `test-phase16-sre-closure` (Phase 16 P9 SRE stack closure)
34. `agents:test-intelligence-hardening`
35. `lint:all`
36. `typecheck`
37. `build` (production Next.js build — Netlify parity)

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
