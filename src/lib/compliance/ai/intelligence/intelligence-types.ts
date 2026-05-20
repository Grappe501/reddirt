import { z } from "zod";

export const intelligenceOwnerSchema = z.enum([
  "ernie",
  "treasurer",
  "operator",
  "compliance_officer",
  "steve",
  "engineer",
  "ai_assist",
  "human",
]);

export const intelligenceSnapshotSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  overallPercentComplete: z.number(),
  filingStatus: z.enum(["red", "yellow", "green"]),
  qaScore: z.number().nullable(),
  qaStatus: z.string().nullable(),
  launchReadiness: z.string(),
  openQueueItems: z.number(),
  batchEligible: z.number(),
  ruleReviewItems: z.number(),
  sources: z.object({
    bankCsv: z.string(),
    goodChangeRows: z.number(),
    receiptImages: z.number(),
    checkImages: z.number(),
    inKindPages: z.number(),
  }),
  auditSpreadsheet: z.object({
    mainRows: z.number(),
    present: z.boolean(),
    path: z.string(),
  }),
  checkWorkbench: z.object({
    totalChecks: z.number(),
    readyForSos: z.number(),
    missingRequired: z.number(),
    present: z.boolean(),
  }),
  inKind: z.object({
    auctionRows: z.number(),
    evidencePhotos: z.number(),
    photosApproved: z.number(),
  }),
  reconciliation: z.object({
    ambiguous: z.number(),
    unmatchedBank: z.number(),
    remainingReview: z.number(),
  }),
  inventory: z.object({
    unmatchedChecks: z.number(),
    unmatchedLedger: z.number(),
    missingAddresses: z.number(),
    exactMatches: z.number(),
  }),
  storageMode: z.string(),
  deployReady: z.boolean(),
  unsafeShortcuts: z.array(z.string()),
});

export const diagnosisItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  rootCause: z.string(),
  owner: intelligenceOwnerSchema,
  severity: z.enum(["critical", "high", "medium", "low"]),
});

export const diagnosisReportSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  filingStatus: z.string(),
  items: z.array(diagnosisItemSchema),
  summary: z.string(),
});

export const criticalPathActionV2Schema = z.object({
  rank: z.number(),
  id: z.string(),
  title: z.string(),
  owner: intelligenceOwnerSchema,
  href: z.string().nullable(),
  command: z.string().nullable(),
  impact: z.enum(["critical", "high", "medium", "low"]),
  urgency: z.enum(["immediate", "this_week", "later"]),
  dependencyIds: z.array(z.string()),
  riskReduction: z.string(),
  filingReadinessGain: z.string(),
  launchReadinessGain: z.string(),
  humanOnly: z.boolean(),
  doNot: z.array(z.string()),
});

export const criticalPathV2Schema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  actions: z.array(criticalPathActionV2Schema),
});

export const workRouterTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  route: z.string(),
  command: z.string().nullable(),
  whatToLookAt: z.string(),
  whatToDecide: z.string(),
  whatNotToDo: z.array(z.string()),
  doneCondition: z.string(),
  priority: z.number(),
});

export const workRouterPlanSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  queues: z.record(z.string(), z.array(workRouterTaskSchema)),
});

export const dataQualityDomainSchema = z.object({
  domain: z.string(),
  completeness: z.number(),
  confidence: z.enum(["high", "medium", "low", "none"]),
  recordCount: z.number(),
  missingFieldsSummary: z.string(),
  sourceEvidence: z.string(),
  humanReviewRequired: z.boolean(),
  filingImpact: z.enum(["blocking", "high", "medium", "low", "none"]),
});

export const dataQualityReportSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  overallScore: z.number(),
  domains: z.array(dataQualityDomainSchema),
});

export const filingPredictionSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  currentStatus: z.enum(["red", "yellow", "green"]),
  currentBlockers: z.array(z.string()),
  toYellow: z.array(z.string()),
  toGreen: z.array(z.string()),
  fastestUnblockers: z.array(z.string()),
  scenarios: z.array(
    z.object({
      name: z.string(),
      expectedStatus: z.string(),
      requirements: z.array(z.string()),
    }),
  ),
});

export const exceptionGroupSchema = z.object({
  category: z.string(),
  count: z.number(),
  recommendation: z.string(),
  route: z.string(),
  humanOnly: z.boolean(),
  sampleIds: z.array(z.string()),
});

export const exceptionResolutionPlanSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  groups: z.array(exceptionGroupSchema),
  noAutoFix: z.literal(true),
});

export const memoryLedgerSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  previousCommit: z.string().nullable(),
  deltas: z.array(
    z.object({
      metric: z.string(),
      before: z.number().nullable(),
      after: z.number(),
      direction: z.enum(["up", "down", "unchanged"]),
    }),
  ),
  resolvedBlockers: z.array(z.string()),
  newBlockers: z.array(z.string()),
  stuckItems: z.array(z.string()),
  carryForward: z.array(z.string()),
});

export const intelligenceBriefsSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  executive: z.string(),
  operator: z.string(),
  ernie: z.string(),
  treasurer: z.string(),
});

export const intelligencePackageSchema = z.object({
  snapshot: intelligenceSnapshotSchema,
  diagnosis: diagnosisReportSchema,
  criticalPathV2: criticalPathV2Schema,
  workRouter: workRouterPlanSchema,
  dataQuality: dataQualityReportSchema,
  filingPredictor: filingPredictionSchema,
  exceptionResolver: exceptionResolutionPlanSchema,
  memory: memoryLedgerSchema,
  briefs: intelligenceBriefsSchema,
});

export type IntelligenceSnapshot = z.infer<typeof intelligenceSnapshotSchema>;
export type DiagnosisReport = z.infer<typeof diagnosisReportSchema>;
export type CriticalPathV2 = z.infer<typeof criticalPathV2Schema>;
export type WorkRouterPlan = z.infer<typeof workRouterPlanSchema>;
export type DataQualityReport = z.infer<typeof dataQualityReportSchema>;
export type FilingPrediction = z.infer<typeof filingPredictionSchema>;
export type ExceptionResolutionPlan = z.infer<typeof exceptionResolutionPlanSchema>;
export type MemoryLedger = z.infer<typeof memoryLedgerSchema>;
export type IntelligenceBriefs = z.infer<typeof intelligenceBriefsSchema>;
export type IntelligencePackage = z.infer<typeof intelligencePackageSchema>;
