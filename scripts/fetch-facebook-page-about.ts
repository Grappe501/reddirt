/**
 * Print Facebook **Page** metadata from Graph API (About / description fields).
 * Does not scrape HTML — requires FACEBOOK_PAGE_ID + FACEBOOK_PAGE_ACCESS_TOKEN (Page token).
 *
 * Personal profiles and “view source” bio scraping are not supported (Meta ToS / API limits).
 *
 * Usage:
 *   npx tsx scripts/fetch-facebook-page-about.ts
 *   npx tsx scripts/fetch-facebook-page-about.ts --json > scratch/facebook-page-about.json
 *
 * Optional: append markdown file for biography pack:
 *   npx tsx scripts/fetch-facebook-page-about.ts --append docs/ingested/biography-scrapes/facebook-page-about.md
 */
import fs from "node:fs/promises";
import path from "node:path";

const GRAPH = "https://graph.facebook.com/v21.0";

/** Fields that often contain public-facing Page story / bio-adjacent copy. */
const FIELDS = [
  "name",
  "about",
  "description",
  "general_info",
  "website",
  "phone",
  "single_line_address",
  "emails",
  "link",
].join(",");

async function main() {
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim();
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  const argv = process.argv.slice(2);
  const appendPath = argv.includes("--append") ? argv[argv.indexOf("--append") + 1] : "";
  const jsonOnly = argv.includes("--json");

  if (!pageId || !token) {
    console.error(
      "Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN (Page token with pages_read_engagement or pages_show_list as required).",
    );
    process.exit(1);
  }

  const url = `${GRAPH}/${encodeURIComponent(pageId)}?fields=${encodeURIComponent(FIELDS)}&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const raw = await res.text();
  if (!res.ok) {
    console.error("Graph error:", raw.slice(0, 500));
    process.exit(1);
  }

  const data = JSON.parse(raw) as Record<string, unknown>;

  if (jsonOnly) {
    process.stdout.write(JSON.stringify(data, null, 2));
    return;
  }

  const lines = [
    "---",
    `fetched_at: ${new Date().toISOString()}`,
    "source: facebook_graph_page_metadata",
    "---",
    "",
    "# Facebook Page (Graph API)",
    "",
    "```json",
    JSON.stringify(data, null, 2),
    "```",
    "",
  ].join("\n");

  console.log(lines);

  if (appendPath) {
    const dir = path.dirname(appendPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(appendPath, `\n\n${lines}\n`, "utf8");
    console.error(`Appended to ${appendPath}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
