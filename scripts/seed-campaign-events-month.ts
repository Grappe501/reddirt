/**
 * Idempotent Campaign Event Ledger seed for any YYYY-MM in normalized calendar JSON.
 *
 *   npx tsx scripts/seed-campaign-events-month.ts 2026-04
 *   npm run campaign-events:seed-month -- 2026-04
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isValidLedgerPeriod,
  seedCampaignEventRecordsForPeriod,
  verifySeededPeriod,
} from "../src/lib/campaign-events/persistence/seed-period";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const period = process.argv[2]?.trim();
  if (!period || !isValidLedgerPeriod(period)) {
    console.error("Usage: npx tsx scripts/seed-campaign-events-month.ts YYYY-MM");
    console.error("Example: npx tsx scripts/seed-campaign-events-month.ts 2026-04");
    process.exit(1);
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
