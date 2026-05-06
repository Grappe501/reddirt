# REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0 — Self-build queue generator

| Field | Value |
|-------|--------|
| **Lane** | `RedDirt/` only |
| **Status** | Planning artifact — queue JSON only |
| **Queue** | [`data/selfbuild/reddirt_selfbuild_queue.json`](../data/selfbuild/reddirt_selfbuild_queue.json) |
| **Status snapshot** | [`data/selfbuild/reddirt_selfbuild_queue_status.json`](../data/selfbuild/reddirt_selfbuild_queue_status.json) |
| **Next recommendation** | [`data/selfbuild/reddirt_selfbuild_next_recommendation.json`](../data/selfbuild/reddirt_selfbuild_next_recommendation.json) |
| **Generator** | [`scripts/generate-selfbuild-queue.mjs`](../scripts/generate-selfbuild-queue.mjs) |
| **Validator** | [`scripts/validate-selfbuild-queue.mjs`](../scripts/validate-selfbuild-queue.mjs) |
| **Depends on** | Slice schema, forbidden gates, dependency graph, roadmap seed |

---

## Purpose

Produce the **first RedDirt self-build queue**: an **ordered** list of future build slices derived from the **V2 roadmap seed**, **dependency graph**, **slice schema**, and **forbidden-path gates**. The queue supports planning and operator steering; it **does not** execute work.

---

## What the queue generator does

- Reads **`reddirt_v2_cursor_roadmap_seed.json`**, **`reddirt_selfbuild_dependency_graph.json`**, **`reddirt_selfbuild_known_blockers.json`**, **`reddirt_selfbuild_slice_schema.json`**, boundary JSON, and **`docs/campaign-email-command-center-progress-ledger.md`** (path existence prerequisite).  
- Writes **`reddirt_selfbuild_queue.json`**, **`reddirt_selfbuild_queue_status.json`**, and **`reddirt_selfbuild_next_recommendation.json`** only.  
- Preserves **blocked** flags for slices that must not start until hosted proof, Steve approval, or dry-run rules clear.  
- Pins the **first five** queue items in canonical order (self-build foundation through hosted DB proof).

---

## What the queue generator does not do

- **No slice execution** — no Cursor runs, no merges, no deploys.  
- **No product behavior** — does not read or write `src/**` except as path strings inside JSON.  
- **No secrets** — does not open `.env` or print connection strings.  
- **No automation activation**, **no sends**, **no contact import**.

---

## Queue item shape

Each **`items[]`** entry includes:

`queueId`, `sliceId`, `phase`, `title`, `priority`, `riskLevel`, `readinessState`, `v2Layers`, `blocked`, `blockedBy`, `requiredBeforeStart`, `allowedPaths`, `forbiddenPaths`, `proofRequired`, `checksRequired`, `mustNotDo`, `expectedOutputs`, `finalReturnFormat`.

**`mustNotDo`** and **`checksRequired`** must be **non-empty** arrays (enforced by **`validate-selfbuild-queue.mjs`**).

---

## Status model

**`reddirt_selfbuild_queue_status.json`** aggregates:

`totalQueueItems`, `completed`, `ready`, `blocked`, `highRisk`, `productionProofItems`, `nextRecommendedSlice`, `blockedProductionGates`, `currentLane`.

Completion counts for the first four foundation slices are **derived in the generator** from evidence that those packets shipped (static mapping in the generator seed until a future packet wires live status).

---

## Blocked item rules

- Any item with **`blocked: true`** must include a non-empty **`blockedBy`** list (validator).  
- **`REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0`** stays **`blocked: true`** until **`REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`** is satisfied and Steve approval is recorded.  
- **`REDDIRT-AUTOMATION-WORKER-DRYRUN-1.0`** remains blocked while **automation activation** is globally forbidden outside explicit packets.

---

## Production-proof ordering

Queue order places **hosted DB proof** before **live send**, **automation dry-run**, and other **phase_1** proofs. **`validate-selfbuild-queue.mjs`** asserts **`REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0`** appears **after** **`REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`** and lists hosted proof in **`requiredBeforeStart`**.

---

## Next recommendation logic

**`reddirt_selfbuild_next_recommendation.json`** names **`REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`** as **`nextRecommendedSlice`** with **`safeToStart: true`** when the self-build foundation queue items are complete—**still** requiring human checks and **no live send** during that proof slice.

---

## Validator usage

```bash
cd H:\SOSWebsite\RedDirt
node scripts/generate-selfbuild-queue.mjs
node scripts/validate-selfbuild-queue.mjs
```

Run after dependency graph and boundaries validators when regenerating.

---

## Operator workflow

1. Regenerate the queue after registry/graph updates.  
2. Run **`validate-selfbuild-queue.mjs`**.  
3. Take **`nextRecommendedSlice`** as the default Cursor script target unless **`blockedProductionGates`** or the progress ledger says otherwise.  
4. Record human approvals in the slice handoff per **`REDDIRT_SELFBUILD_RETURN_FORMAT.md`**.

---

## Future expansion

- Wire **live** completion state from develop_notes or CI instead of static counts.  
- Add more roadmap phases and **MEMORY-*** items as separate queue waves.  
- Optional export to Markdown for **AUTO_BUILD** nightly queue consumption (separate packet).

---

*Packet: **REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0**.*
