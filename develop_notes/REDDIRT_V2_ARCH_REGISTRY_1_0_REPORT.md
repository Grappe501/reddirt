# REDDIRT-V2-ARCH-REGISTRY-1.0 — Final implementation report

**Packet:** **REDDIRT-V2-ARCH-REGISTRY-1.0**  
**Lane:** `RedDirt/` only (no sibling-lane edits, no `sos-public/**` changes, no `package.json` validator wiring)  
**Date:** 2026-05-06  
**Mode:** Planning, documentation, and structured machine artifacts only — no production send behavior, no new migrations from this packet’s intent, no cross-lane imports.

---

## Slice summary

This slice establishes a **canonical V2 architecture registry** for RedDirt: twelve intelligence layers in JSON, an **external system review matrix** with explicit migration defaults and approval flags, a **Cursor roadmap seed** (phased candidate slices with allowed/forbidden paths and proof hooks), **human doctrine** in three markdown policies, a **read-only workspace scanner** plus **snapshot evidence**, and a **Node validator** that enforces parseability, required layer keys, `sos-public` boundary fields, roadmap slice ID completeness, and required legal/doctrine phrases in docs.

The slice **does not** deepen Email Command Center automation, AI orchestration, or hosted execution — it **maps** where those proofs belong (phase 1 onward) and locks **public website** posture in registry + matrix + policy.

---

## Files created

| Path | Role |
|------|------|
| `RedDirt/data/architecture/reddirt_v2_layer_registry.json` | Machine registry: `schemaVersion` 1.0, slice metadata, doctrine, twelve `layers[].key` entries, systems, boundary notes |
| `RedDirt/data/architecture/reddirt_v2_external_system_review_matrix.json` | External / sibling systems: `migrationDefault`, booleans, `requiredReviewBeforeAnyMigration` per row |
| `RedDirt/data/architecture/reddirt_v2_cursor_roadmap_seed.json` | Roadmap seed: `phase_0` … `phase_8`, candidate slices with goals and path rules |
| `RedDirt/data/architecture/reddirt_v2_arch_scan_snapshot.json` | Regenerable evidence from read-only scanner (`readOnlyProof` inside JSON) |
| `RedDirt/docs/REDDIRT_V2_MASTER_ARCHITECTURE.md` | Master architecture doctrine (human-readable, links to JSON) |
| `RedDirt/docs/REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md` | SoT stack, scanner vs migration rules, public boundary |
| `RedDirt/docs/REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md` | Consolidation / migration review checklist and decision-record pattern |
| `RedDirt/scripts/reddirt-v2-architecture-scan.mjs` | Read-only scan; writes only the snapshot path (or `--stdout-only`) |
| `RedDirt/scripts/validate-v2-arch-registry.mjs` | Deliverable G checks; **not** added to `package.json` (run manually) |
| `RedDirt/develop_notes/REDDIRT_V2_ARCH_REGISTRY_REPORT.md` | Short pointer: superseded by this `*_1_0_REPORT.md` |

---

## Files modified

Cross-links, orientation, and this closing report (no Prisma, no send paths, no `sos-public/**`):

| Path | Change |
|------|--------|
| `RedDirt/develop_notes/REDDIRT_V2_ARCH_REGISTRY_1_0_REPORT.md` | **Deliverable H:** final implementation report (required sections, next-slice recommendation) |
| `RedDirt/docs/PROJECT_MASTER_MAP.md` | Appendix **5d**: pointers to V2 master / SoT / consolidation / JSON artifacts, validator command, this report |
| `RedDirt/docs/campaign-email-command-center-master-plan.md` | Roll-up line to V2 registry + policies (**REDDIRT-V2-ARCH-REGISTRY-1.0**) |
| `RedDirt/docs/email-command-center-v2-agent-planning-harness.md` | Harness “read first” links to registry JSON, policies, this report, and `validate-v2-arch-registry.mjs` |

*Note: If your clone shows additional unstaged edits, treat them as local until committed; the slice design assumes the above are the intentional doc touch surfaces.*

---

## Inputs inspected

