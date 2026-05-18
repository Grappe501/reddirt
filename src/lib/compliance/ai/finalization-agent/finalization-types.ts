export type ComplianceFinalizationReport = {
  generatedAt: string;
  completionPct: number;
  commercialReadinessPct: number;
  filingReadinessStatus: "green" | "yellow" | "red";
  canUseInternally: boolean;
  canBetaTest: boolean;
  canSell: boolean;
  blockers: string[];
  nextActions: string[];
  subsystemScores: Array<{
    id: string;
    label: string;
    score: number;
    status: "green" | "yellow" | "red";
    explanation: string;
  }>;
};
