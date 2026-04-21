import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "./session";

export async function requireAdminPage(): Promise<void> {
  const secret = getAdminSecret();
  if (!secret) {
    redirect("/admin/login?error=config");
  }
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) {
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
