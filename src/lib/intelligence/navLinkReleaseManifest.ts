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
  {
    id: "2026-06-05-phase-10-strategy-philosophy-command",
    label: "Phase 10 strategy & political philosophy command",
    hrefs: dedupeHrefs([
      "/admin/intelligence/strategy-philosophy-hub",
      "/admin/intelligence/field-book/strategy-philosophy-command",
      "/admin/intelligence/debate-briefings/author-vs-administrator",
      "/admin/campaign-strategy/framework",
      "/admin/intelligence/campaign-intelligence-graph",
    ]),
  },
  {
    id: "2026-06-05-phase-11-campaign-system-surfacing",
    label: "Phase 11 P0 campaign system manual surfacing",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-upgrade",
      "/admin/intelligence/campaign-system-manual",
      "/admin/intelligence/field-book/campaign-system-manual-command",
      "/admin/intelligence/campaign-system-manual/CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL",
      "/admin/intelligence/campaign-system-manual/SIMULATION_AND_FORECASTING_SYSTEM_PLAN",
    ]),
  },
  {
    id: "2026-06-05-phase-11-p1-kelly-strategic-plan",
    label: "Phase 11 P1 Kelly SOS strategic plan command",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-p1-upgrade",
      "/admin/intelligence/kelly-strategic-plan",
      "/admin/intelligence/kelly-strategic-plan/framework",
      "/admin/intelligence/field-book/kelly-strategic-plan-command",
      "/admin/campaign-strategy/framework",
    ]),
  },
  {
    id: "2026-06-05-phase-11-p2-movement-philosophy-staff-strategy",
    label: "Phase 11 P2 movement philosophy + staff strategy command",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-p2-upgrade",
      "/admin/intelligence/movement-philosophy",
      "/admin/intelligence/movement-philosophy/core-principles",
      "/admin/intelligence/staff-strategy-command",
      "/admin/intelligence/field-book/movement-philosophy-command",
      "/admin/intelligence/morning-brief",
    ]),
  },
  {
    id: "2026-06-05-phase-11-p3-strategy-doctrine",
    label: "Phase 11 P3 strategy doctrine JSON command",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-p3-upgrade",
      "/admin/intelligence/strategy-doctrine",
      "/admin/intelligence/strategy-doctrine/steve-strategy-doctrine",
      "/admin/intelligence/field-book/strategy-doctrine-command",
      "/admin/intelligence/strategy-alignment",
    ]),
  },
  {
    id: "2026-06-05-phase-11-p4-philosophy-graph-claims",
    label: "Phase 11 P4 philosophy graph claims review",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-p4-upgrade",
      "/admin/intelligence/philosophy-graph-claims-review",
      "/admin/intelligence/philosophy-graph-claims-review/philosophy-civic-trust",
      "/admin/intelligence/field-book/philosophy-graph-claims-command",
      "/admin/intelligence/campaign-intelligence-graph",
    ]),
  },
  {
    id: "2026-06-05-phase-11-p5-field-book-chunk-promotion",
    label: "Phase 11 P5 Field Book chunk promotion",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-p5-upgrade",
      "/admin/intelligence/field-book-chunk-promotion",
      "/admin/intelligence/field-book-chunk-promotion/kelly-foundation",
      "/admin/intelligence/field-book/field-book-chunk-promotion-command",
      "/admin/intelligence/field-book/canon",
      "/admin/intelligence/strategy-alignment",
    ]),
  },
  {
    id: "2026-06-05-phase-11-p6-strategy-alignment-chunk-preview",
    label: "Phase 11 P6 strategy alignment chunk preview",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-p6-upgrade",
      "/admin/intelligence/strategy-alignment-chunk-preview",
      "/admin/intelligence/strategy-alignment-chunk-preview/foundation-civic-trust",
      "/admin/intelligence/field-book/strategy-alignment-chunk-preview-command",
      "/admin/intelligence/strategy-alignment",
      "/admin/intelligence/field-book-chunk-promotion",
    ]),
  },
  {
    id: "2026-06-05-phase-11-p7-briefing-papers-chunk-attach",
    label: "Phase 11 P7 briefing papers chunk attach",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-p7-upgrade",
      "/admin/intelligence/briefing-papers-chunk-attach",
      "/admin/intelligence/briefing-papers-chunk-attach/debate-prep",
      "/admin/intelligence/field-book/briefing-papers-chunk-attach-command",
      "/admin/intelligence/briefing-papers",
      "/admin/intelligence/strategy-alignment-chunk-preview",
    ]),
  },
  {
    id: "2026-06-05-phase-11-p8-field-book-promotion-execution",
    label: "Phase 11 P8 Field Book promotion execution",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-p8-upgrade",
      "/admin/intelligence/field-book-promotion-execution",
      "/admin/intelligence/field-book-promotion-execution/kelly-foundation-wave",
      "/admin/intelligence/field-book/field-book-promotion-execution-command",
      "/admin/intelligence/field-book/canon",
      "/admin/intelligence/field-book-chunk-promotion",
    ]),
  },
  {
    id: "2026-06-05-phase-11-p9-stack-closure",
    label: "Phase 11 P9 stack closure",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-11-p9-upgrade",
      "/admin/intelligence/phase-11-stack-closure",
      "/admin/intelligence/field-book/phase-11-stack-closure-command",
      "/admin/intelligence/strategy-philosophy-hub",
      "/admin/intelligence/field-book-promotion-execution",
      "/admin/intelligence/build-progress",
    ]),
  },
  {
    id: "2026-06-05-phase-15-p0-p1-candidate-command",
    label: "Phase 15 P0+P1 candidate command experience",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-15-p0-p1-upgrade",
      "/admin/intelligence",
      "/admin/intelligence/debate-command",
      "/admin/intelligence/trap-lanes",
      "/admin/intelligence/claims",
    ]),
  },
  {
    id: "2026-06-05-phase-15-p2-kelly-prep-week",
    label: "Phase 15 P2 Kelly prep week",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-15-p2-upgrade",
      "/admin/intelligence/kelly-prep-week",
      "/admin/intelligence/kelly-prep-week/day-1-philosophy",
      "/admin/intelligence/field-book/kelly-prep-week-command",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-15-p3-stage-safe-filter",
    label: "Phase 15 P3 stage-safe filter",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-15-p3-upgrade",
      "/admin/intelligence/stage-safe-filter",
      "/admin/intelligence/trap-lanes",
      "/admin/intelligence/sos-debate-questions",
      "/admin/intelligence/claims",
    ]),
  },
  {
    id: "2026-06-05-phase-15-p4-top-tier-surfacing",
    label: "Phase 15 P4 top-tier surfacing",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-15-p4-upgrade",
      "/admin/intelligence/top-tier-prep",
      "/admin/intelligence/debate-briefings",
      "/admin/intelligence/debate-depth",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-15-p5-evidence-honesty",
    label: "Phase 15 P5 evidence honesty badges",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-15-p5-upgrade",
      "/admin/intelligence/evidence-honesty",
      "/admin/intelligence/film-room",
      "/admin/intelligence/claims",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-15-p6-demo-mode",
    label: "Phase 15 P6 demo mode",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-15-p6-upgrade",
      "/admin/intelligence/demo-mode",
      "/admin/intelligence/county-clerk-week/acca-summer-conference",
      "/admin/intelligence/trap-lanes/county-champion",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-15-p7-ipad-polish",
    label: "Phase 15 P7 iPad polish",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-15-p7-upgrade",
      "/admin/intelligence/ipad-polish",
      "/admin/intelligence/trap-lanes",
      "/admin/intelligence/claims",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-15-p8-staff-backstage",
    label: "Phase 15 P8 staff backstage",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-15-p8-upgrade",
      "/admin/intelligence/staff-backstage",
      "/admin/intelligence/build-progress",
      "/admin/intelligence/supreme-workbench",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-15-p9-cce-closure",
    label: "Phase 15 P9 CCE closure",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-15-p9-upgrade",
      "/admin/intelligence/cce-closure",
      "/admin/intelligence/demo-mode",
      "/admin/intelligence/ipad-polish",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p0-session-launcher",
    label: "Phase 16 P0 session launcher",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p0-upgrade",
      "/admin/intelligence/rehearsal",
      "/admin/intelligence/trap-lanes",
      "/admin/intelligence/sos-debate-questions",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p1-run-of-show",
    label: "Phase 16 P1 run-of-show",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p1-upgrade",
      "/admin/intelligence/run-of-show",
      "/admin/intelligence/rehearsal",
      "/admin/intelligence/film-room",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p2-encounter-scenarios",
    label: "Phase 16 P2 encounter scenarios",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p2-upgrade",
      "/admin/intelligence/encounters",
      "/admin/intelligence/county-clerk-week/acca-summer-conference",
      "/admin/intelligence/demo-mode",
      "/admin/intelligence/rehearsal",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p3-drill-queue",
    label: "Phase 16 P3 drill queue",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p3-upgrade",
      "/admin/intelligence/drill-queue",
      "/admin/intelligence/sos-debate-questions",
      "/admin/intelligence/trap-lanes",
      "/admin/intelligence/rehearsal",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p4-session-debrief",
    label: "Phase 16 P4 session debrief",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p4-upgrade",
      "/admin/intelligence/session-debrief",
      "/admin/intelligence/action-queue",
      "/admin/intelligence/claims",
      "/admin/intelligence/drill-queue",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p5-ipad-drill-player",
    label: "Phase 16 P5 iPad drill player",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p5-upgrade",
      "/admin/intelligence/ipad-drill-player",
      "/admin/intelligence/drill-queue",
      "/admin/intelligence/ipad-polish",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p6-session-memory",
    label: "Phase 16 P6 session memory",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p6-upgrade",
      "/admin/intelligence/rehearsal-history",
      "/admin/intelligence/drill-queue",
      "/admin/intelligence/encounters",
      "/admin/intelligence",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p7-staff-coach",
    label: "Phase 16 P7 staff coach overlay",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p7-upgrade",
      "/admin/intelligence/rehearsal-coach",
      "/admin/intelligence/rehearsal",
      "/admin/intelligence/drill-queue",
      "/admin/intelligence/staff-backstage",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p8-live-event",
    label: "Phase 16 P8 live event mode",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p8-upgrade",
      "/admin/intelligence/live-event",
      "/admin/intelligence/county-clerk-week/acca-summer-conference",
      "/admin/intelligence/encounters",
      "/admin/intelligence/run-of-show",
    ]),
  },
  {
    id: "2026-06-05-phase-16-p9-sre-closure",
    label: "Phase 16 P9 SRE stack closure",
    hrefs: dedupeHrefs([
      "/admin/intelligence/phase-16-p9-upgrade",
      "/admin/intelligence/sre-closure",
      "/admin/intelligence/rehearsal",
      "/admin/intelligence/drill-queue",
      "/admin/intelligence/build-progress",
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
