/**
 * Client-safe smart trap lane picker — no server-only imports.
 */
import { TRAP_LANE_SELECTION_GUIDE } from "@/lib/election-plan/debate-prep-operator-guide";
import type { ForumTranscriptIntelSlice } from "@/lib/intelligence/v4/forumTranscriptIntel";

const HAMMER_THEME_LANE_MAP: Record<string, string> = {
  "2021": "2021-vs-2025-pivot",
  "2025": "2021-vs-2025-pivot",
  pivot: "2021-vs-2025-pivot",
  integrity: "integrity-without-participation",
  participation: "integrity-without-participation",
  clerk: "county-champion",
  county: "county-champion",
  fraud: "fraud-data-dare",
  data: "fraud-data-dare",
  experience: "experience-equals-sos-ready",
  decades: "experience-equals-sos-ready",
  culture: "culture-war-escalation",
  pastor: "culture-war-escalation",
  faith: "culture-war-escalation",
};

export function pickSmartTrapLane(forumIntel: ForumTranscriptIntelSlice): string {
  const themes = [...forumIntel.hammerThemes, ...forumIntel.watchForTells].join(" ").toLowerCase();
  for (const [needle, laneId] of Object.entries(HAMMER_THEME_LANE_MAP)) {
    if (themes.includes(needle)) return laneId;
  }
  for (const row of TRAP_LANE_SELECTION_GUIDE) {
    if (themes.includes(row.laneId.replace(/-/g, " ").slice(0, 8))) return row.laneId;
  }
  return TRAP_LANE_SELECTION_GUIDE[2]?.laneId ?? "county-champion";
}
