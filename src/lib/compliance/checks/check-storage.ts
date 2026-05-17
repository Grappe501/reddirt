import { createStagedMoneyMovement } from "../money/money-movement-storage";
import type { StagedMoneyMovement } from "../money/money-movement-types";

export async function createCheckContribution(input: {
  contributorName: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  employer?: string;
  occupation?: string;
  amount: number;
  checkNumber?: string;
  checkDate?: string;
  receivedDate?: string;
  depositedDate?: string;
  staffInitials: string;
  notes?: string;
}): Promise<StagedMoneyMovement> {
  return createStagedMoneyMovement({
    source: "check_intake",
    direction: "in",
    category: "contribution_check",
    amount: input.amount,
    transactionDate: input.receivedDate || input.checkDate,
    depositDate: input.depositedDate,
    name: input.contributorName,
    entityType: "individual",
    address1: input.address1,
    city: input.city,
    state: input.state,
    zip: input.zip,
    employer: input.employer,
    occupation: input.occupation,
    paymentMethod: "check",
    checkNumber: input.checkNumber,
    memo: input.notes,
    actorInitials: input.staffInitials,
    sourceRoute: "/admin/compliance/checks/new",
  });
}
