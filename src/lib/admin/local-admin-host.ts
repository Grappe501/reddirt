import { headers } from "next/headers";
import { isTrustedLocalDevHost } from "@/lib/admin/local-host-policy";

/**
 * Local Campaign Manager loop: no passphrase on localhost / 127.0.0.1 in development.
 * Production / remote hosts still require ADMIN_SECRET session.
 * Set ADMIN_REQUIRE_AUTH_ON_LOCALHOST=1 to force passphrase even locally.
 * Does not trust x-forwarded-host (spoofable).
 */
export async function isLocalAdminHost(): Promise<boolean> {
  const requireAuth =
    process.env.ADMIN_REQUIRE_AUTH_ON_LOCALHOST === "1" ||
    process.env.ADMIN_REQUIRE_AUTH_ON_LOCALHOST === "true";
  const h = await headers();
  return isTrustedLocalDevHost({
    hostHeader: h.get("host"),
    requireAuthOnLocalhost: requireAuth,
  });
}
