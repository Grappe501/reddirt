# Reimbursement Operations Engine (Sprint 8)

**Route:** `/admin/campaign-events/reimbursement`

## Pipeline statuses

| Status | Meaning |
|--------|---------|
| draft | Month not ready |
| pending_review | Travel/approval queues open |
| awaiting_receipts | Approved travel; documentation gaps |
| ready_for_reimbursement | Cleared for packet |
| reimbursed | Month finalized / paid (operator) |
| archived | Closed period |

Legacy month store (`draft` / `needs_review` / `ready` / `finalized`) remains; pipeline extends UX without breaking finalize guards.

## Features

- **Packet builder** — groups travel lines, receipt count, audit note (`generateReimbursementPacketAction`)
- **Audit history** — `data/campaign-events/finance/reimbursement-ops/{month}.json`
- **Exception detection** — duplicate mileage days, reimbursement spikes, missing mileage

## UI

`ReimbursementOperationsPanel` on reimbursement page + `TreasurerReadinessPanel`.
