/**
 * Ingestion pipeline plan (public sources only, aggregate signals; no private profile tracking).
 *
 * Stages (server-side; adapters are TODO — wire cron, webhooks, or manual “refresh” from admin):
 *
 * 1. **Source adapters** — each returns normalized rows with `sourceKind`, `externalKey`, `channel`,
 *    `publicPermalink`, `bodyText`, `publishedAt`, optional `rawMetadata` (no PII).
 *    - Social platform APIs: official public search / public page posts (TOS + rate limits)
 *    - News/RSS: partner feeds, open press listing pages
 *    - `MANUAL_ENTRY`: operator paste of public link + text for triage
 *
 * 2. **Normalize** — write `ConversationItem` (idempotent on `sourceKind` + `externalKey` when set).
 *    - Strip handles if policy requires; never store DMs, signups, or voter data here.
 *
 * 3. **Enrich (rules + AI)** — upsert `ConversationAnalysis`:
 *    - `summary`, `ConversationClassification`, `ConversationSentimentLabel`, `ConversationUrgency`,
 *      `issueTags`, `countyInferenceNote` (from text + public geo hints only)
 *    - Suggested public response shape in `suggestedAction` (not a direct reply to a person)
 *    - Route: `POST /api/conversation-monitoring/analyze` (TODO) with batching + `analyzerVersion`
 *
 * 4. **Cluster** — embed / keyword similarity → `ConversationCluster` + `ConversationClusterItem`
 *    - Merge clusters when `clusterKey` matches; `MERGED` when folded
 *
 * 5. **Opportunities** — rules on urgency + issue spread → `ConversationOpportunity` with
 *    `primaryItem` / `cluster` links; status `OPEN` until routed to `WorkflowIntake` or `SocialContentItem`
 *
 * 6. **Operator actions** (workbench) — `ConversationOpportunity` → create `WorkflowIntake` and/or
 *    `SocialContentItem` (RAPID_RESPONSE, etc.) and link back; `CampaignTask` from existing patterns
 *
 * Security / compliance: document each adapter’s data use; retain raw links for audit, not PII.
 */

export const INGESTION_ADAPTER_HOOKS = {
  socialAdapter: "TODO: pluggable e.g. X search id → ConversationItem + MANUAL if blocked",
  rssAdapter: "TODO: feed URL + etag cursor per `ConversationWatchlist`",
  analyzeBatch: "POST /api/conversation-monitoring/analyze { batchUnanalyzed: true, limit } or { conversationItemId } — rules v1 + opportunity sync",
} as const;
