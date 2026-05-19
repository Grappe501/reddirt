import { z } from "zod";

export const severitySchema = z.enum(["critical", "high", "medium", "low", "info"]);

export const weaknessSchema = z.object({
  id: z.string(),
  area: z.string(),
  title: z.string(),
  severity: severitySchema,
  evidence: z.string(),
  affectedCount: z.number().nullable(),
  whyItMatters: z.string(),
  whatIsBlocked: z.string(),
  owner: z.string(),
  fastestFix: z.string(),
  permanentFix: z.string(),
  route: z.string().nullable(),
  command: z.string().nullable(),
  doc: z.string().nullable(),
  riskIfIgnored: z.string(),
});

export const stateProgressAreaSchema = z.object({
  area: z.string(),
  percentComplete: z.number(),
  status: z.enum(["complete", "in_progress", "blocked", "not_started"]),
  whatIsComplete: z.array(z.string()),
  whatIsStartedIncomplete: z.array(z.string()),
  whatIsMissing: z.array(z.string()),
  whatIsBlocked: z.array(z.string()),
  immediateNextAction: z.string(),
  completionAction: z.string(),
  owner: z.string(),
  expectedImpact: z.string(),
});

export const blockerNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(["open", "in_progress", "resolved", "guarded"]),
  owner: z.string(),
  blocks: z.array(z.string()),
  blockedBy: z.array(z.string()),
  relatedCount: z.number().nullable(),
  route: z.string().nullable(),
  command: z.string().nullable(),
  safeNextAction: z.string(),
});

export const criticalPathItemSchema = z.object({
  rank: z.number(),
  id: z.string(),
  title: z.string(),
  owner: z.string(),
  href: z.string().nullable(),
  command: z.string().nullable(),
  whyCritical: z.string(),
  unlocks: z.string(),
  doNotAutomate: z.boolean(),
  realisticProgressAfter: z.string(),
});

export const rolePlanSchema = z.object({
  role: z.string(),
  nextFive: z.array(
    z.object({
      title: z.string(),
      why: z.string(),
      route: z.string().nullable(),
      command: z.string().nullable(),
      expectedImpact: z.string(),
      unsafeShortcuts: z.array(z.string()),
      completionDefinition: z.string(),
    }),
  ),
});

export const completionEngineSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  overallPercentComplete: z.number(),
  filingStatus: z.string(),
  qaFullStatus: z.string(),
  nextBestAction: z.object({
    title: z.string(),
    owner: z.string(),
    href: z.string().nullable(),
    command: z.string().nullable(),
    plainEnglish: z.string(),
    expectedImpact: z.string(),
  }),
  topBlocker: z.object({
    id: z.string(),
    label: z.string(),
    owner: z.string(),
  }),
  criticalPath: z.array(criticalPathItemSchema),
  weaknessSummary: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    info: z.number(),
  }),
  hardeningStatus: z.enum(["pass", "warn", "fail"]),
  mustNotAutomate: z.array(z.string()),
  humanSourceReviewBlocked: z.array(z.string()),
  treasurerBlocked: z.array(z.string()),
  steveBlocked: z.array(z.string()),
  engineeringBlocked: z.array(z.string()),
  lowImpactHighEffort: z.array(z.string()),
});

export type Weakness = z.infer<typeof weaknessSchema>;
export type StateProgressArea = z.infer<typeof stateProgressAreaSchema>;
export type BlockerNode = z.infer<typeof blockerNodeSchema>;
export type CompletionEngine = z.infer<typeof completionEngineSchema>;
export type CriticalPathItem = z.infer<typeof criticalPathItemSchema>;
export type RolePlan = z.infer<typeof rolePlanSchema>;
