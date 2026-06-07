/**
 * Phase 15 P5 — Evidence honesty badge inventory for candidate surfaces.
 */
import {
  resolveEvidenceHonestyFromSpeakerVerification,
  resolveEvidenceHonestyFromText,
  type EvidenceHonestyBadge,
  type EvidenceHonestyTier,
} from "@/lib/intelligence/v4/evidenceHonestyBadge";
import { GOVERNED_BRIEF_DEFAULT_LABELS } from "@/lib/intelligence/briefs/governedBriefTypes";

export const EVIDENCE_HONESTY_HUB_HREF = "/admin/intelligence/evidence-honesty";

export const PHASE15_P5_SURFACE_CATEGORY_TOTAL = 8;

export const PHASE15_P5_FILM_DRILL_BAR = 3;

export type FilmDrillHonestyInput = {
  claimsGate: string;
  speakerVerification: string;
};

export type EvidenceHonestySurfaceKind =
  | "film-room"
  | "briefing-papers"
  | "opposition-strategy"
  | "morning-brief"
  | "trap-lanes"
  | "sos-questions"
  | "debate-coaching"
  | "claims-ledger";

export type EvidenceHonestySurface = {
  surfaceId: string;
  kind: EvidenceHonestySurfaceKind;
  title: string;
  href: string;
  defaultBadge: EvidenceHonestyBadge;
  governanceLabel: string;
  kellyRule: string;
};

const SURFACES: EvidenceHonestySurface[] = [
  {
    surfaceId: "film-room-hub",
    kind: "film-room",
    title: "Film room",
    href: "/admin/intelligence/film-room",
    defaultBadge: resolveEvidenceHonestyFromText("INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED"),
    governanceLabel: "INTERNAL_DRAFT · NON_PUBLISHABLE",
    kellyRule: "Never say 'we have video' without staff clip ID and claims row.",
  },
  {
    surfaceId: "briefing-papers-hub",
    kind: "briefing-papers",
    title: "Briefing papers",
    href: "/admin/intelligence/briefing-papers",
    defaultBadge: resolveEvidenceHonestyFromText(GOVERNED_BRIEF_DEFAULT_LABELS.join(" · ")),
    governanceLabel: "NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED",
    kellyRule: "Deep brief sections are operator drafts — not debate scripts.",
  },
  {
    surfaceId: "opposition-strategy-hub",
    kind: "opposition-strategy",
    title: "Opposition strategy",
    href: "/admin/intelligence/opposition-strategy",
    defaultBadge: resolveEvidenceHonestyFromText("INTERNAL_DRAFT · NON_PUBLISHABLE · OPPOSITION STRATEGY"),
    governanceLabel: "INTERNAL_DRAFT · NON_PUBLISHABLE",
    kellyRule: "Offense moves need act verification before any stage cite.",
  },
  {
    surfaceId: "morning-brief-hub",
    kind: "morning-brief",
    title: "Morning brief",
    href: "/admin/intelligence/morning-brief",
    defaultBadge: resolveEvidenceHonestyFromText("NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED"),
    governanceLabel: "NON_PUBLISHABLE",
    kellyRule: "Staff digest only — Kelly reads command home safe/blocked lines instead.",
  },
  {
    surfaceId: "trap-lanes-hub",
    kind: "trap-lanes",
    title: "Trap lanes",
    href: "/admin/intelligence/trap-lanes",
    defaultBadge: resolveEvidenceHonestyFromText("NEEDS_REVIEW — verify acts before stage"),
    governanceLabel: "Per-lane claimsGate",
    kellyRule: "Stage-safe filter redacts blocked rehearse lines on candidate deploy.",
  },
  {
    surfaceId: "sos-questions-hub",
    kind: "sos-questions",
    title: "SOS question bank",
    href: "/admin/intelligence/sos-debate-questions",
    defaultBadge: resolveEvidenceHonestyFromText("Mixed — per-question claimsGate"),
    governanceLabel: "Per-question claimsGate",
    kellyRule: "Speak-order scripts hidden when candidate lock applies.",
  },
  {
    surfaceId: "debate-coaching-hub",
    kind: "debate-coaching",
    title: "Debate coaching",
    href: "/admin/intelligence/kelly-debate-coaching",
    defaultBadge: resolveEvidenceHonestyFromText("GENERAL_FRAME · NEEDS_REVIEW on offensive open"),
    governanceLabel: "Script claimsGate",
    kellyRule: "Opening/closing cards show staff-verify fallback when gated.",
  },
  {
    surfaceId: "claims-ledger-hub",
    kind: "claims-ledger",
    title: "Claims ledger",
    href: "/admin/intelligence/claims",
    defaultBadge: resolveEvidenceHonestyFromText("VERIFIED vs NEEDS_REVIEW firewall"),
    governanceLabel: "Claims ledger tiers",
    kellyRule: "Only VERIFIED and approved-adaptation rows belong on stage.",
  },
];

export function listEvidenceHonestySurfaces(): EvidenceHonestySurface[] {
  return SURFACES;
}

export function getEvidenceHonestySurface(surfaceId: string): EvidenceHonestySurface | undefined {
  return SURFACES.find((s) => s.surfaceId === surfaceId);
}

export type EvidenceHonestySummary = {
  hubHref: string;
  filmDrillCount: number;
  tierCounts: Record<EvidenceHonestyTier, number>;
  nonStageSafeCount: number;
  tonightReminder: string;
};

export function buildEvidenceHonestySummary(filmDrills: FilmDrillHonestyInput[] = []): EvidenceHonestySummary {
  const tierCounts: Record<EvidenceHonestyTier, number> = {
    verified: 0,
    needs_review: 0,
    human_review: 0,
    non_publishable: 0,
    reference_only: 0,
    research_question: 0,
    thin_evidence: 0,
  };

  for (const drill of filmDrills) {
    const fromClaims = resolveEvidenceHonestyFromText(drill.claimsGate);
    const fromSpeaker = resolveEvidenceHonestyFromSpeakerVerification(drill.speakerVerification);
    const tier = fromClaims.stageSafe ? fromClaims.tier : fromSpeaker.tier;
    tierCounts[tier] += 1;
  }

  for (const surface of SURFACES) {
    tierCounts[surface.defaultBadge.tier] += 1;
  }

  const nonStageSafeCount = Object.entries(tierCounts)
    .filter(([tier]) => tier !== "verified")
    .reduce((s, [, n]) => s + n, 0);

  return {
    hubHref: EVIDENCE_HONESTY_HUB_HREF,
    filmDrillCount: filmDrills.length,
    tierCounts,
    nonStageSafeCount,
    tonightReminder:
      nonStageSafeCount > 0
        ? `${nonStageSafeCount} surfaces carry honesty badges — read badge before rehearsing any line with proof language.`
        : "Evidence tiers wired — still verify before any new adaptation.",
  };
}
