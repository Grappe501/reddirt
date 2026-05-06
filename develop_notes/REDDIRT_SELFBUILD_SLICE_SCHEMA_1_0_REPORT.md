# REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0 — report

## Slice summary

**Packet:** **REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0** (self-build foundation). Establishes machine-readable slice contracts under `data/selfbuild/`, human protocol and return-format docs, a slice validator script, and cross-links in V2 and continuity maps. No product routes, Prisma, or env changes in this pass.

## Files created

| Path |
|------|
| `data/selfbuild/reddirt_selfbuild_slice_schema.json` |
| `data/selfbuild/reddirt_selfbuild_slice_example.json` |
| `data/selfbuild/reddirt_selfbuild_required_return_format.json` |
| `docs/REDDIRT_SELFBUILD_SLICE_PROTOCOL.md` |
| `docs/REDDIRT_SELFBUILD_RETURN_FORMAT.md` |
| `scripts/validate-selfbuild-slice.mjs` |

## Files modified

| Path |
|------|
| `docs/REDDIRT_V2_MASTER_ARCHITECTURE.md` — self-build contract row + future-packet validator link |
| `docs/REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md` — hierarchy §10, table, generated artifacts, future packet bullet |
| `docs/PROJECT_MASTER_MAP.md` — self-build machine contract line (schema + protocol + script) |
| `docs/THREAD_HANDOFF_MASTER_MAP.md` — self-build contract line (schema + protocol + script) |
| `data/selfbuild/reddirt_selfbuild_slice_example.json` — example slice + `mustNotDo` coverage for validator |
| `scripts/validate-selfbuild-slice.mjs` — Deliverable F behavior (PASS/FAIL, stricter slice rules) |

## Schema summary

[`reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json) defines `requiredSliceFields`, path and governance groups, `allowedSliceTypes`, readiness and risk enums, `globalForbiddenActions`, `globalSafetyRules`, `validationRules`, and `allowedV2LayerKeys` aligned with `reddirt_v2_layer_registry.json`. [`reddirt_selfbuild_required_return_format.json`](../data/selfbuild/reddirt_selfbuild_required_return_format.json) defines `requiredReportFields` plus `standardReturnFormat` and `architectureReturnFormat` heading orders.

## Validator behavior

[`scripts/validate-selfbuild-slice.mjs`](../scripts/validate-selfbuild-slice.mjs):

- Default slice file when no argument: `data/selfbuild/reddirt_selfbuild_slice_example.json`.
- Loads `data/selfbuild/reddirt_selfbuild_slice_schema.json` and checks schema shape and `reddirt_selfbuild_required_return_format.json` alignment with `requiredReportFields`.
- On the slice: all required keys; `sliceType` allowed; **non-empty `v2Layers`**; `allowedPaths`, `forbiddenPaths`, `proofRequired`, `checksRequired`, `mustNotDo` are **non-empty** string arrays; **`finalReturnFormat` non-empty**; for `production_proof`, `database_migration`, `automation_dryrun`, and `ai_intelligence`, every `globalForbiddenActions` entry must appear as a substring (case-insensitive) somewhere in `mustNotDo`.
- Prints a **STATUS: PASS** or **STATUS: FAIL** summary (schema/slice errors listed on failure). Exit code **0** / **1**.

Manual run: `cd H:\SOSWebsite\RedDirt` then `node scripts/validate-selfbuild-slice.mjs`.

## Example slice summary

[`reddirt_selfbuild_slice_example.json`](../data/selfbuild/reddirt_selfbuild_slice_example.json) models **`REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`**: read-only hosted DB proof, admin **`/admin/workbench/email-command-center/readiness/hosted-db`**, develop-notes readiness output, explicit bans on sends, migrations, schema edits, and production mutation; `mustNotDo` strings cover all schema `globalForbiddenActions` for `production_proof` validation.

## Governance status

Lane **RedDirt/** only. No `package.json` edits. No `.env` reads or secret output in this report. AI and agents remain advisory; validator success does not authorize sends, migrations, or cross-lane work.

## Checks

- `node scripts/validate-selfbuild-slice.mjs` — required after script or example changes.
- `npm run typecheck` — required quality gate for this lane.
- `npm run check` — lint + typecheck + build.
- `npm run email:no-send-scan` — confirm send posture unchanged when comms-adjacent work ships in broader slices; run here as lane hygiene after validator/doc edits.

## Risks / limitations

- Validator does not prove files on `allowedPaths` exist or that a run stayed inside scope.
- `mustNotDo` substring rule can be satisfied by prose but does not prove operator behavior.
- Other slice JSON files must meet stricter rules than early drafts may have used (non-empty `v2Layers`, non-empty path/proof arrays).

## Next recommended slice

**REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0** — extend self-build tooling or docs so forbidden paths and cross-lane boundaries are harder to violate mechanically (per roadmap seed).

---

*End of report — **REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0**.*
