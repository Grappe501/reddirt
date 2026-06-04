/** Client-safe briefing depth types — merged at read time onto drill-down records. */

export type DebateAlternativeLine = {
  label: string;
  text: string;
  whenToUse: string;
  presenceGoal: string;
};

export type HammerResearchHook = {
  label: string;
  href: string;
  finding: string;
  howToUseInPrep: string;
};

export type DebateQuestionBriefing = {
  briefingSummary: string;
  whyThisAnswerWorks: string;
  whyNotRepeatVerbatim: string;
  alternativeOpeners: DebateAlternativeLine[];
  alternativeClosers: DebateAlternativeLine[];
  alternativeContrasts: DebateAlternativeLine[];
  philosophyBriefingIds: string[];
  hammerResearchHooks: HammerResearchHook[];
  quickPrepChecklist: string[];
  oppositionIntelNote: string;
};

export type DebatePhilosophyBriefing = {
  briefingId: string;
  title: string;
  eyebrow: string;
  summary: string;
  corePhilosophy: string;
  whyThisMethod: string;
  whenToApply: string[];
  whenNotToApply: string[];
  handlingSteps: string[];
  samplePhrases: DebateAlternativeLine[];
  commonMistakes: string[];
  linkedQuestionIds: string[];
  linkedTrapLaneIds: string[];
  hammerResearchHooks: HammerResearchHook[];
  relatedLinks: Array<{ href: string; label: string }>;
  estimatedReadMinutes: number;
};

export type DebatePrepFinderEntry = {
  id: string;
  kind: "question" | "trap-lane" | "philosophy" | "prep-section" | "opposition";
  title: string;
  summary: string;
  href: string;
  tags: string[];
  probability?: "HIGH" | "MEDIUM" | "LOW";
};
