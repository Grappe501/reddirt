"use server";

import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  GeoMetadataSource,
  OwnedMediaColorLabel,
  OwnedMediaKind,
  OwnedMediaNoteType,
  OwnedMediaPickStatus,
  OwnedMediaReviewStatus,
  OwnedMediaRole,
  OwnedMediaSourceType,
  OwnedMediaStorageBackend,
  QuoteCandidateType,
  QuoteReviewStatus,
  TranscriptionJobStatus,
  TranscriptReviewStatus,
  TranscriptSource,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { buildIngestOriginalCanonicalName } from "@/lib/owned-media/campaign-filename";
import { extractOwnedMediaMetadata } from "@/lib/owned-media/metadata/extract-owned-media-metadata";
import { saveOwnedMediaFile } from "@/lib/owned-media/storage";
import { runTranscriptionForOwnedAsset } from "@/lib/owned-media/transcription/run";
import { prisma } from "@/lib/db";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { bulkMediaCenterGovernanceFormSchema } from "@/lib/owned-media/media-center-schemas";
import {
  appendOwnedMediaReviewLog,
  logMediaCenterGovernanceDiffs,
  OwnedMediaReviewAction,
} from "@/lib/owned-media/review-log";

function splitComma(name: string, formData: FormData): string[] {
  return String(formData.get(name) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseEnum<T extends string>(raw: string, values: T[], fallback: T): T {
  return values.includes(raw as T) ? (raw as T) : fallback;
}

export async function uploadOwnedMediaAction(formData: FormData) {
  await requireAdminAction();
  const file = formData.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    redirect("/admin/owned-media?error=upload");
  }

  const id = randomUUID();
  const saved = await saveOwnedMediaFile({ assetId: id, file });

  const titleRaw = String(formData.get("title") ?? "").trim();
  const title = titleRaw || saved.fileName;

  const defaultKind = Object.values(OwnedMediaKind).includes(saved.kind as OwnedMediaKind)
    ? (saved.kind as OwnedMediaKind)
    : OwnedMediaKind.OTHER;
  const kind = parseEnum(
    String(formData.get("kind") ?? defaultKind).toUpperCase(),
    Object.values(OwnedMediaKind) as unknown as OwnedMediaKind[],
    defaultKind
  );
  const role = parseEnum(String(formData.get("role") ?? "OTHER"), Object.values(OwnedMediaRole), OwnedMediaRole.OTHER);
  const sourceType = parseEnum(
    String(formData.get("sourceType") ?? "DIRECT_UPLOAD"),
    Object.values(OwnedMediaSourceType),
    OwnedMediaSourceType.DIRECT_UPLOAD
  );

  const createdBy = String(formData.get("createdBy") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const countySlug = String(formData.get("countySlug") ?? "").trim() || null;
  const countyFips = String(formData.get("countyFips") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const campaignPhase = String(formData.get("campaignPhase") ?? "").trim() || null;
  const contentSeries = String(formData.get("contentSeries") ?? "").trim() || null;
  const speakerName = String(formData.get("speakerName") ?? "").trim() || null;
  const issueTags = splitComma("issueTags", formData);

  const eventDateRaw = String(formData.get("eventDate") ?? "").trim();
  const eventDate = eventDateRaw ? new Date(eventDateRaw) : null;
  if (eventDate && Number.isNaN(eventDate.getTime())) {
    redirect("/admin/owned-media?error=date");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const lm = new Date(file.lastModified);
  const meta = await extractOwnedMediaMetadata({
    buffer: buf,
    fileName: saved.fileName,
    mime: saved.mimeType,
    kind,
    fileStat: { birthtime: lm, mtime: lm, ctime: lm },
  });
  const tagSet = new Set([...issueTags, ...meta.issueTagsFromFilename]);
  const origName = (file as File).name || saved.fileName;
  const anchor = meta.capturedAt ?? lm;
  const { fileName: canonicalName } = buildIngestOriginalCanonicalName({
    originalBaseName: origName,
    anchorDate: anchor,
    ext: path.extname(origName) || path.extname(saved.fileName) || ".bin",
    ingestMode: "upload",
    countySlug: countySlug ?? meta.countySlug,
    subjectHint: title,
    uniquenessKey: id,
  });

  await prisma.ownedMediaAsset.create({
    data: {
      id,
      storageKey: saved.storageKey,
      storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
      fileName: canonicalName,
      originalFileName: origName,
      canonicalFileName: canonicalName,
      fileSizeBytes: saved.fileSizeBytes,
      mimeType: saved.mimeType,
      kind,
      role,
      title,
      description,
      countySlug: countySlug ?? meta.countySlug,
      countyFips: countyFips ?? meta.countyFips,
      city: city ?? meta.city,
      issueTags: [...tagSet],
      campaignPhase,
      contentSeries,
      speakerName,
      sourceType,
      eventDate,
      createdBy,
      publicUrl: null,
      reviewStatus: OwnedMediaReviewStatus.PENDING_REVIEW,
      isPublic: false,
      metadataJson: meta.metadataJson as Prisma.InputJsonValue,
      width: meta.width,
      height: meta.height,
      capturedAt: meta.capturedAt,
      gpsLat: meta.gpsLat,
      gpsLng: meta.gpsLng,
      geoSource: meta.geoSource,
      geoConfidence: meta.geoConfidence,
      needsGeoReview: meta.needsGeoReview,
    },
  });

  revalidatePath("/admin/owned-media");
  redirect(`/admin/owned-media/${id}?uploaded=1`);
}

export async function updateOwnedMediaAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/owned-media?error=id");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/admin/owned-media/${id}?error=title`);

  const kind = parseEnum(String(formData.get("kind") ?? "OTHER"), Object.values(OwnedMediaKind), OwnedMediaKind.OTHER);
  const role = parseEnum(String(formData.get("role") ?? "OTHER"), Object.values(OwnedMediaRole), OwnedMediaRole.OTHER);
  const sourceType = parseEnum(
    String(formData.get("sourceType") ?? "DIRECT_UPLOAD"),
    Object.values(OwnedMediaSourceType),
    OwnedMediaSourceType.OTHER
  );
  const reviewStatus = parseEnum(
    String(formData.get("reviewStatus") ?? "PENDING_REVIEW"),
    Object.values(OwnedMediaReviewStatus),
    OwnedMediaReviewStatus.PENDING_REVIEW
  );

  const description = String(formData.get("description") ?? "").trim() || null;
  const countySlug = String(formData.get("countySlug") ?? "").trim() || null;
  const countyFips = String(formData.get("countyFips") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const campaignPhase = String(formData.get("campaignPhase") ?? "").trim() || null;
  const contentSeries = String(formData.get("contentSeries") ?? "").trim() || null;
  const speakerName = String(formData.get("speakerName") ?? "").trim() || null;
  const createdBy = String(formData.get("createdBy") ?? "").trim() || null;
  const issueTags = splitComma("issueTags", formData);
  const isPublic = formData.get("isPublic") === "on";
  const durationRaw = String(formData.get("durationSeconds") ?? "").trim();
  const durationSeconds = durationRaw ? Number.parseInt(durationRaw, 10) : null;
  const eventDateRaw = String(formData.get("eventDate") ?? "").trim();
  const eventDate = eventDateRaw ? new Date(eventDateRaw) : null;
  if (eventDate && Number.isNaN(eventDate.getTime())) {
    redirect(`/admin/owned-media/${id}?error=date`);
  }

  const capturedAtRaw = String(formData.get("capturedAt") ?? "").trim();
  const capturedAt = capturedAtRaw ? new Date(capturedAtRaw) : null;
  if (capturedAt && Number.isNaN(capturedAt.getTime())) {
    redirect(`/admin/owned-media/${id}?error=date`);
  }

  const gpsLatRaw = String(formData.get("gpsLat") ?? "").trim();
  const gpsLngRaw = String(formData.get("gpsLng") ?? "").trim();
  const gpsLat = gpsLatRaw ? Number.parseFloat(gpsLatRaw) : null;
  const gpsLng = gpsLngRaw ? Number.parseFloat(gpsLngRaw) : null;
  if (gpsLat != null && !Number.isFinite(gpsLat)) redirect(`/admin/owned-media/${id}?error=geo`);
  if (gpsLng != null && !Number.isFinite(gpsLng)) redirect(`/admin/owned-media/${id}?error=geo`);

  const geoSource = parseEnum(
    String(formData.get("geoSource") ?? "NONE"),
    Object.values(GeoMetadataSource),
    GeoMetadataSource.NONE
  );
  const geoConfRaw = String(formData.get("geoConfidence") ?? "").trim();
  const geoConfidence = geoConfRaw ? Number.parseFloat(geoConfRaw) : null;
  const needsGeoReview = formData.get("needsGeoReview") === "on";
  const confirmGeo = formData.get("confirmGeo") === "on";

  const operatorNotes = String(formData.get("operatorNotes") ?? "").trim() || null;
  const captionDraft = String(formData.get("captionDraft") ?? "").trim() || null;
  const shootOverrideRaw = String(formData.get("shootDateOverride") ?? "").trim();
  const shootDateOverride = shootOverrideRaw ? new Date(shootOverrideRaw) : null;
  if (shootDateOverride && Number.isNaN(shootDateOverride.getTime())) {
    redirect(`/admin/owned-media/${id}?error=date`);
  }
  const linkedEventRaw = String(formData.get("linkedCampaignEventId") ?? "").trim();
  const linkedCampaignEventId = linkedEventRaw || null;

  const geoData = confirmGeo
    ? {
        geoSource: GeoMetadataSource.MANUAL,
        geoConfidence: geoConfidence != null && Number.isFinite(geoConfidence) ? geoConfidence : 1,
        needsGeoReview: false,
        gpsLat: gpsLat != null && Number.isFinite(gpsLat) ? gpsLat : null,
        gpsLng: gpsLng != null && Number.isFinite(gpsLng) ? gpsLng : null,
        countySlug: countySlug,
        countyFips: countyFips,
        city: city,
        capturedAt: capturedAt && !Number.isNaN(capturedAt.getTime()) ? capturedAt : null,
      }
    : {
        geoSource,
        geoConfidence: geoConfidence != null && Number.isFinite(geoConfidence) ? geoConfidence : null,
        needsGeoReview,
        gpsLat: gpsLat != null && Number.isFinite(gpsLat) ? gpsLat : null,
        gpsLng: gpsLng != null && Number.isFinite(gpsLng) ? gpsLng : null,
        countySlug,
        countyFips,
        city,
        capturedAt: capturedAt && !Number.isNaN(capturedAt.getTime()) ? capturedAt : null,
      };

  await prisma.ownedMediaAsset.update({
    where: { id },
    data: {
      title,
      description,
      kind,
      role,
      sourceType,
      reviewStatus,
      ...geoData,
      issueTags,
      campaignPhase,
      contentSeries,
      speakerName,
      createdBy,
      isPublic,
      durationSeconds: durationSeconds != null && Number.isFinite(durationSeconds) ? durationSeconds : null,
      eventDate: eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate : null,
      operatorNotes,
      captionDraft,
      shootDateOverride: shootDateOverride && !Number.isNaN(shootDateOverride.getTime()) ? shootDateOverride : null,
      linkedCampaignEventId,
    },
  });

  revalidatePath("/admin/owned-media");
  revalidatePath(`/admin/owned-media/${id}`);
  revalidatePath(`/api/owned-campaign-media/${id}/file`, "page");
  const a = await prisma.ownedMediaAsset.findUnique({ where: { id }, select: { mediaIngestBatchId: true } });
  if (a?.mediaIngestBatchId) {
    revalidatePath("/admin/owned-media/batches");
    revalidatePath(`/admin/owned-media/batches/${a.mediaIngestBatchId}`);
  }
  redirect(`/admin/owned-media/${id}?saved=1`);
}

export async function addTranscriptAction(formData: FormData) {
  await requireAdminAction();
  const ownedMediaId = String(formData.get("ownedMediaId") ?? "").trim();
  if (!ownedMediaId) redirect("/admin/owned-media?error=media");
  const text = String(formData.get("transcriptText") ?? "").trim();
  if (!text) redirect(`/admin/owned-media/${ownedMediaId}?error=transcript`);
  const source = parseEnum(String(formData.get("transcriptSource") ?? "HUMAN"), Object.values(TranscriptSource), TranscriptSource.HUMAN);
  const language = String(formData.get("language") ?? "").trim() || null;
  const reviewStatus = parseEnum(
    String(formData.get("transcriptReviewStatus") ?? "PENDING"),
    Object.values(TranscriptReviewStatus),
    TranscriptReviewStatus.PENDING
  );

  await prisma.ownedMediaTranscript.create({
    data: { ownedMediaId, transcriptText: text, source, language, reviewStatus },
  });
  revalidatePath(`/admin/owned-media/${ownedMediaId}`);
  redirect(`/admin/owned-media/${ownedMediaId}?transcript=1`);
}

export async function requestTranscriptionAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/owned-media?error=id");

  await prisma.ownedMediaAsset.update({
    where: { id },
    data: { transcriptJobStatus: TranscriptionJobStatus.QUEUED, transcriptionLastError: null },
  });
  revalidatePath(`/admin/owned-media/${id}`);

  const { ok } = await runTranscriptionForOwnedAsset(id);
  revalidatePath(`/admin/owned-media/${id}`);
  redirect(`/admin/owned-media/${id}?asr=${ok ? "1" : "0"}`);
}

export async function addQuoteCandidateAction(formData: FormData) {
  await requireAdminAction();
  const ownedMediaId = String(formData.get("ownedMediaId") ?? "").trim();
  if (!ownedMediaId) redirect("/admin/owned-media?error=media");
  const quoteText = String(formData.get("quoteText") ?? "").trim();
  if (!quoteText) redirect(`/admin/owned-media/${ownedMediaId}?error=quote`);
  const transcriptId = String(formData.get("transcriptId") ?? "").trim() || null;
  const startRaw = String(formData.get("startSeconds") ?? "").trim();
  const endRaw = String(formData.get("endSeconds") ?? "").trim();
  const startSeconds = startRaw ? Number.parseFloat(startRaw) : null;
  const endSeconds = endRaw ? Number.parseFloat(endRaw) : null;
  const issueTags = splitComma("issueTags", formData);
  const countySlug = String(formData.get("quoteCountySlug") ?? "").trim() || null;
  const quoteType = parseEnum(
    String(formData.get("quoteType") ?? "SUGGESTED"),
    Object.values(QuoteCandidateType),
    QuoteCandidateType.SUGGESTED
  );
  const reviewStatus = parseEnum(
    String(formData.get("quoteReviewStatus") ?? "PENDING"),
    Object.values(QuoteReviewStatus),
    QuoteReviewStatus.PENDING
  );
  const featuredWeight = String(formData.get("featuredWeight") ?? "").trim();
  const fw = featuredWeight ? Number.parseInt(featuredWeight, 10) : null;

  await prisma.ownedMediaQuoteCandidate.create({
    data: {
      ownedMediaId,
      transcriptId: transcriptId || null,
      quoteText,
      startSeconds: startSeconds != null && Number.isFinite(startSeconds) ? startSeconds : null,
      endSeconds: endSeconds != null && Number.isFinite(endSeconds) ? endSeconds : null,
      issueTags,
      countySlug,
      quoteType,
      reviewStatus,
      featuredWeight: fw != null && Number.isFinite(fw) ? fw : null,
    },
  });
  revalidatePath(`/admin/owned-media/${ownedMediaId}`);
  redirect(`/admin/owned-media/${ownedMediaId}?quote=1`);
}

export async function updateTranscriptReviewAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  const ownedMediaId = String(formData.get("ownedMediaId") ?? "").trim();
  if (!id || !ownedMediaId) redirect("/admin/owned-media?error=transcript");
  const reviewStatus = parseEnum(
    String(formData.get("reviewStatus") ?? "PENDING"),
    Object.values(TranscriptReviewStatus),
    TranscriptReviewStatus.PENDING
  );
  await prisma.ownedMediaTranscript.update({ where: { id }, data: { reviewStatus } });
  revalidatePath(`/admin/owned-media/${ownedMediaId}`);
  redirect(`/admin/owned-media/${ownedMediaId}?trev=1`);
}

export async function updateQuoteReviewAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  const ownedMediaId = String(formData.get("ownedMediaId") ?? "").trim();
  if (!id || !ownedMediaId) redirect("/admin/owned-media?error=quote");
  const reviewStatus = parseEnum(
    String(formData.get("reviewStatus") ?? "PENDING"),
    Object.values(QuoteReviewStatus),
    QuoteReviewStatus.PENDING
  );
  await prisma.ownedMediaQuoteCandidate.update({ where: { id }, data: { reviewStatus } });
  revalidatePath(`/admin/owned-media/${ownedMediaId}`);
  redirect(`/admin/owned-media/${ownedMediaId}?qrev=1`);
}

/** Bulk update by explicit asset ids (newline or comma separated). */
export async function bulkUpdateOwnedMediaByIdsAction(formData: FormData) {
  await requireAdminAction();
  const raw = String(formData.get("ids") ?? "");
  const ids = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    redirect("/admin/owned-media?error=bulk_ids");
  }
  const reviewStatus = parseEnum(
    String(formData.get("reviewStatus") ?? "PENDING_REVIEW"),
    Object.values(OwnedMediaReviewStatus),
    OwnedMediaReviewStatus.PENDING_REVIEW
  );
  const isPublic = String(formData.get("isPublic") ?? "false") === "true";
  const r = await prisma.ownedMediaAsset.updateMany({
    where: { id: { in: ids } },
    data: { reviewStatus, isPublic },
  });
  revalidatePath("/admin/owned-media");
  revalidatePath("/resources");
  redirect(`/admin/owned-media?bulk=${r.count}`);
}

