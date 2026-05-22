import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { stageBankImport } from "../imports/stage-bank-import";
import { loadStagedMoneyMovements, saveStagedMoneyMovements } from "../money/money-movement-storage";
import type { MoneyMovementInput, StagedMoneyMovement } from "../money/money-movement-types";
import { upsertReconciliationMatch } from "../reconciliation/reconciliation-workbench-storage";
import { April26SourceDocumentRegistry } from "./april26-source-document-registry";
import { saveApril26IngestArtifacts, saveApril26IngestSummaryOnly } from "./april26-ingest-storage";
import {
  buildBankLineChunks,
  buildContributionRowChunks,
  buildExpenseRowChunks,
  buildGoodChangeRowChunks,
  buildImageOcrChunk,
  buildPayoutBatchChunks,
  buildReconciliationCandidateChunks,
  resetApril26ChunkCounter,
} from "./build-april26-ai-chunks";
import { classifyImagePath, discoverApril26Sources, walkImages } from "./discover-april26-sources";
import { extractImageDocument, type OpenAIClient } from "./extract-image";
import {
  BANK_CSV_NAME,
  ETHICS_XLSX_NAME,
  GOODCHANGE_CSV_NAME,
  getApril26Dir,
} from "./paths";
import { parseBankStatementCsv } from "./parse-bank-csv";
import { parseEthicsWorkbook } from "./parse-ethics-xlsx";
import { formatContributorName, mapGoodChangeRowToContribution } from "./parse-goodchange";
import { parseGoodChangeCsvFile } from "./parse-goodchange-csv";
import { centsToDollars } from "./parse-money";
import { buildPayoutBatches, matchPayoutsToBankLines, suggestReceiptToExpenseLinks } from "./reconcile-april26";
import type { April26AiChunk, April26ReconciliationCandidate, IngestApril26Report, MappedGoodChangeContribution } from "./types";
import { APRIL_2026_PERIOD } from "./types";

export type IngestApril26Options = {
  sourceDir?: string;
  dryRun?: boolean;
  openaiApiKey?: string;
  visionModel?: string;
  actorInitials?: string;
};

function visionDocumentType(docType: string): "check" | "receipt" | "in_kind" {
  if (docType === "check_image") return "check";
  if (docType === "in_kind_image") return "in_kind";
  return "receipt";
}

function movementId(prefix: string, key: string): string {
  return `april26-${prefix}-${key}`.replace(/[^a-z0-9-]+/gi, "-").slice(0, 120);
}

function buildMovementFromGoodChange(row: MappedGoodChangeContribution, actorInitials: string): StagedMoneyMovement {
  const now = new Date().toISOString();
  const name = formatContributorName(row) || "Anonymous";
  const amount = centsToDollars(row.grossCents);
  const fee = centsToDollars(row.feeCents);
  const net = centsToDollars(row.netCents);
  return {
    id: movementId("gc", row.sourceTransferId),
    source: "goodchange",
    direction: "in",
    category: "contribution_credit_card",
    amount,
    grossAmount: amount,
    feeAmount: fee,
    netAmount: net,
    transactionDate: row.receivedAt,
    name,
    entityType: "individual",
    address1: row.address1 ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    zip: row.zip ?? undefined,
    employer: row.employer ?? undefined,
    occupation: row.occupation ?? undefined,
    paymentMethod: "credit_card",
    processorTransactionId: row.sourceTransferId,
    reconciliationStatus: "awaiting_bank_match",
    memo: row.memo ?? undefined,
    documentationStatus: row.employer && row.occupation ? "complete" : "missing_donor_info",
    reviewStatus: "needs_review",
    approvalStatus: "not_approved",
    warnings: ["April26 ingest — human approval required before filing."],
    missingFields: [],
    sourceRefs: [`april26:goodchange:${row.sourceTransferId}`, `payout:${row.payoutId}`],
    createdAt: now,
    updatedAt: now,
  };
}

function buildFeeMovement(row: MappedGoodChangeContribution, actorInitials: string): StagedMoneyMovement | null {
  if (!row.feeCents) return null;
  const now = new Date().toISOString();
  return {
    id: movementId("fee", row.sourceTransferId),
    source: "processor_fee",
    direction: "out",
    category: "processor_fee",
    amount: centsToDollars(row.feeCents),
    transactionDate: row.receivedAt,
    name: "GoodChange facilitator fee",
    entityType: "vendor",
    paymentMethod: "other",
    reconciliationStatus: "awaiting_bank_match",
    memo: `Fee for transfer ${row.sourceTransferId}`,
    documentationStatus: "complete",
    reviewStatus: "needs_review",
    approvalStatus: "not_approved",
    warnings: ["Processor fee — match to bank debit if separate."],
    missingFields: [],
    sourceRefs: [`april26:fee:${row.sourceTransferId}`],
    createdAt: now,
    updatedAt: now,
  };
}

