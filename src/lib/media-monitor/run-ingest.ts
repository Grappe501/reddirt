import Parser from "rss-parser";
import {
  ExternalMediaIngestMethod,
  ExternalMediaMatchTier,
  ExternalMediaMentionType,
  ExternalMediaReviewStatus,
  ExternalMediaSourceType,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { filterSeedsForRun } from "./sources";
import { upsertExternalMediaSourcesFromSeeds } from "./sync-sources";
import { normalizeCanonicalUrl, makeMentionDedupeKey } from "./dedupe-key";
import { isUrlAllowedByRobots, pressMonitorUserAgent } from "./robots";
import { passesKeywordGate, scoreKellyRelevance, defaultMentionTypeForTv } from "./kelly-match";
import { htmlToPlainText, clipText } from "./extract-text";
import { mapMentionType, mapTier, refineMentionWithOpenAi } from "./openai-mention-refine";
import { indexExternalMediaMentionSearch } from "./index-mention-search";

const parser = new Parser({ timeout: 20_000 });

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export type RunExternalMediaIngestOptions = {
  label?: string;
  dryRun?: boolean;
  verticalSliceOnly?: boolean;
  sourceSlug?: string | null;
  incremental?: boolean;
  useOpenAiRefine?: boolean;
};

export type RunExternalMediaIngestResult = {
  runId: string;
  itemsDiscovered: number;
  itemsInserted: number;
  itemsUpdated: number;
  skipped: number;
  errors: string[];
  error?: string;
};

async function fetchArticlePlainText(url: string): Promise<{ text: string | null; ok: boolean }> {
  const robots = await isUrlAllowedByRobots(url);
  if (!robots.ok) return { text: null, ok: false };
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": pressMonitorUserAgent(),
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(18_000),
      redirect: "follow",
    });
    if (!res.ok) return { text: null, ok: false };
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
      return { text: null, ok: true };
    }
    const html = await res.text();
    const text = clipText(htmlToPlainText(html), 50_000);
    if (text.length < 80) return { text: null, ok: true };
    const lower = text.slice(0, 600).toLowerCase();
    if ((lower.match(/subscribe/g) ?? []).length >= 2 && text.length < 400) {
      return { text: null, ok: true };
    }
    return { text, ok: true };
  } catch {
    return { text: null, ok: false };
  }
}

function reviewStatusForTier(tier: ExternalMediaMatchTier): ExternalMediaReviewStatus {
  if (tier === ExternalMediaMatchTier.UNCERTAIN) return ExternalMediaReviewStatus.NEEDS_REVIEW;
  return ExternalMediaReviewStatus.PENDING;
}

