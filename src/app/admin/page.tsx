import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocalAdminHost } from "@/lib/admin/local-admin-host";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function adminHomeAfterLogin(): string {
  return process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE === "opposition_debate"
    ? "/admin/intelligence"
    : "/admin/content";
}

/** `/admin` — login first if needed, then intelligence hub (debate launch) or content board. */
export default async function AdminRootPage() {
  const destination = adminHomeAfterLogin();
  if (await isLocalAdminHost()) {
    redirect(destination);
  }
  const secret = getAdminSecret();
  if (!secret) {
    redirect("/admin/login?error=config");
  }
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) {
    redirect(`/admin/login?next=${encodeURIComponent(destination)}`);
  }
  redirect(destination);
}
