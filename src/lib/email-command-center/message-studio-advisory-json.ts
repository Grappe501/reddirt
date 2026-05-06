/**
 * Client-safe parse helpers for Message Studio `lastAiAdvisoryJson`.
 * Keeps `message-draft-ai.ts` (OpenAI imports) out of client bundles.
 */

import type { CampaignVoiceDraftAiResult } from "@/lib/email-command-center/message-draft-ai";
import type { AiEvidenceLedger } from "@/lib/email-command-center/ai-source-grounding";

function asStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
}

function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asSourceBackedClaims(v: unknown): CampaignVoiceDraftAiResult["sourceBackedClaims"] {
  if (!Array.isArray(v)) return [];
  const out: CampaignVoiceDraftAiResult["sourceBackedClaims"] = [];
  for (const row of v) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const text = typeof o.text === "string" ? o.text.trim() : "";
    if (!text) continue;
    out.push({
      text,
      grounding: typeof o.grounding === "string" ? o.grounding : undefined,
      note: typeof o.note === "string" ? o.note : undefined,
    });
  }
  return out;
}

function asUnsupportedClaims(v: unknown): CampaignVoiceDraftAiResult["unsupportedClaims"] {
  if (!Array.isArray(v)) return [];
  const out: CampaignVoiceDraftAiResult["unsupportedClaims"] = [];
  for (const row of v) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const text = typeof o.text === "string" ? o.text.trim() : "";
    if (!text) continue;
    out.push({
      text,
      reason: typeof o.reason === "string" ? o.reason : undefined,
    });
  }
  return out;
}

function asInferences(v: unknown): CampaignVoiceDraftAiResult["inferences"] {
  if (!Array.isArray(v)) return [];
  const out: CampaignVoiceDraftAiResult["inferences"] = [];
  for (const row of v) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const text = typeof o.text === "string" ? o.text.trim() : "";
    if (!text) continue;
    out.push({
      text,
      rationale: typeof o.rationale === "string" ? o.rationale : undefined,
    });
  }
  return out;
}

function asEvidenceLedger(v: unknown): AiEvidenceLedger | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const o = v as Record<string, unknown>;
  if (typeof o.summaryLine !== "string") return undefined;
  return v as AiEvidenceLedger;
}

/** Best-effort merge for older stored JSON missing new keys. */
export function normalizeCampaignVoiceDraftAiResult(partial: Partial<CampaignVoiceDraftAiResult>): CampaignVoiceDraftAiResult {
  return {
    subjectSuggestions: asStrArray(partial.subjectSuggestions),
    preheaderSuggestions: asStrArray(partial.preheaderSuggestions),
    emailBodyDraft: asStr(partial.emailBodyDraft),
    ctaOptions: asStrArray(partial.ctaOptions),
    personalizationNotes: asStrArray(partial.personalizationNotes),
    complianceRiskFlags: asStrArray(partial.complianceRiskFlags),
    sourceLimitations: asStrArray(partial.sourceLimitations),
    revisionSuggestions: asStrArray(partial.revisionSuggestions),
    unsupportedClaimsTagged: asStr(partial.unsupportedClaimsTagged),
    uncertaintyNotes: asStrArray(partial.uncertaintyNotes),
    sourceBackedBullets: asStrArray(partial.sourceBackedBullets),
    suggestedLanguageOnly: asStrArray(partial.suggestedLanguageOnly),
    operatorReviewTasks: asStrArray(partial.operatorReviewTasks),
    advisoryPosture: asStr(partial.advisoryPosture),
    sourceBackedClaims: asSourceBackedClaims(partial.sourceBackedClaims),
    operatorProvidedContext: asStrArray(partial.operatorProvidedContext),
    inferences: asInferences(partial.inferences),
    unsupportedClaims: asUnsupportedClaims(partial.unsupportedClaims),
    recommendedEdits: asStrArray(partial.recommendedEdits),
    evidenceLedger: asEvidenceLedger(partial.evidenceLedger),
  };
}

export function safeParseCampaignVoiceAdvisoryJson(raw: string): CampaignVoiceDraftAiResult | null {
  if (!raw.trim()) return null;
  let j: unknown;
  try {
    j = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!j || typeof j !== "object" || Array.isArray(j)) return null;
  return normalizeCampaignVoiceDraftAiResult(j as Partial<CampaignVoiceDraftAiResult>);
}
