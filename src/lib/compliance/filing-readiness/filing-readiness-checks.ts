import type { StagedMoneyMovement } from "../money/money-movement-types";
import type { StagedReceiptExpense } from "../receipts/receipt-types";
import type { FilingReadinessReport, FilingReadinessStatus } from "./filing-readiness-types";

type Section = FilingReadinessReport["sections"][number];

export function buildTransactionReadinessSections(input: {
  movements: StagedMoneyMovement[];
  receipts: StagedReceiptExpense[];
  cashCount: number;
  cashMissingInfo: number;
  goodChangeBatches: number;
  bankBatches: number;
  vendorMissingW9: number;
}): Section[] {
  const { movements, receipts } = input;
  const contributions = movements.filter((movement) => movement.direction === "in");
  const expenses = movements.filter((movement) => movement.direction === "out");
  const reimbursements = movements.filter((movement) => movement.category === "travel_reimbursement");
  const unmatched = movements.filter((movement) => movement.reconciliationStatus !== "matched");
  const missingDocs = movements.filter((movement) => movement.documentationStatus !== "complete");
  const unapproved = movements.filter((movement) => movement.approvalStatus !== "approved");
  return [
    section("contributions", "Contributions ready", statusFromCount(contributions.filter((movement) => movement.missingFields.length).length), `${contributions.length} contribution movement(s), ${contributions.filter((movement) => movement.missingFields.length).length} with missing fields.`, contributions.length, sum(contributions), "Resolve donor/compliance fields before filing."),
    section("expenses", "Expenses ready", statusFromCount(expenses.filter((movement) => movement.documentationStatus !== "complete").length), `${expenses.length} expense movement(s), ${missingDocs.length} with documentation gaps.`, expenses.length, sum(expenses), "Attach receipts/invoices and confirm purposes."),
    section("reimbursements", "Reimbursements ready", statusFromCount(reimbursements.filter((movement) => movement.reconciliationStatus !== "matched").length), `${reimbursements.length} reimbursement item(s), ${reimbursements.filter((movement) => movement.reconciliationStatus !== "matched").length} unmatched.`, reimbursements.length, sum(reimbursements), "Match reimbursement payments to bank records."),
    section("cash", "Cash reviewed", input.cashMissingInfo ? "red" : input.cashCount ? "yellow" : "green", `${input.cashCount} cash item(s), ${input.cashMissingInfo} with missing info.`, input.cashCount, undefined, "Review cash items against verified cash rules."),
    section("checks", "Checks reviewed", statusFromCount(movements.filter((movement) => movement.category === "contribution_check" && movement.missingFields.length).length), `${movements.filter((movement) => movement.category === "contribution_check").length} check contribution(s).`, movements.filter((movement) => movement.category === "contribution_check").length, undefined, "Verify check numbers and deposit matches."),
    section("goodchange", "GoodChange imports reviewed", input.goodChangeBatches ? "yellow" : "yellow", `${input.goodChangeBatches} GoodChange batch(es) analyzed.`, input.goodChangeBatches, undefined, "Confirm gross/net/fee and refund mapping."),
    section("bank", "Bank reconciliation status", unmatched.length ? "red" : "green", `${unmatched.length} money movement(s) not matched to bank.`, unmatched.length, undefined, "Resolve bank matches or document manual review."),
    section("receipts", "Receipts attached", receipts.some((receipt) => receipt.documentationStatus !== "complete") ? "yellow" : "green", `${receipts.length} receipt(s), ${receipts.filter((receipt) => receipt.documentationStatus !== "complete").length} incomplete.`, receipts.length, undefined, "Review receipt documentation and tip status."),
    section("donor-info", "Missing donor info", movements.some((movement) => movement.documentationStatus === "missing_donor_info") ? "red" : "green", `${movements.filter((movement) => movement.documentationStatus === "missing_donor_info").length} item(s) missing donor info.`, movements.filter((movement) => movement.documentationStatus === "missing_donor_info").length, undefined, "Request missing donor fields."),
    section("vendor-w9", "Missing W-9/vendor info", input.vendorMissingW9 ? "yellow" : "green", `${input.vendorMissingW9} vendor(s) need W-9 review.`, input.vendorMissingW9, undefined, "Request W-9/contract status where required."),
    section("human-review", "Human approval status", unapproved.length ? "red" : "green", `${unapproved.length} money movement(s) not approved.`, unapproved.length, undefined, "Human approval required before filing readiness."),
  ];
}

function section(id: string, label: string, status: FilingReadinessStatus, summary: string, count?: number, amount?: number, nextAction?: string): Section {
  return { id, label, status, summary, count, amount, nextAction };
}

function statusFromCount(count: number): FilingReadinessStatus {
  return count > 0 ? "red" : "green";
}

function sum(items: StagedMoneyMovement[]): number {
  return Math.round(items.reduce((total, item) => total + item.amount, 0) * 100) / 100;
}
