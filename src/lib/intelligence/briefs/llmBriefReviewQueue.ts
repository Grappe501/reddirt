import { createHash } from "node:crypto";
import {
  appendDraftToReviewQueue,
  loadLlmDraftReviewQueue,
  summarizeDraftReviewQueue,
  type LlmDraftReviewEntry,
  type LlmDraftGenerationMode,
} from "@/lib/intelligence/llmDraftGateway";
import { appendLlmDraftAuditEntry } from "@/lib/intelligence/llmDraftAuditLog";
import type { EvidencePacket } from "./evidencePacketTypes";
import type { LlmBriefDraftOutput, LlmPromptPacket } from "./llmPromptPacketBuilder";
import { summarizeUnsupportedClaimRisk } from "./unsupportedClaimDetector";

export type LlmBriefDraftReviewStatus =
  | "PENDING_HUMAN_REVIEW"
  | "READY_FOR_OPERATOR_LLM_RUN"
  | "LLM_DEFERRED";

export type LlmBriefDraftReviewItem = {
  reviewItemId: string;
  evidencePacketId: string;
  briefId: string;
  briefType: string;
  status: LlmBriefDraftReviewStatus;
  operatorTriggered: true;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  promptPacket: LlmPromptPacket;
  llmOutput: LlmBriefDraftOutput | null;
  draftId: string | null;
  createdAt: string;
  governanceWarnings: string[];
};

