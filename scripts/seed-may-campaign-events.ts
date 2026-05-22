/**
 * Idempotent Campaign Event Ledger seed for May 2026 month-to-date.
 *
 *   npm run campaign-events:seed-may
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MAY_2026_LEDGER_PERIOD } from "../src/lib/campaign-events/constants";
import {
  countNormalizedItemsForPeriod,
  seedCampaignEventRecordsForPeriod,
  verifySeededPeriod,
} from "../src/lib/campaign-events/persistence/seed-period";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const period = MAY_2026_LEDGER_PERIOD;
  const available = await countNormalizedItemsForPeriod(period);
  if (available === 0) {
    console.warn(`No calendar rows found in normalized JSON for ${period}. Seed skipped — UI will show empty May.`);
    process.exit(0);
  }

  const report = await seedCampaignEventRecordsForPeriod(period);
  console.log("Campaign event ledger seed:", report);

  const verification = await verifySeededPeriod(period);
  console.log("Verification:", verification);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
