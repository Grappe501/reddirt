# RedDirt Email Distribution Operator Runbook

This document is for **Steve and operators**, not developers. It describes what the Email Command Center can do, what it refuses to do, and the exact governed path to a SendGrid broadcast.

---

## 1. What this system can do

- Build and preview **email audiences** from the approved profile graph (Audience Studio).
- Mark an audience **ACTIVE** when criteria are valid, the preview matches at least one profile, and at least one matched profile has a usable **primary email**. ACTIVE does **not** mean sent.
- Run **SendGrid contact sync** for ACTIVE audiences (governed preview/approval; Marketing Contacts upsert only where the product allows — still not an email send).
- Draft and review messages in **Message Studio**, including governance status **APPROVED_FOR_SEND_GOVERNANCE** and send packet / checklists.
- Run **Send Execution**: preflight, test send, final approvals, typed confirmation, then provider broadcast with **ASM / unsubscribe group** enforcement.
- Track **local suppressions** from SendGrid webhooks and keep suppression doctrine in preflight.

---

## 2. What this system will not do

- **Queue-item email send** stays **off**. `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` remains **false**. Do not ask anyone to flip it in normal operations.
- No **SMS / Twilio** campaign sends from this lane.
- No **background workers** that auto-send or auto-approve.
- No bypass of **SendGrid suppressions**, **ASM/unsubscribe group** requirements, or **Send Execution preflight**.
- No **AI auto-writer / auto-sender** — AI is advisory; humans approve.

---

## 3. The governed broadcast path

End-to-end, a real broadcast follows this chain:

1. **ACTIVE** `EmailAudienceDefinition` (criteria validated in Audience Studio).
2. **SendGridContactSyncRun** in **SYNCED** status for that audience (contact list aligned for the cohort — still not “sent”).
3. **Message Studio** shared draft in **APPROVED_FOR_SEND_GOVERNANCE** with send packet / checklists completed.
4. **Send Execution** — run **preflight**; fix every red check.
5. **Test send** — small, explicit recipient; still governed.
6. **Final approval** chain and typed confirmation phrase (**exactly** `SEND APPROVED` as implemented in Send Execution).
7. Provider **broadcast** with **SENDGRID_UNSUBSCRIBE_GROUP_ID** (ASM) as required by env readiness.

Until step 7 completes successfully, **no broadcast** has gone out.

---

## 4. Volunteer campaign path

Volunteer outreach uses the **same** governed broadcast path as any other email. There is no separate “volunteer send” API.

- Prefer audiences whose criteria include `workflowSourceType` = **`VOLUNTEER_TRIGGER`** (or clearly named volunteer audiences in Audience Studio).
- Use the **Email Launch Room** and **Audience Studio** volunteer panel to see what is missing (activate, sync, message, execution).

---

## 5. Audience activation

- **DRAFT** audiences can be previewed and **activated** only when:
  - Criteria parse and preview returns **≥ 1** matching profile, and
  - At least one matched profile has a **usable primary email**.
- Activation may show **suppression hints** (sampled) — **zero suppressions are not required** for activation, but Send Execution preflight remains authoritative.
- **Import consent / hosted DB proof** gates are enforced later on the Send Execution path — activation does not replace them.

Remember: **ACTIVE ≠ sent**. ACTIVE only means “eligible for sync and Send Execution assembly.”

---

## 6. SendGrid contact sync

- Open **SendGrid Foundation** from the Email Command Center / Launch Room links.
- Complete preview and approval steps per product copy on that surface.
- You need a **SYNCED** run for the audience you will mail before relying on Send Execution for that cohort.

**SYNCED ≠ sent.** It means contacts are prepared on the provider side under governance; broadcast still requires Send Execution approvals.

---

## 7. Message Studio approval

- Drafts move through review states until **APPROVED_FOR_SEND_GOVERNANCE**.
- Complete **send packet** and checklist JSON as required — preflight reads this posture.

**APPROVED_FOR_SEND_GOVERNANCE ≠ sent.**

---

## 8. Send Execution preflight

- Preflight is **mandatory** before test or broadcast.
- It checks audience, sync, message, env, suppressions, ASM, and other gates. Treat preflight as the **single honest answer** for “can we proceed?”

---

## 9. Test send

- Use only the governed **test send** path in Send Execution (#ops).
- Confirm content and recipient handling before requesting final approval.

---

## 10. Final approval and SEND APPROVED

- Final human approvals must complete.
- The operator must type the exact confirmation phrase required by the UI (**`SEND APPROVED`** in the current product).

Only after that, and only through Send Execution’s governed provider call, does a **broadcast** go out.

---

## 11. Suppression / unsubscribe behavior

- Local **SendGridSuppression** rows and webhook-fed events inform risk.
- **ASM / unsubscribe group** is required for broadcast readiness (`SENDGRID_UNSUBSCRIBE_GROUP_ID`).
- Never attempt to “work around” suppressions or unsubscribes — that is a compliance and deliverability failure, not a shortcut.

---

## 12. Production hosted DB proof

- Production sends and imports depend on the **correct** database and migration posture.
- Use the **Readiness** and **hosted DB proof** assistant flows documented in-repo; run the same CLI checks on the **live** `DATABASE_URL` before trusting production.

---

## 13. Required environment variable names (no values)

Never paste secrets into tickets, chat, or screenshots.

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_FROM_NAME`
- `SENDGRID_UNSUBSCRIBE_GROUP_ID`

Also configure webhook verification keys per SendGrid foundation docs (names only in UI).

---

## 14. Common blockers and fixes

| Symptom | Likely cause | What to do |
|--------|--------------|------------|
| Cannot activate audience | Zero matches or no primary email | Fix criteria / approve facts / ensure profiles have email |
| Send Execution says audience not ACTIVE | Definition still DRAFT | Activate in Audience Studio |
| Preflight fails sync | No SYNCED run | Complete SendGrid contact sync for that audience |
| Preflight fails message | Draft not governance-approved | Finish Message Studio + send packet |
| Broadcast env not green | Missing ASM or from identity | Set missing env vars (names above); verify SendGrid dashboard |
| Suppression overlap high | Normal for mixed lists | Review suppressions table and criteria; preflight decides |

---

## 15. Emergency stop / do-not-send posture

- If anything looks wrong: **stop** — do not type `SEND APPROVED`.
- Archive or cancel the Send Execution per existing product flows.
- Fix data and re-run **preflight** from a clean posture.
- **Queue-item send** remains disabled — do not enable `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` as a panic lever; it is not part of the broadcast design.

---

**Bottom line:** Only **Send Execution** after full governance and **`SEND APPROVED`** sends the broadcast. Everything before that is preparation.
