# Unified open work expansion (UWR-2) (RedDirt)

**Packet UWR-2** — **read-model widening only** for `open-work.ts`: additional **real** sources with explicit, actionable filters. **No** schema, **no** automation, **no** unified DB index table.

**PROTO-1 bundle:** Paired with **CM-2** (thin dashboard consumer). **Lanes advanced:** Incoming work (UWR), CM visibility, truth snapshot `openWorkCounts` shape. **Lanes not disturbed:** Assignment persistence (`positionId` still absent), email workflow policy, comms execution, seat RBAC.

**Cross-ref:** [`unified-open-work-foundation.md`](./unified-open-work-foundation.md) · [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md) · [`open-work.ts`](../src/lib/campaign-engine/open-work.ts)

---

## 1. What sources were added

| Source | Model | “Open” rule | List / href behavior |
|--------|--------|-------------|----------------------|
| **Community event ingest** | `ArkansasFestivalIngest` | `reviewStatus === PENDING_REVIEW` | In **`getOpenWorkForCampaignManager`** merge only (org-level queue); `href` = pending festival list (`/admin/workbench/festivals?filter=pending`) — **no** per-row admin detail URL in repo |
| **Actionable comms threads** | `CommunicationThread` | `threadStatus` ∈ **`NEEDS_REPLY`**, **`FOLLOW_UP`** | In **`getOpenWorkForUser`**, **`getUnassignedOpenWork`**, and therefore CM merge; `href` = `/admin/workbench?thread={id}` |

`getOpenWorkCountsBySource()` now includes **`arkansasFestivalIngest`** (pending review count) alongside existing per-source totals.

---

## 2. What sources were evaluated but rejected

| Source | Reason |
|--------|--------|
| **`Submission`** | No lifecycle / “done” column; many rows are historical captures without a modeled triage state. Counting “all submissions without `WorkflowIntake`” would mix handled and unhandled rows and risks **false open-work volume**. No first-class admin row URL for deep-linking. **Defer** until a governed queue or status exists. |
| **Broader `CommunicationThread` statuses (e.g. `ACTIVE`)** | **Too ambiguous** for “open work” — many active threads are not awaiting staff action; would flood CM triage and contradict queue-first discipline. |
| **`InboundContentItem`, review queue rows, media items`** | Not evaluated for inclusion in this packet — require per-model triage rules and packet scope; avoid speculative merges. |

---

## 3. Why they were accepted/rejected

- **Accepted** rows match **existing product semantics**: festival admin already treats `PENDING_REVIEW` as the review queue; thread enums **`NEEDS_REPLY`** / **`FOLLOW_UP`** are explicit staff-action states.
- **Rejected** rows either lack **actionable state** in schema (**`Submission`**) or would **conflate** “exists” with “needs CM triage” (**`ACTIVE`** threads).

---

## 4. How this affects Campaign Manager visibility

- **CM triage list** (`getOpenWorkForCampaignManager`) now includes **pending festival ingests** in addition to unassigned email/intake/task/actionable threads + escalated email.
- **Truth snapshot** open-work **note** and **volume** warning include **five** UWR-2 count dimensions (festival + prior four).
- **Position inbox** doc config for `campaign_manager` updated to list **CommunicationThread** + **ArkansasFestivalIngest** as included source keys (behavior still flows through `getOpenWorkForCampaignManager`).

---

## 5. What UWR-3 should do next

- **County filter** on merged lists (optional `countyId` on `UnifiedOpenWorkQueryOptions`) — read-only `where` clauses only.
- **Submission** or **financial-intake** queue — **only** with an explicit status or join rule and admin `href` (likely a new thin list page, not guessed counts).
- **Dedup** narrative when `EmailWorkflowItem` and `CommunicationThread` reference the same conversation (investigation-only; no auto-merge).

---

*Last updated: Packet UWR-2 (with CM-2 under PROTO-1).*
