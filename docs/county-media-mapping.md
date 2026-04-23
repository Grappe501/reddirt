# County + media / content mapping (GEO-1) (RedDirt)

**Evidence:** `prisma/schema.prisma`. **No code or schema changes in GEO-1.**

---

## 1. Media / content models (relevant to geography)

| Model | Role in product |
|-------|-----------------|
| **`SocialContentItem`** | Social workbench — post plans, variants, performance. |
| **`SocialPlatformVariant`**, **`SocialContentMediaRef`** | Per-channel copy and links to `OwnedMediaAsset`. |
| **`SocialContentStrategicInsight`** | Per-item narrative + `recommendedCountyFocus` (string). |
| **`InboundContentItem`** | Script 6.5 normalized inbound (YouTube, etc.). |
| **`SyncedPost`** | Substack / blog feed sync. |
| **`OwnedMediaAsset`** | DAM / Media Center canonical file row. |
| **`MediaOutreachItem`** | Comms workbench — press / earned outreach tracking. |
| **`CommunicationPlan`**, **`CommunicationDraft`**, **`CommunicationSend`**, **`CommunicationRecipient`** | Message plans and execution. |
| **`CommunicationCampaign`**, **`AudienceSegment`** | Tier-2 broadcast + segment definitions. |
| **`ExternalMediaMention`**, **`ExternalMediaSource`** | Media monitor / earned mentions. |

---

## 2. Geographic linking (by model)

| Model | County stored on row? | How |
|-------|------------------------|-----|
| **`SocialContentItem`** | **No** | **Inferred** from optional `workflowIntake` → `WorkflowIntake.countyId` or `campaignEvent` → `CampaignEvent.countyId`. |
| **`SocialContentStrategicInsight`** | **Partial** | `recommendedCountyFocus` is **free text**; schema notes optional `County` FK in a *future* pass. |
| **`InboundContentItem`** | **Strings** | `countySlug`, `countyFips`, `city` — **not** an FK to `County`. |
| **`SyncedPost`** | **Strings** | Same: `countySlug`, `countyFips`, `city`. |
| **`OwnedMediaAsset`** | **Yes (mixed)** | `countySlug`, `countyFips`, optional `countyId` FK, `city`, EXIF `gps*`, `needsGeoReview`. |
| **`MediaOutreachItem`** | **No** | Geography only via `linkedCommunicationPlan` / `linkedWorkflowIntake` / `linkedConversationOpportunity` (those may or may not carry county). |
| **`CommunicationPlan`** / **`Draft`** / **`Send`** | **No** | **Inferred** from `sourceEventId` → `CampaignEvent.countyId`, `sourceWorkflowIntake` → `countyId`, or segment JSON / recipients. |
| **`CommunicationCampaign`** | **No** | **Inferred** from `eventId` → `CampaignEvent`, or `audienceDefinitionJson`. |
| **`AudienceSegment`** | **In JSON** | `definitionJson` may encode county rules — not Prisma-typed. |
| **`CommsPlanAudienceSegment`** | **In JSON** | `ruleDefinitionJson` for dynamic rules; members are `User` / `VolunteerProfile` / `crmContactKey` — county is **not** on the member row. |
| **`ExternalMediaMention`** | **Optional FK** | `relatedCountyId` → `County`. Also `cityCoverage` string array. |
| **`ExternalMediaSource`** | **Not county** | `region` + `coveredCities[]` as **labels**. |

---

## 3. Existing county-specific or county-capable content

| Question | Answer (repo evidence) |
|----------|-------------------------|
| **County-specific social posts?** | **Not as a first-class `countyId` on `SocialContentItem`.** You can *effectively* scope by **linking** an intake or event that has `countyId`, or by operator convention in `metadata`. |
| **County-specific campaigns?** | **`CommunicationCampaign`**: no county column; **`eventId`** or **`audienceDefinitionJson`** can scope geography in application logic. **Cannot** assume county without reading JSON or joins. |
| **County-specific segments?** | **`AudienceSegment`** / **Comms plan segments**: **JSON** definitions; capability exists in **data shape**, not enforced in Prisma. |
| **County-specific outreach items?** | **`MediaOutreachItem`**: **no** county field; tie-out is through **linked plan/intake/opportunity** or future product work. |
| **County-tagged media assets?** | **Yes** — `OwnedMediaAsset` has **slug, FIPS, optional FK** + review flags. |
| **County-tagged hub content?** | **Yes** — `InboundContentItem` and `SyncedPost` use **string** slugs/FIPS. |

---

## 4. Gaps (where media is not geographically aware in-schema)

1. **`SocialContentItem`** — no `countyId`; county is **only** via joins or `recommendedCountyFocus` on insight (string).
2. **`MediaOutreachItem`** — no county; **press tracking** is not geo-keyed at row level.
3. **Tier-2 `CommunicationCampaign` / `CommunicationMessage`** — no direct `countyId`; must use **event**, **JSON**, or **recipient** resolution.
4. **Workbench `CommunicationSend`** / **`CommunicationRecipient`** — no `countyId`; same mitigation as above.
5. **`VolunteerProfile`** — no county; use **`User.county`**, **voter link**, or **engagement** tables.

**Implication for dashboards:** any “county view of comms or social” is a **read model** that **joins** or **parses** JSON — not a single `WHERE countyId = ?` on every table.

---

*GEO-1 — media × county. Companion: [`geographic-county-mapping.md`](./geographic-county-mapping.md).*
