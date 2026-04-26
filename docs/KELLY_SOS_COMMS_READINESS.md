# Kelly SOS — comms, follow-up, and intake (Day 4 readiness)

**Doc ID:** KELLY-COMMS-1  
**Scope:** `RedDirt` only — public form intake, admin visibility, email/SMS stack, operator runbooks.  
**Last updated:** 2026-04-27

**Related:** [`KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md`](./KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md) (Day 4) · [`KELLY_SOS_DAY_3_TO_7_EXECUTION_BOARD.md`](./KELLY_SOS_DAY_3_TO_7_EXECUTION_BOARD.md) · [`.env.example`](../.env.example)

---

## 1. Intake → follow-up chain (intended)

| Step | System | Notes |
|------|--------|--------|
| 1 | Visitor submits a public form | `POST /api/forms` (rate-limited); honeypot field `website` for bots. |
| 2 | Persistence | `Submission` + `User` upsert (where applicable) + `VolunteerProfile` / commitments per form type. |
| 3 | Queue row | `WorkflowIntake` created with `status: PENDING`, `metadata` includes `source: public_form`, `formType`, `county`, `zip`, `interests`, optional AI `classifyIntake` tags when `OPENAI_API_KEY` is set. |
| 4 | Operator work | **Campaign workbench** “open work” counts `WorkflowIntake` in PENDING/IN_REVIEW/… · **`/admin/inbox`**, threads, and email workflow link intakes to comms. |
| 5 | Human follow-up | Field/volunteer team responds per campaign SLA (see §5). **Not** fully automated in v1. |

**Volunteer / county routing:** Use `metadata.county` and `metadata.interests` (and AI tags in `metadata.ai`) in admin filters; Prisma `WorkflowIntake.countyId` may be set when mapping exists—verify in `schema.prisma` before relying on it in filters.

**Sheet uploads vs public forms:** `/admin/volunteers/intake` is for **uploaded signup sheets** and batch intake, **not** the same queue as the website JSON forms. Train staff on the distinction.

---

## 2. Environment variables (names only; no values here)

| Variable | Role |
|----------|------|
| `SENDGRID_API_KEY` | Outbound email via SendGrid. |
| `SENDGRID_FROM_EMAIL` / `SENDGRID_FROM_NAME` | From line for transactional mail. |
| `SENDGRID_WEBHOOK_VERIFICATION_KEY` | Verify [SendGrid event webhooks](https://docs.sendgrid.com/) at `/api/webhooks/sendgrid`. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_SMS_FROM` | SMS; inbound/outbound webhooks at `/api/webhooks/twilio`. |
| `TWILIO_PHONE_NUMBER` | If used by your integration helpers (see `getTwilioEnv` / comms code paths). |
| `OPENAI_API_KEY` | Optional: intake classification tags on `WorkflowIntake.metadata` — not required for the chain to work. |
| `DATABASE_URL` | Required for any persistence. |
| `ADMIN_SECRET` | Required for `/admin` session. |

**Degraded / staging:** If SendGrid or Twilio keys are **missing**, outbound automations may no-op; the **intake still lands in Postgres** as long as `DATABASE_URL` is valid. Operators must use **manual follow-up** (§6). `npm run build` with DB down can still complete with Prisma connection warnings—do not treat that as comms health.

---

## 3. Webhooks and delivery status

- **SendGrid:** `POST /api/webhooks/sendgrid` — delivery/open/bounce events feed comms workbench and contact preferences when configured.
- **Twilio:** `POST /api/webhooks/twilio` — message status, opt-out keywords.

**Staging:** Use separate Twilio/ SendGrid test credentials; never point production webhooks to dev tunnels without a plan.

---

## 4. Public-facing expectations (voter copy)

After successful public form submit, the UI includes a **“What happens next”** blurb: coordinator follow-up on **business days** (24h goal when staffing allows), no guaranteed auto-reply. **Steve/counsel** may tighten wording; do not promise legal outcomes or ballot effects.

**Confirmation email/SMS (future):** When keys exist, optional transactional “we received your form” is a **separate** ticket; until then, the on-page blurb is the source of truth.

---

## 5. Campaign SLA (define with Steve)

| Item | Suggested default | Owner |
|------|-------------------|--------|
| First human touch | ≤ **24h** on business days for volunteer/general intake | Field director / volunteer coordinator |
| Urgent (press, security) | Same-day if flagged in `WorkflowIntake` title or thread | Comms |
| **Actual SLA** | [ ] Record here after Steve sign-off | |

---

## 6. Manual fallback (no keys, no automation)

1. **Morning / midday / evening:** open **`/admin/workbench`** and check **open work** and **`UnifiedOpenWorkSection`** counts for `WorkflowIntake`.  
2. Open **`/admin/inbox`** for threaded comms.  
3. **`/admin/review-queue`** is for *inbound content* (social/feed), not the same as form intake—do not conflate.  
4. Export: use existing Prisma admin paths or run **documented, least-privilege** SQL in staging (no PII in ticket paste).

**3× daily checklist (printable):**

- [ ] Workbench: any new `WorkflowIntake` in PENDING?  
- [ ] Inbox: unanswered threads?  
- [ ] SendGrid/Twilio dashboards (if live): bounces or opt-outs?

---

## 7. Day 4 exit criteria (this doc)

- [x] Every submission has a **documented** path to human review (workbench + intake metadata).  
- [x] Env **names** listed; no secrets.  
- [x] Degraded mode behavior documented (intake without outbound keys).  
- [x] Public success UI sets expectations.  
- [ ] **Steve:** confirm SLA table and public blurb.  
- [ ] **Staging:** one end-to-end POST smoke with DB up (log row in `KELLY_SOS_BUILD_LOG.md`).

---

*End KELLY-COMMS-1*
