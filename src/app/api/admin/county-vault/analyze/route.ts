import { runVaultDeepAnalysis } from "@/lib/county-vault/vault-analysis";
import { assertAdminApi } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";
/** Next.js requires a literal — Netlify/serverless cap matches admin intelligence routes. */
export const maxDuration = 26;

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
