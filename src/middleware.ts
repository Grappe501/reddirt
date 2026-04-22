import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 1) Pass `x-pathname` to the root layout (PublicLayoutMain) for the sitewide road imagery band.
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
     * Match all pathnames except static assets and Next internals.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|eot)).*)",
  ],
};
