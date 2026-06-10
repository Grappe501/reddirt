/**
 * Intelligence AI prep v4 — search-integrated copilot routing, expanded quick tools, governed brief hooks.
 */
import { loadAiCopilotToolRegistry } from "@/lib/intelligence/aiCopilotOrchestrator";
import {
  detectIntelSearchIntent,
  tokenizeIntelQuery,
  type IntelSearchIntent,
} from "@/lib/intelligence/intelligenceSearchCore";
import {
  CANDIDATE_AI_PREP_V4_QUICK_TOOLS,
  SEARCH_AI_PREP_HUB_HREF,
  type AiPrepQuickTool,
  type AiPrepToolRecommendation,
} from "@/lib/intelligence/intelligenceAiPrepV4Client";

export {
  CANDIDATE_AI_PREP_V4_QUICK_TOOLS,
  SEARCH_AI_PREP_HUB_HREF,
  type AiPrepQuickTool,
  type AiPrepToolRecommendation,
};

const INTENT_TOOL_MAP: Record<IntelSearchIntent, string[]> = {
  opposition: [
    "vulnerability-finder",
    "contradiction-scout",
    "counterargument-predictor",
    "rebuttal-builder",
    "bill-impact-analyzer",
  ],
  rehearse: [
    "trap-question-detector",
    "answer-builder-30-60-90",
    "debate-question-generator",
    "what-not-to-say-detector",
    "bridge-line-builder",
    "check-my-record-responder",
    "packo-lane-advisor",
  ],
  claims: [
    "claim-strength-evaluator",
    "what-not-to-say-detector",
    "citation-drilldown-explainer",
    "source-gap-finder",
  ],
  philosophy: [
    "bridge-line-builder",
    "candidate-talking-point-builder",
    "plain-english-translator",
    "counterargument-predictor",
  ],
  clerks: ["county-burden-analyzer", "county-brief-expander", "bill-impact-analyzer"],
  general: [
    "morning-brief-synthesizer",
    "executive-summary-builder",
    "debate-question-generator",
    "trap-question-detector",
  ],
};

const CANDIDATE_SAFE_CATEGORIES = new Set([
  "debate_prep",
  "briefing_papers",
  "writing_tools",
]);

function registryTools() {
  return loadAiCopilotToolRegistry().tools;
}

export function recommendCopilotToolsFromQuery(
  query: string,
  intent?: IntelSearchIntent,
  profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK" = "CANDIDATE",
  limit = 5,
): AiPrepToolRecommendation[] {
  const terms = tokenizeIntelQuery(query);
  const resolvedIntent = intent ?? detectIntelSearchIntent(query, terms);
  const preferred = INTENT_TOOL_MAP[resolvedIntent] ?? INTENT_TOOL_MAP.general;
  const byId = new Map(registryTools().map((t) => [t.toolId, t]));

  const recs: AiPrepToolRecommendation[] = [];
  for (let i = 0; i < preferred.length && recs.length < limit; i++) {
    const toolId = preferred[i]!;
    const tool = byId.get(toolId);
    if (!tool) continue;
    if (profile !== "STAFF" && !CANDIDATE_SAFE_CATEGORIES.has(tool.category)) continue;
    recs.push({
      toolId: tool.toolId,
      name: tool.name,
      category: tool.category,
      reason: `Matches ${resolvedIntent} prep intent`,
      priority: 1 - i * 0.1,
    });
  }

  if (recs.length < limit) {
    for (const tool of registryTools()) {
      if (recs.some((r) => r.toolId === tool.toolId)) continue;
      if (profile !== "STAFF" && !CANDIDATE_SAFE_CATEGORIES.has(tool.category)) continue;
      const hay = `${tool.name} ${tool.purpose} ${tool.category}`.toLowerCase();
      if (!terms.some((t) => hay.includes(t))) continue;
      recs.push({
        toolId: tool.toolId,
        name: tool.name,
        category: tool.category,
        reason: "Keyword match in tool registry",
        priority: 0.4,
      });
      if (recs.length >= limit) break;
    }
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, limit);
}

export function listAiPrepQuickToolsForProfile(
  profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK",
): AiPrepQuickTool[] {
  if (profile === "STAFF") {
    return [
      ...CANDIDATE_AI_PREP_V4_QUICK_TOOLS,
      ...registryTools()
        .filter((t) => t.category === "opposition_research" || t.category === "intelligence_gathering")
        .slice(0, 6)
        .map((t) => ({
          toolId: t.toolId,
          label: t.name,
          description: t.purpose.slice(0, 72),
          category: t.category,
          stageSafe: false,
        })),
    ];
  }
  return [...CANDIDATE_AI_PREP_V4_QUICK_TOOLS];
}

export function countRegisteredCopilotTools(): number {
  return registryTools().length;
}
