# Data & targeting — foundation (DATA-1) (RedDirt)

**DATA-1** names how **electoral goals** and **geography** relate to the **voter file** and **volunteer** objects **as they exist in this repo today** — **not** a new analytics engine, **not** imported VAN universes, **not** invented metrics.

**Evidence:** `prisma/schema.prisma` (`VoterRecord`, `County`, `CountyVoterMetrics`, `CountyCampaignStats`, `VoterFileSnapshot`, `User`) · `src/lib/voter-file/*` · `County` command pages and workbench DTOs where applicable.

**Cross-ref:** [`identity-and-voter-link-foundation.md`](./identity-and-voter-link-foundation.md) · [`field-structure-foundation.md`](./field-structure-foundation.md) · [`communications-unification-foundation.md`](./communications-unification-foundation.md)

---

## 1. Vote goals (what exists in the DB)

| Location | What is stored | What is **not** stored |
|----------|----------------|------------------------|
| **`CountyVoterMetrics`** | Per **county** + **snapshot**: `totalRegisteredCount`, `newRegistrationsSinceBaseline`, `newRegistrationsSincePreviousSnapshot`, rollups, optional **`countyGoal`**, optional **`progressPercent`** (0–100), `asOfDate`, `registrationBaselineDate` | No **statewide** single row; goals are **county-scoped** on this metrics table |
| **`CountyCampaignStats`** | **`registrationGoal`**, **`newRegistrationsSinceBaseline`**, **`volunteerTarget`**, **`volunteerCount`**, pipeline metadata (`dataPipelineSource`, `pipelineLastSyncAt`, `pipelineError`) | No **persuasion** or **turnout** score columns here |
| **`VoterRecord`** | **Row-level** roll identity: `voterFileKey` (canonical from file), **`countyId` / `countySlug` / `countyFips`**, optional **`precinct`**, names, **`phone10`**, registration/drop lifecycle vs snapshots | No **support** / **persuasion** / **turnout propensity** fields in schema (**not** claiming absence in `metadata` elsewhere — **none** on `VoterRecord` itself) |

**Conclusion:** “**Vote goals**” in product today are **registration**- and **rollup**-oriented at **county** granularity (plus **public** narrative on county pages). There is **no** first-class **persuasion vs turnout vs base** partition in Prisma.

---

## 2. Persuasion vs turnout vs base (conceptual vs repo)

These are **standard field programs** concepts. **In this repo:**

- **There is no** persisted **universe type** enum (e.g. PERSUASION / TURNOUT / BASE) on `VoterRecord` or a dedicated targeting table.
- **Tier 2** broadcast uses `AudienceSegment.definitionJson` and `CommunicationCampaign.audienceDefinitionJson` — **opaque JSON** to the schema; **no** documented, enforced mapping to voter universes in code from this foundation alone.
- **Comms workbench** segments (`CommsPlanAudienceSegment`, members on `User` / `VolunteerProfile` / `crmContactKey`) are **campaign-local** list machinery — **not** a voter-file slice engine.

**If** the campaign uses persuasion/turnout/base in operations, it is **outside** this schema or **inside** JSON blobs **without** a single shared contract — **DATA-1** records that **honestly**.

---

## 3. Precinct-level targeting (if data exists)

**Exists (sparse):**

- **`VoterRecord.precinct`** — optional **string**, populated when the **SOS CSV import** includes a **`PRECINCT`** column (`src/lib/voter-file/sos-voter-csv.ts` maps it).
- Workbench UI can show precinct when **`User.linkedVoterRecord`** is set (e.g. `workbench/page.tsx` displays `linkedVoterRecord.precinct`).

**Does not exist:**

- No **precinct** boundary geometry, no **precinct** FK table, no **walk list** entity, no **precinct goal** columns in Prisma.
- **Cannot** claim “precinct-level targeting product” — only **row-level** **attribute** when the file provides it.

---

## 4. County-level fallback

**Default operational geography** in data is **county**:

- **`County`** is canonical for public geography; **`VoterRecord.countyId`** ties voters to **`County`**.
- **`CountyVoterMetrics`** and **`CountyCampaignStats`** roll up **registration** / **volunteer** story at **county** level.
- Many comms and monitoring objects use **`countyId`** (`CommunicationThread`, `ConversationOpportunity`, `WorkflowIntake`, etc.).

When **precinct** is null or unreliable, **county** is the **stable** fallback **already reflected** in schema and imports.

---

## 5. Volunteer-level “goal assignment”

**What exists:**

- **`CountyCampaignStats.volunteerTarget`** / **`volunteerCount`** — **county**-level, not per-volunteer.
- **`VolunteerProfile`** — no `goal` or `quota` fields (see [`volunteer-data-gap-analysis.md`](./volunteer-data-gap-analysis.md)).
- **`FieldAssignment`** (FIELD-1) can attach a **user** to a **field unit** + **position** — **organizing coverage**, not a numeric “goal”.

**How staff might assign goals today (operational, not a product feature):** spreadsheets + narrative; **optional** `Commitment.metadata` or **`CampaignTask`** as **ad hoc** tracking — **not** a unified **volunteer goal** model in Prisma.

---

## 6. Relationship to the voter file

- **Ingest:** `VoterFileSnapshot` + import pipeline; **`VoterRecord`** rows tied to **snapshots**; **diffs** via `VoterSnapshotChange` (see schema).
- **Identity bridge:** `User.linkedVoterRecordId` → `VoterRecord` (admin-assisted); signup sheets use **`VolunteerMatchCandidate`** to **`VoterRecord`**.
- **Targeting for comms** is **not** automatically `VoterRecord`-driven for Tier 2 / workbench: audiences are **segments** and **recipients** keyed by **`User`**, **email/phone**, or **opaque** keys — **not** a SQL “select * from VoterRecord where …” in app code for sends.

---

## 7. Out of scope (DATA-1)

- Defining new metrics tables, scores, or ETL.
- **Asserting** field programs’ **VAN** behavior inside this app.

---

**Follow-on (DATA-2):** [`targeting-data-inventory.md`](./targeting-data-inventory.md) — full model inventory + read helpers in `src/lib/campaign-engine/targeting.ts`.

*Last updated: Packet DATA-1.*
