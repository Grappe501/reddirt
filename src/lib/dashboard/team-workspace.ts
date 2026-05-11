import "server-only";

/**
 * Team workspace resolution (mock + Prisma-backed volunteer ops teams).
 *
 * Future access / email confirmation model (no production magic link in this pass unless auth lands elsewhere):
 * 1. Volunteer signs up on the public intake path.
 * 2. System creates or assigns a `VolunteerOpsTeam` row and stable dashboard slug.
 * 3. Confirmation email delivers a time-limited link tied to that team.
 * 4. Link establishes session (`vos_team_access` cookie or OAuth) scoped to the slug.
 * 5. Volunteer lands on `/dashboard/team/[teamSlug]`.
 * 6. Existing members privately invite coordinators; acceptance joins the same triad dashboard.
 *
 * See: `docs/volunteer-platform-overview.md`.
 */

import { VOLUNTEER_OS_DEMO_TEAM_SLUG } from "@/lib/team-naming";
import {
  MOCK_DOWNSTREAM_TREE,
  getMockTeamBySlug,
  PROTOTYPE_TEAM_SLUG,
} from "@/lib/dashboard/mock-data";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import {
  buildDbDownstreamRoot,
  loadSignupSuggestions,
  mapPrismaVolunteerOpsTeamToDashboard,
} from "@/lib/volunteer-ops/map-prisma-ops-team";
import { rollupPowerOfFiveForUserIds } from "@/lib/volunteer-ops/power-of-five-rollups";
import { buildTeamFieldOperatingSystem } from "@/lib/dashboard/field-operating-system";
import { attachYouthOutreachToTeam } from "@/lib/volunteer-ops/youth-outreach-workspace";
import type { DownstreamTeamNode, Team } from "@/types/dashboard";

function withFieldOperatingSystem(team: Team): Team {
  return { ...team, fieldOperatingSystem: buildTeamFieldOperatingSystem(team) };
}

function enrichTeam(team: Team): Team {
  return withFieldOperatingSystem(attachYouthOutreachToTeam(team));
}

function downstreamRootFromMockTeam(team: Team): DownstreamTeamNode {
  const forming = team.members.length < 3;
  return {
    teamId: team.id,
    slug: team.slug,
    displayName: team.displayName,
    level: team.level,
    geography: team.geography,
    status: forming ? "forming" : "active",
    leadNames: team.members.map((m) => m.name.split(/\s+/)[0] ?? m.name),
    activitySummary: "Demo workspace",
    children: [],
  };
}

export type TeamWorkspaceBundle = {
  team: Team;
  downstreamRoot: DownstreamTeamNode;
  signupSuggestions?: { id: string; displayLabel: string }[];
};

export async function getTeamWorkspaceBundle(
  teamSlug: string,
  viewerUserId: string | null,
): Promise<TeamWorkspaceBundle | null> {
  if (isDatabaseConfigured()) {
    try {
      const dbRow = await prisma.volunteerOpsTeam.findUnique({
        where: { slug: teamSlug },
        include: {
          members: { include: { user: { select: { name: true, email: true } } } },
          invitations: { orderBy: { createdAt: "desc" } },
          upstreamContact: { select: { id: true, name: true, email: true } },
        },
      });
      if (dbRow) {
        const rollup = await rollupPowerOfFiveForUserIds(dbRow.members.map((m) => m.userId));
        const team = enrichTeam(mapPrismaVolunteerOpsTeamToDashboard(dbRow, rollup, viewerUserId));
        const signupSuggestions = await loadSignupSuggestions(dbRow.members.map((m) => m.userId));
        return { team, downstreamRoot: buildDbDownstreamRoot(team), signupSuggestions };
      }
    } catch (e) {
      console.error("getTeamWorkspaceBundle: database resolution failed", e);
    }
  }

  const mockTeam = getMockTeamBySlug(teamSlug);
  if (!mockTeam) return null;

  const useFullTree = teamSlug === VOLUNTEER_OS_DEMO_TEAM_SLUG || teamSlug === PROTOTYPE_TEAM_SLUG;
  const downstreamRoot = useFullTree ? MOCK_DOWNSTREAM_TREE : downstreamRootFromMockTeam(mockTeam);

  return { team: enrichTeam(mockTeam), downstreamRoot };
}
