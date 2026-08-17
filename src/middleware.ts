import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handleElectionPlanAuth } from "@/lib/election-plan/auth/election-plan-middleware";
import { handleVolunteerHubAuth } from "@/lib/volunteers/auth/volunteer-middleware";

/**
 * Edge-safe middleware — no intelligence/dashboard imports (they abort on Netlify edge).
 * Admin auth + launch redirects live in Node layouts, next.config redirects, and /admin/page.tsx.
 *
 * `/es` and `/es/*` set locale headers and rewrite to the English route tree.
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

  if (pathname === "/es" || pathname === "/es/") {
    requestHeaders.set("x-locale", "es");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname.startsWith("/es/")) {
    const rest = pathname.slice("/es".length) || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest;
    requestHeaders.set("x-locale", "es");
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/election-plan/:path*",
    "/volunteers/:path*",
    "/es",
    "/es/:path*",
  ],
};
