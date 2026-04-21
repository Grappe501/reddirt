import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Lightweight guard: admin routes are never “wide open” in production without ADMIN_SECRET.
 * Full session checks happen in the `(board)` layout; this only blocks missing configuration early.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  if (!process.env.ADMIN_SECRET?.trim()) {
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
