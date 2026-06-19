import placementsSource from "../../../data/campaign-brain/fundraising-leadership-placements.source.json";
import { COMMUNITY_LEADERSHIP_ROLES } from "@/lib/election-plan/community-workbench/constants";
import {
  getCountyStrikeTeamBySlug,
  type CountyStrikeRole,
  type CountyStrikeTeam,
} from "@/lib/election-plan/load-county-strike-team";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getFosCountyRollup } from "@/lib/election-plan/load-fundraising-operating-system";

export type FundraisingLeadStatus = "open" | "assigned" | "interim" | "recruiting";

export type FundraisingLeadSlot = {
  level: "city" | "county" | "cluster";
  roleKey: string;
  label: string;
  displayName: string | null;
  status: FundraisingLeadStatus;
  source: string;
  note?: string;
  contact?: string;
};

type PlacementRow = {
  name?: string;
  status?: string;
  note?: string;
  contact?: string;
};

type PlacementsFile = {
  openSlotDisplay: string;
  city: Record<string, PlacementRow>;
  county: Record<string, PlacementRow>;
  cluster: Record<string, PlacementRow>;
};

const placements = placementsSource as PlacementsFile;

const CITY_INTERIM_ROLE_KEYS = [
  "fundraising_lead",
  "events_lead",
  "business_lead",
  "community_lead",
] as const;

function roleLabel(roleKey: string): string {
  return COMMUNITY_LEADERSHIP_ROLES.find((r) => r.key === roleKey)?.label ?? roleKey.replace(/_/g, " ");
}

function slotFromPlacement(
  level: FundraisingLeadSlot["level"],
  roleKey: string,
  label: string,
  row: PlacementRow | undefined,
): FundraisingLeadSlot | null {
  if (!row?.name?.trim()) return null;
  const status =
    row.status === "recruiting"
      ? "recruiting"
      : row.status === "vacant"
        ? "open"
        : "assigned";
  return {
    level,
    roleKey,
    label,
    displayName: row.name.trim(),
    status,
    source: "explicit_placement",
    note: row.note,
    contact: row.contact,
  };
}

function slotFromStrikeRole(
  level: "county",
  roleKey: string,
  label: string,
  role: CountyStrikeRole,
  strikeKey: string,
): FundraisingLeadSlot | null {
  if (!role.name.trim() || role.status === "vacant") return null;
  return {
    level,
    roleKey,
    label,
    displayName: role.name.trim(),
    status: role.status === "recruiting" ? "recruiting" : "interim",
    source: `county_strike_team.${strikeKey}`,
    note: `Interim county fundraising coverage via ${label} until dedicated county fundraising lead is placed.`,
    contact: role.email || role.phone || undefined,
  };
}

export function slotFromCommunityLeadership(
  rows: Array<{ roleKey: string; personName: string | null; contact?: string | null }>,
): FundraisingLeadSlot | null {
  for (const key of CITY_INTERIM_ROLE_KEYS) {
    const row = rows.find((r) => r.roleKey === key);
    if (!row?.personName?.trim()) continue;
    const dedicated = key === "fundraising_lead";
    return {
      level: "city",
      roleKey: dedicated ? "community_fundraising_lead" : key,
      label: dedicated ? "Fundraising Lead" : roleLabel(key),
      displayName: row.personName.trim(),
      status: dedicated ? "assigned" : "interim",
      source: `community_workbench.${key}`,
      note: dedicated
        ? undefined
        : `Interim city fundraising coverage via ${roleLabel(key)} until dedicated fundraising lead is placed.`,
      contact: row.contact?.trim() || undefined,
    };
  }
  return null;
}

export function resolveCityFundraisingLeadSync(
  citySlug: string,
  communityLeadership: Array<{ roleKey: string; personName: string | null; contact?: string | null }> = [],
): FundraisingLeadSlot {
  const explicit = slotFromPlacement(
    "city",
    "community_fundraising_lead",
    "Fundraising Lead",
    placements.city[citySlug],
  );
  if (explicit) return explicit;

  const fromWorkbench = slotFromCommunityLeadership(communityLeadership);
  if (fromWorkbench) return fromWorkbench;

  return {
    level: "city",
    roleKey: "community_fundraising_lead",
    label: "Fundraising Lead",
    displayName: null,
    status: "open",
    source: "unassigned",
    note: "Recruit a dedicated city fundraising lead — events or business lead can cover interim house-party and sponsor lanes.",
  };
}

export function resolveCountyFundraisingLead(countySlug: string): FundraisingLeadSlot {
  const explicit = slotFromPlacement(
    "county",
    "county_fundraising_lead",
    "County Fundraising Lead",
    placements.county[countySlug],
  );
  if (explicit) return explicit;

  const team = getCountyStrikeTeamBySlug(countySlug);
  if (team) {
    const events = slotFromStrikeRole(
      "county",
      "county_fundraising_lead",
      "Events Captain",
      team.roles.eventsCaptain,
      "eventsCaptain",
    );
    if (events) return events;

    const captain = slotFromStrikeRole(
      "county",
      "county_fundraising_lead",
      "County Captain",
      team.roles.countyCaptain,
      "countyCaptain",
    );
    if (captain) return captain;
  }

  return {
    level: "county",
    roleKey: "county_fundraising_lead",
    label: "County Fundraising Lead",
    displayName: null,
    status: "open",
    source: "unassigned",
    note: "Place county fundraising lead in strike team or fundraising-leadership-placements.source.json.",
  };
}

export function resolveClusterFundraisingLead(clusterId: string): FundraisingLeadSlot | null {
  const explicit = slotFromPlacement(
    "cluster",
    "cluster_fundraising_lead",
    "Cluster Fundraising Lead",
    placements.cluster[clusterId],
  );
  if (explicit) return explicit;

  const data = loadElectionPlanSnapshot();
  const cluster = data.execution?.clusters?.find((c) => c.id === clusterId);
  if (!cluster) return null;

  let best: { slot: FundraisingLeadSlot; baseGoal: number } | null = null;
  for (const countyName of cluster.counties) {
    const countyRow = data.counties.find((c) => c.county === countyName);
    if (!countyRow) continue;
    const rollup = getFosCountyRollup(countyRow.slug);
    const countyLead = resolveCountyFundraisingLead(countyRow.slug);
    if (countyLead.status === "open" || !countyLead.displayName) continue;
    const baseGoal = rollup?.baseGoal ?? 0;
    if (!best || baseGoal > best.baseGoal) {
      best = { slot: countyLead, baseGoal };
    }
  }

  if (best) {
    return {
      level: "cluster",
      roleKey: "cluster_fundraising_lead",
      label: "Cluster Fundraising Lead",
      displayName: best.slot.displayName,
      status: "interim",
      source: `cluster_escalation.${best.slot.source}`,
      note: `Interim cluster coverage via ${best.slot.label} (${best.slot.displayName}) — highest county FOS rollup in ${cluster.name}.`,
      contact: best.slot.contact,
    };
  }

  return {
    level: "cluster",
    roleKey: "cluster_fundraising_lead",
    label: "Cluster Fundraising Lead",
    displayName: null,
    status: "open",
    source: "unassigned",
    note: `Recruit cluster fundraising lead for ${cluster.name} (${cluster.counties.length} counties).`,
  };
}

export function strikeTeamForCounty(countySlug: string): CountyStrikeTeam | undefined {
  return getCountyStrikeTeamBySlug(countySlug);
}
