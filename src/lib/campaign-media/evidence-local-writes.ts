import "server-only";

import { headers } from "next/headers";

/**
 * Local-first write gate: Host must be localhost/127.0.0.1, or ADMIN_LOCAL_WRITES=1.
 * Kept out of evidence-store.ts so photo-registry merge reads never pull next/headers into client graphs.
 */
export async function assertLocalEvidenceWritesAllowed(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (process.env.ADMIN_LOCAL_WRITES === "1" || process.env.ADMIN_LOCAL_WRITES === "true") {
    return { ok: true };
  }
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase().split(":")[0];
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return { ok: true };
  }
  return {
    ok: false,
    error:
      "Evidence Workbench writes are local-only. Run on http://127.0.0.1 (or set ADMIN_LOCAL_WRITES=1).",
  };
}
