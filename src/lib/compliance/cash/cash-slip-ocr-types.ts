export type CashSlipExtraction = {
  donorFullName?: string;
  donorFirstName?: string;
  donorLastName?: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  employer?: string;
  occupation?: string;
  contributionAmount?: number;
  contributionDate?: string;
  eventSource?: string;
  confidence: "high" | "medium" | "low";
  missingFields: string[];
  warnings: string[];
  humanReviewRequired: true;
};

export type CashBillPhotoCheck = {
  appearsToBeCash?: boolean;
  estimatedVisibleBillCount?: number;
  warnings: string[];
  humanEnteredAmountControls: true;
};
