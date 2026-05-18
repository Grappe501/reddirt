import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { arkansasOfficialRuleSources } from "../../src/lib/compliance/knowledge/arkansas-rule-source-catalog";
import { arkansasSourcesPath, rawKnowledgeDir } from "../../src/lib/compliance/knowledge/load-compliance-rule-corpus";
import { mergeArkansasCatalogWithPersisted } from "../../src/lib/compliance/knowledge/merge-arkansas-sources";

async function fetchHtml(url: string): Promise<{ ok: boolean; status: number; text: string }> {
  const response = await fetch(url, { headers: { "User-Agent": "RedDirt-Compliance-Corpus/1.0 (+internal)" } });
  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120_000);
}

async function main() {
  const persisted = await readPersistedCatalog();
  const catalog = mergeArkansasCatalogWithPersisted(persisted);
  await mkdir(path.dirname(arkansasSourcesPath), { recursive: true });
  await mkdir(rawKnowledgeDir, { recursive: true });
  const results: Array<{ id: string; ok: boolean; status: number; bytes: number }> = [];
  for (const source of catalog) {
    if (!source.url || source.sourceFormat === "pdf") {
      results.push({ id: source.id, ok: false, status: 0, bytes: 0 });
      continue;
    }
    try {
      const fetched = await fetchHtml(source.url);
      if (fetched.ok) {
        const text = `# ${source.title}\n\nSource: ${source.url}\nRetrieved: ${new Date().toISOString()}\n\n${htmlToText(fetched.text)}`;
        await writeFile(path.join(rawKnowledgeDir, `${source.id}.md`), `${text}\n`, "utf8");
      }
      results.push({ id: source.id, ok: fetched.ok, status: fetched.status, bytes: fetched.text.length });
    } catch {
      results.push({ id: source.id, ok: false, status: 0, bytes: 0 });
    }
  }
  const updated = catalog.map((source) => {
    const result = results.find((item) => item.id === source.id);
    if (!result?.ok) return source;
    return {
      ...source,
      retrievedAt: new Date().toISOString().slice(0, 10),
      verificationStatus: result.ok ? "downloaded_official_source" as const : source.verificationStatus,
      filePath: `data/compliance/knowledge/raw/${source.id}.md`,
    };
  });
  await writeFile(arkansasSourcesPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ catalogSize: updated.length, scraped: results.filter((item) => item.ok).length, results }, null, 2));
}

async function readPersistedCatalog() {
  try {
    const { readFile } = await import("node:fs/promises");
    return JSON.parse(await readFile(arkansasSourcesPath, "utf8")) as typeof arkansasOfficialRuleSources;
  } catch {
    return null;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
