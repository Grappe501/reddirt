import type { EventItem } from "@/content/types";
import { parseEventInstant, resolveEventStatus } from "@/lib/format/eventDisplay";

/**
 * Events shown on `/listening-sessions` → “Events planned”:
 * - Every item with `type: "Listening Session"` (no extra field needed).
 * - Any other item with `listeningSessionSeries: true` (partner / alternate format on the same tour).
 *
 * New listening sessions: use `type: "Listening Session"` in `src/content/events` and they appear here automatically.
 */
export function listListeningSessionSeriesEvents(mergedEvents: EventItem[]): EventItem[] {
  const now = new Date();
  return [...mergedEvents]
    .filter((e) => e.type === "Listening Session" || e.listeningSessionSeries === true)
    .filter((e) => resolveEventStatus(e, now) === "upcoming")
    .sort((a, b) => parseEventInstant(a.startsAt, a.timezone).getTime() - parseEventInstant(b.startsAt, b.timezone).getTime());
}
