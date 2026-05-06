# RedDirt V2 — Source of truth policy

## Policy status

| Field | Value |
|-------|--------|
| **Packet** | **REDDIRT-V2-ARCH-REGISTRY-1.0** |
| **Lane** | `RedDirt/` only |
| **Status** | **Active** — binding for agents and humans when resolving conflicts between docs, JSON registries, scans, and code |
| **Companion doctrine** | [`REDDIRT_V2_MASTER_ARCHITECTURE.md`](./REDDIRT_V2_MASTER_ARCHITECTURE.md) |
| **Consolidation policy** | [`REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md`](./REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md) |
| **Machine registry** | [`data/architecture/reddirt_v2_layer_registry.json`](../data/architecture/reddirt_v2_layer_registry.json) |
| **External matrix** | [`data/architecture/reddirt_v2_external_system_review_matrix.json`](../data/architecture/reddirt_v2_external_system_review_matrix.json) |
| **Validator** | `node scripts/validate-v2-arch-registry.mjs` (after registry JSON edits) |
| **Self-build slice schema** | [`data/selfbuild/reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json) — optional **slice JSON** contract for Cursor packets; subordinate to this hierarchy; validator [`scripts/validate-selfbuild-slice.mjs`](../scripts/validate-selfbuild-slice.mjs) (`cd RedDirt && node scripts/validate-selfbuild-slice.mjs`) · protocol [`REDDIRT_SELFBUILD_SLICE_PROTOCOL.md`](./REDDIRT_SELFBUILD_SLICE_PROTOCOL.md) |

This policy exists because RedDirt has **many** Markdown maps, ledgers, handoffs, and workspace-root artifacts. Without a hierarchy, teams confuse **intent** with **shipped behavior** and treat **scans** as **permission to change** sibling products.

---

## Source-of-truth hierarchy

When artifacts conflict, resolve in this **order** (highest wins):

1. **Applied database state** on the **target** environment — what migrations actually applied and what rows exist, verified through documented gates (`email:db:diagnose`, `email:contact-import:gate`, etc.). **Not** assumed from “works on my laptop” alone.  
2. **`prisma/schema.prisma` + committed migrations** — canonical **data shape** intent for the RedDirt app.  
3. **`RedDirt/src/**` runtime code** — canonical **behavior** (what the running app does today).  
4. **`RedDirt/docs/PROJECT_MASTER_MAP.md` + `RedDirt/docs/DIVISION_MASTER_REGISTRY.md`** — canonical **division steering** and packet continuity **for RedDirt**.  
5. **`RedDirt/docs/THREAD_HANDOFF_MASTER_MAP.md`** — canonical **cross-thread** orientation and guardrails.  
6. **`RedDirt/docs/email-command-center-v2-master-blueprint.md` + `RedDirt/docs/email-command-center-v2-agent-planning-harness.md`** — **Comms / ECC V2 intent**; **does not** override §2–3 for non-Comms domains.  
7. **`RedDirt/data/architecture/reddirt_v2_layer_registry.json`** — machine-readable **layer fusion** and doctrine strings (`schemaVersion` 1.0).  
8. **`RedDirt/data/architecture/reddirt_v2_external_system_review_matrix.json`** — sibling/provider **boundary defaults** (`canBeImportedIntoRedDirtWithoutApproval` is **false** unless a steered revision explicitly changes a row under governance).  
9. **Workspace-root files** (e.g. `SOSWebsite/README.md`, `SOSWebsite/RedDirt_CampaignOS_SystemMap_*`, `SOSWebsite/docs/`) — **context and orientation only** until a named packet **copies or reconciles** them into `RedDirt/docs/` with a decision record.  
10. **`RedDirt/data/selfbuild/reddirt_selfbuild_slice_schema.json`** (+ companion slice JSON examples) — optional **per-packet** scope, proof, and governance contracts for Cursor/queue tooling; **subordinate** to §§1–9; structural validation only via [`scripts/validate-selfbuild-slice.mjs`](../scripts/validate-selfbuild-slice.mjs) (see [`REDDIRT_SELFBUILD_SLICE_PROTOCOL.md`](./REDDIRT_SELFBUILD_SLICE_PROTOCOL.md)).

---

## Runtime truth vs documentation truth

- **Runtime truth** = compiled code paths + database state the app actually uses on a **named** environment.  
- **Documentation truth** = what we **commit** to in maps, blueprints, and registries about intent, readiness, and steering.

When they diverge:

- **Prefer honest language** in docs: *planned*, *partial*, *shell-built*, *operational-local*, *operator-proven* (see [`REDDIRT_V2_MASTER_ARCHITECTURE.md`](./REDDIRT_V2_MASTER_ARCHITECTURE.md) readiness doctrine).  
- **Update** `PROJECT_MASTER_MAP`, `DIVISION_MASTER_REGISTRY`, and affected ledgers **when a packet changes shipped reality** — not when aspiration alone changes.  
- **Never** “fix” drift by silently deleting peer docs; use consolidation decision records per [`REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md`](./REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md).

---

## Proof-required readiness

Labels such as **hosted-ready**, **operator-proven**, or **production-governed** require **artifacts**, not narrative:

- CLI outputs (`email:db:diagnose`, `email:no-send-scan`, `npm run check`, migrate status) **redacted** of secrets.  
- Operator notes in approved docs or develop_notes when humans perform irreversible steps.  
- Ledger / master map updates **in the same packet** that earned the proof.

**Local-only green checks** do **not** upgrade hosted deployment claims.

---

## RedDirt canonical root

- **Canonical product root:** `RedDirt/` (package `reddirt-site`, Next.js App Router, Prisma, PostgreSQL).  
- **Canonical documentation root for this policy:** `RedDirt/docs/` — **not** `SOSWebsite/docs/` at workspace root (different tree; conflation is a common failure mode).  
- **Canonical architecture data:** `RedDirt/data/architecture/` for registry JSON, scan snapshots, and matrix files committed with the lane.

---

## Public website boundary

**Current `sos-public` contents are placeholder material, but the clean public-site boundary remains protected.**

- **`sos-public/`** is the **separate** public Kelly Grappe for **Arkansas Secretary of State** app. Placeholder UI/copy may be **fully redesigned or replaced** **inside** `sos-public/` without relaxing boundary rules.  
- **Non-negotiable:** no Prisma, no `/admin`, no voter-file tooling, no ingest pipelines, no imports from `RedDirt/src/**`, and no backend campaign OS coupling **unless** Steve approves an explicit **integration packet**.  
- **RedDirt** remains the **campaign operating system / organizer engine**; it may **inform** public strategy through **human** workflows and **future explicit contracts** (see [`REDDIRT_V2_MASTER_ARCHITECTURE.md`](./REDDIRT_V2_MASTER_ARCHITECTURE.md) — Public website interface boundary).

Registry anchors: `publicWebsiteBoundaryNote` and layer `public_site_interface_boundary` in [`reddirt_v2_layer_registry.json`](../data/architecture/reddirt_v2_layer_registry.json); row `sos-public` in [`reddirt_v2_external_system_review_matrix.json`](../data/architecture/reddirt_v2_external_system_review_matrix.json).

---

## External system review rule

- The **external system review matrix** is the default **deny-import** and **deny-merge** table for sibling folders and providers.  
- Any proposal to set `canBeImportedIntoRedDirtWithoutApproval` to **true** or to merge a sibling into RedDirt requires **dependency audit**, **secret/env audit**, **schema collision audit**, **route collision audit**, **data mutation risk audit**, **deployment coupling audit**, and **rollback plan** — as listed per row in the matrix.  
- **A scanner classification is evidence of possible relationship, not permission to migrate.** Matrix rows and scan snapshots **describe** adjacency; they **do not** authorize refactors, moves, or imports.

---

## Scanner limitation rule

- **`scripts/reddirt-v2-architecture-scan.mjs`** is **read-only** on source trees: it uses directory listing and file reads; it writes **only** [`reddirt_v2_arch_scan_snapshot.json`](../data/architecture/reddirt_v2_arch_scan_snapshot.json) (or stdout with `--stdout-only`).  
- **Sibling folder names** in the snapshot are **directory labels**, not product approvals.  
- **Hashes and samples** in the snapshot are **drift hints**, not proof of correctness or completeness.  
- **Do not** treat absence of a path in a snapshot as “safe to delete” or “unused” — the scanner does **not** perform product archaeology or reachability analysis across the whole monorepo.

---

## AI assistance rule

- **AI (Cursor, ChatGPT, or in-app assistants)** may **draft** maps, registry updates, and code **under human review**.  
- **AI output** is **not** a source of truth above §**Source-of-truth hierarchy** unless merged by humans into the ranked artifacts with the same **proof** and **governance** rules as any other change.  
- **No** AI-generated “because the model said so” waivers for sends, migrations, secrets, or cross-lane imports.

---

## Human approval rule

- **Humans** (operators, Steve, counsel where engaged) own: production **send** classes, **import commits**, **hosted DB** target selection, **integration packets** across lanes, and **compliance-adjacent** wording.  
- **AI recommendations** remain **advisory** until explicit product and governance paths say otherwise in a **named packet**.  
- **Self-build / nightly automation** remains subordinate to [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) hard stops — no autonomous override of this policy.

---

## Future packet requirements

Every future **RedDirt** packet should:

1. **State** which registry `layers[].key` values it touches (if any).  
2. **Declare** allowed and forbidden paths (mirror patterns in [`reddirt_v2_cursor_roadmap_seed.json`](../data/architecture/reddirt_v2_cursor_roadmap_seed.json)).  
3. **List** proof commands (`npm run typecheck`, `npm run check`, `npm run email:no-send-scan`, hosted gates) appropriate to the slice.  
4. **Update** master map / division registry / ECC progress ledger when **reality** changes.  
5. **Run** `node scripts/validate-v2-arch-registry.mjs` when `reddirt_v2_layer_registry.json` changes.  
6. **Respect** this policy’s hierarchy — especially **scanner vs permission** and **public website boundary** — even when a slice is “docs only.”  
7. **Optional** — When using the self-build slice JSON contract ([`data/selfbuild/`](../data/selfbuild/), [`REDDIRT_SELFBUILD_SLICE_PROTOCOL.md`](./REDDIRT_SELFBUILD_SLICE_PROTOCOL.md)), keep slice objects aligned with registry `layers[].key` values and **never** treat validator success as permission to bypass sends, migrations, or cross-lane rules above.

---

## Generated artifacts (subordinate)

These **do not** override §**Source-of-truth hierarchy**:

- [`data/architecture/reddirt_v2_arch_scan_snapshot.json`](../data/architecture/reddirt_v2_arch_scan_snapshot.json)  
- [`develop_notes/REDDIRT_V2_ARCH_REGISTRY_1_0_REPORT.md`](../develop_notes/REDDIRT_V2_ARCH_REGISTRY_1_0_REPORT.md)  
- [`data/architecture/reddirt_v2_cursor_roadmap_seed.json`](../data/architecture/reddirt_v2_cursor_roadmap_seed.json)  
- [`data/selfbuild/reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json) and companion files under [`data/selfbuild/`](../data/selfbuild/) — slice packet contracts (**REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0**)

---

*Last updated: **REDDIRT-V2-ARCH-REGISTRY-1.0** + **REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0** cross-links — Deliverable E: source-of-truth policy.*
