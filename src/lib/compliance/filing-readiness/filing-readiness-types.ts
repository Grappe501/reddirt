export type FilingReadinessStatus = "green" | "yellow" | "red";

export type FilingPeriod = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  dueDate?: string;
  sourceStatus: "verified" | "needs_review" | "campaign_policy";
  sourceNote: string;
};

import type { FilingHardGate } from "./hard-gates";
import type { FilingReadinessGrade } from "./filing-readiness-grade";

export type FilingReadinessReport = {
  id: string;
  generatedAt: string;
  filingPeriod?: {
    label: string;
    startDate: string;
    endDate: string;
    dueDate?: string;
  };
  overallStatus: FilingReadinessStatus;
  blockers: string[];
  warnings: string[];
  sections: Array<{
    id: string;
    label: string;
    status: FilingReadinessStatus;
    summary: string;
    count?: number;
    amount?: number;
    nextAction?: string;
  }>;
  ruleCoverage: {
    complete: boolean;
    missingTopics: string[];
    needsLegalReviewTopics: string[];
  };
  humanReviewRequired: true;
  hardGates?: FilingHardGate[];
  readinessGrade?: FilingReadinessGrade;
};
