import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function parseEnv(filePath) {
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
    )
      val = val.slice(1, -1);
    out[m[1]] = val;
  }
  return out;
}
const env = { ...parseEnv(path.join(repoRoot, ".env")), ...parseEnv(path.join(repoRoot, ".env.local")) };
const key = (process.env.NASS_API_KEY || env.NASS_API_KEY || "").trim();

async function q(short) {
  const p = new URLSearchParams({
    key,
    format: "JSON",
    source_desc: "CENSUS",
    agg_level_desc: "COUNTY",
    state_alpha: "AR",
    county_code: "001",
    short_desc: short,
    year: "2022",
  });
  const r = await fetch(`https://quickstats.nass.usda.gov/api/api_GET/?${p}`);
  const j = r.status === 200 ? await r.json() : { data: [] };
  const rows = (j.data || []).map((x) => ({
    domain: x.domain_desc,
    short: x.short_desc,
    val: x.Value,
    unit: x.unit_desc,
    class: x.class_desc,
  }));
  console.log(JSON.stringify({ short, status: r.status, rows }, null, 2));
}

const shorts = [
  "CATTLE, INCL CALVES - INVENTORY",
  "CHICKENS, LAYERS - INVENTORY",
  "HOGS - INVENTORY",
  "LIVESTOCK, POULTRY, AND THEIR PRODUCTS - SALES, MEASURED IN $",
  "ANIMAL TOTALS, INCL PRODUCTS - SALES, MEASURED IN $",
  "CROP TOTALS - SALES, MEASURED IN $",
  "RICE - ACRES HARVESTED",
];
for (const s of shorts) {
  await q(s);
  await new Promise((r) => setTimeout(r, 200));
}
