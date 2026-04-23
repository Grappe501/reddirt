import type { Prisma } from "@prisma/client";
import {
  EmailWorkflowEscalationLevel,
  EmailWorkflowIntent,
  EmailWorkflowSpamDisposition,
  EmailWorkflowStatus,
  EmailWorkflowTone,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  EmailWorkflowInterpretationProvenanceV1,
  EmailWorkflowWritebackRequest,
  EmailWorkflowWritebackResult,
} from "./types";

const META_KEY = "emailWorkflowInterpretation";

function isEmpty(s: string | null | undefined): boolean {
  return s == null || !String(s).trim();
}

function canWriteSummary(force: boolean, current: string | null | undefined): boolean {
  if (force) return true;
  return isEmpty(current);
}

type SummaryKey =
  | "whoSummary"
  | "whatSummary"
  | "whenSummary"
  | "whereSummary"
  | "whySummary"
  | "impactSummary"
  | "recommendedResponseSummary"
  | "recommendedResponseRationale";

const summaryKeys: SummaryKey[] = [
  "whoSummary",
  "whatSummary",
  "whenSummary",
  "whereSummary",
  "whySummary",
  "impactSummary",
  "recommendedResponseSummary",
  "recommendedResponseRationale",
];

function isDefaultIntent(v: EmailWorkflowIntent): boolean {
  return v === EmailWorkflowIntent.UNKNOWN;
}
function isDefaultTone(v: EmailWorkflowTone): boolean {
  return v === EmailWorkflowTone.UNKNOWN;
}
function isDefaultEscalation(v: EmailWorkflowEscalationLevel): boolean {
  return v === EmailWorkflowEscalationLevel.NONE;
}
function isDefaultSpamDisposition(v: EmailWorkflowSpamDisposition): boolean {
  return v === EmailWorkflowSpamDisposition.UNKNOWN;
}
/** Only `null` counts as “unset” for scores; any number is operator/prior-owned. */
function isDefaultSpamScore(v: number | null): boolean {
  return v == null;
}
/**
 * Default is `false`. If `true`, a human or prior run explicitly flagged de-escalation need.
 */
function canWriteNeedsDeescalation(force: boolean, current: boolean): boolean {
  if (force) return true;
  return current === false;
}

function canWriteSignalField<T>(
  force: boolean,
  current: T,
  isDefault: (v: T) => boolean
): boolean {
  if (force) return true;
  return isDefault(current);
}

function mergeProvenance(
  base: EmailWorkflowInterpretationProvenanceV1,
  overwrittenFields: string[],
  preservedOperatorFields: string[]
): EmailWorkflowInterpretationProvenanceV1 {
  return {
    ...base,
    overwrittenFields: overwrittenFields.length ? overwrittenFields : undefined,
    preservedOperatorFields: preservedOperatorFields.length ? preservedOperatorFields : undefined,
  };
}

/**
 * Non-destructive by default: fills empty operator summary fields; triage fields are **per-field**:
 * each is only overwritten if still at schema default (or `forceOverwriteSignals`).
 * Merges `emailWorkflowInterpretation` provenance into `metadataJson`.
 * NEW → ENRICHED on successful apply when `status` was `NEW` (queue-first, not an approval).
 */
