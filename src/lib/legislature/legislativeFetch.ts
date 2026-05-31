import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ARKLEG_BASE, CACHE_TTL_MS, DEFAULT_FETCH_DELAY_MS, DEFAULT_MAX_FETCHES_PER_RUN } from "./legislativeGovernance";

export type FetchPolicy = {
  maxFetchesPerRun: number;
  delayMs: number;
  respectCache: boolean;
  liveDiscoveryEnabled: boolean;
};

export type FetchResult = {
  url: string;
  html: string;
  fromCache: boolean;
  fetchedAt: string;
  warnings: string[];
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RedDirtLegislativeBot/1.0";

let fetchCountThisRun = 0;
let lastFetchAt = 0;

export function resetLegislativeFetchBudget(): void {
  fetchCountThisRun = 0;
  lastFetchAt = 0;
}

export function getLegislativeFetchPolicy(): FetchPolicy {
  return {
    maxFetchesPerRun: Number(process.env.LEGISLATURE_MAX_FETCHES_PER_RUN ?? DEFAULT_MAX_FETCHES_PER_RUN),
    delayMs: Number(process.env.LEGISLATURE_FETCH_DELAY_MS ?? DEFAULT_FETCH_DELAY_MS),
    respectCache: process.env.LEGISLATURE_SKIP_CACHE !== "1",
    liveDiscoveryEnabled:
      process.env.LEGISLATURE_LIVE_DISCOVERY === "1" || process.env.LEGISLATURE_DISCOVERY_ENABLED === "1",
  };
}

function cacheKey(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function cachePath(repoRoot: string, url: string): string {
  return path.join(repoRoot, "data/legislature/cache", `${cacheKey(url)}.json`);
}

function readCache(repoRoot: string, url: string): FetchResult | null {
  const abs = cachePath(repoRoot, url);
  if (!existsSync(abs)) return null;
  const cached = JSON.parse(readFileSync(abs, "utf8")) as FetchResult & { expiresAt?: string };
  if (cached.expiresAt && Date.parse(cached.expiresAt) < Date.now()) return null;
  return { ...cached, fromCache: true };
}

function writeCache(repoRoot: string, url: string, html: string, warnings: string[]): void {
  const abs = cachePath(repoRoot, url);
  mkdirSync(path.dirname(abs), { recursive: true });
  const now = new Date().toISOString();
  writeFileSync(
    abs,
    `${JSON.stringify(
      {
        url,
        html,
        fromCache: false,
        fetchedAt: now,
        expiresAt: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
        warnings,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export async function politeFetchHtml(
  url: string,
  repoRoot: string = process.cwd(),
  policy: FetchPolicy = getLegislativeFetchPolicy(),
): Promise<FetchResult> {
  const warnings: string[] = [
    "Arkansas Legislature pages are public; respect robots.txt, rate limits, and site terms.",
    "Do not run uncontrolled scraping loops — max fetches enforced per run.",
  ];

  if (policy.respectCache) {
    const cached = readCache(repoRoot, url);
    if (cached) return cached;
  }

  if (!policy.liveDiscoveryEnabled) {
    warnings.push("Live discovery disabled — enable LEGISLATURE_LIVE_DISCOVERY=1 for network fetch.");
    return { url, html: "", fromCache: false, fetchedAt: new Date().toISOString(), warnings };
  }

  if (fetchCountThisRun >= policy.maxFetchesPerRun) {
    warnings.push(`Fetch budget exhausted (${policy.maxFetchesPerRun}/run). Use cache or next run.`);
    return { url, html: "", fromCache: false, fetchedAt: new Date().toISOString(), warnings };
  }

  const sinceLast = Date.now() - lastFetchAt;
  if (sinceLast < policy.delayMs) await sleep(policy.delayMs - sinceLast);

  fetchCountThisRun += 1;
  lastFetchAt = Date.now();

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      warnings.push(`HTTP ${res.status} for ${url}`);
      return { url, html: "", fromCache: false, fetchedAt: new Date().toISOString(), warnings };
    }
    const html = await res.text();
    if (policy.respectCache && html) writeCache(repoRoot, url, html, warnings);
    return { url, html, fromCache: false, fetchedAt: new Date().toISOString(), warnings };
  } catch (err) {
    warnings.push(`Fetch error: ${err instanceof Error ? err.message : String(err)}`);
    return { url, html: "", fromCache: false, fetchedAt: new Date().toISOString(), warnings };
  }
}

export function buildArklegBillUrl(billNumber: string, session: string): string {
  const encoded = encodeURIComponent(session);
  return `${ARKLEG_BASE}/Bills/Detail?id=${encodeURIComponent(billNumber)}&ddBienniumSession=${encoded}`;
}
