/**
 * Phase 15 P0 — Nav collapse closure metrics.
 */
import {
  buildCandidateCommandNavSections,
  candidateNavHasBuilderInfra,
  countCandidateCommandNavLinks,
  flattenCandidateCommandNavLinks,
} from "@/lib/intelligence/v4/candidateCommandNav";
import {
  PHASE15_P0_MAX_CANDIDATE_LINKS,
  PHASE15_P0_MAX_LINKS_PER_SECTION,
  PHASE15_P0_MAX_SECTIONS,
} from "@/lib/intelligence/v4/phase15CandidateCommandDepth";

const MIN_SECTIONS = 5;

export type Phase15P0Progress = {
  sectionCount: number;
  linkCount: number;
  maxLinksPerSection: number;
  builderInfraHidden: boolean;
  sectionsWithinCap: boolean;
  linksWithinCap: boolean;
  overallPct: number;
};

export function computePhase15P0Progress(): Phase15P0Progress {
  const sections = buildCandidateCommandNavSections("CANDIDATE");
  const linkCount = countCandidateCommandNavLinks(sections);
  const maxLinksPerSection = Math.max(0, ...sections.map((s) => s.links.length));
  const builderInfraHidden = !candidateNavHasBuilderInfra(sections);
  const sectionsWithinCap = sections.length >= MIN_SECTIONS && sections.length <= PHASE15_P0_MAX_SECTIONS;
  const linksWithinCap = linkCount <= PHASE15_P0_MAX_CANDIDATE_LINKS;

  const checks = [builderInfraHidden, sectionsWithinCap, linksWithinCap, maxLinksPerSection <= PHASE15_P0_MAX_LINKS_PER_SECTION];
  const overallPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    sectionCount: sections.length,
    linkCount,
    maxLinksPerSection,
    builderInfraHidden,
    sectionsWithinCap,
    linksWithinCap,
    overallPct,
  };
}

export function listCandidateCommandNavHrefs(): string[] {
  return flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href);
}

export function assertPhase15P0Bar(): { ok: boolean; message: string } {
  const p = computePhase15P0Progress();
  const issues: string[] = [];
  if (!p.builderInfraHidden) issues.push("builder infra in candidate nav");
  if (!p.sectionsWithinCap) issues.push(`sections ${p.sectionCount}`);
  if (!p.linksWithinCap) issues.push(`links ${p.linkCount}/${PHASE15_P0_MAX_CANDIDATE_LINKS}`);
  if (p.maxLinksPerSection > PHASE15_P0_MAX_LINKS_PER_SECTION) {
    issues.push(`section max ${p.maxLinksPerSection}`);
  }
  if (issues.length === 0) return { ok: true, message: "Phase 15 P0 bar met" };
  return { ok: false, message: issues.join("; ") };
}
