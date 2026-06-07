import { existsSync } from "node:fs";
import { readdir, readFile } from "fs/promises";
import path from "node:path";
import type { StrategyMdEntry } from "./md-manifest";
import { CAMPAIGN_SYSTEM_MANUAL_DIR } from "./md-manifest";

/**
 * Relative POSIX paths under `campaign-system-manual/` (e.g. `README.md`, `chapters/06-dashboard-hierarchy/README.md`).
 */
export async function listCampaignSystemMarkdownRelativePaths(): Promise<string[]> {
  const out: string[] = [];
  const root = path.join(process.cwd(), CAMPAIGN_SYSTEM_MANUAL_DIR);
  if (!existsSync(root)) return out;

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(abs);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
        out.push(path.relative(root, abs).replace(/\\/g, "/"));
      }
    }
  }

  await walk(root);
  return out.sort((a, b) => a.localeCompare(b));
}

export function deriveNavLabelFromMarkdown(markdown: string, fallback: string): string {
  const m = /^#\s+(.+)$/m.exec(markdown);
  if (m) return m[1]!.trim().slice(0, 160);
  const words = fallback
    .replace(/\.md$/i, "")
    .split(/[/_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.join(" · ").slice(0, 160) || fallback;
}

/**
 * Manifest-style entries for every Markdown file in `campaign-system-manual/` (not shown in campaign-strategy nav; used for agent chunking).
 */
export async function buildCampaignSystemChunkEntries(): Promise<StrategyMdEntry[]> {
  const rels = await listCampaignSystemMarkdownRelativePaths();
  const base = path.join(process.cwd(), CAMPAIGN_SYSTEM_MANUAL_DIR);
  const out: StrategyMdEntry[] = [];

  for (const rel of rels) {
    const md = await readFile(path.join(base, rel), "utf8");
    const slug = rel.replace(/\.md$/i, "").replace(/\\/g, "/");
    const fallback = slug.split("/").pop() ?? slug;
    out.push({
      section: "campaign-system",
      path: `campaign-system/${slug}`,
      label: `Campaign system · ${deriveNavLabelFromMarkdown(md, fallback)}`,
      file: rel.replace(/\\/g, "/"),
    });
  }

  return out;
}
