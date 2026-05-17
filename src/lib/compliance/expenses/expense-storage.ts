import { createStagedMoneyMovement } from "../money/money-movement-storage";
import type { MoneyMovementCategory, StagedMoneyMovement } from "../money/money-movement-types";

export type ComplianceExpenseCategory =
  | "advertising"
  | "printing"
  | "postage"
  | "event"
  | "travel"
  | "staff/consulting"
  | "office"
  | "software"
  | "fundraising fee"
  | "bank fee"
  | "other";

export async function createComplianceExpense(input: {
  payeeName: string;
  amount: number;
  date?: string;
  paymentMethod?: "cash" | "check" | "credit_card" | "debit_card" | "ach" | "wire" | "other" | "unknown";
  checkNumber?: string;
  category: ComplianceExpenseCategory;
  purpose?: string;
  staffInitials: string;
  notes?: string;
  documentationStatus?: "complete" | "missing_receipt" | "missing_invoice" | "missing_w9" | "missing_contract" | "needs_review";
}): Promise<StagedMoneyMovement> {
  return createStagedMoneyMovement({
    source: "manual_entry",
    direction: "out",
    category: mapExpenseCategory(input.category),
    amount: input.amount,
    transactionDate: input.date,
    name: input.payeeName,
    entityType: input.category === "staff/consulting" ? "staff" : "vendor",
    paymentMethod: input.paymentMethod ?? "unknown",
    checkNumber: input.checkNumber,
    purpose: input.purpose,
    memo: input.notes,
    documentationStatus: input.documentationStatus ?? "missing_receipt",
    actorInitials: input.staffInitials,
    sourceRoute: "/admin/compliance/expenses/new",
  });
}

function mapExpenseCategory(category: ComplianceExpenseCategory): MoneyMovementCategory {
  if (category === "staff/consulting") return "staff_1099_payment";
  if (category === "travel") return "travel_reimbursement";
  if (category === "fundraising fee") return "processor_fee";
  if (category === "bank fee") return "bank_fee";
  return "vendor_payment";
}
