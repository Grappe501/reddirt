# Guided report builder and assisted query system — Manual Pass 5C

**Lane:** `RedDirt/campaign-system-manual`  
**Purpose:** Design a **forgiving, safe** “ask for a report from anywhere in the **Workbench**” experience — so users are **never** stuck, but **never** get **sensitive** data they have not **earned** by **role** + **LQA** + `playbooks/ROLE_READINESS_MATRIX.md`.  
**Public / internal names (pick one in product, stay consistent):** **Guided Report Builder**, or **Workbench Report Assistant** (or **Field Report Assistant** for field-cohort surfacing). **Campaign Companion** can host **“Help me with a report”** without using “**AI**” as the product name.  
**Not:** A raw SQL console, a public **voter** row browser, or an **unlogged** **export** **pipe**.

**Refs:** `PROGRESSIVE_ONBOARDING_AND_UNLOCK_SYSTEM.md` · `USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md` · `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `playbooks/ROLE_KPI_INDEX.md` · `WORKBENCH_OPERATOR_RUNBOOK.md`

---

## 1. What the user experiences

From **any** staff dashboard (when built), the user can open **one** **consistent** entry: **“Guided report”** or **“Ask the Campaign Companion (report…”** — the panel offers:

- **Canned** answers for common questions.  
- **Step-by-step** filters the **role** is **allowed** to use.  
- A **save** (for trusted operators) to revisit weekly.  
- A **suggested next step** (e.g. “open a follow-up **task**”) that **does not** **auto-execute** **$**, **sends**, **exports**, or **GOTV** **cuts**.

**Product honesty:** A **“natural language** **front**-**end**” may exist **internally** as a query planner — the **user** still sees **Guided** **Campaign** **System** / **Assistant** **language**, not a consumer “**AI**” product label in public **copy**.

---

## 2. Report examples (plain English → allowed output)

| User asks (plain English) | What good looks like (non-PII) | Gating |
|----------------------------|--------------------------------|--------|
| “Show my overdue tasks” | List of `CampaignTask` (or work items) **assigned to me** with **age** | Level 1+ staff/vol (scope) |
| “Volunteer follow-ups older than 72 hours” | **Counts** and **tickets** **for** **volunteer**-layer programs — **not** full volunteer PII in a **public** view | V.C. / lead; **R2+** |
| “County activity this week” | **Aggregate** events, tasks, **OIS**-honest signals — **no** invented stats | County coord+ per MI |
| “Power of 5 teams that are stuck” | **P5** program metrics (definition in MI); **not** a shame leaderboard | P5 lead / field / CM |
| “Comms waiting on approval” | **MCE/NDE** **queues**; **defects** | Comms, NDE, CM |
| “Finance items needing treasurer confirmation” | **DRAFT** or **unconfirmed** rows — **T** is **LQA** | Treasurer, finance, CM |
| “Travel follow-up tasks” | **CampaignEvent**-linked tasks with **stale** **age**; **no** home addresses in public export | **Calendar**-travel, advance, CM |

**Never** as **canned** **one**-**click** for **untrained** **roles:** row-level **voter** name + address; **any** export file without **LQA** path.

---

## 3. Access rules (authoritative)

| Rule | Rationale |
|------|-----------|
| **User sees only what** their **role** + **readiness** allow | `ROLE_BASED_UNLOCK_LADDERS.md` + matrix |
| **No row-level** **voter** data unless **R3+** **steward** path (policy) | DPA, ethics |
| **No** **PII** in “casual” / **printable** **one**-**page** for untrusted tiers | PII in **chat** already forbidden; **reports** same |
| **Export** = **request** with **LQA** for **VFR**-class outputs | Logged + approver name |
| **Comms** / **$** in **body** of report = **MCE/NDE/T** as applicable | Not “because they asked the assistant” |
| **Strategy** / **sim** **“what** **if**” = **Preview** or **Proposed** only until **RACI** | `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` |

---

## 4. Report levels (maturity)

| Level | What it is | Who |
|-------|------------|-----|
| **1 — Canned** | “Overdue,” “this week,” “my queue” — fixed SQL / views, **vetted** by CM once | All **eligible** **roles** |
| **2 — Guided filters** | Date range, program, **county** (from allowed list) — no **arbitrary** free text to SQL | R2+ |
| **3 — Saved** **reports** | Personal or **shared** **team** **views** (with **audit** on share) | R3+ |
| **4 — Cross-system** | Join **tasks** + **events** + **intakes** (still **not** VFR) | CM, data with policy |
| **5 — Strategy** **impact** | Ties to **4B** levers, **readiness** bands, **LQA** **links** | CM, owner, analyst (read-leaning) — **not** a claim the **app** does **all** of this **today** |

---

## 5. Safety rails and audit

- **Every** **run** of a **level** **&gt;1** **report** may log: **user** **id,** **time,** **filter** **set,** **row** **count,** **no** **voter** **payload** in **logs** by default.  
- **Anomaly** **flags:** export **row** count **&gt;** **threshold,** or **repeated** **drill**-**downs** to **sensitive** **views** = **steward** **alert** (not public accusation).  
- **Data** **minimization:** default to **count** and **id** of **tickets,** not **full** **contact** **records**.  
- **Rural** **/ **low**-**bandwidth** **users:** **PDF**-light or **in**-**app** **only**; **no** “always download **full** list.”

---

## 6. Suggested tasks — **never** **auto-execute** **sensitive** **work**

The **Guided** **Report** **Assistant** may offer:

- “**Create** a **draft** `CampaignTask` to **follow** **up** on **X**” with **pre-filled** **title** and **RACI** **slots** **empty** until **user** **confirms**.  
- It **may not** **one**-**click:** send **comms,** **confirm** **$**, **export** **VFR,** or **set** **GOTV** **/ **targeting** **in** **production** **—** that **stays** **LQA** **+** **human** **confirm** per `playbooks/APPROVAL_AUTHORITY_MATRIX.md`.

**Cross-ref:** `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` — **Preview** is **not** **execution**.

---

**Last updated:** 2026-04-28 (Pass 5C)
