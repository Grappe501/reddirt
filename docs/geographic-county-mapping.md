# Geographic / county data mapping (GEO-1) (RedDirt)

**Source of truth for field names:** `prisma/schema.prisma` (inspected for this packet). **No schema changes in GEO-1.**

---

## 1. North star

**County** is the **primary operational unit** for organizing field work, public county command pages, voter-file rollups, and many operational filters. It is the **bridge** between:

- **Voter data** — `VoterRecord` and `CountyVoterMetrics` tie to canonical `County`.
- **Field** — `FieldUnit` with `FieldUnitType.COUNTY` is a **separate** campaign-owned hierarchy (name-based; **no Prisma FK** to `County` today).
- **Comms** — `CommunicationThread.countyId` and queue hints; workbench plans often reach county **indirectly** (event, intake, segment JSON).
- **Media** — `OwnedMediaAsset` carries `countySlug` / `countyFips` / optional `countyId`; editorial and hub content use **string** slugs on `InboundContentItem` / `SyncedPost` without requiring an FK.

This doc lists **every Prisma model** that stores county or geographic fields, with **authoritative vs derived** notes.

---

## 2. County sources in the database

### 2.1 Canonical county dimension

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`County`** | `id`, `slug`, `fips`, `displayName`, `regionLabel`, content fields (`hero*`, `lead*`, `featuredEventSlugs`, `published`, …) | Public `/counties/[slug]` command pages; hub for relations | **Yes** — single row per Arkansas county in campaign DB. |

### 2.2 One-to-one / child tables keyed by `County`

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`CountyCampaignStats`** | `countyId` (unique) | Registration goals, volunteer targets/counts, pipeline sync metadata | **Campaign-entered / pipeline-derived** — `reviewStatus` flags public review. |
| **`CountyPublicDemographics`** | `countyId` (unique) | Census-style snapshot | **Imported or manual** — labeled `source`. |
| **`CountyElectedOfficial`** | `countyId` | Roster of officials | **Hand-entered or future import** — per-row `reviewStatus`. |

### 2.3 Voter file and metrics

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`CountyVoterMetrics`** | `countyId`, `countySlug` (denorm), `voterFileSnapshotId`, rollups, `countyGoal`, `progressPercent` | Per-snapshot county rollups for field + public pages | **Derived** from ingest; `countySlug` denormalized for exports. |
| **`VoterRecord`** | `countyId`, `countyFips`, `countySlug`, `precinct` (string?) | Canonical voter row from SOS file | **County on row = source of truth for that voter** (import). `precinct` is optional string from file — **not** a separate precinct master table. |
| **`VoterSnapshotChange`** | `countyId`, `countySlug` | Delta audit per snapshot | **Derived** from ingest run. |
| **`VoterFileSnapshot`** | (no county on parent) | Parent for metrics and voter lifecycles | N/A — county is on child rows. |

### 2.4 People, intake, roles, field-adjacent ops

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`User`** | `county` (string?) | Self-serve / form capture | **Not FK** — may **not** match `County.slug`; join with care. |
| **`WorkflowIntake`** | `countyId` (optional FK) | Intake queue geography | **Operational** — set when known. |
| **`TeamRoleAssignment`** | `countyId` (optional FK) | Role × county (e.g. county lead) | **Authoritative** when populated. |
| **`EventSignup`** | `countyId` (optional FK) | Attendee-declared or inferred county | **Signup-time** — may disagree with `User` or voter link. |
| **`VolunteerAsk`** | `countyId` (optional FK) | Ask scoped to geography | **Operational**. |
| **`CampaignTask`** | `countyId` (optional FK) | Task geography (incl. social/event workflows) | **Operational** — optional. |
| **`VolunteerProfile`** | — | No county column | County comes from **`User.county`**, **`linkedVoterRecordId` → `VoterRecord`**, or related rows. |

### 2.5 Field program (FIELD-1) — parallel to `County`

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`FieldUnit`** | `type` (`COUNTY` \| `REGION`), `name`, `parentId` | Named field geography node | **Campaign-owned labels** — schema comment: *not GIS*. **No `countyId` FK** to `County`. |
| **`FieldAssignment`** | `fieldUnitId`, `positionId`, `userId`, `positionSeatId` | Who covers which field unit | **Authoritative for field org** — must be **aligned by convention** with `County`, not enforced in DB. |

### 2.6 Events, festivals, analytics

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`CampaignEvent`** | `countyId` (optional FK) | Event location scope | **Operational** — optional. |
| **`ArkansasFestivalIngest`** | `countyId` (optional FK), `city`, lat/lng | Ingested festival row | **Inferred or manual** — review workflow. |
| **`EventAnalyticsSnapshot`** | `countyId`, `scope` (string: `GLOBAL` \| `EVENT` \| `COUNTY`), `eventId`, `day`, `metricsJson` | Calendar / event analytics roll-up | **Derived** aggregates; `scope` discriminates row type. |

### 2.7 Communications (Tier 1 / workbench / broadcast)

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`CommunicationThread`** | `countyId` (optional FK) | 1:1 comms rail filter + assignment | **Operational** — should align to contact/county when set. |
| **`CommunicationCampaign`** | — (no county column) | Tier-2 broadcast | County may appear inside **`audienceDefinitionJson`** — **app-defined**, not a FK. |
| **`AudienceSegment`** | `definitionJson` | Segment rules | May encode county — **JSON**, not validated in Prisma. |
| **`CommunicationPlan`**, **`CommunicationDraft`**, **`CommunicationSend`**, **`CommunicationRecipient`** | — | Workbench sends | **No direct county**; geography via **`CommsPlanAudienceSegment.ruleDefinitionJson`**, linked **`User`**, **`CommunicationThread`**, or **source** FKs (`sourceEventId`, `sourceWorkflowIntakeId`, …). |
| **`EmailWorkflowItem`** | — | Email triage queue | County only via **linked** intake, thread, task, event, etc. |