| Input | Use in this slice |
|-------|-------------------|
| `RedDirt/docs/**` | Primary narrative SoT for layers, ECC, readiness, governance language |
| `RedDirt/develop_notes/**` | Coordination and execution notes; report placement |
| `RedDirt/src/**`, `RedDirt/prisma/**`, `RedDirt/scripts/**` | Scanner **read-only** enumeration and path hints for registry `canonicalRedDirtAreas` / signals |
| `RedDirt/data/architecture/**` | Output home for registry JSON and scan snapshot |
| Workspace parent directory **names only** (via scanner) | Sibling ambiguity callouts in matrix and narrative; **not** used as permission to merge |
| `README.md`, `START_HERE_FOR_AI.md`, `CURSOR_CODEX_COORDINATION_PROTOCOL.md` (repo root) | Human orientation only; optional on disk per clone |
| Optional `H:\SOSWebsite\RedDirt_CampaignOS_SystemMap_*` | Optional context; registry `knownProofGaps` allows absence on clones |

---

## Architecture registry summary

- **Artifact:** `data/architecture/reddirt_v2_layer_registry.json` — `schemaVersion` **1.0**, `slice` **REDDIRT-V2-ARCH-REGISTRY-1.0**, `status` **architecture_registry_seed**.  
- **Doctrine:** `v2Doctrine` states the governed unified OS goal, queue-first / human-governed posture, and explicit **non-negotiables** (no secrets in artifacts, no silent cross-lane edits, clean `sos-public` surface).  
- **Twelve layers** (`layers[].key`): `communications_intelligence`, `campaign_memory`, `operational_intelligence`, `scheduling_intelligence`, `audience_relationship_intelligence`, `automation_intelligence`, `analytics_deliverability_intelligence`, `owned_media_content_intelligence`, `compliance_governance_safety`, `self_build_intelligence`, `deployment_environment_readiness`, `public_site_interface_boundary`.  
- **`publicWebsiteBoundaryNote`:** Encodes Kelly public site shell, disposable placeholder content, and **no** RedDirt merge into `sos-public`.  
- **Systems:** `systems[].layerKeys` ties PROJECT_MASTER_MAP style divisions to layers without collapsing L3 domain vocabulary (see master doc).

---

## External system boundary decisions

- **Artifact:** `data/architecture/reddirt_v2_external_system_review_matrix.json` — one row per reviewed external or sibling path pattern.  
- **Default posture:** Rows use conservative booleans (`canBeMovedWithoutApproval`, `canBeImportedIntoRedDirtWithoutApproval` typically **false**) and explicit **`requiredReviewBeforeAnyMigration`** audit list (dependencies, secrets, schema/route collisions, data mutation, deploy coupling, rollback).  
- **`migrationDefault` values** encode intent (for example `no_default_merge`, `exclude_from_prod_architecture`, and the dedicated **`do_not_merge_into_RedDirt`** for `sos-public`).  
- **Scanner / matrix listing** is **adjacency and classification evidence**, not approval to consolidate (repeated in SoT policy and validator-adjacent doc checks).

---

## Public website boundary decision

- **`sos-public/`** is the **clean public** Kelly Grappe for Arkansas Secretary of State **website shell**. Current design and copy are **placeholder** and may be replaced entirely.  
- **Must not:** import `RedDirt/src/**`, embed Prisma/admin/voter-file/ingest campaign OS, or merge RedDirt into the public app **without** an explicit Steve-approved integration packet.  
- **RedDirt** remains the campaign operating system; it may **inform** content and strategy through governed workflows and **future explicit contracts**, not by becoming the public runtime.  
- **Encoding:** `publicWebsiteBoundaryNote` + layer `public_site_interface_boundary` in the layer registry; row **`sos-public`** in the external matrix; sections in `REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md` and `REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md`.

---

## Future roadmap seed summary

- **Artifact:** `data/architecture/reddirt_v2_cursor_roadmap_seed.json` — `status` **roadmap_seed**, `schemaVersion` **1.0**.  
- **Phases:** `phase_0_architecture_registry` through **`phase_8`** (architecture registry, ECC proof, memory, operational intelligence, scheduling, audience, automation, analytics/content, compliance, self-build, consolidation, public interface contract).  
- **Candidate slices:** **33** `REDDIRT-*` slice IDs enumerated under `phases[].candidateSlices[]` (validator-enforced). Phase 1 explicitly orders **hosted DB proof before** live send and production ingestion proofs on hosted targets.  
- Each candidate slice carries **allowedPaths**, **forbiddenPaths**, **proofRequired**, **mustNotDo**, and **expectedOutputs** as a **seed** for future Cursor packets (not a commitment to build every slice immediately).

