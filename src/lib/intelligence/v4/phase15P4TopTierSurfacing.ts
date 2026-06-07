/**
 * Phase 15 P4 — Curated top-tier candidate prep surfaces (briefings · depth · psych).
 */
import { DEBATE_DEPTH_TOPICS } from "@/lib/intelligence/v4/debateDepthTopics";
import { listDebatePhilosophyBriefings } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { getDebatePsychologyManualSection } from "@/lib/intelligence/v4/debatePsychologyTrainingManual";

export const TOP_TIER_PREP_HUB_HREF = "/admin/intelligence/top-tier-prep";

export const PHASE15_P4_BRIEFING_TOTAL = 8;
export const PHASE15_P4_DEPTH_TOTAL = 5;
export const PHASE15_P4_PSYCH_TOTAL = 8;
export const PHASE15_P4_TOP_TIER_TONIGHT = 5;

export type TopTierPrepKind = "briefing" | "depth" | "psychology";

export type TopTierPrepItem = {
  id: string;
  kind: TopTierPrepKind;
  title: string;
  href: string;
  tier: "A" | "B";
  rank: number;
  estimatedMinutes: number;
  whyPromoted: string;
  rehearseOutLoud: string;
};

const PSYCH_TOP_TIER_IDS = [
  "advanced-candidate-manual-intro",
  "contrast-principle-differentiation",
  "trust-equation-warmth-competence",
  "arkansas-three-way-acca-context",
  "hammer-psychological-profile",
  "when-opponent-attacks-reframe",
  "competence-test-heuristics",
  "kelly-archetype-competent-mom-executive",
] as const;

function briefingItems(): TopTierPrepItem[] {
  return listDebatePhilosophyBriefings().map((b, idx) => ({
    id: b.briefingId,
    kind: "briefing" as const,
    title: b.title,
    href: `/admin/intelligence/debate-briefings/${b.briefingId}`,
    tier: "A" as const,
    rank: idx + 1,
    estimatedMinutes: 12,
    whyPromoted: "Core philosophy handling — Kelly rehearses method before trap or SOS drills.",
    rehearseOutLoud: b.samplePhrases[0]?.text ?? b.corePhilosophy.slice(0, 160),
  }));
}

function depthItems(): TopTierPrepItem[] {
  return DEBATE_DEPTH_TOPICS.map((t, idx) => ({
    id: t.topicId,
    kind: "depth" as const,
    title: t.title,
    href: t.href,
    tier: "A" as const,
    rank: PHASE15_P4_BRIEFING_TOTAL + idx + 1,
    estimatedMinutes: t.estimatedMinutes,
    whyPromoted: "Plain-language survival guide — promoted from buried depth library to command home.",
    rehearseOutLoud: t.depth.howToHandleIt[0] ?? t.summary,
  }));
}

function psychItems(): TopTierPrepItem[] {
  return PSYCH_TOP_TIER_IDS.map((sectionId, idx) => {
    const section = getDebatePsychologyManualSection(sectionId);
    return {
      id: sectionId,
      kind: "psychology" as const,
      title: section?.title ?? sectionId,
      href: `/admin/intelligence/debate-prep/psychology-manual/${sectionId}`,
      tier: "B" as const,
      rank: PHASE15_P4_BRIEFING_TOTAL + PHASE15_P4_DEPTH_TOTAL + idx + 1,
      estimatedMinutes: section?.estimatedReadMinutes ?? 10,
      whyPromoted: "Stage psychology promoted from manual index — rehearse presence before scripts.",
      rehearseOutLoud:
        section?.rehearsalScripts[0]?.text ??
        section?.corePrinciples[0] ??
        "Rehearse one acknowledgment phrase standing.",
    };
  });
}

export function listTopTierPrepItems(): TopTierPrepItem[] {
  return [...briefingItems(), ...depthItems(), ...psychItems()].sort((a, b) => a.rank - b.rank);
}

export function listTopTierPrepTonight(limit = PHASE15_P4_TOP_TIER_TONIGHT): TopTierPrepItem[] {
  return listTopTierPrepItems().slice(0, limit);
}

export function countTopTierPrepMinutes(items: TopTierPrepItem[] = listTopTierPrepItems()): number {
  return items.reduce((s, i) => s + i.estimatedMinutes, 0);
}

export function topTierPrepItemsByKind(kind: TopTierPrepKind): TopTierPrepItem[] {
  return listTopTierPrepItems().filter((i) => i.kind === kind);
}