/** All assets linked to a `MediaIngestBatch` (folder/device ingest). */
export async function bulkUpdateOwnedMediaByIngestBatchAction(formData: FormData) {
  await requireAdminAction();
  const mediaIngestBatchId = String(formData.get("mediaIngestBatchId") ?? "").trim();
  if (!mediaIngestBatchId) {
    redirect("/admin/owned-media?error=bulk_batch");
  }
  const reviewStatus = parseEnum(
    String(formData.get("reviewStatus") ?? "PENDING_REVIEW"),
    Object.values(OwnedMediaReviewStatus),
    OwnedMediaReviewStatus.PENDING_REVIEW
  );
  const isPublic = String(formData.get("isPublic") ?? "false") === "true";
  const r = await prisma.ownedMediaAsset.updateMany({
    where: { mediaIngestBatchId },
    data: { reviewStatus, isPublic },
  });
  revalidatePath("/admin/owned-media");
  revalidatePath("/resources");
  redirect(`/admin/owned-media?bulkBatch=${r.count}`);
}

export async function quickReviewOwnedMediaAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/owned-media?error=id");
  const reviewStatus = parseEnum(
    String(formData.get("reviewStatus") ?? "PENDING_REVIEW"),
    Object.values(OwnedMediaReviewStatus),
    OwnedMediaReviewStatus.PENDING_REVIEW
  );
  const isPublic = formData.get("isPublic") === "on";
  await prisma.ownedMediaAsset.update({ where: { id }, data: { reviewStatus, isPublic } });

  revalidatePath("/admin/owned-media");
  revalidatePath(`/admin/owned-media/${id}`);
  const batchId = String(formData.get("returnBatchId") ?? "").trim();
  if (batchId) revalidatePath(`/admin/owned-media/batches/${batchId}`);
  const nextId = String(formData.get("nextId") ?? "").trim();
  if (nextId && batchId) {
    redirect(`/admin/owned-media/${nextId}?batch=${encodeURIComponent(batchId)}&reviewed=1`);
  }
  if (batchId) redirect(`/admin/owned-media/batches/${batchId}?reviewed=1`);
  redirect(`/admin/owned-media/${id}?saved=1`);
}

