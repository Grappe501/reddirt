/** Fictional named audience personas — who Kelly is speaking to (campaign-wide, not PII). */

export type VoterAudienceSegment =
  | "lane2_democrat"
  | "faith_community"
  | "election_professional"
  | "young_voter"
  | "rural_independent"
  | "moderate_republican"
  | "direct_democracy"
  | "election_skeptic"
  | "community_organizer"
  | "senior_veteran"
  | "delta_base"
  | "small_town_validator"
  | "suburban_persuadable"
  | "ozarks_retiree"
  | "working_parent"
  | "reform_curious";

export type VoterAudienceProfile = {
  id: string;
  displayName: string;
  /** Two-letter avatar initials */
  initials: string;
  /** Tailwind bg class for avatar chip */
  avatarColor: string;
  segment: VoterAudienceSegment;
  segmentLabel: string;
  tagline: string;
  /** Planning estimate — not a census claim */
  demographicSketch: string;
  geographySketch: string;
  estimatedShareNote: string;
  whatTheyFear: string[];
  whatTheyNeedToHear: string[];
  kellyTone: string;
  doNotSay: string[];
  debatePrepHooks: string[];
  /** County slugs where this persona is especially pertinent */
  homeCounties: string[];
  /** City slugs (Top 100) */
  homeCities: string[];
};

export type LocationAudienceOverlay = {
  slug: string;
  name: string;
  kind: "county" | "city";
  countySlug?: string;
  populationNote: string | null;
  /** Ordered — first is primary “speak to” for this place */
  profileIds: string[];
  makeupNote: string;
  sources: string[];
};

export type KellyVoterAudienceModelsFile = {
  version: number;
  builtAt: string;
  pageSummary: string;
  modelNote: string;
  profiles: VoterAudienceProfile[];
  counties: Record<string, LocationAudienceOverlay>;
  cities: Record<string, LocationAudienceOverlay>;
};
