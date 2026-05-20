import { readFile } from "node:fs/promises";
import path from "node:path";

export type ImportPreviewRow = {
  audit_id: string;
  disposition: "ready" | "missing_proof" | "unsafe_change" | "invented_address_risk" | "needs_human" | "cannot_import";
  reasons: string[];
  would_update: string[];
};

export type AprilAuditImportPreview = {
  generatedAt: string;
  sourceCsv: string;
  summary: {
    totalRows: number;
    ready: number;
    missingProof: number;
    unsafe: number;
    inventedAddressRisk: number;
    needsHuman: number;
    cannotImport: number;
  };
  rows: ImportPreviewRow[];
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function parseMainAuditCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
}

const INVENTED_ADDRESS_PATTERNS = [
  /^123\s+main\s+st/i,
  /^n\/a$/i,
  /^unknown$/i,
  /^tbd$/i,
  /placeholder/i,
];

export async function buildAprilAuditImportPreview(
  csvPath = path.join(process.cwd(), "docs", "compliance", "audit", "april-2026-compliance-audit.csv"),
): Promise<AprilAuditImportPreview> {
  let raw = "";
  try {
    raw = await readFile(csvPath, "utf8");
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      sourceCsv: csvPath,
      summary: { totalRows: 0, ready: 0, missingProof: 0, unsafe: 0, inventedAddressRisk: 0, needsHuman: 0, cannotImport: 0 },
      rows: [],
    };
  }

  const parsed = parseMainAuditCsv(raw);
  const rows: ImportPreviewRow[] = [];

  for (const row of parsed) {
    const auditId = row.audit_id ?? "";
    const humanAnswer = (row.human_answer ?? "").trim();
    const operatorNotes = (row.operator_notes ?? "").trim();
    const addressValue = (row.address_value ?? "").trim();
    const missing = (row.missing_fields ?? "").trim();
    const workflow = row.workflow_area ?? "";
    const wouldUpdate: string[] = [];
    const reasons: string[] = [];
    let disposition: ImportPreviewRow["disposition"] = "needs_human";

    if (workflow === "rule_review") {
      disposition = "cannot_import";
      reasons.push("Rule review rows cannot be imported via spreadsheet in this pass.");
    } else if (!humanAnswer && !operatorNotes) {
      disposition = "missing_proof";
      reasons.push("No human_answer or operator_notes — operator has not completed row.");
    } else if (addressValue && INVENTED_ADDRESS_PATTERNS.some((p) => p.test(addressValue))) {
      disposition = "invented_address_risk";
      reasons.push("Address looks like placeholder — verify source before import.");
    } else if (/payee|vendor/i.test(humanAnswer) || /payee|vendor/i.test(operatorNotes)) {
      wouldUpdate.push("payee_or_vendor");
    }
    if (/category/i.test(humanAnswer)) wouldUpdate.push("category");
    if (/address/i.test(humanAnswer) && addressValue) wouldUpdate.push("address");
    if (/evidence|receipt|image/i.test(humanAnswer)) wouldUpdate.push("evidence_link");

    if (disposition === "needs_human") {
      if (missing && !humanAnswer) {
        disposition = "missing_proof";
        reasons.push(`Still missing: ${missing}`);
      } else if (wouldUpdate.length && row.reviewed_by) {
        disposition = "ready";
        reasons.push("Operator reviewed; proposed updates are documented.");
      } else if (wouldUpdate.length) {
        disposition = "unsafe_change";
        reasons.push("Would update fields but reviewed_by is empty.");
      } else {
        disposition = "needs_human";
        reasons.push("No destructive import in this pass — preview only.");
      }
    }

    rows.push({ audit_id: auditId, disposition, reasons, would_update: wouldUpdate });
  }

  const summary = {
    totalRows: rows.length,
    ready: rows.filter((r) => r.disposition === "ready").length,
    missingProof: rows.filter((r) => r.disposition === "missing_proof").length,
    unsafe: rows.filter((r) => r.disposition === "unsafe_change").length,
    inventedAddressRisk: rows.filter((r) => r.disposition === "invented_address_risk").length,
    needsHuman: rows.filter((r) => r.disposition === "needs_human").length,
    cannotImport: rows.filter((r) => r.disposition === "cannot_import").length,
  };

  return { generatedAt: new Date().toISOString(), sourceCsv: csvPath, summary, rows };
}

export function renderAprilAuditImportPreviewMarkdown(preview: AprilAuditImportPreview): string {
  return [
    "# April audit import preview",
    "",
    `Generated: ${preview.generatedAt}`,
    "",
    `Source: \`${preview.sourceCsv}\``,
    "",
    "> **No destructive writes.** This preview shows what would happen if import were enabled later.",
    "",
    "## Summary",
    "",
    "| Disposition | Count |",
    "| --- | ---: |",
    `| Total rows | ${preview.summary.totalRows} |`,
    `| Ready for import | ${preview.summary.ready} |`,
    `| Missing proof | ${preview.summary.missingProof} |`,
    `| Unsafe change | ${preview.summary.unsafe} |`,
    `| Invented address risk | ${preview.summary.inventedAddressRisk} |`,
    `| Needs human | ${preview.summary.needsHuman} |`,
    `| Cannot import | ${preview.summary.cannotImport} |`,
    "",
    "Regenerate: `npm run compliance:april-audit-import-preview`",
    "",
  ].join("\n");
}
