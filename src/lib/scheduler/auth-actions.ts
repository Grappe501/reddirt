"use server";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SCHEDULER_SESSION_COOKIE,
  createSchedulerSessionToken,
  getSchedulerOperatorEmail,
  getSchedulerOperatorPassword,
  isSchedulerConfigured,
  schedulerSessionSecret,
} from "@/lib/scheduler/session";

function hashEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a, "utf8").digest();
  const bh = createHash("sha256").update(b, "utf8").digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

export async function schedulerLoginAction(formData: FormData) {
  if (!isSchedulerConfigured()) redirect("/scheduler/login?error=config");
  const expectedEmail = getSchedulerOperatorEmail()!;
  const expectedPassword = getSchedulerOperatorPassword()!;
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!hashEqual(email, expectedEmail) || !hashEqual(password, expectedPassword)) {
    redirect("/scheduler/login?error=auth");
  }
  const secret = schedulerSessionSecret()!;
  const token = createSchedulerSessionToken(secret, email);
  (await cookies()).set(SCHEDULER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();
  const safe =
    redirectTo.startsWith("/scheduler") && !redirectTo.startsWith("//") && !redirectTo.includes("\n")
      ? redirectTo
      : "/scheduler";
  redirect(safe);
}

export async function schedulerLogoutAction() {
  (await cookies()).delete(SCHEDULER_SESSION_COOKIE);
  redirect("/scheduler/login");
}
