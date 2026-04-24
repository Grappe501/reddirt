/**
 * DATA-4 + ELECTION-INGEST-1: detect Arkansas SOS JSON variants (read-only helpers for ingest).
 */

export const ELECTION_INGEST_PARSER_LEGACY = "legacy_election_info" as const;
export const ELECTION_INGEST_PARSER_PREFERENTIAL = "preferential_election_data" as const;

export type ElectionIngestParserVariant =
  | typeof ELECTION_INGEST_PARSER_LEGACY
  | typeof ELECTION_INGEST_PARSER_PREFERENTIAL;

export function detectArkansasElectionJsonVariant(raw: unknown): ElectionIngestParserVariant | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    "ElectionInfo" in o &&
    "Turnout" in o &&
    Array.isArray(o.ContestData)
  ) {
    return ELECTION_INGEST_PARSER_LEGACY;
  }
  if (
    "ElectionData" in o &&
    "TurnoutData" in o &&
    Array.isArray(o.ContestData)
  ) {
    return ELECTION_INGEST_PARSER_PREFERENTIAL;
  }
  return null;
}
