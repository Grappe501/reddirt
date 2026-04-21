/**
 * Shared request/response shapes for OpenAI-backed routes (Phase 3+).
 * Keep fields minimal; extend as features land.
 */

export type OpenAIEnvConfig = {
  apiKey: string;
  model: string;
  embeddingModel: string;
};

/** POST /api/search — semantic search over site/docs content */
export type SearchRequestBody = {
  query: string;
  /** Optional filters, e.g. { collection: "docs" } */
  filters?: Record<string, string>;
};

export type SearchResponseBody = {
  results: Array<{
    id: string;
    title: string;
    snippet: string;
    score?: number;
    path?: string;
  }>;
};

/** POST /api/assistant — guided help / navigation answers */
export type AssistantRequestBody = {
  message: string;
  /** Optional session id for multi-turn (Phase 3) */
  sessionId?: string;
};

export type AssistantResponseBody = {
  reply: string;
  /** Suggested links internal to the site */
  suggestions?: Array<{ label: string; href: string }>;
};

/** POST /api/intake — classify structured form / volunteer intake */
export type IntakeRequestBody = {
  /** Raw user message or serialized form fields */
  payload: string;
  source?: "contact" | "volunteer" | "referendum" | "other";
};

export type IntakeResponseBody = {
  categories: string[];
  summary: string;
  priority?: "low" | "medium" | "high";
};

export type ApiErrorBody = {
  error: string;
  message: string;
};
