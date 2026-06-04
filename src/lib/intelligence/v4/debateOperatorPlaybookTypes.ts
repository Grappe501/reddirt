/**
 * Extended operator playbooks — step-by-step how/when/where/why for bills and contrast lanes.
 */

export type PlaybookStep = {
  step: number;
  dimension: "WHAT" | "WHEN" | "WHERE" | "WHY" | "HOW" | "WHO";
  detail: string;
};

export type DebateUseScript = {
  bringUpWhen: string;
  openingLine: string;
  actAnchor: string;
  countyOrVoterImpact: string;
  kellyBridge: string;
  rebuttalIfHeCounters: string;
  doNotSay: string[];
};

export type SocialMediaUseScript = {
  platforms: string[];
  postFormat: string;
  threadOutline: string[];
  graphicCaption: string;
  claimsGateReminder: string;
};

export type TrapSetup = {
  name: string;
  baitLineYouWantFromOpponent: string;
  moderatorOrKellySetupQuestion: string;
  kellyPivotWhenHeBites: string;
  whyItWorks: string;
};

export type BillOperatorPlaybook = {
  billNumber: string;
  actNumber: string | null;
  headline: string;
  recordItemLabel: string;
  steps: PlaybookStep[];
  debateUse: DebateUseScript;
  socialMediaUse: SocialMediaUseScript;
  /** Governance-safe: burden on voters/counties/workers — not unsourced motive attacks. */
  peopleImpactFrame: string;
  trapSetup: TrapSetup | null;
  kellyDifference: string;
  isCurated: boolean;
};

export type OpponentContrastLane = {
  id: string;
  title: string;
  hammerLikelyClaim: string;
  kellyContrast: string;
  experienceGap: string;
  debateSteps: PlaybookStep[];
  socialUse: string;
  trapSetup: TrapSetup | null;
};
