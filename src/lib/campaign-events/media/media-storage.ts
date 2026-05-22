import { createHash, randomBytes } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseFactCardEnvelope } from "../fact-card-envelope";
import { getRecordById } from "../persistence/records";
import { classifyHotWashMedia, isAcceptedHotWashUpload } from "./media-mime";
import {
  buildPathsForContext,
  eventContextFromRecord,
  plannedApprovedPath,
  slugifyEventTitle,
  slugifyUploader,
} from "./media-path-builder";
import type {
  EventMediaContext,
  HotWashApprovalStatus,
  HotWashMediaRecord,
  HotWashUploadSource,
} from "./hot-wash-media-types";
import { getMediaById, listMediaForEvent, upsertMediaRecord } from "./media-index";
import { scaffoldMediaIntelligenceMeta } from "../hot-wash-intelligence/event-intelligence-helpers";

function newMediaId(): string {
  return `hwm-${Date.now()}-${randomBytes(4).toString("hex")}`;
}

function safeStoredFilename(mediaId: string, originalFilename: string): string {
  const base = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${mediaId}-${base || "upload"}`;
}

export async function resolveEventMediaContext(recordId: string): Promise<EventMediaContext> {
  const record = await getRecordById(recordId);
  if (!record) throw new Error("Campaign event record not found.");
  const envelope = parseFactCardEnvelope(record.factCard);
  return eventContextFromRecord({
    recordId: record.id,
    title: record.originalTitle,
    startAt: record.startAt,
    displayCity: record.displayCity,
    county: envelope.data.where.county,
    city: envelope.data.where.city,
  });
}

export async function uploadHotWashMedia(input: {
  eventRecordId: string;
  bytes: Buffer;
  originalFilename: string;
  mimeType: string;
  uploaderName: string;
  uploaderEmail: string;
  uploaderPhone?: string;
  uploadSource: HotWashUploadSource;
  caption?: string;
}): Promise<HotWashMediaRecord> {
  if (!isAcceptedHotWashUpload(input.originalFilename, input.mimeType)) {
    throw new Error("File type not accepted for Hot Wash media intake.");
  }

  const ctx = await resolveEventMediaContext(input.eventRecordId);
  const mediaId = newMediaId();
  const uploaderSlug = slugifyUploader(input.uploaderName, input.uploaderEmail);
  const storedFilename = safeStoredFilename(mediaId, input.originalFilename);
  const { relative, absolute } = buildPathsForContext(ctx, "pending", uploaderSlug, storedFilename);

  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, input.bytes);

  const now = new Date().toISOString();
  const record: HotWashMediaRecord = {
    id: mediaId,
    eventRecordId: ctx.eventRecordId,
    eventTitle: ctx.eventTitle,
    eventDate: ctx.eventDate,
    county: ctx.county,
    countySlug: ctx.countySlug,
    city: ctx.city,
    uploaderName: input.uploaderName.trim() || "Admin",
    uploaderEmail: input.uploaderEmail.trim() || "admin@campaign.local",
    uploaderPhone: input.uploaderPhone?.trim() || undefined,
    uploadSource: input.uploadSource,
    originalFilename: input.originalFilename,
    storedPath: relative.replace(/\\/g, "/"),
    mimeType: input.mimeType || "application/octet-stream",
    mediaType: classifyHotWashMedia(input.originalFilename, input.mimeType),
    approvalStatus: "pending",
    caption: input.caption?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    transcriptionStatus: "not_started",
    chunkingStatus: "not_started",
    countyArchiveStatus: "pending",
    approvedArchivePath: plannedApprovedPath(ctx, storedFilename),
    detectedPeople: [],
    aiEventMetadata: {},
  };
  record.intelligence = { ...scaffoldMediaIntelligenceMeta(record), countyTag: ctx.county };

  await upsertMediaRecord(record);
  return record;
}

async function tryMoveFile(fromAbs: string, toAbs: string): Promise<{ moved: boolean; warning?: string }> {
  try {
    await mkdir(path.dirname(toAbs), { recursive: true });
    await rename(fromAbs, toAbs);
    return { moved: true };
  } catch (e) {
    return { moved: false, warning: (e as Error).message };
  }
}

export async function setMediaApproval(input: {
  mediaId: string;
  status: HotWashApprovalStatus;
  actor: string;
  rejectionReason?: string;
}): Promise<HotWashMediaRecord> {
  const existing = await getMediaById(input.mediaId);
  if (!existing) throw new Error("Media record not found.");

  const ctx: EventMediaContext = {
    eventRecordId: existing.eventRecordId,
    eventTitle: existing.eventTitle,
    eventDate: existing.eventDate,
    eventSlug: slugifyEventTitle(existing.eventTitle),
    county: existing.county,
    countySlug: existing.countySlug,
    city: existing.city,
  };

  const filename = path.basename(existing.storedPath);
  const fromAbs = path.join(process.cwd(), "data", "campaign-events", "media", existing.storedPath);
  const now = new Date().toISOString();
  let nextPath = existing.storedPath;
  let countyArchiveStatus = existing.countyArchiveStatus;

  if (input.status === "approved") {
    const approvedRel = plannedApprovedPath(ctx, filename);
    const { absolute: toAbs } = buildPathsForContext(ctx, "approved", undefined, filename);
    const move = await tryMoveFile(fromAbs, toAbs);
    if (move.moved) nextPath = approvedRel.replace(/\\/g, "/");
    countyArchiveStatus = "published";
  } else if (input.status === "rejected") {
    const { relative, absolute: toAbs } = buildPathsForContext(ctx, "rejected", undefined, filename);
    const move = await tryMoveFile(fromAbs, toAbs);
    if (move.moved) nextPath = relative.replace(/\\/g, "/");
    countyArchiveStatus = "rejected";
  }

  const updated: HotWashMediaRecord = {
    ...existing,
    approvalStatus: input.status,
    approvedBy: input.status === "approved" ? input.actor : existing.approvedBy,
    approvedAt: input.status === "approved" ? now : existing.approvedAt,
    rejectionReason: input.status === "rejected" ? input.rejectionReason?.trim() || "Rejected by campaign manager" : existing.rejectionReason,
    storedPath: nextPath,
    countyArchiveStatus,
    approvedArchivePath: existing.approvedArchivePath ?? plannedApprovedPath(ctx, filename),
    updatedAt: now,
  };

  await upsertMediaRecord(updated);
  return updated;
}

export async function getMediaAbsolutePath(record: HotWashMediaRecord): Promise<string> {
  return path.join(process.cwd(), "data", "campaign-events", "media", record.storedPath);
}

export async function loadEventMediaBundle(eventRecordId: string) {
  const items = await listMediaForEvent(eventRecordId);
  const byUploader = new Map<string, HotWashMediaRecord[]>();
  for (const item of items) {
    const key = `${item.uploaderName}|${item.uploaderEmail}`;
    const list = byUploader.get(key) ?? [];
    list.push(item);
    byUploader.set(key, list);
  }
  return {
    items,
    byUploader: [...byUploader.entries()].map(([key, uploads]) => {
      const [uploaderName, uploaderEmail] = key.split("|");
      return { uploaderName, uploaderEmail, uploads };
    }),
  };
}

export function sha256Buffer(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}
