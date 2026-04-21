import exifr from "exifr";

export type ExifGeoResult = {
  latitude: number | null;
  longitude: number | null;
  /** Best-effort capture time from EXIF. */
  capturedAt: Date | null;
  device: { make?: string; model?: string };
  /** JSON-serializable raw subset for `metadataJson`. */
  rawExif: Record<string, unknown>;
};

/**
 * Extract GPS, capture time, and device fields from image buffers. Videos: not supported here.
 */
export async function extractImageExifAndGeo(buffer: Buffer): Promise<ExifGeoResult> {
  const out: ExifGeoResult = {
    latitude: null,
    longitude: null,
    capturedAt: null,
    device: {},
    rawExif: {},
  };
  try {
    const exif = await exifr.parse(buffer, {
      gps: true,
      pick: [
        "DateTimeOriginal",
        "CreateDate",
        "ModifyDate",
        "Make",
        "Model",
        "ImageWidth",
        "ImageHeight",
        "Orientation",
        "ISO",
        "FNumber",
        "ExposureTime",
        "FocalLength",
        "LensModel",
      ],
    });
    if (exif && typeof exif === "object") {
      const e = exif as Record<string, unknown> & { latitude?: number; longitude?: number };
      if (typeof e.latitude === "number" && Number.isFinite(e.latitude)) {
        out.latitude = e.latitude;
      }
      if (typeof e.longitude === "number" && Number.isFinite(e.longitude)) {
        out.longitude = e.longitude;
      }
      for (const k of [
        "DateTimeOriginal",
        "CreateDate",
        "ModifyDate",
        "Make",
        "Model",
        "ImageWidth",
        "ImageHeight",
        "Orientation",
        "ISO",
        "FNumber",
        "ExposureTime",
        "FocalLength",
        "LensModel",
      ]) {
        if (e[k] !== undefined) (out.rawExif as Record<string, unknown>)[k] = e[k] as unknown;
      }
      if (e.Make) out.device.make = String(e.Make);
      if (e.Model) out.device.model = String(e.Model);

      const d =
        toDate(e.DateTimeOriginal) ?? toDate(e.CreateDate) ?? toDate(e.ModifyDate) ?? toDate((e as { DateTime?: unknown }).DateTime);
      if (d) out.capturedAt = d;
    }
  } catch {
    /* exifr may throw on truncated files */
  }
  return out;
}

function toDate(v: unknown): Date | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}
