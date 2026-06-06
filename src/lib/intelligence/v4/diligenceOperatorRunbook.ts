/**
 * Phase 7 — Five-search diligence operator runbook (counsel-safe, no fabricated CLEAN status).
 */
import { OPPONENT_DILIGENCE_SUBJECTS } from "@/lib/intelligence/v4/opponentDiligenceRegistry";
import {
  allDiligenceSearchOperatorGuides,
  diligenceOperatorGuideCoveragePct,
} from "@/lib/intelligence/v4/diligenceSearchOperatorDepth";
import { allDiligenceCompletionSummary } from "@/lib/intelligence/v4/opponentDiligenceLogStore";

export type DiligenceRunbookStep = {
  order: number;
  label: string;
  detail: string;
  fieldBookSlug: string;
};

export type DiligenceSubjectRunbook = {
  subjectId: string;
  displayName: string;
  href: string;
  completionPct: number;
  incompletePivot: string;
  steps: DiligenceRunbookStep[];
};

export const DILIGENCE_RUNBOOK_STEPS: DiligenceRunbookStep[] = [
  {
    order: 1,
    label: "Civil — CourtConnect",
    detail: "All-county civil docket search; log case numbers and disposition only.",
    fieldBookSlug: "court-diligence-protocol",
  },
  {
    order: 2,
    label: "Criminal — CourtConnect",
    detail: "Criminal docket same session; counsel gate on any open matter.",
    fieldBookSlug: "kelly-five-search-checklist",
  },
  {
    order: 3,
    label: "UCC — SOS filings",
    detail: "Secretary of State UCC search for individual and campaign-related entities.",
    fieldBookSlug: "court-diligence-protocol",
  },
  {
    order: 4,
    label: "Business entity — SOS",
    detail: "Entity standing and agent records; HIT_REQUIRES_COUNSEL if not good standing.",
    fieldBookSlug: "counsel-review-frame",
  },
  {
    order: 5,
    label: "Property tax — assessor",
    detail: "Campaign-relevant parcels only; counsel review before stage lines.",
    fieldBookSlug: "counsel-review-frame",
  },
];

export const DILIGENCE_RUNBOOK_HUB_HREF = "/admin/intelligence/diligence";

export function buildDiligenceSubjectRunbooks(): DiligenceSubjectRunbook[] {
  const summaries = allDiligenceCompletionSummary();
  return OPPONENT_DILIGENCE_SUBJECTS.map((subject) => {
    const summary = summaries.find((s) => s.subjectId === subject.subjectId);
    const guides = allDiligenceSearchOperatorGuides().filter((g) => g.subjectId === subject.subjectId);
    const incompletePivot = guides[0]?.incompletePivot ?? "Pivot to service and SOS implementation — not denial.";
    return {
      subjectId: subject.subjectId,
      displayName: subject.displayName,
      href: subject.href,
      completionPct: summary?.pct ?? 0,
      incompletePivot,
      steps: DILIGENCE_RUNBOOK_STEPS,
    };
  });
}

export function diligenceRunbookCoveragePct(): number {
  return diligenceOperatorGuideCoveragePct();
}
