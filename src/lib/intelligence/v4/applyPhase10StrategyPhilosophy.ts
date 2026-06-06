/**
 * Phase 10 — Apply strategy & philosophy depth at read time.
 */
import type { DebatePhilosophyBriefing } from "@/lib/intelligence/v4/debateBriefingDepthTypes";
import type { DebatePsychologyManualSection } from "@/lib/intelligence/v4/debatePsychologyTrainingManual";
import type { CampaignPhilosophyNode } from "@/lib/intelligence/types/campaignIntelligenceGraph";
import {
  getPhase10PhilosophyBriefingOverlay,
  getPhase10PhilosophyGraphOverlay,
  getPhase10PsychologyCrosswalk,
  philosophyBriefingMeetsPhase10Bar,
  philosophyNodeMeetsPhase10Bar,
  psychologySectionMeetsPhase10Bar,
  type EnrichedPhilosophyNode,
} from "@/lib/intelligence/v4/phase10StrategyPhilosophyDepth";

export function applyPhase10PhilosophyBriefing(briefing: DebatePhilosophyBriefing): DebatePhilosophyBriefing {
  const overlay = getPhase10PhilosophyBriefingOverlay(briefing.briefingId);

  const relatedLinks = [...briefing.relatedLinks];
  for (const link of overlay.intelligenceLinks) {
    if (!relatedLinks.some((l) => l.href === link.href)) {
      relatedLinks.push(link);
    }
  }
  for (const id of overlay.psychologySectionIds) {
    const href = `/admin/intelligence/debate-prep/psychology-manual/${id}`;
    if (!relatedLinks.some((l) => l.href === href)) {
      relatedLinks.push({ href, label: `Psychology · ${id}` });
    }
  }

  return {
    ...briefing,
    corePhilosophy: [briefing.corePhilosophy, ...overlay.extendedCorePhilosophy].join(" "),
    whyThisMethod: `${briefing.whyThisMethod} Framework chapters: ${overlay.frameworkChapterRefs.join(", ")}.`,
    handlingSteps: [
      ...briefing.handlingSteps,
      ...overlay.strategyCrosswalkSteps,
      `Strategy crosswalk: /admin/campaign-strategy/${overlay.frameworkChapterRefs[0] ?? "framework"}`,
    ],
    relatedLinks,
  };
}

export function applyPhase10PsychologySection(section: DebatePsychologyManualSection): DebatePsychologyManualSection {
  const crosswalk = getPhase10PsychologyCrosswalk(section.sectionId);

  const kellyApplication = [
    ...section.kellyApplication,
    ...crosswalk.strategyNotes,
    ...crosswalk.linkedPhilosophyBriefingIds.map(
      (id) => `Philosophy briefing crosswalk: /admin/intelligence/debate-briefings/${id}`,
    ),
  ];

  return {
    ...section,
    kellyApplication,
    corePrinciples: [
      ...section.corePrinciples,
      `Manual chapters: ${crosswalk.manualChapterRefs.map((c) => `/admin/campaign-strategy/${c}`).join(", ")}`,
    ],
  };
}

export function enrichPhilosophyGraphNode(node: CampaignPhilosophyNode): EnrichedPhilosophyNode {
  const overlay = getPhase10PhilosophyGraphOverlay(node.philosophyId);
  return { ...node, ...overlay };
}

export {
  philosophyBriefingMeetsPhase10Bar,
  philosophyNodeMeetsPhase10Bar,
  psychologySectionMeetsPhase10Bar,
};

export type { EnrichedPhilosophyNode };
