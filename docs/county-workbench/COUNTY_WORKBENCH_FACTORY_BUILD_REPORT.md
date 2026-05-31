# County Workbench Factory Build Report

**Date:** 2026-05-31 · **Lane:** RedDirt/

## Executive summary

Built **County Workbench Factory** — all-75-county infrastructure for facts, cross-tables, compiled profiles, internal briefs, AI builder agent, queueable scripts, and admin dashboard rollup. No canonical goal mutation. No fabricated API data when keys unset.

## What was built

- `src/lib/county-workbench/factory/*` — types, fact store, source catalog, ingestion adapters, cross-tables, profile compiler, brief factory, AI agent
- `data/county-workbench/**` — facts, tables, profiles, briefs, agent run
- Admin `CountyFactoryRollupPanel` on `/admin/county-intelligence`
- 9 npm scripts + `county:factory:all`
- `agents:test-county-workbench-factory` (21 tests)

## 75-county readiness

| Metric | Value |
|--------|------:|
| Counties in registry | 75 |
| Factory profiles | 75 |
| Factory briefs | 75 |
| Shell profiles | 69 |
| Partial profiles | 6 |
| Compiled (≥60 score) | 0 |
| Avg readiness | ~22/100 |
| Cross-table avg completeness | 8% |

## Fact counts

| Status | Count (approx) |
|--------|------:|
| Total facts | 525 |
| VERIFIED (registry identity) | 225 |
| ESTIMATED (planning proxy) | 75 |
| MISSING (research gap markers) | 75 |
| IMPORTED_UNVERIFIED (workbench) | 150 |

## Source coverage

- Configured: registry, campaign notes, Prisma read path (declared), workbench bridge (when `COUNTY_WORKBENCH_ROOT` set)
- Deferred: Census, BLS, SOS, education, health, local assets (Passes C1–C8)

## Commands / results

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run county:factory:all` | PASS — 75/75 profiles + briefs |
| `npm run agents:test-county-workbench-factory` | **21/21 PASS** |
| `npm run agents:test-county-intelligence` | (see run) |
| `npm run email:no-send-scan` | (see run) |

## Debate-useful county intelligence

- 6 partial counties (workbench depth) have readiness facts + debate relevance sections in briefs
- 69 shell counties labeled honestly — limited debate utility until Pass C2/C6–C10
- Kim Hammer geographic overlays (5 counties) still separate NSI path

## Next queue (tonight)

See `COUNTY_WORKBENCH_NEXT_QUEUE_PLAN.md` — start **Pass C2** (SOS registration) then **C6** (events for travel)

## Deployment readiness

Typecheck green. Push to GitHub → verify Netlify. Smoke: `/admin/county-intelligence`, `/admin/intelligence`
