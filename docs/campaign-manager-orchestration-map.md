# Campaign Manager orchestration map (RedDirt)

**Packet CM-1.** Blueprint for the **Campaign Manager Workbench** as the top **orchestration** layer in the repo, with all other workbenches as **subordinate** operational systems. This doc does **not** implement features, permissions, or routing logic.

**Cross-ref:** [`incoming-work-matrix.md`](./incoming-work-matrix.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`workbench-build-map.md`](./workbench-build-map.md) · [`system-domain-flow-map.md`](./system-domain-flow-map.md) · [`public-site-system-map.md`](./public-site-system-map.md) · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md)

---

## 1. North star

- **Campaign Manager Workbench (conceptual + physical home):** The **command layer** from which a **single** operator (the Campaign Manager) can see **enough of incoming work, blocking issues, and campaign state** to run a statewide race **without** requiring staff in other seats on day one.
- **It is the orchestration layer** above: comms, email workflow, tasks, events, social/monitoring, intake, content review, etc. Those systems **do work**; the Campaign Manager layer **decides what must be seen next** and (later) **who else may act**.
- **Delegate without redesign:** As roles (Communications, Field, etc.) are added, **responsibility** is routed or assigned **out of** the default Campaign Manager view—**not** by duplicating new “mini–campaign HQs” per role. The **same** work objects and workbenches remain; the **inbox and assignment model** (future) attaches to them.

*Repo reality today:* There is no separate `/admin/campaign-manager` product; the **closest operational hub** is **`/admin/workbench`** (`src/app/admin/(board)/workbench/page.tsx`) with dense comms + county + card metrics. A future **dedicated** Campaign Manager home may wrap or **aggregate** that hub plus a unified “incoming work rail” (not built in CM-1).

---

## 2. Operating model (intended)

1. **Signal / entry** — A person, system, or timer produces work: e.g. public form → `Submission`, monitor → `ConversationOpportunity`, comms fail → `CommunicationSend` / webhook, event suggest → `ArkansasFestivalIngest`.
2. **Normalize** — Map to a **known domain object** (or create one): `User`, `WorkflowIntake`, `EmailWorkflowItem`, `CampaignTask`, etc. *(Today this step is **fragmented**; see matrix.)*
3. **Route** — Conceptually, each item has a **primary workbench** and optional **escalation** (email intelligence queue, plan review, etc.). *(No central router in code yet.)*
4. **Handle** — **Automated** (cron, webhooks, approved templates), **automated + review**, or **human queue** (queue-first email policy, plan approval, content review).
5. **Delegate (future)** — **Assignment** or “role default queue” (not implemented) so Field/Comms can own subsets without new tables for each role beyond existing `User` and optional `assignedToUserId` patterns.
6. **Resolve** — State updates on the **same** objects (`WorkflowIntake.status`, `EmailWorkflowStatus`, `CommunicationSendStatus`, `CampaignTask.status`, etc.) and **feeds** back into metrics on the campaign manager view.

**Campaign state** is the union of: voter pipeline metrics, event readiness, comms health, open threads, open tasks, **not** a single `CampaignState` table (no such master row assumed in the repo as of this writing).

---

## 3. Current workbenches as subordinate systems (repo evidence)

| Subordinate system | Primary route / code | In the model it… |
|--------------------|----------------------|------------------|
| **Main workbench hub** | `workbench/page.tsx` | **Primary** operator surface: comms rail, county filter, “needs reply,” calendar/orchestration lanes, thread composer. **Closest to** Campaign Manager today. |
| **Email workflow queue** | `workbench/email-queue/*`, `lib/email-workflow/*` | Queue-first **email-shaped** work units; **not** auto-send. Orchestration: triage, interpretation, later policy. |
| **Comms** | `workbench/comms/*` | **Plans, drafts, variants, sends, segments**; execution + engagement; source of “approved to send” vs email workflow **review-only** queue. |
| **Inbox (admin)** | `inbox/*` | Distinct from comms workbench **thread** rail—verify product overlap when unifying. |
| **Email workflow (above)** | same | Cross-linked to `CommunicationThread` / `Send` / `Intake` as optional FKs. |
| **Review queue** | `review-queue/page.tsx` | Content / assets needing approval. |
| **Tasks** | `tasks/page.tsx` | `CampaignTask` work; template-generated and manual. |
| **Events** | `events/*`, `workbench/calendar` | `CampaignEvent`, readiness, `EventRequest` off intake. |
| **Social + conversation** | `workbench/social`, `conversation-monitoring-*`, `workbench-social-actions` | `SocialContentItem`, `ConversationOpportunity` → can create `WorkflowIntake`. |
| **Festival / community events** | `workbench/festivals` | `ArkansasFestivalIngest` from public suggest + ingest. |
| **Media / press** | `media-monitor` | External mentions, monitoring. |
| **Owned media + distribution** | `owned-media/*`, `distribution` | DAM and downstream publish paths. |
| **Volunteers** | `volunteers/intake` | Intake from owned media / documents. |
| **Voter import** | `voter-import` | File pipeline, not public forms. |
| **Orchestrator (platform)** | `orchestrator/page.tsx` | **Inbound `InboundContentItem`** from connected platforms (distinct pattern from “Campaign Manager” naming—**social/content** orchestration, not the full campaign rail). |
| **Content / editorial** | `content`, `editorial`, `homepage` | Site content ops. |
| **County (admin)** | `admin/counties/*` | County command vs public `counties` pages. |

