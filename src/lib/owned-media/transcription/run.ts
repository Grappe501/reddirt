import { Prisma, TranscriptionJobStatus, TranscriptSource, TranscriptReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getTranscriptionProvider } from "./get-provider";
import type { TranscribeResult } from "./types";

function isTranscribable(mime: string, kind: string): boolean {
  if (kind === "VIDEO" || kind === "AUDIO") return true;
  return mime.startsWith("video/") || mime.startsWith("audio/");
}

/**
 * Queues a sync transcription attempt (or stub failure). For async providers later, replace with a queue table.
 */
export async function runTranscriptionForOwnedAsset(assetId: string): Promise<{ ok: boolean; message: string }> {
  const asset = await prisma.ownedMediaAsset.findUnique({ where: { id: assetId } });
  if (!asset) return { ok: false, message: "Asset not found." };
  if (!isTranscribable(asset.mimeType, asset.kind)) {
    return { ok: false, message: "Transcription only applies to video or audio assets." };
  }

  const provider = getTranscriptionProvider();

  await prisma.ownedMediaAsset.update({
    where: { id: assetId },
    data: { transcriptJobStatus: TranscriptionJobStatus.IN_PROGRESS, transcriptionLastError: null },
  });

  let result: TranscribeResult;
  try {
    result = await provider.transcribe({
      assetId,
      storageKey: asset.storageKey,
      mimeType: asset.mimeType,
      fileName: asset.fileName,
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    await prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: { transcriptJobStatus: TranscriptionJobStatus.FAILED, transcriptionLastError: err },
    });
    return { ok: false, message: err };
  }

  if (!result.ok) {
    await prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: { transcriptJobStatus: TranscriptionJobStatus.FAILED, transcriptionLastError: result.error },
    });
    return { ok: false, message: result.error };
  }

  await prisma.$transaction([
    prisma.ownedMediaTranscript.create({
      data: {
        ownedMediaId: assetId,
        transcriptText: result.transcriptText,
        source: result.source ?? TranscriptSource.ASR,
        language: result.language,
        confidence: result.confidence,
        segmentsJson:
          result.segmentsJson === undefined ? undefined : (result.segmentsJson as Prisma.InputJsonValue),
        reviewStatus: TranscriptReviewStatus.PENDING,
      },
    }),
    prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: { transcriptJobStatus: TranscriptionJobStatus.SUCCEEDED, transcriptionLastError: null },
    }),
  ]);

  return { ok: true, message: "Transcript created (pending review)." };
}
