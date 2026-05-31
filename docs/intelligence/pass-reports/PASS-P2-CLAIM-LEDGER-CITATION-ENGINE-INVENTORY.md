# Pass P2 — Claim Ledger + Citation Engine — Inventory

**Date:** 2026-05-31  
**Lane:** RedDirt/

## Files inspected

- P1: `evidencePacketTypes.ts`, `evidencePacketGenerator.ts`, `claimClassification.ts`, `llmBriefReviewQueue.ts`
- NSI-12: `llmDraftGateway.ts`, `llmDraftReviewWorkflow.ts`, `llm-review-queue/page.tsx`
- KH-4: `kimHammerCitationLocker.ts`, export control patterns
- Governance: `governedBriefTypes.ts`, `citationDepthPolicy` (new)

## Reusable structures

- P1 `ClassifiedClaim` → ledger ingest
- NSI-12 `appendDraftToReviewQueue` — unchanged; claim summary added to UI
- KH citation locker — separate opposition lane; intelligence ledger is campaign-wide

## Duplication risks

- Do not duplicate KH-4 claim graph — intelligence ledger is internal campaign OS layer
- Fingerprint merge prevents duplicate chaos across 75 county briefs

## Proposed ledger schema

JSON files under `data/intelligence/claims/` — Postgres-ready interfaces in `claimLedgerTypes.ts`

## UI integration points

- `/admin/intelligence/claims` — list + trace
- `/admin/intelligence/claims/[claimId]` — detail + review actions
- `/admin/intelligence/llm-review-queue` — claim summary rollup
- `/admin/intelligence` — link to claim ledger

## Test plan

`agents:test-claim-ledger-citation-engine` — 20 checks
