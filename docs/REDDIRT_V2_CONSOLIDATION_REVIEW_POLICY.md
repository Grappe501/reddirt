# RedDirt V2 — Consolidation review policy

**Packet:** **REDDIRT-V2-ARCH-REGISTRY-1.0**  
**Lane:** `RedDirt/` only  
**Companion:** [`REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md`](./REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md) · [`REDDIRT_V2_MASTER_ARCHITECTURE.md`](./REDDIRT_V2_MASTER_ARCHITECTURE.md) · [`data/architecture/reddirt_v2_external_system_review_matrix.json`](../data/architecture/reddirt_v2_external_system_review_matrix.json) · [`develop_notes/REDDIRT_V2_ARCH_REGISTRY_1_0_REPORT.md`](../develop_notes/REDDIRT_V2_ARCH_REGISTRY_1_0_REPORT.md)

---

## Purpose

This policy governs **consolidation reviews**: merging, deduplicating, or **migrating** material between docs, data folders, or **external** workspace systems and **`RedDirt/`**.

Goals:

- Prevent **destructive** or **ambiguous** consolidation (mass deletes, silent merges of sibling apps, “helpful” moves that break deploy boundaries).  
- Require a **written migration decision record** and **audits** before any action that could move authority, code, or data **into** RedDirt from outside the lane.  
- Keep **`sos-public/`** a **clean public website boundary** even when placeholder content is replaced (see **Public website exception**).  
- Align doc-only consolidation with [`REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md`](./REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md): **scanner classification is not permission to migrate.**

When two **RedDirt/docs** files overlap in intent, prefer **updating the primary map** (`PROJECT_MASTER_MAP`, `DIVISION_MASTER_REGISTRY`, subsystem master plan) and **cross-linking** over spawning a third duplicate; use a **dated deprecation banner** in-place rather than silent deletion of peer content unless a packet explicitly owns deletes.

---

## Absolute rule: no destructive consolidation without approval

**No destructive consolidation** (deletes, moves, renames of lane folders, mass removal of peer docs, merging sibling repos into `RedDirt/`, or changing production coupling) **without Steve’s explicit approval** and a completed **Migration Decision Record** plus the audits below.

**Non-destructive** edits inside `RedDirt/` that a normal packet already allows (typo fixes, cross-links, ledger updates that reflect shipped code) follow the owning packet’s rules — they are **not** “consolidation” under this policy.

**If in doubt**, treat the change as consolidation-class and run the checklist.

---

## Candidate external systems

Candidates for **any** merge, import, or “make it part of RedDirt” discussion include **all** rows in [`reddirt_v2_external_system_review_matrix.json`](../data/architecture/reddirt_v2_external_system_review_matrix.json), including at minimum:

- `sos-public` · `ajax` · `phatlip` · `countyWorkbench` · `arkansas_civics` · `arkansas_civic_university` · `acu_lane_a` · `acu_lane_c` · `stand-up-arkansas` · `campaign information for ingestion` · `brands` · workspace-root `docs` · `.github` · `tools` · `Kelly media` · `volunteerPage` · `dist-county-briefings` · `dist-pope-briefing` · `brand-audit` · provider rows (SendGrid, Gmail/Google Calendar)

**Scanner or matrix listing** a folder is **evidence of adjacency only** — not approval to consolidate ([`REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md`](./REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md) — external system review rule).

---

## Required migration decision record

Any proposal to **migrate** or **merge** an external system (or large doc corpus) **into** `RedDirt/` must file a **Migration Decision Record** using the template below. Store it under `RedDirt/develop_notes/migration-decisions/` (or append to a single `MIGRATION_DECISIONS.md` if steered) and **link** it from the PR and from `PROJECT_MASTER_MAP` / packet notes when division reality changes.

Until the record exists and **Steve** has signed **Approved by Steve**, the default action is **no migration**.

### Migration Decision Record (template)

Copy verbatim and fill in:

```text
# Migration Decision Record

Source:
Destination:
Purpose:
Why it belongs in RedDirt:
Why it should not remain external:
Dependencies:
Secrets/env risk:
Data mutation risk:
Route collision risk:
Schema collision risk:
Deployment coupling risk:
Public website boundary risk:
Rollback plan:
Recommended action:
Approved by Steve:
Approval date:
```

---

## Dependency audit

Before consolidation:

- **List** all npm/package, workspace, and git submodule edges that would change if code or shared packages moved.  
- **Confirm** no hidden imports from forbidden lanes (`sos-public` → `RedDirt`, `RedDirt` → `sos-public`, cross-sibling) appear in the diff.  
- **Map** which RedDirt packets or surfaces **depend** on the source staying external (e.g. countyWorkbench as separate deploy).

