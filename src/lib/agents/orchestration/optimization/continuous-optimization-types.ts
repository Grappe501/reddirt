/**
 * Continuous optimization V1 — read-only campaign improvement signals.
 */

import type { CampaignDomainId } from "../campaign-state-types";
import type { CampaignSectionId } from "../cross-domain/cross-domain-orchestrator-types";

export type ContinuousOptimizationSignal = {
  id: string;
  title: string;
  summary: string;
  domain: CampaignDomainId;
  sectionId?: CampaignSectionId;
  urgency: "P0" | "P1" | "P2";
  confidence: "high" | "medium" | "low";
  sourceEvidence: string[];
  recommendedImprovement: string;
  expectedCampaignStateImprovement: string;
};

export type ContinuousOptimizationState = {
  generatedAt: string;
  signals: ContinuousOptimizationSignal[];
  weakDomainCount: number;
  staleFeedbackCount: number;
  toolGapCount: number;
  dependencyWarningCount: number;
  recommendedNextImprovement: ContinuousOptimizationSignal | null;
  safety: {
    readOnly: true;
    autoExecutionDisabled: true;
    humanGateRequired: true;
  };
  summary: string;
};

export function emptyContinuousOptimizationState(): ContinuousOptimizationState {
  return {
    generatedAt: new Date().toISOString(),
    signals: [],
    weakDomainCount: 0,
    staleFeedbackCount: 0,
    toolGapCount: 0,
    dependencyWarningCount: 0,
    recommendedNextImprovement: null,
    safety: {
      readOnly: true,
      autoExecutionDisabled: true,
      humanGateRequired: true,
    },
    summary: "Continuous optimization not loaded.",
  };
}
