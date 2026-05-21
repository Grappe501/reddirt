# Approval token security

## Storage

Tokens live in `data/campaign-events/approval-package-tokens.json` (JSON repository). Each send creates a set:

| Action | Use |
|--------|-----|
| `review` | Multi-use until expiry |
| `approve`, `deny`, `hold`, `request_info` | Single-use (`usedAt` set on decision) |

## Metadata

- `id` — `apt_*` random hex
- `recordId` — ledger row
- `recipientEmail` — optional audit
- `expiresAt` — 14 days from creation
- `status` — `active` | `used` | `expired` | `revoked`
- `packageLogId` — ties to email log entry

## URL shape

`{APPROVAL_BASE_URL}/campaign-events/approval/{tokenId}`

## Validation

Public page loads token, rejects revoked/missing, resolves expired status at read time. Action tokens call `applyReviewDecision` then mark used.

## Limits (honest)

- Tokens are **unguessable IDs**, not signed JWTs — sufficient for low-volume campaign ops with short TTL.
- JSON file is **not ideal for multi-instance Netlify** — concurrent writes may race; migrate to Prisma if production send volume grows.
- No per-recipient binding enforcement on action submit yet (email link secrecy is the control).
- Review link can be forwarded; action links are single-use.

## Ledger writes

Only `CampaignEventLedgerRecord` / `factCard._review` via `review-persistence.ts`. Tokens do not touch Google APIs.

## Revocation

Operator can delete/revoke tokens in JSON manually until admin revoke UI exists.

## Future

- Signed tokens (HMAC) if `APPROVAL_TOKEN_SECRET` is added
- Prisma `ApprovalPackageToken` table
- Reply-by-email parser (separate sprint; do not conflate with token links)
