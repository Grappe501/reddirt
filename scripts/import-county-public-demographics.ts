/**
 * Import aggregate CountyPublicDemographics from CSV. No PII, no individual voters.
 * Usage: npx tsx scripts/import-county-public-demographics.ts --file <path> [--dry-run]
 */
import { readFileSync } from "node:fs";
import { PublicDemographicsSource } from "@prisma/client";
import { prisma } from "../src/lib/db";

function parseArgs() {
  const a = process.argv.slice(2);
  let file = "";
  let dry = false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === "--file" && a[i + 1]) {
      file = a[i + 1]!;
      i += 1;
    } else if (a[i] === "--dry-run") {
      dry = true;
    }
  }
  return { file, dry };
}

function parseLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i]!;
    if (c === '"') {
      q = !q;
    } else if (!q && c === delim) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim().replace(/^"|"$/g, ""));
}

function toNum(s: string): number | null {
  if (!s || s.length === 0) return null;
  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseJson(s: string): unknown {
  if (!s || !s.trim().length) return undefined;
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return undefined;
  }
}

function mapSource(s: string): PublicDemographicsSource {
  const u = s.toUpperCase();
  if (u.includes("DECENNIAL")) return "CENSUS_DECENNIAL";
  if (u.includes("BLS") || u.includes("ACS")) return "CENSUS_ACS";
  return "MANUAL";
}

async function main() {
  const { file, dry } = parseArgs();
  if (!file) {
    console.error("Usage: --file path/to.csv [--dry-run]");
    process.exit(1);
  }
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) {
    console.error("CSV needs header + at least one data row");
    process.exit(1);
  }
  const header = parseLine(lines[0]!, ",").map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());
  const need = [
    "countyname",
    "countyfips",
    "source",
    "sourceyear",
    "population",
    "medianincome",
    "povertyrate",
    "bachelorsplusrate",
    "under18rate",
    "over65rate",
    "unemploymentrate",
    "topindustriesjson",
    "raceethnicityjson",
    "notes",
  ] as const;
  for (const n of need) {
    if (header.indexOf(n) < 0) {
      console.error(`Missing column: ${n}`);
      process.exit(1);
    }
  }

  let ok = 0;
  for (let r = 1; r < lines.length; r += 1) {
    const cells = parseLine(lines[r]!, ",");
    if (cells.length < header.length) continue;
    const fips = (cells[idx("countyfips")] ?? "").replace(/\D/g, "").padStart(5, "0");
    const c = await prisma.county.findFirst({ where: { fips } });
    if (!c) {
      console.warn(`Row ${r + 1}: no County for FIPS ${fips} — skip`);
      continue;
    }
    const asOf = toNum(cells[idx("sourceyear")] ?? "") ?? new Date().getUTCFullYear();
    const topInd = parseJson(cells[idx("topindustriesjson")] ?? "");
    const race = parseJson(cells[idx("raceethnicityjson")] ?? "");
    const u18 = toNum(cells[idx("under18rate")] ?? "");
    const o65 = toNum(cells[idx("over65rate")] ?? "");
    const ageBands =
      u18 != null || o65 != null ? { under18RatePercent: u18, over65RatePercent: o65 } : undefined;

    const payload: Record<string, unknown> = {
      source: mapSource(cells[idx("source")] ?? "CENSUS_ACS"),
      sourceDetail: cells[idx("notes")] ?? "import-county-public-demographics",
      asOfYear: Math.floor(asOf),
      population: toNum(cells[idx("population")] ?? ""),
      medianHouseholdIncome: toNum(cells[idx("medianincome")] ?? "") ?? null,
      povertyRatePercent: toNum(cells[idx("povertyrate")] ?? "") ?? null,
      bachelorsOrHigherPercent: toNum(cells[idx("bachelorsplusrate")] ?? "") ?? null,
      unemploymentRatePercent: toNum(cells[idx("unemploymentrate")] ?? "") ?? null,
      laborEmploymentNote: (cells[idx("notes")] ?? null) || null,
      fetchedAt: new Date(),
    };
    if (topInd != null) payload.blsIndustryMixJson = topInd;
    if (race != null) payload.raceEthnicityJson = race;
    if (ageBands != null) payload.ageBandsJson = ageBands;
    if (dry) {
      console.log("DRY row", c.displayName, fips, payload.population, payload.asOfYear);
    } else {
      await prisma.countyPublicDemographics.upsert({
        where: { countyId: c.id },
        create: { countyId: c.id, ...payload, reviewStatus: "PENDING_REVIEW" } as never,
        update: payload as never,
      });
    }
    ok += 1;
  }
  console.log(dry ? `Dry-run complete (${ok} valid row(s) out of data lines).` : `Upserted ${ok} row(s).`);
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
