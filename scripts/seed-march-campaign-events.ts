/**
 * Idempotent March 2026 Campaign Event Ledger seed (upsert by calendar source key).
 *
 *   npx tsx scripts/seed-march-campaign-events.ts
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MARCH_2026_LEDGER_PERIOD } from "../src/lib/campaign-events/constants";
import { seedCampaignEventRecordsForPeriod, verifySeededPeriod } from "../src/lib/campaign-events/persistence/seed-period";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const report = await seedCampaignEventRecordsForPeriod(MARCH_2026_LEDGER_PERIOD);
  console.log("March campaign event ledger seed:", report);

  const verification = await verifySeededPeriod(MARCH_2026_LEDGER_PERIOD);
  console.log("March verification:", verification);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
