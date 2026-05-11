import type { Prisma, VolunteerOpsTeamMemberRole, VolunteerOpsTeamStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

type Meta = {
  downstreamTeamsLaunched?: number;
} | null;

function hasCoreTriad(roles: VolunteerOpsTeamMemberRole[]): boolean {
  const s = new Set(roles);
  return s.has("EVENTS") && s.has("SOCIAL_MEDIA") && s.has("POWER_OF_FIVE");
}

export async function recomputeVolunteerOpsTeamStatus(teamId: string): Promise<VolunteerOpsTeamStatus> {
  const team = await prisma.volunteerOpsTeam.findUnique({
    where: { id: teamId },
    select: { id: true, status: true, metadataJson: true, members: { select: { role: true } } },
  });
  if (!team) return "BUILDING";

  if (team.status === "ARCHIVED" || team.status === "DORMANT") {
    return team.status;
  }

  const meta = team.metadataJson as Meta;
  const roles = team.members.map((m) => m.role);
  const triad = hasCoreTriad(roles);

  let next: VolunteerOpsTeamStatus = "BUILDING";
  if (triad) {
    next = "ACTIVE";
    const launched = meta?.downstreamTeamsLaunched ?? 0;
    if (launched >= 1) next = "EXPANDING";
  }

  if (next !== team.status) {
    await prisma.volunteerOpsTeam.update({
      where: { id: teamId },
      data: { status: next },
    });
  }

  return next;
}

export async function patchVolunteerOpsTeamMetadata(
  teamId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const row = await prisma.volunteerOpsTeam.findUnique({
    where: { id: teamId },
    select: { metadataJson: true },
  });
  const base =
    row?.metadataJson && typeof row.metadataJson === "object" && !Array.isArray(row.metadataJson)
      ? (row.metadataJson as Record<string, unknown>)
      : {};
  const next: Prisma.InputJsonValue = { ...base, ...patch } as Prisma.InputJsonValue;
  await prisma.volunteerOpsTeam.update({
    where: { id: teamId },
    data: { metadataJson: next },
  });
}
