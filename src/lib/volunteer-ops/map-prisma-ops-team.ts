import "server-only";

import type {
  VolunteerOpsTeam,
  VolunteerOpsTeamInvitation,
  VolunteerOpsTeamMemberRole,
  VolunteerOpsTeamInviteStatus,
  VolunteerOpsTeamStatus,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import { rollupPowerOfFiveForUserIds } from "@/lib/volunteer-ops/power-of-five-rollups";
import {
  computeInvitationVisibility,
  filterInvitationsForViewer,
} from "@/lib/dashboard/invitation-privacy";
import type {
  DownstreamTeamNode,
  Kpi,
  Team,
  TeamBuildInvitation,
  TeamBuildInviteStatus,
  TeamInviteCoreRole,
  TeamLevel,
  TeamMember,
  TeamMonthlyProgram,
  VolunteerOpsLifecycleStatus,
  VolunteerRole,
} from "@/types/dashboard";

function hasCoreTriadRoles(roles: VolunteerOpsTeamMemberRole[]): boolean {
  const s = new Set(roles);
  return s.has("EVENTS") && s.has("SOCIAL_MEDIA") && s.has("POWER_OF_FIVE");
}

type TeamWithRelations = VolunteerOpsTeam & {
  members: { userId: string; role: VolunteerOpsTeamMemberRole; user: { name: string | null; email: string } }[];
  invitations: VolunteerOpsTeamInvitation[];
  upstreamContact: { id: string; name: string | null; email: string } | null;
};

function lifecycleMap(s: VolunteerOpsTeamStatus): VolunteerOpsLifecycleStatus {
  const m: Record<VolunteerOpsTeamStatus, VolunteerOpsLifecycleStatus> = {
    BUILDING: "building",
    ACTIVE: "active",
    EXPANDING: "expanding",
    DORMANT: "dormant",
    ARCHIVED: "archived",
  };
  return m[s];
}

function toVolunteerRole(r: VolunteerOpsTeamMemberRole): VolunteerRole {
  switch (r) {
    case "EVENTS":
      return "events";
    case "SOCIAL_MEDIA":
      return "social-media";
    case "POWER_OF_FIVE":
      return "power-of-5";
    case "GENERAL":
    default:
      return "general";
  }
}

function inviteStatusMap(s: VolunteerOpsTeamInviteStatus): TeamBuildInviteStatus {
  const m: Record<VolunteerOpsTeamInviteStatus, TeamBuildInviteStatus> = {
    PENDING: "sent",
    ACCEPTED: "accepted",
    DECLINED: "declined",
    IGNORED: "canceled",
    EXPIRED: "expired",
  };
  return m[s];
}

function toInviteCoreRole(r: VolunteerOpsTeamMemberRole): TeamInviteCoreRole {
  const v = toVolunteerRole(r);
  if (v === "events" || v === "social-media" || v === "power-of-5") return v;
  return "events";
}

export function mapPrismaVolunteerOpsTeamToDashboard(
  row: TeamWithRelations,
  rollup: Awaited<ReturnType<typeof rollupPowerOfFiveForUserIds>>,
  viewerUserId: string | null,
): Team {
  const adminMemberIds = row.adminUserIds.length ? row.adminUserIds : [row.createdByUserId];
  const upstream = row.upstreamContact;

  const members: TeamMember[] = row.members.map((m) => ({
    volunteerId: m.userId,
    name: m.user.name?.trim() || "Volunteer",
    role: toVolunteerRole(m.role),
    emailStatus: "confirmed",
    lastActivity: undefined,
  }));

  const memberIds = row.members.map((m) => m.userId);
  const invitationsRaw: TeamBuildInvitation[] = row.invitations.map((inv) => {
    const status = inviteStatusMap(inv.status);
    const invitedByMemberId = inv.invitedByUserId;
    const base: Pick<TeamBuildInvitation, "status" | "invitedByMemberId"> = { status, invitedByMemberId };
    return {
      id: inv.id,
      teamId: row.id,
      email: inv.emailNormalized,
      intendedRole: toInviteCoreRole(inv.role),
      invitedByMemberId,
      status,
      createdAt: inv.createdAt.toISOString().slice(0, 10),
      respondedAt: inv.respondedAt ? inv.respondedAt.toISOString().slice(0, 10) : undefined,
      visibleToMemberIds: computeInvitationVisibility(base, memberIds),
    };
  });

  const viewerIsCampaignAdmin = viewerUserId != null && adminMemberIds.includes(viewerUserId);
  const invitations = filterInvitationsForViewer(invitationsRaw, viewerUserId, viewerIsCampaignAdmin);

  const meta = row.metadataJson as
    | {
        monthlyPrograms?: TeamMonthlyProgram[];
        monthlyOutreachEventsHeld?: number;
        downstreamTeamsLaunched?: number;
        monthlySocialHourPlanned?: boolean;
        monthlyVrEventPlanned?: boolean;
      }
    | null
    | undefined;

  const triadFilled = hasCoreTriadRoles(row.members.map((m) => m.role));
  const downstreamLaunched = meta?.downstreamTeamsLaunched ?? 0;
  const monthlyPrograms: TeamMonthlyProgram[] =
    meta?.monthlyPrograms ??
    [
      {
        id: "vos-p5-community-social-hour",
        title: "Community Outreach Social Hour",
        cadence: "monthly",
        kind: "power_of_5_gathering",
      },
      {
        id: "vos-vr-monthly-drive",
        title: "Monthly Voter Registration Event",
        cadence: "monthly",
        kind: "voter_registration",
      },
    ];

  const p5: Team["powerOfFiveSummary"] = {
    contactsTracked: rollup.contactsTracked,
    touchesCompleted: rollup.touchesCompleted,
    registrationsCompleted: rollup.registrationsCompleted,
    volunteersReferred: rollup.volunteersReferred,
  };

  const regTarget = 10;
  const memberCount = row.members.length;

  const kpis: Kpi[] = [
    {
      id: "k-t-2",
      label: "Weekly completion %",
      value: Math.min(95, triadFilled ? 52 + memberCount * 6 : 18 + memberCount * 10),
      target: 80,
      period: "weekly",
    },
    {
      id: "k-t-3",
      label: "Downstream teams launched",
      value: downstreamLaunched,
      target: 5,
      period: "monthly",
    },
    {
      id: "k-t-p5-contacts",
      label: "Active Power of 5 contacts",
      value: p5.contactsTracked,
      target: Math.max(5 * memberCount, 5),
      period: "rolling",
    },
    {
      id: "k-t-p5-regs",
      label: "Voter registrations (tracked)",
      value: p5.registrationsCompleted,
      target: Math.max(regTarget * memberCount, regTarget),
      period: "monthly",
    },
    {
      id: "k-t-p5-touches",
      label: "Relational touches logged",
      value: p5.touchesCompleted,
      period: "weekly",
    },
    {
      id: "k-t-p5-referrals",
      label: "Volunteers referred · /volunteer",
      value: p5.volunteersReferred,
      period: "monthly",
    },
    {
      id: "k-t-members",
      label: "Active team members",
      value: memberCount,
      target: 3,
      period: "weekly",
    },
    ...(meta?.monthlyOutreachEventsHeld != null
      ? [
          {
            id: "k-t-monthly-outreach",
            label: "Monthly outreach events held",
            value: meta.monthlyOutreachEventsHeld,
            target: 2,
            period: "monthly" as const,
          },
        ]
      : []),
  ];

  const upcomingEvents: Team["upcomingEvents"] = monthlyPrograms.map((p) => ({
    id: p.id,
    title: p.title,
    date: "Schedule via Events",
    location: p.planningNote,
  }));

  return {
    id: row.id,
    teamCode: row.teamCode ?? "—",
    displayName: row.displayName,
    slug: row.slug,
    accessEmails: row.members.map((m) => m.user.email).filter(Boolean),
    geography: row.geographyLabel ?? "Oklahoma",
    level: (row.level as TeamLevel) ?? "county",
    upstreamContactId: upstream?.id ?? row.upstreamContactUserId ?? row.createdByUserId,
    upstreamContactName: upstream?.name?.trim() || "Temporary upstream (you)",
    upstreamContactEmail: upstream?.email,
    members,
    downstreamTeamIds: [],
    kpis,
    weeklyBriefing: row.weeklyBriefing ?? "",
    upcomingEvents,
    eventPipeline: [],
    visitPlans: [],
    lifecycleStatus: lifecycleMap(row.status),
    isDatabaseBacked: true,
    adminMemberIds,
    powerOfFiveTeamTargets: {
      minCoreContacts: 15,
      minRegistrations: 30,
      monthlySocialHourPlanned: Boolean(meta?.monthlySocialHourPlanned),
      monthlyVrEventPlanned: Boolean(meta?.monthlyVrEventPlanned),
    },
    powerOfFiveSummary: p5,
    invitations,
    monthlyPrograms,
    teamInviteUrl: `https://www.example.invalid/volunteer/team-invite?team=${encodeURIComponent(row.slug)}`,
    teamQrCodeUrl: `https://www.example.invalid/static/qr/${encodeURIComponent(row.slug)}.png`,
  };
}

export async function loadSignupSuggestions(excludeUserIds: string[]): Promise<{ id: string; displayLabel: string }[]> {
  const rows = await prisma.user.findMany({
    where: {
      volunteerProfile: { isNot: null },
      id: { notIn: excludeUserIds },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, county: true },
  });
  return rows.map((r) => ({
    id: r.id,
    displayLabel: [r.name?.trim() || "Volunteer", r.county ? `· ${r.county}` : ""].filter(Boolean).join(" "),
  }));
}

export function buildDbDownstreamRoot(team: Team): DownstreamTeamNode {
  const forming = team.lifecycleStatus === "building";
  return {
    teamId: team.id,
    slug: team.slug,
    displayName: team.displayName,
    level: team.level,
    geography: team.geography,
    status: forming ? "forming" : "active",
    leadNames: team.members.map((m) => m.name.split(/\s+/)[0] ?? m.name),
    activitySummary: team.lifecycleStatus === "building" ? "Team building — invite coordinators" : "Field triad workspace",
    children: [],
  };
}
