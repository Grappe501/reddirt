/**
 * Idempotent April 2026 Campaign Event Ledger seed.
 *
 *   npm run campaign-events:seed-april
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { APRIL_2026_LEDGER_PERIOD } from "../src/lib/campaign-events/constants";
import {
  seedCampaignEventRecordsForPeriod,
  verifySeededPeriod,
} from "../src/lib/campaign-events/persistence/seed-period";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const report = await seedCampaignEventRecordsForPeriod(APRIL_2026_LEDGER_PERIOD);
  console.log("April campaign event ledger seed:", report);

  const verification = await verifySeededPeriod(APRIL_2026_LEDGER_PERIOD);
  console.log("April verification:", verification);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
