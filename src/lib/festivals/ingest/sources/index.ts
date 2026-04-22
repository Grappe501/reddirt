import type { NormalizedFestivalCandidate } from "../types";
import { collectFromEnvJson } from "./env-json";

/**
 * Register ingest sources here (RSS, partner API, whitelisted scrapers, etc.).
 * Broad “scrape the whole web / all of social” is not reliable or policy-safe as a single hook—add
 * provider modules with keys in env and compliance review per platform.
 *
 * **Research lattice (75 counties, seats, regions):** `arkansas-county-event-directory.ts` — use for staff
 * checklists and AI prompts, not as automated scraping targets by itself.
 */
export async function collectFromRegistry(): Promise<NormalizedFestivalCandidate[]> {
  const out: NormalizedFestivalCandidate[] = [];
  out.push(...(await collectFromEnvJson()));
  return out;
}
