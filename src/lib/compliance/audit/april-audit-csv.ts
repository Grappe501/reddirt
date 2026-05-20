export type AprilAuditCsvRow = Record<string, string | number | boolean>;

export const APRIL_AUDIT_MAIN_COLUMNS = [
  "audit_id",
  "workflow_area",
  "record_type",
  "source_file",
  "source_chunk",
  "source_route",
  "date",
  "check_ref",
  "amount",
  "payee_or_vendor",
  "description",
  "memo",
  "category",
  "address_present",
  "address_value",
  "missing_fields",
  "match_status",
  "matched_record_id",
  "evidence_status",
  "confidence",
  "filing_blocker_reason",
  "audit_action",
  "human_answer",
  "operator_notes",
  "reviewed_by",
  "reviewed_at",
  "ready_for_import",
  "ready_for_filing",
] as const;

export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCsv(columns: readonly string[], rows: AprilAuditCsvRow[]): string {
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((col) => escapeCsvCell(row[col])).join(","));
  }
  return lines.join("\r\n");
}