---

## Validation results

### Registry validator (required)

From `RedDirt/`:

```bash
node scripts/validate-v2-arch-registry.mjs
```

**Outcome:** **PASS** — exit code **0**, **`Result: PASS (all checks OK)`**.

Checks include: required JSON and doc paths exist; JSON parses; registry schema/slice and twelve layer keys + field shapes; matrix includes **`sos-public`** with `migrationDefault: "do_not_merge_into_RedDirt"`, `canBeMovedWithoutApproval: false`, `canBeImportedIntoRedDirtWithoutApproval: false`; roadmap `schemaVersion`, `roadmap_seed` status, and all **33** required slice IDs; union of the three V2 policy docs contains the phrases **“scanner classification is evidence of possible relationship, not permission to migrate”** and **“current sos-public contents are placeholder”** (normalized match).

### Optional project checks (`package.json` scripts; no edits to `package.json`)

Recorded **2026-05-06** from `H:\SOSWebsite\RedDirt` (scripts already defined: `lint`, `typecheck`, `build`):

| Command | Exit | Notes |
|---------|------|--------|
| `npm run lint` | **0** | **Warnings only** (pre-existing): unused vars/imports across admin, email-command-center, social, calendar, libs; `@next/next/no-img-element` in several components; one `react-hooks/exhaustive-deps` warning. **Not introduced by V2 registry artifacts.** |
| `npm run typecheck` | **0** | Clean (`tsc --noEmit`). |
| `npm run build` | **0** | `next build` completed; same ESLint **warnings** as above during “Linting and checking validity of types …” phase. **No broad repair attempted** per slice rules. |

---

## Risks / limitations

| Risk / limitation | Mitigation |
|-------------------|------------|
| Registry JSON can **drift** from code reality if not updated after large refactors | Re-run scanner; update `currentSignals` / routes in registry when slices land; run validator after registry edits |
| **Sibling folders** at workspace root remain **ambiguous** until owner-mapped | Matrix rows + consolidation policy require explicit decision records before any merge |
| **Scan snapshot** is a point-in-time file list, not security audit | Use for orientation; pair with real secret scans and dependency review for migrations |
| **Roadmap seed** is planning structure, not scheduling commitment | Phase ordering still requires human/operator gates (especially ECC and hosted DB) |
| Validator is **not** in `npm scripts` | Easy to forget locally; consider a future **CI-only** invoke (without `package.json` script) if Steve approves |

**Ambiguous workspace names** (from parent listing — examples only): Kelly media, campaign information for ingestion, brand-audit, volunteerPage, stand-up-arkansas, arkansas_civic_university, arkansas_civics, ACU lanes, `_tmp_*`, tools, root `docs/`, large system map exports, diagnostic text artifacts, zip bundles, dist briefings — treat as **external** until mapped.

---

## Next recommended slice

**Slice ID:** **REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0**

**Reason:** The Email Command Center is close to production-governed readiness, but V2 should **not** deepen automation or AI orchestration until **hosted DB proof** and **operational verification** are documented on the real Kelly-Grappe-App database chain. That slice is already the **first** candidate under `phase_1_email_command_center_proof` in `reddirt_v2_cursor_roadmap_seed.json`, with explicit `proofRequired` hooks (migrate status/deploy on hosted, contact import gate, no-send scan, `npm run check`, redacted operator logs).

---

## Supersedes

Earlier stub: [`REDDIRT_V2_ARCH_REGISTRY_REPORT.md`](./REDDIRT_V2_ARCH_REGISTRY_REPORT.md) — **this file** is the canonical **final implementation report** for **REDDIRT-V2-ARCH-REGISTRY-1.0**.

---

*End — **REDDIRT-V2-ARCH-REGISTRY-1.0** (Deliverable H).*
