import type { NormalizedFestivalCandidate } from "../types";

/**
 * Optional seed for development or a manual ETL that writes JSON into env (e.g. CI export).
 * `FESTIVAL_INGEST_SEED_JSON` — array of partial candidates; `sourceUrl` required.
 */
export async function collectFromEnvJson(): Promise<NormalizedFestivalCandidate[]> {
  const raw = process.env.FESTIVAL_INGEST_SEED_JSON?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: NormalizedFestivalCandidate[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const sourceUrl = typeof o.sourceUrl === "string" ? o.sourceUrl : "";
      const name = typeof o.name === "string" ? o.name : "";
      const startAt = typeof o.startAt === "string" ? o.startAt : "";
      const endAt = typeof o.endAt === "string" ? o.endAt : "";
      if (!sourceUrl || !name || !startAt || !endAt) continue;
      out.push({
        name,
        shortDescription: typeof o.shortDescription === "string" ? o.shortDescription : null,
        startAt,
        endAt,
        timezone: typeof o.timezone === "string" ? o.timezone : "America/Chicago",
        city: typeof o.city === "string" ? o.city : null,
        countyId: typeof o.countyId === "string" ? o.countyId : null,
        venueName: typeof o.venueName === "string" ? o.venueName : null,
        sourceChannel: "MANUAL",
        sourceUrl,
        rawPayload: o,
      });
    }
    return out;
  } catch {
    return [];
  }
}
