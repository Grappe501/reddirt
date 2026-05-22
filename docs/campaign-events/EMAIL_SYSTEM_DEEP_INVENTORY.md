# Email System Deep Inventory

**Scope:** `H:\SOSWebsite` (all lanes) · **Unification target:** `RedDirt/` Campaign OS  
**Date:** May 2026 communications sprint

---

## Executive summary

| Lane | Real email send? | Provider | Unified into Campaign OS? |
|------|------------------|----------|---------------------------|
| **RedDirt** | Yes (gated) | SendGrid, Gmail, Twilio | **Yes — primary** |
| countyWorkbench | mailto/draft only | None | Link only |
| sos-public | Formspree/mailto | Formspree | Migrate intake to RedDirt |
| ajax | Planned | None yet | Firewall — packet only |
| phatlip | None | — | Out of scope |
| kelly-travel-reimbursement | None | — | Out of scope |

**Not found in repo:** Mailgun, Resend, nodemailer, Postmark, generic SMTP.

---

## RedDirt — send rails

| Path | Sends? | Provider | Audit | Risk |
|------|--------|----------|-------|------|
| `src/lib/email-command-center/send-execution.ts` | Broadcast/test (governed) | SendGrid | Prisma executions | Requires SEND APPROVED + ASM |
| `src/lib/integrations/sendgrid/send-email.ts` | 1:1 thread | SendGrid | CommunicationMessage | Opt-out |
| `src/lib/integrations/gmail/` | Staff send (optional) | Gmail API | StaffGmailAccount | OAuth scope |
| `src/lib/campaign-events/approval-email/` | Approval packages | SendGrid | `_approvalEmailLog` | **EMAIL_SEND_ENABLED** default off |
| `src/lib/campaign-ops/ops-notifications.ts` | Volunteer signup notify | SendGrid | Soft fail | Hardcoded fallback risk |
| `src/app/api/sendgrid/events` + `api/webhooks/sendgrid` | Inbound | SendGrid | Events + suppressions | Two webhook paths |
| `src/lib/comms/campaign-processor.ts` | Broadcast campaigns | SendGrid+Twilio | Campaign rows | Audience resolution |
| `src/lib/campaign-events/email-draft-builder.ts` | **Draft only** | — | UI | Not wired to send |
| `src/app/admin/(board)/communications` | **No send** | — | V1 JSON | Unified dashboard (this sprint) |

---

## RedDirt — contact / list stores

| Store | Path | Notes |
|-------|------|-------|
| Prisma ECC | `EmailContactProfile`, import batches, audiences | **Authoritative** when DB up |
| SendGrid Marketing | `sendgrid-contact-sync.ts` | Sync after commit |
| Suppressions | `SendGridSuppression`, `ContactPreference` | Required pre-broadcast |
| Campaign OS V1 JSON | `data/campaign-events/communications/*.json` | Staging/demo (this sprint) |
| Approval recipients | `approval-recipients.ts` | Candidate/CM static |
| WorkflowIntake | Public forms | Host/event intake |

---

## countyWorkbench

| Path | Purpose | Send? |
|------|---------|-------|
| `pathToVictoryEmails.ts` | mailto drafts | Client only |
| `/counties/tools/email-center` | Operator drafts | Export/mailto |
| Docs explicitly forbid SendGrid in lane | — | — |

---

## sos-public

| Path | Purpose | Send? |
|------|---------|-------|
| `ContactPageClient.tsx` | Formspree + mailto | External |

---

## ajax

| Path | Purpose | Send? |
|------|---------|-------|
| `outreach_queue` (Supabase) | Queue UI | **No** — planned SendGrid |

---

## Env vars (RedDirt — names only)

**SendGrid:** `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, `SENDGRID_UNSUBSCRIBE_GROUP_ID`, webhooks  
**Approval:** `EMAIL_SEND_ENABLED`, `EMAIL_PROVIDER`, `APPROVAL_EMAIL_*`, `APPROVAL_BASE_URL`  
**Gmail:** `GOOGLE_GMAIL_*`, `GMAIL_TOKEN_ENCRYPTION_KEY`, `GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH`  
**Ops:** `OPS_NOTIFICATION_EMAIL_TO`

See `EMAIL_ARCHITECTURE_TRUTH_REPORT.md` for direct answers.

---

## Unification rule

One operator surface: `/admin/communications` → Email Command Center for real sends. No parallel bulk-send UX without audit.
