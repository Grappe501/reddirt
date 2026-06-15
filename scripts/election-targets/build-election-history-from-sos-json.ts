/**
 * Build `data/election/arkansas-county-election-history.normalized.json` from official
 * Arkansas SOS election JSON files (precinct rows rolled up to county).
 *
 * Usage (from RedDirt/):
 *   npx tsx scripts/election-targets/build-election-history-from-sos-json.ts
 *
 * Optional env:
 *   SOS_ELECTION_JSON_DIR="H:\\SOSWebsite\\campaign information for ingestion\\electionResults"
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import type { CountyElectionHistoryRow } from "../../src/lib/election-targets/win-target-types";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data/election");
const DEFAULT_SOS_DIR = "H:\\SOSWebsite\\campaign information for ingestion\\electionResults";

type ContestCountyRow = {
  CountyName?: string;
  TotalVotes?: number;
  Candidates?: Array<{ PartyName?: string; TotalVotes?: number }>;
};

type ElectionJson = {
  ContestData?: Array<{
    ContestName?: string;
    Counties?: ContestCountyRow[];
  }>;
};

type CountyVoteAgg = { total: number; dem: number; rep: number };

function shortCountyName(displayName: string): string {
  return displayName.replace(/\s+County$/i, "").trim();
}

function sosCountyKey(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\./g, "")
    .replace(/\s+COUNTY$/i, "")
    .replace(/\s+/g, " ");
}

function buildCountyKeyToShortName(): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of ARKANSAS_COUNTY_REGISTRY) {
    const short = shortCountyName(c.displayName);
    map.set(sosCountyKey(short), short);
    map.set(sosCountyKey(c.displayName), short);
    map.set(sosCountyKey(c.slug.replace(/-county$/i, "").replace(/-/g, " ")), short);
  }
  return map;
}

function readElectionJson(filePath: string): ElectionJson {
  return JSON.parse(readFileSync(filePath, "utf8")) as ElectionJson;
}

function aggregateContestByCounty(
  json: ElectionJson,
  contestName: string,
  keyToShort: Map<string, string>,
  unmatched: Set<string>,
): Map<string, CountyVoteAgg> {
  const contest = json.ContestData?.find((c) => c.ContestName === contestName);
  if (!contest?.Counties?.length) {
    throw new Error(`Contest "${contestName}" not found`);
  }

  const byCounty = new Map<string, CountyVoteAgg>();
  for (const row of contest.Counties) {
    const raw = row.CountyName ?? "";
    const short = keyToShort.get(sosCountyKey(raw));
    if (!short) {
      unmatched.add(raw);
      continue;
    }
    const cur = byCounty.get(short) ?? { total: 0, dem: 0, rep: 0 };
    cur.total += row.TotalVotes ?? 0;
    for (const cand of row.Candidates ?? []) {
      const party = cand.PartyName ?? "";
      if (/democratic/i.test(party)) {
        cur.dem += cand.TotalVotes ?? 0;
      } else if (/republican/i.test(party)) {
        cur.rep += cand.TotalVotes ?? 0;
      }
    }
    byCounty.set(short, cur);
  }
  return byCounty;
}

function main() {
  const sosDir = process.env.SOS_ELECTION_JSON_DIR ?? DEFAULT_SOS_DIR;
  if (!existsSync(sosDir)) {
    console.error(`SOS election JSON directory not found: ${sosDir}`);
    process.exit(1);
  }

  const files = {
    general2016: path.join(sosDir, "2016_General.json"),
    general2018: path.join(sosDir, "2018_General.json"),
    general2020: path.join(sosDir, "2020_General.json"),
    general2022: path.join(sosDir, "2022_General.json"),
    general2024: path.join(sosDir, "2024_General.json"),
  };
  for (const [label, fp] of Object.entries(files)) {
    if (!existsSync(fp)) {
      console.error(`Missing ${label}: ${fp}`);
      process.exit(1);
    }
  }

  const json2016 = readElectionJson(files.general2016);
  const json2018 = readElectionJson(files.general2018);
  const json2020 = readElectionJson(files.general2020);
  const json2022 = readElectionJson(files.general2022);
  const json2024 = readElectionJson(files.general2024);

  const keyToShort = buildCountyKeyToShortName();
  const unmatched = new Set<string>();

  const pres2016 = aggregateContestByCounty(
    json2016,
    "U.S. President & Vice President",
    keyToShort,
    unmatched,
  );
  const sos2018 = aggregateContestByCounty(json2018, "Secretary of State", keyToShort, unmatched);
  const pres2020 = aggregateContestByCounty(
    json2020,
    "U.S. President, Vice President",
    keyToShort,
    unmatched,
  );
  const sos2022 = aggregateContestByCounty(json2022, "Secretary of State", keyToShort, unmatched);
  const treas2022 = aggregateContestByCounty(json2022, "State Treasurer", keyToShort, unmatched);
  const treas2024 = aggregateContestByCounty(json2024, "State Treasurer", keyToShort, unmatched);
  const pres2024 = aggregateContestByCounty(json2024, "U.S. President", keyToShort, unmatched);

  const rows: CountyElectionHistoryRow[] = [];
  const missingCounties: string[] = [];

  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const p16 = pres2016.get(county);
    const s18 = sos2018.get(county);
    const p20 = pres2020.get(county);
    const sos = sos2022.get(county);
    const t22 = treas2022.get(county);
    const t24 = treas2024.get(county);
    const p24 = pres2024.get(county);

    if (!p16 || !s18 || !p20 || !sos || !t22 || !t24 || !p24) {
      missingCounties.push(county);
    }

    rows.push({
      county,
      presidential2016TotalVotes: p16?.total,
      presidential2016DemVotes: p16?.dem,
      presidential2016RepVotes: p16?.rep,
      sos2018TotalVotes: s18?.total,
      sos2018DemVotes: s18?.dem,
      sos2018RepVotes: s18?.rep,
      presidential2020TotalVotes: p20?.total,
      presidential2020DemVotes: p20?.dem,
      presidential2020RepVotes: p20?.rep,
      sos2022TotalVotes: sos?.total,
      sos2022DemVotes: sos?.dem,
      sos2022RepVotes: sos?.rep,
      treasurer2022TotalVotes: t22?.total,
      treasurer2022DemVotes: t22?.dem,
      treasurer2024TotalVotes: t24?.total,
      treasurer2024DemVotes: t24?.dem,
      presidential2024TotalVotes: p24?.total,
      presidential2024DemVotes: p24?.dem,
      presidential2024RepVotes: p24?.rep,
    });
  }

  rows.sort((a, b) => a.county.localeCompare(b.county));

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, "arkansas-county-election-history.normalized.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        version: 2,
        generatedAt: new Date().toISOString(),
        sourceNote:
          "Official Arkansas SOS election JSON — precinct rows aggregated to county. Presidential 2016/2020/2024, SOS 2018/2022, Treasurer 2022/2024.",
        sourceFiles: files,
        rows,
      },
      null,
      2,
    ),
    "utf8",
  );

  if (unmatched.size > 0) {
    console.warn(`Unmatched SOS county labels (${unmatched.size}):`, [...unmatched].slice(0, 10).join(", "));
  }
  if (missingCounties.length > 0) {
    console.warn(`Registry counties missing a race leg (${missingCounties.length}):`, missingCounties.join(", "));
  }

  let dropOffTotal = 0;
  for (const row of rows) {
    const pres = row.presidential2024DemVotes ?? 0;
    const mid = row.sos2022DemVotes ?? 0;
    if (pres > mid) dropOffTotal += pres - mid;
  }

  // eslint-disable-next-line no-console
  console.log(
    `Wrote ${outPath} (${rows.length} counties). 2024 pres vs 2022 SOS D drop-off statewide: ${dropOffTotal.toLocaleString()} votes.`,
  );
}

main();
