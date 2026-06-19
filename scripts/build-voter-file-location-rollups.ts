/**
 * Build aggregate county/city rollups from Arkansas SOS VR.csv + VH.csv.
 * Output: data/election/voter-file-location-rollups.json (no PII).
 *
 * Usage:
 *   npm run voter-file-location-rollups:build
 *   npm run voter-file-location-rollups:build -- --vr ../voter_files/VR.csv --vh ../voter_files/VH.csv
 */
import { createReadStream } from "node:fs";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";

import { ARKANSAS_TOP_100_CITIES } from "./strategic-plan/data/arkansas-top-40-cities";
import {
  AR_SOS_VR_COLUMNS,
  FEATURED_CONTEST_KEYS,
  getIndexedCell,
  normalizePartyCode,
  normalizePrimaryBallotParty,
  parseVhElectionColumns,
  parseVrHeaderLine,
  resolveCountySlugFromVrCountyCell,
  slugifyPlaceName,
} from "../src/lib/voter-file/arkansas-sos-rollups";
import { parseDelimitedLine } from "../src/lib/voter-file/sos-voter-csv";
import type {
  ParticipationRollup,
  PartyRegistrationCounts,
  RegistrationRollup,
  VoterFileCityRollup,
  VoterFileCountyRollup,
  VoterFileLocationRollupsFile,
} from "../src/lib/voter-file/location-rollups-types";

const ROOT = process.cwd();
const DEFAULT_VR = path.resolve(ROOT, "../voter_files/VR.csv");
const DEFAULT_VH = path.resolve(ROOT, "../voter_files/VH.csv");
const OUT_PATH = path.join(ROOT, "data/election/voter-file-location-rollups.json");

type VoterLoc = {
  countySlug: string;
  citySlug: string | null;
  cityName: string;
};

type MutableParty = PartyRegistrationCounts;
type MutableParticipation = Map<string, { label: string; participated: number; dem: number; rep: number; other: number }>;

type Bucket = {
  registration: { total: number; active: number; inactive: number; party: MutableParty };
  participation: MutableParticipation;
  cityName?: string;
  citySlug?: string | null;
  isPriorityCity?: boolean;
};

function emptyParty(): MutableParty {
  return { democrat: 0, republican: 0, other: 0, blank: 0 };
}

function emptyBucket(): Bucket {
  return {
    registration: { total: 0, active: 0, inactive: 0, party: emptyParty() },
    participation: new Map(),
  };
}

function bumpRegistration(bucket: Bucket, status: string, partyRaw: string) {
  bucket.registration.total += 1;
  const active = status.toUpperCase() === "A";
  if (active) bucket.registration.active += 1;
  else bucket.registration.inactive += 1;
  const party = normalizePartyCode(partyRaw);
  bucket.registration.party[party] += 1;
}

function bumpParticipation(
  bucket: Bucket,
  contestKey: string,
  label: string,
  voted: boolean,
  primaryParty: "dem" | "rep" | "other" | null,
) {
  if (!voted) return;
  let row = bucket.participation.get(contestKey);
  if (!row) {
    row = { label, participated: 0, dem: 0, rep: 0, other: 0 };
    bucket.participation.set(contestKey, row);
  }
  row.participated += 1;
  if (primaryParty === "dem") row.dem += 1;
  else if (primaryParty === "rep") row.rep += 1;
  else if (primaryParty === "other") row.other += 1;
}

function toRegistrationRollup(b: Bucket): RegistrationRollup {
  return {
    total: b.registration.total,
    active: b.registration.active,
    inactive: b.registration.inactive,
    party: { ...b.registration.party },
  };
}

