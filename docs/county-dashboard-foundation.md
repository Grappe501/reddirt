# County dashboard — foundation (GEO-1) (RedDirt)

**Purpose:** Define what a **future** per-county operator dashboard could show by **reusing existing models**. **No new routes or schema in GEO-1.**

**Primary key for filtering:** `County.id` (and `slug` for URL-shaped views).

---

## 1. Pillar: voter + registration narrative

| Dashboard slice | Prisma model(s) | Notes |
|-----------------|-----------------|--------|
| **Registration / roll-up metrics** | `CountyVoterMetrics` (per `voterFileSnapshotId`), `VoterFileSnapshot` | `countyGoal`, `progressPercent`, new/dropped since snapshot — file-derived. |
| **Campaign goals on the ground** | `CountyCampaignStats` | `registrationGoal`, `volunteerTarget`, `volunteerCount`, pipeline fields. |
| **Demographics (public page)** | `CountyPublicDemographics` | Optional context for messaging — review status applies. |
| **Elected roster (context)** | `CountyElectedOfficial` | Local narrative — not voter ops. |

---

## 2. Pillar: field leadership + coverage

| Dashboard slice | Prisma model(s) | Notes |
|-----------------|-----------------|--------|
| **Field org tree** | `FieldUnit` (`type` COUNTY/REGION), `FieldAssignment` | **Join** to `County` is **not** in schema — show `FieldUnit` names and `FieldAssignment` → `User` / `PositionSeat` when present. |
| **Volunteer asks in county** | `VolunteerAsk` (`countyId`) | Active/past asks scoped to county. |
| **Tasks** | `CampaignTask` (`countyId`, optional `eventId`, `socialContentItemId`) | Open work in geography. |

---

## 3. Pillar: people (contacts)

| Dashboard slice | Prisma model(s) | Notes |
|-----------------|-----------------|--------|
| **Users with self-ID county** | `User` (`county` string) | Fuzzy — use for “declared” only or normalize in app. |
| **Event signups** | `EventSignup` (`countyId`) for events in or tied to county | Filter via `event.countyId` or signup row. |
| **Team roles** | `TeamRoleAssignment` (`countyId`, `roleKey`) | “Who is county lead” when data exists. |
| **Voters (assistance)** | `VoterRecord` (`countyId`) | Counts and drill-down — PII-appropriate UI only. |
| **Signup sheet pipeline** | `SignupSheetEntry` (`countyId` / `countyText`) | Intake quality / matching backlog. |

---

## 4. Pillar: calendar + events

| Dashboard slice | Prisma model(s) | Notes |
|-----------------|-----------------|--------|
| **Scheduled activity** | `CampaignEvent` (`countyId`) | Rallies, canvasses, etc. |
| **Festival / trail** | `ArkansasFestivalIngest` (`countyId`) | Suggested / promoted events. |
| **Intake** | `WorkflowIntake` (`countyId`) | Open work tied to place. |
| **Event analytics** | `EventAnalyticsSnapshot` (`countyId` + `scope` = `COUNTY`) | When populated for county roll-up. |

---

## 5. Pillar: comms + email + social (read-model heavy)

| Dashboard slice | Prisma model(s) | Notes |
|-----------------|-----------------|--------|
| **1:1 threads** | `CommunicationThread` (`countyId`) | Volume, open / needs reply (with status filters in app). |
| **Comms workbench** | `CommunicationPlan` → `CommunicationSend` → `CommunicationRecipient` | **No** direct county; filter by plan source (`sourceEvent`, `sourceWorkflowIntake`) or recipient identity — **heavier queries**. |
| **Broadcast** | `CommunicationCampaign` (via `event` or JSON) | **Not** a single `countyId` filter. |
| **Email workflow queue** | `EmailWorkflowItem` | County via **joins** to thread / intake / task / event / segment. |
| **Social** | `SocialContentItem` | County via event or intake (see [`county-media-mapping.md`](./county-media-mapping.md)). |
| **Press / earned** | `ExternalMediaMention` (`relatedCountyId`) | When set. |

---

## 6. Pillar: media (owned + hub)

| Dashboard slice | Prisma model(s) | Notes |
|-----------------|-----------------|--------|
| **Photos / video** | `OwnedMediaAsset` (`countyId` or `countySlug`/`countyFips`) | Respect `needsGeoReview`. |
| **Editorial / inbound hub** | `InboundContentItem`, `SyncedPost` (string slugs) | Resolve to `County` by **slug** match in app. |
| **Press outreach** | `MediaOutreachItem` | **No** county on row — “open outreach” may need **link** to plan/intake to place on map. |

---

## 7. Pillar: fundraising (future / thin today)

| Dashboard slice | Prisma model(s) | Notes |
|-----------------|-----------------|--------|
| **Ledger** | `FinancialTransaction` | `relatedEventId` → `CampaignEvent` → `countyId` for **event-attributed** lines only; **not** a general county fund split. |

---

## 8. Cross-cutting: conversation monitoring

| Dashboard slice | Prisma model(s) | Notes |
|-----------------|-----------------|--------|
| **Signals in county** | `ConversationItem` (`countyId`), `ConversationOpportunity` (`countyId`), `ConversationWatchlist` (`countyId`) | Public monitoring — not PII vault. |

---

## 9. Intentional omissions (until product defines)

- **Single SQL view** that unions all county signals — **not** in GEO-1.
- **Precinct-level** dashboard — **no** precinct master; only `VoterRecord.precinct` string where populated.
- **Real-time** — depends on job freshness for metrics and webhooks for comms.

---

*GEO-1 — county dashboard blueprint. Inventory: [`geographic-county-mapping.md`](./geographic-county-mapping.md).*
