# Build protocol and blueprint audit

**Packets:** **PROTO-2** · **BLUEPRINT-OPS-1**  
**File:** `docs/BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`

**Purpose:** A **single-page, durable** protocol so **ChatGPT ↔ Cursor** passes behave like a **direct engineering** conversation: the user is the courier; **Cursor** preserves context, reports **exactly** what changed, and keeps the **blueprint self-constructing** until the full campaign operating system is build-ready.

**Full orientation map:** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) (**THREAD-HANDOFF-1**). **Project map + packet history:** [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) (**MASTER-MAP-1**).

---

## Roles

| Role | Responsibility |
|------|------------------|
| **User** | Carries **Cursor results** to ChatGPT and **scripts** back to Cursor; does not re-explain known context unless asked. |
| **ChatGPT** | Reconciles outputs with maps and code, updates **blueprint direction**, writes the **next tight Cursor script**; no pause for direction unless blocked by missing repo facts or unsafe ambiguity. |
| **Cursor** | Implements **scoped** work, **audits** against rails, returns **structured** results; reads maps and code before changing behavior. |

---

## Return formats

### Cursor (every return)

1. **IMPLEMENTED**  
2. **FILES**  
3. **BUILD PROGRESS UPDATE**  
4. **BLUEPRINT PROGRESS UPDATE**  
5. **DRIFT CHECK**  
6. **LANE LEVEL UPDATE**  
7. **WHAT IS STILL MISSING**  
8. **NEXT RECOMMENDED PACKET**  
9. **CHECKS**

### ChatGPT (every pass)

1. What the **next Cursor script** is building.  
2. **Why** it matters.  
3. **Current blueprint** progress.  
4. The **Cursor script** (paste-ready).  
5. No pause for direction unless **blocked** (missing facts / unsafe ambiguity).

---

## ChatGPT ↔ Cursor loop (summary)

1. User gives ChatGPT **Cursor’s result**.  
2. ChatGPT writes the next **tight Cursor script**.  
3. User pastes it into **Cursor**.  
4. Cursor **implements, audits**, and returns structured results.  
5. ChatGPT **summarizes** progress, updates blueprint direction, writes the **next** script.  
6. **No** re-explaining known context.  
7. User comments **without** Cursor results = **background** unless they explicitly want a new script.

---

## Build philosophy (non-negotiables)

- **Bottom-up, no shortcuts, no fake completion.**  
- **Durable foundations** before **automation**.  
- **Automation** never outruns **approval**, **auditability**, or **governance** state.  
- **AI** drafts, summarizes, classifies, recommends; **AI is not** final authority.  
- **User approval** remains default for **outbound email**, **public messaging**, **voter classification**, **escalation**, **compliance-sensitive** actions, and **financial** actions until the blueprint **explicitly** authorizes otherwise.  
- **Source-of-truth** layers: **database/code** · **operational** · **advisory AI** · **narrative/reference** — do not conflate them.  
- **Discord** in user-facing text: **AJAX Organizing Hub** (see Discord integration docs for implementation).  
- **Email:** **queue by default** until policy allows no-approval sending.

---

## Packet scaling

- **Default:** **one** packet per pass.  
- **Two:** same lane, **low risk** only.  
- **Three:** **tightly coupled** only.  
- **Five+:** **docs-only** or **reference / indexing** only.  
- **Never** hide large behavior changes in **“cleanup.”**

---

## Lane maturity (L0–L5)

| Level | Meaning |
|-------|---------|
| **L0** | Concept only. |
| **L1** | Docs / spec. |
| **L2** | Persistence / seams. |
| **L3** | Operator UI / workflows. |
| **L4** | Automation / queues (policy-governed). |
| **L5** | Optimization / intelligence. |

**Each pass:** Record what is **real in code** vs **docs-only**; **next safe packet**; **dependencies** before automation; **lane** levels.

---

## Approval-first doctrine

- Outbound and sensitive paths stay **review-first** unless a **policy packet** defines a **safe** exception.  
- **Email** remains **queue-first** in design until explicitly widened.  
- **No** silent **mutation** of voter truth, money, or compliance posture.

---

## Drift prevention checklist

- [ ] Stated **packet** scope matches **files** changed.  
- [ ] **Rails** in [`shared-rails-matrix.md`](./shared-rails-matrix.md) still honest after the change.  
- [ ] **No** new **authority tier** for AI; **advisory** stays advisory.  
- [ ] **No** hidden **outbound** or **untracked** data mutation.  
- [ ] **Migration** (if any) is **named**, **reviewed**, and **applied** per environment.  
- [ ] **Blueprint** maps updated: [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md), [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md), and any lane doc touched by the packet.

---

## New-thread checklist

- [ ] Read [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md).  
- [ ] Read [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md).  
- [ ] Read **this** file.  
- [ ] Skim [`workbench-build-map.md`](./workbench-build-map.md) if the task touches **admin** surfaces.  
- [ ] Note **REL-2** / email **queue-first** invariants if touching those lanes.

---

## Cursor preflight checklist

1. Read [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md).  
2. Read [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md).  
3. Read [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) (this file).  
4. Inspect `prisma/schema.prisma` when models or relations may be involved.  
5. Inspect `src/lib/campaign-engine/` when rails, truth, or engine seams are involved.  
6. Check **latest migration** names under `prisma/migrations/`.  
7. **Run** `npm run check` / `tsc` / migrate **only** when **code** or **schema** changed (docs-only: confirm files, no full `tsc` unless you touched code).

---

*Stack (ground truth):* Next.js App Router · Prisma · PostgreSQL · `reddirt-site` under `RedDirt/`. *Quality gate for code pushes:* `npm run check` (see `RedDirt/README.md`).
