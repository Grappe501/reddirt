# Build protocol and blueprint audit

**Packets:** **PROTO-2** · **BLUEPRINT-OPS-1** · **DIV-OPS-1** · **DIV-OPS-2** · **BLUEPRINT-EXP-1** · **AUTO-BUILD-1** (policy) · **AUTO-BUILD-2** (nightly **CI** preflight + **artifact** — see below)  
**File:** `docs/BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`

**Purpose:** A **single-page, durable** protocol so **ChatGPT ↔ Cursor** passes behave like a **direct engineering** conversation: the user is the courier; **Cursor** preserves context, reports **exactly** what changed, and keeps the **blueprint self-constructing** until the full campaign operating system is build-ready.

**Full orientation map:** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) (**THREAD-HANDOFF-1**). **Project map + packet history:** [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) (**MASTER-MAP-1**). **Today’s build pathway** (division levels, gates, ordered packets — **ingest** **+** **embeddings** **+** **manifest**): [`BUILD_LEVEL_AUDIT_TODAY.md`](./BUILD_LEVEL_AUDIT_TODAY.md) (**BLUEPRINT-AUDIT-LEVEL-PATH-1**). **Division registry (balance + steering + **forward path** per division):** [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) (**DIV-OPS-1** / **DIV-OPS-2** / **BLUEPRINT-EXP-1**). **Unattended / overnight continuation (read before leaving Cursor alone):** [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) (**AUTO-BUILD-1**).

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
- AJAX Organizing Hub (Discord layer) — **external** **/** **dropped** **from** **active** **RedDirt** **prioritization**; **separate** **project** (see [`BUILD_LEVEL_AUDIT_TODAY.md`](./BUILD_LEVEL_AUDIT_TODAY.md))  
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

### INGEST-OPS-2 standing rule (election + brain backlog)

**Every** regular build pass **must** **check** and **report** (in the structured return or handoff):

1. **Is election ingest complete** for the **intended** environment (target JSONs ingested or **documented** skip)?  
2. **If not**, does **this** packet **advance** election ingest (CLI run, dry-run validation, mapping fix, or **doc** explaining **blocker**)?  
3. **If election ingest is complete**, does **this** packet **ingest** or **prepare** **one** **brain/source** file **group** (or **improve** schema/mapping for **one** group), **or** explain **why not**?  
4. If **neither** applies, state **status** anyway — **do** **not** **force** ingest into **unrelated** **high-risk** packets.

**Canonical backlog + architecture:** [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md). **Inventory:** `npm run ingest:inventory` → [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md). **Do not** **treat** **absence** of **check** as **neutral** when data work is **in** **scope**.

### Election Ingest Gate (INGEST-OPS-3)

**No** build packet may **advance** the following **until** **election ingest** is **COMPLETE** (per [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) and `ElectionResultSource` truth in the **intended** environment) **or** the program **explicitly** **waives** the gate in writing (e.g. time-boxed spike, different data strategy):

- **GOTV** — beyond **read model** / planning (no new execution runners, schedulers, or scale-up that assume full election tabulation coverage).  
- **Comms** — **automation** that depends on **election result** coverage or cross-election analytics as **ground truth**.  
- **Campaign intelligence** — **modeling** or **rollups** that **assume** a **closed** **election** **tabulation** set for targeting or narrative (document **PARTIAL** + limits instead).

**Authoritative check:** `npm run ingest:election-audit` (with DB up) and/or the read-only SQL in **§B** of [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) · **INGEST-OPS-3B:** `npm run ingest:election-audit:json` (and optional `ingest:election-audit:doc` to refresh the audit doc) — see [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md). **Do not** **treat** **BLOCKED** (DB unreachable) as **PARTIAL** or **COMPLETE** in any build report. **If** `status` is **PARTIAL**, continue **targeted** `ingest:election-results` for **missing** files only. **INGEST-OPS-4** (**normalized** brain/source manifest) is **implemented**: **`npm run ingest:brain-manifest`** → [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) (read-only scan; see [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) **§2.8**). **Next** ingest line for **automation** is **INGEST-OPS-5** (first governed non-election parser) **when** **steered**. **GOTV** / **comms** / **intelligence** **read** paths that **do not** **assert** **complete** **election** **ingest** may continue when labeled **advisory** / **gapped** per existing brain docs.

### Opposition Intelligence (INTEL-OPS-1 + INTEL-OPS-2)

**Competitor** / **opposition** **intelligence** is a **core** **Campaign** **Intelligence** / **Reporting** **capability**, defined in **[`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md)** (**INTEL-OPS-1** + **INTEL-OPS-2**). It **remains** **ethically** and **architecturally** **distinct** from **voter** **targeting** and **GOTV** **scoring**.

- **Collection:** **Public-record** **sources** **only** (SOS, legislature, **official** **video**, **disclosed** **finance**, **public** **news**, **public** **sites** / **social** **where** **lawful** — **no** **illegal** **scraping**, **no** **private** **surveillance** **data**). **User-provided** **lawful** **documents** **allowed** **with** **full** **provenance**.  
- **Publication:** **No** **external** **claims** **or** **messaging** **from** **this** **lane** **without** **human** **review** and **existing** **approval** **doctrine** (comms, compliance **as** **needed**).  
- **AI:** **No** **AI-generated** **factual** **claims** **without** **stored** **source** **citations**; **separate** **fact** / **inference** / **recommendation** per the **opposition** **doc**.  
- **Gating:** **Broad** **automated** **ingest** of **competitor**-**intelligence** **queues** (**[`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md)** **§6.5**) is **gated** **behind** **election** **ingest** **COMPLETE** (or **explicit** **waiver**) — same **rule** as **other** **bulk** **opp** **archives**. **INTEL-1** **manual** / **cited** **entry** **does** **not** **require** **that** **milestone**.  
- **Forward** **packets** ( **docs** / **schema** **proposals** — **not** **auto**-**scheduled** ): **INTEL-2** = **competitor** **source** **manifest**; **INTEL-3** = **bill** / **vote** / **campaign-finance** **schema** **proposal**; **INTEL-4** = **official** **video** / **transcript** **index**; **INTEL-5** = **county** **election** **behavior** **analysis**; **INTEL-6+** = **persistence** **views**, **dashboards**, **AI** **summaries** **with** **mandatory** **review** (see **opposition** **doc** **§11**). **Ingest** **lines** **stay** **coherent** with **INGEST-OPS-4+** when **manifest**-**driven** **brain** **ingest** **expands**.

---

## Blueprint Expansion Doctrine (BLUEPRINT-EXP-1)

**Forward vision:** The blueprint is not only **current-state** (ledger + L levels) but a **mapped** **future-state** architecture per division — see **Division forward path** in [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) and **Future-state blueprint** in [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md).

### 1. Requirement

**Every** division in the **registry** must document:

| Field | Meaning |
|-------|---------|
| **CURRENT STATE** | What **exists** in code/docs/ops **today** (honest). |
| **NEXT STAGE** | What **L3+ / L4** looks like for this division (concrete, not a slogan). |
| **UNLOCK CONDITIONS** | What must **exist** before the division may **advance** (deps, data, policy, auth). |
| **DEPENDENCIES** | What **other** divisions or rails **rely on** this one, or that this one **feeds**. |

### 2. Purpose

- **Reduce reactive** building (only fixing imbalance) without a **named** next horizon.  
- **Ensure** future **architecture** is **named** before large implementation.  
- Let **build steering** choose from **known** **paths** and **unlocks** instead of **guessing** in chat.  

### 3. Rule

- **No** division is **advanced** in implementation **without** a **defined** **NEXT STAGE** in the **registry** (or an **explicit** packet that **adds** that row and **then** implements).  
- The **blueprint** should **lead** the build: **docs + registry** update **first** for material scope, **then** code — except **tiny** hotfixes (still report in returns).  
- Pairs with **DIV-OPS-2**: **target** division should cite **which** **next stage** the packet **moves toward**.  

---

## Controlled self-build (AUTO-BUILD-1)

**What it is:** A **doc-defined** mode for when **Cursor** may **continue** with **no** human in the loop (e.g. **overnight**). **Self-build** is a **controlled** **overnight** mode: it **stays** inside **low-risk** work and **stops** when **forbidden** scope or **hard stops** apply. It is **not** **autonomous** **campaign** **control** and **not** a bypass for **approval-first** on **sends**, **publishes**, **money**, or **migrations**.

**Canonical doc:** [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) — **allowed** / **forbidden** work, **Approved Self-Build Queue**, **required handoff** output, **cycle** **rules**, and **hard stops** (auth, migration, outbound action, **doc** **conflict**, `tsc` **failure** after **reasonable** **fix**, **scope** **> 1** **division** + **docs**). Every cycle: **one** **packet** (or one **doc** **sync** / **test** pass), then **handoff** **report** and **stop**.

**Relationship to this file:** All **return** **formats**, **Build steering**, **division** **status**, **approval-first** **doctrine**, and **packet** **scaling** in **PROTO-2** still **apply** when **self-build** **touches** **code**; self-build only **restricts** **what** may be **attempted** **unattended**.

### AUTO-BUILD-2 (nightly scheduled runner — not production execution)

**Repo:** [`.github/workflows/nightly-self-build.yml`](../.github/workflows/nightly-self-build.yml) (this **repository** **root** = **`RedDirt/`**) runs **daily** on a **UTC** **cron** ( **07:30 UTC** to match **2:30 AM** **Central** during **CDT** — **see** **comment** in **workflow** for **DST** / **review**). It runs **`npm run nightly:self-build:preflight`** (writes **`.nightly-self-build/nightly-self-build-YYYY-MM-DD.md`**) and **`npm run typecheck`**, then **uploads** the **handoff** as a **CI** **artifact**. It **does** **not** **deploy**, **migrate**, **push** **to** **main**, **send** **mail**, or **mutate** **production** **data** — same **safety** **rules** as **AUTO-BUILD-1** **policy**; see [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) **§9**.

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
   - **REASON:** (balance, dependency, **unlock** / **future** **path** (**BLUEPRINT-EXP-1**), or script-locked exception)  
   - **NON-TARGET DIVISIONS:** (not selected this pass + brief why)  
   - **NEXT STAGE (optional but encouraged):** which **forward-path** **bullet** in the **registry** this pass **moves** toward (if **material**).  
   Tied to [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) **Blueprint Progress Ledger** + **Future-state** + [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md). If targeting **L3+** in a **strong** division, explain **skipped** **lower** divisions.  
6. **DIVISION STATUS UPDATE** (DIV-OPS-1) — For **each** **relevant** division: **level (L0–L5)**; **what changed**; **imbalance** / risk; **next** **stage** **unchanged** vs **updated** ( **BLUEPRINT-EXP-1** ) when **relevant**.  
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
- [ ] **Next stage** / **unlock** fields still **accurate** for **target** division (**BLUEPRINT-EXP-1**).  
- [ ] **Build steering decision** present: **target** division, **reason**, **non-target** divisions (DIV-OPS-2).  
- [ ] If **data** / **ingest** / **targeting** touched: **INGEST-OPS-2** **status** (election complete? brain queue advanced?) or **explicit** N/A.  

---

## New-thread checklist

- [ ] Read [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md).  
- [ ] Read [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md).  
- [ ] Read **this** file.  
- [ ] If using **unattended** / **self-build** mode: read [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) (**AUTO-BUILD-1**) and pick **only** from the **Approved Self-Build Queue** (or a **script**-locked, **low-risk** **packet**).  
- [ ] Read [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) — **balance** (DIV-OPS-1) + **priority** (DIV-OPS-2) + **forward path** / **unlocks** (**BLUEPRINT-EXP-1**) before locking the next packet.  
- [ ] Skim [`workbench-build-map.md`](./workbench-build-map.md) if the task touches **admin** surfaces.  
- [ ] Note **REL-2** / email **queue-first** invariants if touching those lanes.  

---

## Cursor preflight checklist

1. Read [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md).  
2. Read [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md).  
3. Read [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) (this file).  
4. Read [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md); state **Build steering decision** (target, reason, non-target) **before** implementation; align with **Priority level**, **imbalance** (DIV-OPS-1/2), and **which** **next** **stage** the packet **advances** (**BLUEPRINT-EXP-1**).  
4a. If **self-build** / **unattended**: read [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md); **do** **not** start if work **violates** **allowed** work or **triggers** a **hard stop**; **one** **packet** per cycle.  
5. Inspect `prisma/schema.prisma` when models or relations may be involved.  
6. Inspect `src/lib/campaign-engine/` when rails, truth, or engine seams are involved.  
7. Check **latest migration** names under `prisma/migrations/`.  
8. **Run** `npm run check` / `tsc` / migrate **only** when **code** or **schema** changed (docs-only: confirm files, no full `tsc` unless you touched code).

---

*Stack (ground truth):* Next.js App Router · Prisma · PostgreSQL · `reddirt-site` under `RedDirt/`. *Quality gate for code pushes:* `npm run check` (see `RedDirt/README.md`). *Unattended / self-build:* [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) (**AUTO-BUILD-1** / **AUTO-BUILD-2** nightly **workflow**; see **§9**). *Ingest backlog / election+brain protocol:* **INGEST-OPS-2** in [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md). *Opposition / competitor intelligence blueprint:* [`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md) (**INTEL-OPS-1** + **INTEL-OPS-2**).
