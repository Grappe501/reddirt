/**
 * March 2026 travel approval flow smoke (DB layer — no browser).
 * Usage: npx tsx scripts/test-march-approval-flow.ts
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCampaignEventsWorkbench } from "../src/lib/campaign-events/load-workbench-events";
import { verifyTravelReimbursementQueues } from "../src/lib/campaign-events/travel-reimbursement/queue-verification";
import { loadEventReviewBundle } from "../src/lib/campaign-events/persistence/review-bundle";
import {
  applyReviewDecision,
  persistReviewForm,
} from "../src/lib/campaign-events/persistence/review-persistence";
import { buildOfficialReimbursementReport } from "../src/lib/campaign-events/travel-reimbursement/reimbursement-report";
import { isTravelReportCandidate } from "../src/lib/campaign-events/travel-report/travel-report-logic";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

const MONTH = "2026-03";

async function main() {
  const { rows } = await loadCampaignEventsWorkbench({ period: MONTH });
  const travel = rows.filter(isTravelReportCandidate);
  if (travel.length < 3) {
    console.error("Need at least 3 travel rows for flow test");
    process.exit(1);
  }

  const [approveRow, denyRow, holdRow] = travel.slice(0, 3);
  console.log("March approval flow test — record ids:");
  console.log("  approve:", approveRow.recordId);
  console.log("  deny:", denyRow.recordId);
  console.log("  hold:", holdRow.recordId);

  const before = verifyTravelReimbursementQueues(rows, MONTH);
  console.log("\nBefore:", before);

  const approveBundle = await loadEventReviewBundle(approveRow.recordId);
  const form = { ...approveBundle.form };
  const pre = approveBundle.inference.prefill;
  if (!form.city?.trim() && pre.where.city?.trim()) form.city = pre.where.city;
  if (!form.county?.trim() && pre.where.county?.trim()) form.county = pre.where.county;
  if (!form.roundTripMiles?.trim() && pre.travel.roundTripMiles != null) {
    form.roundTripMiles = String(pre.travel.roundTripMiles);
  }
  if (!form.destinationCity?.trim() && form.city?.trim()) form.destinationCity = form.city;
  if (!form.originCity?.trim()) form.originCity = "Rose Bud";
  if (!form.roundTripMiles?.trim()) form.roundTripMiles = "42";
  await persistReviewForm(approveRow.recordId, form, { recalculate: true, actor: "march-flow-test" });
  await applyReviewDecision(approveRow.recordId, "approved", { note: "March flow test approve", actor: "march-flow-test" });

  await applyReviewDecision(denyRow.recordId, "denied", { note: "March flow test deny", actor: "march-flow-test" });
  await applyReviewDecision(holdRow.recordId, "hold", { note: "March flow test hold", actor: "march-flow-test" });

  const { rows: afterRows } = await loadCampaignEventsWorkbench({ period: MONTH });
  const after = verifyTravelReimbursementQueues(afterRows, MONTH);
  console.log("\nAfter:", after);

  const report = buildOfficialReimbursementReport(afterRows, MONTH);
  console.log("\nReimbursement report:");
  console.log("  derivedStatus:", report.derivedStatus);
  console.log("  approvedLines:", report.approvedLines.length);
  console.log("  totalReimbursement:", report.totals.totalReimbursement);

  const ok =
    after.approved >= 1 &&
    after.denied >= 1 &&
    after.hold >= 1 &&
    report.approvedLines.length >= 1 &&
    report.totals.totalReimbursement > 0;

  if (!ok) {
    console.error("\nFAIL — queue or report did not update as expected");
    process.exit(1);
  }
  console.log("\nOK — approve/deny/hold persisted; reimbursement report includes approved line(s)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
