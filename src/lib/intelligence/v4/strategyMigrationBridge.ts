/**
 * Phase 4 — Strategy manual ↔ intelligence route ↔ Field Book canon bridge.
 * Maps live intelligence surfaces to strategy manual pathKeys for promotion workflow.
 */
import { STRATEGY_MD_ENTRIES } from "@/lib/campaign-strategy/md-manifest";
import { FIELD_BOOK_CANON_BINDINGS } from "@/lib/intelligence/fieldBookCanonRegistry";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";

export type StrategyMigrationRoute = {
  intelligenceHref: string;
  label: string;
  strategyPathKeys: string[];
  fieldBookSlugs: string[];
  promoteNote: string;
};

const INTELLIGENCE_STRATEGY_ROUTES: StrategyMigrationRoute[] = [
  {
    intelligenceHref: "/admin/intelligence/supreme-workbench",
    label: "Supreme workbench",
    strategyPathKeys: ["framework", "build-audit", "executive-summary"],
    fieldBookSlugs: ["court-diligence-protocol", "three-lane-nav", "strategy-migration"],
    promoteNote: "Command surface — tie readiness scores to theory-of-change and build audit chapters.",
  },
  {
    intelligenceHref: "/admin/intelligence/debate-command",
    label: "Debate command",
    strategyPathKeys: ["framework", "programs/comms-media"],
    fieldBookSlugs: ["claims-firewall", "three-way-speak-order"],
    promoteNote: "Debate-night readiness — migrate comms/media framing from manual when claims VERIFIED.",
  },
  {
    intelligenceHref: "/admin/intelligence/trap-lanes",
    label: "Trap lanes",
    strategyPathKeys: ["programs/comms-media", "framework"],
    fieldBookSlugs: ["claims-firewall", "cvsgf-ledger-gap", "kim-hammer-legislative-record"],
    promoteNote: "Offensive trap setup — pair manual comms discipline with act-proof drill-downs.",
  },
  {
    intelligenceHref: "/admin/intelligence/sos-debate-questions",
    label: "SOS debate questions",
    strategyPathKeys: ["framework", "programs/comms-media"],
    fieldBookSlugs: ["claims-firewall", "three-way-speak-order"],
    promoteNote: "Expected moderator questions — speak-order drills promote into Field Book when ledger clean.",
  },
  {
    intelligenceHref: "/admin/intelligence/diligence",
    label: "Diligence hub",
    strategyPathKeys: ["build-audit", "meta"],
    fieldBookSlugs: ["court-diligence-protocol", "counsel-review-frame", "kelly-five-search-checklist"],
    promoteNote: "Safety rails before narrative — counsel frame from manual meta/disclaimers cross-check.",
  },
  {
    intelligenceHref: "/admin/intelligence/candidate-dossiers",
    label: "Candidate dossiers",
    strategyPathKeys: ["executive-summary", "framework"],
    fieldBookSlugs: ["kelly-five-search-checklist", "hammer-diligence-checklist", "pakko-diligence-checklist"],
    promoteNote: "Briefing books — executive summary tone migrates after dossier sections reach briefing bar.",
  },
  {
    intelligenceHref: "/admin/intelligence/opponents/michael-packo",
    label: "Pakko command center",
    strategyPathKeys: ["framework", "programs/comms-media"],
    fieldBookSlugs: ["pakko-command-center", "pakko-contrast-gate", "pakko-diligence-checklist"],
    promoteNote: "Third-candidate contrast — manual comms rules govern clerk-room elevation policy.",
  },
  {
    intelligenceHref: "/admin/intelligence/kim-hammer",
    label: "Kim Hammer stack",
    strategyPathKeys: ["build-audit", "programs/relational-field"],
    fieldBookSlugs: ["hammer-diligence-checklist", "kim-hammer-legislative-record"],
    promoteNote: "Opposition research — relational field intel chapter pairs with Hammer module map.",
  },
  {
    intelligenceHref: "/admin/intelligence/county-clerk-week",
    label: "County clerk week",
    strategyPathKeys: ["programs/relational-field", "programs/registration"],
    fieldBookSlugs: ["three-lane-nav", "claims-firewall"],
    promoteNote: "Clerk path — relational field program chapter feeds ACCA panel and 7-day essays.",
  },
  {
    intelligenceHref: "/admin/intelligence/election-funding",
    label: "Election funding",
    strategyPathKeys: ["lane", "build-audit"],
    fieldBookSlugs: ["cvsgf-ledger-gap", "claims-firewall"],
    promoteNote: "CVSGF/HAVA — budget/lane math chapter informs funding trap research questions.",
  },
  {
    intelligenceHref: "/admin/intelligence/claims",
    label: "Claims ledger",
    strategyPathKeys: ["meta", "build-audit"],
    fieldBookSlugs: ["claims-firewall", "counsel-review-frame", "strategy-migration"],
    promoteNote: "Governance firewall — no manual chunk promotes to Field Book body until VERIFIED here.",
  },
  {
    intelligenceHref: "/admin/intelligence/strategy-alignment",
    label: "Strategy alignment dashboard",
    strategyPathKeys: ["framework", "executive-summary", "lane"],
    fieldBookSlugs: ["strategy-migration", "three-lane-nav"],
    promoteNote: "Live alignment reader — primary surface for manual chunk preview before Field Book promotion.",
  },
  {
    intelligenceHref: "/admin/intelligence/field-book/canon",
    label: "Canon loop hub",
    strategyPathKeys: ["build-audit"],
    fieldBookSlugs: ["strategy-migration", "three-lane-nav", "role-based-nav-profiles"],
    promoteNote: "Canon registry — documents which routes bind to which encyclopedia entries.",
  },
  {
    intelligenceHref: "/admin/intelligence/build-progress",
    label: "Build progress",
    strategyPathKeys: ["build-audit", "lane"],
    fieldBookSlugs: ["strategy-migration", "three-lane-nav", "role-based-nav-profiles"],
    promoteNote: "Master tracker — phase completion % drives when manual migration batches unlock.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-3-upgrade",
    label: "Phase 3 depth waves",
    strategyPathKeys: ["build-audit", "framework"],
    fieldBookSlugs: ["five-block-drill-template", "claims-firewall"],
    promoteNote: "Five-layer debate spine — promote wave-complete pages into Field Book after claims close.",
  },
  {
    intelligenceHref: "/admin/intelligence/film-room",
    label: "Film room",
    strategyPathKeys: ["programs/comms-media"],
    fieldBookSlugs: ["film-room-mvp", "claims-firewall"],
    promoteNote: "Clip governance — comms/media manual governs what may be cited on stage from video.",
  },
  {
    intelligenceHref: "/admin/intelligence/kelly-debate-coaching",
    label: "Kelly debate coaching",
    strategyPathKeys: ["framework", "programs/comms-media"],
    fieldBookSlugs: ["debate-glossary", "three-way-speak-order", "kelly-five-search-checklist"],
    promoteNote: "Kelly defense — offensive moves and speak-order; diligence frame before court claims.",
  },
  {
    intelligenceHref: "/admin/intelligence/opposition-strategy",
    label: "Opposition strategy",
    strategyPathKeys: ["build-audit", "programs/comms-media"],
    fieldBookSlugs: ["kim-hammer-legislative-record", "claims-firewall", "debate-glossary"],
    promoteNote: "Offense command — trap lanes and legislative record before personal contrast.",
  },
  {
    intelligenceHref: "/admin/intelligence/debate-depth",
    label: "Debate depth library",
    strategyPathKeys: ["framework", "build-audit"],
    fieldBookSlugs: ["five-block-drill-template", "plain-language-prep-sections", "debate-glossary"],
    promoteNote: "Depth topics — glossary links resolve jargon before Field Book promotion.",
  },
  {
    intelligenceHref: "/admin/intelligence/action-queue",
    label: "Human action queue",
    strategyPathKeys: ["build-audit", "meta"],
    fieldBookSlugs: ["claims-firewall", "strategy-migration"],
    promoteNote: "Staff task queue — claims gate on every debate-week action item.",
  },
  {
    intelligenceHref: "/admin/intelligence/agent-tooling",
    label: "Agent tooling",
    strategyPathKeys: ["meta", "build-audit"],
    fieldBookSlugs: ["strategy-migration", "claims-firewall"],
    promoteNote: "Agent registry — no autonomous claim promotion without ledger review.",
  },
  {
    intelligenceHref: "/admin/intelligence/ai-tools",
    label: "AI tools hub",
    strategyPathKeys: ["meta", "framework"],
    fieldBookSlugs: ["claims-firewall", "counsel-review-frame"],
    promoteNote: "Model outputs NEEDS_REVIEW until staff verifies in claims ledger.",
  },
  {
    intelligenceHref: "/admin/intelligence/command-center",
    label: "Intelligence command center",
    strategyPathKeys: ["executive-summary", "framework"],
    fieldBookSlugs: ["three-lane-nav", "debate-glossary"],
    promoteNote: "Hub launch — lane orientation and glossary for new operators.",
  },
  {
    intelligenceHref: "/admin/intelligence/kelly-mirror",
    label: "Kelly mirror",
    strategyPathKeys: ["build-audit", "meta"],
    fieldBookSlugs: ["kelly-five-search-checklist", "claims-firewall"],
    promoteNote: "Staff-only Kelly research mirror — CANDIDATE profile hides route.",
  },
  {
    intelligenceHref: "/admin/intelligence/election-equipment-vvsg",
    label: "Election equipment VVSG",
    strategyPathKeys: ["lane", "programs/registration"],
    fieldBookSlugs: ["cvsgf-ledger-gap", "claims-firewall"],
    promoteNote: "VVSG standards — clerk vocabulary paired with election funding depth.",
  },
  {
    intelligenceHref: "/admin/intelligence/debate-prep/psychology-manual",
    label: "Psychology manual",
    strategyPathKeys: ["framework", "programs/comms-media"],
    fieldBookSlugs: ["debate-glossary", "plain-language-prep-sections", "debate-night-cheat-sheet"],
    promoteNote: "Training manual — pivot frames and stress drills with glossary links.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-5-upgrade",
    label: "Phase 5 glossary connectivity",
    strategyPathKeys: ["build-audit", "framework"],
    fieldBookSlugs: ["debate-glossary", "plain-language-prep-sections", "strategy-migration"],
    promoteNote: "Phase 5 exit — glossary registry, hub bindings, Field Book B/C depth.",
  },
  {
    intelligenceHref: "/admin/intelligence/field-book/glossary",
    label: "Debate glossary index",
    strategyPathKeys: ["build-audit"],
    fieldBookSlugs: ["debate-glossary", "plain-language-prep-sections"],
    promoteNote: "Alphabetical term registry — Wikipedia-style intelligence workbench glossary.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-6-upgrade",
    label: "Phase 6 debate-ready governance",
    strategyPathKeys: ["build-audit", "meta"],
    fieldBookSlugs: ["debate-ready-governance", "claims-firewall", "debate-glossary"],
    promoteNote: "Phase 6 exit — prep depth, trap rebuttals, claims wave, KH module promotion.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-7-upgrade",
    label: "Phase 7 dossier diligence closure",
    strategyPathKeys: ["build-audit", "framework"],
    fieldBookSlugs: ["dossier-diligence-closure", "debate-ready-governance", "cvsgf-ledger-gap"],
    promoteNote: "Phase 7 exit — dossier briefing bar, diligence runbook, funding transparency, KH wave 2.",
  },
];

