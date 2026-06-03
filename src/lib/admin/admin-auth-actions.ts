"use server";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken, getAdminSecret } from "@/lib/admin/session";

function hashEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a, "utf8").digest();
  const bh = createHash("sha256").update(b, "utf8").digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

function defaultAdminDestination(): string {
  return process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE === "opposition_debate"
    ? "/admin/intelligence"
    : "/admin/content";
}

/** Minimal login/logout — do not import from `@/app/admin/actions` (pulls Prisma + full CMS graph). */
export async function adminLoginAction(formData: FormData) {
  const secret = getAdminSecret();
  if (!secret) redirect("/admin/login?error=config");
  const password = String(formData.get("password") ?? "");
  if (!hashEqual(password, secret)) redirect("/admin/login?error=auth");

  const token = createAdminSessionToken(secret);
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();
  const safe =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//") && !redirectTo.includes("\n")
      ? redirectTo
      : defaultAdminDestination();
  redirect(safe);
}

export async function adminLogoutAction() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
