# Voter model + interaction log — implementation foundation (VOTER-MODEL-1 + INTERACTION-1)

**Purpose:** Describe what **shipped in code** for the first durable voter modeling layer: **signals**, **provisional classifications**, **interaction logging**, and **vote-plan seeds**, with explicit **non-goals**.

**Companion narrative:** DATA-5 voter / volunteer / donor / area blueprints (when present under `docs/`) — this file is the **implementation** counterpart for voter signals + interactions only.

---

## 1. What VOTER-MODEL-1 implements

- **Prisma:** `VoterSignal`, `VoterModelClassification` (with `isCurrent`, override fields, `modelVersion` default `voter-model-v1`), enums for signal kind/source/strength, `ModelConfidence`, `VoterClassification`, `ModelGeneratedBy`.
- **Rule helper (no auto-write):** `src/lib/campaign-engine/voter-model.ts` — `classifyVoterFromSignals()` returns **classification**, **confidence**, **sourceSummary**, **reasonCodes** from signal *shapes* only. Callers must **explicitly** persist if they choose.
- **Read helpers:** `src/lib/campaign-engine/voter-model-queries.ts` — `listVoterSignals`, `getCurrentVoterClassification`, `getVoterModelProfile` (identity + current tier + signal counts + latest interaction date + latest vote plan).
- **Admin (read-only):** `/admin/voters/[id]/model` — debug-style listing; **not** search or canvassing.

---

## 2. What INTERACTION-1 implements

- **Prisma:** `VoterInteraction` (optional `voterRecordId` for edge cases where staff logs context before a file match), `VoterVotePlan` (one or more rows per voter over time; consumers use **latest** `updatedAt`).
- **Helpers:** `src/lib/campaign-engine/voter-interactions.ts` — `listVoterInteractions`, `createVoterInteraction`, `getVoterInteractionSummary`.
- **Validation:** Create requires **`voterRecordId`** **or** **both** non-empty **`notes`** and **`contactedByUserId`**. `supportLevel` defaults to **UNKNOWN** when omitted; **null** can be passed to leave the field unset (schema allows null — prefer explicit UNKNOWN for new rows per product choice).

---

## 3. Source-of-truth boundaries

| Concern | Authoritative | Inferred / provisional |
|--------|----------------|-------------------------|
| Registration identity | `VoterRecord` (SOS-style file key, county) | — |
| Tabulated election results | `ElectionResultSource` + children (reported results) | — |
| Internal money facts | `FinancialTransaction` (when confirmed) | — |
| Modeled tier / signal | — | `VoterModelClassification`, `VoterSignal` |
| Staff-reported contact | `VoterInteraction` row exists | Interpretation of **support** only if `supportLevel` set |
| Vote intent / “committed” | Human-recorded fields | Never implied by model helper alone |

---

## 4. Why classifications are inferred / provisional

- **`VoterModelClassification`** rows are **campaign modeling**, not SOS verification and not ballot outcomes.
- Unless **`confidence === HUMAN_CONFIRMED`** (and even then), tiers are **not** guaranteed votes — see **`getTruthSnapshot()`** advisory strings (BRAIN-OPS).
- **`classifyVoterFromSignals`** is **deterministic** and **auditable** via **`reasonCodes`**; it does **not** call AI and does **not** attach probabilities.

---

## 5. How this feeds REL-2, GOTV, county dashboards, and path-to-45

- **REL-2 (future):** Relational contact rows should **emit** `VoterInteraction` + optional `VoterSignal` with `RELATIONAL_ORGANIZING` / `INTERNAL` source — this packet **does not** add `RelationalContact` but the **log** is ready.
- **GOTV:** `VoterVotePlan` + `votePlanStatus` on interactions provide a **lifecycle seed**; reminder/transport fields are **operational**, not predictions.
- **County dashboards:** Rollups remain **future**; data is **per-voter** until **AREA-MODEL-1** read models exist.
- **Path-to-45:** Supports **honest** contact history and tier **hypotheses** with provenance; **does not** compute county vote potential (see DATA-5 / vote-potential blueprint).

---

## 6. What remains intentionally not built

- No automatic classification writes from imports or cron.
- No canvassing UI, turf cutting, or mobile offline flows.
- No Power-of-5 product surface (REL-1 docs only).
- No black-box scores or win probabilities.
- No merge of election tabulation into per-voter support without explicit human/product rules.

---

## 7. Migration

- Folder: `prisma/migrations/20260514120000_voter_model_1_interaction_1_foundation/`.
- **Apply** when `DATABASE_URL` is available: `npx prisma migrate deploy` (or `migrate dev` in development).

*Last updated: VOTER-MODEL-1 + INTERACTION-1 implementation packet.*
