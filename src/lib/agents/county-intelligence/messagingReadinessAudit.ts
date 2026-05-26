import { loadPublicNarrativeReadiness } from "./publicIssueSignalRegistry";

export function messagingReadinessAudit(countySlug: string) {
  const row = loadPublicNarrativeReadiness().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    signalKind: "TREND" as const,
    messagingReadiness: row?.messagingReadiness ?? "MISSING",
    narrativeConfidenceScore: row?.narrativeConfidenceScore ?? 0,
    nextSafeDataActions: row?.nextSafeDataActions ?? ["MISSING"],
  };
}

