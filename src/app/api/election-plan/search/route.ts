import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ELECTION_PLAN_SESSION_COOKIE,
  getElectionPlanPassword,
  verifyElectionPlanSessionToken,
} from "@/lib/election-plan/auth/session";
import {
  getSearchIndexMeta,
  searchElectionPlanLocal,
} from "@/lib/election-plan/load-election-plan-search";

export const runtime = "nodejs";

async function requireElectionPlanApiAuth(): Promise<boolean> {
  const secret = getElectionPlanPassword();
  if (!secret) {
    if (process.env.NODE_ENV !== "production") return true;
    return false;
  }
  const token = (await cookies()).get(ELECTION_PLAN_SESSION_COOKIE)?.value;
  return verifyElectionPlanSessionToken(token, secret);
}

export async function GET(request: Request) {
  if (!(await requireElectionPlanApiAuth())) {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(25, Math.max(1, Number(searchParams.get("limit") ?? 12) || 12));

  if (!q) {
    return NextResponse.json({
      query: "",
      results: [],
      meta: getSearchIndexMeta(),
    });
  }

  const results = searchElectionPlanLocal(q, limit);

  return NextResponse.json({
    query: q,
    results,
    meta: getSearchIndexMeta(),
    mode: "keyword-local",
    note: "Local corpus only. No external web search. Optional semantic layer uses same allowlisted paths when configured.",
  });
}
