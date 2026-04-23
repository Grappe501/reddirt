# Targeting data inventory (DATA-2) (RedDirt)

**Packet DATA-2 (Part A).** **Authoritative inventory** of **existing** Prisma models relevant to **vote-target planning**, **registration goals**, and **geography**—so future work uses **DB truth**, not invented universes. **No** new metrics formulas here.

**Evidence:** `prisma/schema.prisma` (inspected), [`data-targeting-foundation.md`](./data-targeting-foundation.md) (DATA-1), [`geographic-county-mapping.md`](./geographic-county-mapping.md), [`database-table-inventory.md`](./database-table-inventory.md), `src/lib/voter-file/*`.

**Cross-ref:** [`voter-strength-foundation.md`](./voter-strength-foundation.md) · [`county-precinct-strategy-foundation.md`](./county-precinct-strategy-foundation.md) · [`path-to-45-foundation.md`](./path-to-45-foundation.md) · [`goals-system-status.md`](./goals-system-status.md) · **DATA-3 multi-signal:** [`voter-signal-inventory.md`](./voter-signal-inventory.md) · [`geographic-targeting-model.md`](./geographic-targeting-model.md) · `src/lib/campaign-engine/targeting.ts`

---

## 1. North star

This inventory is the **foundation** for building **exact** vote and registration targets **from tables that already exist**: county goals, voter-file rollups, optional demographics, optional precinct strings on voters, and operational geography. Anything **not** listed as a column or JSON contract below is **out of scope** for “computed in app today.”

**Campaign narrative (e.g. 45% statewide)** is **not** stored as a single Prisma field; planning must **compose** from county-level and file-level facts **without** this doc inventing turnout or persuasion math.

---

## 2. All relevant models / tables

### 2.1 Core voter file & county rollups

| Model | What it stores | Current / useful | Supports (check) |
|-------|----------------|------------------|-------------------|
| **`VoterRecord`** | `voterFileKey`, `countyId` / FIPS / slug, optional `precinct` **string**, names, `phone10`, `registrationDate`, snapshot FKs, `inLatestCompletedFile` | **Core** roll rows from SOS-style import | **Registration** (who is on roll); **geography** (county; precinct if column present in source file). **Does not** store party, vote history, or strength scores. |
| **`VoterFileSnapshot`** | Import run: `fileAsOfDate`, status, hash, chain to previous snapshot | **Authoritative** for “what file version” metrics use | **Targeting** only via **derived** metrics, not per-candidate logic. |
| **`CountyVoterMetrics`** | Per **county** + **snapshot**: `totalRegisteredCount`, new/dropped/net since snapshot & baseline, optional `countyGoal`, optional `progressPercent`, `asOfDate`, `registrationBaselineDate` | **Derived** by ETL (`recomputeAllCountyVoterMetricsForSnapshot`) | **Registration** rollups; **geography** (county). **`progressPercent`** is **computed** in pipeline—see implementation, not re-derived here. |
| **`VoterSnapshotChange`** | Audit rows: change type, `voterFileKey`, `countyId`, optional `summaryJson` | **Useful** for deltas / QA | **Registration** churn; **not** electoral performance. |

### 2.2 County dimension & campaign goals

| Model | What it stores | Current / useful | Supports |
|-------|----------------|------------------|----------|
| **`County`** | `slug`, `fips`, `displayName`, content fields, `published` | **Canonical** geography for public + voter FK | **Geography** |
| **`CountyCampaignStats`** | `registrationGoal`, `newRegistrationsSinceBaseline`, `registrationBaselineDate`, `volunteerTarget`, `volunteerCount`, `campaignVisits`, pipeline fields, `reviewStatus` | **Campaign-entered** goal + pipeline | **Registration goal**; **volunteer** capacity **counts** (not vote share). |
| **`CountyPublicDemographics`** | `population`, `votingAgePopulation`, `medianHouseholdIncome`, `povertyRatePercent`, `bachelorsOrHigherPercent`, `source`, `asOfYear`, `reviewStatus` | **Optional** per county; census-style when populated | **Socioeconomic context** for **planning**; **not** vote choice. |
| **`CountyElectedOfficial`** | Roster: office, `name`, optional `party`, jurisdiction | Context / narrative | **Not** individual voter strength |

### 2.3 Segments & comms (opaque JSON)

| Model | What it stores | Current / useful | Supports |
|-------|----------------|------------------|----------|
| **`AudienceSegment`** | `definitionJson` | Tier-2 / list machinery | **Targeting** only if **ops** defines JSON contract—**not** enforced in Prisma as voter-file slice |
| **`CommsPlanAudienceSegment`** | `ruleDefinitionJson`, members on User/Volunteer | Workbench audiences | **Targeting** lists, **not** automatic `VoterRecord` SQL universe |
| **`CommunicationCampaign`** | `audienceDefinitionJson` | Broadcast | Same as above |

### 2.4 Field & capacity (organizing, not vote model)

