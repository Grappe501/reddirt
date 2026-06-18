/**
 * Bundle Chapter 4 (drop-off) and Chapter 5 (registration) county markdown for Netlify.
 * Output: data/election-plan/county-electoral-math-markdown.json
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/election-plan/county-electoral-math-markdown.json");
const SNAPSHOT = path.join(ROOT, "data/election-plan/election-plan-workbench.snapshot.json");

const CH4_DIR = path.join(
  ROOT,
  "docs/strategic-plan/plurality-victory-plan/part-ii-electoral-math/chapter-04-democratic-drop-off/counties",
);
const CH5_DIR = path.join(
  ROOT,
  "docs/strategic-plan/plurality-victory-plan/part-ii-electoral-math/chapter-05-fifty-thousand-new-voter-plan/counties",
);

type CountyRow = { slug: string };

function normalizeSlug(slug: string): string {
  return slug.trim().replace(/-county$/, "");
}

function countyFileName(slug: string): string {
  const base = normalizeSlug(slug);
  return `${base}-county.md`;
}

function readCountyMd(dir: string, slug: string): string | null {
  const abs = path.join(dir, countyFileName(slug));
  if (!existsSync(abs)) return null;
  return readFileSync(abs, "utf8");
}

export function bundleCountyElectoralMathMarkdown(counties?: CountyRow[]): {
  version: number;
  generatedAt: string;
  countyCount: number;
  missingDropOff: string[];
  missingRegistration: string[];
  dropOffBySlug: Record<string, string>;
  registrationBySlug: Record<string, string>;
} {
  let rows = counties;
  if (!rows?.length && existsSync(SNAPSHOT)) {
    const snap = JSON.parse(readFileSync(SNAPSHOT, "utf8")) as { counties?: CountyRow[] };
    rows = snap.counties ?? [];
  }

  const dropOffBySlug: Record<string, string> = {};
  const registrationBySlug: Record<string, string> = {};
  const missingDropOff: string[] = [];
  const missingRegistration: string[] = [];

  for (const row of rows ?? []) {
    const key = normalizeSlug(row.slug);
    const ch4 = readCountyMd(CH4_DIR, key);
    const ch5 = readCountyMd(CH5_DIR, key);
    if (ch4?.trim()) dropOffBySlug[key] = ch4;
    else missingDropOff.push(key);
    if (ch5?.trim()) registrationBySlug[key] = ch5;
    else missingRegistration.push(key);
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    countyCount: Object.keys(dropOffBySlug).length,
    missingDropOff,
    missingRegistration,
    dropOffBySlug,
    registrationBySlug,
  };
}

export function writeCountyElectoralMathMarkdownBundle(counties?: CountyRow[]): void {
  const bundle = bundleCountyElectoralMathMarkdown(counties);
  writeFileSync(OUT, JSON.stringify(bundle, null, 0), "utf8");
  // eslint-disable-next-line no-console
  console.log(
    `County electoral math bundle: drop-off ${Object.keys(bundle.dropOffBySlug).length}/75 · registration ${Object.keys(bundle.registrationBySlug).length}/75 → ${OUT}`,
  );
  if (bundle.missingDropOff.length || bundle.missingRegistration.length) {
    process.exitCode = 1;
  }
}

const invokedDirectly = process.argv[1]?.replace(/\\/g, "/").includes("bundle-county-electoral-math-markdown");
if (invokedDirectly) {
  writeCountyElectoralMathMarkdownBundle();
}
