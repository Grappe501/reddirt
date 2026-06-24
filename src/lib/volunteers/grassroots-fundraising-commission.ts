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

export function getGrassrootsFundraisingCommissionConfig() {
  return {
    internalOnly: registry.internalOnly,
    defaultFieldFundraiserDirectPercent: registry.defaultFieldFundraiserDirectPercent,
    grassrootsFundraisingLeadDirectPercent: registry.grassrootsFundraisingLeadDirectPercent,
    grassrootsFundraisingLeadDownlineOverridePercent: registry.grassrootsFundraisingLeadDownlineOverridePercent,
    leadSlugs: registry.grassrootsFundraisingLeadSlugs,
  };
}

function normalizeAttributionToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Match GoodChange fundraiser column or tracked-link ref to a roster leader. */
export function matchGrassrootsFundraisingAttribution(
  raw: string,
  leaders: VolunteerLeader[],
): { leader: VolunteerLeader; profile: GrassrootsFundraisingCommissionProfile } | null {
  const token = normalizeAttributionToken(raw);
  if (!token) return null;

  for (const leader of leaders) {
    const profile = resolveGrassrootsFundraisingCommission(leader);
    const slugCompact = leader.slug.replace(/-/g, "");
    const initials = leader.initials.trim().toLowerCase();
    if (
      profile.attributionKey === token ||
      initials === token ||
      slugCompact === token ||
      leader.slug === token
    ) {
      return { leader, profile };
    }
  }

  return null;
}

export function listGrassrootsFundraisingCommissionLeaders(
  leaders: VolunteerLeader[],
): Array<{ leader: VolunteerLeader; profile: GrassrootsFundraisingCommissionProfile; isOpenSlot: boolean }> {
  return leaders
    .filter((leader) => isGrassrootsFundraisingLead(leader) || registry.grassrootsFundraisingLeadSlugs.includes(leader.slug))
    .map((leader) => ({
      leader,
      profile: resolveGrassrootsFundraisingCommission(leader),
      isOpenSlot: Boolean(leader.leaderRosterSignInHidden || leader.displayName.startsWith("Open —")),
    }))
    .sort((a, b) => {
      if (a.isOpenSlot !== b.isOpenSlot) return a.isOpenSlot ? 1 : -1;
      return a.leader.displayName.localeCompare(b.leader.displayName);
    });
}

export function computeDirectCommissionCents(netCents: number, directPercent: number): number {
  return Math.round((netCents * directPercent) / 100);
}

export function computeOverrideCommissionCents(netCents: number, overridePercent: number): number {
  return Math.round((netCents * overridePercent) / 100);
}
