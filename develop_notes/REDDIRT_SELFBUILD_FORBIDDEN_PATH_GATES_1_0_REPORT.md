# REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0 — report

## Slice summary

**Packet:** **REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0**. Adds machine-readable forbidden **path** and **action** seeds plus `validate-selfbuild-boundaries.mjs` to cross-check slice `allowedWrites` / `allowedPaths` against sibling apps, public site roots, secrets, send surfaces, and migrations. Documentation and continuity-map links only—no product routes, Prisma, migrations, or `.env` changes.

## Files created

| Path |
|------|
| `data/selfbuild/reddirt_selfbuild_forbidden_paths.json` |
| `data/selfbuild/reddirt_selfbuild_forbidden_actions.json` |
| `data/selfbuild/reddirt_selfbuild_boundary_profiles.json` |
| `scripts/validate-selfbuild-boundaries.mjs` |
| `docs/REDDIRT_SELFBUILD_FORBIDDEN_PATH_GATES.md` |

## Files modified

| Path |
|------|
| `docs/REDDIRT_SELFBUILD_SLICE_PROTOCOL.md` — boundary row + Checks bullet |
| `docs/PROJECT_MASTER_MAP.md` — forbidden gates line |
| `docs/THREAD_HANDOFF_MASTER_MAP.md` — forbidden gates line |

## Schema summary (boundary seeds)

- **`reddirt_selfbuild_forbidden_paths.json`** — `globalForbiddenPathPatterns`, `conditionalForbiddenPathPatterns` (with `unlessSliceTypes`), protected path groupings, secret/send/migration pattern lists, `allowedDocumentationPaths`.  
- **`reddirt_selfbuild_forbidden_actions.json`** — `globalForbiddenActionPhrases` aligned with slice schema `globalForbiddenActions`.  
- **`reddirt_selfbuild_boundary_profiles.json`** — named profiles and `defaultProfileId` for future profile-aware automation.

## Validator behavior

[`scripts/validate-selfbuild-boundaries.mjs`](../scripts/validate-selfbuild-boundaries.mjs): verifies prerequisites (`reddirt_selfbuild_slice_schema.json`, `validate-selfbuild-slice.mjs`, three seeds), validates seed shapes, then checks the target slice (default `reddirt_selfbuild_slice_example.json`) for global and conditional path violations, bare `.env` writes, secret substrings on writes, and doc-like slice send/migration write patterns. Prints **STATUS: PASS** / **STATUS: FAIL**; exit **0** / **1**.

## Example slice summary

Default [`reddirt_selfbuild_slice_example.json`](../data/selfbuild/reddirt_selfbuild_slice_example.json) (**`REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`**) passes boundary validation: no `sos-public/` or sibling roots in allowed paths/writes; no prisma write paths under `production_proof`.

## Governance status

Lane **RedDirt/** only. **Override rules are documentation-first; validators default deny.** **No-send rules cannot be waived by AI.** No `package.json`, Netlify, Prisma, or `.env` edits. Human approval for any future exemption must be recorded in the slice completion report and reflected in JSON seeds in the same steered packet.

## Checks

- `node scripts/validate-selfbuild-slice.mjs`
- `node scripts/validate-selfbuild-boundaries.mjs`
- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`

## Risks / limitations

- Boundary validator does not diff `git` or scan the working tree—only the **declared** slice JSON.  
- `unlessSliceTypes` must stay aligned with real governance when new slice types appear.  
- Doc-like send/migration guards reduce false positives for `ui`/`api`/`production_proof` but do not replace human review of those slices.

## Next recommended slice

**REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0**

---

*End of report — **REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0**.*
