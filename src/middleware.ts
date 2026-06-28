import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handleElectionPlanAuth } from "@/lib/election-plan/auth/election-plan-middleware";
import { handleVolunteerHubAuth } from "@/lib/volunteers/auth/volunteer-middleware";

/**
 * Edge-safe middleware — no intelligence/dashboard imports (they abort on Netlify edge).
 * Admin auth + launch redirects live in Node layouts, next.config redirects, and /admin/page.tsx.
 *
 * Supabase `auth.getUser()` was removed from the edge path: no App Router routes use
 * `@/utils/supabase/*` (Prisma + cookie gates only), and the network call was timing out on Netlify edge.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/election-plan")) {
    const electionPlanResponse = handleElectionPlanAuth(request);
    if (electionPlanResponse) return electionPlanResponse;
  }

  if (pathname.startsWith("/volunteers")) {
    const volunteerResponse = handleVolunteerHubAuth(request);
    if (volunteerResponse) return volunteerResponse;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /** Only election-plan + legacy volunteers — skip public site to avoid edge timeouts. */
    "/election-plan/:path*",
    "/volunteers/:path*",
  ],
};
