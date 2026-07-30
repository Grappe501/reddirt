import { cookies } from "next/headers";
import { isLocalAdminHost } from "@/lib/admin/local-admin-host";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";

export const SITE_EDIT_COOKIE = "reddirt_site_edit";

/** True when operator may enter public-site edit mode (local admin host or valid admin session). */
export async function canUseSiteEditMode(): Promise<boolean> {
  if (await isLocalAdminHost()) return true;
  const secret = getAdminSecret();
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token, secret);
}

/** True when edit mode cookie is on AND operator is authorized. */
export async function isSiteEditMode(): Promise<boolean> {
  if (!(await canUseSiteEditMode())) return false;
  const v = (await cookies()).get(SITE_EDIT_COOKIE)?.value;
  return v === "1" || v === "true";
}
