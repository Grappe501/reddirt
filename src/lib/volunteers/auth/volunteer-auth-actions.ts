"use server";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ensureVolunteerLeaderOperator } from "@/lib/volunteers/ensure-leader-operator";
import { setOperatorCookieForLeader } from "@/lib/volunteers/field-entry-access";
import { getVolunteerLeaderByInitials } from "@/lib/volunteers/leader-roster";
import {
  VOLUNTEER_SESSION_COOKIE,
  createVolunteerSessionToken,
  getVolunteerHubPassword,
} from "@/lib/volunteers/auth/session";

function hashEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a, "utf8").digest();
  const bh = createHash("sha256").update(b, "utf8").digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

export async function volunteerHubLoginAction(formData: FormData) {
  const secret = getVolunteerHubPassword();
  if (!secret) redirect("/election-plan/operators/leaders/sign-in?error=config");

  const initials = String(formData.get("initials") ?? "")
    .trim()
    .toUpperCase();
  const password = String(formData.get("password") ?? "");

  if (!/^[A-Z]{3}$/.test(initials)) redirect("/election-plan/operators/leaders/sign-in?error=initials");
  if (!hashEqual(password, secret)) redirect("/election-plan/operators/leaders/sign-in?error=auth");

  const leader = getVolunteerLeaderByInitials(initials);
  if (!leader || leader.leaderRosterSignInHidden) redirect("/election-plan/operators/leaders/sign-in?error=unknown");

  await ensureVolunteerLeaderOperator(leader);
  await setOperatorCookieForLeader(leader.initials);

  const token = createVolunteerSessionToken(secret, leader.slug, leader.initials);
  (await cookies()).set(VOLUNTEER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const redirectTo = String(formData.get("redirectTo") ?? "").trim();
  const safe =
    (redirectTo.startsWith("/election-plan/operators/leaders") ||
      redirectTo.startsWith("/volunteers")) &&
    !redirectTo.startsWith("//") &&
    !redirectTo.includes("\n") &&
    !redirectTo.includes("/sign-in") &&
    !redirectTo.startsWith("/volunteers/login")
      ? redirectTo.startsWith("/volunteers")
        ? redirectTo.replace(/^\/volunteers(\/me)?\/?$/, "/election-plan/operators/leaders/me")
        : redirectTo
      : "/election-plan/operators/leaders/me";
  redirect(safe);
}

export async function volunteerHubLogoutAction() {
  (await cookies()).delete(VOLUNTEER_SESSION_COOKIE);
  redirect("/election-plan/operators/leaders/sign-in");
}
