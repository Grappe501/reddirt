import fs from "node:fs/promises";
import path from "node:path";
import { clerkVoteXmlUrl, supportedYears, HILL_MEMBER } from "./house-rollcall-source";
import { normalizeHouseRollCall } from "../lib/normalize-house-rollcall";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "generated");

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": "FrenchHillVoteTracker/0.1 (+public-record research)" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

function extractRollNumbers(indexHtml: string): number[] {
  const found = new Set<number>();
  const regex = /(?:Votes\/\d{4}|roll)(\d{1,3})/gi;
  for (const match of indexHtml.matchAll(regex)) found.add(Number(match[1]));
  return [...found].filter(Number.isFinite).sort((a, b) => a - b);
}

async function ingestYear(year: number) {
  const indexUrl = `https://clerk.house.gov/evs/${year}/index.asp`;
  const indexHtml = await fetchText(indexUrl);
  const rolls = extractRollNumbers(indexHtml);
  const records = [];

  for (const rollCall of rolls) {
    const xmlUrl = clerkVoteXmlUrl(year, rollCall);
    try {
      const xml = await fetchText(xmlUrl);
      const normalized = normalizeHouseRollCall({ year, rollCall, xml, sourceUrl: xmlUrl, hill: HILL_MEMBER });
      if (normalized) records.push(normalized);
    } catch (error) {
      console.warn(`Skipping ${year} roll ${rollCall}:`, error instanceof Error ? error.message : error);
    }
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, `hill-votes-${year}.json`), JSON.stringify(records, null, 2));
  return { year, count: records.length };
}

async function main() {
  const requested = process.argv.slice(2).map(Number).filter(Number.isFinite);
  const years = requested.length ? requested : supportedYears();
  const summary = [];
  for (const year of years) summary.push(await ingestYear(year));
  await fs.writeFile(path.join(OUT_DIR, "ingest-summary.json"), JSON.stringify(summary, null, 2));
  console.log(summary);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
