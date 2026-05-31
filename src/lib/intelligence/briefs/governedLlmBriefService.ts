import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { buildEvidencePacketByBriefId } from "./evidencePacketGenerator";
import {
  buildDeterministicDraftFromEvidence,
  buildLlmMessages,
  buildLlmPromptPacket,
  type LlmBriefDraftOutput,
} from "./llmPromptPacketBuilder";
import {
  createLlmBriefDraftReviewItem,
  enqueueLlmBriefDraftReview,
  type LlmBriefDraftReviewStatus,
} from "./llmBriefReviewQueue";
import { ingestClaimsFromEvidencePacket } from "@/lib/intelligence/claims/claimLedgerIngest";
import { getLlmBriefDraftContract } from "./llmBriefDraftContracts";

export type GovernedLlmBriefPrepareInput = {
  briefId: string;
  operatorTriggered: true;
  attemptLiveLlm?: boolean;
  operator?: string;
  route?: string;
  repoRoot?: string;
};

export type GovernedLlmBriefPrepareResult = {
  ok: true;
  briefId: string;
  evidencePacketId: string;
  promptPacketId: string;
  draftId: string;
  reviewStatus: LlmBriefDraftReviewStatus;
  liveLlmUsed: boolean;
  liveLlmEnabled: boolean;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  generationMode: LlmBriefDraftOutput["generationMode"];
  unsupportedClaimCount: number;
  message: string;
} | {
  ok: false;
  error: string;
};

/** Live LLM requires OPENAI_API_KEY + explicit INTELLIGENCE_LLM_BRIEF_ENABLED=1 + operator trigger. */
export function isLiveLlmBriefEnabled(): boolean {
  return (
    isOpenAIConfigured() &&
    process.env.INTELLIGENCE_LLM_BRIEF_ENABLED?.trim() === "1"
  );
}

