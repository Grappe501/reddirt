import type { AprilExpenditureInventory } from "../../inventory/april-expenditure-inventory-types";

export type AuditCheckRow = {
  auditNumber: string;
  kind: "check" | "ledger_expenditure";
  checkRef: string | null;
  date: string | null;
  amount: number | null;
  payeeOrDescription: string;
  whatWeHave: string[];
  whatWeNeed: string[];
  matchStatus: string;
  auditAction: string;
  sourceId: string;
};

export type AprilAuditChecklist = {
  generatedAt: string;
  summary: {
    totalChecks: number;
    totalLedgerExpenditures: number;
    checksReadyToAudit: number;
    checksMissingCriticalFields: number;
    expendituresReadyToAudit: number;
    expendituresMissingDocumentation: number;
    exactMatches: number;
    unmatchedChecks: number;
    unmatchedLedger: number;
  };
  checks: AuditCheckRow[];
  expenditures: AuditCheckRow[];
};

function haveList(parts: string[]): string[] {
  return parts.filter(Boolean);
}

function needFromMissing(missing: string[], extra: string[] = []): string[] {
  const set = new Set([...missing, ...extra].filter(Boolean));
  return [...set];
}

export function buildAprilAuditChecklist(inventory: AprilExpenditureInventory): AprilAuditChecklist {
  const matchByUploaded = new Map<string, string>();
  const matchByLedger = new Map<string, string>();
  for (const m of inventory.matchTable) {
    if (m.uploadedCheckId && m.ledgerExpenditureId && m.matchKind === "exact") {
      matchByUploaded.set(m.uploadedCheckId, m.ledgerExpenditureId);
      matchByLedger.set(m.ledgerExpenditureId, m.uploadedCheckId);
    }
  }

  const checks: AuditCheckRow[] = inventory.uploadedChecks.map((row, index) => {
    const matchedLedger = matchByUploaded.get(row.id);
    const have = haveList([
      row.sourceFileName ? `File/chunk: ${row.sourceFileName}` : "",
      row.evidenceStatus ? `Evidence: ${row.evidenceStatus}` : "",
      row.checkNumber ? `Check #: ${row.checkNumber}` : "",
      row.date ? `Date on record: ${row.date}` : "",
      row.amount != null ? `Amount on record: $${row.amount.toFixed(2)}` : "",
      row.payeeVendor ? `Payee label: ${row.payeeVendor}` : "",
      row.memoPurpose ? `Memo: ${row.memoPurpose}` : "",
      row.addressPresent && row.addressValue ? `Address on file: ${row.addressValue}` : "",
      matchedLedger ? `Matched ledger id: ${matchedLedger}` : "",
    ]);
    const need = needFromMissing(row.missingFields, [
      !row.amount ? "Confirm amount from physical check or bank" : "",
      !row.date ? "Confirm date from physical check or bank" : "",
      !row.payeeVendor ? "Identify payee/vendor from physical check" : "",
      !row.checkNumber ? "Confirm check number from physical check" : "",
      !row.addressPresent ? "Vendor/payee address (after payee confirmed — do not guess)" : "",
      !matchedLedger ? "Pair to April bank line or mark as contribution-only" : "",
      row.recordKind === "check_image" ? "Vision extract or manual field entry from image" : "",
    ]);
    const auditAction =
      row.recordKind === "check_image"
        ? "Compare image to physical check; enter fields"
        : matchedLedger
          ? "Verify match to bank line"
          : "Confirm check exists; determine if expenditure or contribution";

    return {
      auditNumber: `C-${String(index + 1).padStart(3, "0")}`,
      kind: "check",
      checkRef: row.checkNumber,
      date: row.date,
      amount: row.amount,
      payeeOrDescription: row.payeeVendor ?? row.sourceFileName,
      whatWeHave: have,
      whatWeNeed: need,
      matchStatus: matchedLedger ? "exact (system)" : "unmatched",
      auditAction,
      sourceId: row.id,
    };
  });

  const expenditures: AuditCheckRow[] = inventory.ledgerExpenditures.map((row, index) => {
    const matchedCheck = matchByLedger.get(row.id);
    const have = haveList([
      `Bank row ${row.sourceRowNumber}`,
      row.date ? `Date: ${row.date}` : "",
      row.refCheckNumber ? `Ref/check: ${row.refCheckNumber}` : "",
      `Description: ${row.description}`,
      `Amount: $${row.amount.toFixed(2)}`,
      row.category ? `Category: ${row.category}` : "",
      row.possibleVendorPayee ? `Inferred vendor: ${row.possibleVendorPayee}` : "",
      matchedCheck ? `Matched upload: ${matchedCheck}` : "",
    ]);
    const need = needFromMissing(row.missingFields, [
      row.matchedUploadedCheck === "no" ? "Receipt or check image if paid by check" : "",
      row.matchedUploadedCheck === "no" ? "Business purpose / campaign category" : "",
      !row.addressPresent ? "Vendor address when vendor confirmed" : "",
      row.matchedUploadedCheck === "possible" ? "Treasurer confirms uncertain match" : "",
    ]);
    return {
      auditNumber: `E-${String(index + 1).padStart(3, "0")}`,
      kind: "ledger_expenditure",
      checkRef: row.refCheckNumber,
      date: row.date,
      amount: row.amount,
      payeeOrDescription: row.possibleVendorPayee ?? row.description,
      whatWeHave: have,
      whatWeNeed: need,
      matchStatus: row.matchedUploadedCheck,
      auditAction:
        row.matchedUploadedCheck === "yes"
          ? "Verify documentation matches bank line"
          : "Find receipt/check or confirm card/cash expense",
      sourceId: row.id,
    };
  });

  const checksMissingCritical = checks.filter((c) =>
    c.whatWeNeed.some((n) => /amount|date|payee|vision|Pair to April/i.test(n)),
  ).length;
  const expMissingDoc = expenditures.filter((e) => e.matchStatus === "no").length;

  const payload: AprilAuditChecklist = {
    generatedAt: inventory.generatedAt,
    checks,
    expenditures,
    summary: {
      totalChecks: checks.length,
      totalLedgerExpenditures: expenditures.length,
      checksReadyToAudit: checks.filter((c) => c.whatWeHave.length >= 2).length,
      checksMissingCriticalFields: checksMissingCritical,
      expendituresReadyToAudit: expenditures.length,
      expendituresMissingDocumentation: expMissingDoc,
      exactMatches: inventory.summary.exactMatchCount,
      unmatchedChecks: inventory.summary.unmatchedUploadedChecks,
      unmatchedLedger: inventory.summary.unmatchedLedgerExpenditures,
    },
  };
  return payload;
}

