# Incoming work matrix (RedDirt)

**Packet CM-1.** Planning artifact: **sources of work or signals** → **where they land** → **gaps** for a future unified rail. Update when new `POST` paths or workbenches ship.

**See also:** [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`system-domain-flow-map.md`](./system-domain-flow-map.md) · [`public-site-system-map.md`](./public-site-system-map.md)

| Source / trigger | Entry point | Source object (model) | Current destination (where processed) | Current visibility to operator | Missing routing (vs ideal rail) | Likely owner role (later) | Automation suitability | Notes / risks |
|------------------|------------|------------------------|----------------------------------------|----------------------------------|-----------------------------------|----------------------------|------------------------|--------------|
| Public movement forms (join, volunteer, local team, host, democracy) | `POST /api/forms` | `User` (upsert), `Submission` | **DB only**; no default **WorkflowIntake** in `lib/forms/handlers.ts` | **No** dedicated “submissions” admin page in inventory | **List + triage** view; optional promote to `WorkflowIntake` | Vol / CM / Field | Classify: optional `classifyIntake` (OpenAI) — still human CRM | PII; must align with comms consent |
| Story submission | `POST /api/forms` | `Submission` (type story), `User` | DB | Same gap | **Review queue** or editorial path if type-filtered | Content | Low auto | `handlers.ts` branch |
| Suggest community event | `suggest-community-event-action.ts` (server action) | `ArkansasFestivalIngest` | `workbench/festivals` (promote / review) | **Yes** (festival workbench) | Unify with other “suggested” intakes in one index | Events / Field | Ingest can be semi-auto | **Different** from `/api/forms` — two patterns |
| Workflow intake (ops-created) | Admin/social/monitoring actions | `WorkflowIntake` | `WorkflowIntake` + linked plans/tasks | **Yes** in flows that list intake | **Public form → Intake** not universal | CM / Comms / Vol | Varies | Created from e.g. `workbench-social-actions`, `conversation-monitoring-actions` |
| Conversation / social monitoring | Ingestion + workbench UIs, `analyze` API | `ConversationItem`, `ConversationOpportunity`, clusters | `workbench/social` | **Yes** in social command UI | Single **cross-link** to `EmailWorkflowItem` or comms (future) | Research / Comms / CM | Suggest-only until policy | See `lib/conversation-monitoring/` |
| Comms: inbound thread / message | Staff tools, Gmail, webhooks | `CommunicationThread`, `CommunicationMessage` | `workbench/page.tsx` thread rail, composer | **Yes** (core workbench) | Map **failed sends** to email workflow item (future packet) | Comms / CM | Auto status via webhooks | Tier-3 workbench data |
| Comms: send failure / queue | `CommunicationSend`, webhooks, retries | `CommunicationSend` | Comms workbench, retry UIs (see `comms-workbench-send-*-actions.ts`) | **Yes** for operators in comms | **One** “needs attention” row on CM hub | Comms | Retry automation exists (12A) — still operator-gated in places | **Overlaps** email **shape** with `EmailWorkflowItem` — policy clarity |
| Email workflow intelligence (queue) | Manual create, future triggers | `EmailWorkflowItem` | `workbench/email-queue` | **Yes** (dedicated) | Inbound **automation** not in repo for creation | Comms / CM | Interpretation: heuristic (E-2) — not LLM in E-1/E-2 | **Not** auto-send (handoff) |
| Public press / own pipeline | Cron, feeds | `ExternalMediaMention` (pattern) | `media-monitor` | **Yes** | Tie mention → task or opportunity (future) | Research | Alert + digest possible | `lib/media-monitor/` |
| Inbound social content (connected platforms) | Sync + `orchestrator` | `InboundContentItem` | `orchestrator/page.tsx` | **Yes** | **Different** UX from workbench; CM hub should **link** here | Social / Content | Featurable with review | Not the same as comms **email** |
| Campaign task (template / manual) | Event/workflow/social | `CampaignTask` | `tasks`, event HQ | **Yes** (tasks page) | Overdue rollups on **workbench** cards partially | Field / CM | Template auto-create exists for events | `CampaignTask` blocks readiness flags |
| Event RSVP / signups (when implemented on public) | Varies by page | `EventSignup` (if used) | Event admin | **If** wired | **Public event → workbench** consistency | Events | — | **Verify** each public event flow; not one matrix row covers all |
| Content / owned media review | Upload / pipeline | `OwnedMediaAsset`, review status | `review-queue`, `owned-media` | **Yes** | Bridge to `CommunicationPlan` or social (where linked) | Content | Workflow states | DAM complexity |
| Voter file import (admin) | `voter-import` scripts / UI | `VoterFileSnapshot`, `VoterRecord` | Admin tools | **Yes** to admins | **Public** never writes here | Data / CM | Batch only | **Not** a “submission” path |
| Search / assistant (public) | `/api/search`, `/api/assistant` | `SearchChunk`, rate limits | No CRM write | N/A (public) | If “flag for follow-up” product: new object | — | RAG/answer | **Stays** read-only unless product adds capture |

**Legend — automation suitability (rough):** *High* = safe to pre-process with strong guardrails; *Low* = human-first.

---

*Last updated: Packet CM-1.*
