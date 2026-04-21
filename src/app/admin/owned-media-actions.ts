"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  GeoMetadataSource,
  OwnedMediaKind,
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
import { extractOwnedMediaMetadata } from "@/lib/owned-media/metadata/extract-owned-media-metadata";
import { saveOwnedMediaFile } from "@/lib/owned-media/storage";
import { runTranscriptionForOwnedAsset } from "@/lib/owned-media/transcription/run";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";

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

  await prisma.ownedMediaAsset.create({
    data: {
      id,
      storageKey: saved.storageKey,
      storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
      fileName: saved.fileName,
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
    },
  });

  revalidatePath("/admin/owned-media");
  revalidatePath(`/admin/owned-media/${id}`);
  revalidatePath(`/api/owned-campaign-media/${id}/file`, "page");
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
