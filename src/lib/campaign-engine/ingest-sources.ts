/**
 * OFFICIAL-INGEST-1 + INGEST-OPS-1: vocabulary for official-source and election-results intake planning.
 * Types/consts only — no crawlers, no importers, no schema changes.
 *
 * @see docs/official-source-ingest-foundation.md
 * @see docs/sos-for-candidates-ingest-map.md
 * @see docs/election-results-ingest-foundation.md
 */

export const OFFICIAL_INGEST_1_PACKET = "OFFICIAL-INGEST-1" as const;
export const INGEST_OPS_1_PACKET = "INGEST-OPS-1" as const;

/** What kind of official artifact the campaign is tracking (storage/indexing intent). */
export const OfficialSourceKind = {
  FORM_FILLABLE_PDF: "FORM_FILLABLE_PDF",
  GUIDE_STATIC_PDF: "GUIDE_STATIC_PDF",
  HANDBOOK_PDF: "HANDBOOK_PDF",
  WEB_PORTAL: "WEB_PORTAL",
  WEB_PAGE_REFERENCE: "WEB_PAGE_REFERENCE",
  ARCHIVED_SEARCH_PORTAL: "ARCHIVED_SEARCH_PORTAL",
  ELECTION_JSON_EXPORT: "ELECTION_JSON_EXPORT",
  TRAINING_MATERIAL: "TRAINING_MATERIAL",
  SPREADSHEET_LIST: "SPREADSHEET_LIST",
  EXTERNAL_AGENCY_SITE: "EXTERNAL_AGENCY_SITE",
} as const;
export type OfficialSourceKindId =
  (typeof OfficialSourceKind)[keyof typeof OfficialSourceKind];

export const OfficialResourceFormat = {
  PDF: "PDF",
  XLSX: "XLSX",
  HTML: "HTML",
  JSON: "JSON",
  UNKNOWN: "UNKNOWN",
} as const;
export type OfficialResourceFormatId =
  (typeof OfficialResourceFormat)[keyof typeof OfficialResourceFormat];

/** How authoritative the stored pointer or file is for compliance decisions (human judgment required). */
export const ProvenanceAuthorityLevel = {
  OFFICIAL_PRIMARY_SOURCE: "OFFICIAL_PRIMARY_SOURCE",
  OFFICIAL_DERIVED_COPY: "OFFICIAL_DERIVED_COPY",
  CAMPAIGN_UPLOADED_MIRROR: "CAMPAIGN_UPLOADED_MIRROR",
  REFERENCE_ONLY: "REFERENCE_ONLY",
} as const;
export type ProvenanceAuthorityLevelId =
  (typeof ProvenanceAuthorityLevel)[keyof typeof ProvenanceAuthorityLevel];

/** Grouping for routing work (which rail owns the artifact). */
export const IngestSourceFamily = {
  SOS_ELECTIONS: "SOS_ELECTIONS",
  SOS_ETHICS_DISCLOSURE: "SOS_ETHICS_DISCLOSURE",
  SBEC: "SBEC",
  ETHICS_COMMISSION_EXTERNAL: "ETHICS_COMMISSION_EXTERNAL",
  PARTY_EXTERNAL: "PARTY_EXTERNAL",
  ELECTION_RESULTS_FILE: "ELECTION_RESULTS_FILE",
} as const;
export type IngestSourceFamilyId =
  (typeof IngestSourceFamily)[keyof typeof IngestSourceFamily];

/** Intended use inside the campaign engine (multiple may apply). */
export const OfficialResourceUse = {
  COMPLIANCE_REFERENCE: "COMPLIANCE_REFERENCE",
  FILING_READINESS: "FILING_READINESS",
  CANDIDATE_OPS: "CANDIDATE_OPS",
  DEADLINE_CALENDAR: "DEADLINE_CALENDAR",
  TARGETING_AND_ANALYTICS: "TARGETING_AND_ANALYTICS",
  STAFF_TRAINING: "STAFF_TRAINING",
} as const;
export type OfficialResourceUseId =
  (typeof OfficialResourceUse)[keyof typeof OfficialResourceUse];

/** Classify raw election result files for ingest planning (not file system paths). */
export const ElectionResultsFileKind = {
  ARKANSAS_SOS_JSON_LEGACY: "ARKANSAS_SOS_JSON_LEGACY",
  ARKANSAS_SOS_JSON_PREFERENTIAL_2026: "ARKANSAS_SOS_JSON_PREFERENTIAL_2026",
  PDF_HANDBOOK_OR_GUIDE: "PDF_HANDBOOK_OR_GUIDE",
  OTHER: "OTHER",
} as const;
export type ElectionResultsFileKindId =
  (typeof ElectionResultsFileKind)[keyof typeof ElectionResultsFileKind];
