# Candidate approval inbox

## Surfaces

- **Candidate dashboard** (`/admin/candidate-dashboard`) — Approval package inbox section
- **Campaign manager dashboard** — Approval queue stats; links to candidate dashboard (CM email not configured)

## Inbox row fields

| Field | Source |
|-------|--------|
| Event title / date / time | Workbench row |
| `packageStatus` | Latest `_approvalEmailLog` entry (`not_sent` if none) |
| `lastSentAt` | Log `sentAt` |
| `awaitingCandidate` | Pending decision and last send ≠ `sent` |
| Link | `/admin/campaign-calendar/approval-package/[recordId]` |

## Status meanings

- `not_sent` — no log yet
- `drafted` — dry-run or draft log only
- `skipped_disabled` — send attempted while gated off
- `sent` — SendGrid path succeeded
- `failed` — transport error recorded on log

## CM inbox

Campaign manager recipient is **not configured**. Do not invent `campaignManager@` addresses. When Steve provides CM email, extend `approval-recipients.ts` only.

## Operator vs candidate

This inbox is an **admin dashboard** view for Kelly team visibility, not a separate candidate login portal. Public decisions use email token links.
