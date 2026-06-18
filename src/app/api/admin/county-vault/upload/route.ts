import { assertAdminApi } from "@/lib/admin/require-admin";
import { runCountyVaultIngest } from "@/lib/county-vault/ingest-pipeline";
import { resolveDbCountyForVault } from "@/lib/county-vault/resolve-county";

import { COUNTY_VAULT_ROUTE_MAX_DURATION, validateVaultUploadTotalBytes } from "@/lib/county-vault/netlify";

export const dynamic = "force-dynamic";
export const maxDuration = COUNTY_VAULT_ROUTE_MAX_DURATION;

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const form = await req.formData();
  const countySlug = String(form.get("countySlug") ?? "").trim();
  const city = String(form.get("city") ?? "").trim() || null;
  const createdBy = String(form.get("createdBy") ?? "").trim() || "admin";

  if (!countySlug) {
    return Response.json({ ok: false, error: "countySlug required" }, { status: 400 });
  }

  const county = await resolveDbCountyForVault(countySlug);
  if (!county) {
    return Response.json({ ok: false, error: "county_not_found" }, { status: 404 });
  }

  const fileEntries = form.getAll("files");
  const single = form.get("file");
  const allFiles: File[] = [];
  for (const f of fileEntries) {
    if (f instanceof File && f.size > 0) allFiles.push(f);
  }
  if (single instanceof File && single.size > 0) allFiles.push(single);
  if (allFiles.length === 0) {
    return Response.json({ ok: false, error: "missing_file" }, { status: 400 });
  }

  const buffers = await Promise.all(
    allFiles.map(async (f) => ({
      fileName: f.name,
      mimeType: f.type || "application/octet-stream",
      buffer: Buffer.from(await f.arrayBuffer()),
    })),
  );

  const totalBytes = buffers.reduce((n, f) => n + f.buffer.length, 0);
  const sizeErr = validateVaultUploadTotalBytes(totalBytes);
  if (sizeErr) {
    return Response.json({ ok: false, error: sizeErr }, { status: 413 });
  }

  const runAnalysis = form.get("runAnalysis") !== "false";

  try {
    const result = await runCountyVaultIngest({
      countySlug: county.slug,
      countyId: county.id,
      countyFips: county.fips,
      city,
      files: buffers,
      createdBy,
      sourceLabel: `${county.displayName} — admin vault upload`,
      runAnalysis,
    });

    return Response.json(result);
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "ingest_failed" },
      { status: 500 },
    );
  }
}
