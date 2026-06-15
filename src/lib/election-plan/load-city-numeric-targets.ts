import type { ElectionPlanCity, ElectionPlanCounty } from "@/lib/election-plan/types";

import numericSource from "../../../data/campaign-brain/city-location-numeric-targets.source.json";

export type CityRegistrationTargets = {
  newRegistrations: number;
  registrationChecks: number;
  countySharePct: number;
  countyRegistrationGoal: number;
  chapter05Source: string;
};

export type CityHousePartyTargets = {
  hosts: number;
  activeHosts: number;
  powerOf5Circles: number;
  conversationsTarget: number;
  vipTables: number | null;
};

export type CityVolunteerTargets = {
  activeVolunteers: number;
  captains: number;
  currentSignups?: number;
};

export type CityNumericTargets = {
  locked: boolean;
  source: string;
  registration: CityRegistrationTargets;
  houseParties: CityHousePartyTargets;
  volunteers: CityVolunteerTargets;
  votes: { target: number; gainNeeded: number };
};

type SourceFile = {
  targets: Record<string, CityNumericTargets>;
};

export function getCityNumericTargets(citySlug: string): CityNumericTargets | undefined {
  return (numericSource as SourceFile).targets[citySlug];
}

export function formatRegistrationGoalLine(t: CityNumericTargets, countyName: string): string {
  return `Complete ${t.registration.newRegistrations.toLocaleString()} new registrations (${t.registration.registrationChecks.toLocaleString()} registration checks) — ${t.registration.countySharePct}% of ${countyName} County's ${t.registration.countyRegistrationGoal.toLocaleString()} chapter-05 Lane 3 goal.`;
}

export function formatHousePartyGoalLine(t: CityNumericTargets): string {
  const vip =
    t.houseParties.vipTables != null ? ` · ${t.houseParties.vipTables} VIP tables` : "";
  return `${t.houseParties.hosts} listed house party hosts (${t.houseParties.activeHosts} active before peak season) · ${t.houseParties.powerOf5Circles} Power of 5 circles · ${t.houseParties.conversationsTarget.toLocaleString()} trusted conversations${vip}.`;
}

export function formatVolunteerGoalLine(t: CityNumericTargets): string {
  const current =
    t.volunteers.currentSignups != null
      ? ` (${t.volunteers.currentSignups} signed up so far)`
      : "";
  return `${t.volunteers.activeVolunteers} active volunteers · ${t.volunteers.captains} neighborhood captains${current}.`;
}

export function countyCityRegistrationAllocation(
  county: ElectionPlanCounty,
  cities: ElectionPlanCity[],
): Array<{ city: ElectionPlanCity; targets: CityNumericTargets }> {
  const inCounty = cities.filter((c) => c.county.toLowerCase() === county.county.toLowerCase());
  return inCounty
    .map((city) => {
      const targets = getCityNumericTargets(city.slug);
      return targets ? { city, targets } : null;
    })
    .filter((row): row is { city: ElectionPlanCity; targets: CityNumericTargets } => row != null)
    .sort((a, b) => a.city.rank - b.city.rank);
}

export function countyAllocatedRegistrationTotal(
  rows: Array<{ targets: CityNumericTargets }>,
): number {
  return rows.reduce((s, r) => s + r.targets.registration.newRegistrations, 0);
}
