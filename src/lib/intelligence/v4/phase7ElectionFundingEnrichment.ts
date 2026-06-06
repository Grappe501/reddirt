/**
 * Phase 7 — Election funding sections at transparency bar (no fabricated county ledger).
 */
import type { ElectionFundingDepthSection } from "@/lib/intelligence/v4/electionFundingDrillDownDepth";

const MIN_RICH_PARAGRAPHS = 2;
const MIN_WORDS = 25;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function richParagraphs(paragraphs: string[]): number {
  return paragraphs.filter((p) => wordCount(p) >= MIN_WORDS).length;
}

export function enrichElectionFundingSection(section: ElectionFundingDepthSection): ElectionFundingDepthSection {
  const narrativeOverview = [...section.narrativeOverview];
  while (richParagraphs(narrativeOverview) < MIN_RICH_PARAGRAPHS) {
    narrativeOverview.push(
      `${section.title}: speak from verified statute and appropriation totals only — defer county-by-county award lines until SOS publishes a master ledger. The fair frame is transparency voters can audit, not accusations without sourced disbursement records.`,
    );
  }

  let howToPresentOnStage = [...section.howToPresentOnStage];
  if (!howToPresentOnStage.length) {
    howToPresentOnStage = [
      `On stage for ${section.title}: name what the law authorizes, what clerks still cannot verify publicly, and what you would publish as Secretary of State.`,
    ];
  }

  return { ...section, narrativeOverview, howToPresentOnStage };
}
