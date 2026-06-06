import { NSI_STAFF_RESEARCH_NAV_ITEMS } from "@/lib/intelligence/debate-week-nav";
import { getAllDebatePsychologyManualSectionIds } from "@/lib/intelligence/v4/debatePsychologyTrainingManual";
import { getTier2DebatePrepLinkAuditRoutes } from "@/lib/intelligence/v4/debatePrepDepthNav";
import { getKimHammerTier3LinkAuditRoutes } from "@/lib/intelligence/v4/kimHammerOpponentModuleNav";
import { getFieldBookLinkAuditRoutes } from "@/lib/intelligence/fieldBookRegistry";
import { getFieldBookCanonLinkAuditRoutes } from "@/lib/intelligence/fieldBookCanonRegistry";
import { getThreeLaneNavLinkAuditRoutes } from "@/lib/intelligence/v4/threeLaneNav";
import { getPackoCommandCenterLinkAuditRoutes } from "@/lib/intelligence/opponents/packoCommandCenterRoutes";
import { OPPONENT_DILIGENCE_HUB_HREF, OPPONENT_DILIGENCE_SUBJECTS } from "@/lib/intelligence/v4/opponentDiligenceRegistry";
import {
  TIER_4_CORE_EXTENDED_NAV_ITEMS,
  TIER_4_CORE_PRIMARY_NAV_ITEMS,
  TIER_4_IPAD_MORE_NAV_ITEMS,
  TIER_4_IPAD_PRIMARY_NAV_ITEMS,
} from "@/lib/intelligence/v4/tier4CoreSpineNav";

/** Normalize intelligence nav hrefs for visit tracking and release batches. */
export function normalizeNavHref(href: string): string {
  const path = href.split("?")[0]?.split("#")[0]?.trim() ?? href;
  if (!path) return "/admin/intelligence";
  if (path === "/admin/intelligence/") return "/admin/intelligence";
  return path.replace(/\/$/, "") || "/admin/intelligence";
}

export function getTier1NavLinkAuditRoutes(): string[] {
  return [
    "/admin/intelligence/debate-prep/psychology-manual",
    ...getAllDebatePsychologyManualSectionIds().map(
      (id) => `/admin/intelligence/debate-prep/psychology-manual/${id}`,
    ),
    ...NSI_STAFF_RESEARCH_NAV_ITEMS.map((item) => item.href),
  ];
}