export async function addOwnedMediaAnnotationAction(formData: FormData) {
  await requireAdminAction();
  const ownedMediaId = String(formData.get("ownedMediaId") ?? "").trim();
  if (!ownedMediaId) redirect("/admin/owned-media?error=media");
  const noteText = String(formData.get("noteText") ?? "").trim();
  if (!noteText) redirect(`/admin/owned-media/${ownedMediaId}?error=note`);
  const noteType = parseEnum(
    String(formData.get("noteType") ?? "INTERNAL_NOTE"),
    Object.values(OwnedMediaNoteType),
    OwnedMediaNoteType.INTERNAL_NOTE
  );
  const isSearchable = formData.get("isSearchable") === "on";
  await prisma.ownedMediaAnnotation.create({
    data: { ownedMediaId, noteType, noteText, isSearchable },
  });
  revalidatePath(`/admin/owned-media/${ownedMediaId}`);
  const b = String(formData.get("returnBatchId") ?? "").trim();
  if (b) revalidatePath(`/admin/owned-media/batches/${b}`);
  if (b) redirect(`/admin/owned-media/${ownedMediaId}?note=1&batch=${encodeURIComponent(b)}`);
  redirect(`/admin/owned-media/${ownedMediaId}?note=1`);
}

export async function deleteOwnedMediaAnnotationAction(formData: FormData) {
  await requireAdminAction();
  const annotationId = String(formData.get("annotationId") ?? "").trim();
  const ownedMediaId = String(formData.get("ownedMediaId") ?? "").trim();
  if (!annotationId || !ownedMediaId) redirect("/admin/owned-media?error=note");
  await prisma.ownedMediaAnnotation.delete({ where: { id: annotationId } });
  revalidatePath(`/admin/owned-media/${ownedMediaId}`);
  const batch = String(formData.get("returnBatchId") ?? "").trim();
  if (batch) redirect(`/admin/owned-media/${ownedMediaId}?note=1&batch=${encodeURIComponent(batch)}`);
  redirect(`/admin/owned-media/${ownedMediaId}?note=1`);
}

