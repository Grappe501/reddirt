import "server-only";

import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { VolunteerOpsTeamMemberRole } from "@prisma/client";

import { prisma } from "@/lib/db";
import { recomputeVolunteerOpsTeamStatus } from "@/lib/volunteer-ops/recompute-team-status";

export function hashInviteToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export function newInviteRawToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createVolunteerOpsInvitation(input: {
  teamId: string;
  email: string;
  role: VolunteerOpsTeamMemberRole;
  invitedByUserId: string;
}): Promise<{ rawToken: string; id: string }> {
  const emailNormalized = input.email.toLowerCase().trim();
  const rawToken = newInviteRawToken();
  const tokenHash = hashInviteToken(rawToken);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const inv = await prisma.volunteerOpsTeamInvitation.create({
    data: {
      teamId: input.teamId,
      emailNormalized,
      role: input.role,
      invitedByUserId: input.invitedByUserId,
      tokenHash,
      expiresAt,
    },
  });
  return { rawToken, id: inv.id };
}

export async function respondVolunteerOpsInvitation(
  rawToken: string,
  decision: "accept" | "decline" | "ignore",
): Promise<{ ok: boolean; teamSlug?: string; message?: string; acceptedUserId?: string }> {
  const tokenHash = hashInviteToken(rawToken.trim());
  const inv = await prisma.volunteerOpsTeamInvitation.findUnique({
    where: { tokenHash },
    include: { team: { select: { slug: true } } },
  });
  if (!inv || inv.status !== "PENDING") return { ok: false, message: "invalid_or_used" };
  if (inv.expiresAt && inv.expiresAt < new Date()) {
    await prisma.volunteerOpsTeamInvitation.update({
      where: { id: inv.id },
      data: { status: "EXPIRED", respondedAt: new Date() },
    });
    return { ok: false, message: "expired" };
  }

  if (decision === "decline") {
    await prisma.volunteerOpsTeamInvitation.update({
      where: { id: inv.id },
      data: { status: "DECLINED", respondedAt: new Date() },
    });
    return { ok: true, teamSlug: inv.team.slug };
  }
  if (decision === "ignore") {
    await prisma.volunteerOpsTeamInvitation.update({
      where: { id: inv.id },
      data: { status: "IGNORED", respondedAt: new Date() },
    });
    return { ok: true, teamSlug: inv.team.slug };
  }

  const user = await prisma.user.upsert({
    where: { email: inv.emailNormalized },
    create: {
      email: inv.emailNormalized,
      name: inv.emailNormalized.split("@")[0]?.slice(0, 80) ?? "Volunteer",
      interests: ["volunteer"],
    },
    update: {},
  });

  await prisma.volunteerProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  await prisma.volunteerOpsTeamMember.upsert({
    where: { teamId_userId: { teamId: inv.teamId, userId: user.id } },
    create: {
      teamId: inv.teamId,
      userId: user.id,
      role: inv.role,
      isTemporaryUpstream: false,
    },
    update: { role: inv.role },
  });

  await prisma.volunteerOpsTeamInvitation.update({
    where: { id: inv.id },
    data: { status: "ACCEPTED", respondedAt: new Date() },
  });

  await recomputeVolunteerOpsTeamStatus(inv.teamId);

  return { ok: true, teamSlug: inv.team.slug, acceptedUserId: user.id };
}
