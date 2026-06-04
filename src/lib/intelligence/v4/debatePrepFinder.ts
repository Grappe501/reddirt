/** Server-only — never import from "use client" components (pulls in sosDebateQuestionBank chain). */
import { getAllPrepSectionDrillDownIds, getPrepSectionDrillDown } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { searchDebatePrepFinderEntries } from "@/lib/intelligence/v4/debatePrepFinderSearch";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { listDebatePhilosophyBriefings } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { buildSosQuestionBriefing } from "@/lib/intelligence/v4/debateBriefingEnrichment";
import type { DebatePrepFinderEntry } from "@/lib/intelligence/v4/debateBriefingDepthTypes";

export function buildDebatePrepFinderIndex(): DebatePrepFinderEntry[] {
  const entries: DebatePrepFinderEntry[] = [];

  for (const id of getAllSosDebateQuestionIds()) {
    const q = getSosDebateQuestionDrillDown(id)!;
    const briefing = buildSosQuestionBriefing(q);
    entries.push({
      id: q.questionId,
      kind: "question",
      title: `Q${q.questionNumber}: ${q.title}`,
      summary: briefing.briefingSummary,
      href: `/admin/intelligence/sos-debate-questions/${q.questionId}`,
      tags: [q.categoryLabel, q.probability, ...briefing.philosophyBriefingIds],
      probability: q.probability,
    });
  }

  for (const id of getAllTrapLaneIds()) {
    const lane = getTrapLaneDrillDown(id)!;
    entries.push({
      id: lane.laneId,
      kind: "trap-lane",
      title: lane.title,
      summary: lane.narrativeOverview.slice(0, 160),
      href: `/admin/intelligence/trap-lanes/${lane.laneId}`,
      tags: ["trap lane", lane.laneId, "Hammer bait"],
    });
  }

  for (const p of listDebatePhilosophyBriefings()) {
    entries.push({
      id: p.briefingId,
      kind: "philosophy",
      title: p.title,
      summary: p.summary,
      href: `/admin/intelligence/debate-briefings/${p.briefingId}`,
      tags: ["philosophy", p.eyebrow, ...p.linkedQuestionIds.slice(0, 3)],
    });
  }

  for (const id of getAllPrepSectionDrillDownIds()) {
    const s = getPrepSectionDrillDown(id)!;
    entries.push({
      id: s.sectionId,
      kind: "prep-section",
      title: `Prep §${s.sectionNumber}: ${s.sectionTitle}`,
      summary: s.whyItMatters.slice(0, 160),
      href: `/admin/intelligence/kim-hammer/debate-prep/${s.sectionId}`,
      tags: ["debate prep", s.sectionTitle],
    });
  }

  entries.push({
    id: "opposition-strategy",
    kind: "opposition",
    title: "Opposition strategy layer",
    summary: "2021 integrity package, 2025 petition cluster, trap coverage, Hammer offensive moves.",
    href: "/admin/intelligence/opposition-strategy",
    tags: ["Hammer", "offense", "2021", "2025"],
  });

  entries.push({
    id: "supreme-workbench",
    kind: "opposition",
    title: "Supreme workbench",
    summary: "Live readiness scores and debate-day sequences.",
    href: "/admin/intelligence/supreme-workbench",
    tags: ["readiness", "debate day"],
  });

  return entries.sort((a, b) => a.title.localeCompare(b.title));
}

export function searchDebatePrepFinder(query: string, limit = 24): DebatePrepFinderEntry[] {
  return searchDebatePrepFinderEntries(buildDebatePrepFinderIndex(), query, limit);
}
