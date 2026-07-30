import "server-only";

import { headers } from "next/headers";
import { isTrustedLocalDevHost } from "@/lib/admin/local-host-policy";

/**
 * Local-first write gate: Host must be loopback in development, or ADMIN_LOCAL_WRITES=1 outside production.
 * Kept out of evidence-store.ts so photo-registry merge reads never pull next/headers into client graphs.
 * Does not trust x-forwarded-host.
 */
export async function assertLocalEvidenceWritesAllowed(): Promise<{ ok: true } | { ok: false; error: string }> {
  const env = process.env.NODE_ENV;
  const forceLocalWrites =
    process.env.ADMIN_LOCAL_WRITES === "1" || process.env.ADMIN_LOCAL_WRITES === "true";

  if (forceLocalWrites) {
    if (env === "production") {
      return {
        ok: false,
        error: "ADMIN_LOCAL_WRITES is blocked in production. Use localhost development instead.",
      };
    }
    return { ok: true };
  }

  const h = await headers();
  if (
    isTrustedLocalDevHost({
      hostHeader: h.get("host"),
      requireAuthOnLocalhost: false,
    })
  ) {
    return { ok: true };
  }

  return {
    ok: false,
    error:
      "Evidence Workbench writes are local-only. Run on http://127.0.0.1 in development (or set ADMIN_LOCAL_WRITES=1 outside production).",
  };
}
