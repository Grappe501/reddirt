/**
 * Generate density-expansion manifest for designated AR research counties.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const counties = [
  { fips: "05001", slug: "ARKANSAS", name: "Arkansas County" },
  { fips: "05141", slug: "VAN-BUREN", name: "Van Buren County" },
  { fips: "05129", slug: "SEARCY", name: "Searcy County" },
  { fips: "05093", slug: "MISSISSIPPI", name: "Mississippi County" },
  { fips: "05073", slug: "LAFAYETTE", name: "Lafayette County" },
  { fips: "05107", slug: "PHILLIPS", name: "Phillips County" },
  { fips: "05145", slug: "WHITE", name: "White County" },
];

const metrics = [
  {
    key: "CROP-SALES",
    series: "CROP_SALES",
    title: "crop sales",
    short_desc: "CROP TOTALS - SALES, MEASURED IN $",
    unit: "usd",
  },
  {
    key: "ANIMAL-PRODUCT-SALES",
    series: "ANIMAL_PRODUCT_SALES",
    title: "animal totals incl products sales",
    short_desc: "ANIMAL TOTALS, INCL PRODUCTS - SALES, MEASURED IN $",
    unit: "usd",
  },
  {
    key: "RICE-ACRES",
    series: "RICE_ACRES_HARVESTED",
    title: "rice acres harvested",
    short_desc: "RICE - ACRES HARVESTED",
    unit: "acres",
  },
  {
    key: "SOYBEAN-ACRES",
    series: "SOYBEAN_ACRES_HARVESTED",
    title: "soybean acres harvested",
    short_desc: "SOYBEANS - ACRES HARVESTED",
    unit: "acres",
  },
  {
    key: "COTTON-ACRES",
    series: "COTTON_ACRES_HARVESTED",
    title: "cotton acres harvested",
    short_desc: "COTTON - ACRES HARVESTED",
    unit: "acres",
  },
  {
    key: "CORN-GRAIN-ACRES",
    series: "CORN_GRAIN_ACRES_HARVESTED",
    title: "corn grain acres harvested",
    short_desc: "CORN, GRAIN - ACRES HARVESTED",
    unit: "acres",
  },
  {
    key: "WHEAT-ACRES",
    series: "WHEAT_ACRES_HARVESTED",
    title: "wheat acres harvested",
    short_desc: "WHEAT - ACRES HARVESTED",
    unit: "acres",
  },
  {
    key: "HAY-ACRES",
    series: "HAY_ACRES_HARVESTED",
    title: "hay and haylage acres harvested",
    short_desc: "HAY & HAYLAGE - ACRES HARVESTED",
    unit: "acres",
  },
  {
    key: "HOGS-INVENTORY",
    series: "HOGS_INVENTORY",
    title: "hogs inventory",
    short_desc: "HOGS - INVENTORY",
    unit: "head",
  },
  {
    key: "CATTLE-INCL-CALVES",
    series: "CATTLE_INCL_CALVES_INVENTORY",
    title: "cattle incl calves inventory",
    short_desc: "CATTLE, INCL CALVES - INVENTORY",
    unit: "head",
  },
  {
    key: "LAYERS-INVENTORY",
    series: "LAYERS_INVENTORY",
    title: "layer chicken inventory",
    short_desc: "CHICKENS, LAYERS - INVENTORY",
    unit: "head",
  },
];

const indicators = [];
for (const c of counties) {
  for (const m of metrics) {
    indicators.push({
      consumer_metric_id: `CC-COUNTY-NASS-${c.fips}-${m.key}`,
      title: `${c.name} ${m.title} (Census of Agriculture)`,
      source: "nass",
      dataset: "api_GET",
      series: m.series,
      geography: `county:${c.fips}`,
      period_start: "1997",
      period_end: "2022",
      facets: {
        source_desc: ["CENSUS"],
        short_desc: [m.short_desc],
        domain_desc: ["TOTAL"],
      },
      unit: m.unit,
      research_geo_note: c.slug,
      demand_ids: [
        "RCIP-DEM-0005",
        "RCIP-PASS-COUNTY-NASS-FARM-STRUCTURE-1.0",
        "RCIP-PASS-COUNTY-NASS-DENSITY-1.0",
      ],
      status: "approved_for_ingest",
    });
  }
}

const manifest = {
  version: "1.0",
  mission: "RCIP-PASS-COUNTY-NASS-FARM-STRUCTURE-DENSITY-1.0",
  consumer: "constitutional_capitalism",
  note: "Density expansion on designated AR research counties: crop/animal sales split, commodity acreage, and additional livestock inventories. Maximize reusable county evidence under existing rural/family-farm arguments. Structure ≠ capture. Disclosure suppressions expected.",
  distinction:
    "NASS can tell us what happened to agricultural structure. It cannot by itself tell us why it happened.",
  counties,
  indicators,
  still_blocked: [
    {
      id: "COUNTY_SALES_CLASS",
      reason: "Economic-class facets returned HTTP 400 at county agg_level in prior pass.",
    },
    {
      id: "COUNTY_TENURE_OPERATOR",
      reason: "Tenure/operator short_desc paths returned HTTP 400 in density probe.",
    },
    {
      id: "COUNTY_NET_CASH_GOV_ASSETS",
      reason: "Net cash income / government payments / asset-value short_desc paths returned HTTP 400 in density probe.",
    },
  ],
};

const out = path.join(
  root,
  "data/public-statistics/manifests/cc-county-nass-farm-structure-density-1.0.json",
);
writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ ok: true, path: out, indicators: indicators.length }, null, 2));
