import type { EventFinanceData } from "./finance-types";

export function emptyEventFinance(): EventFinanceData {
  return {
    budget: {
      estimatedSpend: "",
      actualSpend: "",
      categoryBreakdown: "",
      hostContributions: "",
      donatedItems: "",
      volunteerSupportValue: "",
      reimbursementExposure: "",
      notes: "",
    },
    expenses: [],
    linkedReceiptIds: [],
    compliance: {
      receiptCompleteness: "",
      reimbursementCompleteness: "",
      travelCompleteness: "",
      documentationCompleteness: "",
      reportingCompleteness: "",
      warningLevel: "low",
      gaps: [],
    },
    approvalChain: {
      eventApprovedBy: "",
      eventApprovedAt: "",
      reimbursementReview: "",
      complianceReview: "",
      treasurerReview: "",
    },
    executiveSummary: "",
  };
}
