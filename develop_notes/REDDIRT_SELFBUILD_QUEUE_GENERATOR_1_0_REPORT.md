# REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0 — report

## Slice summary

**Packet:** **REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0**. First machine-generated **self-build queue** plus **status snapshot** and **next recommendation** JSON, with generator and validator scripts. No slice execution and no product code changes.

## Files created

| Path |
|------|
| `data/selfbuild/reddirt_selfbuild_queue.json` |
| `data/selfbuild/reddirt_selfbuild_queue_status.json` |
| `data/selfbuild/reddirt_selfbuild_next_recommendation.json` |
| `scripts/generate-selfbuild-queue.mjs` |
| `scripts/validate-selfbuild-queue.mjs` |
| `docs/REDDIRT_SELFBUILD_QUEUE_GENERATOR.md` |

## Files modified

| Path |
|------|
| `docs/REDDIRT_SELFBUILD_SLICE_PROTOCOL.md` |
| `docs/PROJECT_MASTER_MAP.md` |
| `docs/THREAD_HANDOFF_MASTER_MAP.md` |

## Generator behavior

Reads roadmap seed, dependency graph, known blockers, slice schema, boundary JSON; requires progress ledger doc path to exist. Writes the three queue outputs only. First five items are fixed order; additional blocked ECC proof items extend the queue.

## Validator behavior

Ensures queue parses, first five **`sliceId`** values match required order, **`mustNotDo`** / **`checksRequired`** non-empty per item, **live send** blocked and ordered after **hosted DB proof**, **`nextRecommendedSlice`** is **`REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`** in both status and next JSON, blocked items have **`blockedBy`**, hosted item not blocked.

## Governance status

Lane **RedDirt/** only. No `package.json`, Prisma, migrations, sends, or cross-lane edits. Queue is advisory; humans own approvals and execution.

## Checks

- `node scripts/generate-selfbuild-queue.mjs`
- `node scripts/validate-selfbuild-queue.mjs`
- `node scripts/validate-selfbuild-dependency-graph.mjs`
- `node scripts/validate-selfbuild-boundaries.mjs`
- `node scripts/validate-selfbuild-slice.mjs`
- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`

## Risks / limitations

- Completed counts for foundation slices are **static** in the generator until a live status source exists.  
- Queue does not diff git; it does not prove in-progress work on a developer machine.

## Next recommended slice

**REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0** — begin hosted production-readiness proof with read-only diagnostics and documented operator verification; no live send or automation activation until that packet closes.

---

*End of report — **REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0**.*
