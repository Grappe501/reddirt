"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createRelationalUserSessionToken,
  getRelationalUserIdFromCookies,
  RELATIONAL_USER_COOKIE,
} from "@/lib/campaign/relational-user-session";
import { getAdminSecret } from "@/lib/admin/session";
import { prisma } from "@/lib/db";

function getRelationalSessionSecret() {
  return process.env.RELATIONAL_USER_SESSION_SECRET?.trim() || getAdminSecret();
}

export async function signInRelationalUserAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    redirect("/relational/login?error=email");
  }
  const secret = getRelationalSessionSecret();
  if (!secret) {
    redirect("/relational/login?error=config");
  }
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    redirect("/relational/login?error=unknown");
  }
  const token = createRelationalUserSessionToken(user.id, secret);
  (await cookies()).set(RELATIONAL_USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 14 * 24 * 60 * 60,
  });
  const nextRaw = String(formData.get("next") ?? "").trim();
  const next = nextRaw.startsWith("/relational") ? nextRaw : "/relational";
  redirect(next);
}

export async function signOutRelationalUserAction() {
  (await cookies()).delete(RELATIONAL_USER_COOKIE);
  redirect("/relational/login");
}

export async function getCurrentRelationalUserId() {
  return getRelationalUserIdFromCookies();
}
