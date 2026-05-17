export type MappingStatus = "unmapped" | "mapped" | "needs_review";

export type ColumnTypeInference = {
  column: string;
  inferredType: "date" | "money" | "boolean" | "email" | "phone" | "text" | "empty";
  nonEmptyCount: number;
  sampleValues: string[];
};

export type CsvParseResult = {
  columns: string[];
  rows: Array<Record<string, string>>;
  warnings: string[];
};

export type FieldMappingCandidate = {
  field: string;
  column?: string;
  confidence: number;
  alternatives: Array<{ column: string; confidence: number }>;
};

export type FieldMappingResult = {
  confidenceScore: number;
  mappings: FieldMappingCandidate[];
  unmappedRequiredFields: string[];
  warnings: string[];
};

export type GoodChangeImportBatch = {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedByInitials?: string;
  rowCount: number;
  detectedColumns: string[];
  mappingStatus: MappingStatus;
  warnings: string[];
};

export type GoodChangeStagedContribution = {
  id: string;
  batchId: string;
  rawRowHash: string;
  sourceRowNumber: number;

  donorFirstName?: string;
  donorLastName?: string;
  donorFullName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorAddress1?: string;
  donorAddress2?: string;
  donorCity?: string;
  donorState?: string;
  donorZip?: string;
  employer?: string;
  occupation?: string;

  transactionDate?: string;
  depositDate?: string;
  amount?: number;
  grossAmount?: number;
  feeAmount?: number;
  netAmount?: number;
  paymentMethod?: string;
  processorTransactionId?: string;
  goodChangeContributionId?: string;
  recurring?: boolean;
  refund?: boolean;

  complianceStatus:
    | "ready"
    | "missing_required_fields"
    | "duplicate_possible"
    | "refund_or_negative"
    | "needs_review";

  missingFields: string[];
  warnings: string[];
  raw: Record<string, string>;
};

export type GoodChangeImportAnalysis = {
  batch: GoodChangeImportBatch;
  columnTypes: ColumnTypeInference[];
  fieldMapping: FieldMappingResult;
  stagedContributions: GoodChangeStagedContribution[];
  sampleRows: Array<Record<string, string>>;
  possibleContributionFields: string[];
  duplicateRisks: string[];
  donorIdentityFields: string[];
  transactionFields: string[];
  feeRefundRecurringFields: string[];
  employerOccupationAddressAvailability: {
    employer: boolean;
    occupation: boolean;
    address1: boolean;
    city: boolean;
    state: boolean;
    zip: boolean;
  };
  notes: string[];
};

export type BankImportBatch = {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedByInitials?: string;
  rowCount: number;
  detectedColumns: string[];
  mappingStatus: MappingStatus;
  warnings: string[];
};

export type BankStagedTransaction = {
  id: string;
  batchId: string;
  rawRowHash: string;
  sourceRowNumber: number;

  postedDate?: string;
  description?: string;
  amount?: number;
  debit?: number;
  credit?: number;
  balance?: number;
  checkNumber?: string;

  transactionType: "deposit" | "expense" | "fee" | "transfer" | "unknown";

  reconciliationStatus: "unmatched" | "matched" | "possible_match" | "ignored" | "needs_review";

  raw: Record<string, string>;
  warnings: string[];
};

export type BankImportAnalysis = {
  batch: BankImportBatch;
  columnTypes: ColumnTypeInference[];
  fieldMapping: FieldMappingResult;
  stagedTransactions: BankStagedTransaction[];
  sampleRows: Array<Record<string, string>>;
  bankNameOrExportType?: string;
  depositExpenseSignConvention: "positive_negative" | "debit_credit_columns" | "unknown";
  detectedCapabilities: {
    dateColumn?: string;
    descriptionColumn?: string;
    debitColumn?: string;
    creditColumn?: string;
    amountColumn?: string;
    balanceColumn?: string;
    checkNumberColumn?: string;
    processorInfoInMemo: boolean;
    runningBalance: boolean;
  };
  possibleDeposits: number;
  possibleExpenditures: number;
  possibleFees: number;
  possibleTransfers: number;
  notes: string[];
};

export type ReconciliationCandidate = {
  id: string;
  goodChangeBatchId?: string;
  bankTransactionId: string;

  matchType:
    | "exact_amount_date"
    | "amount_with_date_window"
    | "batch_total_to_deposit"
    | "transaction_id_memo"
    | "possible_processor_deposit"
    | "manual_required";

  confidence: "high" | "medium" | "low";
  goodChangeContributionIds: string[];
  bankAmount: number;
  goodChangeGrossTotal?: number;
  goodChangeFeeTotal?: number;
  goodChangeNetTotal?: number;
  dateDifferenceDays?: number;
  explanation: string;
  humanReviewRequired: boolean;
};

export type ReconciliationAnalysis = {
  generatedAt: string;
  goodChangeBatchCount: number;
  bankBatchCount: number;
  candidates: ReconciliationCandidate[];
  summary: {
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    manualRequired: number;
  };
  notes: string[];
};