### 2.8 Social + conversation monitoring

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`SocialContentItem`** | — | Social workbench item | County **indirect** — `workflowIntakeId` → `WorkflowIntake`, `campaignEventId` → `CampaignEvent`. |
| **`SocialContentStrategicInsight`** | `recommendedCountyFocus` (string) | AI/heuristic follow-up hint | **Advisory text** — comment: optional `County` FK *later*. |
| **`ConversationWatchlist`** | `countyId` | Filter spec for monitoring | **Operational**. |
| **`ConversationItem`** | `countyId` | Normalized public item | **Often from source**; may be incomplete. |
| **`ConversationAnalysis`** | `countyInferenceNote` | Enrichment | **Inferred** — not authoritative. |
| **`ConversationCluster`** | `countyId` | Cluster scope | **Operational / inferred**. |
| **`ConversationOpportunity`** | `countyId` | Routing opportunities | **Operational**. |

### 2.9 Media, content hub, DAM

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`OwnedMediaAsset`** | `countySlug`, `countyFips`, `countyId` (optional FK), `city`, `needsGeoReview`, GPS | DAM / Media Center | **Slug/FIPS** may lead **`countyId`** backfill; `needsGeoReview` flags mismatch risk. |
| **`InboundContentItem`** | `countySlug`, `countyFips`, `city` | Connector-normalized items | **Strings** — no FK to `County` in schema. |
| **`SyncedPost`** | `countySlug`, `countyFips`, `city` | Substack / blog sync | Same pattern — **strings**. |
| **`MediaOutreachItem`** | — | Press desk row | **No county fields** — link to `CommunicationPlan` / `WorkflowIntake` / `ConversationOpportunity` for context. |

### 2.10 External / earned media

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`ExternalMediaSource`** | `region`, `coveredCities` | Outlet metadata | **Not** `County` FK — string geography. |
| **`ExternalMediaMention`** | `relatedCountyId` (optional FK), `cityCoverage` | Article / clip | **`relatedCountyId`** when staff or rules set it. |

### 2.11 Signup sheet / OCR pipeline

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`SignupSheetEntry`** | `countyText` (raw), `countyId` (optional FK) | Parsed row + resolution | **Text** from OCR; **`countyId`** when matched. |

### 2.12 Precinct

| Model | Field(s) | Use | Authoritative? |
|-------|-----------|-----|----------------|
| **`VoterRecord.precinct`** | string? | From voter file | **SOS import** — no precinct master table; no GIS in schema. |

---

## 3. County usage patterns

| Pattern | Where it shows up | Notes |
|--------|-------------------|--------|
| **Targeting** | `AudienceSegment.definitionJson`, `CommsPlanAudienceSegment.ruleDefinitionJson`, broadcast `audienceDefinitionJson` | **JSON contracts** — not one validator in Prisma. |
| **Reporting / goals** | `CountyVoterMetrics`, `CountyCampaignStats`, `EventAnalyticsSnapshot` (`scope` = `COUNTY`) | Mix of file-derived and campaign goals. |
| **Assignment** | `CommunicationThread.countyId`, `WorkflowIntake.countyId`, `TeamRoleAssignment`, `FieldAssignment` + `FieldUnit` | **Thread/intake/role** use `County` FK; **field** uses **`FieldUnit`** tree. |
| **Metadata / UX** | `User.county`, `SocialContentStrategicInsight.recommendedCountyFocus`, `ExternalMediaSource.region` | **Not** safe for auto-join to `County` without normalization. |
| **Media filtering** | `OwnedMediaAsset` slug/FIPS/FK, hub items by `countySlug` | FK may **lag** strings until backfill (see `OwnedMediaAsset` comment in schema). |

---

## 4. Duplication / fragmentation

1. **Three representations of “which county”**
   - Canonical **`County.id`** (FK) — use when present.
   - **String** `countySlug` / `countyFips` on `VoterRecord`, metrics, `OwnedMediaAsset`, `InboundContentItem`, `SyncedPost` — for exports and **legacy / connector** paths.
   - **Free text** `User.county`, `SignupSheetEntry.countyText`, `recommendedCountyFocus` — require cleanup or review.

2. **Field org vs public county**
   - **`FieldUnit` (`COUNTY`)** is **not** linked to `County` in the database; duplication of names is possible. Operational alignment is **process**, not constraint.

3. **Comms / social without county columns**
   - **`SocialContentItem`**, **`CommunicationPlan`**, **`MediaOutreachItem`** — geography is **inferred** from linked entities or JSON. Dashboards that need a county dimension must **join** or **denormalize in app**.

4. **Broadcast vs workbench**
   - Tier-2 **`CommunicationCampaign`** and workbench **`CommunicationSend`** do not share a single `countyId` column; both can still encode geography in **JSON** or **segment** members.

5. **External media**
   - **`ExternalMediaMention`** uses `relatedCountyId`; sources describe **`region` / `coveredCities`** in parallel — different shapes for “where”.

---

*GEO-1 — full county table mapping. See also [`county-media-mapping.md`](./county-media-mapping.md), [`geographic-unification-foundation.md`](./geographic-unification-foundation.md), [`county-dashboard-foundation.md`](./county-dashboard-foundation.md).*
