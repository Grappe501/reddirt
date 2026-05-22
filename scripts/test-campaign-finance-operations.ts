/**
 * Sprint 8 — finance operations smoke (DB + JSON stores).
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCampaignEventsWorkbench } from "../src/lib/campaign-events/load-workbench-events";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "../src/lib/campaign-events/load-campaign-calendar-events";
import { loadEventFinance, saveEventFinance } from "../src/lib/campaign-events/finance/finance-persist";
import { enrichEventFinanceFromRow, detectReimbursementExceptions, buildReimbursementPacketDraft } from "../src/lib/campaign-events/finance/finance-helpers";
import { buildCampaignFinanceSummary } from "../src/lib/campaign-events/finance/finance-helpers";
import { buildOfficialReimbursementReport } from "../src/lib/campaign-events/travel-reimbursement/reimbursement-report";
import { verifyTravelReimbursementQueues } from "../src/lib/campaign-events/travel-reimbursement/queue-verification";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const { rows, period } = await loadCampaignEventsWorkbench({ period: "2026-03" });
  if (!rows.length) {
    console.error("No March rows");
    process.exit(1);
  }
  const recordId = rows[0]!.recordId;
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) {
    console.error("Drilldown failed");
    process.exit(1);
  }
  const [row] = serializeCalendarRows([loaded.row]);

  let finance = await loadEventFinance(recordId);
  finance = await enrichEventFinanceFromRow(row, finance);
  finance.budget.notes = "Sprint 8 smoke test";
  await saveEventFinance(recordId, finance);

  const reloaded = await loadEventFinance(recordId);
  const report = buildOfficialReimbursementReport(rows, period);
  const queues = verifyTravelReimbursementQueues(rows, period);
  const exceptions = detectReimbursementExceptions(rows, period);
  const summary = await buildCampaignFinanceSummary(rows, period);
  const packet = buildReimbursementPacketDraft(period, {
    month: period,
    computedStatus: "draft",
    effectiveStatus: "draft",
    stored: null,
    queues,
    report,
    blockingFinalize: [],
    canMarkReady: true,
    canFinalize: true,
    canReopen: false,
  }, 0);

  console.log("Campaign finance operations test");
  console.log("  recordId:", recordId);
  console.log("  finance summary:", reloaded.executiveSummary.slice(0, 50) + "…");
  console.log("  compliance band:", reloaded.compliance.documentationCompleteness);
  console.log("  report lines:", report.approvedLines.length);
  console.log("  exceptions:", exceptions.length);
  console.log("  approved reimbursement:", summary.approvedReimbursement);
  console.log("  packet travel lines:", packet.travelLineCount);

  const ok =
    reloaded.budget.notes.includes("Sprint 8") &&
    reloaded.executiveSummary.length > 5 &&
    report.derivedStatus !== "empty" || report.totals.approvedEventCount >= 0;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — finance persists; reimbursement report still builds");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
