export const APRIL_2026_PERIOD = "2026-04";

export type GoodChangeRow = {
  transfer_id: string;
  status: string;
  type: string;
  created_on: string;
  amount: string;
  facilitator_fee: string;
  net: string;
  payout: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  billing_line_1: string;
  billing_line_2: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  anon: string;
  employer_name: string;
  employer_occupation: string;
  fundraiser: string;
};

export type EthicsCheckCashRow = {
  Date: string | number;
  amount: string | number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  billing_line_1?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  anon?: string;
  employer_name?: string;
  Occuplation?: string;
};

export type EthicsInKindRow = EthicsCheckCashRow;

export type EthicsExpenseRow = {
  Date: string | number;
  amount: string | number;
  Vendor: string;
  Address?: string;
  "Address City"?: string;
  "Address State"?: string;
  "Address Zip"?: string;
  Purpose: string;
  "Receipt Y/N"?: string;
};

export type ContributionDraft = {
  contributorType: "INDIVIDUAL" | "BUSINESS" | "COMMITTEE";
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  employer?: string | null;
  occupation?: string | null;
  amountCents: number;
  receivedAt: string;
  paymentMethod: "CARD" | "CHECK" | "CASH" | "INKIND";
  checkNumber?: string | null;
  isInKind: boolean;
  inKindDescription?: string | null;
  isRefund: boolean;
  memo?: string | null;
};

export type MappedGoodChangeContribution = ContributionDraft & {
  sourceTransferId: string;
  payoutId: string;
  grossCents: number;
  feeCents: number;
  netCents: number;
};

export type ImageExtractionResult = {
  documentType: "check" | "receipt" | "in_kind";
  vendorOrDonor?: string;
  amountCents?: number;
  transactionDate?: string;
  city?: string;
  state?: string;
  checkNumber?: string;
  description?: string;
  confidence: "high" | "medium" | "low";
  warnings: string[];
  humanReviewRequired: true;
  rawText?: string;
};

export type April26SourceDocumentType =
  | "goodchange_csv"
  | "ethics_xlsx"
  | "bank_csv"
  | "check_image"
  | "receipt_image"
  | "in_kind_image";

export type April26SourceDocumentRecord = {
  id: string;
  relativePath: string;
  absolutePath: string;
  sourceType: April26SourceDocumentType;
  sha256: string;
  extractionStatus: "pending" | "extracted" | "skipped" | "error";
  storageMode: "external_folder" | "local_json_metadata";
  humanReviewRequired: boolean;
  ocrConfidence?: "high" | "medium" | "low";
  linkedRecordIds: string[];
  fileSizeBytes?: number;
  updatedAt: string;
};

export type April26AiChunkType =
  | "goodchange_row"
  | "contribution_row"
  | "expense_row"
  | "receipt_ocr"
  | "check_ocr"
  | "in_kind_ocr"
  | "payout_batch"
  | "bank_line"
  | "reconciliation_candidate";

export type April26AiChunk = {
  id: string;
  chunkType: April26AiChunkType;
  topic: string;
  text: string;
  metadata: Record<string, string | number | boolean | undefined>;
  sourceDocumentId?: string;
  humanReviewRequired: true;
};

export type April26PayoutBatch = {
  payoutId: string;
  grossTotal: number;
  feeTotal: number;
  netExpectedDeposit: number;
  transactionCount: number;
  earliestDate: string;
  latestDate: string;
  matchStatus: "unmatched" | "matched" | "candidate";
  matchedBankLineId?: string;
};

export type April26ReconciliationCandidate = {
  id: string;
  linkType: "payout_to_bank_deposit" | "expense_to_receipt" | "check_image_to_contribution" | "check_cash_batch_to_deposit";
  leftKind: string;
  leftId: string;
  rightKind: string;
  rightId: string;
  confidence: "high" | "medium" | "low";
  notes: string;
  humanReviewRequired: true;
};

export type IngestApril26Report = {
  period: string;
  dryRun: boolean;
  visionEnabled: boolean;
  sourceDir: string;
  goodChangeRows: number;
  contributionsStaged: number;
  expensesStaged: number;
  receiptImageCount: number;
  checkImageCount: number;
  inKindImageCount: number;
  imagesProcessed: number;
  aiChunkCount: number;
  payoutBatchCount: number;
  bankCsvPresent: boolean;
  bankLinesImported: number;
  bankDepositMatches: number;
  receiptLinksSuggested: number;
  checkLinksSuggested: number;
  approvalQueueItemEstimate: number;
  reconciliationBlockers: string[];
  warnings: string[];
  ingestedAt: string;
};

export type April26SourceInventory = {
  folderExists: boolean;
  sourceDir: string;
  goodChangeCsvFound: boolean;
  ethicsWorkbookFound: boolean;
  bankCsvFound: boolean;
  sheetsFound: string[];
  checkImageCount: number;
  receiptImageCount: number;
  inKindImageCount: number;
  warnings: string[];
};