Record findings in the Migration Decision Record **Dependencies** section.

---

## Secret/env audit

- **No** secrets in the decision record, PR body, or consolidation commits.  
- **Inventory** env vars, API keys, OAuth clients, webhooks, and Netlify env that would need rotation or duplication after a merge.  
- **Verify** `email:db:diagnose` / import gates are not pointed at the wrong DB as a side effect of path moves.

Record under **Secrets/env risk** in the Migration Decision Record.

---

## Schema collision audit

- **Compare** Prisma models, enums, and migration history if database shape could change.  
- **Reject** proposals that reorder or squash **applied** migrations or collide with existing table names.  
- **Document** any new migrations in a **named packet** — not as a side effect of “consolidation cleanup.”

Record under **Schema collision risk** in the Migration Decision Record.

---

## Route collision audit

- **Search** for duplicate App Router paths, API routes, and webhooks if UI or handlers move.  
- **Check** SendGrid/Gmail callback URLs and Netlify redirects for collisions.  
- **Ensure** admin-only routes do not leak into public deploy roots.

Record under **Route collision risk** in the Migration Decision Record.

---

## Deployment coupling audit

- **Identify** Netlify sites, build roots, cron jobs, and GitHub Actions that assume folder layout (`RedDirt/` vs workspace root).  
- **Confirm** CI still runs the correct `npm run check` / scans from the post-change working directory.  
- **Avoid** coupling two products into one deploy artifact unless explicitly approved.

Record under **Deployment coupling risk** in the Migration Decision Record.

---

## Data mutation risk audit

- **Classify** whether consolidation triggers **imports**, **merges**, or **deletes** of `EmailContactProfile`, voter-adjacent tables, or comms history.  
- **Require** hosted DB gate completion before production-class mutations.  
- **Ban** using real voter PII in test fixtures as part of consolidation.

Record under **Data mutation risk** in the Migration Decision Record.

---

## Rollback plan

- **State** how to revert: git revert range, restore separate deploy, or restore env vars.  
- **Timebox** first deploy after consolidation and assign an **operator** to watch errors.  
- **Never** consolidate without a way to return to the prior **two-repo / two-folder** posture if production breaks.

Record under **Rollback plan** in the Migration Decision Record.

---

## Public website exception

**Allowed without treating as “migration into RedDirt”:**

- **Redesigning or replacing placeholder** UI, copy, assets, and routes **entirely inside `sos-public/`**, preserving the **clean public app boundary** (no Prisma, no `/admin`, no voter-file tooling, no ingest pipelines, **no** `import … from '…/RedDirt/src/**'`).

**Still requires** normal `sos-public` packet process and **does not** relax:

- **No** merging `sos-public/` tree into `RedDirt/`.  
- **No** importing RedDirt OS internals into the public app without Steve-approved integration packet.

If consolidation talk **touches** public ↔ OS handoff, file a Migration Decision Record anyway and set **Public website boundary risk** explicitly (often: **high_if_coupled**).

---

## Approval checklist

Before merging a consolidation PR that moves authority, code, or data across boundaries:

- [ ] **Migration Decision Record** completed (template above) and linked.  
- [ ] **Steve approval** line filled (`Approved by Steve`, `Approval date`).  
- [ ] **Dependency audit** — no forbidden cross-lane imports.  
- [ ] **Secret/env audit** — no secrets in diff; rotation plan if keys change.  
- [ ] **Schema collision audit** — migrations policy respected.  
- [ ] **Route collision audit** — no duplicate public/admin routes.  
- [ ] **Deployment coupling audit** — Netlify/CI roots verified.  
- [ ] **Data mutation risk audit** — PII and production DB posture explicit.  
- [ ] **Rollback plan** — executable, not aspirational.  
- [ ] **`sos-public` boundary** — no `RedDirt/src/**` imports; no OS merge into public app.  
- [ ] **`PROJECT_MASTER_MAP` / `DIVISION_MASTER_REGISTRY`** updated if division reality changed.  
- [ ] If `reddirt_v2_layer_registry.json` changed: `node scripts/validate-v2-arch-registry.mjs`.

Workspace-root system maps (`RedDirt_CampaignOS_SystemMap_*`, etc.) follow the same rules: **optional context**; copy-into-`RedDirt/docs/` only with a decision record; never runtime authority ([`REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md`](./REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md)).

---

*Last updated: **REDDIRT-V2-ARCH-REGISTRY-1.0** — Deliverable F: consolidation review policy.*