export function renderAprilAuditChecklistMarkdown(checklist: AprilAuditChecklist): string {
  const checks = checklist.checks;
  const expenditures = checklist.expenditures;
  const lines: string[] = [
    "# April 2026 audit checklist — checks and expenditures",
    "",
    `Generated: ${checklist.generatedAt}`,
    "",
    "> **Standing by to audit.** Use this list against physical checks and your bank statement (`bank-april-2026.csv` locally).",
    "> Mark each row after review. **Do not invent** amounts, payees, or addresses.",
    "",
    "## Summary",
    "",
    "| Item | Count |",
    "| --- | ---: |",
    `| Check / check records to review | ${checklist.summary.totalChecks} |`,
    `| April ledger expenditures to review | ${checklist.summary.totalLedgerExpenditures} |`,
    `| System exact matches (verify anyway) | ${checklist.summary.exactMatches} |`,
    `| Unmatched uploaded checks | ${checklist.summary.unmatchedChecks} |`,
    `| Unmatched ledger expenditures | ${checklist.summary.unmatchedLedger} |`,
    `| Checks missing critical fields on file | ${checklist.summary.checksMissingCriticalFields} |`,
    `| Expenditures missing documentation | ${checklist.summary.expendituresMissingDocumentation} |`,
    "",
    "Regenerate: `npm run compliance:april-audit-checklist`",
    "",
    "---",
    "",
    "## Part A — Checks and check records",
    "",
    "| # | Check | Date | Amount | Payee / source | What we HAVE | What we NEED | Match | Audit action |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const row of checks) {
    lines.push(
      `| ${row.auditNumber} | ${row.checkRef ?? "—"} | ${row.date ?? "—"} | ${row.amount != null ? `$${row.amount.toFixed(2)}` : "—"} | ${escapeCell(row.payeeOrDescription)} | ${escapeCell(row.whatWeHave.join("; "))} | ${escapeCell(row.whatWeNeed.join("; "))} | ${row.matchStatus} | ${escapeCell(row.auditAction)} |`,
    );
  }

  lines.push("", "---", "", "## Part B — April bank ledger expenditures", "", "| # | Date | Ref | Amount | Vendor / description | What we HAVE | What we NEED | Match | Audit action |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |");

  for (const row of expenditures) {
    lines.push(
      `| ${row.auditNumber} | ${row.date ?? "—"} | ${row.checkRef ?? "—"} | $${row.amount?.toFixed(2) ?? "?"} | ${escapeCell(row.payeeOrDescription)} | ${escapeCell(row.whatWeHave.join("; "))} | ${escapeCell(row.whatWeNeed.join("; "))} | ${row.matchStatus} | ${escapeCell(row.auditAction)} |`,
    );
  }

  lines.push(
    "",
    "## How to audit (30 seconds)",
    "",
    "1. Open Part A alongside check images in `Compliance/April26`.",
    "2. Open Part B alongside bank statement / local `bank-april-2026.csv`.",
    "3. For each **WHAT WE NEED** cell, either confirm from source or leave blank for later entry.",
    "4. Re-run `npm run compliance:april-expenditure-inventory` after updates.",
    "",
  );

  return lines.join("\n");
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 200);
}
