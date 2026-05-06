# Email Command Center — First-Run Operator Checklist

**Packet:** **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0** · **KELLY-GRAPPE-APP-DB-GATE-1.0** · **KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0** (hosted Kelly-Grappe-App verification reminder)  
**Lane:** `RedDirt/` only  
**Purpose:** **21-step** first pass on a machine you treat as **production posture** for Email Command Center (not demo mode). **No secrets** in this doc.

**Companion:** [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) · [`email-dashboard-operator-runbook.md`](./email-dashboard-operator-runbook.md) · [`email-command-center-operator-smoke-test.md`](./email-command-center-operator-smoke-test.md)

---

## Before you start

- Know whether this host uses **local Docker Postgres** or **hosted** DB URLs. **`Kelly-Grappe-App`** (canonical Supabase) is **not** verified until **`npm run email:db:diagnose`** shows **hosted** Supabase hostnames **and** the full gate chain passes on **those** URLs — see [`email-command-center-contact-import-readiness.md`](./email-command-center-contact-import-readiness.md).  
- Do **not** paste tokens, API keys, or webhook secrets into tickets or screenshots.  
- **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** is **`false`** — queue **APPROVED** is **not** provider send approval.

---

## Checklist (21 steps)

1. **Start local DB** (if using local Docker Postgres) — e.g. `npm run dev:db` or team stack script; wait until DB accepts connections.  
2. **Run** `npm run email:contact-import:gate` **locally** when validating this repo + migrations + ECC preflight against **this** `DATABASE_URL` (stops on failure — do not bypass on production hosts).  
3. **Open Daily Operator Console** — `/admin/workbench/email-command-center/daily` — confirm **no-send** / **operator-complete** badges and priority cards.  
4. **Open Readiness** — `/admin/workbench/email-command-center/readiness` — capture **ready / partial / blocked** rows for this environment.  
5. **Open Gmail Monitor** — `/admin/workbench/email-command-center/gmail` — connection, sync, watch posture; **metadata-only** expectations.  
6. **Open Gmail Review** — `/admin/workbench/email-command-center/gmail/review` — confirm **manual** queue create path (no auto-queue).  
7. **Open Queue** — `/admin/workbench/email-queue` — list filters and triage posture.  
8. **Open Profile Review** — `/admin/workbench/email-command-center/profiles` — suggestions / approve path when DB populated.  
9. **Open Audience Studio** — `/admin/workbench/email-command-center/audiences` — definitions + previews (**no** SendGrid sync).  
10. **Open Contact Imports** — `/admin/workbench/email-command-center/imports` — staging list; **do not** treat commit as production-safe until **hosted** canonical DB verified (see launch hardening **stop conditions**).  
11. **Open Message Studio** — `/admin/workbench/email-command-center/message-studio` — confirm **local** drafts + **`#shared-drafts`** panel (Postgres — requires migration **`20260508120000_message_studio_server_drafts`** applied on this `DATABASE_URL`).  
12. **Create a local draft** — title + minimal body; confirm autosave / library; optional **Save current local draft to shared drafts** then confirm row appears (**no** send).  
13. **Apply a production template** — filter, preview, apply with safe mode (fill empty / append / confirmed replace).  
14. **Use Campaign Voice** — frames / source layers; optional **Generate** only if **`OPENAI_API_KEY`** is set server-side — advisory output only.  
15. **Complete Editorial Review** — status, owner, claim/source + compliance checklists; note advisory readiness tier.  
16. **Build Send Packet** — `#send-packet-builder`: completeness + checklists; copy or export JSON/txt; optional snapshot to draft.  
17. **Open Send Execution Governance** — `/admin/workbench/email-command-center/send-execution` — **doctrine only**; confirm **Send packet prepared** and **Shared draft saved / reviewed** rows if present.  
18. **Confirm no send buttons exist** on ECC routes above (no broadcast, no Gmail send-from-queue, no queue dispatch).  
19. **Open Analytics** — `/admin/workbench/email-command-center/analytics` — read-only readiness.  
20. **Open Automation** — `/admin/workbench/email-command-center/automation` — **no** activation controls.  
21. **Run** `npm run check` **from `RedDirt/`** — lint + typecheck + build; fix or hand off if this step fails before declaring the machine “green.”

---

## If something fails

- **DB unreachable** → Readiness + `npm run email:db:diagnose` (operator).  
- **Gmail empty** → OAuth from documented connect path.  
- **Imports** → pause commit until hosted Kelly-Grappe / Supabase gate passes per [`email-command-center-contact-import-readiness.md`](./email-command-center-contact-import-readiness.md).

---

*Last updated: **KELLY-GRAPPE-APP-HOSTED-DB-GATE-1.0** + launch hardening (Kelly-Grappe-App hosted gate still open — point Prisma at hosted Supabase before claiming import readiness).*
