import { z } from "zod";
import { complianceNextActionSchema, complianceRiskSchema } from "../brain/compliance-brain-types";

export const completionProgressAreaSchema = z.object({
  area: z.string(),
  percentComplete: z.number().min(0).max(100),
  status: z.enum(["complete", "in_progress", "blocked", "not_started"]),
  blockers: z.array(z.string()),
  immediateActions: z.array(z.string()),
  completionActions: z.array(z.string()),
  launchCriticality: z.enum(["critical", "high", "medium", "low"]),
  owner: z.enum(["human", "steve", "operator", "treasurer", "ai_assist", "engineering"]),
  route: z.string().optional(),
  relatedScripts: z.array(z.string()).default([]),
  relatedDocs: z.array(z.string()).default([]),
});

export const completionProgressSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  overallPercentComplete: z.number(),
  areas: z.array(completionProgressAreaSchema),
});

export const coachStepSchema = z.object({
  step: z.number(),
  title: z.string(),
  why: z.string(),
  href: z.string().optional(),
  command: z.string().optional(),
  humanRequired: z.boolean(),
});

export const complianceCoachSchema = z.object({
  generatedAt: z.string(),
  coachId: z.string(),
  title: z.string(),
  summary: z.string(),
  steps: z.array(coachStepSchema),
  doNot: z.array(z.string()),
  successCriteria: z.string(),
});

export const uxRouteAuditSchema = z.object({
  route: z.string(),
  headlineIdeal: z.string(),
  primaryAction: z.string(),
  confusionPoints: z.array(z.string()),
  improvements: z.array(z.string()),
  priority: z.enum(["high", "medium", "low"]),
});

export const complianceUxAuditSchema = z.object({
  generatedAt: z.string(),
  routes: z.array(uxRouteAuditSchema),
  globalThemes: z.array(z.string()),
});

export const blockerExplanationSchema = z.object({
  id: z.string(),
  plainEnglish: z.string(),
  whyItBlocks: z.string(),
  howToClear: z.string(),
  automatable: z.boolean(),
  owner: z.string(),
});

export const complianceExpertSnapshotSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  launchOverall: z.enum(["not_ready", "rehearsal_ready", "launch_ready"]),
  launchReadinessScore: z.number(),
  top5Now: z.array(complianceNextActionSchema),
  top5Risks: z.array(complianceRiskSchema),
  nextBestWorkflow: z.string(),
  blockerExplanations: z.array(blockerExplanationSchema),
  canAutomate: z.array(z.string()),
  needsHumanReview: z.array(z.string()),
  needsSourceEvidence: z.array(z.string()),
  needsSteveApproval: z.array(z.string()),
  mustNotDo: z.array(z.string()),
  whatWouldMakeFilingGreen: z.array(z.string()),
  whatWouldImproveLaunch: z.array(z.string()),
  operatorCoachSummary: z.string(),
  recommendedNextHumanAction: z.string(),
  recommendedNextAiAction: z.string(),
});

export type CompletionProgressArea = z.infer<typeof completionProgressAreaSchema>;
export type CompletionProgress = z.infer<typeof completionProgressSchema>;
export type ComplianceCoach = z.infer<typeof complianceCoachSchema>;
export type ComplianceExpertSnapshot = z.infer<typeof complianceExpertSnapshotSchema>;
export type ComplianceUxAudit = z.infer<typeof complianceUxAuditSchema>;
