"use server";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ELECTION_PLAN_SESSION_COOKIE,
  createElectionPlanSessionToken,
  getElectionPlanPassword,
} from "@/lib/election-plan/auth/session";

function hashEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a, "utf8").digest();
  const bh = createHash("sha256").update(b, "utf8").digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

export async function electionPlanLoginAction(formData: FormData) {
  const secret = getElectionPlanPassword();
  if (!secret) redirect("/election-plan/login?error=config");
  const password = String(formData.get("password") ?? "");
  if (!hashEqual(password, secret)) redirect("/election-plan/login?error=auth");

  const token = createElectionPlanSessionToken(secret);
  (await cookies()).set(ELECTION_PLAN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const redirectTo = String(formData.get("redirectTo") ?? "").trim();
  const safe =
    redirectTo.startsWith("/election-plan") &&
    !redirectTo.startsWith("//") &&
    !redirectTo.includes("\n") &&
    !redirectTo.startsWith("/election-plan/login")
      ? redirectTo
      : "/election-plan";
  redirect(safe);
}

export async function electionPlanLogoutAction() {
  (await cookies()).delete(ELECTION_PLAN_SESSION_COOKIE);
  redirect("/election-plan/login");
}
