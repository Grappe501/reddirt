import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import type { KimHammerIndexedClaim } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  canExportClaim,
  getExternalUseStatus,
  getLegalRiskLabel,
  getPublicationTier,
  getReviewStatusLabel,
  KIM_HAMMER_EXPORT_FILTER,
} from "@/lib/opposition/kimHammerPublicationSafety";

export type DebateExportClaim = {
  id: string;
  title: string;
  safeWording: string;
  citationSummary: string;
  sourceUrl?: string;
  publicationTier: string;
  legalRisk: string;
  externalUseStatus: string;
  reviewStatus: string;
};

export type DebateExportJsonPayload = {
  generatedAt: string;
  opponent: string;
  exportCount: number;
  claims: DebateExportClaim[];
};

const OPPONENT_LABEL = "Kim Hammer";

function primaryCitation(claim: KimHammerIndexedClaim): { summary: string; sourceUrl?: string } {
  const httpSources =
    claim.supportingEvidence?.filter((entry) => entry.url.startsWith("http")) ?? [];

  if (httpSources.length === 0) {
    return { summary: "No public HTTP source URL captured on supporting evidence." };
  }

  return {
    summary: httpSources.map((entry) => entry.summary).join("; "),
    sourceUrl: httpSources[0]?.url,
  };
}

function toDebateExportClaim(claim: KimHammerIndexedClaim): DebateExportClaim {
  const citation = primaryCitation(claim);
  const publicationTier = getPublicationTier(claim) ?? KIM_HAMMER_EXPORT_FILTER.confidenceTier;
  const legalRisk = getLegalRiskLabel(claim);
  const externalUseStatus =
    getExternalUseStatus(claim) ?? KIM_HAMMER_EXPORT_FILTER.externalUseStatus;

  return {
    id: claim.id,
    title: claim.topic ?? claim.id,
    safeWording: claim.text ?? claim.claim ?? "",
    citationSummary: citation.summary,
    sourceUrl: citation.sourceUrl,
    publicationTier,
    legalRisk,
    externalUseStatus,
    reviewStatus: getReviewStatusLabel(claim),
  };
}

export function buildKimHammerDebateExportPayload(): DebateExportJsonPayload {
  const index = loadKimHammerEvidenceIndex();
  const claims = index.claims.filter(canExportClaim).map(toDebateExportClaim);

  return {
    generatedAt: new Date().toISOString(),
    opponent: OPPONENT_LABEL,
    exportCount: claims.length,
    claims,
  };
}

export function buildKimHammerDebateExportMarkdown(payload: DebateExportJsonPayload): string {
  const lines: string[] = [
    `# ${payload.opponent} Debate Packet Export`,
    "",
    `Generated: ${payload.generatedAt}`,
    "",
    `Export-ready claims: ${payload.exportCount}`,
    "",
    `Filter: ${KIM_HAMMER_EXPORT_FILTER.externalUseStatus} · ${KIM_HAMMER_EXPORT_FILTER.citationStatus} · ${KIM_HAMMER_EXPORT_FILTER.confidenceTier} · ${KIM_HAMMER_EXPORT_FILTER.legalRisk} legal risk`,
    "",
  ];

  if (payload.claims.length === 0) {
    lines.push("_No claims currently meet export safety criteria._");
    return lines.join("\n");
  }

  payload.claims.forEach((claim, index) => {
    lines.push(`## ${index + 1}. ${claim.title}`);
    lines.push("");
    lines.push(`**Safe wording:** ${claim.safeWording}`);
    lines.push("");
    lines.push(`**Citation summary:** ${claim.citationSummary}`);
    lines.push("");
    if (claim.sourceUrl) {
      lines.push(`**Source URL:** ${claim.sourceUrl}`);
      lines.push("");
    }
    lines.push(`**Publication tier:** ${claim.publicationTier}`);
    lines.push(`**Legal risk:** ${claim.legalRisk}`);
    lines.push(`**External use status:** ${claim.externalUseStatus}`);
    lines.push(`**Review status:** ${claim.reviewStatus}`);
    lines.push("");
  });

  return lines.join("\n");
}
