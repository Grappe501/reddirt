import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 1) Pass `x-pathname` on the request (available to server code if needed for pathname-aware content).
 * 2) Block misconfigured admin (no ADMIN_SECRET) except /admin/login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!process.env.ADMIN_SECRET?.trim()) {
      return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
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
