import OpenAI from "openai";

export function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() ?? "" });
}

export function getOpenAIConfigFromEnv() {
  return {
    apiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL?.trim() || "text-embedding-3-small",
  };
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
