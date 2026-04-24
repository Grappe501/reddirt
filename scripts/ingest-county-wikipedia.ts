/**
 * Fetch plain-text extracts from English Wikipedia for all Arkansas counties (75)
 * via the MediaWiki Action API, write markdown under docs/ingested/county-wikipedia/,
 * then run `npm run ingest` to chunk + embed into SearchChunk.
 *
 * @see docs/county-wikipedia-reference-ingest.md
 *
 * Usage:
 *   npx tsx scripts/ingest-county-wikipedia.ts
 *   npx tsx scripts/ingest-county-wikipedia.ts --dry-run --limit 2
 *   npx tsx scripts/ingest-county-wikipedia.ts --from-db
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { ARKANSAS_COUNTY_EVENT_DIRECTORY } from "../src/lib/festivals/arkansas-county-event-directory";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const OUT_DIR = path.join(repoRoot, "docs", "ingested", "county-wikipedia");

const WIKI_API = "https://en.wikipedia.org/w/api.php";
/** Identify the tool per https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy */
const USER_AGENT =
  "RedDirtCampaign/1.0 (local ingest; https://github.com/Grappe501/reddirt; county reference ingest)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function countySlug(countyName: string): string {
  const base = countyName
    .replace(/\./g, "")
    .trim()
    .split(/\s+/)
    .join("-")
    .toLowerCase();
  return `${base}-county`;
}

function displayName(countyName: string): string {
  return `${countyName} County`;
}

function defaultWikiTitle(countyName: string): string {
  return `${displayName(countyName)}, Arkansas`;
}

/** Rare overrides when default title misses (redirects usually fix St. Francis). */
const WIKI_TITLE_OVERRIDE: Record<string, string> = {};

type WikiQueryPage = {
  title?: string;
  extract?: string;
  missing?: boolean;
};

type WikiResponse = {
  query?: {
    pages?: Record<string, WikiQueryPage>;
  };
};

function splitIntoSections(extract: string, maxChars = 5200): string[] {
  const paras = extract
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const sections: string[] = [];
  let buf: string[] = [];
  let len = 0;

  const flush = () => {
    if (buf.length === 0) return;
    sections.push(buf.join("\n\n"));
    buf = [];
    len = 0;
  };

  for (const p of paras) {
    if (len + p.length + 2 > maxChars && len > 0) flush();
    buf.push(p);
    len += p.length + 2;
  }
  flush();
  return sections.length > 0 ? sections : [extract.slice(0, maxChars)];
}

async function fetchExtract(wikiTitle: string): Promise<{ title: string; extract: string } | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "extracts",
    explaintext: "1",
    exsectionformat: "plain",
    redirects: "1",
    titles: wikiTitle,
  });
  const res = await fetch(`${WIKI_API}?${params}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) {
    console.error(`[wiki] HTTP ${res.status} for ${wikiTitle}`);
    return null;
  }
  const data = (await res.json()) as WikiResponse;
  const pages = data.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (!page || page.missing || !page.extract?.trim()) {
    console.error(`[wiki] missing or empty: ${wikiTitle}`);
    return null;
  }
  return { title: page.title ?? wikiTitle, extract: page.extract.trim() };
}

function buildMarkdown(opts: {
  display: string;
  slug: string;
  fips5: string;
  countySeats: string;
  wikiTitle: string;
  retrievedIso: string;
  extract: string;
}): string {
  const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(opts.wikiTitle.replace(/ /g, "_"))}`;
  const header = [
    `# ${opts.display} — Wikipedia (reference)`,
    ``,
    `> **Source:** English Wikipedia article “${opts.wikiTitle}”.`,
    `> **License:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (see Wikipedia page for attribution of contributors).`,
    `> **Retrieved (UTC):** ${opts.retrievedIso}`,
    `> **Canonical URL:** ${wikiUrl}`,
    `> **FIPS:** ${opts.fips5} · **County seats (campaign directory):** ${opts.countySeats}`,
    `> **Use:** Internal search / assistant context only — verify facts; not government or census data.`,
    ``,
  ].join("\n");

  const parts = splitIntoSections(opts.extract);
  const body = parts
    .map((text, i) => `## Encyclopedia text (part ${i + 1} of ${parts.length})\n\n${text}`)
    .join("\n\n");

  return `${header}\n${body}\n`;
}

function parseArgs(argv: string[]) {
  let dryRun = false;
  let limit: number | null = null;
  let fromDb = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") dryRun = true;
    if (argv[i] === "--from-db") fromDb = true;
    if (argv[i] === "--limit" && argv[i + 1]) {
      limit = Math.max(1, parseInt(argv[i + 1], 10) || 1);
      i++;
    }
  }
  return { dryRun, limit, fromDb };
}

async function main() {
  const { dryRun, limit, fromDb } = parseArgs(process.argv.slice(2));

  let rows = ARKANSAS_COUNTY_EVENT_DIRECTORY.map((r) => ({
    countyName: r.countyName,
    fips5: r.fips5,
    countySeats: r.countySeats,
    slug: countySlug(r.countyName),
    display: displayName(r.countyName),
    wikiTitle: WIKI_TITLE_OVERRIDE[r.countyName] ?? defaultWikiTitle(r.countyName),
  }));

  if (fromDb) {
    const prisma = new PrismaClient();
    try {
      const dbCounties = await prisma.county.findMany({ select: { fips: true } });
      const fipsSet = new Set(dbCounties.map((c) => c.fips));
      rows = rows.filter((r) => fipsSet.has(r.fips5));
      console.log(`[wiki] --from-db: ${rows.length} counties match DB (of ${dbCounties.length} DB rows)`);
    } finally {
      await prisma.$disconnect();
    }
  }

  if (limit != null) rows = rows.slice(0, limit);

  if (dryRun) {
    for (const r of rows) console.log(`[dry-run] ${r.slug} ← ${r.wikiTitle}`);
    console.log(`[dry-run] ${rows.length} counties`);
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const retrievedIso = new Date().toISOString();
  let ok = 0;
  const failed: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const got = await fetchExtract(r.wikiTitle);
    if (!got) {
      failed.push(r.wikiTitle);
      continue;
    }
    const md = buildMarkdown({
      display: r.display,
      slug: r.slug,
      fips5: r.fips5,
      countySeats: r.countySeats,
      wikiTitle: got.title,
      retrievedIso,
      extract: got.extract,
    });
    const outPath = path.join(OUT_DIR, `${r.slug}.md`);
    await fs.writeFile(outPath, md, "utf8");
    ok++;
    console.log(`[wiki] ${i + 1}/${rows.length} ${r.slug}`);
    if (i < rows.length - 1) await sleep(350);
  }

  console.log(`[wiki] done: ${ok} written, ${failed.length} failed`);
  if (failed.length) {
    console.error("[wiki] failed titles:", failed.join("; "));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
