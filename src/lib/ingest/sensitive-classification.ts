/**
 * Heuristic: finance / admin / compliance files should not go public on bulk ingest
 * without human review, even if the operator passes --public.
 */
const SENSITIVE_PATTERNS: RegExp[] = [
  /\b(donor|donation|contribution|filing|contribution|fec|finance|financial)\b/i,
  /\b(transaction|expenditure|expense|receipt|reconcile|reconciliation|ledger|qbo|quickbook)\b/i,
  /\b(payroll|w-?2|1099|ach|wire|bank|banking|routing|account|iban)\b/i,
  /\b(credit|debit|tax id|ssn|ein|pii|vendor|check)\b/i,
  /\b(compliance|report of|statement of|sos template|committee to elect)\b/i,
  /(^|[_\s-])donor/i,
  /(^|[_\s-])transaction/i,
  /(^|[_\s-])filing/i,
  /(^|[_\s-])funds/i,
  /\b(committee_to_elect|committee to elect|yard sign request|responses)(\.|\b)/i,
];

export type IngestSensitivity = "STANDARD" | "SENSITIVE_ADMIN";

/**
 * `relativePath` is the path within a zip or folder (forward slashes).
 */
export function classifyIngestPath(fileName: string, relativePath: string): {
  level: IngestSensitivity;
  reasons: string[];
} {
  const reasons: string[] = [];
  const combined = `${relativePath}/${fileName}`.toLowerCase();

  for (const re of SENSITIVE_PATTERNS) {
    if (re.test(combined)) {
      reasons.push(re.source.slice(0, 48));
    }
  }

  if (reasons.length > 0) {
    return { level: "SENSITIVE_ADMIN", reasons: [...new Set(reasons)].slice(0, 8) };
  }
  return { level: "STANDARD", reasons: [] };
}

/**
 * @param wantsPublic — from CLI `--public` or future UI flag
 */
export function resolveIngestVisibility(input: {
  wantsPublic: boolean;
  fileName: string;
  relativePath: string;
}): { isPublic: boolean; reviewStatus: "PENDING_REVIEW" | "APPROVED" } {
  const { level } = classifyIngestPath(input.fileName, input.relativePath);
  if (level === "SENSITIVE_ADMIN") {
    return { isPublic: false, reviewStatus: "PENDING_REVIEW" };
  }
  if (input.wantsPublic) {
    return { isPublic: true, reviewStatus: "APPROVED" };
  }
  return { isPublic: false, reviewStatus: "PENDING_REVIEW" };
}
