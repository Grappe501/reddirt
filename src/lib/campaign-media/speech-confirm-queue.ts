/**
 * Speech confirm queue — Speeches path for Publish Queue parity (audit #4).
 */

import { buildSpeechReadinessMatrix, type SpeechReadinessRow } from "@/lib/campaign-media/speech-readiness";

export type SpeechConfirmBucketId =
  | "noCounty"
  | "needsPublish"
  | "published"
  | "prepReady"
  | "overlaySaved";

export type SpeechConfirmQueueItem = {
  id: string;
  title: string;
  counties: string[];
  publicationStatus: string;
  approvedForPublic: boolean;
  readinessScore: number;
  nextAction: string;
  hasMaster: boolean;
  clipCount: number;
};

export type SpeechConfirmQueue = {
  generatedAt: string;
  totals: {
    speeches: number;
    noCounty: number;
    needsPublish: number;
    published: number;
    overlaysSaved: number;
    prepReady: number;
  };
  buckets: Record<SpeechConfirmBucketId, SpeechConfirmQueueItem[]>;
  pathSteps: string[];
  nextActions: string[];
};

const CAP = 30;

function toItem(row: SpeechReadinessRow): SpeechConfirmQueueItem {
  return {
    id: row.id,
    title: row.title,
    counties: row.counties,
    publicationStatus: row.publicationStatus,
    approvedForPublic: row.approvedForPublic,
    readinessScore: row.readinessScore,
    nextAction: row.nextAction,
    hasMaster: row.hasMaster,
    clipCount: row.clipCount,
  };
}

export function buildSpeechConfirmQueue(): SpeechConfirmQueue {
  const matrix = buildSpeechReadinessMatrix();
  const noCounty: SpeechConfirmQueueItem[] = [];
  const needsPublish: SpeechConfirmQueueItem[] = [];
  const published: SpeechConfirmQueueItem[] = [];
  const prepReady: SpeechConfirmQueueItem[] = [];
  const overlaySaved: SpeechConfirmQueueItem[] = [];

  for (const row of matrix.rows) {
    const item = toItem(row);
    if (!row.hasConfirmedCounty) noCounty.push(item);
    if (
      row.hasConfirmedCounty &&
      row.publicationStatus !== "PUBLISHED" &&
      row.approvedForPublic !== false
    ) {
      needsPublish.push(item);
    }
    if (row.kellySpeaksEligible) published.push(item);
    if (row.hasMaster || row.clipCount > 0 || row.assemblyCount > 0) prepReady.push(item);
    if (row.hasOverlay) overlaySaved.push(item);
  }

  const nextActions: string[] = [];
  if (matrix.totals.noCounty > 0) {
    nextActions.push(`Confirm counties on ${matrix.totals.noCounty} speech(es) (Unknown stays Unknown).`);
  }
  if (matrix.totals.needsPublish > 0) {
    nextActions.push(
      `Batch Approve/Publish ${matrix.totals.needsPublish} geo-confirmed speech(es) for /kelly-speaks.`,
    );
  }
  if (matrix.totals.overlaysSaved > 0) {
    nextActions.push("Commit data/campaign-media/speech-evidence.json when ready to ship.");
  }
  if (!nextActions.length) {
    nextActions.push("Speech confirm queue clear — keep readiness as new videos land.");
  }

  const cap = <T,>(arr: T[]) => arr.slice(0, CAP);

  return {
    generatedAt: matrix.generatedAt,
    totals: matrix.totals,
    buckets: {
      noCounty: cap(noCounty),
      needsPublish: cap(needsPublish),
      published: cap(published),
      prepReady: cap(prepReady),
      overlaySaved: cap(overlaySaved),
    },
    pathSteps: [
      "Videos tab → confirm county / proof → Save",
      "Batch Approve (status APPROVED)",
      "Batch Publish (PUBLISHED → kelly-speaks)",
      "Optional: homepage candidate + Placement propose",
      "Commit speech-evidence.json to ship",
    ],
    nextActions,
  };
}
