import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { authorStudioJson } from "./jsonResponse";

/** Returns a Next `Response` in Author Studio contract shape, or `null` if caller may proceed. */
export async function guardAuthorStudioRoute(route: string) {
  const secret = getAdminSecret();
  if (!secret) {
    return authorStudioJson(
      { ok: false, route, produces: null, data: null, message: "Admin is not configured (ADMIN_SECRET)." },
      { status: 503 }
    );
  }
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) {
    return authorStudioJson(
      { ok: false, route, produces: null, data: null, message: "Unauthorized" },
      { status: 401 }
    );
  }
  return null;
}
