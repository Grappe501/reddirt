import fs from "node:fs/promises";
import path from "node:path";
import { chunkMarkdown, type DocChunk } from "./parse";

const DOC_EXTENSIONS = new Set([".md", ".mdx"]);

export async function loadAllDocChunks(repoRoot: string): Promise<DocChunk[]> {
  const docsDir = path.join(repoRoot, "docs");
  const files = await walkMarkdown(docsDir);
  const out: DocChunk[] = [];

  for (const file of files) {
    const rel = path.relative(repoRoot, file).replace(/\\/g, "/");
    const raw = await fs.readFile(file, "utf8");
    out.push(...chunkMarkdown(rel, raw));
  }

  return out;
}

async function walkMarkdown(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const out: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      out.push(...(await walkMarkdown(p)));
      continue;
    }
    const ext = path.extname(e.name).toLowerCase();
    if (DOC_EXTENSIONS.has(ext)) out.push(p);
  }
  return out;
}