function checksum(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

function reviewStatusToQueueStatus(
  status: LlmBriefDraftReviewStatus,
): LlmDraftReviewEntry["reviewStatus"] {
  return "DRAFT_PENDING_REVIEW";
}

function generationModeFromOutput(output: LlmBriefDraftOutput | null): LlmDraftGenerationMode {
  if (!output) return "DETERMINISTIC_SYNTHESIS";
  if (output.generationMode === "LLM_ASSISTED") return "LLM_ASSISTED";
  if (output.generationMode === "LLM_DEFERRED") return "LLM_BLOCKED_FALLBACK";
  return "DETERMINISTIC_SYNTHESIS";
}

export function createLlmBriefDraftReviewItem(input: {
  evidencePacket: EvidencePacket;
  promptPacket: LlmPromptPacket;
  llmOutput?: LlmBriefDraftOutput | null;
  status: LlmBriefDraftReviewStatus;
  operator: string;
  route: string;
}): LlmBriefDraftReviewItem {
  const risk = summarizeUnsupportedClaimRisk(input.evidencePacket);
  const output = input.llmOutput ?? null;

  return {
    reviewItemId: `llm-brief-review-${input.evidencePacket.briefId}-${Date.now().toString(36)}`,
    evidencePacketId: input.evidencePacket.id,
    briefId: input.evidencePacket.briefId,
    briefType: String(input.evidencePacket.briefType),
    status: input.status,
    operatorTriggered: true,
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    promptPacket: input.promptPacket,
    llmOutput: output,
    draftId: null,
    createdAt: new Date().toISOString(),
    governanceWarnings: [
      "INTERNAL_DRAFT — NON_PUBLISHABLE — HUMAN_REVIEW_REQUIRED",
      ...risk.warnings.slice(0, 6),
    ],
  };
}

export function enqueueLlmBriefDraftReview(
  reviewItem: LlmBriefDraftReviewItem,
  repoRoot: string = process.cwd(),
): { ok: true; draftId: string } | { ok: false; error: string } {
  const body =
    reviewItem.llmOutput?.internalBriefDraft ??
    [
      "INTERNAL DRAFT ONLY",
      "NON_PUBLISHABLE",
      "HUMAN REVIEW REQUIRED",
      "",
      `# Evidence packet prepared — ${reviewItem.briefId}`,
      `Status: ${reviewItem.status}`,
      "",
      reviewItem.promptPacket.evidenceBlock,
      "",
      "## Claim ledger preview",
      ...reviewItem.promptPacket.claimLedgerPreview.map(
        (c) => `- [${c.classification}] ${c.claimText}`,
      ),
    ].join("\n");

  const draftId = `llm-brief-${reviewItem.briefId}-${Date.now().toString(36)}`;
  const draft: LlmDraftReviewEntry = {
    draftId,
    draftType: "governed_brief_evidence",
    generatedAt: reviewItem.createdAt,
    generatedByTool: "governed-llm-evidence-packet.v1",
    generatedForRoute: "/admin/intelligence/llm-review-queue",
    generationMode: generationModeFromOutput(reviewItem.llmOutput),
    sourceContext: {
      reviewItemId: reviewItem.reviewItemId,
      evidencePacketId: reviewItem.evidencePacketId,
      briefId: reviewItem.briefId,
      briefType: reviewItem.briefType,
      reviewStatus: reviewItem.status,
      promptPacketId: reviewItem.promptPacket.packetId,
      claimLedger: reviewItem.llmOutput?.claimLedger ?? reviewItem.promptPacket.claimLedgerPreview,
      citationMap: reviewItem.llmOutput?.citationMap ?? reviewItem.promptPacket.citationMap,
      unsupportedClaims: reviewItem.llmOutput?.unsupportedClaims ?? [],
    },
    promptSummary: `Governed brief evidence packet → ${reviewItem.briefId} (${reviewItem.status})`,
    draftTitle: reviewItem.llmOutput?.draftTitle ?? `${reviewItem.briefId} — evidence packet review`,
    draftContent: body,
    publicationSafety: "NON_PUBLISHABLE",
    reviewStatus: reviewStatusToQueueStatus(reviewItem.status),
    humanReviewRequired: true,
    recommendedReviewer: "Intelligence operator",
    sourceDependencies: reviewItem.promptPacket.citationMap.map((c) => c.label),
    citationDependencies: reviewItem.promptPacket.citationMap.map((c) => c.anchorId),
    narrativeDependencies: [],
    countyDependencies: reviewItem.evidencePacketId.includes("county") ? [reviewItem.briefId] : [],
    operatorNotes: "",
    llmModel:
      reviewItem.llmOutput?.generationMode === "LLM_ASSISTED"
        ? "openai-governed-brief"
        : reviewItem.status === "LLM_DEFERRED"
          ? "deferred"
          : "evidence-synthesis",
    llmTemperature: 0.2,
    tokenEstimate: Math.min(body.length / 4, 4000),
    confidenceWarnings: reviewItem.governanceWarnings,
    prohibitedUseWarnings: [
      "NO_PUBLISH",
      "NO_SEND",
      "NO_PUBLIC_EXPORT",
      "OPERATOR_TRIGGER_REQUIRED",
    ],
    approvedForPromotion: false,
    promotedTo: null,
    archived: false,
    contentChecksum: checksum(body),
    governanceWarnings: reviewItem.governanceWarnings,
    unsupportedClaimWarnings: reviewItem.llmOutput?.unsupportedClaims ?? [],
    missingCitationWarnings:
      reviewItem.promptPacket.citationMap.length === 0
        ? ["No citation anchors in evidence packet"]
        : [],
    hallucinationRiskWarnings: [],
    publicationRestrictions: ["NON_PUBLISHABLE", "HUMAN_REVIEW_REQUIRED"],
  };

  const result = appendDraftToReviewQueue(draft, repoRoot);
  if (!result.ok) return result;

  appendLlmDraftAuditEntry(
    {
      eventType: "LLM_DRAFT_CREATED",
      draftId,
      draftType: draft.draftType,
      reviewer: "operator",
      route: "/admin/intelligence/llm-review-queue",
      model: draft.llmModel,
      previousStatus: "NONE",
      nextStatus: draft.reviewStatus,
      warnings: draft.governanceWarnings,
      promotionTarget: null,
      notes: `governed-brief-evidence status=${reviewItem.status}`,
    },
    repoRoot,
  );

  reviewItem.draftId = draftId;
  return { ok: true, draftId };
}

export function summarizeLlmBriefDraftReviewQueue(repoRoot?: string): {
  pendingCount: number;
  governedBriefDraftCount: number;
  readyForOperatorLlmRun: number;
  llmDeferred: number;
  topItems: string[];
} {
  const summary = summarizeDraftReviewQueue(repoRoot);
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const governed = queue.drafts.filter(
    (d) => d.draftType === "governed_brief_evidence" && !d.archived,
  );

  let readyForOperatorLlmRun = 0;
  let llmDeferred = 0;
  for (const d of governed) {
    const status = d.sourceContext.reviewStatus as string | undefined;
    if (status === "READY_FOR_OPERATOR_LLM_RUN") readyForOperatorLlmRun++;
    if (status === "LLM_DEFERRED") llmDeferred++;
  }

  return {
    pendingCount: summary.pendingCount,
    governedBriefDraftCount: governed.length,
    readyForOperatorLlmRun,
    llmDeferred,
    topItems: governed.slice(0, 5).map((d) => `${d.draftTitle} (${d.draftId})`),
  };
}
