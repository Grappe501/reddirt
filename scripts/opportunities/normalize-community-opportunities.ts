/**
 * Normalize raw opportunities: coords, deterministic scores, CSV export.
 * Run: npm run opportunities:normalize
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";

import type { CommunityOpportunity } from "@/lib/opportunities/community-opportunity-types";
import { approxCountyCenter } from "@/lib/opportunities/approx-county-center";
import { scoreOpportunity } from "@/lib/opportunities/opportunity-scoring";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
loadEnvConfig(root);

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: CommunityOpportunity[]): string {
  const headers = [
    "id",
    "type",
    "title",
    "county",
    "city",
    "lat",
    "lng",
    "startAt",
    "verificationStatus",
    "campaignValue",
    "scoreTotal",
    "routeCluster",
    "sourceType",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const lat = r.lat ?? "";
    const lng = r.lng ?? "";
    const score = r.score?.total ?? "";
    lines.push(
      [
        csvEscape(r.id),
        csvEscape(r.type),
        csvEscape(r.title),
        csvEscape(r.county),
        csvEscape(r.city ?? ""),
        lat,
        lng,
        csvEscape(r.startAt ?? ""),
        csvEscape(r.verificationStatus),
        csvEscape(r.campaignValue),
        String(score),
        csvEscape(r.routeCluster ?? ""),
        csvEscape(r.sourceType),
      ].join(","),
    );
  }
  return lines.join("\n");
}

async function main() {
  const rawPath = path.join(root, "data/calendar-command-center/community-opportunities-2026.raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8")) as { rows?: CommunityOpportunity[] };
  const rowsIn = raw.rows ?? [];
  if (!rowsIn.length) {
    console.error("No rows in raw file. Run opportunities:scrape first.");
    process.exit(1);
  }

  const rows: CommunityOpportunity[] = rowsIn.map((r) => {
    const lat = r.lat ?? approxCountyCenter(r.county).lat;
    const lng = r.lng ?? approxCountyCenter(r.county).lng;
    const scored: CommunityOpportunity = { ...r, lat, lng };
    scored.score = scoreOpportunity(scored);
    return scored;
  });

  const outDir = path.join(root, "data/calendar-command-center");
  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, "community-opportunities-2026.normalized.json");
  await writeFile(
    jsonPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), count: rows.length, rows }, null, 2),
    "utf8",
  );
  const csvPath = path.join(outDir, "community-opportunities-2026.csv");
  await writeFile(csvPath, toCsv(rows), "utf8");
  console.log(`Wrote ${rows.length} → ${path.relative(root, jsonPath)} + .csv`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
