import campusSource from "../../../data/campaign-brain/movement-infrastructure/arkansas-campuses.source.json";
import trustSource from "../../../data/campaign-brain/movement-infrastructure/arkansas-trust-network.source.json";
import storyCorpsSource from "../../../data/campaign-brain/movement-infrastructure/arkansas-story-corps.source.json";
import directDemocracySource from "../../../data/campaign-brain/movement-infrastructure/direct-democracy-initiative.source.json";
import budgetAdditionsSource from "../../../data/campaign-brain/movement-infrastructure/phase-18-budget-additions.source.json";
import mobilizeRulesSource from "../../../data/campaign-brain/movement-infrastructure/mobilize-automation-rules.source.json";
import thankYouSource from "../../../data/campaign-brain/movement-infrastructure/thank-you-doctrine.source.json";

export type ArkansasCampus = {
  slug: string;
  name: string;
  shortName: string;
  type: "university" | "college" | "community_college" | "technical";
  city: string;
  county: string;
  enrollment: number;
  votingAgeEstimate: number;
  registrationGoal: number;
  volunteerGoal: number;
  fundraisingGoal: number;
  eventsHosted: number;
  kellyAppearances: number;
  campusCaptainStatus: "filled" | "vacant";
  mobilizeEvents: number;
  powerOf5Leaders: number;
  freshmanWeekOpportunity: boolean;
  notes?: string;
};

export function getArkansasCampuses(): ArkansasCampus[] {
  return (campusSource as { campuses: ArkansasCampus[] }).campuses;
}

export function getCampusBySlug(slug: string): ArkansasCampus | undefined {
  return getArkansasCampuses().find((c) => c.slug === slug);
}

export function getCampusNetworkRollup() {
  const campuses = getArkansasCampuses();
  return {
    campusCount: campuses.length,
    totalEnrollment: campuses.reduce((s, c) => s + c.enrollment, 0),
    totalVotingAge: campuses.reduce((s, c) => s + c.votingAgeEstimate, 0),
    registrationGoal: campuses.reduce((s, c) => s + c.registrationGoal, 0),
    volunteerGoal: campuses.reduce((s, c) => s + c.volunteerGoal, 0),
    fundraisingGoal: campuses.reduce((s, c) => s + c.fundraisingGoal, 0),
    captainsFilled: campuses.filter((c) => c.campusCaptainStatus === "filled").length,
    captainsVacant: campuses.filter((c) => c.campusCaptainStatus === "vacant").length,
    freshmanWeekCampuses: campuses.filter((c) => c.freshmanWeekOpportunity).length,
  };
}

export function getArkansasTrustNetwork() {
  return trustSource;
}

export function getArkansasStoryCorps() {
  return storyCorpsSource;
}

export function getDirectDemocracyInitiative() {
  return directDemocracySource;
}

export function getPhase18BudgetAdditions() {
  return budgetAdditionsSource;
}

export function getMobilizeAutomationRules() {
  return mobilizeRulesSource;
}

export function getThankYouDoctrine() {
  return thankYouSource;
}
