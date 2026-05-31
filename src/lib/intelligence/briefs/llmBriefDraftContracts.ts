import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { isLiveLlmBriefEnabled } from "@/lib/intelligence/briefs/governedLlmBriefService";
import type { GovernedBrief } from "./governedBriefTypes";

export type LlmBriefDraftRequest = {
  briefId: string;
  briefType: string;
  evidencePacket: {
    verifiedClaims: string[];
    sourceAnchors: string[];
    researchGaps: string[];
    riskWarnings: string[];
  };
  operatorTriggered: true;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  routeToQueue: "/admin/intelligence/llm-review-queue";
};

export type LlmBriefDraftContract = {
  version: string;
  liveLlmEnabled: boolean;
  liveLlmReason: string;
  requiredEnv: string[];
  governanceGates: string[];
  requestShape: LlmBriefDraftRequest;
  claimLedgerRequired: true;
  unsupportedClaimDetector: true;
  noPublishGate: true;
  noSendGate: true;
};

export function getLlmBriefDraftContract(): LlmBriefDraftContract {
  const configured = isOpenAIConfigured();
  const liveEnabled = isLiveLlmBriefEnabled();
  return {
    version: "1.1",
    liveLlmEnabled: liveEnabled,
    liveLlmReason: liveEnabled
      ? "OPENAI_API_KEY + INTELLIGENCE_LLM_BRIEF_ENABLED=1 — operator trigger + review queue required"
      : configured
        ? "OPENAI_API_KEY present but INTELLIGENCE_LLM_BRIEF_ENABLED≠1 — evidence packets + deterministic synthesis only"
        : "OPENAI_API_KEY not configured — evidence packet generation only",
    requiredEnv: [
      "OPENAI_API_KEY (optional)",
      "INTELLIGENCE_LLM_BRIEF_ENABLED=1 (optional, for live inference)",
      "ADMIN_SECRET (admin routes)",
    ],
    governanceGates: [
      "explicit operator button only",
      "evidence packet required before LLM",
      "append to llm-draft-review-queue.json",
      "NON_PUBLISHABLE default",
      "citation attachment required",
      "unsupported-claim detector",
      "no auto-promotion",
    ],
    requestShape: {
      briefId: "example-brief-id",
      briefType: "county_public_messaging",
      evidencePacket: {
        verifiedClaims: [],
        sourceAnchors: [],
        researchGaps: [],
        riskWarnings: [],
      },
      operatorTriggered: true,
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
      routeToQueue: "/admin/intelligence/llm-review-queue",
    },
    claimLedgerRequired: true,
    unsupportedClaimDetector: true,
    noPublishGate: true,
    noSendGate: true,
  };
}

export function buildLlmBriefDraftRequest(brief: GovernedBrief): LlmBriefDraftRequest {
  return {
    briefId: brief.briefId,
    briefType: brief.briefType,
    evidencePacket: {
      verifiedClaims: brief.verifiedClaims.map((c) => c.claim),
      sourceAnchors: brief.sourceAnchors,
      researchGaps: brief.researchGaps,
      riskWarnings: brief.riskWarnings,
    },
    operatorTriggered: true,
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    routeToQueue: "/admin/intelligence/llm-review-queue",
  };
}

export function persistCountyBriefJson(
  registrySlug: string,
  brief: GovernedBrief,
  repoRoot?: string,
): string {
  const root = repoRoot ?? process.cwd();
  const short = registrySlug.replace(/-county$/, "");
  const dir = path.join(root, "data/intelligence/briefs/county");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${short}-public-messaging.json`);
  writeFileSync(file, `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  return file;
}

export function countyBriefExists(registrySlug: string, repoRoot?: string): boolean {
  const root = repoRoot ?? process.cwd();
  const short = registrySlug.replace(/-county$/, "");
  return existsSync(path.join(root, "data/intelligence/briefs/county", `${short}-public-messaging.json`));
}
