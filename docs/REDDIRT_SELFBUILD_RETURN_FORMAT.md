# RedDirt self-build — required return format

**Packet:** **REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0**  
**Machine contract:** [`data/selfbuild/reddirt_selfbuild_required_return_format.json`](../data/selfbuild/reddirt_selfbuild_required_return_format.json)  
**Slice protocol:** [`REDDIRT_SELFBUILD_SLICE_PROTOCOL.md`](./REDDIRT_SELFBUILD_SLICE_PROTOCOL.md)  
**Thread handoff (legacy headings):** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md)

This document explains the **required packet return format** and how **future Cursor responses** (and other agents) should **report status** when a self-build slice finishes: what must be true, what to include, and how machine JSON and human Markdown relate.

---

## Why two shapes exist

1. **Machine keys** (`requiredReportFields` in JSON) — stable identifiers for validators, queue tooling, and structured logs. A completed handoff should be **expressible as one JSON object** with every required key present.
2. **Markdown headings** (`standardReturnFormat` and `architectureReturnFormat` in JSON) — the same facts, ordered for **ChatGPT ↔ Cursor** paste-back and for diff-friendly review in-repo.

Cursor should treat both as **one report**: same truth, two serializations. If you only paste Markdown, a human or script can still map content into the JSON keys below.

---

## How Cursor should report status

Use these rules on every slice completion:

1. **State the lane and packet first** — `activeLane` (for RedDirt work: `RedDirt/`) and `sliceId` must match the script you executed.
2. **Separate fact from aspiration** — “Implemented” means merged or ready-to-merge code/docs in scope; “Safe now” means what is **proven** by checks in this pass, not marketing readiness.
3. **Commands are evidence** — For each meaningful command, record **command**, **cwd**, **exitCode**, and a **redacted summary** (no keys, tokens, URLs with embedded secrets, or `.env` contents). If a command was not run, say so under **CHECKS** / `commandsRunAndResults` with reason (blocked, out of scope, env missing).
4. **Governance is explicit** — State whether you stayed inside `allowedPaths` / `allowedWrites`, whether any `globalForbiddenActions` were touched (they should be **none**), and whether human gates from the slice were satisfied or deferred.
5. **Blockers are honest** — `remainingBlockers` / **WHAT REMAINS BLOCKED** may be `[]` only when you genuinely know of none; otherwise list concrete dependencies (hosted proof missing, approval pending, flaky test, etc.).
6. **Next step is single-threaded** — `nextSafeSliceRecommendation` / **NEXT RECOMMENDED SLICE** should name **one** default follow-on packet id or one line explaining why the queue should hold.

**AI and automation output in the report remain advisory** unless a human has explicitly approved the underlying change; the report describes what was **done in the repo**, not what the model wishes were true.

---

## Machine contract: `requiredReportFields`

These keys are **required** on the JSON completion object (see [`reddirt_selfbuild_required_return_format.json`](../data/selfbuild/reddirt_selfbuild_required_return_format.json) and [`reddirt_selfbuild_slice_schema.json`](../data/selfbuild/reddirt_selfbuild_slice_schema.json)).

| Key | Role |
|-----|------|
| `activeLane` | Product root (e.g. `RedDirt/`). |
| `sliceId` | Echo the packet id (e.g. `REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0`). |
| `filesChanged` | Array of repo-relative paths created or modified. |
| `commandsRunAndResults` | Array of `{ command, cwd, exitCode, summary }` — **summary** must be redacted. |
| `proofArtifacts` | Array of `{ kind, reference, notes }` — e.g. CLI log path, doc anchor, operator attestation; **no secret payloads**. |
| `governanceAttestation` | Object — e.g. `stayedWithinAllowedPaths`, `noForbiddenActions`, `approvalsSought`, `exceptionsNoneOrListed`. |
| `progressEffectsRealized` | Array of strings — which slice `progressEffects` actually landed, or `none` with reason. |
| `remainingBlockers` | Array of strings — open risks; `[]` only if none known. |
| `nextSafeSliceRecommendation` | String — one default next slice id or hold justification. |

