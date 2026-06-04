import type { FilmRoomItem } from "@/lib/opposition/debateFilmRoomTypes";

/** Client-safe — groups film room items without filesystem access. */

export function groupFilmRoomItems(items: FilmRoomItem[]): Record<string, FilmRoomItem[]> {
  const groups: Record<string, FilmRoomItem[]> = {
    direct: [],
    reference: [],
    legislative: [],
    transcripts: [],
    quotes: [],
    drills: [],
  };
  for (const item of items) {
    if (item.assetType === "LEGISLATIVE_COMMITTEE_VIDEO") groups.legislative.push(item);
    else if (item.assetType === "MEDIA_TRANSCRIPT_EXCERPT") groups.transcripts.push(item);
    else if (item.assetType === "QUOTE_RECORD") groups.quotes.push(item);
    else if (item.assetType === "THEME_DRILL") groups.drills.push(item);
    else if (item.isDirectOpponentClip || item.assetType === "DIRECT_OPPONENT") groups.direct.push(item);
    else if (item.governanceLabel === "REFERENCE_ONLY" || item.assetType === "REFERENCE_SOS") groups.reference.push(item);
    else if (item.assetType === "MEDIA_COVERAGE" || item.id.startsWith("media-")) groups.direct.push(item);
    else groups.drills.push(item);
  }
  return groups;
}