/** Batch apply: review, visibility, optional county + campaign event (ingest batch only). */
export async function bulkUpdateOwnedMediaByIngestBatchExtendedAction(formData: FormData) {
  await requireAdminAction();
  const mediaIngestBatchId = String(formData.get("mediaIngestBatchId") ?? "").trim();
  if (!mediaIngestBatchId) {
    redirect("/admin/owned-media/batches?error=batch");
  }
  const reviewStatus = parseEnum(
    String(formData.get("reviewStatus") ?? "PENDING_REVIEW"),
    Object.values(OwnedMediaReviewStatus),
    OwnedMediaReviewStatus.PENDING_REVIEW
  );
  const isPublic = String(formData.get("isPublic") ?? "false") === "true";
  const applyCounty = formData.get("applyCounty") === "on";
  const applyEvent = formData.get("applyEvent") === "on";
  const countySlug = String(formData.get("countySlug") ?? "").trim() || null;
  const countyFips = String(formData.get("countyFips") ?? "").trim() || null;
  const linkedRaw = String(formData.get("linkedCampaignEventId") ?? "").trim();

  const data: Prisma.OwnedMediaAssetUncheckedUpdateManyWithoutMediaIngestBatchInput = {
    reviewStatus,
    isPublic,
  };
  if (applyCounty) {
    data.countySlug = countySlug;
    data.countyFips = countyFips;
  }
  if (applyEvent) {
    data.linkedCampaignEventId = linkedRaw === "" || linkedRaw === "__clear__" ? null : linkedRaw;
  }

  const r = await prisma.ownedMediaAsset.updateMany({
    where: { mediaIngestBatchId },
    data,
  });
  revalidatePath("/admin/owned-media");
  revalidatePath(`/admin/owned-media/batches/${mediaIngestBatchId}`);
  revalidatePath("/resources");
  redirect(`/admin/owned-media/batches/${mediaIngestBatchId}?bulk=${r.count}`);
}

