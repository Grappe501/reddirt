import { cookies } from "next/headers";

import {
  ELECTION_PLAN_OPERATOR_COOKIE,
  verifyElectionPlanOperatorToken,
} from "@/lib/election-plan/auth/operator-session";
import { getElectionPlanPassword } from "@/lib/election-plan/auth/session";
import { prisma } from "@/lib/db";

export async function loadCurrentElectionPlanOperator(): Promise<{
  initials: string;
  displayName: string;
} | null> {
  const secret = getElectionPlanPassword();
  if (!secret) return null;

  const token = (await cookies()).get(ELECTION_PLAN_OPERATOR_COOKIE)?.value;
  const initials = verifyElectionPlanOperatorToken(token, secret);
  if (!initials) return null;

  try {
    const op = await prisma.electionPlanOperator.findFirst({
      where: { initials, active: true },
      select: { initials: true, displayName: true },
    });
    return op;
  } catch {
    return null;
  }
}
