/**
 * Ask Kelly (public /api/assistant) bridge — registry metadata only; no rewrite.
 */
export type AdapterToolMeta = {
  registryId: string;
  name: string;
  mode: "read_only" | "action_gated";
  source: string;
  description: string;
};

export const ASK_KELLY_ADAPTER_TOOLS: AdapterToolMeta[] = [
  {
    registryId: "ask-kelly-list-upcoming-events",
    name: "List upcoming events",
    mode: "read_only",
    source: "src/lib/assistant/tools.ts",
    description: "Public RAG tool — upcoming campaign events from content index.",
  },
  {
    registryId: "ask-kelly-get-content-by-slug",
    name: "Get content by slug",
    mode: "read_only",
    source: "src/lib/assistant/tools.ts",
    description: "Fetch editorial/explainer/story content for answers.",
  },
  {
    registryId: "ask-kelly-office-priorities",
    name: "Office priorities summary",
    mode: "read_only",
    source: "src/lib/assistant/tools.ts",
    description: "Static priorities block for public Q&A.",
  },
  {
    registryId: "ask-kelly-contact",
    name: "Contact routing",
    mode: "read_only",
    source: "src/lib/assistant/tools.ts",
    description: "Public contact path — no admin writes.",
  },
];

export function summarizeAskKellyAdapter(): string {
  return `Ask Kelly exposes ${ASK_KELLY_ADAPTER_TOOLS.length} OpenAI tools via /api/assistant (public). All read-only from Campaign Agent runtime perspective.`;
}

export function getAskKellyToolsForRegistry(): AdapterToolMeta[] {
  return ASK_KELLY_ADAPTER_TOOLS;
}
