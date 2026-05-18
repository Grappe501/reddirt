import type { ArkansasRuleSourceRecord } from "./arkansas-rule-source-catalog";
import { arkansasOfficialRuleSources } from "./arkansas-rule-source-catalog";
import type { ComplianceRuleSource, ComplianceRuleVerificationStatus } from "./compliance-rule-types";

export const arkansasRuleSourcesJsonPath = "data/compliance/knowledge/sources/arkansas-rule-sources.json";

export function mapAgencyToSourceType(agency: ArkansasRuleSourceRecord["sourceAgency"]): ComplianceRuleSource["sourceType"] {
  if (agency === "arkansas_ethics_commission") return "arkansas_ethics";
  if (agency === "arkansas_secretary_of_state") return "arkansas_sos";
  if (agency === "arkansas_code") return "arkansas_code";
  if (agency === "campaign_policy") return "campaign_policy";
  return "internal_notes";
}

export function mapArkansasVerificationStatus(status: ArkansasRuleSourceRecord["verificationStatus"]): ComplianceRuleVerificationStatus {
  if (status === "downloaded_official_source") return "downloaded_official_source";
  if (status === "official_link_verified") return "official_link_verified";
  if (status === "broken_link") return "broken_link";
  if (status === "manual_needed") return "manual_needed";
  return "needs_legal_review";
}

export function arkansasRecordToComplianceSource(record: ArkansasRuleSourceRecord): ComplianceRuleSource {
  return {
    id: record.id,
    title: record.title,
    sourceType: mapAgencyToSourceType(record.sourceAgency),
    sourceAgency: record.sourceAgency,
    url: record.url,
    filePath: record.filePath,
    retrievedAt: record.retrievedAt,
    effectiveDate: record.effectiveDate,
    sourceFormat: record.sourceFormat,
    citationLabel: record.citationLabel,
    verificationStatus: mapArkansasVerificationStatus(record.verificationStatus),
    topics: record.topics,
    reviewedByInitials: record.reviewedByInitials,
    reviewedAt: record.reviewedAt,
    reviewNote: record.reviewNote,
    linkStatus: record.verificationStatus === "broken_link" ? "broken" : "ok",
    confidence: record.verificationStatus === "official_link_verified" || record.verificationStatus === "downloaded_official_source" ? "medium" : "low",
    humanReviewStatus: record.reviewedByInitials ? "reviewed" : "pending",
  };
}

export function mergeArkansasCatalogWithPersisted(persisted: ArkansasRuleSourceRecord[] | null): ArkansasRuleSourceRecord[] {
  const byId = new Map<string, ArkansasRuleSourceRecord>();
  for (const source of arkansasOfficialRuleSources) byId.set(source.id, source);
  for (const source of persisted ?? []) byId.set(source.id, { ...byId.get(source.id), ...source });
  return [...byId.values()];
}

export function applyHumanReviewToSource(source: ComplianceRuleSource, reviewedByInitials?: string, reviewedAt?: string): ComplianceRuleSource {
  if (!reviewedByInitials?.trim()) return source;
  return {
    ...source,
    reviewedByInitials: reviewedByInitials.trim().toUpperCase(),
    reviewedAt: reviewedAt ?? new Date().toISOString(),
    humanReviewStatus: "reviewed",
    verificationStatus: "verified_authoritative",
    confidence: "high",
  };
}
