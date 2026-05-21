/**
 * Sprint 1 — verify travel reimbursement queue counts per month.
 * Usage: npx tsx scripts/verify-travel-reimbursement-queues.ts [2026-03] [2026-04] [2026-05]
 */
import { LEDGER_PERIOD_QUICK_LINKS } from "../src/lib/campaign-events/constants";
import { loadCampaignEventsWorkbench } from "../src/lib/campaign-events/load-workbench-events";
import { verifyTravelReimbursementQueues } from "../src/lib/campaign-events/travel-reimbursement/queue-verification";

async function main() {
  const months = process.argv.slice(2).length ? process.argv.slice(2) : [...LEDGER_PERIOD_QUICK_LINKS];
  console.log("Travel reimbursement queue verification\n");

  for (const month of months) {
    const { rows, period } = await loadCampaignEventsWorkbench({ period: month });
    const v = verifyTravelReimbursementQueues(rows, period);
    console.log(`--- ${period} (${rows.length} ledger rows) ---`);
    console.log(JSON.stringify(v, null, 2));
    console.log("");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
