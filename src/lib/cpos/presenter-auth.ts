import { cookies } from "next/headers";

import { ELECTION_PLAN_SESSION_COOKIE } from "@/lib/election-plan/auth/constants";
import {
  getElectionPlanPassword,
  verifyElectionPlanSessionToken,
} from "@/lib/election-plan/auth/session";

/** Presenter console requires Election Plan login (same as audience). */
export async function canAccessPresenterConsole(): Promise<boolean> {
  return isElectionPlanAuthed();
}

export async function isElectionPlanAuthed(): Promise<boolean> {
  const secret = getElectionPlanPassword();
  if (!secret) return process.env.NODE_ENV !== "production";
  const token = (await cookies()).get(ELECTION_PLAN_SESSION_COOKIE)?.value;
  return verifyElectionPlanSessionToken(token, secret);
}
