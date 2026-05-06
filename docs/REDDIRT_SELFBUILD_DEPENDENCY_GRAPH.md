# REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0 — Self-build dependency graph

| Field | Value |
|-------|--------|
| **Lane** | `RedDirt/` only |
| **Status** | Planning / read-only architecture seed |
| **Graph JSON** | [`data/selfbuild/reddirt_selfbuild_dependency_graph.json`](../data/selfbuild/reddirt_selfbuild_dependency_graph.json) |
| **Layer matrix** | [`data/selfbuild/reddirt_selfbuild_layer_dependency_matrix.json`](../data/selfbuild/reddirt_selfbuild_layer_dependency_matrix.json) |
| **Known blockers** | [`data/selfbuild/reddirt_selfbuild_known_blockers.json`](../data/selfbuild/reddirt_selfbuild_known_blockers.json) |
| **Generator** | [`scripts/generate-selfbuild-dependency-graph.mjs`](../scripts/generate-selfbuild-dependency-graph.mjs) |
| **Validator** | [`scripts/validate-selfbuild-dependency-graph.mjs`](../scripts/validate-selfbuild-dependency-graph.mjs) |
| **Depends on** | [`REDDIRT_SELFBUILD_SLICE_PROTOCOL.md`](./REDDIRT_SELFBUILD_SLICE_PROTOCOL.md), [`REDDIRT_SELFBUILD_FORBIDDEN_PATH_GATES.md`](./REDDIRT_SELFBUILD_FORBIDDEN_PATH_GATES.md), [`REDDIRT_V2_MASTER_ARCHITECTURE.md`](./REDDIRT_V2_MASTER_ARCHITECTURE.md) |

---

## Purpose

Provide the **first RedDirt self-build dependency graph** so future slices can be **ordered** by prerequisites, **V2 layer** relationships, readiness gates, proof requirements, and safety boundaries. This packet **does not** ship product behavior—it seeds **JSON + scripts + docs** only.

---

## How dependency graph is generated

1. **Inputs (read-only):** [`reddirt_v2_layer_registry.json`](../data/architecture/reddirt_v2_layer_registry.json), [`reddirt_v2_cursor_roadmap_seed.json`](../data/architecture/reddirt_v2_cursor_roadmap_seed.json), [`reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json), [`reddirt_selfbuild_forbidden_paths.json`](../data/selfbuild/reddirt_selfbuild_forbidden_paths.json).  
2. **Command:** `cd RedDirt && node scripts/generate-selfbuild-dependency-graph.mjs`  
3. **Outputs:** Overwrites the three files under `data/selfbuild/` listed above. **No** `src/**` reads, **no** secrets, **no** `.env` access.  
4. **Human context:** Optional narrative docs (progress ledger, AI closeout, launch hardening, V2 master architecture) are **not** parsed by the generator; operators align narrative manually.

---

## Required nodes

The graph **`nodes[]`** must contain these **`id`** values (see validator):

`v2_arch_registry`, `selfbuild_slice_schema`, `selfbuild_forbidden_path_gates`, `selfbuild_dependency_graph`, `selfbuild_queue_generator`, `email_ai_intelligence_upgrade_stack`, `email_diagnostics_env`, `sendgrid_auth_check`, `sendgrid_sandbox_send`, `hosted_db_proof`, `live_send_proof`, `automation_worker_dryrun`, `production_contact_ingestion_proof`, `final_operational_verify`, `campaign_memory_foundation`, `daily_operational_intelligence`, `scheduling_intelligence`, `governed_ai_orchestration`, `public_site_interface_contract`.

Each node carries **`type`**, **`v2Layers`**, **`readinessState`**, **`riskLevel`**, **`sourceArtifacts`**, **`requiredBefore`**, **`blockedBy`**, **`proofRequired`**, and **`safeToQueue`**.

---

## Production gates

Root **`productionGates[]`** in the graph JSON summarizes non-negotiable ordering:

- Hosted DB proof **before** live send, production ingestion, and final operational verify (see roadmap `phase_1` **dependencyRule**).  
- **`email:no-send-scan`** and send-execution rails before claiming operator-proven mail.  
- Import staging / approve path before production contact ingestion proof.

---

## AI intelligence gates

**`email_ai_intelligence_upgrade_stack`** and **`governed_ai_orchestration`** nodes sit **after** registry + (for governed stack) **campaign memory foundation**; they remain **advisory** until doctrine and packets say otherwise. Blockers include **RAG / retrieval completeness** (see known blockers).

---

## Campaign memory gates

**`campaign_memory_foundation`** tracks roadmap **MEMORY-*** style work. Prerequisites include **`v2_arch_registry`**. Production gate: **manifest + licensing** before exposing production retrieval.

---

## Scheduling gates

**`scheduling_intelligence`** node captures calendar / scheduling roadmap slices; governance requires **human approval** for mutations that affect principals or public calendars.

---

## Public site boundary gates

**`public_site_interface_contract`** models **`REDDIRT-PUBLIC-SITE-INTERFACE-CONTRACT-1.0`**. The node sets **`permitsSosPublicMerge: false`** so validators can prove the graph **does not** authorize **`sos-public/`** merge or runtime coupling without Steve-approved integration work.

---

## Known blockers

Canonical list: [`reddirt_selfbuild_known_blockers.json`](../data/selfbuild/reddirt_selfbuild_known_blockers.json) — hosted DB proof not production-canonical until verified; live send blocked until Steve approval; automation activation blocked; production contact ingestion blocked; RAG / memory retrieval incomplete; public site contract not written; external consolidation blocked by matrix / decision records; deployment readiness separate from feature completeness.

---

## Validator usage

```bash
cd H:\SOSWebsite\RedDirt
node scripts/generate-selfbuild-dependency-graph.mjs
node scripts/validate-selfbuild-dependency-graph.mjs
```

Prerequisites: slice schema + forbidden paths seeds + V2 registry JSON must exist. Exit **0** on **STATUS: PASS**.

---

## Next recommended slices

1. **`REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0`** — turn this graph into queue-ready slice prompts (per roadmap seed).  
2. **`REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`** — first production-proof gate in ECC track when steered.  
3. **`REDDIRT-PUBLIC-SITE-INTERFACE-CONTRACT-1.0`** — formal handoff contract before any `sos-public` integration.

---

*Packet: **REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0**.*