const MC_PATH = "/admin/owned-media/grid";

export async function updateMediaCenterTriageAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("ownedMediaId") ?? "").trim();
  if (!id) return;
  const actor = await getAdminActorUserId();
  let beforeRow: {
    rating: number | null;
    pickStatus: OwnedMediaPickStatus;
    colorLabel: OwnedMediaColorLabel;
    isFavorite: boolean;
    approvedForPress: boolean;
    approvedForPublicSite: boolean;
    approvedForSocial: boolean;
    reviewNotes: string | null;
    staffReviewNotes: string | null;
  } | null = null;
  try {
    beforeRow = await prisma.ownedMediaAsset.findUnique({
      where: { id },
      select: {
        rating: true,
        pickStatus: true,
        colorLabel: true,
        isFavorite: true,
        approvedForPress: true,
        approvedForPublicSite: true,
        approvedForSocial: true,
        reviewNotes: true,
        staffReviewNotes: true,
      },
    });
  } catch {
    return;
  }
  if (!beforeRow) return;

  const ratingRaw = String(formData.get("rating") ?? "").trim();
  let rating: number | null = null;
  if (ratingRaw !== "") {
    const n = Math.floor(Number(ratingRaw));
    if (!Number.isNaN(n) && n >= 1 && n <= 5) rating = n;
  }
  const pickStatus = parseEnum(
    String(formData.get("pickStatus") ?? "UNRATED"),
    Object.values(OwnedMediaPickStatus),
    OwnedMediaPickStatus.UNRATED
  );
  const colorLabel = parseEnum(
    String(formData.get("colorLabel") ?? "NONE"),
    Object.values(OwnedMediaColorLabel),
    OwnedMediaColorLabel.NONE
  );
  const isFavorite = formData.get("isFavorite") === "on";
  const approvedForPress = formData.get("approvedForPress") === "on";
  const approvedForPublicSite = formData.get("approvedForPublicSite") === "on";
  const approvedForSocial = formData.get("approvedForSocial") === "on";
  const reviewNotes = String(formData.get("reviewNotes") ?? "").trim() || null;
  const staffReviewNotes = String(formData.get("staffReviewNotes") ?? "").trim() || null;

  const afterRow = {
    rating,
    pickStatus,
    colorLabel,
    isFavorite,
    approvedForPress,
    approvedForPublicSite,
    approvedForSocial,
    reviewNotes,
    staffReviewNotes,
  };

  try {
    await prisma.ownedMediaAsset.update({
      where: { id },
      data: {
        rating,
        pickStatus,
        colorLabel,
        isFavorite,
        approvedForPress,
        approvedForPublicSite,
        approvedForSocial,
        reviewNotes,
        staffReviewNotes,
      },
    });
  } catch {
    return;
  }
  await logMediaCenterGovernanceDiffs(actor, id, beforeRow, afterRow);
  revalidatePath(MC_PATH);
  revalidatePath("/admin/owned-campaign-library");
  revalidatePath(`/admin/owned-media/${id}`);
}

