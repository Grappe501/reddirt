import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";
import { peopleTrailPool } from "@/content/media/campaign-trail-photo-use";

/**
 * Non-overlapping windows into `peopleTrailPool(campaignTrailPhotos)` (stable sync order).
 * When you add new site sections that need stills, add a row here and bump counts—never re-slice ad hoc.
 *
 * Reserved layout (people pool only):
 * | home        | 0  | (landing gallery removed — use /from-the-road#trail-photos) |
 * | aboutStory  | 2  | KellyFullStory (story + standup breakouts only) |
 * | getInvolved | 2  | editorial pair                              |
 * | priorities  | 1  | single breakout                             |
 * | events      | 1  | single breakout                             |
 * | fromTheRoad | rest (capped) | gallery after fixed slots      |
 * | voterRegistration | 1  | /voter-registration (below hero)  |
 * | directDemocracy   | 1  | /direct-democracy                   |
 * | civicDepth        | 1  | /civic-depth                        |
 * | resources         | 1  | /resources (field still)         |
 */
export type TrailPhotoSlot =
  | "home"
  | "aboutStory"
  | "getInvolved"
  | "priorities"
  | "events"
  | "voterRegistration"
  | "directDemocracy"
  | "civicDepth"
  | "resources"
  | "fromTheRoad";

const FIXED_SLOTS: { key: Exclude<TrailPhotoSlot, "fromTheRoad">; count: number }[] = [
  { key: "home", count: 0 },
  { key: "aboutStory", count: 2 },
  { key: "getInvolved", count: 2 },
  { key: "priorities", count: 1 },
  { key: "events", count: 1 },
  { key: "voterRegistration", count: 1 },
  { key: "directDemocracy", count: 1 },
  { key: "civicDepth", count: 1 },
  { key: "resources", count: 1 },
];

export function trailPhotosFixedSliceEnd(): number {
  return FIXED_SLOTS.reduce((n, s) => n + s.count, 0);
}

export function trailPhotosForSlot(
  slot: TrailPhotoSlot,
  options?: { fromTheRoadMax?: number },
): CampaignTrailPhoto[] {
  const pool = peopleTrailPool(campaignTrailPhotos);
  if (slot === "fromTheRoad") {
    const start = trailPhotosFixedSliceEnd();
    const max = options?.fromTheRoadMax ?? 72;
    return pool.slice(start, start + max);
  }
  let cursor = 0;
  for (const row of FIXED_SLOTS) {
    if (row.key === slot) {
      return pool.slice(cursor, cursor + row.count);
    }
    cursor += row.count;
  }
  return [];
}