The slice object’s **`finalReturnFormat`** array may list these keys (or heading names) so implementers know which report profile this packet expects.

---

## Markdown: standard return format

For **default RedDirt** implementation slices, use these **section titles in order** (from `standardReturnFormat` in the JSON file):

1. **IMPLEMENTED** — What shipped and what was explicitly **not** done (out of scope).  
2. **FILES** — Same paths as `filesChanged`; group by area if long.  
3. **AI INTELLIGENCE STATUS** — Advisory AI / queue analysis / OpenAI-on-path posture; what changed vs unchanged.  
4. **SOURCE / RAG STATUS** — Manifests, `SearchChunk`, retrieval, brain ingest **honesty** when the slice touched memory paths.  
5. **GOVERNANCE STATUS** — Same substance as `governanceAttestation` in prose.  
6. **CHECKS** — Mirror `commandsRunAndResults`; call out failures and fixes or deferrals.  
7. **WHAT IS SAFE NOW** — Positive, **evidence-backed** statements (what checks proved).  
8. **WHAT REMAINS BLOCKED** — Mirror `remainingBlockers`.  
9. **EMAIL COMMAND CENTER PROGRESS LEDGER** — When the slice touches comms, include the honest ledger block per [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md); if out of scope, state **N/A — slice did not touch Email Command Center** in one line.

---

## Markdown: architecture-only return format

For **architecture, registry, consolidation, or docs-only** packets that should not imply ECC motion, use **`architectureReturnFormat`** ordering:

1. **IMPLEMENTED**  
2. **FILES**  
3. **ARCHITECTURE STATUS** — Layers touched, registry deltas, scan artifacts.  
4. **BOUNDARY / GOVERNANCE STATUS** — `sos-public`, siblings, providers, deny-import posture.  
5. **CHECKS**  
6. **WHAT IS SAFE NOW**  
7. **WHAT REMAINS BLOCKED**  
8. **NEXT RECOMMENDED SLICE** — Same intent as `nextSafeSliceRecommendation`; use this heading name in this profile.

---

## Optional fields (machine JSON)

When relevant, add optional keys documented in the JSON file:

| Key | When to use |
|-----|-------------|
| `workflowIntakeCreated` | Boolean — slice connected public form → DB intake behavior. |
| `operatorReviewPath` | String — doc or `/admin/...` route for review/export. |
| `daysCompressionAssessment` | String — whether compressing later milestones is safe given proofs. |

---

## Optional sections (Markdown)

You may add short subsections (for example **GIT SUMMARY**, **DRIFT CHECK**) if [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) or the active Cursor script asks for them, **as long as** the required machine keys and the chosen heading profile still appear and carry the same facts.

---

## Alignment with THREAD-HANDOFF / PROTO-2

[`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) §0.2 lists legacy bullets (IMPLEMENTED, FILES, BUILD PROGRESS UPDATE, BLUEPRINT PROGRESS UPDATE, etc.). Those remain valid **narrative** supplements. For **self-build queue** alignment:

- Map **BUILD PROGRESS UPDATE** / **BLUEPRINT PROGRESS UPDATE** into **`progressEffectsRealized`** plus prose under **IMPLEMENTED** or **GOVERNANCE STATUS**.  
- Map **DRIFT CHECK** into **`governanceAttestation`** and **WHAT REMAINS BLOCKED**.  
- Map **NEXT RECOMMENDED PACKET** into **`nextSafeSliceRecommendation`** or **NEXT RECOMMENDED SLICE**.

Prefer **one** primary heading order per response (`standardReturnFormat` *or* `architectureReturnFormat`) so downstream readers do not see duplicate structure.

---

## Anti-patterns (status reporting)

- Claiming **hosted-ready** or **operator-proven** without artifacts referenced in `proofArtifacts`.  
- Listing “all green” when `exitCode` was non-zero or checks were skipped.  
- Pasting **secrets** or full **`.env`** into FILES, CHECKS, or chat.  
- Omitting **EMAIL COMMAND CENTER PROGRESS LEDGER** when the slice clearly changed comms rails (use N/A only when truly out of scope).

---

*Last updated: **REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0** — Deliverable E: return format and Cursor status reporting.*
