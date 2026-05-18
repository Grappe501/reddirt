import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { mergeArkansasCatalogWithPersisted } from "../../src/lib/compliance/knowledge/merge-arkansas-sources";
import { arkansasSourcesPath, loadArkansasSourceCatalog } from "../../src/lib/compliance/knowledge/load-compliance-rule-corpus";

async function verifyUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "User-Agent": "RedDirt-Compliance-LinkVerify/1.0" } });
    if (response.status === 405 || response.status === 501) {
      const getResponse = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": "RedDirt-Compliance-LinkVerify/1.0" } });
      return { ok: getResponse.ok, status: getResponse.status };
    }
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function main() {
  const catalog = mergeArkansasCatalogWithPersisted(await loadArkansasSourceCatalog());
  const results: Array<{ id: string; url: string; ok: boolean; status: number }> = [];
  for (const source of catalog) {
    if (!source.url) {
      results.push({ id: source.id, url: "", ok: false, status: 0 });
      continue;
    }
    const verified = await verifyUrl(source.url);
    results.push({ id: source.id, url: source.url, ...verified });
  }
  const updated = catalog.map((source) => {
    const result = results.find((item) => item.id === source.id);
    if (!result || !source.url) return { ...source, verificationStatus: "manual_needed" as const };
    return {
      ...source,
      verificationStatus: result.ok ? "official_link_verified" as const : "broken_link" as const,
      retrievedAt: new Date().toISOString().slice(0, 10),
    };
  });
  await mkdir(path.dirname(arkansasSourcesPath), { recursive: true });
  await writeFile(arkansasSourcesPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    total: updated.length,
    verified: results.filter((item) => item.ok).length,
    broken: results.filter((item) => !item.ok).length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
