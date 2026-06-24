import type { LeaderConnection, VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderGeographyScope = {
  countySlugs: string[];
  citySlugs: string[];
  programSlugs: string[];
  events: Array<{ workbenchSlug: string; eventSlug: string; label: string }>;
  primaryCountySlug: string | null;
  primaryCitySlug: string | null;
};

export function resolveLeaderGeographyScope(leader: VolunteerLeader): LeaderGeographyScope {
  const countySlugs = new Set<string>();
  const citySlugs = new Set<string>();
  const programSlugs = new Set<string>();
  const events: LeaderGeographyScope["events"] = [];

  for (const conn of leader.connections) {
    switch (conn.kind) {
      case "county":
        if (conn.countySlug) countySlugs.add(conn.countySlug.replace(/-county$/, ""));
        break;
      case "city":
        citySlugs.add(conn.citySlug);
        break;
      case "program":
        programSlugs.add(conn.programSlug);
        break;
      case "event":
        events.push({
          workbenchSlug: conn.workbenchSlug,
          eventSlug: conn.eventSlug,
          label: conn.label,
        });
        break;
      default:
        break;
    }
  }

  const countyList = [...countySlugs];
  const cityList = [...citySlugs];
  const programList = [...programSlugs];

  return {
    countySlugs: countyList,
    citySlugs: cityList,
    programSlugs: programList,
    events,
    primaryCountySlug: countyList[0] ?? null,
    primaryCitySlug: cityList[0] ?? programList[0] ?? null,
  };
}

export function workbenchSlugsFromScope(scope: LeaderGeographyScope): string[] {
  return [...new Set([...scope.citySlugs, ...scope.programSlugs])];
}

export function connectionCountyName(conn: LeaderConnection): string | null {
  return conn.kind === "county" ? conn.county : null;
}