export async function setMediaCenterReviewedAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("ownedMediaId") ?? "").trim();
  if (!id) return;
  const mark = String(formData.get("markReviewed") ?? "");
  const setReviewed = mark === "1";
  const actor = await getAdminActorUserId();
  let prevReviewedAt: Date | null = null;
  let prevReviewer: string | null = null;
  try {
    const prev = await prisma.ownedMediaAsset.findUnique({
      where: { id },
      select: { reviewedAt: true, reviewedByUserId: true },
    });
    prevReviewedAt = prev?.reviewedAt ?? null;
    prevReviewer = prev?.reviewedByUserId ?? null;
    await prisma.ownedMediaAsset.update({
      where: { id },
      data: setReviewed
        ? { reviewedAt: new Date(), reviewedByUserId: actor }
        : { reviewedAt: null, reviewedByUserId: null },
    });
  } catch {
    return;
  }
  await appendOwnedMediaReviewLog({
    ownedMediaId: id,
    userId: actor,
    action: setReviewed ? OwnedMediaReviewAction.MARK_REVIEWED : OwnedMediaReviewAction.CLEAR_REVIEWED,
    fromSnapshot: {
      reviewedAt: prevReviewedAt ? prevReviewedAt.toISOString() : null,
      reviewedByUserId: prevReviewer,
    },
    toSnapshot: setReviewed
      ? { reviewedAt: new Date().toISOString(), reviewedByUserId: actor }
      : { reviewedAt: null, reviewedByUserId: null },
  });
  revalidatePath(MC_PATH);
  revalidatePath(`/admin/owned-media/${id}`);
}

