import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";

export async function requireAdminAction() {
  const secret = getAdminSecret();
  if (!secret) redirect("/admin/login?error=config");
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) redirect("/admin/login");
}
