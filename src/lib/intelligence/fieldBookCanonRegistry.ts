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
