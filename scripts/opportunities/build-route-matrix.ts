/**
 * Build / refresh route matrix cache (Google Distance Matrix when GOOGLE_MAPS_API_KEY is set; else haversine).
 * Server-side only — key never sent to browser from this script.
 * Run: npm run opportunities:route-matrix
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";

import type { CommunityOpportunity } from "@/lib/opportunities/community-opportunity-types";
import { ROSE_BUD } from "@/lib/opportunities/approx-county-center";
import { getOrComputeLeg, loadRouteMatrixCache, resolveOpportunityCoord, saveRouteMatrixCache } from "@/lib/opportunities/google-route-matrix";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const shellMaps = typeof process.env["GOOGLE_MAPS_API_KEY"] === "string" ? process.env["GOOGLE_MAPS_API_KEY"].trim() : "";
delete process.env.GOOGLE_MAPS_API_KEY;
loadEnvConfig(root);
const fromFile = process.env["GOOGLE_MAPS_API_KEY"] as string | undefined;
const apiKey =
  (typeof fromFile === "string" && fromFile.trim() ? fromFile.trim() : "") || (shellMaps || "") || undefined;

const DATE_BUCKET = "2026-07-15";

async function main() {
  const normPath = path.join(root, "data/calendar-command-center/community-opportunities-2026.normalized.json");
  const raw = JSON.parse(await readFile(normPath, "utf8")) as { rows?: CommunityOpportunity[] };
  const rows = raw.rows ?? [];
  const fairs = rows.filter((r) => r.type === "county_fair" && r.routeCluster);
  const byCluster = new Map<string, CommunityOpportunity[]>();
  for (const f of fairs) {
    const k = f.routeCluster ?? "unknown";
    if (!byCluster.has(k)) byCluster.set(k, []);
    byCluster.get(k)!.push(f);
  }

  const cache = await loadRouteMatrixCache(root);
  let legs = 0;

  for (const [, list] of byCluster) {
    const sorted = [...list].sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0));
    const nodes = sorted.slice(0, 12);
    for (const n of nodes) {
      const dest = resolveOpportunityCoord(n);
      await getOrComputeLeg(root, cache, ROSE_BUD, dest, DATE_BUCKET, apiKey);
      legs++;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = resolveOpportunityCoord(nodes[i]!);
        const b = resolveOpportunityCoord(nodes[j]!);
        await getOrComputeLeg(root, cache, a, b, DATE_BUCKET, apiKey);
        legs++;
      }
    }
  }

  await saveRouteMatrixCache(root, cache);
  console.log(
    `Route matrix: ${legs} legs computed (cache entries: ${Object.keys(cache.entries).length}). Google key: ${apiKey ? "yes" : "no (haversine fallback)"}.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
