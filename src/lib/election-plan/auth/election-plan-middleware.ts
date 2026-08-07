import { type NextRequest, NextResponse } from "next/server";

import {
  ELECTION_PLAN_SESSION_COOKIE,
  isElectionPlanAuthBypassed,
} from "@/lib/election-plan/auth/constants";
import {
  isLeaderWorkbenchPath,
  isLeaderWorkbenchSignInPath,
} from "@/lib/election-plan/auth/portal-paths";
import { VOLUNTEER_SESSION_COOKIE } from "@/lib/volunteers/auth/constants";

/**
 * Edge-safe gate for /election-plan/* — cookie presence + env check only.
 * Full HMAC verification runs in Node layout via requireElectionPlanPortalAccess().
 */
export function handleElectionPlanAuth(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/election-plan")) return null;
  if (pathname === "/election-plan/login" || pathname.startsWith("/election-plan/login/")) return null;

  // TEMP DEMO: password gates off — flip ELECTION_PLAN_AUTH_BYPASS to restore.
  if (isElectionPlanAuthBypassed()) return null;

  const leaderZone = isLeaderWorkbenchPath(pathname);
  if (leaderZone && isLeaderWorkbenchSignInPath(pathname)) return null;

  const epPassword = process.env.ELECTION_PLAN_PASSWORD?.trim();
  const volPassword = process.env.VOLUNTEER_HUB_PASSWORD?.trim();
  const epToken = request.cookies.get(ELECTION_PLAN_SESSION_COOKIE)?.value;
  const volToken = request.cookies.get(VOLUNTEER_SESSION_COOKIE)?.value;

  if (leaderZone && volPassword && volToken) {
    return null;
  }

  if (!epPassword) {
    if (process.env.NODE_ENV === "production" && !leaderZone) {
      return NextResponse.redirect(new URL("/election-plan/login?error=config", request.url));
    }
    return null;
  }

  if (!epToken && !leaderZone) {
    const login = new URL("/election-plan/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (!epToken && leaderZone && volPassword && !volToken) {
    const login = new URL("/election-plan/operators/leaders/sign-in", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return null;
}