function toParticipationRollup(participation: MutableParticipation): ParticipationRollup[] {
  return [...participation.entries()]
    .map(([contestKey, row]) => {
      const out: ParticipationRollup = {
        contestKey,
        label: row.label,
        participated: row.participated,
      };
      if (row.dem || row.rep || row.other) {
        out.demPrimaryBallot = row.dem;
        out.repPrimaryBallot = row.rep;
        out.otherPrimaryBallot = row.other;
      }
      return out;
    })
    .sort((a, b) => b.contestKey.localeCompare(a.contestKey));
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function buildCityIndex(): Map<string, { slug: string; name: string; countySlug: string }> {
  const m = new Map<string, { slug: string; name: string; countySlug: string }>();
  for (const c of ARKANSAS_TOP_100_CITIES) {
    const countySlug = slugifyPlaceName(c.county);
    const keys = [
      `${countySlug}|${slugifyPlaceName(c.name)}`,
      `${countySlug}|${c.name.trim().toUpperCase()}`,
    ];
    for (const k of keys) {
      m.set(k, { slug: c.slug, name: c.name, countySlug });
    }
  }
  return m;
}

function resolveCity(countySlug: string, cityRaw: string, cityIndex: Map<string, { slug: string; name: string }>): {
  citySlug: string | null;
  cityName: string;
  isPriority: boolean;
} {
  const trimmed = cityRaw.trim();
  const cityName = trimmed || "Unassigned";
  if (!trimmed) return { citySlug: null, cityName, isPriority: false };

  const slug = slugifyPlaceName(trimmed);
  const hit = cityIndex.get(`${countySlug}|${slug}`) ?? cityIndex.get(`${countySlug}|${trimmed.toUpperCase()}`);
  if (hit) return { citySlug: hit.slug, cityName: hit.name, isPriority: true };

  return { citySlug: slug, cityName: trimmed, isPriority: false };
}

async function streamVr(
  vrPath: string,
  voterLocs: Map<string, VoterLoc>,
  countyBuckets: Map<string, Bucket & { countyName: string; fips: string }>,
  cityBuckets: Map<string, Bucket>,
  cityIndex: Map<string, { slug: string; name: string; countySlug: string }>,
): Promise<number> {
  const rl = createInterface({ input: createReadStream(vrPath, { encoding: "utf8" }), crlfDelay: Infinity });
  let headerParsed = false;
  let delimiter = ",";
  let index = new Map<string, number>();
  let rowCount = 0;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!headerParsed) {
      const h = parseVrHeaderLine(trimmed);
      delimiter = h.delimiter;
      index = h.index;
      headerParsed = true;
      continue;
    }

    const cells = trimmed.startsWith('"')
      ? parseDelimitedLine(trimmed, delimiter)
      : trimmed.split(delimiter).map((c) => c.trim().replace(/^"(.*)"$/, "$1"));

    const voterId = getIndexedCell(cells, index, AR_SOS_VR_COLUMNS.voterId);
    if (!voterId) continue;

    const countyCell = getIndexedCell(cells, index, AR_SOS_VR_COLUMNS.county);
    const countyResolved = resolveCountySlugFromVrCountyCell(countyCell);
    if (!countyResolved) continue;

    const { countySlug, countyName, fips } = countyResolved;
    const status = getIndexedCell(cells, index, AR_SOS_VR_COLUMNS.status);
    const party = getIndexedCell(cells, index, AR_SOS_VR_COLUMNS.party);
    const cityRaw = getIndexedCell(cells, index, AR_SOS_VR_COLUMNS.city);
    const { citySlug, cityName, isPriority } = resolveCity(countySlug, cityRaw, cityIndex);

    voterLocs.set(voterId, { countySlug, citySlug, cityName });
    rowCount += 1;

    let countyBucket = countyBuckets.get(countySlug);
    if (!countyBucket) {
      countyBucket = { ...emptyBucket(), countyName, fips };
      countyBuckets.set(countySlug, countyBucket);
    }
    bumpRegistration(countyBucket, status, party);

    const cityKey = citySlug ?? `_raw:${slugifyPlaceName(cityName)}`;
    const cityBucketKey = `${countySlug}|${cityKey}`;
    let cityBucket = cityBuckets.get(cityBucketKey);
    if (!cityBucket) {
      cityBucket = {
        ...emptyBucket(),
        cityName,
        citySlug,
        isPriorityCity: isPriority,
      };
      cityBuckets.set(cityBucketKey, cityBucket);
    }
    bumpRegistration(cityBucket, status, party);
  }

  return rowCount;
}

