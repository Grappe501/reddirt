/**
 * Client-safe AI prep v4 exports — static quick tools and nav constants only.
 * Server registry lookups live in intelligenceAiPrepV4.ts.
 */

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

/** Client-safe quick tools — staff registry extras are server-only. */
export function listAiPrepQuickToolsForProfile(
  _profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK",
): AiPrepQuickTool[] {
  return [...CANDIDATE_AI_PREP_V4_QUICK_TOOLS];
}
