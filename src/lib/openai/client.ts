import OpenAI from "openai";
import type { OpenAIEnvConfig } from "./types";

let _client: OpenAI | null = null;

export function getOpenAIConfigFromEnv(): OpenAIEnvConfig {
  return {
    apiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL?.trim() || "text-embedding-3-small",
  };
}

export function isOpenAIConfigured(): boolean {
  return Boolean(getOpenAIConfigFromEnv().apiKey);
}

export function getOpenAIClient(): OpenAI {
  const { apiKey } = getOpenAIConfigFromEnv();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  if (!_client) {
    _client = new OpenAI({ apiKey });
  }
  return _client;
}
