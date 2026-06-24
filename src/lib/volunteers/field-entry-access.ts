import { cookies } from "next/headers";

import {
  ELECTION_PLAN_OPERATOR_COOKIE,
  createElectionPlanOperatorToken,
} from "@/lib/election-plan/auth/operator-session";
import {
  getElectionPlanOperatorFromRequest,
  requireElectionPlanApiSession,
} from "@/lib/election-plan/auth/require-election-plan-api";
import { getElectionPlanPassword } from "@/lib/election-plan/auth/session";
import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import {
  ensureVolunteerLeaderOperator,
  loadLeaderOperatorRecord,
  type LeaderOperatorRecord,
} from "@/lib/volunteers/ensure-leader-operator";
import { VOLUNTEER_SESSION_COOKIE } from "@/lib/volunteers/auth/constants";
import {
  getVolunteerHubPassword,
  verifyVolunteerSessionToken,
} from "@/lib/volunteers/auth/session";

export async function getVolunteerSessionFromCookies(): Promise<{
  leaderSlug: string;
  initials: string;
} | null> {
  const secret = getVolunteerHubPassword();
  if (!secret) return null;
  const token = (await cookies()).get(VOLUNTEER_SESSION_COOKIE)?.value;
  const payload = verifyVolunteerSessionToken(token, secret);
  if (!payload) return null;
  return { leaderSlug: payload.leaderSlug, initials: payload.initials };
}

/** Field log API accepts Election Plan session OR volunteer leader session. */
export async function requireFieldEntrySession(): Promise<boolean> {
  if (await requireElectionPlanApiSession()) return true;
  return (await getVolunteerSessionFromCookies()) != null;
}

export type FieldEntryOperatorContext = LeaderOperatorRecord & {
  source: "election_plan" | "volunteer_leader";
};

/** Resolve operator for field entry — EP operator bar or volunteer leader identity. */
export async function resolveFieldEntryOperator(): Promise<FieldEntryOperatorContext | null> {
  const epOp = await getElectionPlanOperatorFromRequest();
  if (epOp) {
    return {
      id: epOp.id,
      initials: epOp.initials,
      displayName: epOp.displayName,
      countySlug: epOp.countySlug,
      capabilities: epOp.capabilities as LeaderOperatorRecord["capabilities"],
      source: "election_plan",
    };
  }

  const session = await getVolunteerSessionFromCookies();
  if (!session) return null;

  const leader = getVolunteerLeaderBySlug(session.leaderSlug);
  if (!leader || leader.initials.toUpperCase() !== session.initials.toUpperCase()) return null;

  const ensured = await ensureVolunteerLeaderOperator(leader);
  if (!ensured) return null;

  if (!ensured.capabilities.includes("field_entry")) return null;

  return { ...ensured, source: "volunteer_leader" };
}

/** Set EP operator cookie when leader signs in and EP password is configured. */
export async function setOperatorCookieForLeader(initials: string): Promise<void> {
  const secret = getElectionPlanPassword();
  if (!secret) return;
  const normalized = initials.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) return;

  const op = await loadLeaderOperatorRecord(normalized);
  if (!op) return;

  const token = createElectionPlanOperatorToken(normalized, secret);
  (await cookies()).set(ELECTION_PLAN_OPERATOR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function requireFieldEntryOperator(): Promise<
  | { error: "session"; operator: null }
  | { error: "operator"; operator: null }
  | { error: "capability"; operator: null }
  | { error: null; operator: FieldEntryOperatorContext }
> {
  const sessionOk = await requireFieldEntrySession();
  if (!sessionOk) return { error: "session", operator: null };

  const operator = await resolveFieldEntryOperator();
  if (!operator) return { error: "operator", operator: null };
  if (!operator.capabilities.includes("field_entry")) {
    return { error: "capability", operator: null };
  }
  return { error: null, operator };
}
