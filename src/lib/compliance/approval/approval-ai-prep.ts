import type { ApprovalItem, ApprovalWorkbenchAgentResult } from "./approval-types";
import { evaluateApprovalGuards } from "./approval-guards";

export function prepareApprovalItemAi(item: Omit<ApprovalItem, "aiSummary" | "aiRecommendation" | "confidenceScore" | "riskLevel">): Pick<
  ApprovalItem,
  "aiSummary" | "aiRecommendation" | "confidenceScore" | "riskLevel" | "blockers" | "warnings" | "missingFields" | "suggestedNotes"
> {
  const missingFields = item.fields.filter((field) => field.validationStatus === "missing" || field.validationStatus === "blocked").map((field) => field.label);
  const warnings = [...item.warnings];
  const blockers: string[] = [];

  if (!item.evidence.length) blockers.push("No evidence attached.");
  if (missingFields.length) warnings.push(`Missing: ${missingFields.join(", ")}`);
  if (item.fields.some((field) => field.confidence === "low")) warnings.push("Low-confidence extracted fields.");
  if (item.source === "cash_contribution" && (item.amount ?? 0) > 100) {
    warnings.push("Cash amount may exceed policy threshold — verify.");
  }

  let confidenceScore = 85;
  if (missingFields.length) confidenceScore -= 20;
  if (!item.evidence.length) confidenceScore -= 25;
  if (item.fields.some((field) => field.confidence === "low")) confidenceScore -= 10;
  confidenceScore = Math.max(5, Math.min(99, confidenceScore));

  let riskLevel: ApprovalItem["riskLevel"] = "low";
  if (blockers.length || missingFields.length > 2) riskLevel = "high";
  else if (warnings.length || missingFields.length) riskLevel = "medium";
  if (blockers.length) riskLevel = "blocked";

  let aiRecommendation: ApprovalItem["aiRecommendation"] = "approve";
  if (riskLevel === "blocked") aiRecommendation = "manual_review";
  else if (missingFields.length) aiRecommendation = "needs_info";
  else if (warnings.some((warning) => warning.toLowerCase().includes("duplicate"))) aiRecommendation = "duplicate";
  else if (warnings.length) aiRecommendation = "approve_with_changes";

  const aiSummary = [
    `${item.title}${item.amount != null ? ` for $${item.amount.toFixed(2)}` : ""}${item.date ? ` on ${item.date}` : ""}.`,
    item.entityName ? `Entity: ${item.entityName}.` : "",
    missingFields.length ? `Needs correction on ${missingFields.join(", ")}.` : "Fields look complete for human sign-off.",
    item.evidence.length ? `${item.evidence.length} evidence item(s) attached.` : "Evidence missing.",
    "System check only — not legal certification. Treasurer/compliance officer must approve.",
  ]
    .filter(Boolean)
    .join(" ");

  const suggestedNotes = [
    missingFields.length ? `Request ${missingFields[0]} before filing.` : "Ready to approve after quick visual check.",
    item.source === "receipt_expense" ? "Confirm business purpose and bank match." : "",
    item.source === "goodchange_contribution" ? "GoodChange source row attached — verify employer/occupation." : "",
  ].filter(Boolean) as string[];

  return {
    aiSummary,
    aiRecommendation,
    confidenceScore,
    riskLevel,
    blockers,
    warnings,
    missingFields,
    suggestedNotes,
  };
}

export function toWorkbenchAgentResult(item: ApprovalItem): ApprovalWorkbenchAgentResult {
  const guards = evaluateApprovalGuards(item);
  return {
    itemId: item.id,
    plainEnglishSummary: item.aiSummary,
    confidenceScore: item.confidenceScore,
    riskLevel: item.riskLevel,
    recommendedAction: item.aiRecommendation,
    reasons: [...item.warnings, ...guards.blockers],
    missingFields: item.missingFields,
    warningFlags: item.warnings,
    suggestedNotes: item.suggestedNotes,
    nextBestQuestion: item.missingFields[0] ? `What is the correct ${item.missingFields[0]}?` : undefined,
    humanApprovalRequired: true,
  };
}
