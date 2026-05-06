# REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0 — Self-build slice protocol

| Field | Value |
|-------|--------|
| **Lane** | `RedDirt/` only |
| **Status** | Active contract for machine-readable work packets |
| **Schema** | [`data/selfbuild/reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json) |
| **Example slice** | [`data/selfbuild/reddirt_selfbuild_slice_example.json`](../data/selfbuild/reddirt_selfbuild_slice_example.json) |
| **Return format (data)** | [`data/selfbuild/reddirt_selfbuild_required_return_format.json`](../data/selfbuild/reddirt_selfbuild_required_return_format.json) |
| **Return format (human)** | [`REDDIRT_SELFBUILD_RETURN_FORMAT.md`](./REDDIRT_SELFBUILD_RETURN_FORMAT.md) |
| **Validator** | [`scripts/validate-selfbuild-slice.mjs`](../scripts/validate-selfbuild-slice.mjs) — `cd RedDirt && node scripts/validate-selfbuild-slice.mjs` (optional: `path/to/slice.json`; prints **STATUS: PASS** or **STATUS: FAIL**) |
| **Forbidden path gates** | [`REDDIRT_SELFBUILD_FORBIDDEN_PATH_GATES.md`](./REDDIRT_SELFBUILD_FORBIDDEN_PATH_GATES.md) · [`scripts/validate-selfbuild-boundaries.mjs`](../scripts/validate-selfbuild-boundaries.mjs) · seeds under [`data/selfbuild/`](../data/selfbuild/) (`reddirt_selfbuild_forbidden_paths.json`, `reddirt_selfbuild_forbidden_actions.json`, `reddirt_selfbuild_boundary_profiles.json`) |
| **Dependency graph** | [`REDDIRT_SELFBUILD_DEPENDENCY_GRAPH.md`](./REDDIRT_SELFBUILD_DEPENDENCY_GRAPH.md) · [`scripts/generate-selfbuild-dependency-graph.mjs`](../scripts/generate-selfbuild-dependency-graph.mjs) · [`scripts/validate-selfbuild-dependency-graph.mjs`](../scripts/validate-selfbuild-dependency-graph.mjs) · [`data/selfbuild/reddirt_selfbuild_dependency_graph.json`](../data/selfbuild/reddirt_selfbuild_dependency_graph.json) (**REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0**) |
| **Queue generator** | [`REDDIRT_SELFBUILD_QUEUE_GENERATOR.md`](./REDDIRT_SELFBUILD_QUEUE_GENERATOR.md) · [`scripts/generate-selfbuild-queue.mjs`](../scripts/generate-selfbuild-queue.mjs) · [`scripts/validate-selfbuild-queue.mjs`](../scripts/validate-selfbuild-queue.mjs) · [`data/selfbuild/reddirt_selfbuild_queue.json`](../data/selfbuild/reddirt_selfbuild_queue.json) (**REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0**) |
| **Nightly / AUTO policy** | Subordinate to [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) |
| **V2 doctrine** | [`REDDIRT_V2_MASTER_ARCHITECTURE.md`](./REDDIRT_V2_MASTER_ARCHITECTURE.md) · [`REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md`](./REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md) |

---

## Purpose

This protocol defines how **RedDirt** work is packaged as **self-build slices**: machine-readable contracts that state scope, paths, proofs, governance, progress effects, and handoff shape **before** implementation. It does **not** replace code, Prisma, or operator judgment.

**AI remains advisory unless explicitly approved.** Slices and agents consume this protocol; they do not override send doctrine, migrations policy, or cross-lane rules.

---

## What a self-build slice is

A **self-build slice** is a named packet (usually mirrored as JSON) with:

- A stable **`sliceId`** (for example `REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`).
- Declared **V2 layers** from [`data/architecture/reddirt_v2_layer_registry.json`](../data/architecture/reddirt_v2_layer_registry.json).
- Explicit **`allowedPaths` / `forbiddenPaths` / `allowedReads` / `allowedWrites`** under `RedDirt/` (and explicit bans on sibling apps unless an integration packet exists).
- **`proofRequired`** and **`checksRequired`** that name observable evidence (commands, artifacts, operator steps)—never secret values in the contract or chat.
- **`governanceRules`**, **`humanApprovalGates`**, **`mustNotDo`**, and **`rollbackNotes`** so reviewers see risk and revert path up front.

A self-build slice may **plan or recommend**, but **may not bypass human approval** for anything that behaves like execution, production coupling, or policy override.

---

## What a self-build slice is not

- **Not** permission to run production sends, broadcast mail, Gmail send, or automation worker activation by default (see **No-send rules**).
- **Not** a blank check to edit `prisma/schema.prisma`, add migrations, or mutate hosted data unless the slice type and gates explicitly allow it and humans have approved.
- **Not** a substitute for **applied DB state** or **`src/**` runtime truth** in the source-of-truth stack—see [`REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md`](./REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md).
- **Not** authorization to merge **`sos-public/`** or other sibling products into RedDirt, or to import across lanes without Steve-approved integration packets.

**A slice may not mutate production data unless explicitly allowed and proven safe** in that slice’s `governanceRules`, `humanApprovalGates`, and `proofRequired`—and even then, evidence of safety belongs in the final report, not in assertions alone.

---

## Required slice fields

Every slice object **must** include all keys listed in `requiredSliceFields` in [`reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json):

`sliceId`, `title`, `sliceType`, `v2Layers`, `mission`, `whyNow`, `allowedPaths`, `forbiddenPaths`, `allowedReads`, `allowedWrites`, `requiredInputs`, `expectedOutputs`, `proofRequired`, `checksRequired`, `progressEffects`, `governanceRules`, `humanApprovalGates`, `mustNotDo`, `rollbackNotes`, `finalReturnFormat`.

Conventions:

- **`sliceType`** must be one of `allowedSliceTypes` in the schema (for example `production_proof`, `architecture`, `selfbuild`).
- **`v2Layers`** must use only `allowedV2LayerKeys`. Empty `v2Layers` is reserved for narrow docs/selfbuild slices; if used elsewhere, justify in `governanceRules`.
- **`finalReturnFormat`** lists report section keys; align with [`reddirt_selfbuild_required_return_format.json`](../data/selfbuild/reddirt_selfbuild_required_return_format.json) (`requiredReportFields` plus optional `standardReturnFormat` / `architectureReturnFormat` headings for Markdown).

---

## Allowed paths / forbidden paths

- **`allowedPaths`** — Glob or prefix paths under **`RedDirt/`** that implementers may touch for this slice. Be narrow; prefer explicit files over repo-wide `**` unless the slice is genuinely broad and still governed.
- **`forbiddenPaths`** — Explicit bans (for example `RedDirt/prisma/migrations/**`, sibling app roots, `.env`). If a path is forbidden here, it must **not** appear as writable under `allowedWrites`.
- **`allowedReads`** — Context reads (docs, architecture JSON, **variable names** from `.env.example`). Never treat “read `.env`” as a slice requirement in committed JSON.
- **`allowedWrites`** — Exact write scope. Expanding scope mid-flight without a new slice is a governance failure.

`validate-selfbuild-slice.mjs` does **not** verify that every path exists on disk or that a run stayed inside scope; humans and CI still enforce path discipline.

---

## Governance fields

Use the schema groupings:

| Group | Fields |
|-------|--------|
| Path contract | `allowedPaths`, `forbiddenPaths`, `allowedReads`, `allowedWrites` |
| Governance text | `governanceRules`, `humanApprovalGates`, `mustNotDo`, `rollbackNotes` |
| Proof | `proofRequired`, `checksRequired` |
| Outcomes | `expectedOutputs`, `progressEffects` |

**`globalForbiddenActions`** in the schema apply to **all** slices unless a steered, explicit, human-gated exception is documented in the slice and in the final report. **`mustNotDo`** adds slice-specific bans on top of that list.

---

## Proof requirements

- **`proofRequired`** lists **evidence types** (for example redacted CLI output, operator attestation, screenshot policy without tokens).
- Proofs must be **environment-honest**: local green does not prove hosted readiness unless the slice explicitly targets hosted proof and records how it was verified.
- Do not require pasting connection strings, API keys, or webhook secrets into tickets, chat, or commits.

---

## Checks and validation

- **`checksRequired`** names commands or human checks (for example `npm run check`, `npm run email:db:diagnose`, `npm run email:no-send-scan` when relevant).
- **Structural validation:** `cd RedDirt && node scripts/validate-selfbuild-slice.mjs` (defaults to `data/selfbuild/reddirt_selfbuild_slice_example.json`) or `node scripts/validate-selfbuild-slice.mjs path/to/slice.json`. The script prints **STATUS: PASS** or **STATUS: FAIL** and exits **0** / **1**. It requires non-empty `v2Layers`, non-empty `allowedPaths`, `forbiddenPaths`, `proofRequired`, `checksRequired`, and `mustNotDo`, and non-empty `finalReturnFormat`; for `production_proof`, `database_migration`, `automation_dryrun`, and `ai_intelligence`, every `globalForbiddenActions` string must appear inside some `mustNotDo` line (case-insensitive substring).
- **Boundary validation:** `cd RedDirt && node scripts/validate-selfbuild-boundaries.mjs` [optional `slice.json`] — cross-checks `allowedWrites` / `allowedPaths` against [`reddirt_selfbuild_forbidden_paths.json`](../data/selfbuild/reddirt_selfbuild_forbidden_paths.json) (see [`REDDIRT_SELFBUILD_FORBIDDEN_PATH_GATES.md`](./REDDIRT_SELFBUILD_FORBIDDEN_PATH_GATES.md)). Defaults **deny**; exemptions live in JSON `unlessSliceTypes` and governance reports.
- **Dependency graph:** `node scripts/generate-selfbuild-dependency-graph.mjs` then `node scripts/validate-selfbuild-dependency-graph.mjs` — refreshes [`reddirt_selfbuild_dependency_graph.json`](../data/selfbuild/reddirt_selfbuild_dependency_graph.json), layer matrix, and known blockers (see [`REDDIRT_SELFBUILD_DEPENDENCY_GRAPH.md`](./REDDIRT_SELFBUILD_DEPENDENCY_GRAPH.md)).
- **Queue:** `node scripts/generate-selfbuild-queue.mjs` then `node scripts/validate-selfbuild-queue.mjs` — writes [`reddirt_selfbuild_queue.json`](../data/selfbuild/reddirt_selfbuild_queue.json), status, and next recommendation (see [`REDDIRT_SELFBUILD_QUEUE_GENERATOR.md`](./REDDIRT_SELFBUILD_QUEUE_GENERATOR.md)); **does not execute** slices.
- **Registry validation** when architecture JSON changes: `node scripts/validate-v2-arch-registry.mjs`.

Validator success is **necessary**, not **sufficient**, for merge or production claims.

---

## Progress ledger rules

When a slice **changes shipped reality** (code, schema, operator-visible behavior), update the same packet’s human continuity artifacts as already required by RedDirt doctrine—for example [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md), [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md), and relevant ledgers.

For **Email Command Center** work, if the slice touches comms surfaces or rails, the handoff should include an **EMAIL COMMAND CENTER PROGRESS LEDGER** block per [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md) and [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md), in addition to any machine `requiredReportFields` JSON.

Slices declare **`progressEffects`** up front; the final report’s **`progressEffectsRealized`** must honestly match what actually landed.

---

## Human approval gates

- List named **roles, owners, or approval steps** in **`humanApprovalGates`** whenever the slice touches sends, imports, hosted DB targets, cross-lane integration, or compliance-adjacent wording.
- **A self-build slice may plan or recommend, but may not bypass human approval** for execution-class behavior. Cursor (or any agent) implements **inside** the slice; merge and production actions remain **human-governed** unless a future explicit product policy says otherwise—and that policy itself would ship as a governed packet.

---

## No-send rules

Unless a dedicated, steered **production** packet with explicit gates says otherwise:

- No **live sends**, **auto-send**, **Gmail send**, or **SendGrid broadcast** from self-build or routine implementation slices.
- Do not flip execution flags (for example **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`**) from a self-build packet.
- Prefer **`npm run email:no-send-scan`** (or equivalent) when a slice is meant to confirm send posture stayed intact.

These align with **`globalForbiddenActions`** in [`reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json).

---

## Public website boundary

**`sos-public/` is a protected clean public website boundary.** RedDirt remains the campaign OS; the public Kelly Grappe for Arkansas Secretary of State site lives in **`sos-public/`** with **no** Prisma, **no** `/admin`, **no** voter-file tooling, and **no** backend OS coupling unless Steve approves an explicit integration packet.

**Current sos-public contents are placeholder material, but the app boundary remains protected.** Placeholder copy or UI may be replaced **inside** `sos-public/` without relaxing import, secret, or cross-repo coupling rules.

---

## External system boundary

- Default **deny** imports and merges from sibling apps and providers per [`data/architecture/reddirt_v2_external_system_review_matrix.json`](../data/architecture/reddirt_v2_external_system_review_matrix.json).
- A scanner or roadmap row is **evidence of adjacency**, not **permission to migrate** (see [`REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md`](./REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md)).
- Any slice that proposes changing **`canBeImportedIntoRedDirtWithoutApproval`** or merging lanes needs dependency, secret, schema, route, data-mutation, deployment, and rollback audits as required by that matrix and counsel where engaged.

---

## Slice lifecycle

1. **Author** — Draft slice JSON (or equivalent script) with all required fields; pick `sliceType` and `v2Layers`.
2. **Validate** — Run `validate-selfbuild-slice.mjs` on the slice file.
3. **Approve** — Humans satisfy `humanApprovalGates` where listed.
4. **Execute** — Implement only inside `allowedWrites` / `allowedPaths`; respect `forbiddenPaths` and `globalForbiddenActions`.
5. **Prove** — Run `checksRequired`, collect `proofRequired` artifacts (redacted).
6. **Report** — Emit final response per [`REDDIRT_SELFBUILD_RETURN_FORMAT.md`](./REDDIRT_SELFBUILD_RETURN_FORMAT.md) and [`reddirt_selfbuild_required_return_format.json`](../data/selfbuild/reddirt_selfbuild_required_return_format.json); update ledgers if reality moved.
7. **Close** — Rollback notes remain valid if revert is needed.

Nightly or unattended runs remain inside [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) hard stops.

---

## Final report requirements

Machine handoffs should include every key in **`requiredReportFields`** in the return-format JSON. Markdown handoffs should follow **`standardReturnFormat`** or **`architectureReturnFormat`** in [`reddirt_selfbuild_required_return_format.json`](../data/selfbuild/reddirt_selfbuild_required_return_format.json) so ChatGPT ↔ Cursor loops stay diffable.

Minimum expectations:

- What was implemented and what was explicitly **not** done.
- Files touched; commands run with redacted summaries.
- Governance attestation (stayed in lane, no forbidden actions, approvals).
- Honest **remaining blockers** and **next safe slice** (or architecture profile: **NEXT RECOMMENDED SLICE**).

---

## Example slice

Canonical machine example (valid against the schema):

- **[`data/selfbuild/reddirt_selfbuild_slice_example.json`](../data/selfbuild/reddirt_selfbuild_slice_example.json)** — models **`REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`**: read-only hosted DB proof, admin gated **`/admin/workbench/email-command-center/readiness/hosted-db`** diagnostic, production-readiness reporting in develop notes, explicit **no sends**, **no migrations**, **no schema edits**, **no production data mutation**.

Use it as a reference for how **`production_proof`** slices declare narrow `allowedWrites` and heavy `forbiddenPaths`.

---

*Packet: **REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0**.*
