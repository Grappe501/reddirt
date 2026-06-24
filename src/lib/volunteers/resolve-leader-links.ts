import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import type { LeaderConnection, ResolvedLeaderLink, VolunteerLeader } from "@/lib/volunteers/types";
import {
  CAMPAIGN_WORKBENCH_PINS,
  GAIL_CHOATE_PIN,
} from "@/lib/volunteers/leader-roster";

function resolveConnection(conn: LeaderConnection): ResolvedLeaderLink {
  switch (conn.kind) {
    case "county":
      return {
        kind: conn.kind,
        href: countyPlaybookHref(conn.county, conn.countySlug),
        label: conn.label ?? `${conn.county} County playbook`,
      };
    case "city":
      return {
        kind: conn.kind,
        href: `/election-plan/workbenches/${conn.citySlug}`,
        label: conn.label,
      };
    case "program":
      return {
        kind: conn.kind,
        href: `/election-plan/workbenches/${conn.programSlug}`,
        label: conn.label,
      };
    case "event":
      return {
        kind: conn.kind,
        href: `/election-plan/workbenches/${conn.workbenchSlug}/events/${conn.eventSlug}`,
        label: conn.label,
      };
    case "global":
      return {
        kind: conn.kind,
        href: conn.href,
        label: conn.label,
        description: conn.description,
      };
  }
}

export function resolveLeaderPersonalLinks(leader: VolunteerLeader): ResolvedLeaderLink[] {
  return leader.connections.map(resolveConnection);
}

export function resolveLeaderCampaignPins(leader: VolunteerLeader): ResolvedLeaderLink[] {
  const pins: ResolvedLeaderLink[] = CAMPAIGN_WORKBENCH_PINS.map((p) => ({
    kind: "global" as const,
    href: p.href,
    label: p.label,
    description: p.description,
  }));

  if (leader.slug !== "gail-choate") {
    pins.unshift({
      kind: "global",
      href: GAIL_CHOATE_PIN.href,
      label: GAIL_CHOATE_PIN.label,
      description: GAIL_CHOATE_PIN.description,
    });
  }

  return pins;
}

export function resolveLeaderWorkbenchLinks(leader: VolunteerLeader): ResolvedLeaderLink[] {
  return [...resolveLeaderPersonalLinks(leader), ...resolveLeaderCampaignPins(leader)];
}

export function primaryCountyLabel(leader: VolunteerLeader): string | null {
  const county = leader.connections.find((c) => c.kind === "county");
  if (!county || county.kind !== "county") return null;
  return county.county;
}
