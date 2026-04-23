# System domain flow map (RedDirt)

**Packet SYS-1.** Concise map of **domains**, **source of truth**, **key Prisma/TS locations**, and **public vs admin** touchpoints. Cross-ref: [`public-site-system-map.md`](./public-site-system-map.md), [`workbench-build-map.md`](./workbench-build-map.md), [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md). **Orchestration (CM-1):** [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md), [`incoming-work-matrix.md`](./incoming-work-matrix.md).

---

## Domains (source of truth → surfaces)

| Domain | Source of truth | Key models / code | Public surface | Admin / workbench |
|--------|-----------------|-------------------|----------------|-------------------|
| **Voter file & metrics** | `VoterFileSnapshot`, `VoterRecord`, `CountyVoterMetrics` | `prisma/schema.prisma` (~1769+), `src/lib/voter-file/` | `voter-registration` pages, `counties/[slug]` (metrics when wired) | `voter-import`, county admin |
| **Users / contacts** | `User` (email, phone, county, zip) | `User`, relations to threads, `linkedVoterRecordId` | Form upserts via `lib/forms/handlers.ts` | Comms workbench, email workflow FK |
| **Volunteers** | `VolunteerProfile`, `Commitment`, form-driven signup | `VolunteerProfile`, `handlers.ts` (`volunteer` form) | `get-involved`, volunteer forms | `volunteers/intake`, workbench comms |
| **Public form submissions** | `Submission` + structured JSON | `Submission` in `handlers.ts` | All `/api/forms` posts | **No single default** “submission inbox” page called out in repo; operators use task/intake patterns |
| **Workflow intake (ops queue)** | `WorkflowIntake` | `prisma` + `workbench-social-actions`, `conversation-monitoring-actions`, comms plan create | **Not** default from all public forms | Workbench, comms “from intake” |
| **Comms plans / sends / threads** | `CommunicationPlan`, `CommunicationSend`, `CommunicationThread`, `CommunicationMessage` | `src/lib/comms-workbench/` | Indirect (constituent is same `User` in DB) | `workbench/comms/*`, main `workbench` |
| **Email workflow queue** | `EmailWorkflowItem` | `src/lib/email-workflow/`, `intelligence/` | None direct | `workbench/email-queue` |
| **Conversation / social monitoring** | `ConversationOpportunity`, `ConversationItem`, clusters | `src/lib/conversation-monitoring/`, `conversation-monitoring-actions.ts` | N/A (ingestion/cron) | `workbench/social` + monitoring UIs |
| **Social workbench** | `SocialContentItem`, variants, tasks | `src/lib/social/` | N/A (published content elsewhere) | `workbench/social` |
| **Events (campaign)** | `CampaignEvent`, `EventRequest`, `EventSignup` | Calendar HQ, event admin | `events`, `campaign-calendar` | `admin/(board)/events/*`, `workbench/calendar` |
| **Community event suggestions** | `ArkansasFestivalIngest` | `suggest-community-event-action.ts` | `events#suggest` | `workbench/festivals` |
| **Broadcast / Tier-2** | `CommunicationCampaign`, recipients | Broadcast routes | N/A or limited public signup | `workbench/comms/broadcasts` |
| **Owned media / DAM** | `OwnedMediaAsset` | `admin/owned-media/*` | Site may embed if configured | Full DAM |
| **Content / review** | `SearchChunk` (RAG), CMS/editorial content | `content`, `editorial`, ingest scripts | Public stories, explainers, blog | `review-queue`, `content`, `homepage` |
| **Press / media monitor** | `ExternalMediaMention` etc. | `media-monitor` | `press-coverage` (display) | `admin/media-monitor` |
| **Tasks** | `CampaignTask` | Task engine, templates | N/A | `admin/(board)/tasks` |

---

## Likely next integration points (highest value)

1. **Submission ↔ WorkflowIntake** — explicit promotion rule or small admin list of recent `Submission`s.
2. **Email workflow triggers** — from `CommunicationThread`, failed `CommunicationSend`, or `WorkflowIntake` (see handoff).
3. **Festival ingest → Campaign event** — already implied by workbench; document state machine in one place.
4. **User ↔ VoterRecord** — schema supports `linkedVoterRecordId`; surface in admin when voter assistance flows expand.

## Obvious risks / coupling

- **Multiple public entry styles:** JSON `/api/forms` vs **server actions** (event suggest) — teams must know both.
- **Two “queues”** for narrative: `Submission` vs `WorkflowIntake` — product clarity needed.
- **Comms + email workflow** both touch mail — keep **queue-first** email policy (handoff) vs **send execution** in comms layer separate.

---

## Most strategic missing rails

1. **Unified “incoming work” view** (counts or links: submissions, intakes, festival ingests, email workflow) — *even read-only* would reduce operator thrash.
2. **Documented promotion path** from `Submission` to `WorkflowIntake` (or explicit “we never auto-promote” policy).
3. **Single diagram owner** for public form types → which admin screen reviews them (table in this doc + `public-site-system-map`).

## Best scaffolding to lay ahead (now)

- **DTO + query** for “recent submissions” (reuse `list*` patterns in `lib/`).
- **Empty server route or admin page stub** for “Intake from submission” (button disabled until policy) — *optional*; only if product agrees.
- **Keep** `docs/public-site-system-map.md` and **this file** updated when a new public `POST` path ships.

---

*Last updated: Packet SYS-1.*
