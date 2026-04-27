# Progressive onboarding and unlock system — Manual Pass 5C

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** UX / operations doctrine (markdown only — not a shipped product)  
**Public vocabulary:** **Campaign Companion**, **Guided Campaign System**, **Pathway Guide**, **Workbench Guide**, **guided help**, **Field Guide** (documentation), **assistant** (in-product help surfaces). **Do not** use “**AI**” as public product language.  
**Refs:** `WORKBENCH_OPERATOR_RUNBOOK.md` · `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` · `playbooks/ROLE_READINESS_MATRIX.md` · `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `playbooks/TRAINING_MODULE_INDEX.md` · `ROLE_BASED_UNLOCK_LADDERS.md`

---

## 1. Core philosophy

The Campaign Operating System should feel like a **serious game you learn in layers**: not overwhelming on day one, but **endlessly deep** for people who want to lead.

| Stage | What it means in practice |
|--------|---------------------------|
| **Beginner** | Orientation, values, and **one** safe, visible next action. No voter rows, no money, no external publish. |
| **Apprentice** | Repeating tasks with coaching; limited cards on the “starter deck.” |
| **Operator** | Owns a slice of the queue (tasks/intakes) with WIP limits; can run canned reports. |
| **Lead** | Approves a defined subset, delegates, runs weekly rhythm with CM alignment. |
| **Strategist** | Cohort trainer, multi-channel coordination, or owner-adjacent scenario work — still bounded by LQA, never “the model decided.” |

**Product honesty:** Per `SYSTEM_READINESS_REPORT.md`, **not** every role dashboard, guided surface, or LMS feature is **built** or **at parity**; this document defines the **intended** experience so engineering can converge.

---

## 2. The “starter deck”

A **starter deck** is the **smallest** set of **actions, cards, and permissions** a role is offered **on first useful login** — enough to **do real work** without **seeing** every admin tool.

| Principle | Rule |
|-------------|------|
| **Safe first** | First actions are low-PII, non-monetary, and **reversible** or **human-reviewable** where mistakes hurt. |
| **One primary next action** | The home view highlights **one** “do this next” — not a wall of options. |
| **Explain the lock** | If something is **hidden** or **locked**, the UI (or field guide) says **why** and **how to unlock** (training id, approver, time gate). |
| **No secret powers** | There is no “surprise” admin route for sensitive work; **strategic** and **sensitive** paths stay behind **LQA** per `playbooks/APPROVAL_AUTHORITY_MATRIX.md`. |

---

## 3. What a new user sees on day one

- A **short welcome** tied to **M-001** (values) in `playbooks/TRAINING_MODULE_INDEX.md` when training exists; otherwise a **3-bullet** “how we work” card.  
- A **Pathway** or program label (e.g. Power of 5, county helper) and **one** task or invitation — not the full open-work firehose.  
- **Plain-language** labels for any queue items (`WorkflowIntake`, `CampaignTask` concepts), not internal jargon in titles.  
- **Workbench** (for staff): first view may be **“assigned to you”** only, with **age** and **P0** explained in one line — not every queue type (see `WORKBENCH_OPERATOR_RUNBOOK.md`).

---

## 4. How complexity unlocks over time

**Unlocks** are **staged** — never “everything at once” for a new account.

1. **Orientation** (Level 0): read-only or practice; **no** sensitive exports.  
2. **First proof** (Level 1): one completed real task in scope with **no** **compliance** **defects** (e.g. PII in chat, wrong approver) where applicable.  
3. **Repeatable contribution** (Level 2): several cycles; optional **checklist** or **quiz** for channel-specific work (MCE/NDE concepts in training).  
4. **Trust** (Level 3+): lead sign-off, **time in role** minimums, or **shadowing** for staff-adjacent roles.  
5. **Delegation** (Level 4–5): **strategist** / trainer path — new **Pathway** modules, not automatic **RACI** bypass.

`ROLE_BASED_UNLOCK_LADDERS.md` details **per-role** levels.

---

## 5. Unlock types (product design targets)

| Type | Examples | Notes |
|------|------------|--------|
| **New dashboard cards** | “My follow-ups,” “County this week” | Cards **default hidden** until **readiness** or **role** matches. |
| **New reports** | Canned: overdue tasks, 72h follow-up gaps | `GUIDED_REPORT_BUILDER_AND_ASSISTED_QUERY_SYSTEM.md` |
| **New tasks** | TT-xx templates visible in “pick up” | Must match **LQA** for sensitive TT classes. |
| **New role permissions** | Approve a template; assign within county | `ROLE_READINESS_MATRIX.md` + owner policy. |
| **New map / detail views** | County OIS deep panels | No **row-level voter** in volunteer views. |
| **New Workbench queues** | NDE, finance-adjacent, strategy change | **Staff**-only; often **R2+** in matrix. |
| **New strategy / simulation previews** | **Preview** mode only for learners | `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` — **no** **auto**-**execution**. |
| **New export / request abilities** | Export **request** queue (not raw download for untrusted users) | **Always** through **LQA** where applicable. |

---

## 6. Proof-of-understanding gates (use any combination; Steve sets weight in MI §40)

| Gate | When to use |
|------|----------------|
| **Training completed** | M-xxx from `TRAINING_MODULE_INDEX.md` (e.g. M-003 before field). |
| **Task completed** | Evidence + closeout; no ghost closes (Workbench runbook). |
| **No compliance defects** | Rolling window; serious defect **pauses** unlock progression (not public shaming). |
| **Lead / CM / owner approval** | Break-glass, new permissions, or role elevation. |
| **Time in role** | e.g. 14 days active before NDE ship queue — **policy**, not a scoreboard. |
| **Quiz / checklist** | Short attestation; **not** a substitute for LQA on money/comms. |
| **Shadowing completed** | Observe a trained operator before queue ownership. |

---

## 7. “Never unlock automatically” (no silent promotion)

The following require **human** **LQA** / **RACI** and **are not** **granted** by time alone, streaks, or “level ups” **without** **explicit** **approval** **records**:

| Surface | Why |
|--------|-----|
| **Voter-file exports** | DPA, audit, legal — `APPROVAL_AUTHORITY_MATRIX` + steward path. |
| **Row-level voter data in UI** | Training + **named** access; not for casual volunteer tiers. |
| **Finance approval** (confirm **CONFIRMED** outflows) | Treasurer (T) and thresholds. |
| **Public comms approval** | MCE/NDE/counsel path as policy. |
| **Targeting / GOTV / paid audience controls** | **Lowest**-qualified approver; no auto-ship. |
| **Crisis response authority** (press, security, **ED**-adjacent) | Owner/CM + **comms** **/ **counsel** per **escalation** |

**Never** tie unlock of these to **gamified** “points” or **leaderboards** that pressure people to cut corners (see `USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md`).

---

## 8. UX rules (applies to every dashboard)

- **One primary next action** on the home view for each role band.  
- **Plain-language** cards: task titles readable by a tired volunteer.  
- **No clutter** — advanced filters behind “more options.”  
- **Reveal** advanced controls **only** when the user’s **level** and **context** warrant it.  
- **Why locked?** + **How to unlock** + **Who can approve** on every **gated** control.  
- **Campaign Companion** / **Pathway** entry points: “**What do I do next?**” and “**Ask the Campaign Companion**” (see Pass 5C UX spec — not a public “AI” label).

---

## 9. Cross-walk: readiness matrix → unlock stages

`playbooks/ROLE_READINESS_MATRIX.md` **R0–R4** maps loosely to **Level 0–4** in `ROLE_BASED_UNLOCK_LADDERS.md`. **Do not** **merge** PII, finance, or comms **rows** with **“fast path”** unlocks; those rows **win** over **R** for **gated** **surfaces**.

---

**Last updated:** 2026-04-28 (Pass 5C)