export function listStrategyMigrationRoutes(): StrategyMigrationRoute[] {
  return INTELLIGENCE_STRATEGY_ROUTES;
}

export function getStrategyMigrationForHref(href: string): StrategyMigrationRoute | undefined {
  const path = href.split("?")[0]?.replace(/\/$/, "") || href;
  return INTELLIGENCE_STRATEGY_ROUTES.find(
    (r) => path === r.intelligenceHref || path.startsWith(`${r.intelligenceHref}/`),
  );
}

export function resolveStrategyManualLabels(pathKeys: string[]): string[] {
  return pathKeys.map((pk) => STRATEGY_MD_ENTRIES.find((e) => e.path === pk)?.label ?? pk);
}

export function strategyMigrationCoveragePct(): number {
  const withManual = INTELLIGENCE_STRATEGY_ROUTES.filter((r) => r.strategyPathKeys.length > 0).length;
  return Math.round((withManual / INTELLIGENCE_STRATEGY_ROUTES.length) * 100);
}

export function validateStrategyMigrationBridge(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const route of INTELLIGENCE_STRATEGY_ROUTES) {
    for (const pk of route.strategyPathKeys) {
      if (!STRATEGY_MD_ENTRIES.some((e) => e.path === pk)) {
        errors.push(`${route.intelligenceHref}: unknown strategy pathKey "${pk}"`);
      }
    }
    for (const slug of route.fieldBookSlugs) {
      if (!getFieldBookArticle(slug)) {
        errors.push(`${route.intelligenceHref}: missing Field Book article "${slug}"`);
      }
    }
  }
  for (const binding of FIELD_BOOK_CANON_BINDINGS) {
    for (const slug of binding.fieldBookSlugs) {
      if (!getFieldBookArticle(slug)) {
        errors.push(`Canon binding ${binding.routePrefix}: missing article "${slug}"`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}
