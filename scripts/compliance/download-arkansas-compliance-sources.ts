import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { mergeArkansasCatalogWithPersisted } from "../../src/lib/compliance/knowledge/merge-arkansas-sources";
import { arkansasSourcesPath, loadArkansasSourceCatalog, rawKnowledgeDir } from "../../src/lib/compliance/knowledge/load-compliance-rule-corpus";

async function main() {
  const catalog = await loadArkansasSourceCatalog();
  const merged = mergeArkansasCatalogWithPersisted(catalog);
  await mkdir(rawKnowledgeDir, { recursive: true });
  const manifest: Array<{ id: string; url: string; savedPath?: string; status: "saved" | "skipped_pdf" | "failed" }> = [];
  for (const source of merged) {
    if (!source.url) {
      manifest.push({ id: source.id, url: "", status: "failed" });
      continue;
    }
    if (source.sourceFormat === "pdf") {
      manifest.push({ id: source.id, url: source.url, status: "skipped_pdf" });
      continue;
    }
    try {
      const response = await fetch(source.url, { headers: { "User-Agent": "RedDirt-Compliance-Download/1.0" } });
      const body = await response.text();
      const ext = source.sourceFormat === "html" ? "html" : "txt";
      const savedPath = path.join("data", "compliance", "knowledge", "raw", `${source.id}.${ext}`);
      await writeFile(path.join(process.cwd(), savedPath), body, "utf8");
      manifest.push({ id: source.id, url: source.url, savedPath, status: "saved" });
    } catch {
      manifest.push({ id: source.id, url: source.url, status: "failed" });
    }
  }
  await mkdir(path.dirname(arkansasSourcesPath), { recursive: true });
  await writeFile(path.join(process.cwd(), "data", "compliance", "knowledge", "download-manifest.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), manifest }, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ saved: manifest.filter((item) => item.status === "saved").length, skippedPdf: manifest.filter((item) => item.status === "skipped_pdf").length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
