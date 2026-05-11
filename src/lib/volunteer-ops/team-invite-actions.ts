"use server";

import type { VolunteerOpsTeamMemberRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { createVolunteerOpsInvitation, respondVolunteerOpsInvitation } from "@/lib/volunteer-ops/invitations";
import { teamAccessForSlug, setVolunteerOpsTeamSessionCookie } from "@/lib/volunteer-ops/team-access-cookie";

function parseRole(raw: string): VolunteerOpsTeamMemberRole | null {
  switch (raw) {
    case "events":
      return "EVENTS";
    case "social-media":
      return "SOCIAL_MEDIA";
    case "power-of-5":
      return "POWER_OF_FIVE";
    case "general":
      return "GENERAL";
    default:
      return null;
  }
}

export type InviteActionState =
  | { ok: true; acceptPath: string }
  | { ok: false; error: string };

export async function sendVolunteerOpsTeamInviteAction(
  _prev: InviteActionState | undefined,
  formData: FormData,
): Promise<InviteActionState> {
  const teamSlug = String(formData.get("teamSlug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleRaw = String(formData.get("role") ?? "").trim();
  if (!teamSlug || !email || !roleRaw) {
    return { ok: false, error: "Add an email and pick a lane." };
  }
  const role = parseRole(roleRaw);
  if (!role) {
    return { ok: false, error: "Pick a valid role." };
  }

  const jar = await cookies();
  const access = teamAccessForSlug(jar.get("vos_team_access")?.value, teamSlug);
  if (!access) {
    return {
      ok: false,
      error: "Use the browser where you completed volunteer signup, or ask for a new access link.",
    };
  }

  const team = await prisma.volunteerOpsTeam.findUnique({
    where: { slug: teamSlug },
    select: { id: true, adminUserIds: true, createdByUserId: true },
  });
  if (!team) {
    return { ok: false, error: "Team not found." };
  }
  const admins = team.adminUserIds.length > 0 ? team.adminUserIds : [team.createdByUserId];
  if (!admins.includes(access.userId)) {
    return { ok: false, error: "Only team administrators can send invites." };
  }

  const { rawToken } = await createVolunteerOpsInvitation({
    teamId: team.id,
    email,
    role,
    invitedByUserId: access.userId,
  });

  const acceptPath = `/volunteer/team-invite/accept?token=${encodeURIComponent(rawToken)}`;

  revalidatePath(`/dashboard/team/${teamSlug}`);
  return { ok: true, acceptPath };
}

export async function submitVolunteerOpsInviteDecisionAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  if (!token) {
    redirect("/volunteer?invite=missing");
  }
  const mapped =
    decision === "accept" ? "accept" : decision === "decline" ? "decline" : decision === "ignore" ? "ignore" : null;
  if (!mapped) {
    redirect("/volunteer?invite=invalid");
  }
  const r = await respondVolunteerOpsInvitation(token, mapped);
  if (!r.ok) {
    redirect("/volunteer?invite=invalid");
  }
  if (mapped === "accept" && r.teamSlug && r.acceptedUserId) {
    await setVolunteerOpsTeamSessionCookie({ userId: r.acceptedUserId, teamSlug: r.teamSlug });
    redirect(`/dashboard/team/${r.teamSlug}`);
  }
  redirect("/volunteer?invite=closed");
}
