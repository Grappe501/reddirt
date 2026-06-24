import commissionFile from "../../../data/volunteers/grassroots-fundraising-commission.source.json";
import type { VolunteerLeader } from "@/lib/volunteers/types";

const registry = commissionFile as {
  internalOnly: boolean;
  defaultFieldFundraiserDirectPercent: number;
  grassrootsFundraisingLeadDirectPercent: number;
  grassrootsFundraisingLeadDownlineOverridePercent: number;
  grassrootsFundraisingLeadSlugs: string[];
};

export type GrassrootsFundraisingCommissionTier = "grassroots_fundraising_lead" | "field_fundraiser";

/** Internal attribution profile for QR / weblink tracked gifts — not for public UI. */
export type GrassrootsFundraisingCommissionProfile = {
  tier: GrassrootsFundraisingCommissionTier;
  directPercent: number;
  downlineOverridePercent?: number;
  leaderSlug: string;
  /** Lowercase initials — stable key for tracked links until slug-based codes ship. */
  attributionKey: string;
};

function isGrassrootsFundraisingLead(leader: VolunteerLeader): boolean {
  if (registry.grassrootsFundraisingLeadSlugs.includes(leader.slug)) return true;
  return Boolean(
    leader.grassrootsFundraisingLead ||
      leader.campusTeamCoChair ||
      leader.workbenchTemplates?.includes("fundraising_field_leader"),
  );
}

/** Resolve commission tier for a leader when attributing tracked grassroots gifts. */
export function resolveGrassrootsFundraisingCommission(
  leader: VolunteerLeader,
): GrassrootsFundraisingCommissionProfile {
  const attributionKey = leader.initials.trim().toLowerCase();

  if (isGrassrootsFundraisingLead(leader)) {
    return {
      tier: "grassroots_fundraising_lead",
      directPercent: registry.grassrootsFundraisingLeadDirectPercent,
      downlineOverridePercent: registry.grassrootsFundraisingLeadDownlineOverridePercent,
      leaderSlug: leader.slug,
      attributionKey,
    };
  }

  return {
    tier: "field_fundraiser",
    directPercent: registry.defaultFieldFundraiserDirectPercent,
    leaderSlug: leader.slug,
    attributionKey,
  };
}

/** Lookup by leader slug for downstream attribution (managed-by tree). */
export function resolveGrassrootsFundraisingCommissionBySlug(
  slug: string,
  leaders: VolunteerLeader[],
): GrassrootsFundraisingCommissionProfile | null {
  const leader = leaders.find((l) => l.slug === slug);
  if (!leader) return null;
  return resolveGrassrootsFundraisingCommission(leader);
}
