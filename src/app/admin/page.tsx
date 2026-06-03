import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { getAdminLoginDefaultPath } from "@/lib/intelligence/intelligenceLaunchMode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** `/admin` — login first if needed, then intelligence hub (debate launch) or content board. */
export default async function AdminRootPage() {
  const secret = getAdminSecret();
  const destination = getAdminLoginDefaultPath();
  if (!secret) {
    redirect("/admin/login?error=config");
  }
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) {
    redirect(`/admin/login?next=${encodeURIComponent(destination)}`);
  }
  redirect(destination);
}
