export const ALTERNATIVE_FUTURES_VERSION = "alternative-futures-1.0" as const;

export const ALTERNATIVE_FUTURE_IDS = [
  "EXPECTED",
  "HOSTILE",
  "OPPORTUNITY",
  "ESCALATION",
  "SURPRISE",
  "SILENCE",
] as const;

export type AlternativeFutureId = (typeof ALTERNATIVE_FUTURE_IDS)[number];

export type AlternativeFutureDefinition = {
  id: AlternativeFutureId;
  label: string;
  assumptions: string[];
  operatorNote: string;
};

export const ALTERNATIVE_FUTURES: AlternativeFutureDefinition[] = [
  {
    id: "EXPECTED",
    label: "Expected / median",
    assumptions: [
      "Counterparty responds in a typical public register for the channel.",
      "No unusual delay, walk-back, or coalition shock is invented.",
    ],
    operatorNote: "Baseline lane. Not a claim that this is the true future.",
  },
  {
    id: "HOSTILE",
    label: "Hostile",
    assumptions: [
      "Counterparty treats the opening as an attack or threat.",
      "Tone is adversarial but still bounded by supplied actor evidence.",
    ],
    operatorNote: "Stress lane. Do not treat hostility as the modal forecast.",
  },
  {
    id: "OPPORTUNITY",
    label: "Opportunity / best-case",
    assumptions: [
      "Counterparty finds a workable overlap or de-escalation path.",
      "Gains remain plausible; do not invent private deals or polls.",
    ],
    operatorNote: "Opportunity is a robustness lane, not a wish list.",
  },
  {
    id: "ESCALATION",
    label: "Escalation",
    assumptions: [
      "The exchange hardens: public contrast, institutional process, or coalition pressure increases.",
      "Escalation stays inside the supplied channel and evidence.",
    ],
    operatorNote: "Ask whether the opening still has a recoverable counter.",
  },
  {
    id: "SURPRISE",
    label: "Surprise / unusual-but-plausible",
    assumptions: [
      "Counterparty chooses an uncommon but still evidence-compatible move.",
      "Do not use black-swan invention or unsourced biography.",
    ],
    operatorNote: "Unusual is not leftover ensemble noise; it is a named branch.",
  },
  {
    id: "SILENCE",
    label: "Silence / non-response",
    assumptions: [
      "Move 1 is non-response, delayed reply, or public silence.",
      "Do not invent a speech, vote, or quote to fill the gap.",
    ],
    operatorNote: "Silence is a first-class future, not a failed generation.",
  },
];

export type AlternativeFutureAssignment = {
  ordinal: number;
  futureId: AlternativeFutureId;
  definition: AlternativeFutureDefinition;
};

export type FutureLaneSummary = {
  futureId: AlternativeFutureId;
  label: string;
  runCount: number;
  modalFrame: string | null;
  representativeOrdinal: number | null;
  legislativeNotes: string[];
};

export type RobustnessAcrossFutures = {
  version: string;
  requiredFutures: number;
  futuresWithRuns: number;
  coverage: number;
  lanes: FutureLaneSummary[];
  crossFutureFrameAgreement: number | null;
  robustnessScore: number | null;
  methodology: string;
  uncertainty: string[];
};
