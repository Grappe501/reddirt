# Email “Today” — RedDirt assessment (Kelly Grappe for SOS)

**Active lane:** `RedDirt/` only.  
**Assessment date:** 2026-05-09.  
**Purpose:** Bug-fix, integration clarity, UX reduction for the existing Email Command Center (no parallel email OS, no Stand Up Arkansas identity).

---

## Existing email scripts (`package.json`)

| Script | Role |
|--------|------|
| `npm run email:db:diagnose` | Safe DB + env group report (names only for secrets). |
| `npm run email:command-center:preflight` | Env + schema signals for ECC + Gmail. |
| `npm run email:contact-import:gate` | `prisma migrate deploy` + preflight + `npm run check`. |
| `npm run email:no-send-scan` | Heuristic ECC vs integration send API scan. |
| `npm run email:sendgrid:event-parse-check` | SendGrid event → suppression mapping unit check. |
| `npm run email:gmail:preflight` | Alias of command-center preflight. |
| `npm run email:gmail:pubsub-parse-check` | Pub/Sub notify JSON parse check. |
| `npm run email:gmail:watch-renewal-preview` | TS renewal preview. |
| `npm run gmail:watch:renewal-check` | Renewal CLI (dry-run default). |
| `npm run email:command-center:migrate-and-check` | `migrate deploy` + `npm run check`. |

---

## Prisma models (email / comms surface)

Verified in `prisma/schema.prisma` (non-exhaustive): `ContactPreference`, `StaffGmailAccount`, `CommunicationCampaign`, `CommunicationCampaignRecipient`, `EmailContactProfile`, `EmailContactProfileFact`, `EmailAudienceDefinition`, `EmailAudiencePreviewRun`, `EmailContactImportBatch`, `EmailContactImportRow`, `EmailContactImportDecision`, `MessageStudioDraft`, `SendGridContactSyncRun`, `EmailSendExecution`, `EmailSendApproval` / `EmailSendRecipient`, `SendGridEvent`, `SendGridSuppression`, `EmailWorkflowItem`, plus related enum/status fields.

---

## UI surfaces

| Path | Role |
|------|------|
| `/admin/workbench/email-command-center` | **Home + “Today” cockpit** (new default strip) + **Advanced** disclosure with full legacy dashboard. |
| `/admin/workbench/email-command-center/imports` | CSV upload + batch lifecycle (validate / approve / commit). |
| `/admin/workbench/email-command-center/audiences` | Audience Studio + preview (`#audience-preview`). |
| `/admin/workbench/email-command-center/message-studio` | Drafts + shared server drafts. |
| `/admin/workbench/email-command-center/send-execution` | Governance + **`#ops` governed SendGrid console**. |
| `/admin/workbench/email-command-center/gmail` | Monitor, sync, watch. |
| `/admin/workbench/email-command-center/gmail/review` | Inbound metadata → queue bridge. |
| `/admin/workbench/email-queue` | Triage (`?sourceType=INBOUND_EMAIL` supported). |

**Components:** `src/components/admin/email-command-center/*` including new `EmailCommandCenterTodayView.tsx`.

**Libs:** `src/lib/email-command-center/*`, `src/lib/email-workflow/governance.ts` (`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` must stay `false` for queue), `src/lib/sendgrid/*`, `src/lib/integrations/gmail`, `src/lib/integrations/sendgrid`, `src/app/api/sendgrid/*`.

---

## Flows (as implemented)

1. **Contact import:** `uploadEmailContactImportCsvAction` → staging rows → validate → approve → commit to `EmailContactProfile` + facts (`email-contact-import-actions.ts` + `contact-import.ts`). No send from this lane.
2. **Audience / segment:** Definitions + preview over approved facts; sync runs via `SendGridContactSyncRun` where used in send execution preflight.
3. **Message draft:** Message Studio + server `MessageStudioDraft` (shared drafts); send execution binds a draft to audience + optional sync run.
4. **SendGrid contact sync:** Preview / approve / execute path in sendgrid foundation + contact sync modules (no-send from workflow UI except explicit ops).
5. **Send execution:** `createSendExecutionDraft` → preflight → test send (`READY_FOR_TEST`) → `TEST_SENT` → final approval → `FINAL_APPROVED` → typed phrase → `sendSendGridBroadcastEmail` (batched, not BCC-all). Production gated by `operatorGate.governedSendExecutionDbReady`.
6. **Gmail receive/sync:** OAuth `StaffGmailAccount`, metadata sync, watch + Pub/Sub scaffold; inbox/review → `EmailWorkflowItem` with `INBOUND_EMAIL` as appropriate.

---

## Diagnostics run (2026-05-09, operator machine; paths only)

| Command | Result | Notes |
|---------|--------|--------|
| `npm run email:db:diagnose` | Partial | TCP/auth OK; `_prisma_migrations` / ECC migrations not applied on connected DB; many pending migrations listed. |
| `npm run email:command-center:preflight` | **FAIL** | `StaffGmailAccount.gmailSyncState` missing — expects `prisma migrate deploy`. |
| `npm run email:no-send-scan` | **WARN** | ECC clean; integration paths (`comms-workbench`, diagnostics routes, integrations) show expected baseline hits. |
| `npm run email:sendgrid:event-parse-check` | **OK** | Parse/suppression mapping verified. |
| `npm run email:gmail:pubsub-parse-check` | **OK** | |
| `npm run gmail:watch:renewal-check` | **OK** (exit 0 after code fix) | Previously crashed when `StaffGmailAccount` table missing; now degrades to zeros. Prisma may still log driver errors to stderr before catch. |

