import type { MoneyDirection, MoneyMovementCategory, MoneyMovementSource, StagedMoneyMovement } from "../money/money-movement-types";

export type MoneyClassifierResult = {
  moneyMovementId: string;
  direction: MoneyDirection;
  category: MoneyMovementCategory;
  confidence: "high" | "medium" | "low";
  missingFields: string[];
  warnings: string[];
  suggestedNextAction:
    | "approve"
    | "request_info"
    | "match_to_bank"
    | "attach_receipt"
    | "request_w9"
    | "reject"
    | "manual_review";
  humanReviewRequired: true;
};

export function classifyMoneyMovement(input: {
  id?: string;
  source: MoneyMovementSource;
  amount: number;
  date?: string;
  name?: string;
  memo?: string;
  description?: string;
  paymentMethod?: string;
  raw?: Record<string, string>;
}): MoneyClassifierResult {
  const text = `${input.source} ${input.name ?? ""} ${input.memo ?? ""} ${input.description ?? ""} ${input.paymentMethod ?? ""}`.toLowerCase();
  const direction: MoneyDirection = inferDirection(input.source, input.amount, text);
  const category = inferCategory(input.source, direction, text);
  const missingFields = [
    !input.date ? "date" : undefined,
    !input.name && !text.includes("fee") ? "name" : undefined,
    direction === "out" && !input.memo && !input.description ? "purpose/description" : undefined,
  ].filter((field): field is string => Boolean(field));
  const warnings = [
    input.source === "processor_fee" ? "Processor fees should be matched against GoodChange gross/net and bank deposits." : undefined,
    category === "staff_1099_payment" ? "Review W-9 and 1099 status before approval." : undefined,
    category === "unknown" ? "Classifier could not confidently categorize this movement." : undefined,
  ].filter((warning): warning is string => Boolean(warning));
  return {
    moneyMovementId: input.id ?? "unpersisted",
    direction,
    category,
    confidence: category === "unknown" || missingFields.length ? "low" : "medium",
    missingFields,
    warnings,
    suggestedNextAction: suggestedAction(category, missingFields),
    humanReviewRequired: true,
  };
}

export function classifyPersistedMoneyMovement(movement: StagedMoneyMovement): MoneyClassifierResult {
  return classifyMoneyMovement({
    id: movement.id,
    source: movement.source,
    amount: movement.amount,
    date: movement.transactionDate ?? movement.postedDate,
    name: movement.name,
    memo: [movement.memo, movement.purpose].filter(Boolean).join(" "),
    description: movement.description,
    paymentMethod: movement.paymentMethod,
  });
}

function inferDirection(source: MoneyMovementSource, amount: number, text: string): MoneyDirection {
  if (source === "transfer" || source === "correction") return "neutral";
  if (source === "refund" || text.includes("refund")) return "out";
  if (source === "processor_fee" || text.includes("fee")) return "out";
  if (amount < 0) return "out";
  if (["goodchange", "cash_intake", "check_intake", "loan", "in_kind"].includes(source)) return "in";
  return "out";
}

function inferCategory(source: MoneyMovementSource, direction: MoneyDirection, text: string): MoneyMovementCategory {
  if (source === "cash_intake") return "contribution_cash";
  if (source === "check_intake") return "contribution_check";
  if (source === "goodchange" || source === "credit_card") return "contribution_credit_card";
  if (source === "processor_fee" || text.includes("processor fee") || text.includes("stripe fee")) return "processor_fee";
  if (source === "refund" || text.includes("refund") || text.includes("chargeback")) return "contribution_refund";
  if (source === "loan") return direction === "in" ? "loan_received" : "loan_repayment";
  if (source === "in_kind") return "contribution_in_kind";
  if (source === "transfer") return "transfer";
  if (text.includes("bank fee") || text.includes("service charge")) return "bank_fee";
  if (text.includes("1099") || text.includes("staff") || text.includes("consult")) return "staff_1099_payment";
  if (direction === "out") return "vendor_payment";
  return "unknown";
}

function suggestedAction(category: MoneyMovementCategory, missingFields: string[]): MoneyClassifierResult["suggestedNextAction"] {
  if (missingFields.length) return "request_info";
  if (category === "staff_1099_payment") return "request_w9";
  if (category === "vendor_payment" || category === "travel_reimbursement") return "attach_receipt";
  if (category === "processor_fee" || category === "bank_fee") return "match_to_bank";
  if (category === "unknown") return "manual_review";
  return "approve";
}
