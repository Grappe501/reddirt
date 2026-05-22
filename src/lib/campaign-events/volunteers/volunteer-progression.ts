import type { VolunteerProgressLevel, VolunteerProfile } from "./volunteer-types";

export type ProgressionTier = {
  level: VolunteerProgressLevel;
  label: string;
  description: string;
  unlockCriteria: string[];
  nextLevel?: VolunteerProgressLevel;
};

export const VOLUNTEER_PROGRESSION_TIERS: ProgressionTier[] = [
  { level: "helper_l1", label: "Helper (L1)", description: "First shifts, learning campaign basics.", unlockCriteria: ["Complete campaign-basics"], nextLevel: "event_volunteer_l2" },
  { level: "event_volunteer_l2", label: "Event Volunteer (L2)", description: "Reliable at events — check-in, setup, literature.", unlockCriteria: ["2+ completed assignments", "event-setup training"], nextLevel: "outreach_volunteer_l3" },
  { level: "outreach_volunteer_l3", label: "Outreach Volunteer (L3)", description: "Canvass, phone/text bank with supervision.", unlockCriteria: ["Privacy training", "Supervised outreach shift"], nextLevel: "team_captain_l4" },
  { level: "team_captain_l4", label: "Team Captain (L4)", description: "Leads small volunteer teams at events.", unlockCriteria: ["Reliability ≥ 75", "Leadership potential medium+"], nextLevel: "county_leader_l5" },
  { level: "county_leader_l5", label: "County Leader (L5)", description: "County organizing, Power of 5, captain coaching.", unlockCriteria: ["County organizing module", "CM approval"], nextLevel: undefined },
];

export const INTERN_PROGRESSION = [
  "Research helper",
  "Event support",
  "Data helper",
  "Communications helper",
  "Field support",
  "Project owner",
] as const;

export const FIELD_MANAGER_PROGRESSION = [
  "County monitor",
  "Volunteer recruiter",
  "Event builder",
  "County captain coach",
  "Regional organizer",
] as const;

export function suggestNextProgressLevel(profile: VolunteerProfile): VolunteerProgressLevel {
  const current = profile.progressLevel;
  const tier = VOLUNTEER_PROGRESSION_TIERS.find((t) => t.level === current);
  if (!tier?.nextLevel) return current;
  if (profile.reliabilityScore >= 75 && profile.trainingCompleted.length >= 3) return tier.nextLevel;
  if (profile.leadershipPotential === "high" && profile.reliabilityScore >= 65) return tier.nextLevel;
  return current;
}
