import { loadStagedMoneyMovements } from "../money/money-movement-storage";
import type { StagedMoneyMovement } from "../money/money-movement-types";

export type ArkansasFilingDataset = {
  contributions: StagedMoneyMovement[];
  expenditures: StagedMoneyMovement[];
  debts: StagedMoneyMovement[];
  loans: StagedMoneyMovement[];
  inKind: StagedMoneyMovement[];
  reimbursements: StagedMoneyMovement[];
  excludedIds: string[];
};

export async function buildArkansasFilingDataset(includedRecordIds: string[]): Promise<ArkansasFilingDataset> {
  const movements = await loadStagedMoneyMovements();
  const included = new Set(includedRecordIds);
  const active = movements.filter((movement) => included.has(movement.id));
  const excludedIds = movements.filter((movement) => !included.has(movement.id)).map((movement) => movement.id);
  return {
    contributions: active.filter((movement) => movement.direction === "in" && !movement.category.includes("in_kind")),
    expenditures: active.filter((movement) => movement.direction === "out" && movement.category !== "travel_reimbursement"),
    debts: active.filter((movement) => movement.category === "debt_obligation"),
    loans: active.filter((movement) => movement.category === "loan_received" || movement.category === "loan_repayment"),
    inKind: active.filter((movement) => movement.category === "contribution_in_kind"),
    reimbursements: active.filter((movement) => movement.category === "travel_reimbursement"),
    excludedIds,
  };
}

export function movementToCsvRow(movement: StagedMoneyMovement): Record<string, string> {
  return {
    id: movement.id,
    date: movement.transactionDate ?? "",
    amount: String(movement.amount ?? ""),
    direction: movement.direction,
    category: movement.category,
    paymentMethod: movement.paymentMethod ?? "",
    vendorOrDonor: movement.name ?? "",
    memo: movement.description ?? movement.purpose ?? "",
    approvalStatus: movement.reviewStatus,
  };
}
