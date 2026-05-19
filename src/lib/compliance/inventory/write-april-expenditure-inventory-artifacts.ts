import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildAprilExpenditureInventory } from "./build-april-expenditure-inventory";
import type { AprilExpenditureInventory } from "./april-expenditure-inventory-types";

const JSON_PATH = path.join(process.cwd(), "data", "compliance", "ai", "april-expenditure-inventory.json");
const MD_PATH = path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_APRIL_EXPENDITURE_INVENTORY.md");

function mdEscape(s: string): string {
  return s.replace(/\|/g, "\\|");
}

function renderMarkdown(inv: AprilExpenditureInventory): string {
  const lines: string[] = [
    "# April 2026 expenditure and check inventory",
    "",
    `Generated: ${inv.generatedAt}`,
    `Commit: \`${inv.commitBase}\``,
    "",
    "> Identification only — no addresses or vendors invented. Compare to physical/source files.",
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| Uploaded checks / check records | ${inv.summary.uploadedCheckCount} |`,
    `| April ledger expenditures | ${inv.summary.ledgerExpenditureCount} |`,
    `| Exact matches | ${inv.summary.exactMatchCount} |`,
    `| Likely matches | ${inv.summary.likelyMatchCount} |`,
    `| Unmatched uploaded | ${inv.summary.unmatchedUploadedChecks} |`,
    `| Unmatched ledger | ${inv.summary.unmatchedLedgerExpenditures} |`,
    `| Missing address flags | ${inv.summary.missingAddressCount} |`,
    `| Ambiguous match groups | ${inv.summary.ambiguousMatchCount} |`,
    "",
    "## 1. Uploaded checks inventory",
    "",
  ];

  for (const row of inv.uploadedChecks) {
    lines.push(
      `### ${row.id}`,
      "",
      `- Check #: ${row.checkNumber ?? "—"}`,
      `- Date: ${row.date ?? "—"}`,
      `- Payee/vendor: ${row.payeeVendor ?? "—"}`,
      `- Amount: ${row.amount != null ? `$${row.amount.toFixed(2)}` : "—"}`,
      `- Memo: ${row.memoPurpose ?? "—"}`,
      `- Source: \`${row.sourceFileName}\` / chunk \`${row.sourceChunkId}\``,
      `- Evidence: ${row.evidenceStatus}`,
      `- Address present: ${row.addressPresent ? "yes" : "no"}`,
      row.addressValue ? `- Address: ${row.addressValue}` : "",
      `- Missing: ${row.missingFields.length ? row.missingFields.join(", ") : "—"}`,
      `- Confidence: ${row.confidence}`,
      "",
    );
  }

  lines.push("## 2. April bank ledger expenditures", "");
  for (const row of inv.ledgerExpenditures) {
    lines.push(
      `### ${row.id}`,
      "",
      `- Date: ${row.date ?? "—"}`,
      `- Ref/check: ${row.refCheckNumber ?? "—"}`,
      `- Description: ${mdEscape(row.description)}`,
      `- Amount: $${row.amount.toFixed(2)}`,
      `- Memo/category: ${row.memo ?? "—"} / ${row.category ?? "—"}`,
      `- Possible vendor: ${row.possibleVendorPayee ?? "—"}`,
      `- Matched check: ${row.matchedUploadedCheck}`,
      row.matchedSourceId ? `- Matched source: \`${row.matchedSourceId}\`` : "",
      `- Address present: ${row.addressPresent ? "yes" : "no"}`,
      `- Missing: ${row.missingFields.join(", ") || "—"}`,
      `- Reconciliation: ${row.reconciliationStatus}`,
      `- Provenance: \`${row.provenance}\` row ${row.sourceRowNumber}`,
      "",
    );
  }

  lines.push("## 3. Match table", "");
  for (const row of inv.matchTable) {
    lines.push(
      `- **${row.matchKind}**: uploaded=${row.uploadedCheckId ?? "—"} ledger=${row.ledgerExpenditureId ?? "—"} — ${row.notes}`,
    );
  }
  lines.push("", "## 4. Address gap list", "");
  for (const gap of inv.addressGaps) {
    lines.push(
      `- **${gap.payeeVendor}** · $${gap.amount?.toFixed(2) ?? "?"} · ${gap.date ?? "?"} · check ${gap.checkRef ?? "—"} · source \`${gap.source}\` · ${gap.whyNeeded} · status: ${gap.addressFieldStatus}`,
    );
  }

  lines.push("", "## 5. Operator review list", "");
  for (const item of inv.operatorReviewList) {
    lines.push(`- [${item.action}] ${item.summary}`);
  }

  return lines.filter(Boolean).join("\n");
}

export async function writeAprilExpenditureInventoryArtifacts(): Promise<{
  jsonPath: string;
  mdPath: string;
  inventory: AprilExpenditureInventory;
}> {
  const inventory = await buildAprilExpenditureInventory();
  await mkdir(path.dirname(JSON_PATH), { recursive: true });
  await writeFile(JSON_PATH, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  await mkdir(path.dirname(MD_PATH), { recursive: true });
  await writeFile(MD_PATH, renderMarkdown(inventory), "utf8");
  return { jsonPath: JSON_PATH, mdPath: MD_PATH, inventory };
}
