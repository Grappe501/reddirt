/**
 * Field Book canon loop — maps intelligence routes to encyclopedia articles and claims gates.
 * Phase 4: every page promotes into connected canon; claims register through ledger workflow.
 */

import { getFieldBookArticle, type FieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";

export type FieldBookCanonBinding = {
  routePrefix: string;
  fieldBookSlugs: string[];
  claimsLedgerHref?: string;
  promoteNote: string;
  laneHint?: "kelly" | "clerks" | "staff" | "phase_a";
};

export const FIELD_BOOK_CANON_BINDINGS: FieldBookCanonBinding[] = [
  {
    routePrefix: "/admin/intelligence/diligence",
    fieldBookSlugs: ["court-diligence-protocol", "kelly-five-search-checklist", "counsel-review-frame"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Log search outcomes in diligence JSON — Field Book counsel frame governs stage lines.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/candidate-dossiers",
    fieldBookSlugs: ["kelly-five-search-checklist", "hammer-diligence-checklist", "pakko-diligence-checklist"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Dossier claims must match ledger classification before debate adaptation.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/opponents/michael-packo",
    fieldBookSlugs: ["pakko-diligence-checklist", "pakko-contrast-gate", "pakko-command-center"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Pakko command center — Phase 0 front door. Contrast gate governs rehearsal modules.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/opponents/dossiers/michael-packo",
    fieldBookSlugs: ["pakko-diligence-checklist", "pakko-contrast-gate", "pakko-command-center"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Pakko contrast locked until PACKO-01/02 partial — see contrast gate article.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/opponents",
    fieldBookSlugs: ["pakko-contrast-gate", "hammer-diligence-checklist"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Opponent hub — pair Hammer production modules with Pakko scaffold tasks.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/trap-lanes",
    fieldBookSlugs: ["claims-firewall", "cvsgf-ledger-gap"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Each trap lane carries a claimsGate — verify before stage.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/sos-debate-questions",
    fieldBookSlugs: ["claims-firewall", "three-way-speak-order"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "SOS bank speak-order drills — research-question framing when gate active.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/county-clerk-week",
    fieldBookSlugs: ["three-lane-nav", "claims-firewall"],
    promoteNote: "Clerk week path — do not elevate Pakko unless asked.",
    laneHint: "clerks",
  },
  {
    routePrefix: "/admin/intelligence/election-funding",
    fieldBookSlugs: ["cvsgf-ledger-gap", "claims-firewall"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "CVSGF remittance totals research-question-only until ingested.",
    laneHint: "clerks",
  },
  {
    routePrefix: "/admin/intelligence/kim-hammer",
    fieldBookSlugs: ["hammer-diligence-checklist", "kim-hammer-legislative-record"],
    promoteNote: "Hammer module map — offensive diligence before personal contrast.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/field-book",
    fieldBookSlugs: ["strategy-migration", "three-lane-nav"],
    promoteNote: "Field Book grows each upgrade phase — canon loop promotes page depth here.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/build-progress",
    fieldBookSlugs: ["strategy-migration", "three-lane-nav", "role-based-nav-profiles"],
    promoteNote: "Build progress tracks canon completion — link audit + phase gates.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/supreme-workbench",
    fieldBookSlugs: ["court-diligence-protocol", "three-lane-nav", "strategy-migration"],
    promoteNote: "Supreme workbench unifies readiness — start Phase A checklist before narrative depth.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/debate-command",
    fieldBookSlugs: ["claims-firewall", "three-way-speak-order", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Debate command scores gate stage prep — verify claims before Kelly rehearses blocked trap lanes.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/film-room",
    fieldBookSlugs: ["film-room-mvp", "claims-firewall", "kim-hammer-legislative-record"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Clip inventory NON_PUBLISHABLE until VERIFIED — promote transcript summaries into Field Book after ledger row.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/claims",
    fieldBookSlugs: ["claims-firewall", "counsel-review-frame", "strategy-migration"],
    promoteNote: "Claims ledger is the promotion firewall — Field Book body text inherits classification from here.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/phase-3-upgrade",
    fieldBookSlugs: ["five-block-drill-template", "claims-firewall", "strategy-migration"],
    promoteNote: "Five-layer wave tracker — complete W3 debate spine before promoting content into Field Book canon.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/strategy-alignment",
    fieldBookSlugs: ["strategy-migration", "three-lane-nav", "role-based-nav-profiles"],
    promoteNote: "Strategy alignment dashboard previews manual chunks before Field Book promotion — claims gate on every adaptation.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/opponents/dossiers/kim-hammer",
    fieldBookSlugs: ["hammer-diligence-checklist", "kim-hammer-legislative-record"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Hammer dossier offensive surface — pair legislative record with diligence log before personal contrast.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/debate-briefings",
    fieldBookSlugs: ["five-block-drill-template", "claims-firewall", "three-way-speak-order"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Philosophy and SOS briefings — promote verified briefing prose into Field Book after claims review.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-4-upgrade",
    fieldBookSlugs: ["strategy-migration", "three-lane-nav", "role-based-nav-profiles"],
    promoteNote: "Phase 4 exit gate — bindings, strategy bridge, and Phase D article bar tracked here.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/kelly-debate-coaching",
    fieldBookSlugs: ["debate-glossary", "three-way-speak-order", "kelly-five-search-checklist"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Kelly defense coaching — offensive moves and speak-order cards; diligence incomplete frame governs court claims.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/opposition-strategy",
    fieldBookSlugs: ["kim-hammer-legislative-record", "claims-firewall", "debate-glossary"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Offense layer — trap lane map and 2021/2025 package depth; legislative record before personal contrast.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/debate-depth",
    fieldBookSlugs: ["five-block-drill-template", "plain-language-prep-sections", "debate-glossary"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Depth library topics — promote verified prose into Field Book after glossary links resolve jargon.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/action-queue",
    fieldBookSlugs: ["claims-firewall", "strategy-migration", "debate-glossary"],
    promoteNote: "Human action queue — staff tasks inherit claims gate before debate-week execution.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/agent-tooling",
    fieldBookSlugs: ["strategy-migration", "claims-firewall", "debate-glossary"],
    promoteNote: "Agent tooling registry — no autonomous claim promotion; ledger workflow required.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/ai-tools",
    fieldBookSlugs: ["claims-firewall", "counsel-review-frame", "debate-glossary"],
    promoteNote: "AI tools hub — model outputs NEEDS_REVIEW until staff verifies in claims ledger.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/command-center",
    fieldBookSlugs: ["three-lane-nav", "strategy-migration", "debate-glossary"],
    promoteNote: "Intelligence hub launch — lane colors and glossary index for new operators.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/kelly-mirror",
    fieldBookSlugs: ["kelly-five-search-checklist", "claims-firewall", "debate-glossary"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Kelly mirror staff research — hidden from CANDIDATE nav profile; diligence log governs mirror claims.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/election-equipment-vvsg",
    fieldBookSlugs: ["cvsgf-ledger-gap", "claims-firewall", "debate-glossary"],
    promoteNote: "VVSG equipment standards — clerk vocabulary; pair with election funding depth routes.",
    laneHint: "clerks",
  },
  {
    routePrefix: "/admin/intelligence/debate-prep/psychology-manual",
    fieldBookSlugs: ["debate-glossary", "plain-language-prep-sections", "debate-night-cheat-sheet"],
    promoteNote: "Psychology training manual — stress drills and pivot frames link to glossary on first jargon use.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-5-upgrade",
    fieldBookSlugs: ["debate-glossary", "plain-language-prep-sections", "strategy-migration"],
    promoteNote: "Phase 5 exit gate — glossary registry, hub bindings, and Field Book B/C depth tracked here.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/field-book/glossary",
    fieldBookSlugs: ["debate-glossary", "plain-language-prep-sections", "strategy-migration"],
    promoteNote: "Glossary index — alphabetical debate terms with Field Book and route cross-links.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/phase-6-upgrade",
    fieldBookSlugs: ["debate-ready-governance", "claims-firewall", "debate-glossary"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 6 exit gate — prep encounter depth, trap rebuttals, claims review wave, KH promotions.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/phase-7-upgrade",
    fieldBookSlugs: ["dossier-diligence-closure", "debate-ready-governance", "cvsgf-ledger-gap"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 7 exit gate — dossier briefing closure, diligence runbook, election funding transparency, KH wave 2.",
    laneHint: "phase_a",
  },
  {
    routePrefix: "/admin/intelligence/phase-8-upgrade",
    fieldBookSlugs: ["dossier-research-acca-closure", "dossier-diligence-closure", "acca-summer-conference-2026"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 8 exit gate — dossier research corpus, ACCA panel runbook, KH wave 3.",
    laneHint: "clerks",
  },
];

export const FIELD_BOOK_CANON_HUB_HREF = "/admin/intelligence/field-book/canon";

export function resolveCanonBinding(pathname: string): FieldBookCanonBinding | undefined {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") || "/admin/intelligence";
  const matches = FIELD_BOOK_CANON_BINDINGS.filter(
    (b) => path === b.routePrefix || path.startsWith(`${b.routePrefix}/`),
  );
  if (!matches.length) return undefined;
  return matches.sort((a, b) => b.routePrefix.length - a.routePrefix.length)[0];
}

export function resolveCanonArticles(pathname: string): FieldBookArticle[] {
  const binding = resolveCanonBinding(pathname);
  if (!binding) return [];
  return binding.fieldBookSlugs
    .map((slug) => getFieldBookArticle(slug))
    .filter((a): a is FieldBookArticle => Boolean(a));
}

export function getFieldBookCanonLinkAuditRoutes(): string[] {
  return [FIELD_BOOK_CANON_HUB_HREF, ...FIELD_BOOK_CANON_BINDINGS.map((b) => b.routePrefix)];
}

export type CanonLoopStats = {
  bindingCount: number;
  articleSlugs: number;
  routesWithClaimsGate: number;
};

export function computeCanonLoopStats(): CanonLoopStats {
  const slugs = new Set(FIELD_BOOK_CANON_BINDINGS.flatMap((b) => b.fieldBookSlugs));
  return {
    bindingCount: FIELD_BOOK_CANON_BINDINGS.length,
    articleSlugs: slugs.size,
    routesWithClaimsGate: FIELD_BOOK_CANON_BINDINGS.filter((b) => b.claimsLedgerHref).length,
  };
}
