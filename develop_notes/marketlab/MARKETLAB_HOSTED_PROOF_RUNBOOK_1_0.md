# MarketLab Hosted Proof Runbook 1.0

## Objective
Advance Build 1 from CI-proven to hosted-product-proven without touching the campaign site's deployment boundary.

## Dedicated environment only
Do not reuse or repurpose an unrelated Supabase project or the SOS/RedDirt public deployment. MarketLab requires its own named hosted environment.

## Required hosted values
- `MARKETLAB_DATABASE_URL`
- `MARKETLAB_DIRECT_URL`
- `NEXT_PUBLIC_MARKETLAB_SUPABASE_URL`
- `NEXT_PUBLIC_MARKETLAB_SUPABASE_PUBLISHABLE_KEY`
- `MARKETLAB_MARKET_DATA_PROVIDER`
- `MARKETLAB_MARKET_DATA_API_KEY`
- `MARKETLAB_ALPACA_API_SECRET` when Alpaca is selected
- `MARKETLAB_ALPACA_FEED`
- `MARKETLAB_BASE_URL`

## Automated hosted proof
Workflow: `.github/workflows/marketlab-hosted-proof.yml`

The workflow is manual by design because it targets real hosted resources. It performs:
1. dependency install;
2. hosted environment readiness validation;
3. Prisma generate;
4. migration deploy against the hosted MarketLab database;
5. strict TypeScript;
6. production Next build;
7. runtime `/api/health` smoke test against `MARKETLAB_BASE_URL`.

No secret values are printed by the runtime health endpoint.

## Remaining browser/game proofs after hosted workflow passes
1. Sign up/sign in with the dedicated MarketLab auth project.
2. Join Six-Week Classic and verify exactly `$1,000.00` opening cash.
3. Search a licensed live security and verify provider timestamp/source.
4. Execute a simulated BUY and verify one order, one execution, cash settlement, position quantity, and leaderboard refresh.
5. Execute a simulated SELL and verify realized P/L and position/cash state.
6. Submit the same rendered order ticket twice and prove only one execution exists.
7. Race two orders whose combined cash requirement exceeds available cash and prove the committed result never creates negative cash.
8. Repeat with competing SELLs and prove shares never become negative.
9. Create a second player and prove rank changes when marked portfolio values diverge.
10. Perform mobile/iPad hostile review and provider outage/market-closed/rate-limit review.

## Current blocker
A dedicated MarketLab hosted site and dedicated MarketLab Supabase project have not yet been created/connected through the available ChatGPT connectors. An existing generic inactive Supabase project was discovered but intentionally left untouched because ownership/purpose is not specific enough to safely repurpose.

## Completion rule
Build 1 may be called production-proven only after the hosted workflow passes and the live game proofs above are recorded with evidence.
