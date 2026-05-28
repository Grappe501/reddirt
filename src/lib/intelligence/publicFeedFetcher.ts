import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  type ApprovedMediaSource,
  computeContentHash,
  dedupeMediaFindings,
  loadApprovedMediaSources,
  loadPublicMediaIntakeQueue,
  normalizePublicMediaFinding,
  PUBLIC_MEDIA_INTAKE_QUEUE_REL,
  type PublicMediaIntakeFinding,
} from "@/lib/intelligence/publicMediaIntake";
import {
  canFetchMediaSource,
  getFeedApprovalBlockers,
  toFeedApprovalCheck,
} from "@/lib/intelligence/mediaFeedApprovalGate";

export type RssFeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
  author: string | null;
};

export type FeedFetchResult = {
  sourceId: string;
  ok: boolean;
  skipped: boolean;
  skipReason?: string;
  itemCount: number;
  findings: PublicMediaIntakeFinding[];
  error?: string;
};

export type IntakePassResult = {
  dryRun: boolean;
  fetchedSources: number;
  skippedSources: number;
  newFindings: number;
  duplicateFindings: number;
  skipLog: Array<{ sourceId: string; reason: string }>;
  results: FeedFetchResult[];
};

export function shouldSkipSource(source: ApprovedMediaSource): { skip: boolean; reason: string } {
  const blockers = getFeedApprovalBlockers(toFeedApprovalCheck(source));
  if (blockers.length > 0) {
    return { skip: true, reason: blockers.join("; ") };
  }
  if (!canFetchMediaSource(toFeedApprovalCheck(source))) {
    return { skip: true, reason: "Feed approval gate blocked source." };
  }
  return { skip: false, reason: "" };
}

export function parseRssItems(xml: string): RssFeedItem[] {
  const items: RssFeedItem[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  for (const block of itemBlocks) {
    const title = extractTag(block, "title") ?? "Untitled";
    const link = extractTag(block, "link") ?? "";
    const description = stripHtml(extractTag(block, "description") ?? "");
    const pubDate = extractTag(block, "pubDate");
    const author = extractTag(block, "author") ?? extractTag(block, "dc:creator");
    if (link) {
      items.push({ title, link, description, pubDate, author });
    }
  }

  return items;
}

function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!match) return null;
  return decodeXmlEntities(match[1].trim());
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function normalizeFeedItem(
  item: RssFeedItem,
  source: ApprovedMediaSource,
  repoRoot?: string,
): PublicMediaIntakeFinding {
  return normalizePublicMediaFinding({
    source,
    title: item.title,
    summary: item.description || item.title,
    canonicalUrl: item.link,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    author: item.author,
    rawTextExcerpt: (item.description || item.title).slice(0, 280),
    repoRoot,
  });
}

export { computeContentHash };

async function readFeedBody(
  source: ApprovedMediaSource,
  options: { dryRun: boolean; repoRoot: string },
): Promise<string> {
  const rssUrl = source.rssUrl!;
  if (options.dryRun || !rssUrl.startsWith("http")) {
    const localPath = path.isAbsolute(rssUrl)
      ? rssUrl
      : path.join(options.repoRoot, rssUrl);
    if (!existsSync(localPath)) {
      throw new Error(`Local fixture feed not found: ${rssUrl}`);
    }
    return readFileSync(localPath, "utf8");
  }

  const response = await fetch(rssUrl, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`Feed fetch failed: HTTP ${response.status}`);
  }
  return response.text();
}

export async function fetchApprovedRssFeed(
  source: ApprovedMediaSource,
  options: { dryRun?: boolean; repoRoot?: string } = {},
): Promise<FeedFetchResult> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const dryRun = options.dryRun ?? true;
  const skip = shouldSkipSource(source);

  if (skip.skip) {
    return {
      sourceId: source.sourceId,
      ok: false,
      skipped: true,
      skipReason: skip.reason,
      itemCount: 0,
      findings: [],
    };
  }

  try {
    const xml = await readFeedBody(source, { dryRun, repoRoot });
    const items = parseRssItems(xml);
    const findings = items.map((item) => normalizeFeedItem(item, source, repoRoot));
    return {
      sourceId: source.sourceId,
      ok: true,
      skipped: false,
      itemCount: items.length,
      findings,
    };
  } catch (error) {
    return {
      sourceId: source.sourceId,
      ok: false,
      skipped: false,
      itemCount: 0,
      findings: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function runPublicMediaIntakePass(
  options: { dryRun?: boolean; repoRoot?: string; writeQueue?: boolean } = {},
): Promise<IntakePassResult> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const dryRun = options.dryRun ?? true;
  const writeQueue = options.writeQueue ?? false;
  const approved = loadApprovedMediaSources(repoRoot);
  const existing = loadPublicMediaIntakeQueue(repoRoot).findings;

  const skipLog: Array<{ sourceId: string; reason: string }> = [];
  const results: FeedFetchResult[] = [];
  const allIncoming: PublicMediaIntakeFinding[] = [];

  for (const source of approved) {
    const skip = shouldSkipSource(source);
    if (skip.skip) {
      skipLog.push({ sourceId: source.sourceId, reason: skip.reason });
      results.push({
        sourceId: source.sourceId,
        ok: false,
        skipped: true,
        skipReason: skip.reason,
        itemCount: 0,
        findings: [],
      });
      continue;
    }

    const result = await fetchApprovedRssFeed(source, { dryRun, repoRoot });
    results.push(result);
    if (result.ok) {
      allIncoming.push(...result.findings);
    }
  }

  const { unique, duplicates } = dedupeMediaFindings(allIncoming, existing);

  if (writeQueue && unique.length > 0) {
    const queue = loadPublicMediaIntakeQueue(repoRoot);
    queue.findings = [...queue.findings, ...unique];
    queue.generatedAt = new Date().toISOString();
    const { writeFileSync, mkdirSync } = await import("node:fs");
    const target = path.join(repoRoot, PUBLIC_MEDIA_INTAKE_QUEUE_REL);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  }

  return {
    dryRun,
    fetchedSources: results.filter((row) => row.ok).length,
    skippedSources: skipLog.length + results.filter((row) => row.skipped).length,
    newFindings: unique.length,
    duplicateFindings: duplicates.length,
    skipLog,
    results,
  };
}

export function computeContentHashFromParts(title: string, url: string, summary: string): string {
  return createHash("sha256").update(`${url}|${title}|${summary}`).digest("hex").slice(0, 16);
}
