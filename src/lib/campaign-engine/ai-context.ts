/**
 * BRAIN-1: Placeholder types for how context is assembled for the campaign brain.
 * Real assembly lives in /api/assistant, /api/search, and lib/openai/search.ts today.
 */

import type { CampaignBrainTouchpoint } from "./ai-brain";

export type BrainContextSource =
  | "search_chunk_rag"
  | "thread_messages"
  | "email_workflow_row"
  | "comms_plans_sends"
  | "form_submission"
  | "prisma_intake"
  | "static_content_module"
  | "tool_result_public"
  | "heuristic_signal";

/** Optional future: normalized bundle for logging/provenance. */
export type BrainContextBundle = {
  touchpoint: CampaignBrainTouchpoint;
  /** Ordered stack of sources used to produce the last model output. */
  sources: readonly { kind: BrainContextSource; ref?: string }[];
  modelId?: string;
  modelVersion?: string;
  /** ISO timestamp of generation. */
  generatedAt?: string;
};
