import type { RebuttalScript, SampleScript, DebateZinger } from "@/lib/intelligence/v4/debatePrepDrillDownTypes";
import type { DebateEncounterDepth } from "@/lib/intelligence/v4/debateEncounterDepthTypes";

export type SosDebateQuestionCategory =
  | "elections-integrity"
  | "voter-access"
  | "county-administration"
  | "direct-democracy"
  | "business-services"
  | "office-role"
  | "experience-readiness"
  | "security-cyber"
  | "three-way-race"
  | "current-record";

export type SpeakOrderPosition = 1 | 2 | 3;

export type SpeakOrderDrill = {
  position: SpeakOrderPosition;
  label: string;
  strategy: string;
  openingLine: string;
  freshAddition: string;
  ifOthersAlreadyAgreed: string;
  ifOthersAttackedKelly: string;
  closingBeat: string;
};

export type SosDebateResearchRef = {
  source: string;
  url: string;
  note: string;
};

export type SosDebateQuestionDrillDown = {
  questionId: string;
  questionNumber: number;
  category: SosDebateQuestionCategory;
  categoryLabel: string;
  title: string;
  moderatorLikelyPhrasings: string[];
  probability: "HIGH" | "MEDIUM" | "LOW";
  researchBasis: string;
  researchRefs: SosDebateResearchRef[];
  sosJobDuties: string[];
  whyModeratorsAsk: string;
  whatHammerLikelySays: string[];
  whatPackoMayAdd: string[];
  whatNorrisMayHaveSaid: string[];
  speakOrderDrills: SpeakOrderDrill[];
  directAnswer30s: string;
  directAnswer60s: string;
  agreeButNeverOnlyAgree: string;
  rebuttalIfHammerAttacks: RebuttalScript[];
  rebuttalIfYouArePileOnTarget: string[];
  sampleScripts: SampleScript[];
  zingers: DebateZinger[];
  mistakesFirstTimersMake: string[];
  bodyLanguageAndTone: string;
  rehearsalSteps: string[];
  relatedBills: string[];
  relatedActs: string[];
  trapLaneHref: string | null;
  relatedLinks: Array<{ href: string; label: string }>;
  claimsGate: string;
  estimatedPrepMinutes: number;
  encounterDepth?: DebateEncounterDepth;
  /** Rich answer-first expansion — full scripts, opponent narratives, exchange handling */
  comprehensive?: SosQuestionComprehensiveExpansion;
};

export type OpponentExchange = {
  opponentLine: string;
  kellyResponse: string;
  toneNote?: string;
};

export type SosQuestionComprehensiveExpansion = {
  /** Clearest single phrasing of the question */
  questionAsAsked: string;
  /** Scene-setting for Kelly — not internal process */
  scenarioContext: string[];
  hammerExpectedNarrative: string;
  packoExpectedNarrative: string;
  hammerExchanges: OpponentExchange[];
  packoExchanges: OpponentExchange[];
  speakFirstFullScript: string;
  speakSecondFullScript: string;
  speakThirdFullScript: string;
  additionalPhrasings: string[];
};

export type SosDebateQuestionSummary = {
  questionId: string;
  questionNumber: number;
  title: string;
  categoryLabel: string;
  probability: "HIGH" | "MEDIUM" | "LOW";
  oneLinePrep: string;
};
