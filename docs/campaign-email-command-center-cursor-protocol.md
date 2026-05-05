# Campaign Email Command Center — Cursor ↔ ChatGPT Protocol

**Packet:** **REDDIRT-EMAIL-OS-MASTERPLAN-1.0**  
**Purpose:** Email-lane **collaboration protocol** for **Steve → ChatGPT → Cursor** triad. Complements **THREAD-HANDOFF-1 §0** (general build loop) with **Comms / Email OS** specifics.

**Related:** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) · [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) · [`campaign-email-command-center-master-plan.md`](./campaign-email-command-center-master-plan.md) · **[`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)**

**Coordinating surface (implemented):** **`/admin/workbench/email-command-center`** — Email Command Center **shell**: aggregates queue read models and integration **readiness** (env names / presence only); individual triage stays on **`/admin/workbench/email-queue`**; deep links include **`/email-command-center/profiles`** (profile graph), **`/email-command-center/audiences`** (**EMAIL-AUDIENCE-STUDIO-1.0** — preview only), and **`/admin/workbench/email-command-center/sendgrid`** (**EMAIL-SENDGRID-FOUNDATION-1.0** — readiness + webhook intake rails, **no** mass send / **no** auto list sync). Future **EMAIL-*** packets should update this cockpit as capabilities ship.

---

## 1. Roles

| Role | Responsibility |
|------|----------------|
| **Steve** | **Vision owner** and **direction approver** — **not** an architecture bottleneck for details discoverable from repo + handoff docs. |
| **ChatGPT** | **Build architect** and **packet writer** — scopes Cursor scripts, acceptance criteria, explicit **out of scope**, sequencing across EMAIL-* packets. |
| **Cursor** | **Implementation + audit partner** — reads `prisma/schema.prisma` and real paths, implements **scoped** packets, returns **structured** reports. |

**Courier:** Steve pastes ChatGPT’s script into Cursor and Cursor’s return back to ChatGPT — **single chain of record**.

---

## 2. Cursor behavior

1. **Respond to ChatGPT’s packet structure** — sections, acceptance criteria, and **out of scope** as written; if the repo **contradicts** the script, **say so explicitly** with file evidence.  
2. **Do not widen scope silently** — new files, migrations, or integrations require the **current** script to authorize them **or** a documented **blocker** with proposed follow-up packet name.  
3. **Do not ask Steve** to design what can be **inferred** from repo facts + [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) + [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) + this Email OS blueprint set. **Do** ask Steve when blocked by: secrets, **production** credentials, counsel/treasurer **decisions**, inaccessible **hard** repo facts, or **legal/compliance** ambiguity that **docs cannot** resolve safely.  
4. **Propose stronger alternatives** when discovered (e.g., reuse `CommunicationRecipient` instead of parallel tables) — **in the return**, not by stealth refactor.  
5. **Preserve implementation autonomy** inside the packet — naming, module layout, small refactors **only** when required to ship the scope cleanly.  
6. **Queue/governance-first doctrine** is **invariant** unless Steve + blueprint explicitly amend it.

---

## 3. ChatGPT behavior

- Every script names: **target division**, **dependencies**, **packets touched**, **migrations allowed or forbidden**, **secrets policy**.  
- After Cursor returns: reconcile **ledger + registry** maturity; **do not** mark L4/L5 automation “done” without code proof.  
- Write the **next** EMAIL-* packet using the **roadmap** in [`campaign-email-command-center-master-plan.md`](./campaign-email-command-center-master-plan.md).

---

## 4. Hard stops (Cursor must stop and report)

| Stop | Action |
|------|--------|
| **Secrets** | Do not paste, store, or request values; use placeholders in docs. |
| **OAuth client secrets / production API keys** | Human provisioning only; never commit. |
| **Migrations** | **Forbidden** unless the **current** script **explicitly** assigns migration work (this master plan packet does **not**). |
| **Live sends** | No real email/SMS/call campaigns from agent work. |
| **Real PII in tests** | Fake fixtures only (`@example.com`, synthetic names). |
| **Legal/compliance claims** | Document “requires counsel” — **no** invented regulatory assertions. |
| **Destructive git / folder moves / deletes** | Forbidden unless Steve explicitly orders (contrary to baseline Kelly SOS rules). |

---

## 4.1 Email Command Center progress ledger (primary bar)

**Until the Email Command Center is complete**, every **Comms / Email OS** Cursor return must include the **EMAIL COMMAND CENTER PROGRESS LEDGER** block (see [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)) with **all 15 layers + Overall** filled. This ledger is the **primary** email program progress measurement for Cursor returns.

Full-campaign / multi-division bargraph updates may appear **after** this block and are **secondary** only.

**Database / migration honesty:** `npm run check` **does not** run `prisma migrate deploy`. Do **not** claim migrations applied unless `npx prisma migrate deploy` (or host build pipeline) actually succeeded. Prefer `npx prisma migrate deploy && npm run check` (see **`npm run email:command-center:migrate-and-check`**) and **`npm run email:command-center:preflight`** before certifying Gmail persistence.

---

## 4.1a Email packet return — required sections

Every **Comms / Email OS** Cursor return must include (in addition to PROTO-2 fields when applicable):

| Section | Content |
|---------|---------|
| **EMAIL OS PROGRESS** | What advanced toward Command Center vs triage-only state; blueprint vs code. |
| **INTEGRATION READINESS** | Gmail / SendGrid / OpenAI — **configured?** **stubbed?** **blocked?** (no secret values). |
| **AUTOMATION READINESS** | Highest **safe** tier (see automation map); what gates exist in code. |
| **GOVERNANCE STATUS** | Queue-first intact? Any new send path? **Suppression** posture if touches sends. |
| **NEXT BEST PACKET** | One recommended **`EMAIL-*`** packet from the master plan roadmap. |

---

## 5. Maturity honesty

A **docs-only** blueprint packet **does not** raise **Comms / Email** to **L4**. **L3 design-forward** means: strong **spec** + existing **triage** UI; **automation** and **integrations** remain **staged** until implementation packets ship.

---

*Design only — REDDIRT-EMAIL-OS-MASTERPLAN-1.0.*
