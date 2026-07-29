import { headers } from "next/headers";

/**
 * Local Campaign Manager loop: no passphrase on localhost / 127.0.0.1.
 * Production / remote hosts still require ADMIN_SECRET session.
 * Set ADMIN_REQUIRE_AUTH_ON_LOCALHOST=1 to force passphrase even locally.
 */
export async function isLocalAdminHost(): Promise<boolean> {
  if (
    process.env.ADMIN_REQUIRE_AUTH_ON_LOCALHOST === "1" ||
    process.env.ADMIN_REQUIRE_AUTH_ON_LOCALHOST === "true"
  ) {
    return false;
  }
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase().split(":")[0];
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}
