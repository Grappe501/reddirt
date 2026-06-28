import { countyPlaybookHref, electionPlanSlugForCountyName } from "@/lib/election-plan/location-links";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderResidenceSource = "assigned" | "inferred" | "missing";

export type LeaderResidenceDrillDown = {
  citySlug: string | null;
  cityLabel: string | null;
  countyName: string | null;
  countySlug: string | null;
  source: LeaderResidenceSource;
  confirmed: boolean;
  links: {
    cityBrief: string | null;
    cityWorkbench: string | null;
    countyPlaybook: string | null;
    countyPathToVictory: string | null;
  };
};

function countySlugFromName(countyName: string, explicit?: string): string {
  if (explicit?.trim()) return explicit.replace(/-county$/, "").trim();
  return electionPlanSlugForCountyName(countyName);
}

function buildLinks(citySlug: string | null, cityLabel: string | null, countyName: string | null, countySlug: string | null): LeaderResidenceDrillDown["links"] {
  const cSlug = countyName ? countySlugFromName(countyName, countySlug ?? undefined) : null;
  return {
    cityBrief: citySlug ? `/election-plan/cities/${citySlug}` : null,
    cityWorkbench: citySlug ? `/election-plan/workbenches/${citySlug}` : null,
    countyPlaybook: countyName && cSlug ? countyPlaybookHref(countyName, cSlug) : null,
    countyPathToVictory: cSlug ? `/election-plan/counties/${cSlug}/path-to-victory` : null,
  };
}

/** Home geography + playbook drill-down links for every leader workbench. */
export function resolveLeaderResidence(leader: VolunteerLeader): LeaderResidenceDrillDown {
  const assigned = leader.residence;
  if (assigned?.countyName?.trim()) {
    const citySlug = assigned.citySlug?.trim() || null;
    const countySlug = countySlugFromName(assigned.countyName, assigned.countySlug);
    const cityConn = leader.connections.find((c) => c.kind === "city");
    const cityLabel =
      assigned.cityLabel?.trim() ||
      (cityConn && cityConn.kind === "city" ? cityConn.label : null) ||
      (citySlug ? citySlug.replace(/-/g, " ") : null);
    return {
      citySlug,
      cityLabel,
      countyName: assigned.countyName.trim(),
      countySlug,
      source: "assigned",
      confirmed: Boolean(assigned.confirmed),
      links: buildLinks(citySlug, cityLabel, assigned.countyName.trim(), countySlug),
    };
  }

  const cityConn = leader.connections.find((c) => c.kind === "city");
  const countyConn = leader.connections.find((c) => c.kind === "county");

  const citySlug = cityConn && cityConn.kind === "city" ? cityConn.citySlug : null;
  const cityLabel = cityConn && cityConn.kind === "city" ? cityConn.label : null;
  const countyName =
    countyConn && countyConn.kind === "county" ? countyConn.county.replace(/\s+County$/i, "").trim() : null;
  const countySlug =
    countyConn && countyConn.kind === "county"
      ? countySlugFromName(countyConn.county, countyConn.countySlug)
      : null;

  if (citySlug || countyName) {
    return {
      citySlug,
      cityLabel,
      countyName,
      countySlug,
      source: "inferred",
      confirmed: false,
      links: buildLinks(citySlug, cityLabel, countyName, countySlug),
    };
  }

  return {
    citySlug: null,
    cityLabel: null,
    countyName: null,
    countySlug: null,
    source: "missing",
    confirmed: false,
    links: buildLinks(null, null, null, null),
  };
}