async function runLiveLlmDraft(
  promptPacket: ReturnType<typeof buildLlmPromptPacket>,
): Promise<LlmBriefDraftOutput | null> {
  if (!isLiveLlmBriefEnabled()) return null;

  try {
    const client = getOpenAIClient();
    const config = getOpenAIConfigFromEnv();
    const messages = buildLlmMessages(promptPacket);
    const completion = await client.chat.completions.create({
      model: config.model,
      temperature: 0.2,
      messages,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!content) return null;

    return {
      draftTitle: `${promptPacket.briefId} — LLM Assisted Draft`,
      internalBriefDraft: [
        "INTERNAL DRAFT ONLY",
        "NON_PUBLISHABLE",
        "HUMAN REVIEW REQUIRED",
        "",
        content,
      ].join("\n"),
      claimLedger: promptPacket.claimLedgerPreview,
      citationMap: promptPacket.citationMap,
      unsupportedClaims: [],
      researchGaps: [],
      recommendedHumanReview: [
        "Verify every claim against evidence packet",
        "Cross-check claim ledger before any internal use",
      ],
      publishabilityStatus: "NOT_PUBLISHABLE",
      reviewStatus: "PENDING_HUMAN_REVIEW",
      generationMode: "LLM_ASSISTED",
    };
  } catch {
    return null;
  }
}

export async function prepareGovernedLlmBriefDraft(
  input: GovernedLlmBriefPrepareInput,
): Promise<GovernedLlmBriefPrepareResult> {
  if (!input.operatorTriggered) {
    return { ok: false, error: "Operator trigger required — autonomous generation blocked." };
  }

  const repoRoot = input.repoRoot ?? process.cwd();
  const evidencePacket = buildEvidencePacketByBriefId(input.briefId, repoRoot);
  if (!evidencePacket) {
    return { ok: false, error: `Unknown briefId: ${input.briefId}` };
  }

  const promptPacket = buildLlmPromptPacket(evidencePacket);
  const contract = getLlmBriefDraftContract();
  const liveEnabled = isLiveLlmBriefEnabled();

  let reviewStatus: LlmBriefDraftReviewStatus = "PENDING_HUMAN_REVIEW";
  let llmOutput: LlmBriefDraftOutput;

  let liveLlmUsed = false;

  if (input.attemptLiveLlm && liveEnabled) {
    const live = await runLiveLlmDraft(promptPacket);
    if (live) {
      llmOutput = live;
      liveLlmUsed = true;
      reviewStatus = "PENDING_HUMAN_REVIEW";
    } else {
      llmOutput = buildDeterministicDraftFromEvidence(evidencePacket, promptPacket);
      llmOutput.generationMode = "LLM_DEFERRED";
      reviewStatus = "LLM_DEFERRED";
    }
  } else if (input.attemptLiveLlm && !liveEnabled) {
    llmOutput = buildDeterministicDraftFromEvidence(evidencePacket, promptPacket);
    llmOutput.generationMode = "LLM_DEFERRED";
    reviewStatus = isOpenAIConfigured() ? "READY_FOR_OPERATOR_LLM_RUN" : "LLM_DEFERRED";
  } else {
    llmOutput = buildDeterministicDraftFromEvidence(evidencePacket, promptPacket);
    reviewStatus = liveEnabled ? "READY_FOR_OPERATOR_LLM_RUN" : "LLM_DEFERRED";
  }

  const reviewItem = createLlmBriefDraftReviewItem({
    evidencePacket,
    promptPacket,
    llmOutput,
    status: reviewStatus,
    operator: input.operator ?? "operator",
    route: input.route ?? "/admin/intelligence",
  });

  const enqueue = enqueueLlmBriefDraftReview(reviewItem, repoRoot);
  if (!enqueue.ok) {
    return { ok: false, error: enqueue.error };
  }

  ingestClaimsFromEvidencePacket(evidencePacket, repoRoot);

  return {
    ok: true,
    briefId: input.briefId,
    evidencePacketId: evidencePacket.id,
    promptPacketId: promptPacket.packetId,
    draftId: enqueue.draftId,
    reviewStatus,
    liveLlmUsed,
    liveLlmEnabled: liveEnabled,
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    generationMode: llmOutput.generationMode,
    unsupportedClaimCount: llmOutput.unsupportedClaims.length,
    message: liveLlmUsed
      ? "LLM draft created — routed to review queue only. NOT publishable."
      : reviewStatus === "READY_FOR_OPERATOR_LLM_RUN"
        ? "Evidence packet + prompt prepared — enable INTELLIGENCE_LLM_BRIEF_ENABLED=1 for live inference."
        : contract.liveLlmReason,
  };
}

export function prepareGovernedLlmBriefDraftSync(
  input: Omit<GovernedLlmBriefPrepareInput, "attemptLiveLlm"> & { attemptLiveLlm?: false },
): GovernedLlmBriefPrepareResult {
  const repoRoot = input.repoRoot ?? process.cwd();
  const evidencePacket = buildEvidencePacketByBriefId(input.briefId, repoRoot);
  if (!evidencePacket) {
    return { ok: false, error: `Unknown briefId: ${input.briefId}` };
  }

  const promptPacket = buildLlmPromptPacket(evidencePacket);
  const llmOutput = buildDeterministicDraftFromEvidence(evidencePacket, promptPacket);
  const liveEnabled = isLiveLlmBriefEnabled();
  const reviewStatus: LlmBriefDraftReviewStatus = liveEnabled
    ? "READY_FOR_OPERATOR_LLM_RUN"
    : "LLM_DEFERRED";

  const reviewItem = createLlmBriefDraftReviewItem({
    evidencePacket,
    promptPacket,
    llmOutput,
    status: reviewStatus,
    operator: input.operator ?? "operator",
    route: input.route ?? "/admin/intelligence",
  });

  const enqueue = enqueueLlmBriefDraftReview(reviewItem, repoRoot);
  if (!enqueue.ok) {
    return { ok: false, error: enqueue.error };
  }

  ingestClaimsFromEvidencePacket(evidencePacket, repoRoot);

  return {
    ok: true,
    briefId: input.briefId,
    evidencePacketId: evidencePacket.id,
    promptPacketId: promptPacket.packetId,
    draftId: enqueue.draftId,
    reviewStatus,
    liveLlmUsed: false,
    liveLlmEnabled: liveEnabled,
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    generationMode: llmOutput.generationMode,
    unsupportedClaimCount: llmOutput.unsupportedClaims.length,
    message: "Evidence packet prepared and queued for human review — no live LLM in sync path.",
  };
}
