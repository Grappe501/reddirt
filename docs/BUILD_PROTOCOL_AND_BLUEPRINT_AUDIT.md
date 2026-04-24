# Build protocol and blueprint audit

**Packets:** **PROTO-2** · **BLUEPRINT-OPS-1** · **DIV-OPS-1** · **DIV-OPS-2**  
**File:** `docs/BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`

**Purpose:** A **single-page, durable** protocol so **ChatGPT ↔ Cursor** passes behave like a **direct engineering** conversation: the user is the courier; **Cursor** preserves context, reports **exactly** what changed, and keeps the **blueprint self-constructing** until the full campaign operating system is build-ready.

**Full orientation map:** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) (**THREAD-HANDOFF-1**). **Project map + packet history:** [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) (**MASTER-MAP-1**). **Division registry (required for balance + steering):** [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) (**DIV-OPS-1** / **DIV-OPS-2**).

---

## Division tracking & balance doctrine (DIV-OPS-1)

### 1. Definition

A **division** is a **top-level system area** of the campaign operating system. Examples (non-exhaustive; canonical list in [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md)):

- Comms / Email  
- Relational Organizing  
- GOTV / Turnout  
- Volunteer / Field  
- Workbench / Operator System  
- Truth / Deterministic Brain  
- Data / Voter File / Ingest  
- Content / Author Studio  
- Finance / Compliance  
- AJAX Organizing Hub (Discord layer)  
- Campaign Intelligence / Reporting  

### 2. Requirement

**Every** Cursor return **MUST** include a **Build steering decision** (DIV-OPS-2) **and** a **division status** section (see [Return formats](#return-formats)) with:

- **Division status table** (or equivalent structured list) covering **relevant** divisions — at minimum, divisions **touched** or **affected** by the pass; **ChatGPT** may require **full** registry sweep on major packets.  
- **Level (L0–L5)** per [Lane maturity (L0–L5)](#lane-maturity-l0l5) (division = rolled-up or primary lane view).  
- **Progress description** — what advanced, what did not.  
- **Imbalance notes** — **ahead** / **behind** / **blocked** relative to other divisions.  

### 3. Purpose

- **Prevent** overbuilding one system while others **lag**.  
- Let **ChatGPT** steer builds **intentionally** from the registry + ledger.  
- Keep the **blueprint** synchronized **across** divisions, not only within one lane.  

### 4. Balance rule

- **No** division should advance to **L4+** while another **critical** division remains **L1** unless the packet **explicitly** justifies the skew (dependency, time-boxed spike, or campaign exception — **documented**).  
- **Foundational** divisions must reach **L2** (persistence / seams) before **dependent** **automation** is built in consuming divisions.  

---

## Build steering doctrine (DIV-OPS-2)

**Active build steering** upgrades division tracking from **reporting** to **enforcement**: every build **declares intent**, **acknowledges imbalance**, and **blocks** casual overbuilding of already-strong divisions.

### 1. Required declaration (mandatory)

**Every** Cursor build (every **packet** return, including **docs-only**) **MUST** include a **Build steering decision** (see [Return formats](#return-formats)) with:

- **TARGET DIVISION** — The **one** division this packet **primarily** advances (name per [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md)).  
- **REASON FOR SELECTION** — Why this division was chosen: **balance** (address lag), **dependencies** (unblocks others), **unlock potential**, or **explicit** campaign **exception** — not “it was next in the file.”  
- **NON-TARGET DIVISIONS** — Which divisions were **not** selected **for this pass** and **one line each** on **why** (e.g. *deferred, not in scope, already addressed by prior packet*).  

**Rule:** **No** packet may be **executed** (and **no** Cursor return is **complete**) **without** a declared **target** division. **If** the selected division is **high-maturity (L3+)** or is historically **strong** (Comms, Workbench, Data):
→ **justification** must **explicitly** explain **why** **lower-maturity** divisions (see **Priority level** in the registry) were **not** the target for **this** pass, **unless** the **script** already named that target (then cite the script).  

### 2. Purpose

- **Prevent** overbuilding **Comms**, **Workbench**, and **Data** at the **expense** of product truth for **volunteer**, **GOTV**, and **content**.  
- **Ensure** **Volunteer / Field**, **GOTV / Turnout**, and **Content** do not **indefinitely** lag.  
- Make build decisions **explicit** and **auditable** in the return (not only in chat narrative).  

### 3. Rule (enforcement)

- **No defaulting** to the **easiest** lane. **System balance** and **declared** **priority** (registry) **override** **developer convenience**.  
- **ChatGPT** may set **direction** in the **Cursor script**; **Cursor** implements **that** direction **or** **explicitly** proposes an alternative in the **Build steering decision** (do **not** **silently** pick a different division).  

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
5. **BUILD STEERING DECISION** (DIV-OPS-2) — **MANDATORY** for every build:  
   - **TARGET DIVISION:**  
   - **REASON:** (balance, dependency, unlock, or script-locked exception)  
   - **NON-TARGET DIVISIONS:** (not selected this pass + brief why)  
   Tied to [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) **Blueprint Progress Ledger** + [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md). If targeting **L3+** in a **strong** division, explain **skipped** **lower** divisions.  
6. **DIVISION STATUS UPDATE** (DIV-OPS-1) — For **each** **relevant** division: **level (L0–L5)**; **what changed**; **imbalance** / risk.  
7. **DRIFT CHECK**  
8. **LANE LEVEL UPDATE**  
9. **WHAT IS STILL MISSING**  
10. **NEXT RECOMMENDED PACKET**  
11. **CHECKS**

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
- [ ] If a **division** moved: [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) and **Blueprint Progress Ledger** stay **aligned**.  
- [ ] **Build steering decision** present: **target** division, **reason**, **non-target** divisions (DIV-OPS-2).

---

## New-thread checklist

- [ ] Read [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md).  
- [ ] Read [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md).  
- [ ] Read **this** file.  
- [ ] Read [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) — **balance** (DIV-OPS-1) + **priority** (DIV-OPS-2) before locking the next packet.  
- [ ] Skim [`workbench-build-map.md`](./workbench-build-map.md) if the task touches **admin** surfaces.  
- [ ] Note **REL-2** / email **queue-first** invariants if touching those lanes.  

---

## Cursor preflight checklist

1. Read [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md).  
2. Read [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md).  
3. Read [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) (this file).  
4. Read [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md); state **Build steering decision** (target, reason, non-target) **before** implementation; align with **Priority level** and **imbalance** (DIV-OPS-1/2).  
5. Inspect `prisma/schema.prisma` when models or relations may be involved.  
6. Inspect `src/lib/campaign-engine/` when rails, truth, or engine seams are involved.  
7. Check **latest migration** names under `prisma/migrations/`.  
8. **Run** `npm run check` / `tsc` / migrate **only** when **code** or **schema** changed (docs-only: confirm files, no full `tsc` unless you touched code).

---

*Stack (ground truth):* Next.js App Router · Prisma · PostgreSQL · `reddirt-site` under `RedDirt/`. *Quality gate for code pushes:* `npm run check` (see `RedDirt/README.md`).
