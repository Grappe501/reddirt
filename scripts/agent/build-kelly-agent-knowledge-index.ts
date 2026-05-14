/**
 * Build lightweight retrieval index over county vault markdown (file-staged).
 * Run from RedDirt: npx tsx scripts/agent/build-kelly-agent-knowledge-index.ts
 */
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const vaultRoot = path.join(root, "county-vault/arkansas");
const out = path.join(root, "data/agent/kelly-agent-knowledge-index.json");

type Chunk = { id: string; path: string; county?: string; kind: string; excerpt: string };

function chunkId(relPath: string): string {
  return createHash("sha256").update(relPath).digest("base64url").slice(0, 24);
}

async function walkMd(dir: string, acc: string[]): Promise<void> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const p = path.join(dir, name);
    try {
      const s = await stat(p);
      if (s.isDirectory()) await walkMd(p, acc);
      else if (s.isFile() && name.endsWith(".md")) acc.push(p);
    } catch {
      /* skip */
    }
  }
}

async function main() {
  const mdFiles: string[] = [];
  await walkMd(vaultRoot, mdFiles);
  const chunks: Chunk[] = [];
  for (const abs of mdFiles.slice(0, 400)) {
    const rel = path.relative(root, abs).replace(/\\/g, "/");
    const parts = rel.split("/");
    const county = parts.length > 2 ? parts[2] : undefined;
    const raw = await readFile(abs, "utf8");
    const excerpt = raw.replace(/\s+/g, " ").trim().slice(0, 420);
    chunks.push({
      id: chunkId(rel),
      path: rel,
      county,
      kind: "markdown",
      excerpt,
    });
  }
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(
    out,
    JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), chunks }, null, 2),
    "utf8",
  );
  console.log(`Indexed ${chunks.length} md chunks → ${path.relative(root, out)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
