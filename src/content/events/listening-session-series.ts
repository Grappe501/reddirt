import type { EventItem } from "@/content/types";

/**
 * Events shown on `/listening-sessions` → “Events planned”:
 * - Every item with `type: "Listening Session"` (no extra field needed).
 * - Any other item with `listeningSessionSeries: true` (partner / alternate format on the same tour).
 *
 * New listening sessions: use `type: "Listening Session"` in `src/content/events` and they appear here automatically.
 */
export function listListeningSessionSeriesEvents(mergedEvents: EventItem[]): EventItem[] {
  return [...mergedEvents]
    .filter((e) => e.type === "Listening Session" || e.listeningSessionSeries === true)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