export async function addOwnedMediaToCollectionAction(formData: FormData) {
  await requireAdminAction();
  const ownedMediaId = String(formData.get("ownedMediaId") ?? "").trim();
  const collectionId = String(formData.get("collectionId") ?? "").trim();
  if (!ownedMediaId || !collectionId) return;
  const actor = await getAdminActorUserId();
  let colName: string | null = null;
  try {
    const col = await prisma.ownedMediaCollection.findUnique({
      where: { id: collectionId },
      select: { name: true },
    });
    colName = col?.name ?? null;
    const already = await prisma.ownedMediaCollectionItem.findUnique({
      where: { collectionId_ownedMediaId: { collectionId, ownedMediaId } },
      select: { id: true },
    });
    await prisma.ownedMediaCollectionItem.upsert({
      where: { collectionId_ownedMediaId: { collectionId, ownedMediaId } },
      create: { collectionId, ownedMediaId },
      update: {},
    });
    if (!already) {
      await appendOwnedMediaReviewLog({
        ownedMediaId,
        userId: actor,
        action: OwnedMediaReviewAction.COLLECTION_ADD,
        toSnapshot: { collectionId, collectionName: colName },
        note: colName ? `Added to collection “${colName}”` : `Added to collection ${collectionId}`,
      });
    }
  } catch {
    return;
  }
  revalidatePath(MC_PATH);
  revalidatePath("/admin/owned-campaign-library");
}

