/**
 * Invitation privacy (Team Dashboard Phase 2).
 *
 * Rule: If an invite is not accepted (or is declined/expired/canceled), only the inviter
 * and campaign administrators should see that row. Other teammates do not see it.
 *
 * Accepted invites are visible to the whole triad so everyone knows who joined.
 */
import { VOS_CAMPAIGN_ADMIN_MEMBER_ID } from "@/types/dashboard";
import type { TeamBuildInvitation, VolunteerOpsLifecycleStatus } from "@/types/dashboard";

export function computeInvitationVisibility(
  inv: Pick<TeamBuildInvitation, "status" | "invitedByMemberId">,
  teamMemberVolunteerIds: string[],
): string[] {
  if (inv.status === "accepted") {
    return Array.from(new Set([...teamMemberVolunteerIds, VOS_CAMPAIGN_ADMIN_MEMBER_ID]));
  }
  return [inv.invitedByMemberId, VOS_CAMPAIGN_ADMIN_MEMBER_ID];
}

export function viewerCanSeeInvitation(
  inv: TeamBuildInvitation,
  viewerMemberId: string | null,
  viewerIsCampaignAdmin: boolean,
): boolean {
  if (viewerIsCampaignAdmin) return true;
  if (!viewerMemberId) return false;
  return inv.visibleToMemberIds.includes(viewerMemberId);
}

export function filterInvitationsForViewer(
  invitations: TeamBuildInvitation[] | undefined,
  viewerMemberId: string | null,
  viewerIsCampaignAdmin: boolean,
): TeamBuildInvitation[] {
  if (!invitations?.length) return [];
  return invitations.filter((i) => viewerCanSeeInvitation(i, viewerMemberId, viewerIsCampaignAdmin));
}

/** Derive lifecycle from roster + downstream flag (mock / display helper). */
export function deriveTeamLifecycleStatus(input: {
  memberCount: number;
  hasCoreTriad: boolean;
  downstreamLaunched: number;
  forced?: VolunteerOpsLifecycleStatus;
}): VolunteerOpsLifecycleStatus {
  if (input.forced) return input.forced;
  if (input.hasCoreTriad && input.downstreamLaunched > 0) return "expanding";
  if (input.hasCoreTriad) return "active";
  if (input.memberCount <= 2) return "building";
  return "building";
}
