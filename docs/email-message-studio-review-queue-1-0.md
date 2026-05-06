# Email Message Studio — Shared Draft Review Queue 1.0

**Packet:** **EMAIL-MESSAGE-STUDIO-REVIEW-QUEUE-1.0**  
**Lane:** `RedDirt/` only · **No** new Prisma migrations · **No** sends · **No** SendGrid/Gmail/OpenAI on these paths

## What shipped

1. **Review Queue** (`#review-queue`) inside Message Studio **`#shared-drafts`** — component **`MessageStudioSharedDraftReviewQueue`**, embedded from **`MessageStudioSharedDraftsPanel`**.

2. **Grouping** — shared server rows (**`MessageStudioDraft`** only) by existing **`MessageStudioDraftStatus`**: Draft, Needs review, In review, Approved for send governance, Archived (optional column via “Show archived”).

3. **Filters** — status, draft type substring, “updated recently” window, owner/reviewer text match (created-by / assigned reviewer / reviewed-by labels when present).

4. **Quick actions** (admin server actions; no provider): open draft in studio, workflow status update + submit, create revision (prompted note), archive, anchor links to **Send Packet Builder** and **Send Execution** governance / ops with `draftId` where applicable.

5. **Daily Operator Console** — existing snapshot counts for shared drafts needing review and approved for send governance remain; priority cards and rule-based next-actions now deep-link **`#review-queue`** for needs-review, in-review, and approved rows; work queue section 4 adds an explicit Review Queue bullet.

6. **Data load** — **`/message-studio`** page calls **`listMessageStudioDrafts({ includeArchived: true })`** so operators can surface archived rows when the filter requests it.

## Operator notes

- Workflow transitions use **`patchMessageStudioDraftWorkflow`** / **`patchMessageStudioDraftWorkflowAction`** — status-only updates on the existing model; archiving continues to use the existing archive path.
- **Send packet** and **Send execution** links are navigation only from this panel — they do not trigger mail.

## Checks (this packet)

Run from `RedDirt/`:

- `npm run email:db:diagnose`
- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`