export async function bulkMediaCenterGovernanceAction(formData: FormData) {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  const pickRaw = String(formData.get("pickStatus") ?? "").trim();
  const colorRaw = String(formData.get("colorLabel") ?? "").trim();
  const parsed = bulkMediaCenterGovernanceFormSchema.safeParse({
    assetIds: String(formData.get("assetIds") ?? ""),
    returnPath: String(formData.get("returnPath") ?? MC_PATH),
    intent: String(formData.get("intent") ?? ""),
    pickStatus:
      pickRaw && Object.values(OwnedMediaPickStatus).includes(pickRaw as OwnedMediaPickStatus)
        ? pickRaw
        : undefined,
    colorLabel:
      colorRaw && Object.values(OwnedMediaColorLabel).includes(colorRaw as OwnedMediaColorLabel)
        ? colorRaw
        : undefined,
    collectionId: String(formData.get("collectionId") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    redirect(MC_PATH);
  }
  const { assetIds, intent, returnPath } = parsed.data;
  const safeReturn = returnPath.startsWith("/admin/owned-media/grid") ? returnPath : MC_PATH;

  for (const id of assetIds) {
    const row = await prisma.ownedMediaAsset.findUnique({ where: { id } });
    if (!row) continue;

    switch (intent) {
      case "favorite_on": {
        if (!row.isFavorite) {
          await prisma.ownedMediaAsset.update({ where: { id }, data: { isFavorite: true } });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.FAVORITE,
            fromSnapshot: { isFavorite: false },
            toSnapshot: { isFavorite: true },
            note: "Bulk: favorite on",
          });
        }
        break;
      }
      case "favorite_off": {
        if (row.isFavorite) {
          await prisma.ownedMediaAsset.update({ where: { id }, data: { isFavorite: false } });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.FAVORITE,
            fromSnapshot: { isFavorite: true },
            toSnapshot: { isFavorite: false },
            note: "Bulk: favorite off",
          });
        }
        break;
      }
      case "set_pick": {
        const ps = parsed.data.pickStatus!;
        if (row.pickStatus !== ps) {
          await prisma.ownedMediaAsset.update({ where: { id }, data: { pickStatus: ps } });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.PICK_STATUS,
            fromSnapshot: { pickStatus: row.pickStatus },
            toSnapshot: { pickStatus: ps },
            note: "Bulk: pick status",
          });
        }
        break;
      }
      case "set_color": {
        const cl = parsed.data.colorLabel!;
        if (row.colorLabel !== cl) {
          await prisma.ownedMediaAsset.update({ where: { id }, data: { colorLabel: cl } });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.COLOR_LABEL,
            fromSnapshot: { colorLabel: row.colorLabel },
            toSnapshot: { colorLabel: cl },
            note: "Bulk: color label",
          });
        }
        break;
      }
      case "press_on": {
        if (!row.approvedForPress) {
          await prisma.ownedMediaAsset.update({ where: { id }, data: { approvedForPress: true } });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.APPROVED_PRESS,
            fromSnapshot: { approvedForPress: false },
            toSnapshot: { approvedForPress: true },
            note: "Bulk: press on",
          });
        }
        break;
      }
      case "press_off": {
        if (row.approvedForPress) {
          await prisma.ownedMediaAsset.update({ where: { id }, data: { approvedForPress: false } });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.APPROVED_PRESS,
            fromSnapshot: { approvedForPress: true },
            toSnapshot: { approvedForPress: false },
            note: "Bulk: press off",
          });
        }
        break;
      }
      case "site_on": {
        if (!row.approvedForPublicSite) {
          await prisma.ownedMediaAsset.update({ where: { id }, data: { approvedForPublicSite: true } });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.APPROVED_PUBLIC_SITE,
            fromSnapshot: { approvedForPublicSite: false },
            toSnapshot: { approvedForPublicSite: true },
            note: "Bulk: public site on",
          });
        }
        break;
      }
      case "site_off": {
        if (row.approvedForPublicSite) {
          await prisma.ownedMediaAsset.update({ where: { id }, data: { approvedForPublicSite: false } });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.APPROVED_PUBLIC_SITE,
            fromSnapshot: { approvedForPublicSite: true },
            toSnapshot: { approvedForPublicSite: false },
            note: "Bulk: public site off",
          });
        }
        break;
      }
      case "mark_reviewed": {
        if (!row.reviewedAt) {
          await prisma.ownedMediaAsset.update({
            where: { id },
            data: { reviewedAt: new Date(), reviewedByUserId: actor },
          });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.MARK_REVIEWED,
            fromSnapshot: { reviewedAt: null, reviewedByUserId: null },
            toSnapshot: { reviewedAt: new Date().toISOString(), reviewedByUserId: actor },
            note: "Bulk: mark reviewed",
          });
        }
        break;
      }
      case "clear_reviewed": {
        if (row.reviewedAt) {
          await prisma.ownedMediaAsset.update({
            where: { id },
            data: { reviewedAt: null, reviewedByUserId: null },
          });
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.CLEAR_REVIEWED,
            fromSnapshot: {
              reviewedAt: row.reviewedAt.toISOString(),
              reviewedByUserId: row.reviewedByUserId,
            },
            toSnapshot: { reviewedAt: null, reviewedByUserId: null },
            note: "Bulk: clear reviewed",
          });
        }
        break;
      }
      case "clear_pick_and_color": {
        const touched =
          row.pickStatus !== OwnedMediaPickStatus.UNRATED || row.colorLabel !== OwnedMediaColorLabel.NONE;
        if (touched) {
          await prisma.ownedMediaAsset.update({
            where: { id },
            data: { pickStatus: OwnedMediaPickStatus.UNRATED, colorLabel: OwnedMediaColorLabel.NONE },
          });
          if (row.pickStatus !== OwnedMediaPickStatus.UNRATED) {
            await appendOwnedMediaReviewLog({
              ownedMediaId: id,
              userId: actor,
              action: OwnedMediaReviewAction.PICK_STATUS,
              fromSnapshot: { pickStatus: row.pickStatus },
              toSnapshot: { pickStatus: OwnedMediaPickStatus.UNRATED },
              note: "Bulk: clear pick",
            });
          }
          if (row.colorLabel !== OwnedMediaColorLabel.NONE) {
            await appendOwnedMediaReviewLog({
              ownedMediaId: id,
              userId: actor,
              action: OwnedMediaReviewAction.COLOR_LABEL,
              fromSnapshot: { colorLabel: row.colorLabel },
              toSnapshot: { colorLabel: OwnedMediaColorLabel.NONE },
              note: "Bulk: clear color",
            });
          }
        }
        break;
      }
      case "add_to_collection": {
        const collectionId = parsed.data.collectionId!;
        const col = await prisma.ownedMediaCollection.findUnique({
          where: { id: collectionId },
          select: { name: true },
        });
        const already = await prisma.ownedMediaCollectionItem.findUnique({
          where: { collectionId_ownedMediaId: { collectionId, ownedMediaId: id } },
          select: { id: true },
        });
        await prisma.ownedMediaCollectionItem.upsert({
          where: { collectionId_ownedMediaId: { collectionId, ownedMediaId: id } },
          create: { collectionId, ownedMediaId: id },
          update: {},
        });
        if (!already) {
          await appendOwnedMediaReviewLog({
            ownedMediaId: id,
            userId: actor,
            action: OwnedMediaReviewAction.COLLECTION_ADD,
            toSnapshot: { collectionId, collectionName: col?.name ?? null },
            note: col?.name ? `Bulk: add to “${col.name}”` : "Bulk: add to collection",
          });
        }
        break;
      }
      default:
        break;
    }
  }

  revalidatePath(MC_PATH);
  revalidatePath("/admin/owned-campaign-library");
  redirect(safeReturn);
}
