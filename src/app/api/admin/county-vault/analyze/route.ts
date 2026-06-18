import { runVaultDeepAnalysis } from "@/lib/county-vault/vault-analysis";
import { assertAdminApi } from "@/lib/admin/require-admin";

import { COUNTY_VAULT_ROUTE_MAX_DURATION } from "@/lib/county-vault/netlify";

export const dynamic = "force-dynamic";
export const maxDuration = COUNTY_VAULT_ROUTE_MAX_DURATION;

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as { assetId?: string; assetIds?: string[] } | null;
  const ids = body?.assetIds?.length ? body.assetIds : body?.assetId ? [body.assetId] : [];
  if (ids.length === 0) {
    return Response.json({ ok: false, error: "assetId required" }, { status: 400 });
  }

  const results: Array<{ assetId: string; ok: boolean; message: string }> = [];
  for (const assetId of ids) {
    const r = await runVaultDeepAnalysis(assetId);
    results.push({ assetId, ...r });
  }

  return Response.json({ ok: true, results });
}
