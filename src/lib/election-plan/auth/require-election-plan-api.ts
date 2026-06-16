import { cookies } from "next/headers";

import {
  ELECTION_PLAN_OPERATOR_COOKIE,
  verifyElectionPlanOperatorToken,
} from "@/lib/election-plan/auth/operator-session";
import {
  ELECTION_PLAN_SESSION_COOKIE,
  getElectionPlanPassword,
  verifyElectionPlanSessionToken,
} from "@/lib/election-plan/auth/session";
import { prisma } from "@/lib/db";

export async function requireElectionPlanApiSession(): Promise<boolean> {
  const secret = getElectionPlanPassword();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const token = (await cookies()).get(ELECTION_PLAN_SESSION_COOKIE)?.value;
  return verifyElectionPlanSessionToken(token, secret);
}

export async function getElectionPlanOperatorFromRequest(): Promise<{
  id: string;
  initials: string;
  displayName: string;
  countySlug: string | null;
  capabilities: string[];
} | null> {
  const secret = getElectionPlanPassword();
  if (!secret) return null;

  const token = (await cookies()).get(ELECTION_PLAN_OPERATOR_COOKIE)?.value;
  const initials = verifyElectionPlanOperatorToken(token, secret);
  if (!initials) return null;

  try {
    const op = await prisma.electionPlanOperator.findFirst({
      where: { initials, active: true },
    });
    if (!op) return null;
    return {
      id: op.id,
      initials: op.initials,
      displayName: op.displayName,
      countySlug: op.countySlug,
      capabilities: op.capabilities,
    };
  } catch {
    return null;
  }
}

export async function requireElectionPlanOperator() {
  const sessionOk = await requireElectionPlanApiSession();
  if (!sessionOk) return { error: "session" as const, operator: null };
  const operator = await getElectionPlanOperatorFromRequest();
  if (!operator) return { error: "operator" as const, operator: null };
  if (!operator.capabilities.includes("field_entry")) {
    return { error: "capability" as const, operator: null };
  }
  return { error: null, operator };
}
