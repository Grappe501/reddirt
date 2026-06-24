import { cookies } from "next/headers";

import { prisma } from "@/lib/db";

import { VOLUNTEER_BOARD_ACTIVITY_OPTIONS, type VolunteerBoardActivityId } from "./constants";
import { VOLUNTEER_BOARD_SESSION_COOKIE } from "./constants";
import { getVolunteerBoardSecret, verifyVolunteerBoardSessionToken } from "./session";

export type VolunteerBoardSnapshot = {
  userId: string;
  volunteerProfileId: string;
  displayName: string;
  email: string;
  phone: string | null;
  zip: string | null;
  county: string | null;
  interests: VolunteerBoardActivityId[];
  availability: string | null;
  leadershipInterest: boolean;
  boardOnboardedAt: Date | null;
  needsOnboarding: boolean;
  placementLeaderName: string | null;
};

function normalizeActivityIds(values: string[]): VolunteerBoardActivityId[] {
  const allowed = new Set(VOLUNTEER_BOARD_ACTIVITY_OPTIONS.map((o) => o.id));
  return values.filter((v): v is VolunteerBoardActivityId => allowed.has(v as VolunteerBoardActivityId));
}

export async function tryLoadVolunteerBoardSession(): Promise<{ userId: string; volunteerProfileId: string } | null> {
  const secret = getVolunteerBoardSecret();
  if (!secret) return null;
  const token = (await cookies()).get(VOLUNTEER_BOARD_SESSION_COOKIE)?.value;
  const payload = verifyVolunteerBoardSessionToken(token, secret);
  if (!payload) return null;
  return { userId: payload.userId, volunteerProfileId: payload.volunteerProfileId };
}

export async function loadVolunteerBoardSnapshot(
  userId: string,
  volunteerProfileId: string,
): Promise<VolunteerBoardSnapshot | null> {
  const profile = await prisma.volunteerProfile.findFirst({
    where: { id: volunteerProfileId, userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          zip: true,
          county: true,
          interests: true,
        },
      },
    },
  });

  if (!profile) return null;

  const intake = await prisma.workflowIntake.findFirst({
    where: {
      submission: { userId: profile.userId },
      source: { contains: "volunteer", mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    select: { metadata: true },
  });

  let placementLeaderName: string | null = null;
  if (intake?.metadata && typeof intake.metadata === "object" && !Array.isArray(intake.metadata)) {
    const meta = intake.metadata as Record<string, unknown>;
    if (typeof meta.placementLeaderDisplayName === "string") {
      placementLeaderName = meta.placementLeaderDisplayName;
    }
  }

  const displayName = profile.user.name?.trim() || profile.user.email.split("@")[0] || "Volunteer";
  const interests = normalizeActivityIds(profile.user.interests ?? []);

  return {
    userId: profile.userId,
    volunteerProfileId: profile.id,
    displayName,
    email: profile.user.email,
    phone: profile.user.phone,
    zip: profile.user.zip,
    county: profile.user.county,
    interests,
    availability: profile.availability,
    leadershipInterest: profile.leadershipInterest,
    boardOnboardedAt: profile.boardOnboardedAt,
    needsOnboarding: !profile.boardOnboardedAt,
    placementLeaderName,
  };
}
