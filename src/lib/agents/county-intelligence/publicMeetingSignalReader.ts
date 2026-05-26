import { loadPublicMeetingWatchlist } from "./publicIssueSignalRegistry";

export function publicMeetingSignalReader(countySlug: string) {
  const row = loadPublicMeetingWatchlist().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    signalKind: "SIGNAL" as const,
    watchItems: row?.watchItems ?? ["MISSING"],
    pressureScore: row?.pressureScore ?? 0,
    confidence: row?.confidence ?? "LOW_CONFIDENCE",
  };
}

