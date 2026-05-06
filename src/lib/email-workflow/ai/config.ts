/**
 * EMAIL-AI-INTELLIGENCE-1.0 — server-only readiness (never expose OPENAI_API_KEY).
 */

import { isOpenAIConfigured, getOpenAIConfigFromEnv } from "@/lib/openai/client";
import { AI_BRAIN_REGISTRY_VERSION } from "@/lib/email-command-center/ai-brain-registry";
import {
  EMAIL_AI_PROMPT_VERSION,
} from "@/lib/email-workflow/ai/types";

export type EmailAiReadiness = {
  configured: boolean;
  modelConfigured: boolean;
  modelName: string;
  /** Env name references only — no values */
  primaryEnvKeys: readonly string[];
  safeAnalysisAvailable: boolean;
};

export function getEmailAiModelName(): string {
  return getOpenAIConfigFromEnv().model;
}

/** True when queue AI analysis may call OpenAI (API key present). */
export function isEmailAiConfigured(): boolean {
  return isOpenAIConfigured();
}

/** Operator-facing bullets; no URLs with secrets */
export function getEmailAiPolicySummary(): readonly string[] {
  return [
    "Runs only on Email Command Center queue items from existing row fields — not Gmail bodies in this lane.",
    "Output is advisory: no auto-send, no auto-queue approval, no profile merges, no audience segment creation.",
    "Operators must verify facts; do not cite unsourced factual or opponent-specific claims.",
    `Prompt contract: ${EMAIL_AI_PROMPT_VERSION}.`,
    `Shared doctrine registry: ${AI_BRAIN_REGISTRY_VERSION} (see src/lib/email-command-center/ai-brain-registry.ts).`,
    "Requires OPENAI_API_KEY — show not configured when missing.",
  ] as const;
}

export function getEmailAiReadiness(): EmailAiReadiness {
  const modelName = getEmailAiModelName();
  const configured = isEmailAiConfigured();
  return {
    configured,
    modelConfigured: Boolean(modelName?.trim()),
    modelName,
    primaryEnvKeys: ["OPENAI_API_KEY", "OPENAI_MODEL"],
    safeAnalysisAvailable: configured,
  };
}
