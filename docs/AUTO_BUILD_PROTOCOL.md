# AUTO-BUILD-1 — Controlled self-build protocol (overnight / unattended Cursor)

**Packets:** **AUTO-BUILD-1** (policy) · **AUTO-BUILD-2** (nightly **GitHub Actions** schedule + preflight **artifact** only — see [§9](#9-auto-build-2--nightly-scheduled-runner))  
**File:** `docs/AUTO_BUILD_PROTOCOL.md`  
**Parent rails:** **PROTO-2** · **DIV-OPS-1** · **DIV-OPS-2** · **BLUEPRINT-EXP-1** (see [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md))

**What this is — and is not:** **Self-build** is a **controlled** mode for **continuing implementation** when a human is not in the loop (e.g. overnight). It uses **the same** docs-first rails and **stops** before **high-risk** changes. It is **not** autonomous campaign control, **not** a license to run **sends**, **publishes**, **financial** actions, or **unreviewed** **schema** changes. **Self-build is a controlled overnight mode, not autonomous campaign control.**

**Canonical handoff + packet maps (read in full before any self-build cycle):** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) · [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) · [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md)

---

## 1. What self-build may do (allowed)

Self-build is allowed **only** for work that fits **all** of:

- Stays **within** [**Approved Self-Build Queue**](#3-approved-self-build-queue) (or a **script** that explicitly names a **packet already defined** in the **master** blueprint and **registry**).
- Advances **at most one** **packet** (or one **tightly scoped** **docs** / **test** pass per cycle — see [cycle rules](#5-self-build-cycle-rules)).
- Produces a [**required output**](#4-required-self-build-output) and **stops**.

**Allowed categories (non-exhaustive, must still be low-risk):**

| Category | Examples |
|----------|----------|
| **Docs expansion** | Registry/ledger updates, forward-path notes, cross-links, **blueprint** synchronization |
| **Tests** | Unit/integration tests, fixtures, `tsc` hygiene for **touched** code |
| **Read-only UI** | Lists, tables, detail views that **do not** POST, queue sends, or mutate money/compliance state |
| **Helper functions** | Pure or read-mostly helpers, query wrappers, `getX` read models |
| **Type cleanup** | Non-behavioral refactors that preserve runtime |
| **Non-destructive admin views** | New admin **read** routes that **only** display existing data |
| **Blueprint synchronization** | Aligning `PROJECT_MASTER_MAP` ↔ `DIVISION_MASTER_REGISTRY` ↔ `THREAD_HANDOFF` ↔ lane docs |
| **Named packets** | Packets **already** listed in the **master** map / **recommended** list / **forward path** — not **invented** scope |

---

## 2. What self-build must not do (forbidden)

| Forbidden | Rationale |
|-----------|-----------|
| **Outbound** email, SMS, or any **message** **send** | Human approval and queue-first doctrine |
| **Publishing** to public site or **social** **execution** | Operator intent |
| **Voter support classification** (writes or UI that **commits** support tiers) | Governance |
| **AI voter scoring** or **black-box** per-voter **scores** | Advisory-only rails |
| **Finance / compliance** **actions** (ledger confirm, filing, “approve” as execution) | Audit + policy |
| **Schema migrations** | Unless **explicitly** assigned in the **user script** to this cycle |
| **Destructive** data **mutation** (delete/bulk update without **explicit** spec) | Safety |
| **Permission / auth / RBAC** **changes** | Security review required |
| **Automation** that **runs** **without** a **clear** **human** **approval** path | Policy |
| **Scope** beyond **one** **division** (primary target) **plus** **docs** **sync** | [Hard stop](#6-hard-stops--escalation-to-human) |

*If a task **touches** a forbidden area for **review** only* (e.g. read how sends work) — **docs** only; **no** behavior change in self-build.

---

## 3. Approved Self-Build Queue

**Purpose:** A **curated** list of **low-risk** packet **types** that may be picked for a **self-build** **cycle** when they match repo state and **registry** **balance**. It is **not** an approval to **skip** [hard stops](#6-hard-stops--escalation-to-human). **Update this queue** in the same **PR** / **doc pass** when the **blueprint** **retires** or **replaces** an item.

| Queue item | Notes |
|------------|--------|
| **GOTV-1** | Only if the **read model** + **admin** seam in the **master map** are **not** yet **done**; otherwise **retire** from queue or replace with **GOTV-2** when **defined**. |
| **REL county rollups preview** | Read-only **county**-scale **relational** **rollups** / **preview** where **packeted** in **registry** / **PROJECT_MASTER_MAP** (no **merge** workflow). |
| **Read-only reporting panels** | **Admin** or **workbench** **panels** that **aggregate** **existing** data **only**. |
| **Docs sync passes** | **Ledger** ↔ **registry** ↔ **thread handoff** **parity**; **no** new product scope. |
| **Test coverage passes** | Add/adjust **tests** for **existing** **behavior**; **no** new features. |

**Rule:** A **self-build** run **chooses the single next** item that is **(a)** in this **queue** or a **script**- **named** **packet**, **(b)** **allowed** per §1, and **(c)** **not** blocked by a [hard stop](#6-hard-stops--escalation-to-human).

---

## 4. Required self-build output (handoff report)

**Every** self-build **cycle** **must** end with a **handoff report** (same **thread** or **file** the human reads next) containing:

1. **Packet name** (or “docs sync” / “test pass”)  
2. **Target division** (DIV-OPS-2) + **one line** **reason**  
3. **Files changed** (paths)  
4. **Checks run** (e.g. `npx tsc --noEmit`, `npm run lint`, tests) or **“docs-only”**  
5. **Risks** (what could surprise a human)  
6. **What still needs human approval** (explicit list)  
7. **Next recommended packet** (single default; may repeat “blocked until human” if hard-stopped)  

**Align** with return formats in [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) — **Build steering** and **division** **status** still **apply** when code changes.

---

## 5. Self-build cycle rules

**Every** self-build **cycle** must:

1. **Read** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) (at least **§0** + **hard stops** in this file).  
2. **Read** [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) (return formats, approval-first, packet scaling).  
3. **Read** [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) ( **Priority** , **forward path** , **imbalance** ).  
4. **Choose** **only** the **next** **approved** **packet** (one **queue** item or **script-locked** scope).  
5. **Declare** a **BUILD STEERING DECISION** ( **target** division, **reason** , **non-target** ).  
6. **Update** **blueprint** **docs** when the work **moves** a **division** or **retires** a **queue** item.  
7. **Run** **checks** appropriate to **what** changed ( **§9** below ).  
8. **Stop** after **one** **packet** (or one **doc sync** / **test** pass).  
9. **Produce** the [handoff report](#4-required-self-build-output-handoff-report).

---

## 6. Hard stops (escalation to human)

**Stop** the self-build **run** and **do not** **commit** **risky** **changes**; **request** **human** **review** (leave a **clear** **handoff** **note** with **reason** ) if **any** of the following is true or **likely**:

| # | Condition |
|---|-----------|
| H1 | **Auth** / **security** changes are **needed** to proceed |
| H2 | A **schema** / **Prisma** **migration** is **needed** (unless the **user script** **explicitly** **assigned** it **this** cycle) |
| H3 | An **outbound** **action** (send, publish, **execute** **payment** / **compliance** ) would be **introduced** or **enabled** |
| H4 | **Conflicting** **docs** are **found** (two **truths** for the same **rail**; **code** **vs** **doc** **—** follow **code** and **flag**; do **not** **silently** **pick** ) |
| H5 | **`tsc`** (or the **project**’s **agreed** **check** ) **fails** after a **reasonable** **fix** **attempt** |
| H6 | **Packet** **scope** would **exceed** **one** **primary** **division** **plus** **doc** **sync** (or **touches** **forbidden** **§2** ) |

After a **hard stop**, the **handoff** **must** state **which** **condition** **triggered** and what **the** **human** **should** **decide**.

---

## 7. Checks (self-build)

- **Code touched:** run **`npx tsc --noEmit`** (from `RedDirt/`) and **lint** / **`npm run check`** if **available** and **not** **prohibited** by **environment**.  
- **Schema touched:** only if **H2** **explicitly** **allowed** — then **`npx prisma generate`** / **migrate** per **project** **README**; **otherwise** **hard** **stop**.  
- **Docs-only:** list **files**; **“no** **code** **checks**” is **OK** if **no** **TS** **sources** **changed**.  

---

## 8. Integration with other docs

| Doc | Role |
|-----|------|
| [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) | **Parent** **protocol**; self-build **defers** to **approval-first** and **return** **formats** |
| [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) | **§0.11** (or **equivalent**): **pointers** to this file |
| [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) | **Ledger**; **self-build** must **not** **fork** the **blueprint** without **edits** **here** when **reality** **changes** |
| [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) | **Steering** and **one** **target** **division** |
| [`shared-rails-matrix.md`](./shared-rails-matrix.md) | **Rails** **honesty**; **no** **hidden** **outbound** |

---

## 9. AUTO-BUILD-2 — Nightly scheduled runner

**What it is:** A **read-only** **automation** **layer** in the repo: **`.github/workflows/nightly-self-build.yml`** (at the **git** **repository** **root**, this **project** = **`RedDirt/`**) runs on a **UTC** **cron** (targeting **2:30 AM** **America/Chicago** during **CDT** using **07:30 UTC** — **not** a perfect year-round match because **GitHub** **cron** is **UTC-only**; **Central** **shifts** with **DST**; **review** **seasonally**). The workflow **checks out** the repo, **installs** **deps** (**`npm ci`** at **root**), runs **`npm run nightly:self-build:preflight`**, then **`npm run typecheck`**, and **uploads** the **handoff** **markdown** from **`.nightly-self-build/nightly-self-build-*.md`** as a **build** **artifact**.

**What it is not:** **Not** a **deploy**, **not** **`prisma migrate`**, **not** a **push** to **`main`**, **not** **emails** / **messages** / **external** **campaign** **APIs**, **not** **production** **data** **writes**, **not** **voter** **scoring** / **classification** / **publishing** — and **not** a **bypass** of **human** **approval** for **sensitive** **actions**. It **reinforces** **AUTO-BUILD-1** **rails** by **documenting** them in each **handoff** and **failing** the **typecheck** **step** if the **tree** does **not** **compile** (operators **see** a **red** **run**; **no** **auto**-**fix**).

**Repo paths:** `scripts/nightly-self-build-preflight.mjs` · `package.json` **script** **`nightly:self-build:preflight`**.

---

*Last updated: **AUTO-BUILD-1** + **AUTO-BUILD-2** (policy + nightly schedule / handoff artifact; no production side effects by design).*
