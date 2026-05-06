# Email Command Center — First-Run Operator Checklist

**Packet:** **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0**  
**Lane:** `RedDirt/` only  
**Purpose:** Ordered **first shift** pass for a human operator touching the Email Command Center in **production posture** (not demo mode). **No secrets** in this doc — use env **names** only where needed.

**Companion:** [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) · [`email-dashboard-operator-runbook.md`](./email-dashboard-operator-runbook.md) · [`email-command-center-operator-smoke-test.md`](./email-command-center-operator-smoke-test.md)

---

## Before you start

- Confirm you are on the **intended** environment (local Docker vs hosted).  
- Do **not** paste tokens, API keys, or webhook secrets into tickets or screenshots.  
- Remember: **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** is **false** — queue **APPROVED** is **not** provider send approval.

---

## Checklist (ordered)

1. **Start local DB** (if using local Docker Postgres) — e.g. `npm run dev:db` or your team’s stack script; wait until DB accepts connections.  
2. **Run contact-import gate locally** (when validating this machine against migrations + ECC preflight):  
   `npm run email:contact-import:gate`  
   — Stops if migrations or preflight fail; **do not** bypass on production hosts.  
3. **Open Daily Operator Console** — `/admin/workbench/email-command-center/daily` — confirm **no-send** badges and priority cards.  
4. **Open Readiness** — `/admin/workbench/email-command-center/readiness` — note **ready / partial / blocked** rows for this DB.  
5. **Check Gmail env** — `/admin/workbench/email-command-center/gmail` — OAuth/monitor: confirm **metadata-only** posture; no “send all” actions.  
6. **Check SendGrid foundation** — `/admin/workbench/email-command-center/sendgrid` — env **names** only in UI copy; events/suppressions when DB healthy.  
7. **Open imports** — `/admin/workbench/email-command-center/imports` — staging **only**; treat commit as **governed** until hosted canonical DB verified.  
8. **Open Message Studio** — `/admin/workbench/email-command-center/message-studio` — confirm **browser-local** drafts (not shared across staff).  
9. **Create a local draft** — New draft, title, minimal body; confirm autosave / library.  
10. **Apply a production template** (optional) — filter, preview, apply with safe mode (fill empty / append / confirmed replace).  
11. **Run Campaign Voice AI** (optional) — only if server **`OPENAI_API_KEY`** is configured; treat output as **advisory**.  
12. **Complete Editorial Review** — status, owner, claim/source + compliance checklists; note advisory readiness tier.  
13. **Build / export Send Packet** (if panel present) — `#send-packet-builder`: completeness + checklists; copy or export JSON/txt; optional snapshot to draft.  
14. **Open Send Execution Governance** — `/admin/workbench/email-command-center/send-execution` — read **doctrine only**; verify **Send packet prepared** row if applicable.  
15. **Confirm no send surfaces** — no SendGrid broadcast, no Gmail send-from-queue, no mass mail, no automation activation on these routes.

---

## If something fails

- **DB unreachable** → Readiness + `npm run email:db:diagnose` (operator); fix `DATABASE_URL` / network — not an ECC “feature bug.”  
- **Gmail empty** → Connect OAuth from documented path; still **no** auto body fetch from ECC.  
- **Imports commit scary** → Stop; verify **canonical hosted** DB per [`email-command-center-contact-import-readiness.md`](./email-command-center-contact-import-readiness.md) (if present in repo).

---

*Last updated: **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0**.*
