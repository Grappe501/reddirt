import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Edge-safe middleware — no intelligence/dashboard imports (they abort on Netlify edge).
 * Admin auth + launch redirects live in Node layouts, next.config redirects, and /admin/page.tsx.
 */
export async function middleware(request: NextRequest) {
  const { updateSession } = await import("@/utils/supabase/middleware");
  return updateSession(request);
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
