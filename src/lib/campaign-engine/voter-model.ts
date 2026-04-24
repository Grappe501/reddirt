/**
 * VOTER-MODEL-1: deterministic, explainable tier hints from signal rows.
 * Does not persist; does not call AI. Callers decide whether to write `VoterModelClassification`.
 */

import {
  ModelConfidence,
  VoterClassification,
  VoterSignalKind,
  VoterSignalStrength,
} from "@prisma/client";

export const VOTER_MODEL_1_PACKET = "VOTER-MODEL-1" as const;

export type VoterModelClassificationInput = {
  kind: VoterSignalKind;
  signalStrength: VoterSignalStrength;
  confidence: ModelConfidence;
}[];

export type VoterModelRuleOutput = {
  classification: VoterClassification;
  confidence: ModelConfidence;
  sourceSummary: string;
  /** Stable codes for UI / audit (not user-facing sentences). */
  reasonCodes: string[];
};

const POSITIVE_KINDS = new Set<VoterSignalKind>([
  VoterSignalKind.DONOR,
  VoterSignalKind.VOLUNTEER,
  VoterSignalKind.RELATIONAL_CONTACT,
  VoterSignalKind.INITIATIVE_SIGNER,
  VoterSignalKind.EVENT_ATTENDEE,
]);

function summarizeKinds(signals: VoterModelClassificationInput): string {
  const parts = signals.map((s) => `${s.kind}:${s.signalStrength}:${s.confidence}`);
  return parts.join("; ");
}

/**
 * Rule-based classification from signal shape only. Weak signals and conflicts collapse to UNKNOWN / PERSUADABLE.
 */
export function classifyVoterFromSignals(signals: VoterModelClassificationInput): VoterModelRuleOutput {
  const reasonCodes: string[] = [];

  if (!signals.length) {
    return {
      classification: VoterClassification.UNKNOWN,
      confidence: ModelConfidence.LOW,
      sourceSummary: "No voter signals supplied",
      reasonCodes: ["NO_SIGNALS"],
    };
  }

  const humanConfirmed = signals.filter((s) => s.confidence === ModelConfidence.HUMAN_CONFIRMED);
  const anyNegative = signals.some((s) => s.signalStrength === VoterSignalStrength.NEGATIVE);
  const humanNegative = humanConfirmed.some((s) => s.signalStrength === VoterSignalStrength.NEGATIVE);

  if (humanNegative) {
    reasonCodes.push("HUMAN_CONFIRMED_NEGATIVE");
    return {
      classification: VoterClassification.UNLIKELY_OR_OPPOSED,
      confidence: ModelConfidence.HUMAN_CONFIRMED,
      sourceSummary: summarizeKinds(signals),
      reasonCodes,
    };
  }

  if (anyNegative && humanConfirmed.some((s) => s.signalStrength !== VoterSignalStrength.NEGATIVE)) {
    reasonCodes.push("CONFLICT_NEGATIVE_AND_OTHER_HUMAN");
    return {
      classification: VoterClassification.PERSUADABLE,
      confidence: ModelConfidence.MEDIUM,
      sourceSummary: summarizeKinds(signals),
      reasonCodes,
    };
  }

  if (anyNegative) {
    reasonCodes.push("NEGATIVE_SIGNAL_PRESENT");
    return {
      classification: VoterClassification.UNLIKELY_OR_OPPOSED,
      confidence: ModelConfidence.MEDIUM,
      sourceSummary: summarizeKinds(signals),
      reasonCodes,
    };
  }

  const strongPositiveHuman = humanConfirmed.filter(
    (s) =>
      POSITIVE_KINDS.has(s.kind) &&
      (s.signalStrength === VoterSignalStrength.STRONG || s.signalStrength === VoterSignalStrength.MODERATE),
  );
  if (strongPositiveHuman.length >= 1) {
    const tier =
      strongPositiveHuman.some((s) => s.signalStrength === VoterSignalStrength.STRONG) &&
      (strongPositiveHuman.length >= 2 || strongPositiveHuman.some((s) => s.kind === VoterSignalKind.VOLUNTEER))
        ? VoterClassification.STRONG_BASE
        : VoterClassification.LIKELY_SUPPORTER;
    reasonCodes.push("HUMAN_CONFIRMED_POSITIVE_ENGAGEMENT");
    return {
      classification: tier,
      confidence: ModelConfidence.HUMAN_CONFIRMED,
      sourceSummary: summarizeKinds(signals),
      reasonCodes,
    };
  }

  const strongAuto = signals.filter(
    (s) => POSITIVE_KINDS.has(s.kind) && s.signalStrength === VoterSignalStrength.STRONG,
  );
  if (strongAuto.length >= 2) {
    reasonCodes.push("MULTIPLE_STRONG_POSITIVE_NON_HUMAN");
    return {
      classification: VoterClassification.LIKELY_SUPPORTER,
      confidence: ModelConfidence.MEDIUM,
      sourceSummary: summarizeKinds(signals),
      reasonCodes,
    };
  }
  if (strongAuto.length === 1) {
    reasonCodes.push("SINGLE_STRONG_POSITIVE_NON_HUMAN");
    return {
      classification: VoterClassification.LIKELY_SUPPORTER,
      confidence: ModelConfidence.LOW,
      sourceSummary: summarizeKinds(signals),
      reasonCodes,
    };
  }

  const moderatePositive = signals.filter(
    (s) =>
      POSITIVE_KINDS.has(s.kind) && s.signalStrength === VoterSignalStrength.MODERATE,
  );
  if (moderatePositive.length >= 1) {
    reasonCodes.push("MODERATE_POSITIVE_ENGAGEMENT");
    return {
      classification: VoterClassification.LEANING_SUPPORTER,
      confidence: ModelConfidence.LOW,
      sourceSummary: summarizeKinds(signals),
      reasonCodes,
    };
  }

  const weakOnly = signals.every((s) => s.signalStrength === VoterSignalStrength.WEAK);
  const unknownStrength = signals.some((s) => s.signalStrength === VoterSignalStrength.UNKNOWN);

  if (weakOnly || unknownStrength) {
    reasonCodes.push("WEAK_OR_UNKNOWN_SIGNAL_STRENGTH");
    return {
      classification: VoterClassification.UNKNOWN,
      confidence: ModelConfidence.LOW,
      sourceSummary: summarizeKinds(signals),
      reasonCodes,
    };
  }

  const pollingOrHistory = signals.filter(
    (s) => s.kind === VoterSignalKind.POLLING || s.kind === VoterSignalKind.VOTER_HISTORY,
  );
  if (pollingOrHistory.length > 0) {
    reasonCodes.push("INDIRECT_ELECTORAL_SIGNAL_ONLY");
    return {
      classification: VoterClassification.PERSUADABLE,
      confidence: ModelConfidence.LOW,
      sourceSummary: summarizeKinds(signals),
      reasonCodes,
    };
  }

  reasonCodes.push("FALLBACK_INSUFFICIENT_PATTERN");
  return {
    classification: VoterClassification.UNKNOWN,
    confidence: ModelConfidence.LOW,
    sourceSummary: summarizeKinds(signals),
    reasonCodes,
  };
}
