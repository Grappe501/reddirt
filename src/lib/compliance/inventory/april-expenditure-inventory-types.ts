import { z } from "zod";

export const addressStatusSchema = z.enum(["present", "missing", "partial", "not_applicable"]);

export const matchStatusSchema = z.enum(["yes", "no", "possible"]);

export const uploadedCheckSchema = z.object({
  id: z.string(),
  checkNumber: z.string().nullable(),
  date: z.string().nullable(),
  payeeVendor: z.string().nullable(),
  amount: z.number().nullable(),
  memoPurpose: z.string().nullable(),
  sourceFileName: z.string(),
  sourceChunkId: z.string(),
  evidenceStatus: z.string(),
  addressPresent: z.boolean(),
  addressValue: z.string().nullable(),
  missingFields: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low", "none"]),
  recordKind: z.enum(["check_image", "approval_item", "staged_receipt", "money_movement", "bank_staged"]),
});

export const ledgerExpenditureSchema = z.object({
  id: z.string(),
  date: z.string().nullable(),
  refCheckNumber: z.string().nullable(),
  description: z.string(),
  amount: z.number(),
  memo: z.string().nullable(),
  category: z.string().nullable(),
  possibleVendorPayee: z.string().nullable(),
  matchedUploadedCheck: matchStatusSchema,
  matchedSourceId: z.string().nullable(),
  addressPresent: z.boolean(),
  missingFields: z.array(z.string()),
  reconciliationStatus: z.string(),
  sourceRowNumber: z.number(),
  provenance: z.string(),
});

export const matchEntrySchema = z.object({
  matchKind: z.enum(["exact", "likely", "unmatched_uploaded", "unmatched_ledger", "duplicate", "ambiguous", "check_number_mismatch", "amount_mismatch", "date_mismatch"]),
  uploadedCheckId: z.string().nullable(),
  ledgerExpenditureId: z.string().nullable(),
  notes: z.string(),
  amountDelta: z.number().nullable(),
  dateDeltaDays: z.number().nullable(),
});

export const addressGapSchema = z.object({
  payeeVendor: z.string(),
  amount: z.number().nullable(),
  date: z.string().nullable(),
  checkRef: z.string().nullable(),
  source: z.string(),
  whyNeeded: z.string(),
  addressFieldStatus: z.string(),
});

export const operatorReviewItemSchema = z.object({
  action: z.enum([
    "confirm_check_exists",
    "find_address",
    "verify_payee",
    "check_amount_mismatch",
    "resolve_unmatched_ledger",
    "resolve_unmatched_check",
    "review_ambiguous_match",
  ]),
  summary: z.string(),
  referenceIds: z.array(z.string()),
});

export const aprilExpenditureInventorySchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  summary: z.object({
    uploadedCheckCount: z.number(),
    ledgerExpenditureCount: z.number(),
    exactMatchCount: z.number(),
    likelyMatchCount: z.number(),
    unmatchedUploadedChecks: z.number(),
    unmatchedLedgerExpenditures: z.number(),
    missingAddressCount: z.number(),
    ambiguousMatchCount: z.number(),
  }),
  uploadedChecks: z.array(uploadedCheckSchema),
  ledgerExpenditures: z.array(ledgerExpenditureSchema),
  matchTable: z.array(matchEntrySchema),
  addressGaps: z.array(addressGapSchema),
  operatorReviewList: z.array(operatorReviewItemSchema),
});

export type AprilExpenditureInventory = z.infer<typeof aprilExpenditureInventorySchema>;
