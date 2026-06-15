import { type NextRequest, NextResponse } from "next/server";
import { ELECTION_PLAN_SESSION_COOKIE } from "@/lib/election-plan/auth/constants";

/**
 * Edge-safe gate for /election-plan/* — cookie presence + env check only.
 * Full HMAC verification runs in Node layout via requireElectionPlanPage().
 */
export function handleElectionPlanAuth(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/election-plan")) return null;
  if (pathname === "/election-plan/login" || pathname.startsWith("/election-plan/login/")) return null;

  const password = process.env.ELECTION_PLAN_PASSWORD?.trim();
  if (!password) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/election-plan/login?error=config", request.url));
    }
    return null;
  }

  const token = request.cookies.get(ELECTION_PLAN_SESSION_COOKIE)?.value;
  if (!token) {
    const login = new URL("/election-plan/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return null;
}
