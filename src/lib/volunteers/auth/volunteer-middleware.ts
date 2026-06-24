import { type NextRequest, NextResponse } from "next/server";

import {
  isLeaderWorkbenchPath,
  isLeaderWorkbenchSignInPath,
} from "@/lib/election-plan/auth/portal-access";
import { VOLUNTEER_SESSION_COOKIE } from "@/lib/volunteers/auth/constants";

/** Legacy /volunteers paths → Election Plan Operators leader hub. */
export function handleVolunteerLegacyRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/volunteers")) return null;
  if (pathname.startsWith("/volunteers/login")) {
    const login = new URL("/election-plan/operators/leaders/sign-in", request.url);
    login.search = request.nextUrl.search;
    return NextResponse.redirect(login);
  }
  if (pathname === "/volunteers" || pathname === "/volunteers/me") {
    return NextResponse.redirect(new URL("/election-plan/operators/leaders/me", request.url));
  }
  if (pathname === "/volunteers/command") {
    return NextResponse.redirect(new URL("/election-plan/operators/leaders/command", request.url));
  }
  return NextResponse.redirect(new URL("/election-plan/operators/leaders", request.url));
}

/**
 * Edge-safe gate for volunteer leader session on legacy /volunteers/* (redirect handles most).
 */
export function handleVolunteerHubAuth(request: NextRequest): NextResponse | null {
  return handleVolunteerLegacyRedirect(request);
}
