"use server";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { EmailOptInStatus, SmsOptInStatus } from "@prisma/client";

import { VOLUNTEER_BOARD_ACTIVITY_OPTIONS, VOLUNTEER_BOARD_SESSION_COOKIE } from "./constants";
import { createVolunteerBoardSessionToken, getVolunteerBoardSecret } from "./session";

function hashEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a, "utf8").digest();
  const bh = createHash("sha256").update(b, "utf8").digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

async function setBoardSession(userId: string, volunteerProfileId: string) {
  const secret = getVolunteerBoardSecret();
  if (!secret) redirect("/volunteers/sign-in?error=config");

  const token = createVolunteerBoardSessionToken(secret, userId, volunteerProfileId);
  (await cookies()).set(VOLUNTEER_BOARD_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function volunteerBoardSignInAction(formData: FormData) {
  const secret = getVolunteerBoardSecret();
  if (!secret) redirect("/volunteers/sign-in?error=config");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email.includes("@")) redirect("/volunteers/sign-in?error=email");
  if (!hashEqual(password, secret)) redirect("/volunteers/sign-in?error=auth");

  const user = await prisma.user.findUnique({
    where: { email },
    include: { volunteerProfile: true },
  });

  if (!user?.volunteerProfile) {
    redirect("/volunteers/sign-in?error=unknown");
  }

  await setBoardSession(user.id, user.volunteerProfile.id);
  redirect("/volunteers/me");
}

export async function volunteerBoardAcceptInviteAction(formData: FormData) {
  const secret = getVolunteerBoardSecret();
  if (!secret) redirect("/volunteers/sign-in?error=config");

  const token = String(formData.get("token") ?? "").trim();
  if (!token) redirect("/volunteers/sign-in?error=invite");

  const { verifyVolunteerBoardSessionToken } = await import("./session");
  const payload = verifyVolunteerBoardSessionToken(token, secret);
  if (!payload) redirect("/volunteers/sign-in?error=invite");

  const profile = await prisma.volunteerProfile.findFirst({
    where: { id: payload.volunteerProfileId, userId: payload.userId },
    select: { id: true, userId: true },
  });
  if (!profile) redirect("/volunteers/sign-in?error=unknown");

  await setBoardSession(profile.userId, profile.id);
  redirect("/volunteers/me");
}

export async function volunteerBoardLogoutAction() {
  (await cookies()).delete(VOLUNTEER_BOARD_SESSION_COOKIE);
  redirect("/volunteers/sign-in");
}

export async function completeVolunteerBoardOnboardingAction(formData: FormData) {
  const secret = getVolunteerBoardSecret();
  if (!secret) redirect("/volunteers/sign-in?error=config");

  const sessionToken = (await cookies()).get(VOLUNTEER_BOARD_SESSION_COOKIE)?.value;
  const { verifyVolunteerBoardSessionToken } = await import("./session");
  const session = verifyVolunteerBoardSessionToken(sessionToken, secret);
  if (!session) redirect("/volunteers/sign-in?error=session");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  const county = String(formData.get("county") ?? "").trim();
  const availability = String(formData.get("availability") ?? "").trim();
  const leadershipInterest = formData.get("leadershipInterest") === "on";
  const emailOptIn = formData.get("emailOptIn") === "on";
  const smsOptIn = formData.get("smsOptIn") === "on";

  const activityIds = VOLUNTEER_BOARD_ACTIVITY_OPTIONS.map((o) => o.id).filter(
    (id) => formData.get(`activity_${id}`) === "on",
  );

  if (!email.includes("@")) redirect("/volunteers/me?onboarding=1&error=email");
  if (activityIds.length === 0) redirect("/volunteers/me?onboarding=1&error=activities");

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      email,
      phone: phone || null,
      zip: zip || null,
      county: county || null,
      interests: activityIds,
    },
  });

  await prisma.volunteerProfile.update({
    where: { id: session.volunteerProfileId },
    data: {
      availability: availability || null,
      leadershipInterest,
      boardOnboardedAt: new Date(),
    },
  });

  await prisma.contactPreference.upsert({
    where: { volunteerProfileId: session.volunteerProfileId },
    create: {
      volunteerProfileId: session.volunteerProfileId,
      emailOptInStatus: emailOptIn ? EmailOptInStatus.OPT_IN : EmailOptInStatus.UNKNOWN,
      smsOptInStatus: smsOptIn ? SmsOptInStatus.OPT_IN : SmsOptInStatus.UNKNOWN,
      source: "volunteer_board_onboarding",
    },
    update: {
      emailOptInStatus: emailOptIn ? EmailOptInStatus.OPT_IN : EmailOptInStatus.UNKNOWN,
      smsOptInStatus: smsOptIn ? SmsOptInStatus.OPT_IN : SmsOptInStatus.UNKNOWN,
      source: "volunteer_board_onboarding",
    },
  });

  redirect("/volunteers/me");
}
