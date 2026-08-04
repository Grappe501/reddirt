/**
 * Client-safe types + guards for EMAIL-AI-TASK-INTELLIGENCE-1.0.
 * Keep this free of Node / Prisma / OpenAI imports so client components can use it.
 */

export const EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION = 1 as const;
export const EMAIL_AI_TASK_INTELLIGENCE_PROMPT_VERSION = "email-task-intelligence-v1" as const;

/** Slugs aligned with model output contract (snake_case). */
export const EMAIL_AI_TASK_CATEGORY_SLUGS = [
  "reply_needed",
  "call_needed",
  "schedule_follow_up",
  "volunteer_follow_up",
  "donor_follow_up",
  "press_follow_up",
  "issue_research",
  "event_request",
  "data_cleanup",
  "profile_review",
  "audience_review",
  "draft_message",
  "escalate_to_candidate_principal",
  "legal_compliance_review",
] as const;

export type EmailAiTaskCategorySlug = (typeof EMAIL_AI_TASK_CATEGORY_SLUGS)[number];

export type EmailTaskIntelligenceTaskRow = {
  taskTitle: string;
  taskType: EmailAiTaskCategorySlug;
  urgency: string;
  ownerRole: string;
  recommendedDueWindow: string;
  contextSummary: string;
  dependencies: string[];
  calendarRelevance: string;
  emailDraftNeeded: boolean;
  profileUpdateSuggested: boolean;
  audienceHintSuggested: boolean;
  riskFlags: string[];
};

export type EmailTaskIntelligenceOutput = {
  tasks: EmailTaskIntelligenceTaskRow[];
  packetSummary?: string;
};

export type EmailTaskIntelligenceStoredV1 = {
  version: typeof EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION;
  generatedAt: string;
  model: string;
  promptVersion: string;
  inputSourceSummary: string;
  lastErrorSafe?: string;
  output?: EmailTaskIntelligenceOutput;
};

export function isStoredEmailTaskIntelligenceV1(v: unknown): v is EmailTaskIntelligenceStoredV1 {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return o.version === EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION && typeof o.generatedAt === "string";
}
