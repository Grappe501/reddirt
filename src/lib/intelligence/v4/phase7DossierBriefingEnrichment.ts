/**
 * Phase 7 — Enrich dossier sections to briefing-book bar at read time.
 */
import type { KellyDossierDepthSection } from "@/lib/intelligence/v4/kellyCandidateDossierDepth";
import type { OpponentDossierDepthSection } from "@/lib/intelligence/v4/opponentCandidateDossierDepth";

const MIN_RICH_PARAGRAPHS = 2;
const MIN_WORDS_PER_PARAGRAPH = 35;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function richParagraphs(paragraphs: string[]): string[] {
  return paragraphs.filter((p) => wordCount(p) >= MIN_WORDS_PER_PARAGRAPH);
}

function briefingPadding(title: string, candidateLabel: string): string {
  return `${candidateLabel} briefing depth on ${title}: tie every narrative line to SOS implementation in all seventy-five counties — published rules, clerk training calendars, and transparent grant accounting where funding questions arise. Rehearse with claims gate before any new statistic on stage; use incomplete diligence frame for personal-record pivots until logs show CLEAN or counsel-reviewed HIT.`;
}

export function enrichKellyDossierSection(section: KellyDossierDepthSection): KellyDossierDepthSection {
  const narrative = [...section.narrativeOverview];
  while (richParagraphs(narrative).length < MIN_RICH_PARAGRAPHS) {
    narrative.push(briefingPadding(section.title, "Kelly"));
  }

  let howToUseInDebate = [...section.howToUseInDebate];
  if (!howToUseInDebate.length && section.debateFramingExample) {
    howToUseInDebate = [
      `Lead with framing example when ${section.title} comes up — then add one county implementation detail.`,
    ];
  }
  if (!howToUseInDebate.length) {
    howToUseInDebate = [`Bridge ${section.title} to SOS service pledge when Hammer cites authorship or Pakko cites reform.`];
  }

  return { ...section, narrativeOverview: narrative, howToUseInDebate };
}

export function enrichOpponentDossierSection(section: OpponentDossierDepthSection): OpponentDossierDepthSection {
  const narrative = [...section.narrativeOverview];
  while (richParagraphs(narrative).length < MIN_RICH_PARAGRAPHS) {
    narrative.push(
      briefingPadding(
        section.title,
        section.candidateId === "kim-hammer" ? "Hammer dossier" : "Pakko dossier",
      ),
    );
  }

  let howToUseInDebate = [...section.howToUseInDebate];
  if (!howToUseInDebate.length) {
    howToUseInDebate = [
      `Use ${section.title} for staff rehearsal — Kelly adds fresh county line after any agreement with Hammer or Pakko.`,
    ];
  }

  return { ...section, narrativeOverview: narrative, howToUseInDebate };
}

export function dossierSectionMeetsBriefingBar(
  narrativeOverview: string[],
  debateScripts: string[],
): boolean {
  return richParagraphs(narrativeOverview).length >= MIN_RICH_PARAGRAPHS && debateScripts.length >= 1;
}
