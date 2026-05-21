# Approval package email workflow

## Overview

Operators build an approval package from ledger + calendar truth, preview email bodies, and optionally send to configured candidate recipients. Recipients use tokenized links to review and record decisions on **`CampaignEventLedgerRecord` only** — no Google Calendar write.

## Human control (AI)

- AI may **suggest, draft, summarize, score, and route** via deterministic tools (`SPRINT4_AI_TOOLCHAIN.md`).
- AI may **not** send email, approve, deny, hold, promote Google Calendar, or post financial transactions without explicit human action.
- Observations append to `factCard._aiObservations` for future V2 learning — no analytics backend yet.

## Enable sending

1. Set `EMAIL_SEND_ENABLED=true`
2. Set `EMAIL_PROVIDER=sendgrid`
3. Set `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME` (or `APPROVAL_EMAIL_*`)
4. Set `APPROVAL_BASE_URL` to the public site URL

Until all are set, admin UI shows exact missing config and send buttons stay disabled.

## Operator flow

1. Open approval package preview (`/admin/campaign-calendar/approval-package/[recordId]`), drilldown approval tab, or workbench package panel.
2. Confirm recipients and subject (deterministic AI assist — no OpenAI required).
3. **Preview body** — HTML/text built with placeholder token paths.
4. **Send approval package** — creates token set, sends SendGrid mail, appends `_approvalEmailLog`.
5. **Resend** — same send path (new tokens + log entry).
6. **Dry-run log only** — appends `drafted` log without send.

## Recipient defaults

- `kelly@kellygrappe.com`
- `grappe4arkansas@gmail.com`

## Public recipient flow

Links point to `/campaign-events/approval/{tokenId}`:

- **review** — multi-use; shows package + action links
- **approve / deny / hold / request_info** — single-use; confirms and writes ledger decision

Footer note in email: Google Calendar promotion is not enabled yet.

## Audit

Send attempts stored in `factCard._approvalEmailLog` with status: `drafted` | `skipped_disabled` | `sent` | `failed`.

## What does NOT happen

- No Google Calendar create/update/delete
- No official calendar promotion
- No reply-by-email parsing (future sprint)
- No SMS / PDF export / FIN-1 bridge

## Commands

```bash
npm run campaign-events:test-approval-email -- --dry-run
npm run campaign-events:test-approval-email -- --dry-run 2026-04
```

## Related docs

- `SPRINT4_EMAIL_TRACE.md`
- `APPROVAL_TOKEN_SECURITY.md`
- `CANDIDATE_APPROVAL_INBOX.md`
