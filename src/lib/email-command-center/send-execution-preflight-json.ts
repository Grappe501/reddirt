/**
 * Pure JSON helpers for EmailSendExecution.preflightJson (no Prisma, no providers).
 * EMAIL-SEND-EXECUTION-PREFLIGHT-HARDENING-1.0
 */

export type SendExecutionPreflightCheckRow = {
  id: string;
  ok: boolean;
  detail: string;
  whyFailed?: string;
  fixHref?: string;
  fixLabel?: string;
};

export type SendExecutionPreflightRecipientBreakdown = {
  audienceMatchedProfiles: number;
  candidatesWithValidEmail: number;
  profilesMissingEmail: number;
  excludedSuppressed: number;
  excludedMissingConsentSource: number;
  finalEligible: number;
};

export function parsePreflightCheckRows(preflightJson: unknown): SendExecutionPreflightCheckRow[] {
  if (!preflightJson || typeof preflightJson !== "object" || Array.isArray(preflightJson)) return [];
  const checks = (preflightJson as { checks?: unknown }).checks;
  if (!Array.isArray(checks)) return [];
  const out: SendExecutionPreflightCheckRow[] = [];
  for (const c of checks) {
    if (!c || typeof c !== "object") continue;
    const o = c as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : "?";
    const ok = o.ok === true;
    const detail = typeof o.detail === "string" ? o.detail : "";
    const row: SendExecutionPreflightCheckRow = { id, ok, detail };
    if (typeof o.whyFailed === "string" && o.whyFailed.trim()) row.whyFailed = o.whyFailed;
    if (typeof o.fixHref === "string" && o.fixHref.trim()) row.fixHref = o.fixHref;
    if (typeof o.fixLabel === "string" && o.fixLabel.trim()) row.fixLabel = o.fixLabel;
    out.push(row);
  }
  return out;
}

export function firstFailedPreflightCheckId(preflightJson: unknown): string | null {
  const row = parsePreflightCheckRows(preflightJson).find((c) => !c.ok);
  return row?.id ?? null;
}

export function parsePreflightRecipientBreakdown(preflightJson: unknown): SendExecutionPreflightRecipientBreakdown | null {
  if (!preflightJson || typeof preflightJson !== "object" || Array.isArray(preflightJson)) return null;
  const b = (preflightJson as { recipientBreakdown?: unknown }).recipientBreakdown;
  if (!b || typeof b !== "object" || Array.isArray(b)) return null;
  const o = b as Record<string, unknown>;
  const n = (k: string) => (typeof o[k] === "number" && Number.isFinite(o[k] as number) ? (o[k] as number) : 0);
  return {
    audienceMatchedProfiles: n("audienceMatchedProfiles"),
    candidatesWithValidEmail: n("candidatesWithValidEmail"),
    profilesMissingEmail: n("profilesMissingEmail"),
    excludedSuppressed: n("excludedSuppressed"),
    excludedMissingConsentSource: n("excludedMissingConsentSource"),
    finalEligible: n("finalEligible"),
  };
}