function dedupeHrefs(hrefs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const href of hrefs) {
    const normalized = normalizeNavHref(href);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

/** Client-safe release hrefs (hub routes — no node:fs drill-down expansion). */
export function buildTierWiringReleaseHrefs(): string[] {
  return dedupeHrefs([
    ...getTier1NavLinkAuditRoutes(),
    ...getTier2DebatePrepLinkAuditRoutes(),
    ...getKimHammerTier3LinkAuditRoutes(),
    ...TIER_4_CORE_PRIMARY_NAV_ITEMS.map((item) => item.href),
    ...TIER_4_CORE_EXTENDED_NAV_ITEMS.map((item) => item.href),
    ...TIER_4_IPAD_PRIMARY_NAV_ITEMS.map((item) => item.href),
    ...TIER_4_IPAD_MORE_NAV_ITEMS.map((item) => item.href),
  ]);
}

export type NavLinkReleaseBatch = {
  id: string;
  label: string;
  hrefs: string[];
};

/**
 * Per-deploy batches of newly introduced nav hrefs.
 * On each GitHub push with new routes: append a batch with a new id and only the new hrefs.
 */
export const NAV_LINK_RELEASE_BATCHES: NavLinkReleaseBatch[] = [
  {
    id: process.env.NEXT_PUBLIC_NAV_RELEASE_ID ?? "2026-06-05-tier-wiring-v1",
    label: "Tier 1–4 navigation wiring",
    hrefs: buildTierWiringReleaseHrefs(),
  },
  {
    id: "2026-06-05-phase-a-diligence-field-book",
    label: "Phase A diligence + Field Book",
    hrefs: dedupeHrefs([
      OPPONENT_DILIGENCE_HUB_HREF,
      ...OPPONENT_DILIGENCE_SUBJECTS.map((s) => s.href),
      ...getFieldBookLinkAuditRoutes(),
    ]),
  },
  {
    id: "2026-06-05-phase-d-organization-canon",
    label: "Phase D three-lane nav + Field Book canon loop",
    hrefs: dedupeHrefs([
      ...getThreeLaneNavLinkAuditRoutes(),
      ...getFieldBookCanonLinkAuditRoutes(),
      "/admin/intelligence/field-book/canon",
      "/admin/intelligence/field-book/phase/phase-d",
    ]),
  },
  {
    id: "2026-06-05-phase-0-pakko-command-center",
    label: "Phase 0 Pakko command center",
    hrefs: dedupeHrefs([...getPackoCommandCenterLinkAuditRoutes()]),
  },
  {
    id: "2026-06-05-phase-1-dossier-briefing-book",
    label: "Phase 1 dossier briefing book pass",
    hrefs: dedupeHrefs([
      "/admin/intelligence/candidate-dossiers",
      "/admin/intelligence/candidate-dossiers/kelly-grappe",
      "/admin/intelligence/opponents/dossiers/kim-hammer",
      "/admin/intelligence/opponents/dossiers/michael-packo",
      ...getPackoCommandCenterLinkAuditRoutes(),
    ]),
  },
  {
    id: "2026-06-05-phase-2-diligence-field-book-depth",
    label: "Phase 2 diligence operator prose + Field Book depth",
    hrefs: dedupeHrefs([
      OPPONENT_DILIGENCE_HUB_HREF,
      ...OPPONENT_DILIGENCE_SUBJECTS.map((s) => s.href),
      "/admin/intelligence/field-book/phase/phase-a",
      "/admin/intelligence/field-book/court-diligence-protocol",
      "/admin/intelligence/field-book/kelly-five-search-checklist",
      "/admin/intelligence/field-book/hammer-diligence-checklist",
      "/admin/intelligence/field-book/pakko-diligence-checklist",
    ]),
  },
  {
    id: "2026-06-05-phase-3-debate-spine-depth",
    label: "Phase 3 five-layer debate spine waves",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-3-upgrade",
      "/admin/intelligence/supreme-workbench",
      "/admin/intelligence/debate-command",
      "/admin/intelligence/film-room",
      "/admin/intelligence/trap-lanes",
      "/admin/intelligence/sos-debate-questions",
    ]),
  },
  {
    id: "2026-06-05-phase-4-canon-strategy-migration",
    label: "Phase 4 Field Book canon loop + strategy migration",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-4-upgrade",
      "/admin/intelligence/field-book/canon",
      "/admin/intelligence/strategy-alignment",
      ...getFieldBookCanonLinkAuditRoutes(),
    ]),
  },
  {
    id: "2026-06-05-phase-5-glossary-connectivity",
    label: "Phase 5 debate glossary + hub connectivity",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-5-upgrade",
      "/admin/intelligence/field-book/glossary",
      "/admin/intelligence/field-book/debate-glossary",
      "/admin/intelligence/kelly-debate-coaching",
      "/admin/intelligence/opposition-strategy",
      "/admin/intelligence/command-center",
      "/admin/intelligence/debate-prep/psychology-manual",
    ]),
  },
  {
    id: "2026-06-05-phase-6-debate-ready-governance",
    label: "Phase 6 debate-ready governance",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-6-upgrade",
      "/admin/intelligence/field-book/debate-ready-governance",
      "/admin/intelligence/kim-hammer/debate-archive",
      "/admin/intelligence/kim-hammer/county-briefings",
      "/admin/intelligence/kim-hammer/citation-locker",
    ]),
  },
  {
    id: "2026-06-05-phase-7-dossier-diligence-closure",
    label: "Phase 7 dossier briefing closure + diligence runbook",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-7-upgrade",
      "/admin/intelligence/field-book/dossier-diligence-closure",
      "/admin/intelligence/kim-hammer/audit-log",
      "/admin/intelligence/kim-hammer/modern-sos-contrast",
      "/admin/intelligence/kim-hammer/kh3-operational",
    ]),
  },
  {
    id: "2026-06-05-phase-8-dossier-research-acca-closure",
    label: "Phase 8 dossier research depth + ACCA panel closure",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-8-upgrade",
      "/admin/intelligence/field-book/dossier-research-acca-closure",
      "/admin/intelligence/candidate-dossiers/kelly-grappe/kelly-career-timeline-deep",
      "/admin/intelligence/county-clerk-week/acca-summer-conference/panel-format",
      "/admin/intelligence/kim-hammer/geographic-narrative-intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-9-debate-instruction-bridge",
    label: "Phase 9 dossier depth + debate instruction bridge",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-9-upgrade",
      "/admin/intelligence/field-book/debate-instruction-bridge",
      "/admin/intelligence/kelly-debate-coaching",
      "/admin/intelligence/kim-hammer/debate-prep/county-deep",
      "/admin/intelligence/kim-hammer/ai-opposition-copilot",
    ]),
  },
];

export const CURRENT_NAV_RELEASE_ID =
  NAV_LINK_RELEASE_BATCHES[NAV_LINK_RELEASE_BATCHES.length - 1]?.id ?? "unknown";

const RELEASE_HREF_INDEX: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const batch of NAV_LINK_RELEASE_BATCHES) {
    for (const href of batch.hrefs) {
      map.set(normalizeNavHref(href), batch.id);
    }
  }
  return map;
})();

export function getNavReleaseIdForHref(href: string): string | undefined {
  return RELEASE_HREF_INDEX.get(normalizeNavHref(href));
}

export function isTrackedNewNavHref(href: string): boolean {
  return RELEASE_HREF_INDEX.has(normalizeNavHref(href));
}

export function getAllTrackedNewNavHrefs(): string[] {
  return dedupeHrefs(NAV_LINK_RELEASE_BATCHES.flatMap((batch) => batch.hrefs));
}

export function getNewNavHrefsForRelease(releaseId: string): string[] {
  const batch = NAV_LINK_RELEASE_BATCHES.find((b) => b.id === releaseId);
  return batch?.hrefs.map(normalizeNavHref) ?? [];
}
