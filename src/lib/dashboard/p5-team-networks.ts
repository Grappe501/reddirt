import type { Team, TeamMember, TeamPowerOfFiveMemberNetwork, TeamReachContact } from "@/types/dashboard";

export const P5_CONTACTS_TARGET_PER_MEMBER = 5;
export const P5_REGISTRATIONS_TARGET_PER_MEMBER = 10;

function registrationsFromContacts(contacts: TeamReachContact[]): number {
  return contacts.filter(
    (c) => c.registrationStatus === "registered" || c.registrationStatus === "helped-register",
  ).length;
}

function volunteerRefsFromContacts(contacts: TeamReachContact[]): number {
  return contacts.filter(
    (c) => c.volunteerInterest === "interested" || c.volunteerInterest === "referred-to-volunteer",
  ).length;
}

/** Stable triad column order: Events → Social → Power of 5 / VR → others. */
function roleSortKey(m: TeamMember): number {
  const o: Partial<Record<TeamMember["role"], number>> = {
    events: 0,
    "social-media": 1,
    "power-of-5": 2,
    general: 8,
    "not-sure": 9,
  };
  return o[m.role] ?? 9;
}

/**
 * Build per-member Power of 5 networks for the Team Dashboard.
 * Uses `powerOfFiveMemberNetworks` when present; otherwise derives from `reachContacts`,
 * `members`, and optional `powerOfFiveSummary` for touch/reg/referral weighting.
 */
export function buildTeamPowerOfFiveMemberNetworks(team: Team): TeamPowerOfFiveMemberNetwork[] {
  if (team.powerOfFiveMemberNetworks?.length) {
    return team.powerOfFiveMemberNetworks;
  }

  const reach = team.reachContacts ?? [];
  const summary = team.powerOfFiveSummary;
  const byOwner = new Map<string, TeamReachContact[]>();
  for (const c of reach) {
    const list = byOwner.get(c.ownerMemberId) ?? [];
    list.push(c);
    byOwner.set(c.ownerMemberId, list);
  }

  const totalReach = Math.max(reach.length, 1);
  const members = [...team.members].sort((a, b) => roleSortKey(a) - roleSortKey(b) || a.name.localeCompare(b.name));

  return members.map((m) => {
    const contacts = byOwner.get(m.volunteerId) ?? [];
    const share = contacts.length / totalReach;
    const regsFromRows = registrationsFromContacts(contacts);
    const refsFromRows = volunteerRefsFromContacts(contacts);

    const touchesFromSummary =
      summary != null ? Math.max(0, Math.round(summary.touchesCompleted * share)) : 0;
    const touches = Math.max(contacts.length, touchesFromSummary, summary == null ? contacts.length * 2 : 0);

    let registrationsCompleted = regsFromRows;
    let volunteerReferrals = refsFromRows;
    if (summary) {
      registrationsCompleted = Math.max(regsFromRows, Math.round(summary.registrationsCompleted * share));
      volunteerReferrals = Math.max(refsFromRows, Math.round(summary.volunteersReferred * share));
    }

    return {
      memberId: m.volunteerId,
      memberName: m.name,
      role: m.role,
      contacts,
      touchesCompleted: touches,
      registrationsCompleted,
      volunteerReferrals,
      contactsTarget: P5_CONTACTS_TARGET_PER_MEMBER,
      registrationsTarget: P5_REGISTRATIONS_TARGET_PER_MEMBER,
    };
  });
}

export type TeamP5Rollup = {
  totalContacts: number;
  totalTouches: number;
  totalRegs: number;
  totalVolunteerRefs: number;
  membersWithCompleteP5Lists: number;
  memberCount: number;
  teamContactGoal: number;
  teamRegistrationGoal: number;
  contactProgressPercent: number;
  registrationProgressPercent: number;
};

export function computeTeamP5Rollup(
  networks: TeamPowerOfFiveMemberNetwork[],
  teamContactGoal: number,
  teamRegistrationGoal: number,
): TeamP5Rollup {
  const totalContacts = networks.reduce((s, n) => s + n.contacts.length, 0);
  const totalTouches = networks.reduce((s, n) => s + n.touchesCompleted, 0);
  const totalRegs = networks.reduce((s, n) => s + n.registrationsCompleted, 0);
  const totalVolunteerRefs = networks.reduce((s, n) => s + n.volunteerReferrals, 0);
  const membersWithCompleteP5Lists = networks.filter((n) => n.contacts.length >= n.contactsTarget).length;

  return {
    totalContacts,
    totalTouches,
    totalRegs,
    totalVolunteerRefs,
    membersWithCompleteP5Lists,
    memberCount: networks.length,
    teamContactGoal,
    teamRegistrationGoal,
    contactProgressPercent: Math.min(100, Math.round((totalContacts / Math.max(teamContactGoal, 1)) * 100)),
    registrationProgressPercent: Math.min(100, Math.round((totalRegs / Math.max(teamRegistrationGoal, 1)) * 100)),
  };
}