async function streamVh(
  vhPath: string,
  voterLocs: Map<string, VoterLoc>,
  countyBuckets: Map<string, Bucket>,
  cityBuckets: Map<string, Bucket>,
): Promise<{ rowCount: number; matched: number }> {
  const rl = createInterface({ input: createReadStream(vhPath, { encoding: "utf8" }), crlfDelay: Infinity });
  let headerParsed = false;
  let delimiter = ",";
  let headers: string[] = [];
  let electionCols: ReturnType<typeof parseVhElectionColumns> = [];
  let voterIdIdx = -1;
  let rowCount = 0;
  let matched = 0;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!headerParsed) {
      const h = parseVrHeaderLine(trimmed);
      delimiter = h.delimiter;
      headers = h.headers;
      electionCols = parseVhElectionColumns(headers);
      voterIdIdx = h.index.get("voterid") ?? h.index.get("key_registrant") ?? -1;
      headerParsed = true;
      continue;
    }

    const cells = trimmed.startsWith('"')
      ? parseDelimitedLine(trimmed, delimiter)
      : trimmed.split(delimiter).map((c) => c.trim().replace(/^"(.*)"$/, "$1"));

    const voterId = voterIdIdx >= 0 ? (cells[voterIdIdx] ?? "").trim() : "";
    if (!voterId) continue;
    rowCount += 1;

    const loc = voterLocs.get(voterId);
    if (!loc) continue;
    matched += 1;

    const countyBucket = countyBuckets.get(loc.countySlug);
    if (!countyBucket) continue;

    const cityKey = loc.citySlug ?? `_raw:${slugifyPlaceName(loc.cityName)}`;
    const cityBucket = cityBuckets.get(`${loc.countySlug}|${cityKey}`);

    for (const col of electionCols) {
      const participatedRaw = (cells[col.participationIdx] ?? "").trim();
      const voted = participatedRaw.length > 0;
      if (!voted) continue;
      const partyRaw =
        col.partyVotedIdx != null ? (cells[col.partyVotedIdx] ?? "").trim() : "";
      const primaryParty = col.partyVotedIdx != null ? normalizePrimaryBallotParty(partyRaw) : null;
      bumpParticipation(countyBucket, col.contestKey, col.label, true, primaryParty);
      if (cityBucket) bumpParticipation(cityBucket, col.contestKey, col.label, true, primaryParty);
    }
  }

  return { rowCount, matched };
}

async function main() {
  const vrPath = path.resolve(arg("--vr") ?? process.env.VOTER_FILE_VR_PATH ?? DEFAULT_VR);
  const vhPath = path.resolve(arg("--vh") ?? process.env.VOTER_FILE_VH_PATH ?? DEFAULT_VH);

  if (!existsSync(vrPath)) {
    console.error(`VR file not found: ${vrPath}`);
    process.exit(1);
  }
  if (!existsSync(vhPath)) {
    console.error(`VH file not found: ${vhPath}`);
    process.exit(1);
  }

  console.log(`Reading VR: ${vrPath}`);
  console.log(`Reading VH: ${vhPath}`);

  const cityIndex = buildCityIndex();
  const voterLocs = new Map<string, VoterLoc>();
  const countyBuckets = new Map<string, Bucket & { countyName: string; fips: string }>();
  const cityBuckets = new Map<string, Bucket>();

  const vrRowCount = await streamVr(vrPath, voterLocs, countyBuckets, cityBuckets, cityIndex);
  console.log(`VR rows processed: ${vrRowCount.toLocaleString()}`);

  const { rowCount: vhRowCount, matched } = await streamVh(vhPath, voterLocs, countyBuckets, cityBuckets);
  console.log(`VH rows processed: ${vhRowCount.toLocaleString()} (${matched.toLocaleString()} matched to VR)`);

  voterLocs.clear();

  const counties: Record<string, VoterFileCountyRollup> = {};
  const cities: Record<string, VoterFileCityRollup> = {};

  for (const [countySlug, bucket] of countyBuckets) {
    const cityRollups: VoterFileCityRollup[] = [];
    let unmappedCityCount = 0;

    for (const [key, cityBucket] of cityBuckets) {
      if (!key.startsWith(`${countySlug}|`)) continue;
      const citySlug = cityBucket.citySlug ?? null;
      if (!cityBucket.isPriorityCity) unmappedCityCount += 1;
      const rollup: VoterFileCityRollup = {
        citySlug,
        cityName: cityBucket.cityName ?? "Unknown",
        isPriorityCity: cityBucket.isPriorityCity ?? false,
        registration: toRegistrationRollup(cityBucket),
        participation: toParticipationRollup(cityBucket.participation),
      };
      cityRollups.push(rollup);
      if (citySlug && cityBucket.isPriorityCity) {
        cities[citySlug] = rollup;
      }
    }

    cityRollups.sort((a, b) => b.registration.total - a.registration.total);

    counties[countySlug] = {
      countySlug,
      countyName: bucket.countyName,
      fips: bucket.fips,
      registration: toRegistrationRollup(bucket),
      participation: toParticipationRollup(bucket.participation),
      cities: cityRollups.slice(0, 40),
      unmappedCityCount,
    };
  }

  const out: VoterFileLocationRollupsFile = {
    builtAt: new Date().toISOString(),
    sourceFiles: {
      vrPath,
      vhPath,
      vrRowCount,
      vhRowCount,
      votersMatchedInHistory: matched,
    },
    featuredContests: [...FEATURED_CONTEST_KEYS],
    counties,
    cities,
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT_PATH} (${Object.keys(counties).length} counties, ${Object.keys(cities).length} priority cities)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
