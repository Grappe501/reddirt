import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createElectionPlanOperatorToken,
  normalizeOperatorInitials,
  ELECTION_PLAN_OPERATOR_COOKIE,
} from "@/lib/election-plan/auth/operator-session";
import { getElectionPlanPassword } from "@/lib/election-plan/auth/session";
import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireElectionPlanApiSession())) {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }

  const secret = getElectionPlanPassword();
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { initials?: string };
  const initials = normalizeOperatorInitials(String(body.initials ?? ""));
  if (!initials) {
    return NextResponse.json({ error: "Initials must be exactly 3 letters (A–Z)" }, { status: 400 });
  }

  try {
    const operator = await prisma.electionPlanOperator.findFirst({
      where: { initials, active: true },
    });
    if (!operator) {
      return NextResponse.json(
        {
          error:
            "Initials not on the approved operator list. Ask leadership to add you at /election-plan/operators.",
        },
        { status: 403 },
      );
    }

    const token = createElectionPlanOperatorToken(initials, secret);
    (await cookies()).set(ELECTION_PLAN_OPERATOR_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      ok: true,
      operator: {
        initials: operator.initials,
        displayName: operator.displayName,
        countySlug: operator.countySlug,
        capabilities: operator.capabilities,
      },
    });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function DELETE() {
  (await cookies()).delete(ELECTION_PLAN_OPERATOR_COOKIE);
  return NextResponse.json({ ok: true });
}
