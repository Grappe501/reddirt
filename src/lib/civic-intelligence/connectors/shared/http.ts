import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RawStatisticsResponse } from "../../types";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function redactSecretsFromUrl(url: string): string {
  return url
    .replace(/([?&]key=)[^&]+/gi, "$1REDACTED")
    .replace(/([?&]registrationkey=)[^&]+/gi, "$1REDACTED");
}

export function safeLog(message: string, meta?: Record<string, unknown>) {
  const cleaned = { ...(meta || {}) };
  for (const key of Object.keys(cleaned)) {
    if (/key|secret|token|password|authorization/i.test(key)) {
      cleaned[key] = "[redacted]";
    }
  }
  console.log(`[publicdata] ${message}`, cleaned);
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ status: number; text: string; retryCount: number }> {
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let retryCount = 0;
  let lastError: unknown;

  while (retryCount <= MAX_RETRIES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (res.status === 429 || res.status >= 500) {
        retryCount += 1;
        if (retryCount > MAX_RETRIES) {
          return { status: res.status, text: await res.text(), retryCount };
        }
        await sleep(400 * retryCount);
        continue;
      }
      return { status: res.status, text: await res.text(), retryCount };
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      retryCount += 1;
      if (retryCount > MAX_RETRIES) break;
      await sleep(400 * retryCount);
    }
  }
  throw new Error(
    `fetch failed after retries: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

export function persistRawResponse(opts: {
  root: string;
  source: string;
  endpoint: string;
  safeParams: Record<string, string>;
  status: number;
  bodyText: string;
  retryCount: number;
  commit: string | null;
}): RawStatisticsResponse {
  const retrievedAt = new Date().toISOString();
  const checksum = sha256(opts.bodyText);
  const day = retrievedAt.slice(0, 10);
  const dir = path.join(opts.root, opts.source, day);
  mkdirSync(dir, { recursive: true });
  const fileName = `${checksum.slice(0, 16)}.json`;
  const rawPath = path.join(dir, fileName);
  let body: unknown = opts.bodyText;
  try {
    body = JSON.parse(opts.bodyText || "null");
  } catch {
    body = { non_json_text_preview: opts.bodyText.slice(0, 500) };
  }
  const envelope = {
    source: opts.source,
    endpoint: redactSecretsFromUrl(opts.endpoint),
    safeParams: opts.safeParams,
    retrievalTimestamp: retrievedAt,
    checksum,
    mimeType: "application/json",
    compressedSize: Buffer.byteLength(opts.bodyText, "utf8"),
    softwareCommit: opts.commit,
    responseStatus: opts.status,
    body,
  };
  writeFileSync(rawPath, JSON.stringify(envelope, null, 2), "utf8");
  return {
    source: opts.source,
    endpoint: redactSecretsFromUrl(opts.endpoint),
    safeParams: opts.safeParams,
    retrievedAt,
    status: opts.status,
    mimeType: "application/json",
    bodyText: opts.bodyText,
    checksum,
    retryCount: opts.retryCount,
    rawPath,
  };
}
