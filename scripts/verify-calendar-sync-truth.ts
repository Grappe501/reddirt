/**
 * Sprint 3 — read-only calendar sync truth counts for a ledger month.
 * Run: npm run campaign-events:verify-calendar-sync
 */
import { loadCalendarSyncDashboard } from "../src/lib/campaign-events/calendar-sync/load-calendar-sync-dashboard";
import { TRUTH_STATUS_LABELS } from "../src/lib/campaign-events/calendar-sync/calendar-sync-truth-types";

const month = process.argv[2] ?? "2026-03";

async function main() {
  const dash = await loadCalendarSyncDashboard(month);
  console.log(`Calendar sync truth — ${month}`);
  console.log(`JSON: ${dash.jsonFreshness.totalRows} rows, stale=${dash.jsonFreshness.isStale}`);
  console.log(`Google OAuth configured: ${dash.googleConfigured}`);
  for (const [status, count] of Object.entries(dash.countsByTruth)) {
    if (count > 0) console.log(`  ${TRUTH_STATUS_LABELS[status as keyof typeof TRUTH_STATUS_LABELS]}: ${count}`);
  }
  console.log(`\nRows loaded: ${dash.rows.length}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
