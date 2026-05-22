import * as XLSX from "xlsx";
import type { ContributionDraft, EthicsCheckCashRow, EthicsExpenseRow, EthicsInKindRow, GoodChangeRow } from "./types";
import { formatContributorName, mapGoodChangeRowToContribution } from "./parse-goodchange";
import { dollarsToCents, parseEthicsDate } from "./parse-money";

function str(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value).trim() || null;
}

export type EthicsWorkbookData = {
  goodChange: ReturnType<typeof mapGoodChangeRowToContribution>[];
  checksCash: (ContributionDraft & { sourceKey: string })[];
  inKind: (ContributionDraft & { sourceKey: string })[];
  expenses: {
    draft: {
      spentAt: string;
      amountCents: number;
      payeeName: string;
      expenseType: string;
      expenseCategory: string;
      memo: string;
      receiptRequired: boolean;
    };
    sourceKey: string;
  }[];
  sheetsFound: string[];
};

export function parseEthicsWorkbook(filePath: string): EthicsWorkbookData {
  const wb = XLSX.readFile(filePath);
  const sheetNames = wb.SheetNames;
  const goodChangeSheet = wb.Sheets["Good Change"] ?? wb.Sheets["Good Change Donations"];
  const checksSheet = wb.Sheets["ChesksCash Donations"] ?? wb.Sheets["ChecksCash Donations"];
  const inKindSheet = wb.Sheets["In Kind Donations"];
  const expenseSheet = wb.Sheets["Expenditures"];

  const sheetsFound = [
    goodChangeSheet ? "Good Change" : null,
    checksSheet ? "ChesksCash Donations" : null,
    inKindSheet ? "In Kind Donations" : null,
    expenseSheet ? "Expenditures" : null,
  ].filter((name): name is string => Boolean(name));

  const goodChangeRows = goodChangeSheet
    ? (XLSX.utils.sheet_to_json<GoodChangeRow>(goodChangeSheet).filter((row) => row.transfer_id))
    : [];
  const goodChange = goodChangeRows.map(mapGoodChangeRowToContribution);

  const checksCash = checksSheet
    ? XLSX.utils.sheet_to_json<EthicsCheckCashRow>(checksSheet).map((row, index) => ({
        ...mapCheckCashRow(row),
        sourceKey: `ethics-check-${index}-${parseEthicsDate(row.Date)}-${dollarsToCents(row.amount)}`,
      }))
    : [];

  const inKind = inKindSheet
    ? XLSX.utils.sheet_to_json<EthicsInKindRow>(inKindSheet).map((row, index) => ({
        ...mapInKindRow(row),
        sourceKey: `ethics-inkind-${index}-${parseEthicsDate(row.Date)}-${dollarsToCents(row.amount)}`,
      }))
    : [];

  const expenses = expenseSheet
    ? XLSX.utils.sheet_to_json<EthicsExpenseRow>(expenseSheet).map((row, index) => ({
        draft: mapExpenseRow(row),
        sourceKey: `ethics-expense-${index}-${parseEthicsDate(row.Date)}-${dollarsToCents(row.amount)}`,
      }))
    : [];

  return { goodChange, checksCash, inKind, expenses, sheetsFound };
}

function mapCheckCashRow(row: EthicsCheckCashRow): ContributionDraft {
  const anon = String(row.anon ?? "").toLowerCase() === "true";
  return {
    contributorType: "INDIVIDUAL",
    firstName: anon ? null : str(row.first_name),
    lastName: anon ? null : str(row.last_name),
    email: str(row.email),
    phone: str(row.phone),
    address1: str(row.billing_line_1),
    city: str(row.billing_city),
    state: str(row.billing_state),
    zip: str(row.billing_zip),
    employer: str(row.employer_name),
    occupation: str(row.Occuplation),
    amountCents: dollarsToCents(row.amount),
    receivedAt: parseEthicsDate(row.Date),
    paymentMethod: "CHECK",
    isInKind: false,
    isRefund: false,
    memo: "Ethics workbook — Checks/Cash sheet",
  };
}

function mapInKindRow(row: EthicsInKindRow): ContributionDraft {
  return {
    contributorType: "INDIVIDUAL",
    firstName: str(row.first_name),
    lastName: str(row.last_name),
    email: str(row.email),
    phone: str(row.phone),
    address1: str(row.billing_line_1),
    city: str(row.billing_city),
    state: str(row.billing_state),
    zip: str(row.billing_zip),
    employer: str(row.employer_name),
    occupation: str(row.Occuplation),
    amountCents: dollarsToCents(row.amount),
    receivedAt: parseEthicsDate(row.Date),
    paymentMethod: "INKIND",
    isInKind: true,
    inKindDescription: "In-kind per Ethics workbook — verify against attachment JPG",
    isRefund: false,
    memo: "Ethics workbook — In Kind Donations sheet",
  };
}

function mapExpenseRow(row: EthicsExpenseRow) {
  const receiptFlag = String(row["Receipt Y/N"] ?? "").toLowerCase();
  return {
    spentAt: parseEthicsDate(row.Date),
    amountCents: dollarsToCents(row.amount),
    payeeName: str(row.Vendor) || "Unknown vendor",
    expenseType: "CAMPAIGN",
    expenseCategory: categorizeExpense(row.Purpose),
    memo: [row.Purpose, row["Receipt Y/N"] ? `Receipt: ${row["Receipt Y/N"]}` : ""].filter(Boolean).join(" · "),
    receiptRequired: receiptFlag === "y" || receiptFlag === "yes" || receiptFlag === "true",
  };
}

function categorizeExpense(purpose: string): string {
  const lower = (purpose || "").toLowerCase();
  if (lower.includes("travel") || lower.includes("mileage")) return "travel";
  if (lower.includes("meal") || lower.includes("food")) return "meals";
  if (lower.includes("print")) return "printing";
  if (lower.includes("event")) return "event";
  if (lower.includes("1099") || lower.includes("staff")) return "staff";
  return "other";
}

export function ethicsContributionChunk(draft: ContributionDraft, label: string): string {
  return [
    `April 2026 ${label}`,
    `Contributor: ${formatContributorName(draft) || "unknown"}`,
    `Date: ${draft.receivedAt}`,
    `Amount: $${(draft.amountCents / 100).toFixed(2)}`,
    `Payment: ${draft.paymentMethod}`,
    draft.isInKind ? `In-kind: ${draft.inKindDescription}` : "",
    `Employer/occupation: ${draft.employer || "—"} / ${draft.occupation || "—"}`,
    `SOS fields: contributor_name, address, employer, occupation, amount, date, payment_method`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function ethicsExpenseChunk(draft: EthicsWorkbookData["expenses"][0]["draft"], vendor: string): string {
  return [
    `April 2026 expenditure (Ethics workbook)`,
    `Vendor: ${vendor}`,
    `Date: ${draft.spentAt}`,
    `Amount: $${(draft.amountCents / 100).toFixed(2)}`,
    `Category: ${draft.expenseCategory}`,
    `Purpose: ${draft.memo}`,
    `Receipt required: ${draft.receiptRequired ? "yes" : "verify"}`,
    `Reconcile: match receipt image by date/amount/vendor; match bank card/debit line.`,
  ].join("\n");
}
