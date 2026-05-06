# REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0 — report

## Slice summary

**Packet:** **REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0**. First machine-readable **dependency graph**, **V2 layer dependency matrix**, and **known blockers** list for ordering future self-build slices. Generator and validators only; no product routes, Prisma, migrations, or env changes.

## Files created

| Path |
|------|
| `data/selfbuild/reddirt_selfbuild_dependency_graph.json` |
| `data/selfbuild/reddirt_selfbuild_layer_dependency_matrix.json` |
| `data/selfbuild/reddirt_selfbuild_known_blockers.json` |
| `scripts/generate-selfbuild-dependency-graph.mjs` |
| `scripts/validate-selfbuild-dependency-graph.mjs` |
| `docs/REDDIRT_SELFBUILD_DEPENDENCY_GRAPH.md` |

## Files modified

| Path |
|------|
| `docs/REDDIRT_SELFBUILD_SLICE_PROTOCOL.md` |
| `docs/PROJECT_MASTER_MAP.md` |
| `docs/THREAD_HANDOFF_MASTER_MAP.md` |

## Schema summary

- **Graph** — `nodes`, `edges`, `blockedNodes`, `productionGates`, `governanceGates`, `recommendedExecutionOrder`; nineteen required node ids including self-build chain, ECC proof chain, memory, AI orchestration, and public site contract.  
- **Layer matrix** — twelve V2 `layers[].key` rows with `prerequisites`, `blockers`, `firstSafeSlice`, `productionGate`, `humanApprovalGates`, `currentReadinessState`.  
- **Known blockers** — eight blocker objects with `affectedNodes` cross-links.

## Generator behavior

Reads registry + roadmap + selfbuild schema + forbidden paths; exits **1** if prerequisites missing. Writes only the three JSON files under `data/selfbuild/`. Does not read `.env` or parse optional narrative docs.

## Validator behavior

Validates graph shape, required nodes, `production_proof` ordering vs `recommendedExecutionOrder`, **`live_send_proof`** requires **`hosted_db_proof`** + Steve gate + edge, **`automation_worker_dryrun`** activation documentation, **`public_site_interface_contract`** `permitsSosPublicMerge !== true`, and layer matrix completeness.

## Governance status

RedDirt lane only. No `package.json` edits. No secrets in JSON. Graph is **planning truth**, not runtime permission to bypass sends or cross-lane rules.

## Checks

- `node scripts/generate-selfbuild-dependency-graph.mjs`
- `node scripts/validate-selfbuild-dependency-graph.mjs`
- `node scripts/validate-selfbuild-slice.mjs`
- `node scripts/validate-selfbuild-boundaries.mjs`
- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`

## Risks / limitations

- Generator embeds static node logic; roadmap evolution requires re-running generator or manual JSON edits in a steered packet.  
- Optional docs listed in the Cursor script were not machine-parsed; narrative alignment is manual.  
- `firstSafeSlice` strings in the matrix are illustrative packet ids, not automated links to roadmap JSON.

## Next recommended slice

**REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0**

---

*End of report — **REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0**.*
