/**
 * Smoke: shared-event clustering for photo selections (no OpenAI, no writes).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/smoke-cluster-photo-selection.ts
 */
import { clusterPhotoSelection } from "../src/lib/campaign-media/cluster-photo-selection";

function main() {
  const result = clusterPhotoSelection([
    {
      id: "event-a-20260411-1",
      eventName: "Mena Meet & Greet",
      eventDate: "2026-04-11",
      county: "Polk",
      city: "Mena",
      filename: "20260411-mena-1.jpg",
    },
    {
      id: "event-a-20260411-2",
      eventName: "Mena Meet & Greet",
      eventDate: "2026-04-11",
      county: "Polk",
      city: "Mena",
      filename: "20260411-mena-2.jpg",
    },
    {
      id: "other-pulaski-20260501",
      eventName: "Little Rock forum",
      eventDate: "2026-05-01",
      county: "Pulaski",
      city: "Little Rock",
      filename: "20260501-lr.jpg",
    },
    {
      id: "orphan-unknown",
      eventName: "Unknown",
      eventDate: "Unknown",
      county: "Unknown",
      filename: "random.png",
    },
  ]);

  if (result.clusters.length < 2) {
    console.error("FAIL: expected multiple clusters", result);
    process.exit(1);
  }
  if (!result.mixedGeography) {
    console.error("FAIL: expected mixedGeography", result);
    process.exit(1);
  }
  const mena = result.clusters.find((c) => c.photoIds.includes("event-a-20260411-1"));
  if (!mena || mena.photoIds.length < 2) {
    console.error("FAIL: Mena stills should cluster together", result.clusters);
    process.exit(1);
  }

  console.log(JSON.stringify({ summary: result.summary, clusters: result.clusters }, null, 2));
  console.log("OK smoke-cluster-photo-selection");
}

main();
