import { z } from "zod";

export const complianceSourceStatusSchema = z.object({
  april26FolderExists: z.boolean(),
  goodChangeCsv: z.enum(["present", "missing"]),
  bankCsv: z.enum(["present", "missing", "invalid"]),
  bankCsvExpectedPath: z.string(),
  ethicsWorkbook: z.enum(["present", "missing", "optional"]),
  receiptImages: z.number(),
  checkImages: z.number(),
  inKindPages: z.number(),
  reconciliationBlockers: z.number(),
});

export const complianceQueueBurndownSchema = z.object({
  totalItems: z.number(),
  openItems: z.number(),
  batchEligible: z.number(),
  ruleReviewItems: z.number(),
  needsInfo: z.number(),
  summaryByCategory: z.record(z.string(), z.number()),
  startOrder: z.array(z.string()),
});

export const complianceFilingGateSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.string(),
  severity: z.string(),
  count: z.number(),
  operatorFixableToday: z.boolean(),
  greenCondition: z.string(),
  href: z.string(),
});

export const complianceRuleTopicStatusSchema = z.object({
  topicId: z.string(),
  label: z.string(),
  verified: z.boolean(),
  approvalItemsAffected: z.number(),
});

export const complianceStorageStatusSchema = z.object({
  mode: z.enum(["local_private", "supabase", "unknown"]),
  envPresent: z.boolean(),
  bucketReachable: z.boolean(),
  rlsConfiguredManual: z.boolean(),
  ready: z.boolean(),
  summary: z.string(),
});

export const complianceDbMigrationStatusSchema = z.object({
  migrated: z.boolean(),
  planDoc: z.string(),
  operatorAction: z.string(),
  steveApprovalRequired: z.boolean(),
});

export const complianceRiskSchema = z.object({
  id: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  title: z.string(),
  description: z.string(),
  mitigation: z.string(),
  owner: z.enum(["human", "steve", "operator", "treasurer", "ai_assist"]),
});

export const complianceNextActionSchema = z.object({
  id: z.string(),
  priority: z.number(),
  title: z.string(),
  description: z.string(),
  href: z.string().optional(),
  command: z.string().optional(),
  owner: z.enum(["human", "steve", "operator", "treasurer", "ai_assist"]),
  phase: z.number(),
  blockedBy: z.array(z.string()),
});

export const complianceLaunchReadinessSchema = z.object({
  overall: z.enum(["not_ready", "rehearsal_ready", "launch_ready"]),
  launchReadinessScore: z.number(),
  filingStatus: z.enum(["red", "yellow", "green"]),
  qaFullScore: z.number().nullable(),
  qaFullStatus: z.enum(["red", "yellow", "green"]).nullable(),
  checklist: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      passed: z.boolean(),
      requiredForLaunch: z.boolean(),
    }),
  ),
});

export const complianceBrainSnapshotSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  commandCenterUrl: z.string(),
  architecture: z.object({
    dataAuthority: z.literal("json_local"),
    persistence: z.string(),
    aiRole: z.string(),
  }),
  source: complianceSourceStatusSchema,
  queue: complianceQueueBurndownSchema,
  filing: z.object({
    overall: z.enum(["red", "yellow", "green"]),
    blockerCount: z.number(),
    blockers: z.array(complianceFilingGateSchema),
  }),
  reconciliation: z.object({
    readyForRehearsal: z.boolean(),
    highConfidenceMatches: z.number(),
    unmatchedBank: z.number(),
    unmatchedPayouts: z.number(),
  }),
  rules: z.object({
    unverifiedTopicCount: z.number(),
    ruleReviewQueueItems: z.number(),
    topics: z.array(complianceRuleTopicStatusSchema),
  }),
  storage: complianceStorageStatusSchema,
  dbMigration: complianceDbMigrationStatusSchema,
  deployment: z.object({
    netlifyChecklistDoc: z.string(),
    productionVerified: z.boolean(),
    note: z.string(),
  }),
  qa: z.object({
    lastCommandsRecommended: z.array(z.string()),
    acceptableHonestState: z.string(),
  }),
  launchReadiness: complianceLaunchReadinessSchema,
  recommendedNextHumanAction: z.string(),
  recommendedNextAiAction: z.string(),
  unsafeActions: z.array(z.string()),
});

export type ComplianceSourceStatus = z.infer<typeof complianceSourceStatusSchema>;
export type ComplianceQueueBurndown = z.infer<typeof complianceQueueBurndownSchema>;
export type ComplianceFilingGate = z.infer<typeof complianceFilingGateSchema>;
export type ComplianceRuleTopicStatus = z.infer<typeof complianceRuleTopicStatusSchema>;
export type ComplianceStorageStatus = z.infer<typeof complianceStorageStatusSchema>;
export type ComplianceDbMigrationStatus = z.infer<typeof complianceDbMigrationStatusSchema>;
export type ComplianceRisk = z.infer<typeof complianceRiskSchema>;
export type ComplianceNextAction = z.infer<typeof complianceNextActionSchema>;
export type ComplianceLaunchReadiness = z.infer<typeof complianceLaunchReadinessSchema>;
export type ComplianceBrainSnapshot = z.infer<typeof complianceBrainSnapshotSchema>;

export const UNSAFE_COMPLIANCE_ACTIONS = [
  "batch_approve_rule_review",
  "lower_confidence_threshold_below_98",
  "fake_filing_green",
  "invent_bank_csv_or_transactions",
  "commit_data_compliance_tasks_json",
  "export_unredacted_donor_names",
  "apply_db_migration_without_steve_approval",
  "bypass_storage_or_rls_gates",
  "auto_certify_legal_compliance",
  "delete_approval_or_filing_records",
] as const;
