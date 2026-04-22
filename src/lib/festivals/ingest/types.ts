export type NormalizedFestivalCandidate = {
  name: string;
  shortDescription?: string | null;
  startAt: string;
  endAt: string;
  timezone?: string;
  city?: string | null;
  countyId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  venueName?: string | null;
  sourceChannel: "RSS" | "WEB" | "FACEBOOK" | "INSTAGRAM" | "GOOGLE" | "MANUAL" | "OTHER";
  /** Must be stable across runs for upsert. */
  sourceUrl: string;
  sourceFingerprint?: string | null;
  rawPayload?: Record<string, unknown> | null;
};
