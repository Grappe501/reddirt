# Database / Prisma model inventory (DBMAP-1) (RedDirt)

**Source:** `prisma/schema.prisma` · **Model count:** **116** (verified by script `scripts/print-prisma-inventory.mjs`; includes VOTER-MODEL-1 + INTERACTION-1 + REL-2 tables).

---

## 1. North star

This inventory **lists every** persisted Prisma **model** so engineers and operators can **see what already exists** before designing **LAUNCH-1+**, new workbenches, or integrations. It is a **practical** map, **not** a replacement for `prisma studio` or **ERD** tools. “**Active**” vs “**legacy / unclear**” is **heuristic** (routes, relations, and recent docs)—**correct** when in doubt in **code** or **migrations**, not in this file alone.

---

## 2. Full model / table inventory (alphabetical)

**Columns:** **Purpose** (one line) · **Domain / rail** · **Key relations** (not exhaustive) · **Notes** (active vs legacy, caution) · **Launch activation** (does this model matter for the **first re-engagement** wave? — **H** high, **M** medium, **L** low, **—** not directly).

| Model | Purpose | Domain / rail | Key relations (summary) | Active / notes | Launch |
|-------|---------|----------------|---------------------------|----------------|--------|
| `AdminContentBlock` | Homepage/admin modular content block storage | Site / admin CMS | (standalone JSON-ish blocks) | Active for homepage builder | L |
| `AnalyticsEvent` | Product / analytics event log | AI / analytics | User optional | Active | L |
| `AnalyticsRecommendationOutcome` | Social analytics rec → work item / intake linkage | Social + AI / ops | SocialContentItem, WorkflowIntake | Active | M |
| `ArkansasFestivalIngest` | Festival line ingest from web/RSS/FB/IG, review before public | Field / content | County, optional CampaignEvent | Active in festivals rail | M |
| `AudienceSegment` | Tier-2 segment definition JSON for `CommunicationCampaign` | Communications (broadcast) | CommunicationCampaign | Active | **H** (lists) |
| `BudgetLine` | Planned $ line in a `BudgetPlan` (wire kind) | Finance / budget | BudgetPlan | Active | L |
| `BudgetPlan` | Named budget plan + period, status | Finance / budget | BudgetLine | Active | L |
| `CalendarSource` | Google Calendar source for HQ sync (OAuth-backed) | Events / calendar | User, CalendarWatchChannel, CampaignEvent? | Active | M |
| `CalendarWatchChannel` | GCal push watch metadata | Events / calendar | CalendarSource | Active | L |
| `CampaignEvent` | Core scheduled campaign event, visibility, county | Events / calendar | County, User owner, many dependents | **Core** | **H** |
| `CampaignTask` | Workbench task (type, status, assignee) | Workflow / tasks | User, events, intakes, social, etc. | **Core** | **H** |
| `Commitment` | Generic per-user commitment (`type` + `metadata` JSON) | Identity / people | User | Light use | M |
| `CommsPlanAudienceSegment` | Message-plan audience segment (CE-1+), not Tier-2 `AudienceSegment` | Communications (workbench) | CommunicationPlan, members | Active | **H** |
| `CommsPlanAudienceSegmentMember` | Member of a comms plan segment (User, Volunteer, or `crmContactKey`) | Communications (workbench) | CommsPlanAudienceSegment, User, VolunteerProfile | Active | **H** |
| `CommunicationActionQueue` | Suggested/queued comms action (incl. calendar-driven types) | Communications (Tier 1 ops) | Thread, User | Active | M |
| `CommunicationCampaign` | Tier-2 broadcast campaign (status, template, audience) | Communications (broadcast) | Template, segment, event, User | Active | **H** (if broadcast used) |
| `CommunicationCampaignRecipient` | Per-recipient row for a broadcast + engagement | Communications (broadcast) | Campaign, User, VolunteerProfile, message | Active | **H** |
| `CommunicationDraft` | Channel-specific copy for a `CommunicationPlan` (workbench) | Communications (workbench) | CommunicationPlan, variants, sends | **Core** for planned sends | **H** |
| `CommunicationLinkDefinition` | UTM/tracking link defs for a send | Communications (workbench) | CommunicationSend | Active | L |
| `CommunicationMessage` | One SMS/email message in a `CommunicationThread` (Tier 1) | Communications (1:1) | Thread, campaign optional, user sent | **Core** for 1:1 | **H** |
| `CommunicationPlan` | Workbench comms “plan” w/ objective, sources, drafts | Communications (workbench) | Intake, task, event, social, drafts, segments | **Core** | **H** |
| `CommunicationRecipient` | Per-recipient for a workbench `CommunicationSend` + events | Communications (workbench) | CommunicationSend, segment, user | Active | **H** |
| `CommunicationRecipientEvent` | Open/click/bounce style events for recipient | Communications (workbench) | CommunicationRecipient | Active | M |
| `CommunicationSend` | Workbench send execution unit (status, queue, segment ref) | Communications (workbench) | Plan, draft, variant, recipients | **Core** for sends | **H** |
| `CommunicationTag` | Tag for organizing threads or templates | Communications | ThreadTag | Active | L |
| `CommunicationTemplate` | Reusable copy template for broadcast | Communications (broadcast) | Campaigns | Active | M |
| `CommunicationThread` | 1:1/operational comms thread (SMS/EMAIL) + AI hints | Communications (1:1) | User, VolunteerProfile, County, messages | **Core** | **H** |
| `CommunicationThreadTag` | M2M thread ↔ tag | Communications | Thread, tag | Active | L |
| `CommunicationVariant` | Workbench A/B, segment, or channel override under a draft | Communications (workbench) | CommunicationDraft, sends | Active | M |
| `ComplianceDocument` | Admin-uploaded compliance file metadata + path | Compliance | User uploader | Active | L |
| `ContactPreference` | Email/SMS opt-in, suppression, thread-only rows | Comms + identity | User, VolunteerProfile, Thread | **Core** consent | **H** |
| `ContentDecision` | Routing decision on `InboundContentItem` | Social / content hub | InboundContentItem | Active | L |
| `ContentItemOverride` | Override visibility/teaser for editorial collections | Site / content | MediaAsset | Active | L |
| `ConversationAnalysis` | Per-item AI/heuristic analysis in monitoring | Social / monitoring | ConversationItem? | Active | L |
| `ConversationCluster` | Cluster of public conversation items (county-scoped) | Social / monitoring | County, items, opps | Active | M |
| `ConversationClusterItem` | Bridge cluster ↔ `ConversationItem` | Social / monitoring | Cluster, item | Active | L |
| `ConversationItem` | Ingested public comment/post for monitoring | Social / monitoring | Watchlist, county | Active | M |
| `ConversationOpportunity` | Actionable “respond” op → intake/social/EmailWorkflow | Social / field / comms | County, Intake, SocialContent, EmailWorkflow | **Core** for routing | M |
| `ConversationWatchlist` | Named watchlist of sources for monitoring | Social / monitoring | User | Active | L |
| `County` | Canonical AR county (public + FK spine) | Field / geo | Voter, events, metrics, many | **Core** | **H** |
| `CountyCampaignStats` | Per-county org metrics (reg goal, volunteers, pipeline) | Field / data | County | Active | M |
| `CountyElectedOfficial` | Display/elected record for county pages | Public / content | County | Active | L |
| `CountyPublicDemographics` | Census-style snapshot for county | Public / content | County | Active | L |
| `CountyVoterMetrics` | Voter file rollup for county + snapshot (goals, new regs) | Voter / targeting | County, VoterFileSnapshot | **Core** for metrics | M |
| `EmailWorkflowItem` | Email ops queue (E-1+): triage, **no** default auto-send | Email workflow + comms | Thread, plan, send, many FKs | **Core** for launch **responses** | **H** |
| `EventAnalyticsSnapshot` | Per-event marketing analytics snapshot | Events / analytics | CampaignEvent, county | Active | L |
| `EventApproval` | Staged approval of event for publish | Events | User, event | Active | L |
| `EventRequest` | 1:1 with intake sometimes — event “request” object | Events / workflow | WorkflowIntake | Active | M |
| `EventSignup` | Public signup for a `CampaignEvent` (PII) | Field / events | User?, VolunteerProfile?, County, event | **Core** for volunteers | **H** |
| `EventStageChangeLog` | Event lifecycle/audit | Events | User actor | Active | L |
| `EventSyncLog` | Google sync attempt log | Events / calendar | Event, CalendarSource | Active | L |
| `ExternalMediaIngestRun` | Batch ingest run for media monitor | PR / media | — | Active | L |
| `ExternalMediaMention` | Ingested press/social hit | PR / media | County, event, event analytics | Active | M |
| `ExternalMediaSource` | Config for a monitor source | PR / media | — | Active | L |
| `FestivalCoveragePlanSnapshot` | Snapshot of festival coverage plan | Field / festival | (ties to ingest) | Active | L |
| `FestivalIngestRun` | Run metadata for festival crawl | Field / festival | — | Active | L |
| `FieldAssignment` | User/position/optional seat ↔ `FieldUnit` (FIELD-1) | Field / org | FieldUnit, User, PositionSeat | Active (new) | M |
| `FieldUnit` | Named county/region field unit (FIELD-1) | Field / org | self-parent, assignments | Active (new) | M |
| `FinancialTransaction` | Internal ledger line (FIN-1/2) | Finance | User related, event | Active | L |
| `HomepageConfig` | Homepage feature slots + curation | Site / content | (singleton-ish) | Active | L |
| `InboundContentItem` | Normalized item from YT/Substack/FB/IG for hub | Social / content | MediaAsset, SyncedPost, decisions | **Core** for hub | L |
| `MediaAsset` | URL-registered media (images, oEmbed) | Media / content | Inbound, owned refs | **Core** | L |
| `MediaIngestBatch` | Batch tracking for media ingest | Media | User | Active | L |
| `MediaOutreachItem` | Press pitch / follow-up w/ plan + intake + opp | PR + comms | CommunicationPlan, Intake, ConversationOpp | Active | M |
| `OwnedMediaAnnotation` | Region/mark on `OwnedMediaAsset` | Media / DAM | OwnedMedia | Active | L |
| `OwnedMediaAsset` | Campaign DAM binary metadata | Media / DAM | County, many refs | **Core** for creative | M |
| `OwnedMediaCollection` | Grouping for DAM | Media / DAM | items | Active | L |
| `OwnedMediaCollectionItem` | M2M collection ↔ asset | Media / DAM | — | Active | L |
| `OwnedMediaDerivativeJob` | Transcode/derivative job for asset | Media / DAM | OwnedMedia | Active | L |
| `OwnedMediaQuoteCandidate` | Auto quote candidate for review | Media / DAM | — | Active | L |
| `OwnedMediaReviewLog` | Human review of asset | Media / DAM | User, asset | Active | L |
| `OwnedMediaTranscript` | Transcript of owned media | Media / DAM | Asset | Active | L |
| `PlatformConnection` | Social/platform connector (FB/IG/YT/Substack) | Content orchestration | `PlatformMetricSnapshot` | Active | L |
| `PlatformMetricSnapshot` | Metrics for a connected platform | Content | PlatformConnection | Active | L |
| `PositionSeat` | One seat per ROLE-1 `positionKey` (staffing metadata) | Positions / SEAT-1 | User | Active | M |
| `RelationalContact` | Volunteer-owned named contact; optional voter match; power-of-5 flags | Field / REL-2 | User (owner), VoterRecord?, County?, FieldUnit? | **New**; human-entered | M |
| `SearchChunk` | Vector RAG `SearchChunk` for assistant | AI / RAG | — | **Core** for search | M |
| `SignupSheetDocument` | Scanned sign-in sheet | Field / vol intake | User volunteer, entries | Active | M |
| `SignupSheetEntry` | One row; match to Voter / User | Field / vol intake | VoterRecord?, User? | Active | M |
| `SignupSheetExtraction` | OCR/extract batch for a doc | Field / vol intake | Document | Active | L |
| `SiteSettings` | Substack URL + sync hints | Site / ops | — | Active | L |
| `SocialAccount` | Outbound account/handle for campaign | Social | — | **Core** for publish | M |
| `SocialContentDraft` | Author studio draft for social item | Social | SocialContentItem | Active | M |
| `SocialContentItem` | Social post work item + variants, tasks, analytics | **Social (core)** | Intake, event, many | **Core** | M |
| `SocialContentMediaRef` | Join social work item ↔ `OwnedMediaAsset` | Social / DAM | SocialContentItem, asset | **Core** | M |
| `SocialContentStrategicInsight` | Strategy notes on a social work item | Social | SocialContentItem | Active | L |
| `SocialPerformanceSnapshot` | Snapshot of per-post metrics | Social / analytics | SocialContentItem | Active | M |
| `SocialPlatformVariant` | Per-network copy/schedule | Social | SocialContentItem | **Core** | M |
| `StaffGmailAccount` | Staff Gmail OAuth for human send/reply | Communications | User | **Core** (when wired) | **H** (reply path) |
| `Submission` | Public form `Submission` blob | Intake / workflow | User?, WorkflowIntake? | **Core** for capture | **H** |
| `SyncedPost` | Substack/legacy blog post mirror | Content / site | Inbound? | Active | L |
| `TeamRoleAssignment` | String `roleKey` on user, optional county (not RBAC) | Field / org | User, County | Light | M |
| `User` | **Primary** `User` (email id); optional `linkedVoterRecordId` | **Identity (core)** | Voter, Volunteer, threads, everything | **Core** | **H** |
| `VolunteerAsk` | Public ask to amplify/RSVP/etc. | Field / volunteer | User | Active | M |
| `VolunteerMatchCandidate` | Scored Voter match for signup entry | Voter + volunteer | Voter, Signup entry | Active | M |
| `VolunteerProfile` | 1:1 extension for volunteer; skills text | **Identity / volunteer** | User | **Core** for volunteers | **H** |
| `VoterFileSnapshot` | One voter file import batch | Voter / data | Voter, metrics | **Core** ETL | M |
| `VoterInteraction` | Staff-logged touchpoint (channel, type, optional support) | Voter / field (VOTER-MODEL-1) | VoterRecord?, User (contact + volunteer), RelationalContact? | **New**; provisional | M |
| `VoterModelClassification` | Tier label + confidence + provenance (`isCurrent`) | Voter / data (VOTER-MODEL-1) | VoterRecord, User? override | **New**; inferred unless human | M |
| `VoterRecord` | Voter file row: `voterFileKey`, county, **precinct?** | **Voter (core)** | County, User links | **Core** | M |
| `VoterSignal` | Provenance signal row (kind, strength, source) | Voter / data (VOTER-MODEL-1) | VoterRecord?, User?, RelationalContact? | **New** | M |
| `VoterSnapshotChange` | Row-level diff in a snapshot | Voter / data | Snapshot, Voter, County | Active ETL | L |
| `VoterVotePlan` | Vote-plan seed (status, reminders) | GOTV / field (INTERACTION-1) | VoterRecord, User? | **New** | M |
| `WeeklyBigRock` | Big rock in weekly plan (CM planning) | Ops / planning | WeeklyCampaignPlan | Active | L |
| `WeeklyCampaignPlan` | Week-at-a-glance plan | Ops / planning | User | Active | L |
| `WorkflowAction` | Audit action on a `WorkflowIntake` | Workflow / tasks | Intake, User | Active | M |
| `WorkflowIntake` | **Ops** intake from submission / other sources | **Workflow (core)** | Submission, County, User, EventRequest, etc. | **Core** for routing | **H** |
| `WorkflowRun` | Template run instance | Events / tasks | Template | Active | M |
| `WorkflowTemplate` | Reusable event workflow template | Events / tasks | tasks | Active | M |
| `WorkflowTemplateTask` | Task definition in a template | Events / tasks | template | Active | M |

