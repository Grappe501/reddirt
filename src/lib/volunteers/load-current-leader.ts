import { cookies } from "next/headers";

import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import { requireVolunteerHubPage } from "@/lib/volunteers/auth/require-volunteer-page";
import { VOLUNTEER_SESSION_COOKIE } from "@/lib/volunteers/auth/constants";
import {
  getVolunteerHubPassword,
  verifyVolunteerSessionToken,
} from "@/lib/volunteers/auth/session";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export async function tryLoadCurrentVolunteerLeader(): Promise<VolunteerLeader | null> {
  const secret = getVolunteerHubPassword();
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return getVolunteerLeaderBySlug("will-larue") ?? null;
    }
    return null;
  }
  const token = (await cookies()).get(VOLUNTEER_SESSION_COOKIE)?.value;
  const payload = verifyVolunteerSessionToken(token, secret);
  if (!payload) return null;
  return getVolunteerLeaderBySlug(payload.leaderSlug) ?? null;
}

export async function loadCurrentVolunteerLeader(): Promise<VolunteerLeader | null> {
  const session = await requireVolunteerHubPage();
  return getVolunteerLeaderBySlug(session.leaderSlug) ?? null;
}
