# Decision Simulator — Netlify Preview 1.0

## Preview route

`/admin/decision-simulator`

## What is usable now

The first browser dashboard is wired to the real Decision Simulation Engine contracts.

- Paste an opening email, social post, statement, text, debate line, memo, or strategic move.
- Name the operator side and counterparty.
- Supply objective and additional context.
- Select 1, 10, 100, 1,000, or a custom run count up to 1,000,000.
- 1–10 runs execute live through the server-side OpenAI ensemble runtime.
- More than 10 runs display the real queued/distributed workload plan rather than attempting unsafe long-running HTTP execution.
- Completed ensembles show dominant first-response frames, dominant final recommendations, average confidence, average scenario probability, token usage, and representative six-move paths.

## Security

- `/api/admin/decision-simulator/run` uses the existing RedDirt `assertAdminApi()` gate.
- The endpoint is rate-limited because each live run can spend OpenAI tokens.
- `OPENAI_API_KEY` remains server-side only.
- The client never receives or references the key.
- The simulator never sends, posts, schedules, or executes the correspondence being analyzed.

## Netlify environment

The Netlify site must contain the same server-only environment variable used by local RedDirt:

`OPENAI_API_KEY`

Optional model override:

`DECISION_SIMULATION_OPENAI_MODEL`

If the override is absent, the runtime falls back to the existing `OPENAI_MODEL` and then the engine default.

## Launch gate

Before treating the preview as operational, run from the RedDirt root:

1. `npx tsx scripts/test-decision-simulator-dashboard.ts`
2. `npx tsx scripts/test-decision-simulation-foundation.ts`
3. `npx tsx scripts/test-decision-simulation-openai-runtime.ts`
4. `npx tsx scripts/test-decision-simulation-actor-model.ts`
5. `npx tsx scripts/test-decision-simulation-ensemble.ts`
6. `npm run typecheck`
7. `npm run build`

Then deploy the current `main` branch through the existing RedDirt Netlify pipeline and inspect `/admin/decision-simulator` while authenticated as an admin.

## Next production backend slice

Enable persisted worker execution for queued/distributed ensembles so 100, 1,000, and eventually 1,000,000 runs execute asynchronously in resumable chunks with budget controls, cancellation, retry, and aggregate-only retention options.