export async function runExternalMediaIngest(
  options: RunExternalMediaIngestOptions = {},
): Promise<RunExternalMediaIngestResult> {
  const dryRun = Boolean(options.dryRun);
  const verticalSliceOnly = options.verticalSliceOnly !== false;
  const useOpenAiRefine = Boolean(options.useOpenAiRefine);
  const errors: string[] = [];
  let itemsDiscovered = 0;
  let itemsInserted = 0;
  let itemsUpdated = 0;
  let skipped = 0;

  let incrementalSince: Date | null = null;
  if (options.incremental) {
    const last = await prisma.externalMediaIngestRun.findFirst({
      where: { finishedAt: { not: null }, error: null },
      orderBy: { finishedAt: "desc" },
    });
    incrementalSince = last?.finishedAt ?? null;
  }

  const run = await prisma.externalMediaIngestRun.create({
    data: {
      label: options.label ?? "manual",
      dryRun,
      sourceSlug: options.sourceSlug ?? null,
      incrementalSince,
    },
  });

  try {
    const seeds = filterSeedsForRun({
      verticalSliceOnly,
      singleSlug: options.sourceSlug ?? null,
    });
    await upsertExternalMediaSourcesFromSeeds(seeds);

    const incrementalCutoff = incrementalSince;

    for (const seed of seeds) {
      const dbSource = await prisma.externalMediaSource.findUnique({ where: { slug: seed.slug } });
      if (!dbSource?.rssUrl?.trim()) {
        skipped += 1;
        continue;
      }

      const feedUrl = dbSource.rssUrl.trim();
      const robotsFeed = await isUrlAllowedByRobots(feedUrl);
      if (!robotsFeed.ok) {
        errors.push(`${seed.slug}: robots blocked feed ${feedUrl}`);
        continue;
      }

      let feed: Awaited<ReturnType<typeof parser.parseURL>>;
      try {
        feed = await parser.parseURL(feedUrl);
      } catch (e) {
        errors.push(`${seed.slug}: RSS parse failed — ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }

      if (!dryRun) {
        await prisma.externalMediaSource.update({
          where: { id: dbSource.id },
          data: { lastFetchedAt: new Date() },
        });
      }

      const items = feed.items ?? [];
      for (const item of items) {
        const link = (item.link ?? (typeof item.guid === "string" ? item.guid : "")).trim();
        if (!link) {
          skipped += 1;
          continue;
        }
        const title = (item.title ?? "Untitled").trim();
        const summary = (item.contentSnippet ?? item.summary ?? "").trim();
        if (!passesKeywordGate(title, summary, link)) {
          skipped += 1;
          continue;
        }

        const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
        if (incrementalCutoff && publishedAt && publishedAt < incrementalCutoff) {
          skipped += 1;
          continue;
        }

        itemsDiscovered += 1;
        const canonicalUrl = normalizeCanonicalUrl(link);
        const dedupeKey = makeMentionDedupeKey({
          sourceSlug: seed.slug,
          canonicalUrl,
          publishedAt,
          title,
        });

        let scored = scoreKellyRelevance(`${title}\n${summary}`, link);
        let sentimentHint: string | null = null;
        let openAiRefinedFlag = false;
        if (
          useOpenAiRefine &&
          (scored.matchTier === ExternalMediaMatchTier.UNCERTAIN ||
            scored.matchTier === ExternalMediaMatchTier.NOT_RELEVANT)
        ) {
          const refined = await refineMentionWithOpenAi({
            title,
            summary,
            url: link,
            excerpt: summary,
          });
          if (refined) {
            openAiRefinedFlag = true;
            sentimentHint = refined.sentimentHint;
            scored = {
              matchTier: mapTier(refined.matchTier),
              confidenceScore: refined.confidenceScore,
              mentionType: mapMentionType(refined.mentionType),
              isOpinion: refined.isOpinion,
              isEditorial: refined.isEditorial,
            };
          }
        }

        if (scored.matchTier === ExternalMediaMatchTier.NOT_RELEVANT) {
          skipped += 1;
          continue;
        }

        const robotsItem = await isUrlAllowedByRobots(link);
        let fullText: string | null = null;
        const transcriptMissing = dbSource.sourceType === ExternalMediaSourceType.TV;
        if (robotsItem.ok) {
          await sleep(450);
          const fetched = await fetchArticlePlainText(link);
          if (fetched.text) {
            const reScored = scoreKellyRelevance(`${title}\n${summary}\n${fetched.text.slice(0, 8000)}`, link);
            if (reScored.matchTier !== ExternalMediaMatchTier.NOT_RELEVANT) {
              scored = reScored;
            }
            fullText = fetched.text;
          }
        } else {
          errors.push(`${seed.slug}: robots blocked article ${link}`);
        }

        if (scored.matchTier === ExternalMediaMatchTier.NOT_RELEVANT) {
          skipped += 1;
          continue;
        }

        const mentionType =
          dbSource.sourceType === ExternalMediaSourceType.TV && scored.mentionType === ExternalMediaMentionType.NEWS_ARTICLE
            ? defaultMentionTypeForTv(dbSource.sourceType)
            : scored.mentionType;

        const existing = await prisma.externalMediaMention.findUnique({ where: { dedupeKey } });
        let rawPayload: Prisma.InputJsonValue | undefined;
        try {
          rawPayload = JSON.parse(JSON.stringify(item)) as Prisma.InputJsonValue;
        } catch {
          rawPayload = { title, link };
        }

        const baseData: Prisma.ExternalMediaMentionCreateInput = {
          source: { connect: { id: dbSource.id } },
          sourceName: dbSource.name,
          sourceType: dbSource.sourceType,
          sourceRegion: dbSource.region,
          cityCoverage: dbSource.coveredCities,
          title,
          url: link,
          canonicalUrl,
          dedupeKey,
          publishedAt,
          author: item.creator?.trim() || item.author?.trim() || null,
          section: null,
          summary: summary || null,
          fullText,
          transcriptText: null,
          transcriptMissing,
          mentionType,
          confidenceScore: scored.confidenceScore,
          matchTier: scored.matchTier,
          matchedEntityName: "Kelly Grappe",
          matchedPersonName: "Kelly Grappe",
          isOpinion: scored.isOpinion,
          isEditorial: scored.isEditorial,
          sentimentHint,
          ingestionMethod: ExternalMediaIngestMethod.RSS,
          reviewStatus: reviewStatusForTier(scored.matchTier),
          openAiRefined: openAiRefinedFlag,
          rawPayload,
        };

        if (dryRun) {
          continue;
        }

        if (existing) {
          await prisma.externalMediaMention.update({
            where: { id: existing.id },
            data: {
              sourceName: baseData.sourceName,
              sourceType: baseData.sourceType,
              sourceRegion: baseData.sourceRegion,
              cityCoverage: baseData.cityCoverage,
              title: baseData.title,
              url: baseData.url,
              canonicalUrl: baseData.canonicalUrl,
              publishedAt: baseData.publishedAt,
              author: baseData.author,
              section: baseData.section,
              summary: baseData.summary,
              fullText: baseData.fullText,
              transcriptText: baseData.transcriptText,
              transcriptMissing: baseData.transcriptMissing,
              mentionType: baseData.mentionType,
              confidenceScore: baseData.confidenceScore,
              matchTier: baseData.matchTier,
              matchedEntityName: baseData.matchedEntityName,
              matchedPersonName: baseData.matchedPersonName,
              isOpinion: baseData.isOpinion,
              isEditorial: baseData.isEditorial,
              sentimentHint: baseData.sentimentHint,
              ingestionMethod: baseData.ingestionMethod,
              reviewStatus: baseData.reviewStatus,
              openAiRefined: baseData.openAiRefined,
              rawPayload: baseData.rawPayload,
            },
          });
          itemsUpdated += 1;
          await indexExternalMediaMentionSearch(existing.id);
        } else {
          const created = await prisma.externalMediaMention.create({ data: baseData });
          itemsInserted += 1;
          await indexExternalMediaMentionSearch(created.id);
        }
      }
    }

    await prisma.externalMediaIngestRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        itemsDiscovered,
        itemsInserted,
        itemsUpdated,
        errorsJson: errors.length ? errors : undefined,
        summaryJson: {
          verticalSliceOnly,
          incremental: Boolean(options.incremental),
          seedsTried: seeds.length,
        } as object,
      },
    });

    return {
      runId: run.id,
      itemsDiscovered,
      itemsInserted,
      itemsUpdated,
      skipped,
      errors,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.externalMediaIngestRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), error: msg, errorsJson: errors },
    });
    return {
      runId: run.id,
      itemsDiscovered,
      itemsInserted,
      itemsUpdated,
      skipped,
      errors,
      error: msg,
    };
  }
}
