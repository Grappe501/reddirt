import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * 1) Refresh Supabase Auth cookies when `NEXT_PUBLIC_SUPABASE_*` is set (`@supabase/ssr`).
 * 2) Pass `x-pathname` on the request (set inside `updateSession` when Supabase env is absent; always set when Supabase runs).
 *
 * Admin `ADMIN_SECRET` gating lives in Node layouts/actions (`requireAdminPage`, `adminLoginAction`) — not here.
 * Edge middleware cannot rely on `.env.local` server-only vars (see Next.js edge env limitations).
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
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