**Insight:** The **orchestrator** page is **mature** for **one** slice (inbound social content review). The **workbench** is **mature** for **comms + threads + county**. A future **Campaign Manager** shell might **embed links/counts** to both plus email workflow, submissions, intakes (matrix).

---

## 4. Incoming work rails (sources today)

Synthesized from [`incoming-work-matrix.md`](./incoming-work-matrix.md) and system maps. **Unified:** mostly **no**—multiple first-class object types and UIs.

---

## 5. Unified incoming work problem

**Fragmentation:**

| Split | What happens |
|-------|----------------|
| **Submission vs WorkflowIntake** | Public `POST /api/forms` creates **`Submission`**; many operator flows expect **`WorkflowIntake`** (created from social/monitoring actions, not from every form in `handlers.ts`). |
| **Email-shaped work** | Lives in **Comms** (threads, sends, execution), **`EmailWorkflowItem`** (queue intel), and **Gmail** integration—same **human** may appear as **`User` + thread**; three conceptual layers. |
| **Monitoring → work** | Conversation/social **items/opportunities** are **actionable** in workbench UIs; not always the same DTOs as comms or email workflow. |
| **Public signal vs operator queue** | `ArkansasFestivalIngest` has a workbench; **`Submission`** has no first-class “inbox” page in the doc inventory. |

**Conceptual “single incoming work rail” (not an implemented table):** A **normalized index** of “open work for the campaign” with pointers to: `submissionId?`, `workflowIntakeId?`, `emailWorkflowItemId?`, `threadId?`, `conversationOpportunityId?`, `festivalIngestId?`, `inboundContentItem?`, `taskId?`, `reviewId?`—with **one** place to **sort, filter, assign** (future). Today that index **does not exist**; the Campaign Manager must hop workbenches.

**Honest scope:** Building that index is a **multi-packet** effort; CM-1 only names the target shape.

---

## 6. Role / delegation model (future-safe, not implemented)

| Likely role | Subordinate work that **logically** moves off CM default later | Notes |
|-------------|------------------------------------------------------------------|------|
| **Campaign Manager** | Keeps: cross-bench **priorities**, escalations, **unassigned** or **strategic** items | Last to lose **orchestration** home. |
| **Communications Director** | `CommunicationPlan` review/approve, `EmailWorkflowItem` when policy allows, comms workbench, thread triage (policy) | Uses same models; `assignedToUserId` patterns exist on several rows. |
| **Volunteer Coordinator** | `VolunteerProfile`, volunteer pipeline, parts of `WorkflowIntake` (volunteer interest) | |
| **Field / County Coordinator** | County filters (already in workbench), `CampaignEvent` field readiness, `County` content | `countyId` on many objects. |
| **Research / Monitoring** | `ConversationOpportunity`, `media-monitor`, `ConversationItem` triage | |
| **Content / Media** | `review-queue`, `owned-media`, `SocialContentItem`, `editorial` | |
| **Events** | `CampaignEvent` HQ, `ArkansasFestivalIngest` promote path, `EventRequest` | |

**No RBAC in CM-1:** Names are for **routing design**; implementation is a later packet.

---

## 7. Automation strata (conceptual, grounded in repo)

| Stratum | Examples in repo (illustrative) |
|---------|----------------------------------|
| **Fully automated (within guardrails)** | Webhooks updating `CommunicationRecipient` / send status; cron for festivals ingest (`api/cron/*`); some broadcast/calendar cron (see routes). **Must stay bounded—no silent sends without policy.** |
| **Automated with review** | `EmailWorkflowItem` **interpretation** (heuristics, E-2); comms “queued” then operator executes send; **AI classify** on form submission (`classifyIntake`)—human still owns CRM. |
| **Manager review** | `EmailWorkflowItem` default queue-first; plan approval; strategic sends. |
| **Specialist review** | Legal/compliance (if future), high-escalation `EmailWorkflow` rows, `review-queue` for content. |

---

## 8. Recommended build sequence (post CM-1, leverage-ordered)

1. **Read-only “incoming work” aggregate** (counts + deep links) on **`/admin/workbench` or a thin `/admin/campaign` hub**—no new business logic, just queries + links (ties to `incoming-work-matrix.md`).
2. **Submission list + optional “promote to intake”** (one action, one policy) — addresses largest fragmentation.
3. **Email workflow + comms** drill-down: thread/send → `EmailWorkflowItem` (already modeled FKs; wire one **manual** create path if not present).
4. **Unified filter DTOs** (pattern only): same list filters for `EmailWorkflowListFilters`-style for submissions later.
5. **Assignment model** (optional user FK or join table) **after** aggregate exists—avoid perm-system sprawl per handoff.

---

## 9. Fastest path to “one person can run the campaign” (minimum existence)

1. **One** screen with **unified counts** of: open `Submission` (or queue), `WorkflowIntake` PENDING+ , `EmailWorkflowItem` not CLOSED, failed/suspicious `CommunicationSend` (rollup exists in comms DTOs), `CampaignTask` overdue, `ArkansasFestivalIngest` pending, **optionally** `InboundContentItem` PENDING. *(Implementation = future packet.)*
2. **Stable** navigation from that screen to existing workbenches (no new workbench logic).
3. **Documented** promotion paths (Submission → Intake, festival → event) so the single operator is not reverse-engineering Prisma.
4. **Policy** for what may never auto-run without review (align with `email-workflow-intelligence-AI-HANDOFF.md` until changed).

---

*Last updated: Packet CM-1.*
