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
    /*
     * Skip /admin entirely — ADMIN_SECRET gating is Node-only; edge middleware was aborting (AbortError).
     * Kim-hammer + launch-mode admin redirects are in next.config.ts redirects().
     */
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|admin).*)",
  ],
};
