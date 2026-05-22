import path from "node:path";
import { slugifySegment } from "@/lib/owned-media/campaign-filename";
import type { EventMediaContext } from "./hot-wash-media-types";

export const MEDIA_ROOT_REL = path.join("data", "campaign-events", "media");

export type MediaFolderStatus = "pending" | "approved" | "rejected";

export function slugifyCounty(county?: string | null): string {
  if (!county?.trim()) return "unknown-county";
  return slugifySegment(county, "unknown-county");
}

export function slugifyEventTitle(title: string): string {
  return slugifySegment(title, "event");
}

export function slugifyUploader(name: string, email?: string): string {
  const base = name.trim() || email?.split("@")[0] || "anonymous";
  return slugifySegment(base, "uploader");
}

/**
 * Relative path under `data/campaign-events/media/`.
 *
 * Pending: `{county}/{date}/{event}/pending/{uploader}/{file}`
 * Approved: `{county}/{date}/{event}/approved/{file}`
 * Rejected: `{county}/{date}/{event}/rejected/{file}`
 */
export function buildMediaRelativePath(input: {
  countySlug: string;
  eventDateYmd: string;
  eventSlug: string;
  folderStatus: MediaFolderStatus;
  uploaderSlug?: string;
  filename: string;
}): string {
  const date = input.eventDateYmd.slice(0, 10);
  const parts = [input.countySlug, date, input.eventSlug, input.folderStatus];
  if (input.folderStatus === "pending" && input.uploaderSlug) {
    parts.push(input.uploaderSlug);
  }
  parts.push(input.filename);
  return path.join(...parts);
}

export function buildPathsForContext(
  ctx: EventMediaContext,
  folderStatus: MediaFolderStatus,
  uploaderSlug: string | undefined,
  filename: string,
): { relative: string; absolute: string } {
  const relative = buildMediaRelativePath({
    countySlug: ctx.countySlug,
    eventDateYmd: ctx.eventDate,
    eventSlug: ctx.eventSlug,
    folderStatus,
    uploaderSlug: folderStatus === "pending" ? uploaderSlug : undefined,
    filename,
  });
  return { relative, absolute: path.join(process.cwd(), MEDIA_ROOT_REL, relative) };
}

export function plannedApprovedPath(ctx: EventMediaContext, filename: string): string {
  return buildMediaRelativePath({
    countySlug: ctx.countySlug,
    eventDateYmd: ctx.eventDate,
    eventSlug: ctx.eventSlug,
    folderStatus: "approved",
    filename,
  });
}

export function eventContextFromRecord(input: {
  recordId: string;
  title: string;
  startAt: Date;
  displayCity?: string | null;
  county?: string | null;
  city?: string | null;
}): EventMediaContext {
  const county = input.county?.trim() || "";
  const city = input.city?.trim() || input.displayCity?.trim() || "";
  return {
    eventRecordId: input.recordId,
    eventTitle: input.title,
    eventDate: input.startAt.toISOString().slice(0, 10),
    eventSlug: slugifyEventTitle(input.title),
    county,
    countySlug: slugifyCounty(county),
    city,
  };
}
