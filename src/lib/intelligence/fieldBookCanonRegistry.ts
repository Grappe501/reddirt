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
  {
    routePrefix: "/admin/intelligence/phase-9-upgrade",
    fieldBookSlugs: ["debate-instruction-bridge", "dossier-research-acca-closure", "debate-ready-governance"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 9 exit gate — dossier depth + debate instruction bridge, coaching runbook, KH wave 4.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/strategy-philosophy-hub",
    fieldBookSlugs: ["strategy-philosophy-command", "debate-glossary", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 10 exit gate — strategy & political philosophy command hub.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/debate-briefings",
    fieldBookSlugs: ["strategy-philosophy-command", "debate-glossary"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Eight debate political philosophy handling briefings.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/campaign-system-manual",
    fieldBookSlugs: ["campaign-system-manual-command", "strategy-migration", "strategy-philosophy-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P0 — campaign system manual reader and category inventory.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-upgrade",
    fieldBookSlugs: ["campaign-system-manual-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P0 exit gate — campaign system surfacing metrics.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/kelly-strategic-plan",
    fieldBookSlugs: ["kelly-strategic-plan-command", "strategy-philosophy-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P1 — Kelly SOS strategic plan intelligence reader.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-p1-upgrade",
    fieldBookSlugs: ["kelly-strategic-plan-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P1 exit gate — Kelly chapter depth metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/movement-philosophy",
    fieldBookSlugs: ["movement-philosophy-command", "strategy-philosophy-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P2 — movement philosophy corpus reader.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/staff-strategy-command",
    fieldBookSlugs: ["staff-strategy-command", "strategy-migration", "campaign-system-manual-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P2 — staff strategy command hub.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/morning-brief",
    fieldBookSlugs: ["staff-strategy-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "NSI-7 morning intelligence brief — governed daily composition.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/briefing-papers",
    fieldBookSlugs: ["staff-strategy-command", "strategy-migration", "briefing-papers-chunk-attach-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Strategic briefing paper engine — claims gate before distribution.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/writing-toolbox",
    fieldBookSlugs: ["staff-strategy-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Governed writing surfaces — movement philosophy tone check.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-p2-upgrade",
    fieldBookSlugs: ["movement-philosophy-command", "staff-strategy-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P2 exit gate — philosophy + staff strategy metrics.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/strategy-doctrine",
    fieldBookSlugs: ["strategy-doctrine-command", "strategy-philosophy-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P3 — strategy doctrine JSON reader.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-p3-upgrade",
    fieldBookSlugs: ["strategy-doctrine-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P3 exit gate — doctrine JSON surfacing metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/philosophy-graph-claims-review",
    fieldBookSlugs: ["philosophy-graph-claims-command", "strategy-philosophy-command", "claims-firewall"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P4 — philosophy graph claims review workflow.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-p4-upgrade",
    fieldBookSlugs: ["philosophy-graph-claims-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P4 exit gate — philosophy graph claims metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/field-book-chunk-promotion",
    fieldBookSlugs: ["field-book-chunk-promotion-command", "strategy-migration", "claims-firewall"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P5 — Field Book chunk promotion batch workflow.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-p5-upgrade",
    fieldBookSlugs: ["field-book-chunk-promotion-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P5 exit gate — chunk promotion inventory metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/strategy-alignment-chunk-preview",
    fieldBookSlugs: [
      "strategy-alignment-chunk-preview-command",
      "field-book-chunk-promotion-command",
      "claims-firewall",
    ],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P6 — SDI-1 alignment chunk preview lanes.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-p6-upgrade",
    fieldBookSlugs: ["strategy-alignment-chunk-preview-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P6 exit gate — alignment chunk preview metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/briefing-papers-chunk-attach",
    fieldBookSlugs: [
      "briefing-papers-chunk-attach-command",
      "strategy-alignment-chunk-preview-command",
      "claims-firewall",
    ],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P7 — briefing papers chunk attach workflow.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-p7-upgrade",
    fieldBookSlugs: ["briefing-papers-chunk-attach-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P7 exit gate — briefing papers chunk attach metrics.",
    laneHint: "staff",
  },
  {
    routePrefix: "/admin/intelligence/field-book-promotion-execution",
    fieldBookSlugs: [
      "field-book-promotion-execution-command",
      "field-book-chunk-promotion-command",
      "strategy-migration",
      "claims-firewall",
    ],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P8 — Field Book promotion execution waves.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-p8-upgrade",
    fieldBookSlugs: ["field-book-promotion-execution-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P8 exit gate — promotion execution metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-stack-closure",
    fieldBookSlugs: [
      "phase-11-stack-closure-command",
      "field-book-promotion-execution-command",
      "strategy-migration",
    ],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P9 — stack closure checkpoint queue.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-11-p9-upgrade",
    fieldBookSlugs: ["phase-11-stack-closure-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 11 P9 exit gate — stack closure metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/kelly-prep-week",
    fieldBookSlugs: ["kelly-prep-week-command", "claims-firewall", "debate-instruction-bridge"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P2 — Kelly seven-day prep path and daily drill anchors.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-15-p2-upgrade",
    fieldBookSlugs: ["kelly-prep-week-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P2 exit gate — prep week metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/stage-safe-filter",
    fieldBookSlugs: ["stage-safe-filter-command", "claims-firewall", "debate-ready-governance"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P3 — candidate profile stage-safe filter inventory.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-15-p3-upgrade",
    fieldBookSlugs: ["stage-safe-filter-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P3 exit gate — filter surface metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/top-tier-prep",
    fieldBookSlugs: ["top-tier-prep-command", "debate-ready-governance", "kelly-prep-week-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P4 — top-tier briefings, depth, and psych promotion hub.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-15-p4-upgrade",
    fieldBookSlugs: ["top-tier-prep-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P4 exit gate — surfacing metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/evidence-honesty",
    fieldBookSlugs: ["evidence-honesty-command", "claims-firewall", "stage-safe-filter-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P5 — evidence honesty badge inventory for candidate surfaces.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-15-p5-upgrade",
    fieldBookSlugs: ["evidence-honesty-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P5 exit gate — honesty badge metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/demo-mode",
    fieldBookSlugs: ["demo-mode-command", "evidence-honesty-command", "kelly-prep-week-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P6 — purchase demo script and seeded tonight scenario.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-15-p6-upgrade",
    fieldBookSlugs: ["demo-mode-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P6 exit gate — demo script metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/ipad-polish",
    fieldBookSlugs: ["ipad-polish-command", "demo-mode-command", "debate-ready-governance"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P7 — iPad five-section bottom nav and section sheets.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-15-p7-upgrade",
    fieldBookSlugs: ["ipad-polish-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P7 exit gate — iPad polish metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/staff-backstage",
    fieldBookSlugs: ["staff-backstage-command", "ipad-polish-command", "debate-ready-governance"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P8 — staff backstage route guard inventory.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-15-p8-upgrade",
    fieldBookSlugs: ["staff-backstage-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P8 exit gate — staff backstage guard metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/cce-closure",
    fieldBookSlugs: ["cce-closure-command", "staff-backstage-command", "debate-ready-governance"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P9 — CCE closure checkpoint queue.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-15-p9-upgrade",
    fieldBookSlugs: ["cce-closure-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 15 P9 exit gate — CCE stack closure metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/rehearsal",
    fieldBookSlugs: ["session-launcher-command", "cce-closure-command", "debate-ready-governance"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P0 — SRE session launcher and run-of-show.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p0-upgrade",
    fieldBookSlugs: ["session-launcher-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P0 exit gate — session launcher metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/run-of-show",
    fieldBookSlugs: ["run-of-show-command", "session-launcher-command", "debate-ready-governance"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P1 — timed run-of-show presets for rehearsal sessions.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p1-upgrade",
    fieldBookSlugs: ["run-of-show-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P1 exit gate — run-of-show preset metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/encounters",
    fieldBookSlugs: ["encounter-scenarios-command", "run-of-show-command", "debate-ready-governance"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P2 — encounter scenario registry with ACCA bind.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p2-upgrade",
    fieldBookSlugs: ["encounter-scenarios-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P2 exit gate — encounter scenario metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/drill-queue",
    fieldBookSlugs: ["drill-queue-command", "encounter-scenarios-command", "stage-safe-filter-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P3 — sequential drill queue with stage-safe gates.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p3-upgrade",
    fieldBookSlugs: ["drill-queue-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P3 exit gate — drill queue metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/session-debrief",
    fieldBookSlugs: ["session-debrief-command", "drill-queue-command", "stage-safe-filter-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P4 — pre-stage checklist and post-session capture.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p4-upgrade",
    fieldBookSlugs: ["session-debrief-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P4 exit gate — session debrief metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/ipad-drill-player",
    fieldBookSlugs: ["ipad-drill-player-command", "drill-queue-command", "ipad-polish-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P5 — iPad drill player in candidate shell.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p5-upgrade",
    fieldBookSlugs: ["ipad-drill-player-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P5 exit gate — iPad drill player metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/rehearsal-history",
    fieldBookSlugs: ["session-memory-command", "drill-queue-command", "encounter-scenarios-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P6 — continue last drill and staff session reset.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p6-upgrade",
    fieldBookSlugs: ["session-memory-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P6 exit gate — session memory metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/rehearsal-coach",
    fieldBookSlugs: ["rehearsal-coach-command", "session-launcher-command", "drill-queue-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P7 — staff coach assign and drill pins.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p7-upgrade",
    fieldBookSlugs: ["rehearsal-coach-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P7 exit gate — staff coach metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/live-event",
    fieldBookSlugs: ["live-event-command", "run-of-show-command", "encounter-scenarios-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P8 — ACCA countdown and day-of safe run-of-show.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p8-upgrade",
    fieldBookSlugs: ["live-event-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P8 exit gate — live event mode metrics.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/sre-closure",
    fieldBookSlugs: ["sre-closure-command", "session-launcher-command", "drill-queue-command"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P9 — SRE stack closure and exit gate.",
    laneHint: "kelly",
  },
  {
    routePrefix: "/admin/intelligence/phase-16-p9-upgrade",
    fieldBookSlugs: ["sre-closure-command", "strategy-migration"],
    claimsLedgerHref: "/admin/intelligence/claims",
    promoteNote: "Phase 16 P9 exit gate — SRE closure metrics.",
    laneHint: "kelly",
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