export async function writeEmailWorkflowInterpretation(
  req: EmailWorkflowWritebackRequest
): Promise<EmailWorkflowWritebackResult> {
  const row = await prisma.emailWorkflowItem.findUnique({ where: { id: req.itemId } });
  if (!row) {
    throw new Error("EmailWorkflowItem not found");
  }

  const skipped: string[] = [];
  const overwrittenFields: string[] = [];
  const preservedOperatorFields: string[] = [];
  const updatedScalars: EmailWorkflowWritebackResult["updatedScalars"] = {};
  const { signals, composed, forceOverwriteSummaries, forceOverwriteSignals, provenance, baseMetadata } = req;
  const forceSig = forceOverwriteSignals;

  for (const k of summaryKeys) {
    const v = composed[k];
    if (v == null || !String(v).trim()) continue;
    if (canWriteSummary(forceOverwriteSummaries, row[k])) {
      (updatedScalars as Record<string, string>)[k] = v;
      overwrittenFields.push(k);
    } else {
      skipped.push(k);
      preservedOperatorFields.push(k);
    }
  }

  if (signals.intent != null) {
    if (canWriteSignalField(forceSig, row.intent, isDefaultIntent)) {
      updatedScalars.intent = signals.intent;
      overwrittenFields.push("intent");
    } else {
      preservedOperatorFields.push("intent");
    }
  }

  if (signals.tone != null) {
    if (canWriteSignalField(forceSig, row.tone, isDefaultTone)) {
      updatedScalars.tone = signals.tone;
      overwrittenFields.push("tone");
    } else {
      preservedOperatorFields.push("tone");
    }
  }

  if (signals.escalationLevel != null) {
    if (canWriteSignalField(forceSig, row.escalationLevel, isDefaultEscalation)) {
      updatedScalars.escalationLevel = signals.escalationLevel;
      overwrittenFields.push("escalationLevel");
    } else {
      preservedOperatorFields.push("escalationLevel");
    }
  }

  if (signals.spamDisposition != null) {
    if (canWriteSignalField(forceSig, row.spamDisposition, isDefaultSpamDisposition)) {
      updatedScalars.spamDisposition = signals.spamDisposition;
      overwrittenFields.push("spamDisposition");
    } else {
      preservedOperatorFields.push("spamDisposition");
    }
  }

  if (signals.spamScore != null) {
    if (canWriteSignalField(forceSig, row.spamScore, isDefaultSpamScore)) {
      updatedScalars.spamScore = signals.spamScore;
      overwrittenFields.push("spamScore");
    } else {
      preservedOperatorFields.push("spamScore");
    }
  }

  if (signals.needsDeescalation != null) {
    if (canWriteNeedsDeescalation(forceSig, row.needsDeescalation)) {
      updatedScalars.needsDeescalation = signals.needsDeescalation;
      overwrittenFields.push("needsDeescalation");
    } else {
      preservedOperatorFields.push("needsDeescalation");
    }
  }

  // Sentiment: heuristic only uses stable in-path tags; treat like a text field (empty = fillable).
  if (signals.sentiment) {
    if (canWriteSummary(forceOverwriteSummaries, row.sentiment) || isEmpty(row.sentiment)) {
      updatedScalars.sentiment = signals.sentiment;
      overwrittenFields.push("sentiment");
    } else {
      preservedOperatorFields.push("sentiment");
    }
  }

  const prevMeta =
    baseMetadata && typeof baseMetadata === "object" && !Array.isArray(baseMetadata)
      ? { ...baseMetadata }
      : {};

  const finalProvenance = mergeProvenance(provenance, overwrittenFields, preservedOperatorFields);
  const nextMeta: Record<string, unknown> = { ...prevMeta, [META_KEY]: finalProvenance };

  let statusChangedToEnriched = false;
  const data: Prisma.EmailWorkflowItemUpdateInput = { metadataJson: nextMeta as Prisma.InputJsonValue };

  for (const k of summaryKeys) {
    const v = (updatedScalars as Partial<Record<SummaryKey, string>>)[k];
    if (v != null) (data as Record<string, string>)[k] = v;
  }
  if (updatedScalars.intent) data.intent = updatedScalars.intent;
  if (updatedScalars.tone) data.tone = updatedScalars.tone;
  if (updatedScalars.escalationLevel) data.escalationLevel = updatedScalars.escalationLevel;
  if (updatedScalars.needsDeescalation != null) data.needsDeescalation = updatedScalars.needsDeescalation;
  if (updatedScalars.spamDisposition) data.spamDisposition = updatedScalars.spamDisposition;
  if (updatedScalars.spamScore != null) data.spamScore = updatedScalars.spamScore;
  if (updatedScalars.sentiment) data.sentiment = updatedScalars.sentiment;

  if (row.status === EmailWorkflowStatus.NEW) {
    data.status = EmailWorkflowStatus.ENRICHED;
    updatedScalars.status = EmailWorkflowStatus.ENRICHED;
    if (!overwrittenFields.includes("status")) {
      overwrittenFields.push("status");
    }
    statusChangedToEnriched = true;
  }

  await prisma.emailWorkflowItem.update({
    where: { id: req.itemId },
    data,
  });

  if (!statusChangedToEnriched) {
    delete (updatedScalars as { status?: unknown }).status;
    // Remove "status" from overwritten if it was only a phantom (we didn't set ENRICHED)
    const i = overwrittenFields.indexOf("status");
    if (i >= 0) overwrittenFields.splice(i, 1);
  }

  return {
    updatedScalars,
    metadataJson: nextMeta,
    skippedProtectedFields: skipped,
    statusChangedToEnriched,
  };
}
