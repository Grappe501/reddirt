/**
 * Bundle Chapter 9 county playbook markdown for production (Netlify serverless has no docs/ at runtime).
 * Output: data/election-plan/county-playbook-markdown.json
 *
 * Usage: tsx scripts/election-plan/bundle-county-playbook-markdown.ts
 * Also invoked from npm run election-plan:build
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/election-plan/county-playbook-markdown.json");
const SNAPSHOT = path.join(ROOT, "data/election-plan/election-plan-workbench.snapshot.json");
const PLAYBOOK_ROOT = path.join(
  ROOT,
  "docs/strategic-plan/plurality-victory-plan/part-iii-arkansas-battlefield/chapter-09-seventy-five-county-playbook/counties",
);

type CountyRow = { slug: string; county: string; playbookPath?: string };

export function bundleCountyPlaybookMarkdown(counties?: CountyRow[]): {
  version: number;
  generatedAt: string;
  countyCount: number;
  missing: string[];
  bySlug: Record<string, string>;
} {
  let rows = counties;
  if (!rows?.length && existsSync(SNAPSHOT)) {
    const snap = JSON.parse(readFileSync(SNAPSHOT, "utf8")) as { counties?: CountyRow[] };
    rows = snap.counties ?? [];
  }

  const bySlug: Record<string, string> = {};
  const missing: string[] = [];

  for (const row of rows ?? []) {
    const slug = row.slug.replace(/-county$/, "");
    const rel = row.playbookPath?.trim();
    const fileName = rel ? path.basename(rel) : `${slug}-county.md`;
    const abs = path.join(PLAYBOOK_ROOT, fileName);
    if (!existsSync(abs)) {
      missing.push(slug);
      continue;
    }
    bySlug[slug] = readFileSync(abs, "utf8");
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    countyCount: Object.keys(bySlug).length,
    missing,
    bySlug,
  };
}

export function writeCountyPlaybookMarkdownBundle(counties?: CountyRow[]): void {
  const bundle = bundleCountyPlaybookMarkdown(counties);
  writeFileSync(OUT, JSON.stringify(bundle, null, 0), "utf8");
  // eslint-disable-next-line no-console
  console.log(
    `County playbook markdown bundle: ${bundle.countyCount}/75 counties → ${OUT}${bundle.missing.length ? ` · missing: ${bundle.missing.join(", ")}` : ""}`,
  );
  if (bundle.missing.length > 0) {
    process.exitCode = 1;
  }
}

const invokedDirectly = process.argv[1]?.replace(/\\/g, "/").includes("bundle-county-playbook-markdown");
if (invokedDirectly) {
  writeCountyPlaybookMarkdownBundle();
}
