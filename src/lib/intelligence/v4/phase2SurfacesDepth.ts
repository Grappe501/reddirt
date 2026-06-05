/**
 * Phase 2 — Diligence + Field Book surfaces depth scoring.
 */
import { FIELD_BOOK_ARTICLES } from "@/lib/intelligence/fieldBookRegistry";
import { allDiligenceSearchOperatorGuides, diligenceOperatorGuideCoveragePct } from "@/lib/intelligence/v4/diligenceSearchOperatorDepth";

const MIN_FIELD_BOOK_PARAGRAPHS = 6;
const MIN_WORDS_PER_PARAGRAPH = 18;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function articleMeetsPhase2Bar(body: string[]): boolean {
  const rich = body.filter((p) => wordCount(p) >= MIN_WORDS_PER_PARAGRAPH);
  return rich.length >= MIN_FIELD_BOOK_PARAGRAPHS;
}

export type Phase2SurfacesDepthProgress = {
  diligenceGuidePct: number;
  fieldBookPhaseAPct: number;
  fieldBookArticlesAtBar: number;
  fieldBookPhaseATotal: number;
  overallPct: number;
};

export function computePhase2SurfacesDepthProgress(): Phase2SurfacesDepthProgress {
  const phaseAArticles = FIELD_BOOK_ARTICLES.filter((a) => a.phaseId === "phase-a");
  const atBar = phaseAArticles.filter((a) => articleMeetsPhase2Bar(a.body)).length;
  const fieldBookPhaseAPct = Math.round((atBar / Math.max(1, phaseAArticles.length)) * 100);
  const diligenceGuidePct = diligenceOperatorGuideCoveragePct();
  const overallPct = Math.round((diligenceGuidePct + fieldBookPhaseAPct) / 2);

  return {
    diligenceGuidePct,
    fieldBookPhaseAPct,
    fieldBookArticlesAtBar: atBar,
    fieldBookPhaseATotal: phaseAArticles.length,
    overallPct,
  };
}

export function assertPhase2SurfacesDepthBar(): { ok: boolean; message: string } {
  const p = computePhase2SurfacesDepthProgress();
  const guides = allDiligenceSearchOperatorGuides();
  if (p.diligenceGuidePct < 100) {
    return { ok: false, message: `Diligence operator guides ${p.diligenceGuidePct}% (need 100%)` };
  }
  if (p.fieldBookPhaseAPct < 100) {
    return {
      ok: false,
      message: `Field Book Phase A ${p.fieldBookPhaseAPct}% (${p.fieldBookArticlesAtBar}/${p.fieldBookPhaseATotal} at bar)`,
    };
  }
  if (guides.length < 15) {
    return { ok: false, message: `Expected 15 operator guides, got ${guides.length}` };
  }
  return { ok: true, message: `Phase 2 surfaces ${p.overallPct}% — diligence + Field Book at bar` };
}
