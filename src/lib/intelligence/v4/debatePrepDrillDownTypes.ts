import type { OperatorGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import type { DebateEncounterDepth } from "@/lib/intelligence/v4/debateEncounterDepthTypes";

export type RebuttalScript = {
  trigger: string;
  hammerLikelyLine: string;
  agree: string;
  contrast: string;
  bridge: string;
  zinger?: string;
  claimsNote?: string;
};

export type SampleScript = {
  label: string;
  duration: string;
  text: string;
  deliveryNote?: string;
};

export type DebateZinger = {
  line: string;
  whenToUse: string;
  whenNotToUse: string;
  claimsGate?: string;
};

/** Full drill-down for one prep packet section — Kelly first debate vs 25+ year opponent. */
export type DebatePrepSectionDrillDown = OperatorGuide & {
  sectionId: string;
  sectionNumber: number;
  sectionTitle: string;
  firstTimeDebateNote: string;
  whatOpponentWillDo: string[];
  whatModeratorMayAsk: string[];
  setupMoves: string[];
  rebuttalScripts: RebuttalScript[];
  sampleScripts: SampleScript[];
  zingers: DebateZinger[];
  mistakesFirstTimersMake: string[];
  bodyLanguageAndTone: string;
  rehearsalSteps: string[];
  staffRole: string;
  relatedLinks: Array<{ href: string; label: string }>;
  estimatedPrepMinutes: number;
  encounterDepth?: DebateEncounterDepth;
};
