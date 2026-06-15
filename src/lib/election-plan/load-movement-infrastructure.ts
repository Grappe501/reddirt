import campusSource from "../../../data/campaign-brain/movement-infrastructure/arkansas-campuses.source.json";
import freshmanWeekSource from "../../../data/campaign-brain/movement-infrastructure/freshman-week-readiness.source.json";
import trustSource from "../../../data/campaign-brain/movement-infrastructure/arkansas-trust-network.source.json";
import storyCorpsSource from "../../../data/campaign-brain/movement-infrastructure/arkansas-story-corps.source.json";
import directDemocracySource from "../../../data/campaign-brain/movement-infrastructure/direct-democracy-initiative.source.json";
import budgetAdditionsSource from "../../../data/campaign-brain/movement-infrastructure/phase-18-budget-additions.source.json";
import mobilizeRulesSource from "../../../data/campaign-brain/movement-infrastructure/mobilize-automation-rules.source.json";
import thankYouSource from "../../../data/campaign-brain/movement-infrastructure/thank-you-doctrine.source.json";

export type FreshmanWeekReadiness = {
  captainAssigned: boolean;
  tableLocationSecured: boolean;
  mobilizeEventCreated: boolean;
  volunteersAssigned: boolean;
  registrationMaterialsReady: boolean;
  kellyAppearanceStatus: string;
  notes?: string;
};

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
  freshmanWeekReadiness?: FreshmanWeekReadiness;
  notes?: string;
};

const DEFAULT_FRESHMAN_READINESS: FreshmanWeekReadiness = {
  captainAssigned: false,
  tableLocationSecured: false,
  mobilizeEventCreated: false,
  volunteersAssigned: false,
  registrationMaterialsReady: false,
  kellyAppearanceStatus: "not_requested",
};

function mergeFreshmanReadiness(campus: Omit<ArkansasCampus, "freshmanWeekReadiness">): ArkansasCampus {
  const readinessMap = (freshmanWeekSource as { campuses: Record<string, FreshmanWeekReadiness> }).campuses;
  const readiness = readinessMap[campus.slug];
  const merged: FreshmanWeekReadiness = {
    ...DEFAULT_FRESHMAN_READINESS,
    ...readiness,
    captainAssigned: campus.campusCaptainStatus === "filled" || readiness?.captainAssigned === true,
    mobilizeEventCreated: campus.mobilizeEvents > 0 || readiness?.mobilizeEventCreated === true,
  };
  return { ...campus, freshmanWeekReadiness: merged };
}

export function getArkansasCampuses(): ArkansasCampus[] {
  return (campusSource as { campuses: Omit<ArkansasCampus, "freshmanWeekReadiness">[] }).campuses.map(
    mergeFreshmanReadiness,
  );
}

export function getCampusBySlug(slug: string): ArkansasCampus | undefined {
  return getArkansasCampuses().find((c) => c.slug === slug);
}

export function getCampusNetworkRollup() {
  const campuses = getArkansasCampuses();
  const freshmanCampuses = campuses.filter((c) => c.freshmanWeekOpportunity);
  const readinessComplete = (c: ArkansasCampus) => {
    const r = c.freshmanWeekReadiness;
    if (!r) return false;
    return (
      r.captainAssigned &&
      r.tableLocationSecured &&
      r.mobilizeEventCreated &&
      r.volunteersAssigned &&
      r.registrationMaterialsReady
    );
  };
  return {
    campusCount: campuses.length,
    totalEnrollment: campuses.reduce((s, c) => s + c.enrollment, 0),
    totalVotingAge: campuses.reduce((s, c) => s + c.votingAgeEstimate, 0),
    registrationGoal: campuses.reduce((s, c) => s + c.registrationGoal, 0),
    volunteerGoal: campuses.reduce((s, c) => s + c.volunteerGoal, 0),
    fundraisingGoal: campuses.reduce((s, c) => s + c.fundraisingGoal, 0),
    captainsFilled: campuses.filter((c) => c.campusCaptainStatus === "filled").length,
    captainsVacant: campuses.filter((c) => c.campusCaptainStatus === "vacant").length,
    freshmanWeekCampuses: freshmanCampuses.length,
    freshmanWeekReady: freshmanCampuses.filter(readinessComplete).length,
    freshmanWeekNotReady: freshmanCampuses.filter((c) => !readinessComplete(c)).length,
  };
}

export function getFreshmanWeekReadinessRollup() {
  const campuses = getArkansasCampuses().filter((c) => c.freshmanWeekOpportunity);
  const checklistKeys = [
    "captainAssigned",
    "tableLocationSecured",
    "mobilizeEventCreated",
    "volunteersAssigned",
    "registrationMaterialsReady",
  ] as const;

  return {
    targetDate: (freshmanWeekSource as { targetOperationalDate: string }).targetOperationalDate,
    laborDayGate: (freshmanWeekSource as { laborDayGate: string }).laborDayGate,
    campuses,
    checklistLabels: (freshmanWeekSource as { checklistLabels: Record<string, string> }).checklistLabels,
    summary: {
      total: campuses.length,
      fullyReady: campuses.filter((c) => {
        const r = c.freshmanWeekReadiness!;
        return checklistKeys.every((k) => r[k]);
      }).length,
      captainsAssigned: campuses.filter((c) => c.freshmanWeekReadiness?.captainAssigned).length,
      mobilizeCreated: campuses.filter((c) => c.freshmanWeekReadiness?.mobilizeEventCreated).length,
      kellyConfirmed: campuses.filter((c) => c.freshmanWeekReadiness?.kellyAppearanceStatus === "confirmed").length,
    },
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
