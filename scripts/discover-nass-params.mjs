/**
 * Discover valid NASS short_desc / domaincat values for Pass 9 repairs.
 * Never prints API keys.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function loadKey() {
  for (const f of [".env", ".env.local"]) {
    const p = path.join(repoRoot, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^(?:NASS_API_KEY|USDA_NASS_API_KEY)\s*=\s*(.*)$/);
      if (!m) continue;
      let v = m[1].trim().replace(/^["']|["']$/g, "");
      if (v.length >= 8) return v;
    }
  }
  throw new Error("NASS key missing");
}

async function apiGet(params) {
  const key = loadKey();
  const u = new URL("https://quickstats.nass.usda.gov/api/api_GET/");
  u.searchParams.set("key", key);
  u.searchParams.set("format", "JSON");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = await fetch(u);
  const text = await res.text();
  let data = [];
  try {
    data = JSON.parse(text).data || [];
  } catch {
    /* ignore */
  }
  return { status: res.status, count: data.length, sample: data.slice(0, 3), text: text.slice(0, 180) };
}

async function getCounts(params) {
  const key = loadKey();
  const u = new URL("https://quickstats.nass.usda.gov/api/get_counts/");
  u.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = await fetch(u);
  const j = await res.json().catch(() => ({}));
  return { status: res.status, count: j.count != null ? Number(j.count) : null, err: j.error || null };
}

const probes = [
  {
    name: "land_acres_loose",
    params: {
      source_desc: "CENSUS",
      commodity_desc: "AG LAND",
      statisticcat_desc: "AREA",
      unit_desc: "ACRES",
      domain_desc: "TOTAL",
      agg_level_desc: "STATE",
      state_alpha: "AR",
      year: "2022",
    },
  },
  {
    name: "farm_acres_operated",
    params: {
      source_desc: "CENSUS",
      short_desc: "FARM OPERATIONS - ACRES OPERATED",
      domain_desc: "TOTAL",
      agg_level_desc: "STATE",
      state_alpha: "AR",
      year: "2022",
    },
  },
  {
    name: "sales_commodity_totals",
    params: {
      source_desc: "CENSUS",
      commodity_desc: "COMMODITY TOTALS",
      statisticcat_desc: "SALES",
      domain_desc: "TOTAL",
      agg_level_desc: "STATE",
      state_alpha: "AR",
      year: "2022",
    },
  },
  {
    name: "broilers_loose",
    params: {
      source_desc: "CENSUS",
      commodity_desc: "CHICKENS",
      class_desc: "BROILERS",
      statisticcat_desc: "INVENTORY",
      domain_desc: "TOTAL",
      agg_level_desc: "STATE",
      state_alpha: "AR",
      year: "2022",
    },
  },
  {
    name: "cattle_loose",
    params: {
      source_desc: "CENSUS",
      commodity_desc: "CATTLE",
      statisticcat_desc: "INVENTORY",
      domain_desc: "TOTAL",
      agg_level_desc: "STATE",
      state_alpha: "AR",
      year: "2022",
    },
  },
  {
    name: "econ_class_loose",
    params: {
      source_desc: "CENSUS",
      commodity_desc: "FARM OPERATIONS",
      short_desc: "FARM OPERATIONS - NUMBER OF OPERATIONS",
      domain_desc: "ECONOMIC CLASS",
      agg_level_desc: "STATE",
      state_alpha: "AR",
      year: "2022",
    },
  },
];

const out = [];
for (const p of probes) {
  const counts = await getCounts(p.params);
  let get = null;
  if (counts.count != null && counts.count > 0 && counts.count < 500) {
    get = await apiGet(p.params);
  }
  out.push({
    name: p.name,
    counts,
    short_descs: get
      ? [...new Set(get.sample.map((r) => r.short_desc))]
      : null,
    domaincats: get
      ? [...new Set((await apiGet(p.params)).sample.concat([]).map((r) => r.domaincat_desc))].slice(0, 20)
      : null,
    sample_short:
      get?.sample?.map((r) => ({
        short_desc: r.short_desc,
        domaincat_desc: r.domaincat_desc,
        Value: r.Value,
        unit_desc: r.unit_desc,
        class_desc: r.class_desc,
      })) || null,
    get_status: get?.status,
    get_text: get?.status !== 200 ? get?.text : undefined,
  });
}

// For economic class, pull more domaincats if count small
{
  const params = {
    source_desc: "CENSUS",
    commodity_desc: "FARM OPERATIONS",
    short_desc: "FARM OPERATIONS - NUMBER OF OPERATIONS",
    domain_desc: "ECONOMIC CLASS",
    agg_level_desc: "STATE",
    state_alpha: "AR",
    year: "2022",
  };
  const full = await apiGet(params);
  if (full.status === 200) {
    const all = JSON.parse(
      (
        await (async () => {
          const key = loadKey();
          const u = new URL("https://quickstats.nass.usda.gov/api/api_GET/");
          u.searchParams.set("key", key);
          u.searchParams.set("format", "JSON");
          for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
          return (await fetch(u)).text();
        })()
      ),
    ).data;
    out.push({
      name: "econ_class_all_domaincats",
      domaincats: [...new Set(all.map((r) => r.domaincat_desc))],
      rows: all.map((r) => ({ domaincat_desc: r.domaincat_desc, Value: r.Value })),
    });
  }
}

console.log(JSON.stringify(out, null, 2));
