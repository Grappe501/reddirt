import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * 1) Refresh Supabase Auth cookies when `NEXT_PUBLIC_SUPABASE_*` is set (`@supabase/ssr`).
 * 2) Pass `x-pathname` on the request (set inside `updateSession` when Supabase env is absent; always set when Supabase runs).
 * 3) Block misconfigured admin (no ADMIN_SECRET) except /admin/login.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!process.env.ADMIN_SECRET?.trim()) {
      return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
    }
  }

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