function buildContributionMovement(
  draft: import("./types").ContributionDraft & { sourceKey: string },
  category: "contribution_check" | "contribution_cash" | "contribution_in_kind",
  source: "check_intake" | "cash_intake" | "in_kind",
): StagedMoneyMovement {
  const now = new Date().toISOString();
  const name = formatContributorName(draft) || "Unknown donor";
  return {
    id: movementId(category, draft.sourceKey),
    source,
    direction: "in",
    category,
    amount: centsToDollars(draft.amountCents),
    transactionDate: draft.receivedAt,
    name,
    entityType: "individual",
    address1: draft.address1 ?? undefined,
    city: draft.city ?? undefined,
    state: draft.state ?? undefined,
    zip: draft.zip ?? undefined,
    employer: draft.employer ?? undefined,
    occupation: draft.occupation ?? undefined,
    paymentMethod: draft.paymentMethod === "CHECK" ? "check" : draft.paymentMethod === "INKIND" ? "other" : "cash",
    checkNumber: draft.checkNumber ?? undefined,
    reconciliationStatus: "awaiting_bank_match",
    memo: draft.memo ?? undefined,
    documentationStatus: draft.isInKind ? "needs_review" : draft.employer ? "complete" : "missing_donor_info",
    reviewStatus: "needs_review",
    approvalStatus: "not_approved",
    warnings: ["April26 Ethics workbook — officer review required."],
    missingFields: [],
    sourceRefs: [`april26:ethics:${draft.sourceKey}`],
    createdAt: now,
    updatedAt: now,
  };
}

function buildExpenseMovement(
  draft: { spentAt: string; amountCents: number; payeeName: string; expenseCategory: string; memo: string; receiptRequired: boolean },
  sourceKey: string,
): StagedMoneyMovement {
  const now = new Date().toISOString();
  const category =
    draft.expenseCategory === "staff"
      ? "staff_1099_payment"
      : draft.memo.toLowerCase().includes("reimburse")
        ? "travel_reimbursement"
        : "vendor_payment";
  return {
    id: movementId("expense", sourceKey),
    source: "manual_entry",
    direction: "out",
    category,
    amount: centsToDollars(draft.amountCents),
    transactionDate: draft.spentAt,
    name: draft.payeeName,
    entityType: draft.expenseCategory === "staff" ? "staff" : "vendor",
    purpose: draft.memo,
    memo: draft.memo,
    documentationStatus: draft.receiptRequired ? "missing_receipt" : "needs_review",
    reviewStatus: "needs_review",
    approvalStatus: "not_approved",
    warnings: draft.receiptRequired ? ["Receipt required per Ethics workbook."] : [],
    missingFields: draft.receiptRequired ? ["receipt"] : [],
    sourceRefs: [`april26:expense:${sourceKey}`],
    createdAt: now,
    updatedAt: now,
  };
}

async function mergeApril26Movements(incoming: StagedMoneyMovement[], dryRun: boolean): Promise<number> {
  if (dryRun) return incoming.length;
  const existing = await loadStagedMoneyMovements();
  const aprilIds = new Set(existing.filter((movement) => movement.id.startsWith("april26-")).map((movement) => movement.id));
  const preserved = existing.filter((movement) => !aprilIds.has(movement.id));
  const merged = new Map<string, StagedMoneyMovement>();
  for (const movement of [...preserved, ...incoming]) merged.set(movement.id, movement);
  await saveStagedMoneyMovements([...merged.values()]);
  return incoming.length;
}

