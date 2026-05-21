# Sprint 4 — Email infrastructure trace

**Lane:** `RedDirt/` · **Date:** May 2026

## Is there existing mail transport?

**Yes.** SendGrid Mail Send API v3 is implemented in `src/lib/sendgrid/mail-send.ts` (`sendSendGridSingleTestEmail`). Campaign-event approval packages reuse this path via `src/lib/campaign-events/approval-email/approval-email-send.ts`.

Other email systems in the lane (compliance / command center) are separate; do not wire approval sends through those without an integration packet.

## Environment variables

| Variable | Role | Default / notes |
|----------|------|-----------------|
| `EMAIL_SEND_ENABLED` | Master gate | `false` unless `true` / `1` / `yes` |
| `EMAIL_PROVIDER` | Provider id | `sendgrid` (only supported value) |
| `APPROVAL_EMAIL_FROM` | From address | Falls back to `SENDGRID_FROM_EMAIL` |
| `APPROVAL_EMAIL_FROM_NAME` | From display | Falls back to `SENDGRID_FROM_NAME` |
| `APPROVAL_EMAIL_REPLY_TO` | Reply-To | Defaults to from address |
| `APPROVAL_BASE_URL` | Token link host | Falls back to `NEXT_PUBLIC_SITE_URL` |
| `SENDGRID_API_KEY` | SendGrid auth | Required when send enabled |
| `SENDGRID_FROM_EMAIL` / `SENDGRID_FROM_NAME` | Shared with other SendGrid features | Used if approval-specific vars unset |

## Safest provider for Kelly SOS

**SendGrid** — already in repo, Netlify-friendly (HTTPS outbound from serverless functions), no new vendor. Resend/SMTP are not wired for campaign-events approval.

## Netlify deploy notes

- Set env vars in Netlify UI (never commit secrets).
- `APPROVAL_BASE_URL` must be the public site URL (e.g. production Kelly domain) so token links resolve.
- Build uses existing `netlify:build`; no new edge functions required.
- JSON token store: `data/campaign-events/approval-package-tokens.json` — ensure deploy includes writable path or migrate to DB before multi-instance production (documented in `APPROVAL_TOKEN_SECURITY.md`).

## What drafts vs sends today

| Surface | Behavior |
|---------|----------|
| `EmailDraftScaffoldModal` | Host / comms drafts — not approval package send |
| `buildApprovalPackage()` | Preview payload always |
| `ApprovalPackageSendPanel` | Send / resend / dry-run / test-to-self |
| `EMAIL_SEND_ENABLED=false` | UI enabled; send logs `skipped_disabled`; no API call |
| `EMAIL_SEND_ENABLED=true` + SendGrid ready | Creates tokens, sends HTML+text, logs `sent` / `failed` |

## Key files

- `approval-recipients.ts` — `kelly@kellygrappe.com`, `grappe4arkansas@gmail.com`
- `approval-email-config.ts` — gating + missing-config messages
- `approval-email-template.ts` — HTML + plain text
- `approval-token-store.ts` — JSON tokens
- `approval-email-persist.ts` — `factCard._approvalEmailLog`
- `approval-email-actions.ts` — server actions for admin UI
- Public route: `/campaign-events/approval/[token]`

## Recipient policy

Candidate emails only (configured). Campaign manager / treasurer emails are **not** invented.
