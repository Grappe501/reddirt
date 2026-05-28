/** Client-safe intelligence filter helpers — no node:fs imports. */

import type {
  CampaignNarrativeDoctrineAlignment,
  CampaignStrategicAlignmentIndex,
  CampaignStrategicAlignmentSignal,
} from "@/lib/intelligence/types/campaignStrategicAlignment";

export function filterStrategicAlignments(
  index: CampaignStrategicAlignmentIndex,
  filters: {
    signal?: CampaignStrategicAlignmentSignal | "ALL";
    narrativeQuery?: string;
    doctrineQuery?: string;
  },
): CampaignNarrativeDoctrineAlignment[] {
  const narrativeQuery = filters.narrativeQuery?.trim().toLowerCase() ?? "";
  const doctrineQuery = filters.doctrineQuery?.trim().toLowerCase() ?? "";
  const signal = filters.signal ?? "ALL";

  return index.alignments.filter((row) => {
    if (signal !== "ALL" && row.alignmentSignal !== signal) return false;
    if (narrativeQuery) {
      const haystack = `${row.narrativeId} ${row.narrativeTitle} ${row.signal}`.toLowerCase();
      if (!haystack.includes(narrativeQuery)) return false;
    }
    if (doctrineQuery) {
      const haystack = row.matchedDoctrineIds.join(" ").toLowerCase();
      if (!haystack.includes(doctrineQuery)) return false;
    }
    return true;
  });
}
