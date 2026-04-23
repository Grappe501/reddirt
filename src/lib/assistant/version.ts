/** Public API version for the campaign guide (`/api/assistant`). Bump when changing request/response shape or behavior. */
export const ASSISTANT_API_VERSION = "3" as const;

export const ASSISTANT_CAPABILITIES = [
  "rag",
  "tools",
  "playbooks",
  "multi_turn",
  "response_style",
  "sse_stream",
  "citations",
  "tight_grounding",
  "retrieval_tiering",
  "data_governance_public_boundary",
  "openai_consumption_discipline",
] as const;
