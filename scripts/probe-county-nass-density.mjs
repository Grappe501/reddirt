/**
 * Probe additional county Census short_desc series for density expansion.
 * Presence/counts only — never prints API key.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/s);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

const env = {
  ...parseEnvFile(path.join(repoRoot, ".env")),
  ...parseEnvFile(path.join(repoRoot, ".env.local")),
};
const key = (process.env.NASS_API_KEY || env.NASS_API_KEY || "").trim();
if (!key || key.length < 8) {
  console.error(JSON.stringify({ ok: false, error: "NASS_API_KEY missing" }));
  process.exit(1);
}

const counties = ["001", "141", "129", "093", "073", "107", "145"];
const candidates = [
  { id: "CROPLAND_HARVESTED", short_desc: "CROPLAND - ACRES HARVESTED" },
  { id: "IRRIGATED_ACRES", short_desc: "IRRIGATED LAND - ACRES" },
  { id: "AVG_FARM_SIZE", short_desc: "FARM OPERATIONS - AVG SIZE OF FARM, MEASURED IN ACRES" },
  { id: "NET_CASH_FARM_INCOME", short_desc: "INCOME, NET CASH FARM - MEASURED IN $" },
  { id: "GOV_PAYMENTS", short_desc: "GOVERNMENT PROGRAMS - RECEIPTS, MEASURED IN $" },
  { id: "AG_LAND_ASSET_VALUE", short_desc: "AG LAND - ASSET VALUE, MEASURED IN $" },
  { id: "MACHINERY_ASSET_VALUE", short_desc: "MACHINERY & EQUIPMENT - ASSET VALUE, MEASURED IN $" },
  { id: "RICE_ACRES", short_desc: "RICE - ACRES HARVESTED" },
  { id: "SOYBEAN_ACRES", short_desc: "SOYBEANS - ACRES HARVESTED" },
  { id: "COTTON_ACRES", short_desc: "COTTON - ACRES HARVESTED" },
  { id: "CORN_GRAIN_ACRES", short_desc: "CORN, GRAIN - ACRES HARVESTED" },
  { id: "WHEAT_ACRES", short_desc: "WHEAT - ACRES HARVESTED" },
  { id: "HAY_ACRES", short_desc: "HAY & HAYLAGE - ACRES HARVESTED" },
  { id: "HOGS_INVENTORY", short_desc: "HOGS - INVENTORY" },
  { id: "CATTLE_INCL_CALVES", short_desc: "CATTLE, INCL CALVES - INVENTORY" },
  { id: "LAYERS_INVENTORY", short_desc: "CHICKENS, LAYERS - INVENTORY" },
  { id: "DIRECT_SALES", short_desc: "COMMODITY TOTALS - SALES, MEASURED IN $ DIRECTLY MARKETED" },
  { id: "FULL_OWNERS_OPS", short_desc: "FARM OPERATIONS - NUMBER OF OPERATIONS BY TENURE: FULL OWNERS" },
  { id: "TENANTS_OPS", short_desc: "FARM OPERATIONS - NUMBER OF OPERATIONS BY TENURE: TENANTS" },
  {
    id: "CROP_SALES",
    short_desc: "CROP TOTALS - SALES, MEASURED IN $",
  },
  {
    id: "LIVESTOCK_SALES",
    short_desc: "ANIMAL TOTALS - SALES, MEASURED IN $",
  },
];

async function probe(countyCode, shortDesc) {
  const params = new URLSearchParams({
    key,
    format: "JSON",
    source_desc: "CENSUS",
    agg_level_desc: "COUNTY",
    state_alpha: "AR",
    county_code: countyCode,
    short_desc: shortDesc,
    year__GE: "1997",
    year__LE: "2022",
  });
  const url = `https://quickstats.nass.usda.gov/api/api_GET/?${params}`;
  try {
    const res = await fetch(url);
    if (res.status !== 200) {
      return { status: res.status, count: 0, years: [] };
    }
    const json = await res.json();
    const rows = json.data || [];
    const years = [...new Set(rows.map((r) => String(r.year)))].sort();
    const usable = rows.filter((r) => {
      const v = String(r.Value || "").trim();
      return v && !/^\([A-Z]\)$/i.test(v) && v !== "(D)" && v !== "(Z)";
    });
    return {
      status: 200,
      count: rows.length,
      usable: usable.length,
      years,
      sample_domain: rows[0]?.domain_desc || null,
      sample_short: rows[0]?.short_desc || null,
    };
  } catch (e) {
    return { status: "err", error: e instanceof Error ? e.message : String(e) };
  }
}

const results = [];
// Probe on Arkansas + Van Buren first (contrast pair), then expand winners to all counties.
for (const c of ["001", "141"]) {
  for (const cand of candidates) {
    const r = await probe(c, cand.short_desc);
    results.push({ county: c, ...cand, ...r });
    await new Promise((x) => setTimeout(x, 250));
  }
}

const winners = candidates.filter((cand) => {
  const hits = results.filter((r) => r.id === cand.id && r.status === 200 && r.usable > 0);
  return hits.length >= 1;
});

const outDir = path.join(repoRoot, ".local", "temp");
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "county-nass-density-probe.json");
writeFileSync(
  outPath,
  JSON.stringify({ probed_at: new Date().toISOString(), results, winners }, null, 2),
);

console.log(
  JSON.stringify(
    {
      ok: true,
      winner_count: winners.length,
      winners: winners.map((w) => w.id),
      summary: results.map((r) => ({
        county: r.county,
        id: r.id,
        status: r.status,
        usable: r.usable || 0,
        years: r.years || [],
      })),
      outPath,
    },
    null,
    2,
  ),
);
