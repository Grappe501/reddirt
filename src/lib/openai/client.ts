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

/** Safe client-facing text when OpenAI returns auth errors (never echo key material). */
export function formatOpenAIErrorForClient(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/401|invalid_api_key|incorrect api key|invalid x-api-key/i.test(raw)) {
    return (
      "OpenAI rejected the API key (401). Put a current secret in `.env` or `.env.local` as OPENAI_API_KEY, " +
      "remove any duplicate OPENAI_API_KEY from Windows User/System Environment Variables, restart the dev server, " +
      "then try again. https://platform.openai.com/api-keys"
    );
  }
  return raw.replace(/\b(sk-[a-zA-Z0-9_-]{12,})\b/g, "sk-…");
}
