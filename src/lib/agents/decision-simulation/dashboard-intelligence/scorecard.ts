import type { AlternativeFutureId } from "../alternative-futures/contracts";
import { assignAlternativeFuture } from "../alternative-futures/assign";

export type DashboardMember = {
  ordinal: number;
  futureId?: AlternativeFutureId;
  frame?: string;
  final?: string;
  confidence?: number | null;
  executiveSummary?: string;
  error?: string;
  moves?: Array<{
    moveNumber: number;
    side: string;
    message: string;
    predictedFrame?: string;
    rationaleSummary?: string;
  }>;
};

export type DashboardScore = {
  id: "CONFIDENCE" | "RISK" | "OPPORTUNITY" | "ROBUSTNESS";
  label: string;
  value: number | null;
  methodology: string;
};

export type DashboardScorecard = {
  version: "dashboard-intelligence-1.0";
  scores: DashboardScore[];
  whyPreferred: string;
  uncertainty: string[];
};

export function buildDashboardScorecard(input: {
  members: DashboardMember[];
  modelConfidence: number | null;
  outlierRate: number | null;
  robustnessScore: number | null;
  dominantFrame: string | null;
  strongestCounter: string | null;
}): DashboardScorecard {
  const completed = input.members.filter((member) => !member.error);
  const hostileShare =
    completed.length > 0
      ? completed.filter((member) => (member.futureId ?? assignAlternativeFuture(member.ordinal).futureId) === "HOSTILE")
          .length / completed.length
      : null;
  const riskParts = [input.outlierRate, hostileShare, input.robustnessScore == null ? null : 1 - input.robustnessScore].filter(
    (value): value is number => typeof value === "number",
  );
  const risk = riskParts.length ? Math.min(1, riskParts.reduce((sum, value) => sum + value, 0) / riskParts.length) : null;
  const opportunity =
    completed.length > 0
      ? completed.filter((member) => (member.futureId ?? assignAlternativeFuture(member.ordinal).futureId) === "OPPORTUNITY")
          .length / completed.length
      : null;

  const scores: DashboardScore[] = [
    {
      id: "CONFIDENCE",
      label: "Model confidence",
      value: input.modelConfidence,
      methodology: "Mean estimatedProbability on completed first counterparty moves. Model-estimated, not a real-world probability.",
    },
    {
      id: "RISK",
      label: "Risk",
      value: risk,
      methodology: "Mean of outlier rate, hostile-lane share, and one-minus cross-future frame stability. Advisory only.",
    },
    {
      id: "OPPORTUNITY",
      label: "Opportunity",
      value: opportunity,
      methodology: "Share of completed futures that are the OPPORTUNITY lane. Not a claim the best case will occur.",
    },
    {
      id: "ROBUSTNESS",
      label: "Robustness across futures",
      value: input.robustnessScore,
      methodology: "Pairwise agreement of each named future's modal counterparty frame. High means stable; low means fragile.",
    },
  ];

  const whyPreferred = input.strongestCounter
    ? `Preferred counter is the modal final operator recommendation. Dominant first response frame: ${input.dominantFrame ?? "unknown"}. This is ensemble structure, not proof.`
    : "No preferred counter yet. Run at least one completed simulation.";

  return {
    version: "dashboard-intelligence-1.0",
    scores,
    whyPreferred,
    uncertainty: [
      "Scores are derived from this job only.",
      "A vote history or writing packet can change plausibility; it does not determine the scorecard.",
      "Do not treat a recommended revision as a message that was sent.",
    ],
  };
}

export function futureOf(member: DashboardMember): AlternativeFutureId {
  return member.futureId ?? assignAlternativeFuture(member.ordinal).futureId;
}
