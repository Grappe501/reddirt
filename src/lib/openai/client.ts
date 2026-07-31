/**
 * OpenAI client for RedDirt lane.
 * Prefer OPENAI_* from RedDirt `.env.local` / `.env` over stale Windows User/System env
 * (Next does not override existing process.env — machine keys otherwise win).
 * Never log or return key material to clients.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import OpenAI from "openai";

function stripQuotes(v: string): string {
  const t = v.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** Read a single KEY=value from an env file (no expansion). */
function readEnvFileKey(filePath: string, key: string): string | null {
  try {
    if (!existsSync(filePath)) return null;
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const k = trimmed.slice(0, eq).trim();
      if (k !== key) continue;
      const v = stripQuotes(trimmed.slice(eq + 1));
      return v || null;
    }
  } catch {
    /* ignore unreadable env */
  }
  return null;
}

/**
 * Resolve OpenAI-related keys from RedDirt lane files first, then process.env.
 * Order: `.env.local` → `.env` → process.env
 */
export function resolveOpenAIEnvValue(key: string, fallback = ""): string {
  if (typeof window !== "undefined") return "";
  const cwd = process.cwd();
  const fromLocal = readEnvFileKey(path.join(cwd, ".env.local"), key);
  if (fromLocal) return fromLocal;
  const fromDotEnv = readEnvFileKey(path.join(cwd, ".env"), key);
  if (fromDotEnv) return fromDotEnv;
  const fromProcess = process.env[key]?.trim();
  if (fromProcess) return fromProcess;
  return fallback;
}

export function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: resolveOpenAIEnvValue("OPENAI_API_KEY") });
}

export function getOpenAIConfigFromEnv() {
  return {
    apiKey: resolveOpenAIEnvValue("OPENAI_API_KEY"),
    model: resolveOpenAIEnvValue("OPENAI_MODEL", "gpt-4o-mini") || "gpt-4o-mini",
    embeddingModel:
      resolveOpenAIEnvValue("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small") ||
      "text-embedding-3-small",
    imageModel: resolveOpenAIEnvValue("OPENAI_IMAGE_MODEL", "gpt-image-1") || "gpt-image-1",
  };
}

export function isOpenAIConfigured(): boolean {
  return Boolean(resolveOpenAIEnvValue("OPENAI_API_KEY"));
}

/** Safe client-facing text when OpenAI returns auth errors (never echo key material). */
export function formatOpenAIErrorForClient(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/401|invalid_api_key|incorrect api key|invalid x-api-key/i.test(raw)) {
    return (
      "OpenAI rejected the API key (401). Update OPENAI_API_KEY in RedDirt `.env.local` or `.env` " +
      "(lane file wins over Windows User/System Environment Variables), restart the dev server, " +
      "then try again. https://platform.openai.com/api-keys"
    );
  }
  return raw.replace(/\b(sk-[a-zA-Z0-9_-]{12,})\b/g, "sk-…");
}
