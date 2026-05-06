# Email AI — Task Intelligence (queue)

**Packet:** **EMAIL-AI-TASK-INTELLIGENCE-1.0**  
**Lane:** `RedDirt/` only · **No** calendar writes · **No** sends · **No** automatic `CampaignTask` creation.

## Purpose

Turn **EmailWorkflowItem** queue context (row summaries + optional prior `metadataJson.emailAiAnalysis` excerpt) into a **structured list of recommended campaign tasks** (titles, types, urgency, suggested owner role, due window, dependencies, calendar relevance hints, flags). Operators copy or download JSON and execute work in approved systems — RedDirt does **not** book calendar events or create tasks in the database from this path.

## Code

| Piece | Path |
|--------|------|
| Types, normalization, OpenAI runner | `src/lib/email-command-center/ai-task-intelligence.ts` |
| Admin server action | `src/app/admin/email-task-intelligence-actions.ts` → `generateTaskRecommendationsForQueueItemAction` |
| Queue detail UI | `src/components/admin/email-workflow/EmailWorkflowTaskIntelligenceSection.tsx` |
| Snapshot count | `countEmailWorkflowItemsWithEmailTaskIntelligence` in `src/lib/email-workflow/queries.ts` · `openAi.emailTaskIntelligenceQueueItemsCount` in `read-model.ts` |
| Output contract (registry) | `getEmailAiOutputContract("emailTaskIntelligence")` in `ai-brain-registry.ts` |

## Persistence

Envelope stored at **`metadataJson.emailTaskIntelligence`** (version `1`), alongside existing keys such as `emailAiAnalysis`. Merges existing `metadataJson` keys; does not change `status`, assignments, or linked records.

## Task categories (model `taskType` slugs)

`reply_needed`, `call_needed`, `schedule_follow_up`, `volunteer_follow_up`, `donor_follow_up`, `press_follow_up`, `issue_research`, `event_request`, `data_cleanup`, `profile_review`, `audience_review`, `draft_message`, `escalate_to_candidate_principal`, `legal_compliance_review`.

## Operator flow

1. Open **`/admin/workbench/email-queue/[id]`**.  
2. Optionally run **AI Email Intelligence** first for richer context.  
3. **Generate task recommendations** in **AI Task Intelligence**.  
4. Use **Copy JSON export** / **Download JSON** for handoff; create real tasks and calendar blocks manually outside RedDirt as policy allows.

## Related docs

- [`email-ai-intelligence-architecture-audit.md`](./email-ai-intelligence-architecture-audit.md)  
- [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)  
- [`email-dashboard-operator-runbook.md`](./email-dashboard-operator-runbook.md)  
