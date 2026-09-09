# DEC-SIM queue execution 1.0 report

Slice: `DEC-SIM-QUEUE-EXECUTION-AND-PRODUCT-LOCK-1.0`  
Live URL: https://dec-sim.netlify.app

## Architecture built

Postgres-backed ensemble jobs already existed. This slice adds queue columns, a chunk table, job APIs, and a Netlify-safe worker:

1. Operator creates a job at `POST /api/admin/decision-simulator/jobs`.
2. 1–10 runs execute inline in that request using the existing ensemble engine.
3. 100 / 1,000 runs persist PENDING chunks (default size 1) and kick `/work`.
4. Each worker invocation claims one chunk, runs one OpenAI simulation, checkpoints, then the dashboard heartbeat re-invokes `/work`.
5. Progress is read from Postgres, never from in-memory state.

No second simulation engine was added.

## Job lifecycle

`QUEUED` → `RUNNING` → `COMPLETE` | `FAILED` | `CANCELLED`  
Partial progress stays on the ensemble row (`completed_runs`, `failed_runs`, tokens).

## Queue lifecycle

Claim one expired-or-pending chunk → execute bounded runs → idempotent complete → kick/allow next chunk. Architecture-only jobs (`> maxRunsPerJob`, including 1,000,000) store the plan and do not create executable chunks.

## Concurrency model

Defaults: live 10, queue concurrency 1, chunk size 1 for 100 and 1,000, max 2 active jobs, max 1,000 executable runs/job, 2 retries, $2 budget. One OpenAI call per Netlify invocation.

The operator dashboard also POSTs `/work` while polling so progress continues if the create-time kick is cut short by the function returning.

## Retry model

`POST /jobs/[jobId]/retry` resets FAILED chunks with attempts ≤ max retries and not cancelled. It does not replay COMPLETE chunks.

## Cancellation model

Operator cancel sets job `CANCELLED` and fails unfinished chunks. The worker checks job status before each member run.

## Cost controls

Estimate before create. 100+ requires `confirmExpensive`. 1,000+ also requires `confirmThousand`. Jobs whose estimated minimum exceeds `DECISION_SIM_JOB_BUDGET_USD` are rejected.

## Data retention

Full transcripts retained for ≤10 live runs via the existing ensemble runner. Queued chunks store compact member snapshots (frame, final, summary, move headlines), not hidden chain-of-thought.

## Dashboard improvements

Product header, five-step workflow, depth labels, cost confirmation, live progress, aggregate command center, generic vs saved actor selector with HYPOTHESIS MODEL badge.

## Domain boundary proof

`/` redirects to `/admin/decision-simulator` only when `decisionSimSite` is on. Campaign homepage strings stay in campaign content and are not the dec-sim entry surface. See `DEC_SIM_PRODUCT_BOUNDARY_AUDIT_1_0.md`.

## Tests

All Decision Simulator deterministic gates passed (no OpenAI spend):

- `scripts/test-decision-simulation-queue.ts`
- `scripts/test-decision-sim-domain-isolation.ts`
- `scripts/test-decision-simulator-dashboard.ts`
- `scripts/test-decision-simulation-scale.ts`
- `scripts/test-decision-simulation-foundation.ts`
- `scripts/test-decision-simulation-actor-model.ts`
- `scripts/test-decision-simulation-persistence.ts`
- `scripts/test-decision-simulation-phase5-orchestration.ts`
- `scripts/test-decision-simulation-openai-runtime.ts`

## Build result

`tsc --noEmit` passed from this worktree.

Local unstashed `next build` later completed successfully (exit 0) after ~39 minutes. That compile includes the full campaign App Router, not the dec-sim stash. It printed an unrelated `createRequire` warning from `src/lib/calendar-admin/ledger-write.ts`. The hosted product build is the `dec-sim` Netlify stash build.

## Deployment result

- `a43d5863` Netlify production deploy failed: GitHub `check` TS2783 duplicate `ok` on the worker route.
- `e378e762` fix pushed; `dec-sim` production deploy `6aa0e2e3dde0640008fe6862` is **ready**.
- Live verified 2026-09-09: `/` → 307 `/admin/decision-simulator`; dashboard shows Decision Simulator + “Model the next six moves before you act.”; no `THE PEOPLE RULE` / `Meet Kelly`.

## Live URL

https://dec-sim.netlify.app

## Blockers

- Worker progress on Netlify depends on create-time kick plus dashboard `/work` heartbeat. A closed tab can pause a long job until the next authenticated `/work` call.
- 10-run inline jobs can still approach the 26s function budget.
- Hosted campaign seed remains skipped (`SKIP_DB_SEED=1`); do not “fix” `County.createdAt` from this slice.

## Next slice recommendation

Next V1 slice: `DEC-SIM-ALTERNATIVE-FUTURES-1.0`. Canonical V1/V2 split: `DEC_SIM_V1_V2_ROADMAP_1_0.md`.
