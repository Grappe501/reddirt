/**
 * Fetch public HTML pages and save simplified text snapshots for biography / assistant research.
 *
 * — Only run against sites you own or have permission to copy from.
 * — Respects a short delay between requests; does not log in or bypass paywalls.
 * — Output is Markdown under docs/ingested/biography-scrapes/ — review before git add.
 *
 * Usage:
 *   npx tsx scripts/scrape-public-biography-sources.ts
 *   npx tsx scripts/scrape-public-biography-sources.ts --dry-run
 *   npx tsx scripts/scrape-public-biography-sources.ts --url https://example.com/page
 */
import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = path.resolve(__dirname, "../docs/ingested/biography-scrapes");

const UA =
  "RedDirt/biography-ingest (+https://github.com/Grappe501/reddirt; research snapshot; contact via site)";

type Seed = { url: string; slug: string };

/** Curated entry points — extend as needed. */
const DEFAULT_SEEDS: Seed[] = [
  { url: "https://www.forevermostfarms.com/", slug: "home" },
  { url: "https://www.forevermostfarms.com/about", slug: "about" },
  { url: "https://www.standuparkansas.com/", slug: "home" },
  { url: "https://www.standuparkansas.com/about-us", slug: "about-us" },
  { url: "https://www.standuparkansas.com/civic-education-hub", slug: "civic-education-hub" },
  { url: "https://www.kellygrappe.com/", slug: "home" },
  { url: "https://www.kellygrappe.com/about", slug: "about" },
];

function extractReadableText(html: string): { title: string; text: string } {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  const title = $("title").first().text().trim() || "(no title)";

  let main =
    $("main").first().text() ||
    $("article").first().text() ||
    $('[role="main"]').first().text() ||
    $(".sqs-html-content").first().text() ||
    $(".BlogItem").first().text() ||
    $("#content").first().text();

  if (!main || main.trim().length < 80) {
    main = $("body").text();
  }

  const text = main
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { title, text };
}

async function fetchUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function hostFolder(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

async function writeSnapshot(seed: Seed, dryRun: boolean): Promise<void> {
  const folder = path.join(OUT_ROOT, hostFolder(seed.url));
  const file = path.join(folder, `${seed.slug}.md`);
  const scrapedAt = new Date().toISOString();

  if (dryRun) {
    console.log(`[dry-run] would fetch ${seed.url} -> ${path.relative(process.cwd(), file)}`);
    return;
  }

  const html = await fetchUrl(seed.url);
  const { title, text } = extractReadableText(html);

  const md = [
    "---",
    `source_url: ${seed.url}`,
    `scraped_at: ${scrapedAt}`,
    "kind: public_html_snapshot",
    "note: Machine-extracted text only — verify against live site before publishing.",
    "---",
    "",
    `# ${title}`,
    "",
    `**URL:** ${seed.url}`,
    "",
    text,
    "",
  ].join("\n");

  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(file, md, "utf8");
  console.log(`wrote ${path.relative(process.cwd(), file)} (${text.length} chars body)`);
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const urlIdx = argv.indexOf("--url");
  const extraUrl = urlIdx >= 0 ? argv[urlIdx + 1]?.trim() : "";

  if (extraUrl) {
    let u: URL;
    try {
      u = new URL(extraUrl);
    } catch {
      console.error("Invalid --url");
      process.exit(1);
    }
    const slug = u.pathname.replace(/\//g, "-").replace(/^-|-$/g, "") || "page";
    await writeSnapshot({ url: u.href, slug }, dryRun);
    return;
  }

  console.log(`Output directory: ${OUT_ROOT}`);
  for (const seed of DEFAULT_SEEDS) {
    try {
      await writeSnapshot(seed, dryRun);
    } catch (e) {
      console.error(`FAIL ${seed.url}:`, e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
