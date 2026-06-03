import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import {
  isIntelligenceLaunchRoute,
  isIntelligenceOppositionDebateLaunchMode,
} from "@/lib/intelligence/intelligenceLaunchMode";

/**
 * 1) Refresh Supabase Auth cookies when `NEXT_PUBLIC_SUPABASE_*` is set (`@supabase/ssr`).
 * 2) Pass `x-pathname` on the request (set inside `updateSession` when Supabase env is absent; always set when Supabase runs).
 *
 * Admin `ADMIN_SECRET` gating lives in Node layouts/actions (`requireAdminPage`, `adminLoginAction`) — not here.
 * Edge middleware cannot rely on `.env.local` server-only vars (see Next.js edge env limitations).
 */
export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const path = request.nextUrl.pathname;

  /** Legacy bookmarks: /admin/kim-hammer/* → intelligence workbench. */
  if (path === "/admin/kim-hammer" || path.startsWith("/admin/kim-hammer/")) {
    const url = request.nextUrl.clone();
    url.pathname = path.replace(/^\/admin\/kim-hammer/, "/admin/intelligence/kim-hammer");
    return NextResponse.redirect(url);
  }

  if (isIntelligenceOppositionDebateLaunchMode()) {
    if (path === "/admin/login" || path.startsWith("/admin/login/")) {
      return response;
    }
    if (path.startsWith("/admin") && !isIntelligenceLaunchRoute(path)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/intelligence";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Next.js–recommended pattern: do not run middleware on API routes, static files, image
     * optimization, dev HMR, or favicon. Running on `_next/*` or mutating those requests can
     * prevent CSS/JS from loading (page renders unstyled).
     */
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)",
  ],
};
