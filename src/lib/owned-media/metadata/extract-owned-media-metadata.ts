import type { Prisma } from "@prisma/client";
import { GeoMetadataSource, OwnedMediaKind } from "@prisma/client";
import { buildIngestMetadataBlock, reverseGpsToArkansasCounty } from "@/lib/owned-media/geo/reverse-gps-to-county";
import { extractImageExifAndGeo } from "@/lib/owned-media/ingest/exif-geo";
import { parseFilenameHints } from "@/lib/owned-media/ingest/filename-hints";
import { isProbablyVideo } from "@/lib/owned-media/ingest/thumbnails";

export type ExtractOwnedMediaMetadataInput = {
  buffer: Buffer;
  fileName: string;
  mime: string;
  kind: OwnedMediaKind;
  /** File birth/mtime for fallback capture time. */
  fileStat?: { birthtime: Date; mtime: Date; ctime: Date };
};

export type ExtractedOwnedMediaMetadata = {
  metadataJson: Prisma.InputJsonValue;
  gpsLat: number | null;
  gpsLng: number | null;
  capturedAt: Date | null;
  width: number | null;
  height: number | null;
  countySlug: string | null;
  countyFips: string | null;
  city: string | null;
  geoSource: GeoMetadataSource;
  geoConfidence: number | null;
  needsGeoReview: boolean;
  issueTagsFromFilename: string[];
};

/**
 * Best-effort EXIF / filename / reverse-geocode pipeline. Used by folder ingest and admin upload.
 * Raw payload is stored in `metadataJson`; structured columns mirror the best signals for querying.
 */
export async function extractOwnedMediaMetadata(input: ExtractOwnedMediaMetadataInput): Promise<ExtractedOwnedMediaMetadata> {
  const { buffer, fileName, mime, kind, fileStat } = input;
  const filenameHints = parseFilenameHints(fileName);
  let exifBlock: Record<string, unknown> = {};
  let lat: number | null = null;
  let lng: number | null = null;
  let capturedAt: Date | null = null;
  let width: number | null = null;
  let height: number | null = null;
  let exifGps = false;

  if (kind === "IMAGE") {
    const ex = await extractImageExifAndGeo(buffer);
    exifBlock = { ...ex.rawExif, device: ex.device };
    lat = ex.latitude;
    lng = ex.longitude;
    capturedAt = ex.capturedAt;
    exifGps = lat != null && lng != null;
    const rw = (ex.rawExif as { ImageWidth?: unknown; ImageHeight?: unknown }).ImageWidth;
    const rh = (ex.rawExif as { ImageWidth?: unknown; ImageHeight?: unknown }).ImageHeight;
    if (typeof rw === "number" && Number.isFinite(rw)) width = Math.round(rw);
    if (typeof rh === "number" && Number.isFinite(rh)) height = Math.round(rh);
  }

  if (kind === "VIDEO" || (kind !== "IMAGE" && isProbablyVideo(fileName, mime))) {
    const head = buffer.subarray(0, Math.min(buffer.length, 8 * 1024 * 1024));
    const videoExif = await tryExifOnBuffer(head);
    exifBlock = {
      ...exifBlock,
      video: {
        note: "Partial read of file head for embedded GPS (QuickTime / some MP4).",
        exifrFromHead: videoExif.raw,
      },
    };
    if (videoExif.lat != null && videoExif.lng != null) {
      lat = videoExif.lat;
      lng = videoExif.lng;
      exifGps = true;
    }
    if (!capturedAt && videoExif.capturedAt) capturedAt = videoExif.capturedAt;
  }

  if (!capturedAt && filenameHints.date) {
    capturedAt = filenameHints.date;
  }
  if (!capturedAt && fileStat) {
    capturedAt = fileStat.birthtime;
  }

  let countySlug: string | null = filenameHints.countySlug;
  let countyFips: string | null = null;
  let city: string | null = null;
  let geoSource: GeoMetadataSource = GeoMetadataSource.NONE;
  let geoConfidence: number | null = null;
  let needsGeoReview = false;
  let reverseAudit: { provider: string; confidenceModel: string; displayName?: string; note?: string } | null = null;

  if (exifGps && lat != null && lng != null) {
    const rev = await reverseGpsToArkansasCounty(lat, lng);
    if (rev.nominatim) {
      reverseAudit = {
        provider: "nominatim",
        confidenceModel: "best-effort-osm-reverse",
        displayName: rev.nominatim.displayName,
        note: "Advisory only — confirm in admin before public county claims.",
      };
    }
    if (rev.countySlug) {
      countySlug = rev.countySlug;
      countyFips = rev.countyFips;
      city = rev.city;
      geoSource = GeoMetadataSource.REVERSE_GEO;
      geoConfidence = rev.confidence > 0 ? rev.confidence : 0.5;
      needsGeoReview = true;
    } else if (filenameHints.countySlug) {
      countySlug = filenameHints.countySlug;
      geoSource = GeoMetadataSource.INFERRED;
      geoConfidence = 0.35;
      needsGeoReview = true;
    } else {
      geoSource = GeoMetadataSource.EXIF;
      geoConfidence = 0.95;
      needsGeoReview = true;
    }
  } else if (countySlug) {
    geoSource = GeoMetadataSource.INFERRED;
    geoConfidence = 0.35;
    needsGeoReview = true;
  }

  const fileStatForJson = fileStat
    ? { birthtime: fileStat.birthtime.toISOString(), mtime: fileStat.mtime.toISOString(), ctime: fileStat.ctime.toISOString() }
    : { birthtime: new Date(0).toISOString(), mtime: new Date(0).toISOString(), ctime: new Date(0).toISOString() };

  const metadataJson = buildIngestMetadataBlock({
    exif: exifBlock,
    filenameHints: { countySlug: filenameHints.countySlug, date: filenameHints.date?.toISOString(), keywords: filenameHints.keywords },
    fileStat: fileStatForJson,
    videoNote: kind === "VIDEO" ? "See exif.video for head parse." : undefined,
    reverseGeocode: reverseAudit ?? null,
  });

  return {
    metadataJson,
    gpsLat: lat,
    gpsLng: lng,
    capturedAt,
    width,
    height,
    countySlug,
    countyFips,
    city,
    geoSource,
    geoConfidence,
    needsGeoReview,
    issueTagsFromFilename: filenameHints.keywords,
  };
}

async function tryExifOnBuffer(slice: Buffer): Promise<{
  lat: number | null;
  lng: number | null;
  capturedAt: Date | null;
  raw: Record<string, unknown> | null;
}> {
  try {
    const exifr = (await import("exifr")).default;
    const parsed = await exifr.parse(slice, { gps: true });
    if (parsed && typeof parsed === "object") {
      const p = parsed as Record<string, unknown> & { latitude?: number; longitude?: number };
      return {
        lat: typeof p.latitude === "number" && Number.isFinite(p.latitude) ? p.latitude : null,
        lng: typeof p.longitude === "number" && Number.isFinite(p.longitude) ? p.longitude : null,
        capturedAt: null,
        raw: p as Record<string, unknown>,
      };
    }
  } catch {
    /* ignore */
  }
  return { lat: null, lng: null, capturedAt: null, raw: null };
}
