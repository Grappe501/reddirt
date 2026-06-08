/**
 * Intelligence AI prep v4 — search-integrated copilot routing, expanded quick tools, governed brief hooks.
 */
import { loadAiCopilotToolRegistry } from "@/lib/intelligence/aiCopilotOrchestrator";
import {
  detectIntelSearchIntent,
  tokenizeIntelQuery,
  type IntelSearchIntent,
} from "@/lib/intelligence/intelligenceSearchCore";

export const SEARCH_AI_PREP_HUB_HREF = "/admin/intelligence/search-ai-prep-hub";

export type AiPrepToolRecommendation = {
  toolId: string;
  name: string;
  category: string;
  reason: string;
  priority: number;
};

export type AiPrepQuickTool = {
  toolId: string;
  label: string;
  description: string;
  category: string;
  stageSafe: boolean;
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

/** v4 iPad + dock quick tools — 12 governed debate-prep tools */
export const CANDIDATE_AI_PREP_V4_QUICK_TOOLS: readonly AiPrepQuickTool[] = [
  {
    toolId: "debate-question-generator",
    label: "Debate questions",
    description: "Internal questions from bills + evidence status",
    category: "debate_prep",
    stageSafe: true,
  },
  {
    toolId: "what-not-to-say-detector",
    label: "Do not say",
    description: "Blocked narratives for tonight",
    category: "debate_prep",
    stageSafe: true,
  },
  {
    toolId: "trap-question-detector",
    label: "Trap warnings",
    description: "Risky moderator paths",
    category: "debate_prep",
    stageSafe: true,
  },
  {
    toolId: "answer-builder-30-60-90",
    label: "30/60/90 answers",
    description: "Timed answer skeleton (verify claims)",
    category: "debate_prep",
    stageSafe: true,
  },
  {
    toolId: "rebuttal-builder",
    label: "Rebuttal draft",
    description: "Internal rebuttal blocks — review required",
    category: "debate_prep",
    stageSafe: true,
  },
  {
    toolId: "bridge-line-builder",
    label: "Bridge lines",
    description: "Pivot from trap to Kelly values frame",
    category: "debate_prep",
    stageSafe: true,
  },
  {
    toolId: "counterargument-predictor",
    label: "Counterarguments",
    description: "Predict Hammer/Pakko pushback paths",
    category: "debate_prep",
    stageSafe: true,
  },
  {
    toolId: "candidate-talking-point-builder",
    label: "Talking points",
    description: "Structured points with accountability frame",
    category: "writing_tools",
    stageSafe: true,
  },
  {
    toolId: "plain-english-translator",
    label: "Plain English",
    description: "Translate brief jargon for stage rehearsal",
    category: "writing_tools",
    stageSafe: true,
  },
  {
    toolId: "claim-strength-evaluator",
    label: "Claim strength",
    description: "Check export readiness before stage",
    category: "opposition_research",
    stageSafe: true,
  },
  {
    toolId: "morning-brief-synthesizer",
    label: "Tonight brief",
    description: "Synthesize intelligence into prep sections",
    category: "briefing_papers",
    stageSafe: true,
  },
  {
    toolId: "executive-summary-builder",
    label: "Exec summary",
    description: "One-page reading order for leadership review",
    category: "briefing_papers",
    stageSafe: true,
  },
] as const;

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