*End of 116 models.*

---

## 3. Domain grouping (all models)

- **Identity / people:** `User`, `VolunteerProfile`, `ContactPreference`, `Commitment`, `TeamRoleAssignment`, `StaffGmailAccount`, `EventSignup` (PII)
- **Voter file / targeting:** `VoterRecord`, `VoterFileSnapshot`, `VoterSnapshotChange`, `CountyVoterMetrics`, `VoterSignal`, `VoterModelClassification`, `VoterInteraction`, `VoterVotePlan`, `VolunteerMatchCandidate` (join), `SignupSheetEntry` (match)
- **Communications (multi-rail):** `CommunicationThread`, `CommunicationMessage`, `CommunicationCampaign`, `CommunicationTemplate`, `AudienceSegment`, `CommunicationCampaignRecipient`, `CommunicationActionQueue`, `CommunicationTag`, `CommunicationThreadTag`, `CommunicationPlan`, `CommunicationDraft`, `CommunicationVariant`, `CommunicationSend`, `CommunicationRecipient`, `CommunicationRecipientEvent`, `CommunicationLinkDefinition`, `CommsPlanAudienceSegment`, `CommsPlanAudienceSegmentMember`, `EmailWorkflowItem`, `MediaOutreachItem`
- **Email workflow (distinct product):** `EmailWorkflowItem` (also under comms) — **triage** rail
- **Workflow / tasks:** `WorkflowIntake`, `WorkflowAction`, `EventRequest`, `CampaignTask`, `WorkflowTemplate`, `WorkflowTemplateTask`, `WorkflowRun`, `Submission`
- **Field / geography:** `County`, `CountyCampaignStats`, `FieldUnit`, `FieldAssignment`, `VolunteerAsk`, `ArkansasFestivalIngest`, `FestivalIngestRun`, `FestivalCoveragePlanSnapshot`
- **Social / content / media:** `SocialContentItem`, `SocialPlatformVariant`, `SocialAccount`, `SocialContentMediaRef`, `SocialContentDraft`, `SocialPerformanceSnapshot`, `SocialContentStrategicInsight`, `AnalyticsRecommendationOutcome`, `ConversationWatchlist`, `ConversationItem`, `ConversationAnalysis`, `ConversationCluster`, `ConversationClusterItem`, `ConversationOpportunity`, `PlatformConnection`, `PlatformMetricSnapshot`, `InboundContentItem`, `ContentDecision`, `MediaAsset`, `SyncedPost`, `MediaIngestBatch`, `AdminContentBlock`, `HomepageConfig`, `ContentItemOverride`, `SiteSettings`
- **DAM (owned):** `OwnedMediaAsset` + `OwnedMediaAnnotation`, `OwnedMediaTranscript`, `OwnedMediaQuoteCandidate`, `OwnedMediaCollection` (+`Item`), `OwnedMediaReviewLog`, `OwnedMediaDerivativeJob`, `SignupSheetDocument` (+`Extraction`)
- **Compliance / finance / budget:** `ComplianceDocument`, `FinancialTransaction`, `BudgetPlan`, `BudgetLine`
- **Events / calendar:** `CampaignEvent`, `CalendarSource`, `CalendarWatchChannel`, `EventApproval`, `EventStageChangeLog`, `EventSyncLog`, `EventAnalyticsSnapshot`, `WeeklyCampaignPlan`, `WeeklyBigRock`
- **PR / earned monitor:** `ExternalMediaSource`, `ExternalMediaMention`, `ExternalMediaIngestRun`
- **AI / search / RAG / analytics:** `SearchChunk`, `AnalyticsEvent` (+ social analytics on social tables)

