import { z } from "zod";
import { UNSAFE_COMPLIANCE_ACTIONS } from "../brain/compliance-brain-types";

export const orchestratorOwnerSchema = z.enum(["treasurer", "operator", "steve", "ai_assist", "engineer", "human"]);

export const impactLevelSchema = z.enum(["none", "low", "medium", "high", "critical"]);

export const orchestratorActionSchema = z.object({
  id: z.string(),
  priority: z.number(),
  title: z.string(),
  whyItMatters: z.string(),
  owner: orchestratorOwnerSchema,
  href: z.string().optional(),
  command: z.string().optional(),
  phase: z.number(),
  blockedBy: z.array(z.string()),
  estimatedImpact: z.object({
    filingBlockersDelta: z.number(),
    queueItemsUnlocked: z.number(),
    reconciliationItemsResolved: z.number(),
    launchReadinessPoints: z.number(),
    confidence: z.enum(["high", "medium", "low"]),
    summary: z.string(),
  }),
  guardsPassed: z.boolean(),
  guardNotes: z.array(z.string()),
});

export const nextBestActionSchema = z.object({
  action: orchestratorActionSchema,
  rationale: z.string(),
  alternativesConsidered: z.array(z.string()),
});

export const rolePlanSchema = z.object({
  role: orchestratorOwnerSchema,
  label: z.string(),
  todayPlan: z.array(
    z.object({
      step: z.number(),
      title: z.string(),
      command: z.string().optional(),
      href: z.string().optional(),
      durationHint: z.string().optional(),
    }),
  ),
  doNot: z.array(z.string()),
  successCriteria: z.string(),
});

export const impactForecastSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  filingOverall: z.enum(["red", "yellow", "green"]),
  launchOverall: z.enum(["not_ready", "rehearsal_ready", "launch_ready"]),
  actions: z.array(orchestratorActionSchema),
  cumulativeIfAllTop3: z.object({
    launchReadinessPointsMax: z.number(),
    filingBlockersRemovedMax: z.number(),
    honestNote: z.string(),
  }),
});

export const decisionGuardSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  allGuardsPassed: z.boolean(),
  blockedRecommendations: z.array(
    z.object({
      actionId: z.string(),
      reason: z.string(),
      unsafePattern: z.string(),
    }),
  ),
  unsafeShortcuts: z.array(z.string()),
  enforcedRules: z.array(z.string()),
  productionBankAssumption: z.object({
    verified: z.boolean(),
    note: z.string(),
  }),
});

export const aiDeltaSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  previousCommit: z.string().nullable(),
  previousGeneratedAt: z.string().nullable(),
  hasPreviousPass: z.boolean(),
  changes: z.array(
    z.object({
      area: z.string(),
      before: z.string(),
      after: z.string(),
      direction: z.enum(["improved", "regressed", "unchanged", "new"]),
    }),
  ),
  summary: z.string(),
});

export const orchestratorSnapshotSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  programSummary: z.string(),
  nextBestAction: nextBestActionSchema,
  todayWorkPlan: z.array(
    z.object({
      order: z.number(),
      title: z.string(),
      owner: orchestratorOwnerSchema,
      href: z.string().optional(),
    }),
  ),
  unsafeShortcuts: z.array(z.string()),
  changesSinceLastPass: z.array(z.string()),
  filingStatus: z.enum(["red", "yellow", "green"]),
  launchOverall: z.enum(["not_ready", "rehearsal_ready", "launch_ready"]),
  overallPercentComplete: z.number(),
  recommendedCommands: z.array(z.string()),
});

export const rolePlansBundleSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  plans: z.array(rolePlanSchema),
});

export type OrchestratorAction = z.infer<typeof orchestratorActionSchema>;
export type NextBestAction = z.infer<typeof nextBestActionSchema>;
export type RolePlan = z.infer<typeof rolePlanSchema>;
export type ImpactForecast = z.infer<typeof impactForecastSchema>;
export type DecisionGuard = z.infer<typeof decisionGuardSchema>;
export type AiDelta = z.infer<typeof aiDeltaSchema>;
export type OrchestratorSnapshot = z.infer<typeof orchestratorSnapshotSchema>;
export type RolePlansBundle = z.infer<typeof rolePlansBundleSchema>;

export const ORCHESTRATOR_UNSAFE_SHORTCUTS = [...UNSAFE_COMPLIANCE_ACTIONS] as string[];

export const ORCHESTRATOR_ENFORCED_RULES = [
  "No auto-approve of queue items or reconciliation matches",
  "Filing green only when source-backed blockers clear",
  "Confidence threshold remains 98% for batch eligibility",
  "rule_review items require individual Rules page + workbench flow",
  "Production bank source requires verified import on host (not assumed from local dev)",
] as const;
