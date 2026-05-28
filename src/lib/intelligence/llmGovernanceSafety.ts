import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";

export type GovernanceWarningBundle = {
  governanceWarnings: string[];
  unsupportedClaimWarnings: string[];
  missingCitationWarnings: string[];
  hallucinationRiskWarnings: string[];
  publicationRestrictions: string[];
};

const RISKY_PHRASES = [
  /\bdefinitely guilty\b/i,
  /\bsecretly planned\b/i,
  /\bwill lose\b/i,
  /\bvoters should fear\b/i,
  /\bmicrotarget/i,
  /\bhousehold.?level\b/i,
  /\bindividual voter\b/i,
  /\bpersuasion score\b/i,
  /\bapprove(d)? for (external|public) use\b/i,
  /\bpublish immediately\b/i,
];

const UNSUPPORTED_CLAIM_INDICATORS = [
  /\bhe clearly intended\b/i,
  /\bshe obviously wanted\b/i,
  /\bwithout (any )?evidence\b/i,
  /\ballegedly\b.*\ballegedly\b/i,
  /\bsources say\b(?![^\n]{0,120}(citation|claim|SB|HB))/i,
];

const HALLUCINATION_INDICATORS = [
  /\baccording to unnamed sources\b/i,
  /\bstudies show\b(?![^\n]{0,80}(export-ready|claim))/i,
  /\bit is well known that\b/i,
  /\bexperts agree\b/i,
  /\b\d{1,3}% of voters\b/i,
];

export function validateDraftPublicationSafety(draftContent: string): {
  ok: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  if (!draftContent.includes("INTERNAL DRAFT ONLY") && !draftContent.includes("INTERNAL_DRAFT")) {
    violations.push("Missing INTERNAL_DRAFT governance header.");
  }
  if (!draftContent.includes("NON_PUBLISHABLE") && !draftContent.includes("NON-PUBLISHABLE")) {
    violations.push("Missing NON_PUBLISHABLE label.");
  }
  if (!draftContent.includes("HUMAN REVIEW REQUIRED") && !draftContent.includes("HUMAN_REVIEW_REQUIRED")) {
    violations.push("Missing HUMAN_REVIEW_REQUIRED label.");
  }
  for (const pattern of RISKY_PHRASES) {
    if (pattern.test(draftContent)) {
      violations.push(`Risky language detected: ${pattern.source}`);
    }
  }
  return { ok: violations.length === 0, violations };
}

export function detectUnsupportedClaims(draftContent: string, repoRoot?: string): string[] {
  const warnings: string[] = [];
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const exportReadyCount = evidence.claims.filter((row) => row.exportReady).length;

  for (const pattern of UNSUPPORTED_CLAIM_INDICATORS) {
    if (pattern.test(draftContent)) {
      warnings.push(`Possible unsupported claim pattern: ${pattern.source}`);
    }
  }

  if (exportReadyCount === 0 && /\b(claim|evidence|proves|documented)\b/i.test(draftContent)) {
    warnings.push("Draft references evidentiary language but no export-ready claims exist.");
  }

  if (/\b(opponent|hammer)\b/i.test(draftContent) && !/\b(SB|HB|statute|citation|claim)\b/i.test(draftContent)) {
    warnings.push("Opponent reference without visible citation anchor — verify manually.");
  }

  return warnings;
}

export function detectCitationWeaknesses(draftContent: string, repoRoot?: string): string[] {
  const warnings: string[] = [];
  const citations = loadKimHammerCitationLocker(repoRoot);
  const weak = citations.citations.filter(
    (row) =>
      row.reviewStatus === "NEEDS_REVIEW" ||
      row.reviewStatus === "DRAFT" ||
      row.reviewStatus === "STALE",
  );

  if (weak.length > 0 && /\b(cite|citation|source|quote)\b/i.test(draftContent)) {
    warnings.push(`${weak.length} citation(s) in locker need review — draft may depend on weak sources.`);
  }

  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const partialClaims = evidence.claims.filter(
    (row) => row.citationStatus === "PARTIAL" || row.reviewNeeded,
  );
  if (partialClaims.length > 0) {
    warnings.push(`${partialClaims.length} claim(s) have partial citations — do not treat draft as deployable.`);
  }

  return warnings;
}

export function detectMissingDependencies(
  draftContent: string,
  deps: {
    sourceDependencies?: string[];
    citationDependencies?: string[];
    narrativeDependencies?: string[];
  },
): string[] {
  const warnings: string[] = [];
  if (!deps.sourceDependencies?.length) {
    warnings.push("No source dependencies recorded — operator must attach sources manually.");
  }
  if (!deps.citationDependencies?.length && /\b(citation|quote|statute)\b/i.test(draftContent)) {
    warnings.push("Draft references citations but citationDependencies is empty.");
  }
  if (!deps.narrativeDependencies?.length && /\bnarrative\b/i.test(draftContent)) {
    warnings.push("Draft references narratives but narrativeDependencies is empty.");
  }
  return warnings;
}

export function detectRiskyLanguage(draftContent: string): string[] {
  const warnings: string[] = [];
  for (const pattern of RISKY_PHRASES) {
    if (pattern.test(draftContent)) {
      warnings.push(`Risky language: ${pattern.source}`);
    }
  }
  return warnings;
}

export function detectHallucinationRiskIndicators(draftContent: string): string[] {
  const warnings: string[] = [];
  for (const pattern of HALLUCINATION_INDICATORS) {
    if (pattern.test(draftContent)) {
      warnings.push(`Hallucination risk indicator: ${pattern.source}`);
    }
  }
  if (/\b(SB|HB)\s?\d{3,4}\b/i.test(draftContent)) {
    const bills = draftContent.match(/\b(SB|HB)\s?\d{3,4}\b/gi) ?? [];
    if (bills.length > 3) {
      warnings.push("Multiple bill references — verify each against workbench bill packet.");
    }
  }
  return warnings;
}

export function generateGovernanceWarnings(
  draftContent: string,
  deps: {
    sourceDependencies?: string[];
    citationDependencies?: string[];
    narrativeDependencies?: string[];
    publicationRestrictions?: string[];
  },
  repoRoot?: string,
): GovernanceWarningBundle {
  const publicationSafety = validateDraftPublicationSafety(draftContent);
  return {
    governanceWarnings: publicationSafety.violations,
    unsupportedClaimWarnings: detectUnsupportedClaims(draftContent, repoRoot),
    missingCitationWarnings: [
      ...detectCitationWeaknesses(draftContent, repoRoot),
      ...detectMissingDependencies(draftContent, deps),
    ],
    hallucinationRiskWarnings: detectHallucinationRiskIndicators(draftContent),
    publicationRestrictions: deps.publicationRestrictions ?? [
      "no_auto_publish",
      "no_claim_creation",
      "no_citation_approval",
      "no_task_mutation",
      "no_export",
    ],
  };
}
