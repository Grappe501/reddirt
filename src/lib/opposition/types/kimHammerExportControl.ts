/** V3-E export control center types — governed export history and lineage. */

export type KimHammerExportFormat = "JSON" | "MARKDOWN" | "CLIPBOARD";

export type KimHammerExportScope = "STATEWIDE" | "COUNTY" | "INTERNAL_DRY_RUN";

export type KimHammerExportHistoryEntry = {
  exportId: string;
  packetVersion: string;
  format: KimHammerExportFormat;
  scope: KimHammerExportScope;
  countyId?: string;
  claimIds: string[];
  citationIds: string[];
  narrativeIds: string[];
  operator: string;
  exportNotes: string;
  exportedAt: string;
  claimCount: number;
  citationCount: number;
  contentChecksum: string;
};

export type KimHammerExportHistoryFile = {
  generatedAt: string;
  historyVersion: string;
  purpose: string;
  entries: KimHammerExportHistoryEntry[];
};

export type KimHammerExportLineage = {
  exportId?: string;
  packetVersion: string;
  claimIds: string[];
  citations: Array<{
    citationId: string;
    sourceUrl: string;
    summary: string;
    sourceHealth: string;
    reviewStatus: string;
    linkedClaimIds: string[];
  }>;
  narrativeIds: string[];
  narrativeHealthSignals: Array<{
    narrativeId: string;
    signal: string;
  }>;
};

export const KIM_HAMMER_EXPORT_FORMATS: KimHammerExportFormat[] = ["JSON", "MARKDOWN", "CLIPBOARD"];

export const KIM_HAMMER_EXPORT_SCOPES: KimHammerExportScope[] = [
  "STATEWIDE",
  "COUNTY",
  "INTERNAL_DRY_RUN",
];