**Full build:** `npm run typecheck` — OK. `npm run build` — OK (exit 0).

---

## Bugs / blockers found

| Issue | Type | Mitigation |
|-------|------|------------|
| Hosted Supabase DB without Prisma migrations | **Env / DB** | Operator runs `npx prisma migrate deploy` on the canonical `DATABASE_URL` (not done in this session per destructive DB rules). |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` absent | **Env** | SSR auth client incomplete; separate from Prisma. |
| `GOOGLE_GMAIL_REDIRECT_URI` / `NEXT_PUBLIC_SITE_URL`, `GMAIL_TOKEN_ENCRYPTION_KEY`, `GOOGLE_PUBSUB_TOPIC`, Pub/Sub verification token | **Env** | Preflight lists gaps; Gmail push + token encryption need operator config. |
| ECC migration query threw when `_prisma_migrations` missing | **Code** | `queryEmailCommandCenterMigrationRows` + script mirror now return “not applied” instead of throwing. |
| `gmail:watch:renewal-check` crashed with no `StaffGmailAccount` table | **Code** | Try/catch in `listGmailWatchRenewalCandidates` + `getGmailHistoryProcessingSummary` for missing table / P2021-style failures. |
| Production send gate tied only to `localContactImportDbVerified` | **Product** | **Send execution** now uses **`governedSendExecutionDbReady`** (ECC migrations + send-execution DB slice), aligning the no-send scan (ECC surfaces) with the explicit **#ops** lane. |

---

## Code / docs changes (this session)

- `src/lib/email-command-center/audience-list-health.ts` — **new** profile/audience health counts.
- `src/lib/email-command-center/contact-import.ts` — staging + invalid/duplicate + committed import row counts.
- `src/lib/email-command-center/read-model.ts` — snapshot: inbound email count, `audienceListHealth`, extended `contactImport`, `operatorGate.governedSendExecutionDbReady`, parallel fetches, migration query behavior.
- `src/lib/email-command-center/ecc-migration-gate.ts` — safe migration query.
- `scripts/lib/email-command-center-migrations.mjs` — same for CLI diagnose.
- `src/components/admin/email-command-center/EmailCommandCenterTodayView.tsx` — **new** five-step cockpit.
- `src/components/admin/email-command-center/EmailCommandCenterContent.tsx` — Today first; legacy in `<details>`.
- `src/components/admin/email-command-center/AudienceStudioPreviewForm.tsx` — `#audience-preview` anchor.
- `src/app/admin/email-send-execution-actions.ts` — production gate → `governedSendExecutionDbReady`.
- `src/components/admin/email-command-center/SendExecutionOperationsPanel.tsx` + **Readiness** — messaging + test gate aligned.
- `src/lib/gmail/watch-renewal.ts`, `src/lib/email-command-center/gmail-production-watch.ts` — graceful degradation when staff Gmail table absent.

---

## WorkflowIntake vs `/api/forms`

`POST /api/forms` is the structured intake route (`src/app/api/forms/route.ts`). This email assessment did **not** re-verify end-to-end creation of a `WorkflowIntake` record from every form type; treat as **operator QA** after migrations are green.

---

## Operator / Kelly steps (after DB migrations + env)

1. **Import contacts:** `/admin/workbench/email-command-center/imports` — upload CSV → validate → approve → commit.  
2. **Approve / build audience:** Profiles/facts as needed → Audience Studio → active definition (+ contact sync if your send packet requires `SYNCED` run).  
3. **Draft email:** Message Studio → shared draft to **APPROVED_FOR_SEND_GOVERNANCE** with send packet as required by preflight.  
4. **Send test:** `/admin/workbench/email-command-center/send-execution#ops` — create execution → preflight → **test** to one operator address.  
5. **Preflight:** Fix any failed checks (suppress ASM, audience, sync, consent).  
6. **Send first batch:** Final approvals + exact confirmation phrase → governed broadcast (provider batches up to 900 recipients per HTTP request).  
7. **Monitor replies/events:** Gmail review + queue (`INBOUND_EMAIL`); Analytics / SendGrid events webhook.

**Primary route today:** `/admin/workbench/email-command-center`.

---

## Remaining operator actions

- Run **`npx prisma migrate deploy`** on the **canonical** Kelly Grappe Supabase Postgres (confirm project ref with Steve).  
- Complete **Gmail** env: redirect URL / site URL, token encryption key, Pub/Sub topic + verification.  
- Optional: **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY** if SSR auth refresh should be active.  

---

## Days 4–7 compression

**Not safe** until: migrations applied on production DB, contact import + send execution preflight green on that same `DATABASE_URL`, and Gmail/ SendGrid env complete for receive + send. Use `npm run email:contact-import:gate` as the heavy gate after migrate.
