/**
 * NSI-17 · Recommendation Confidence Framework V1
 * Infrastructure rails only — no ML, scoring models, or prediction engines.
 */

export const CONFIDENCE_DIRECTIONS = [
  "INCREASE",
  "DECREASE",
  "NEUTRAL",
  "HUMAN_REVIEWED",
  "UNKNOWN",
] as const;

export type ConfidenceDirection = (typeof CONFIDENCE_DIRECTIONS)[number];

export const CONFIDENCE_DIRECTION_LABELS: Record<ConfidenceDirection, string> = {
  INCREASE: "Increasing confidence (operator-reviewed)",
  DECREASE: "Decreasing confidence (operator-reviewed)",
  NEUTRAL: "Neutral — no confidence change recorded",
  HUMAN_REVIEWED: "Human-reviewed confidence (manual calibration)",
  UNKNOWN: "Unknown — outcome not yet assessed",
};

/** Map disposition + optional operator note to a governed confidence adjustment label. */
export function confidenceAdjustmentFromDisposition(
  disposition: "Accepted" | "Rejected" | "Deferred" | "Unknown",
  operatorNotes?: string,
): ConfidenceDirection {
  if (operatorNotes?.trim()) return "HUMAN_REVIEWED";
  if (disposition === "Accepted") return "INCREASE";
  if (disposition === "Rejected") return "DECREASE";
  if (disposition === "Deferred") return "NEUTRAL";
  return "UNKNOWN";
}

export function formatConfidenceAdjustment(direction: ConfidenceDirection): string {
  return CONFIDENCE_DIRECTION_LABELS[direction];
}