---

## 4. High-value tables for immediate reuse

- **`User`**, **`ContactPreference`**, **`VolunteerProfile`**, **`CommunicationThread`** / **`CommunicationMessage`**, **`CommunicationPlan`** + **`CommunicationSend`**, **`EmailWorkflowItem`**, **`WorkflowIntake`**, **`Submission`**, **`CampaignEvent`**, **`EventSignup`**, **`CampaignTask`**
- Voter: **`VoterRecord`** + **`User.linkedVoterRecordId`**
- **Tier-2** if broadcast path chosen: **`CommunicationCampaign`**, **`AudienceSegment`**, **`CommunicationCampaignRecipient`**

---

## 5. Underused or easy to overlook

- **`CommsPlanAudienceSegment`** (distinct from `AudienceSegment`) — message-plan list building
- **`Commitment`** — structured intent without a new table (if `metadata` conventions added)
- **`TeamRoleAssignment`** + **`FieldAssignment`** — lightweight org/field without RBAC
- **`MediaOutreachItem`** + **`CommunicationPlan`** — launch **press** story without mistaking for voter SMS
- **`EventSignup`** as **re-engagement** list even when **`VolunteerProfile`** is missing (email on signup row)

---

## 6. Risks / cautions

- **Do not** treat **`AudienceSegment.definitionJson`** or campaign **`audienceDefinitionJson`** as “safe SQL targeting” without **human** review.
- **Do not** conflate **Tier-1** threads with **Comms** **workbench** **`CommunicationSend`** or **EmailWorkflowItem** **send**—policy and **E-1** handoff differ.
- **`AnalyticsEvent` vs `VoterRecord`**: not the same as **NGP VAN**; **Voter** **rows** are **SOS**-style in **this** app.
- **Counties** in **`User.county` (string)** may **differ** from **`County.id`** on **`VoterRecord`**.

---

*Last updated: Packet DBMAP-1.*
