# REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0 — Forbidden path and action gates

| Field | Value |
|-------|--------|
| **Lane** | `RedDirt/` only |
| **Status** | Active boundary seed + validator |
| **Path patterns** | [`data/selfbuild/reddirt_selfbuild_forbidden_paths.json`](../data/selfbuild/reddirt_selfbuild_forbidden_paths.json) |
| **Action phrases** | [`data/selfbuild/reddirt_selfbuild_forbidden_actions.json`](../data/selfbuild/reddirt_selfbuild_forbidden_actions.json) |
| **Boundary profiles** | [`data/selfbuild/reddirt_selfbuild_boundary_profiles.json`](../data/selfbuild/reddirt_selfbuild_boundary_profiles.json) |
| **Validator** | [`scripts/validate-selfbuild-boundaries.mjs`](../scripts/validate-selfbuild-boundaries.mjs) — `cd RedDirt && node scripts/validate-selfbuild-boundaries.mjs` [optional `slice.json`] |
| **Depends on** | [`REDDIRT_SELFBUILD_SLICE_PROTOCOL.md`](./REDDIRT_SELFBUILD_SLICE_PROTOCOL.md), [`data/selfbuild/reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json), [`scripts/validate-selfbuild-slice.mjs`](../scripts/validate-selfbuild-slice.mjs) |

---

## Purpose

Provide **machine-checkable** seeds that describe **forbidden paths**, **protected boundaries**, and **forbidden action phrases** so self-build slices cannot casually widen scope into sibling apps, the public site, secrets, send execution, or migrations without an **explicit** slice contract and human process.

**Override rules are documentation only; validators default to deny** unless the slice JSON and governance process explicitly describe permission—and even then, `validate-selfbuild-boundaries.mjs` only relaxes checks where the JSON seeds encode an exemption (for example `unlessSliceTypes` on a conditional path rule). Anything beyond that requires **human approval recorded in the slice completion report** and usually a follow-on packet that updates these seeds.

**No-send rules cannot be waived by AI.** Models may not reinterpret gates; operators and named approvers own send posture.

---

## Boundary profiles

[`reddirt_selfbuild_boundary_profiles.json`](../data/selfbuild/reddirt_selfbuild_boundary_profiles.json) lists named profiles (for example **`strict_red_dirt_selfbuild`**, **`documentation_only`**, **`database_migration_packet`**). Each profile documents which checks apply and which conditional rule ids may be exempt when a future selector wires profile id into automation.

Today, `validate-selfbuild-boundaries.mjs` applies **global** and **conditional** rules from `reddirt_selfbuild_forbidden_paths.json` directly; **`unlessSliceTypes`** on each conditional rule is the machine exemption hook (for example **`database_migration`** may touch `prisma/schema.prisma` when that rule lists it).

---

## Forbidden paths

[`reddirt_selfbuild_forbidden_paths.json`](../data/selfbuild/reddirt_selfbuild_forbidden_paths.json):

- **`globalForbiddenPathPatterns`** — Substring matches against normalized `allowedWrites` and `allowedPaths` (always **FAIL** if matched).
- **`conditionalForbiddenPathPatterns`** — Rule objects with `unlessSliceTypes` and `patterns`; enforced when the slice’s `sliceType` is **not** in the exemption list.
- **`protectedPublicSitePaths`** and **`protectedSiblingAppPaths`** — Human-readable groupings mirrored into globals; keep lists aligned when adding new lanes.
- **`allowedDocumentationPaths`** — Prefix hints for where doc-only slices are **expected** to write; they do **not** relax global sibling or secret rules.

---

## Forbidden actions

[`reddirt_selfbuild_forbidden_actions.json`](../data/selfbuild/reddirt_selfbuild_forbidden_actions.json) mirrors **`globalForbiddenActions`** from [`reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json) and carries narrative **`conditionalForbiddenActionRules`**. Structural enforcement of `mustNotDo` coverage for high-risk slice types remains in [`validate-selfbuild-slice.mjs`](../scripts/validate-selfbuild-slice.mjs); this file is the **canonical phrase list** for docs and future tooling.

---

## Public website boundary

**`sos-public/` is a protected clean public website boundary.** Any `allowedPaths` or `allowedWrites` entry that points into `sos-public/` or parent-relative `../sos-public/` must **FAIL** validation unless governance is revised in a Steve-approved integration packet **and** these JSON seeds are updated in that same steered slice (do not “paper over” in chat alone).

**Current sos-public contents are placeholder material, but the app boundary remains protected.**

---

## Sibling app boundary

Paths into **`../ajax/`**, **`../phatlip/`**, **`../countyWorkbench/`**, and similar monorepo escapes are **default deny** on slice `allowedPaths` and `allowedWrites`. RedDirt work must stay in **`RedDirt/`** unless a named integration packet and seed update say otherwise.

---

## Send and automation gates

**`protectedSendExecutionPatterns`** in the paths JSON lists substrings that must not appear in **`allowedWrites`** for **documentation-like** slice types (`documentation`, `architecture`, `selfbuild`, `consolidation_review`, `readiness`). Other slice types may still list governed comms paths when a packet explicitly owns that scope—human approval must still be recorded in the slice report.

Automation activation and worker starts are forbidden actions; path seeds complement [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md) hard stops.

---

## Secret handling

Validators treat **bare `.env` file targets** in `allowedWrites` as **FAIL**, and flag configured **`protectedSecretPatterns`** (for example `.env.production`) in writes. Do not paste secret values into slice JSON, reports, or chat—**variable names only** in `allowedReads` prose.

---

## Migration gates

**`protectedMigrationPatterns`** block migration-like **writes** for documentation-like slice types. **`database_migration`** slices are exempt from the **`prisma_schema_and_migrations`** conditional path rule via `unlessSliceTypes` so Prisma work can exist only when the slice declares that type and fills **`humanApprovalGates`**.

---

## Validator usage

```bash
cd H:\SOSWebsite\RedDirt
node scripts/validate-selfbuild-boundaries.mjs
node scripts/validate-selfbuild-boundaries.mjs data/selfbuild/reddirt_selfbuild_slice_example.json
```

Run after [`validate-selfbuild-slice.mjs`](../scripts/validate-selfbuild-slice.mjs). Exit **0** on **STATUS: PASS**, **1** on **STATUS: FAIL**.

---

## Failure examples

- **`allowedWrites`** contains `sos-public/...` → hits **`globalForbiddenPathPatterns`**.  
- **`sliceType`**: `documentation` and **`allowedWrites`** lists `.../send-execution/...` → hits **send** doc-like guard.  
- **`sliceType`**: `selfbuild` and **`allowedWrites`** includes `prisma/migrations/foo.sql` → hits **conditional** prisma rule.  
- **`allowedWrites`** lists `RedDirt/.env` → **bare env** guard.

---

## Human approval override rules

1. **Overrides are governance + documentation first** — record approver, date, and scope in the **slice completion report** and, when reality changes, in [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) or the relevant ledger.  
2. **Machine seeds** — durable exemptions belong in `reddirt_selfbuild_forbidden_paths.json` / `reddirt_selfbuild_boundary_profiles.json` as `unlessSliceTypes` or new conditional rules, shipped in the **same** steered packet as the code.  
3. **AI cannot waive no-send or cross-lane rules** in chat; only humans change doctrine, seeds, and merge gates.  
4. **Validators default deny** — absence of a FAIL does not prove safety on hosted or production; it proves the **slice JSON** did not advertise forbidden paths for the checked profile.

---

*Packet: **REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0**.*