export async function ingestApril26Folder(options: IngestApril26Options = {}): Promise<IngestApril26Report> {
  const sourceDir = options.sourceDir ?? getApril26Dir();
  const dryRun = options.dryRun ?? false;
  const warnings: string[] = [];
  const reconciliationBlockers: string[] = [];
  const openai = options.openaiApiKey && !dryRun ? new OpenAI({ apiKey: options.openaiApiKey }) : null;
  const visionModel = options.visionModel ?? process.env.OPENAI_VISION_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o";
  const actorInitials = options.actorInitials ?? "ING";
  resetApril26ChunkCounter();

  const inventory = await discoverApril26Sources();
  if (!inventory.folderExists) {
    throw new Error(`April26 folder not found: ${sourceDir}`);
  }

  const registry = new April26SourceDocumentRegistry();
  const chunks: April26AiChunk[] = [];
  const movements: StagedMoneyMovement[] = [];
  const reconciliationCandidates: April26ReconciliationCandidate[] = [];

  const csvPath = path.join(sourceDir, GOODCHANGE_CSV_NAME);
  const xlsxPath = path.join(sourceDir, ETHICS_XLSX_NAME);
  const csvRows = await parseGoodChangeCsvFile(csvPath);
  const ethics = parseEthicsWorkbook(xlsxPath);

  const csvDoc = await registry.register({
    relativePath: GOODCHANGE_CSV_NAME,
    absolutePath: csvPath,
    sourceType: "goodchange_csv",
    extractionStatus: "extracted",
    humanReviewRequired: true,
  });

  const mappedCsv: MappedGoodChangeContribution[] = csvRows.map(mapGoodChangeRowToContribution);
  const seenTransferIds = new Set(mappedCsv.map((row) => row.sourceTransferId));
  chunks.push(...buildGoodChangeRowChunks(mappedCsv, csvDoc.id));

  for (const row of mappedCsv) {
    movements.push(buildMovementFromGoodChange(row, actorInitials));
    const fee = buildFeeMovement(row, actorInitials);
    if (fee) movements.push(fee);
  }

  const xlsxDoc = await registry.register({
    relativePath: ETHICS_XLSX_NAME,
    absolutePath: xlsxPath,
    sourceType: "ethics_xlsx",
    extractionStatus: "extracted",
    humanReviewRequired: true,
  });

  for (const row of ethics.goodChange) {
    if (seenTransferIds.has(row.sourceTransferId)) continue;
    seenTransferIds.add(row.sourceTransferId);
    chunks.push(...buildGoodChangeRowChunks([row], xlsxDoc.id));
    movements.push(buildMovementFromGoodChange(row, actorInitials));
    const fee = buildFeeMovement(row, actorInitials);
    if (fee) movements.push(fee);
  }

  for (const row of ethics.checksCash) {
    const payment = row.paymentMethod === "CHECK" ? "CHECK" : "CASH";
    const category = payment === "CHECK" ? "contribution_check" : "contribution_cash";
    chunks.push(buildContributionRowChunks(row, "check/cash", xlsxDoc.id, row.sourceKey));
    movements.push(buildContributionMovement(row, category, payment === "CHECK" ? "check_intake" : "cash_intake"));
  }

  for (const row of ethics.inKind) {
    chunks.push(buildContributionRowChunks(row, "in-kind", xlsxDoc.id, row.sourceKey));
    movements.push(buildContributionMovement(row, "contribution_in_kind", "in_kind"));
  }

  const expenseRecords: Array<{ id: string; amountCents: number; spentAt: string }> = [];
  for (const item of ethics.expenses) {
    chunks.push(buildExpenseRowChunks(item.draft, item.sourceKey, xlsxDoc.id));
    movements.push(buildExpenseMovement(item.draft, item.sourceKey));
    expenseRecords.push({
      id: movementId("expense", item.sourceKey),
      amountCents: item.draft.amountCents,
      spentAt: item.draft.spentAt,
    });
  }

  const images = await walkImages(sourceDir);
  let imagesProcessed = 0;
  const receiptExtractions: Array<{ id: string; amountCents?: number; transactionDate?: string }> = [];

  for (const image of images) {
    const documentType = classifyImagePath(image.relativePath);
    const doc = await registry.register({
      relativePath: image.relativePath,
      absolutePath: image.absolutePath,
      sourceType: documentType,
      extractionStatus: dryRun || !openai ? "pending" : "extracted",
      humanReviewRequired: true,
    });

    if (openai && !dryRun) {
      const result = await extractImageDocument({
        filePath: image.absolutePath,
        documentType: visionDocumentType(documentType),
        openai: openai as OpenAIClient,
        model: visionModel,
      });
      imagesProcessed += 1;
      const chunkType =
        documentType === "check_image" ? "check_ocr" : documentType === "in_kind_image" ? "in_kind_ocr" : "receipt_ocr";
      chunks.push(buildImageOcrChunk(path.basename(image.relativePath), result, chunkType, doc.id));
      if (documentType === "receipt_image" && result.amountCents) {
        receiptExtractions.push({ id: doc.id, amountCents: result.amountCents, transactionDate: result.transactionDate });
      }
    } else {
      chunks.push({
        id: `april26-chunk-pending-${doc.id}`,
        chunkType: documentType === "check_image" ? "check_ocr" : documentType === "in_kind_image" ? "in_kind_ocr" : "receipt_ocr",
        topic: documentType,
        text: `April 2026 image pending extraction: ${image.relativePath}. Run full ingest with OPENAI_API_KEY.`,
        metadata: { relativePath: image.relativePath, status: "pending" },
        sourceDocumentId: doc.id,
        humanReviewRequired: true,
      });
      if (!dryRun && !openai) warnings.push(`Vision skipped for ${image.relativePath}.`);
    }
  }

  const payoutBatches = buildPayoutBatches([...mappedCsv, ...ethics.goodChange]);
  chunks.push(...buildPayoutBatchChunks(payoutBatches));

  const bankCsvPresent = inventory.bankCsvFound;
  let bankLinesImported = 0;
  let bankDepositMatches = 0;

  const bankCsvPath = path.join(sourceDir, BANK_CSV_NAME);
  if (bankCsvPresent) {
    const bankRows = await parseBankStatementCsv(bankCsvPath);
    bankLinesImported = bankRows.length;
    const bankDoc = await registry.register({
      relativePath: BANK_CSV_NAME,
      absolutePath: bankCsvPath,
      sourceType: "bank_csv",
      extractionStatus: "extracted",
      humanReviewRequired: true,
    });
    chunks.push(...buildBankLineChunks(bankRows, bankDoc.id));

    if (!dryRun) {
      const csvText = await readFile(bankCsvPath, "utf8");
      await stageBankImport({
        fileName: BANK_CSV_NAME,
        csvText,
        uploadedByInitials: actorInitials,
        persist: true,
      });
    }

    const matchResult = matchPayoutsToBankLines(payoutBatches, bankRows);
    bankDepositMatches = matchResult.matchedCount;
    reconciliationCandidates.push(...matchResult.candidates);
    chunks.push(...buildReconciliationCandidateChunks(matchResult.candidates));

    if (!dryRun) {
      for (const candidate of matchResult.candidates) {
        await upsertReconciliationMatch({
          id: candidate.id,
          matchType: "goodchange_deposit_to_bank_deposit",
          status: "suggested",
          confidence: candidate.confidence,
          bankTransactionIds: [candidate.rightId],
          moneyMovementIds: [],
          sourceRecordIds: [candidate.leftId],
          notes: candidate.notes,
        });
      }
    }
  } else {
    reconciliationBlockers.push(
      "Bank CSV required to complete reconciliation. Expected file: " +
        bankCsvPath +
        " (headers: date, amount, memo; credits positive).",
    );
  }

  const receiptLinks = suggestReceiptToExpenseLinks({
    receiptDocIds: receiptExtractions,
    expenseIds: expenseRecords,
  });
  reconciliationCandidates.push(...receiptLinks);
  chunks.push(...buildReconciliationCandidateChunks(receiptLinks));

  const contributionsStaged = movements.filter((movement) => movement.direction === "in").length;
  const expensesStaged = movements.filter((movement) => movement.direction === "out" && movement.category !== "processor_fee").length;

  await mergeApril26Movements(movements, dryRun);

  const report: IngestApril26Report = {
    period: APRIL_2026_PERIOD,
    dryRun,
    visionEnabled: Boolean(openai) && !dryRun,
    sourceDir,
    goodChangeRows: csvRows.length,
    contributionsStaged,
    expensesStaged,
    receiptImageCount: images.filter((image) => image.kind === "receipt").length,
    checkImageCount: images.filter((image) => image.kind === "check").length,
    inKindImageCount: images.filter((image) => image.kind === "in_kind").length,
    imagesProcessed,
    aiChunkCount: chunks.length,
    payoutBatchCount: payoutBatches.length,
    bankCsvPresent,
    bankLinesImported,
    bankDepositMatches,
    receiptLinksSuggested: receiptLinks.length,
    checkLinksSuggested: 0,
    approvalQueueItemEstimate: contributionsStaged + expensesStaged + images.length + payoutBatches.length,
    reconciliationBlockers,
    warnings,
    ingestedAt: new Date().toISOString(),
  };

  if (dryRun) {
    await saveApril26IngestSummaryOnly(report);
  } else {
    await saveApril26IngestArtifacts({
      summary: report,
      registry: registry.list(),
      chunks,
      payoutBatches,
      reconciliationCandidates,
    });
  }

  if (!openai && !dryRun) warnings.push("No OPENAI_API_KEY — receipt/check/in-kind vision not run.");

  return report;
}
