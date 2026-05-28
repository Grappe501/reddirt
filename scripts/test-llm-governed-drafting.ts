import fs from "node:fs";
import path from "node:path";
import { runCopilotWithLlmDraftQueue } from "@/lib/intelligence/aiCopilotOrchestrator";
import { loadKimHammerUnifiedAuditTimeline } from "@/lib/opposition/kimHammerAuditBrowser";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  detectHallucinationRiskIndicators,
  detectUnsupportedClaims,
  generateGovernanceWarnings,
  validateDraftPublicationSafety,
} from "@/lib/intelligence/llmGovernanceSafety";
import {
  generateGovernedDraft,
  loadLlmDraftReviewQueue,
  loadLlmPromptTemplateRegistry,
  summarizeDraftReviewQueue,
  validateDraftGovernance,
} from "@/lib/intelligence/llmDraftGateway";
import { loadLlmDraftAuditLog } from "@/lib/intelligence/llmDraftAuditLog";
import {
  promoteDraftToWorkflowCandidate,
  updateDraftReviewStatus,
} from "@/lib/intelligence/llmDraftReviewWorkflow";
import { enqueueWritingToolboxLlmDraft } from "@/lib/intelligence/aiWritingToolbox";
import { routeMediaCopilotFinding } from "@/lib/intelligence/mediaIntelligenceCopilot";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "data/intelligence/llm-draft-review-queue.json",
  "data/intelligence/llm-prompt-template-registry.json",
  "data/intelligence/llm-draft-audit-log.json",
  "data/intelligence/llm-promoted-workflow-drafts.json",
  "src/lib/intelligence/llmDraftGateway.ts",
  "src/lib/intelligence/llmGovernanceSafety.ts",
  "src/lib/intelligence/llmDraftReviewWorkflow.ts",
  "src/lib/intelligence/llmDraftAuditLog.ts",
  "src/app/admin/(board)/intelligence/llm-review-queue/page.tsx",
  "src/app/admin/(board)/intelligence/morning-brief/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-12 artifact: ${relPath}`);
  }

  const templates = loadLlmPromptTemplateRegistry();
  assert(templates.templates.length >= 27, `Expected 27+ prompt templates; got ${templates.templates.length}.`);

  for (const template of templates.templates) {
    assert(template.publicationRestrictions.length > 0, `${template.templateId} must define publicationRestrictions.`);
    assert(template.requiredWarnings.length > 0, `${template.templateId} must define requiredWarnings.`);
    assert(template.prohibitedInputs.length > 0, `${template.templateId} must define prohibitedInputs.`);
  }

  const queueBefore = loadLlmDraftReviewQueue();
  const beforeCount = queueBefore.drafts.length;

  const generated = generateGovernedDraft({
    templateId: "vulnerability-analysis",
    generatedByTool: "test-nsi12",
    generatedForRoute: "/admin/intelligence/llm-review-queue",
    attemptLlm: true,
  });

  assert(
    generated.generationMode === "DETERMINISTIC_SYNTHESIS" || generated.generationMode === "LLM_BLOCKED_FALLBACK",
    `Must use deterministic synthesis in NSI-12; got ${generated.generationMode}.`,
  );
  assert(generated.draft.publicationSafety === "NON_PUBLISHABLE", "Draft must be NON_PUBLISHABLE.");
  assert(generated.draft.reviewStatus === "DRAFT_PENDING_REVIEW", "Default status must be DRAFT_PENDING_REVIEW.");
  assert(generated.draft.humanReviewRequired === true, "humanReviewRequired must be true.");
  assert(generated.draft.approvedForPromotion === false, "Must not auto-approve for promotion.");
  assert(generated.draft.draftContent.includes("INTERNAL DRAFT ONLY"), "Content must include governance header.");

  const governance = validateDraftGovernance(generated.draft);
  assert(governance.ok === true, `Draft governance validation failed: ${governance.errors.join("; ")}`);

  const queueAfter = loadLlmDraftReviewQueue();
  assert(queueAfter.drafts.length === beforeCount + 1, "Draft must append to review queue.");

  const safety = validateDraftPublicationSafety(generated.draft.draftContent);
  assert(safety.ok === true, "Publication safety check must pass for governed draft.");

  const riskyText = `${generated.draft.draftContent}\nHe clearly intended to block voters without any evidence.`;
  const unsupported = detectUnsupportedClaims(riskyText);
  assert(unsupported.length > 0, "Unsupported claim patterns must be flagged.");

  const hallucination = detectHallucinationRiskIndicators("According to unnamed sources, 87% of voters agree.");
  assert(hallucination.length > 0, "Hallucination risk indicators must be generated.");

  const warnings = generateGovernanceWarnings(riskyText, { sourceDependencies: [] });
  assert(warnings.unsupportedClaimWarnings.length > 0 || warnings.governanceWarnings.length > 0, "Governance warnings bundle must populate.");

  const copilot = runCopilotWithLlmDraftQueue("vulnerability-finder", {
    generatedForRoute: "/admin/intelligence/kim-hammer/ai-opposition-copilot",
  });
  assert(copilot !== null, "Copilot LLM queue integration must run.");
  assert(copilot!.deterministic.exportReady === false, "Copilot deterministic output must not be export-ready.");
  assert(copilot!.llmDraftId !== null, "Copilot must route draft into LLM review queue.");

  const writingDraftId = enqueueWritingToolboxLlmDraft(
    "candidate-talking-points",
    "/admin/intelligence/writing-toolbox",
  );
  assert(writingDraftId !== null, "Writing toolbox must enqueue LLM draft.");

  const mediaRoutes = routeMediaCopilotFinding("test-finding");
  assert(
    mediaRoutes.some((row) => row.system === "llm_draft_review_queue"),
    "Media copilot must route to LLM draft review queue.",
  );
  assert(
    !mediaRoutes.some((row) => row.action === "AUTO_PROMOTE" || row.action === "CREATE_CLAIM"),
    "Media copilot must not auto-promote.",
  );

  const auditLog = loadLlmDraftAuditLog();
  assert(auditLog.entries.some((row) => row.eventType === "LLM_DRAFT_CREATED"), "Audit log must record LLM_DRAFT_CREATED.");

  const timeline = loadKimHammerUnifiedAuditTimeline();
  assert(
    timeline.entries.some((row) => row.kind === "LLM_DRAFT_CREATED"),
    "Unified audit browser must include LLM draft events.",
  );

  const reviewPage = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/llm-review-queue/page.tsx"),
    "utf8",
  );
  assert(reviewPage.includes("NSI-12"), "LLM review queue route must exist.");

  const morningBrief = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/morning-brief/page.tsx"),
    "utf8",
  );
  assert(morningBrief.includes("NSI-12"), "Morning brief must include NSI-12 LLM queue section.");

  const evidenceCommand = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx"),
    "utf8",
  );
  assert(evidenceCommand.includes("NSI-12"), "Evidence Command must include NSI-12 panel.");

  const brain = summarizeCampaignIntelligenceState();
  assert(brain.llmDraftQueueSummary.pendingCount >= 1, "Brain must summarize LLM draft queue.");

  const summary = summarizeDraftReviewQueue();
  assert(summary.pendingCount >= 1, "Queue summary must report pending drafts.");

  const statusUpdate = updateDraftReviewStatus(
    generated.draft.draftId,
    "APPROVED_FOR_PROMOTION",
    "test-reviewer",
    "/admin/intelligence/llm-review-queue",
    "Test approval",
  );
  assert(statusUpdate.ok === true, "Review status workflow must allow human transitions.");

  const promotion = promoteDraftToWorkflowCandidate(
    generated.draft.draftId,
    "WRITING_DRAFT",
    "test-reviewer",
    "/admin/intelligence/llm-review-queue",
  );
  assert(promotion.ok === true, "Approved draft must promote to workflow candidate only.");

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-12 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );
  const claimCountBefore = evidenceIndex.claims.length;
  assert(claimCountBefore > 0, "Evidence index must load claims.");
  assert(
    loadKimHammerEvidenceIndex().claims.length === claimCountBefore,
    "No governed claims must be created automatically.",
  );

  console.log("NSI-12 LLM governed drafting: all checks passed.");
  console.log(`  Prompt templates: ${templates.templates.length}`);
  console.log(`  Queue drafts: ${loadLlmDraftReviewQueue().drafts.length}`);
  console.log(`  LLM audit events: ${auditLog.entries.length}`);
  console.log(`  Export-ready claims (unchanged): ${evidenceIndex.metrics.exportReadyClaims}`);
}

main();