| Model | What it stores | Supports |
|-------|----------------|----------|
| **`FieldUnit`**, **`FieldAssignment`** | Operational geography + `positionId` / user | **Volunteer/field capacity overlay**; **no FK** to `County` in schema |
| **`VolunteerProfile`**, **`User`**, **`EventSignup`**, **`CampaignTask`**, **`VolunteerAsk`** | People and work | **Capacity**; **no** per-voter goal assignment in schema |

### 2.5 Analytics & recommendations (not election results)

| Model | What it stores | Supports |
|-------|----------------|----------|
| **`EventAnalyticsSnapshot`** | `day`, `scope` (`GLOBAL` \| `EVENT` \| `COUNTY`), `countyId?`, `eventId?`, **`metricsJson`** | **Event/calendar** aggregates when populated—**schema does not define** vote share or turnout keys |
| **`AnalyticsRecommendationOutcome`** | Social analytics recommendations, `confidence`, `provenanceJson`, links to content/intake | **Comms/social** workflow, **not** voter-file targeting |
| **`SocialContentItem`** | `engagementQualityScore`, etc. | **Social** performance, **not** electorate modeling |

### 2.6 Census / socioeconomic in DB

| Location | Notes |
|----------|--------|
| **`CountyPublicDemographics`** | **Only** structured census-style table found in schema for county-level SES. **No** tract/block tables; **no** precinct-demographics table. |

### 2.7 Election history / past results

| Finding | Evidence |
|---------|----------|
| **No dedicated `ElectionResult`, `PrecinctResult`, or `VoteHistory` model** | Full `model` list in `schema.prisma` inspection; no such names. |
| **`VoterRecord` has no party or vote-history columns** | Schema fields listed in §2.1. |

**Conclusion:** **Past election results** used for “solid base %” or “historical D performance” are **not** represented as first-class rows in this schema **unless** imported elsewhere in **JSON** not covered by this inventory (none found on `County` / `CountyVoterMetrics` as structured vote-share fields).

### 2.8 Precinct

| Location | Notes |
|----------|--------|
| **`VoterRecord.precinct`** | Optional **string** from file import (`PRECINCT` column mapping per DATA-1). |
| **No `Precinct` master table** | Cannot join to geometry or official precinct registry in Prisma. |

---

## 3. Source-of-truth notes

| Topic | Authoritative in DB | Derived / mirror | Missing |
|-------|---------------------|------------------|---------|
| **County registration goal (campaign set)** | **`CountyCampaignStats.registrationGoal`** | **`CountyVoterMetrics.countyGoal`** copied at recompute | Statewide **vote share** goal (45%) |
| **Registered voter counts** | **`CountyVoterMetrics.totalRegisteredCount`** (per snapshot) when ETL filled | — | — |
| **Progress % on registration goal** | — | **`CountyVoterMetrics.progressPercent`** (see pipeline code) | — |
| **Solid base / persuasion / 35%** | — | — | **No** column; see [`voter-strength-foundation.md`](./voter-strength-foundation.md) |
| **Election history** | — | — | **No** first-class table |
| **Census-style SES** | **`CountyPublicDemographics`** when row exists | — | Often **null** until imported |

**Read-only helpers:** `src/lib/campaign-engine/targeting.ts` (DATA-2) — `listTargetingDataSources`, `listCountyTargetingInputSummaries`, `getCountyGoalAndMetrics`.

---

## 4. Repo inspection (DATA-2)

1. **Most important tables for target-vote planning *right now*?** **`County`**, **`CountyCampaignStats`**, **`CountyVoterMetrics`**, **`VoterFileSnapshot`**, **`VoterRecord`** (for roll + optional precinct string), and optionally **`CountyPublicDemographics`** for population context.
2. **Actual election-history data in DB?** **No** dedicated election-result models or vote-history on `VoterRecord` per schema inspection. Only **indirect** narrative data (e.g. elected officials’ **party** string) — **not** precinct or county **results**.
3. **Identify “35% solid base” today?** **Not** from schema-backed voter classification; any such figure is **external** or **manual** until modeled data is ingested (Part B).
4. **Precinct-level targeting now?** **Partial**: only where **`precinct`** string is populated on **`VoterRecord`**; no precinct master, no precinct results, no precinct goals in DB.
5. **Strongest county-level variables *in repo*?** `registrationGoal`, `CountyVoterMetrics` rollups, `totalRegisteredCount`, new registration deltas, optional `CountyPublicDemographics.population` / `votingAgePopulation`, volunteer target/count on **`CountyCampaignStats`**.
6. **Additional data to ingest for exact map?** County/precinct **election results** (or scored extracts), **party** or **model scores** if legally/ethically used, **precinct crosswalk** if precinct strings need normalization, **canvass results** — **none** of these are required to exist in git; they must be **designed** as imports.
7. **DATA-3 / DATA-4 next?** **DATA-3** (docs): [`election-results-foundation.md`](./election-results-foundation.md) + ingest strategy + signals + integration. **DATA-4:** Prisma migration + ingest implementation + QA reports — see [`election-results-foundation.md`](./election-results-foundation.md) §6.

---

*Last updated: Packet DATA-2 (Part A + Part F).*
