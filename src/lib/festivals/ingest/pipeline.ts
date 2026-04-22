import {
  FestivalIngestReviewStatus,
  FestivalSourceChannel,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import type { NormalizedFestivalCandidate } from "./types";
import { collectFromRegistry } from "./sources";

export type IngestPipelineResult = {
  runId: string;
  inserted: number;
  updated: number;
  skipped: number;
  error?: string;
};

function mapChannel(c: NormalizedFestivalCandidate["sourceChannel"]): FestivalSourceChannel {
  return c as FestivalSourceChannel;
}

export async function runFestivalIngestPipeline(options?: { label?: string }): Promise<IngestPipelineResult> {
  const run = await prisma.festivalIngestRun.create({
    data: { label: options?.label ?? "scheduled" },
  });

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  try {
    const candidates = await collectFromRegistry();
    const now = new Date();

    for (const c of candidates) {
      if (!c.sourceUrl?.trim()) {
        skipped += 1;
        continue;
      }
      const sourceUrl = c.sourceUrl.trim();
      const exists = await prisma.arkansasFestivalIngest.findUnique({ where: { sourceUrl } });

      if (exists) {
        await prisma.arkansasFestivalIngest.update({
          where: { id: exists.id },
          data: {
            name: c.name.trim(),
            shortDescription: c.shortDescription?.trim() ?? null,
            startAt: new Date(c.startAt),
            endAt: new Date(c.endAt),
            timezone: c.timezone ?? "America/Chicago",
            city: c.city?.trim() ?? null,
            countyId: c.countyId ?? null,
            latitude: c.latitude ?? null,
            longitude: c.longitude ?? null,
            venueName: c.venueName?.trim() ?? null,
            sourceChannel: mapChannel(c.sourceChannel),
            sourceFingerprint: c.sourceFingerprint?.trim() ?? null,
            rawPayload: c.rawPayload ? (c.rawPayload as Prisma.InputJsonValue) : undefined,
            lastSeenInIngestAt: now,
            ingestRunId: run.id,
          },
        });
        updated += 1;
      } else {
        await prisma.arkansasFestivalIngest.create({
          data: {
            name: c.name.trim(),
            shortDescription: c.shortDescription?.trim() ?? null,
            startAt: new Date(c.startAt),
            endAt: new Date(c.endAt),
            timezone: c.timezone ?? "America/Chicago",
            city: c.city?.trim() ?? null,
            countyId: c.countyId ?? null,
            latitude: c.latitude ?? null,
            longitude: c.longitude ?? null,
            venueName: c.venueName?.trim() ?? null,
            sourceChannel: mapChannel(c.sourceChannel),
            sourceUrl,
            sourceFingerprint: c.sourceFingerprint?.trim() ?? null,
            rawPayload: c.rawPayload ? (c.rawPayload as Prisma.InputJsonValue) : undefined,
            reviewStatus: FestivalIngestReviewStatus.PENDING_REVIEW,
            isVisibleOnSite: false,
            lastSeenInIngestAt: now,
            ingestRunId: run.id,
          },
        });
        inserted += 1;
      }
    }

    await prisma.festivalIngestRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        inserted,
        updated,
        skipped,
        summaryJson: { candidateCount: candidates.length },
      },
    });

    return { runId: run.id, inserted, updated, skipped };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.festivalIngestRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        inserted,
        updated,
        skipped,
        error: msg,
      },
    });
    return { runId: run.id, inserted, updated, skipped, error: msg };
  }
}
