import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "./session";

export async function requireAdminPage(): Promise<void> {
  const secret = getAdminSecret();
  if (!secret) {
    redirect("/admin/login?error=config");
  }
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) {
    const h = await headers();
    const pathname =
      h.get("x-pathname")?.split("?")[0] ??
      h.get("x-invoke-path")?.split("?")[0] ??
      h.get("x-forwarded-uri")?.split("?")[0] ??
      "";
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !pathname.startsWith("/admin/login/")) {
      redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
    redirect("/admin/login");
  }
}

export async function assertAdminApi(): Promise<Response | null> {
  const secret = getAdminSecret();
  if (!secret) {
    return Response.json({ error: "Admin is not configured (ADMIN_SECRET)." }, { status: 503 });
  }
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
