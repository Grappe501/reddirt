/**
 * Integration notes: Conversation Monitoring ↔ CampaignOS
 *
 * - **WorkflowIntake (spine)**: `ConversationOpportunity.workflowIntakeId` is set when staff route an
 *   opportunity to the intake queue (e.g. rapid response, county follow-up). Downstream: existing
 *   `WorkflowAction`, `EventRequest`, templates — unchanged; only the origin pointer is new.
 *
 * - **SocialContentItem (publishing)**: When converting to a draft/faq/clarification post, create or
 *   attach `SocialContentItem` and set `ConversationOpportunity.socialContentItemId`. Prefer
 *   `kind` = RAPID_RESPONSE or ORGANIC; link `workflowIntakeId` when the intake drove the work.
 *
 * - **CampaignTask**: Create tasks the same way as workbench / author-studio: `socialContentItemId` +
 *   `eventId` from parent when applicable; not stored on `ConversationItem` (monitoring is upstream).
 *
 * - **County**: `countyId` on item/cluster/opportunity/watchlist for trends and “route to county”;
 *   inference in `ConversationAnalysis.countyInferenceNote` + optional manual override on item.
 */

export {};
