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
    fieldBookSlugs: ["strategy-migration", "three-lane-nav", "strategy-alignment-chunk-preview-command"],
    promoteNote: "Live alignment reader — primary surface for manual chunk preview before Field Book promotion.",
  },
  {
    intelligenceHref: "/admin/intelligence/field-book/canon",
    label: "Canon loop hub",
    strategyPathKeys: ["build-audit"],
    fieldBookSlugs: ["strategy-migration", "three-lane-nav", "role-based-nav-profiles", "field-book-promotion-execution-command"],
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
  {
    intelligenceHref: "/admin/intelligence/phase-8-upgrade",
    label: "Phase 8 dossier research ACCA closure",
    strategyPathKeys: ["build-audit", "meta"],
    fieldBookSlugs: ["dossier-research-acca-closure", "dossier-diligence-closure", "acca-summer-conference-2026"],
    promoteNote: "Phase 8 exit — research corpus, ACCA panel runbook, KH wave 3.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-9-upgrade",
    label: "Phase 9 debate instruction bridge",
    strategyPathKeys: ["build-audit", "framework"],
    fieldBookSlugs: ["debate-instruction-bridge", "dossier-research-acca-closure", "debate-ready-governance"],
    promoteNote: "Phase 9 exit — dossier depth + debate spine integration, coaching runbook, KH wave 4.",
  },
  {
    intelligenceHref: "/admin/intelligence/strategy-philosophy-hub",
    label: "Phase 10 strategy & philosophy command",
    strategyPathKeys: ["framework", "executive-summary", "build-audit"],
    fieldBookSlugs: ["strategy-philosophy-command", "debate-glossary", "strategy-migration"],
    promoteNote: "Phase 10 exit — unified strategy/philosophy inventory, enriched graph, manual crosswalk.",
  },
  {
    intelligenceHref: "/admin/intelligence/debate-briefings",
    label: "Debate political philosophy briefings",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["debate-glossary", "strategy-philosophy-command"],
    promoteNote: "Eight handling briefings — agree-then-contrast, author/administrator, clerk partnership, etc.",
  },
  {
    intelligenceHref: "/admin/intelligence/strategic-target-pathway",
    label: "Strategic target pathway (NSI-7)",
    strategyPathKeys: ["lane", "executive-summary"],
    fieldBookSlugs: ["strategy-migration"],
    promoteNote: "Victory math, registration goals, county briefings rollup.",
  },
  {
    intelligenceHref: "/admin/intelligence/campaign-intelligence-graph",
    label: "Campaign intelligence graph (NSI-4)",
    strategyPathKeys: ["build-audit", "framework"],
    fieldBookSlugs: ["strategy-philosophy-command"],
    promoteNote: "Unified entity graph — bills, narratives, doctrines, philosophy nodes.",
  },
  {
    intelligenceHref: "/admin/intelligence/scenario-simulation",
    label: "Scenario simulation",
    strategyPathKeys: ["framework", "programs/kpis"],
    fieldBookSlugs: ["strategy-migration"],
    promoteNote: "Strategic scenario modeling for debate and field decisions.",
  },
  {
    intelligenceHref: "/admin/intelligence/campaign-system-manual",
    label: "Campaign system manual (Phase 11 P0)",
    strategyPathKeys: ["build-audit", "framework", "executive-summary"],
    fieldBookSlugs: ["campaign-system-manual-command", "strategy-migration", "strategy-philosophy-command"],
    promoteNote: "252 operational docs surfaced in intelligence — category guides before Field Book chunk promotion.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-upgrade",
    label: "Phase 11 campaign system surfacing",
    strategyPathKeys: ["build-audit", "meta"],
    fieldBookSlugs: ["campaign-system-manual-command", "strategy-migration"],
    promoteNote: "Phase 11 P0 exit — inventory, reader, priority tomes, staff lane nav batch.",
  },
  {
    intelligenceHref: "/admin/intelligence/kelly-strategic-plan",
    label: "Kelly SOS strategic plan (Phase 11 P1)",
    strategyPathKeys: ["framework", "executive-summary", "build-audit", "lane"],
    fieldBookSlugs: ["kelly-strategic-plan-command", "strategy-philosophy-command", "strategy-migration"],
    promoteNote: "22-chapter Kelly manual in intelligence tree with P1 depth on every chapter.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-p1-upgrade",
    label: "Phase 11 P1 Kelly strategic plan command",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["kelly-strategic-plan-command", "strategy-migration"],
    promoteNote: "Phase 11 P1 exit — Kelly manual intelligence reader + chapter overlays.",
  },
  {
    intelligenceHref: "/admin/intelligence/movement-philosophy",
    label: "Movement philosophy corpus (Phase 11 P2)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["movement-philosophy-command", "strategy-philosophy-command", "strategy-migration"],
    promoteNote: "docs/philosophy + VOL-CORE-1 — public tone anchor before debate and volunteer copy.",
  },
  {
    intelligenceHref: "/admin/intelligence/staff-strategy-command",
    label: "Staff strategy command (Phase 11 P2)",
    strategyPathKeys: ["framework", "programs/comms-media", "lane"],
    fieldBookSlugs: ["staff-strategy-command", "strategy-migration", "campaign-system-manual-command"],
    promoteNote: "Morning brief, briefing papers, writing toolbox, NSI pathway/graph/simulation operator hub.",
  },
  {
    intelligenceHref: "/admin/intelligence/morning-brief",
    label: "Morning intelligence brief (NSI-7)",
    strategyPathKeys: ["executive-summary", "framework"],
    fieldBookSlugs: ["staff-strategy-command", "strategy-migration"],
    promoteNote: "Daily leadership composition — pair WORKBENCH_MORNING_BRIEF manual with brain coordinator.",
  },
  {
    intelligenceHref: "/admin/intelligence/briefing-papers",
    label: "Briefing papers",
    strategyPathKeys: ["programs/comms-media", "framework"],
    fieldBookSlugs: ["staff-strategy-command", "strategy-migration", "briefing-papers-chunk-attach-command"],
    promoteNote: "Staff-authored strategic depth — P7 chunk attach workflow before Field Book promotion.",
  },
  {
    intelligenceHref: "/admin/intelligence/writing-toolbox",
    label: "Writing toolbox",
    strategyPathKeys: ["programs/comms-media", "meta"],
    fieldBookSlugs: ["staff-strategy-command", "strategy-migration"],
    promoteNote: "Governed writing surfaces — movement philosophy tone + claims firewall.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-p2-upgrade",
    label: "Phase 11 P2 movement philosophy + staff strategy",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["movement-philosophy-command", "staff-strategy-command", "strategy-migration"],
    promoteNote: "Phase 11 P2 exit — philosophy corpus surfacing + staff lane migration bridge closure.",
  },
  {
    intelligenceHref: "/admin/intelligence/strategy-doctrine",
    label: "Strategy doctrine JSON (Phase 11 P3)",
    strategyPathKeys: ["framework", "build-audit", "meta"],
    fieldBookSlugs: ["strategy-doctrine-command", "strategy-philosophy-command", "strategy-migration"],
    promoteNote: "Nine SDI-1 JSON artifacts — registry, Steve doctrine, field playbooks, GOTV model.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-p3-upgrade",
    label: "Phase 11 P3 strategy doctrine command",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["strategy-doctrine-command", "strategy-migration"],
    promoteNote: "Phase 11 P3 exit — doctrine JSON surfacing + alignment crosswalk.",
  },
  {
    intelligenceHref: "/admin/intelligence/philosophy-graph-claims-review",
    label: "Philosophy graph claims review (Phase 11 P4)",
    strategyPathKeys: ["framework", "build-audit", "meta"],
    fieldBookSlugs: ["philosophy-graph-claims-command", "strategy-philosophy-command", "claims-firewall"],
    promoteNote: "Eight NSI-4 philosophy nodes — claim ledger binding + P4 review overlays.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-p4-upgrade",
    label: "Phase 11 P4 philosophy graph claims",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["philosophy-graph-claims-command", "strategy-migration"],
    promoteNote: "Phase 11 P4 exit — philosophy graph claims workflow metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/field-book-chunk-promotion",
    label: "Field Book chunk promotion (Phase 11 P5)",
    strategyPathKeys: ["framework", "build-audit", "programs/comms-media", "meta"],
    fieldBookSlugs: ["field-book-chunk-promotion-command", "strategy-migration", "claims-firewall"],
    promoteNote: "~2,795 strategy manual chunks — eleven promotion batches with P5 operator overlays.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-p5-upgrade",
    label: "Phase 11 P5 Field Book chunk promotion",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["field-book-chunk-promotion-command", "strategy-migration"],
    promoteNote: "Phase 11 P5 exit — chunk promotion inventory and gate metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/strategy-alignment-chunk-preview",
    label: "Strategy alignment chunk preview (Phase 11 P6)",
    strategyPathKeys: ["framework", "executive-summary", "programs/comms-media", "meta"],
    fieldBookSlugs: [
      "strategy-alignment-chunk-preview-command",
      "field-book-chunk-promotion-command",
      "claims-firewall",
    ],
    promoteNote: "Eight SDI-1 preview lanes — doctrine crosswalk + chunk filters before Field Book promotion.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-p6-upgrade",
    label: "Phase 11 P6 strategy alignment chunk preview",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["strategy-alignment-chunk-preview-command", "strategy-migration"],
    promoteNote: "Phase 11 P6 exit — alignment chunk preview lane metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/briefing-papers-chunk-attach",
    label: "Briefing papers chunk attach (Phase 11 P7)",
    strategyPathKeys: ["programs/comms-media", "framework", "build-audit", "meta"],
    fieldBookSlugs: [
      "briefing-papers-chunk-attach-command",
      "strategy-alignment-chunk-preview-command",
      "claims-firewall",
    ],
    promoteNote: "Eight attach lanes — merge P6 chunk previews into briefing paper deep sections.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-p7-upgrade",
    label: "Phase 11 P7 briefing papers chunk attach",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["briefing-papers-chunk-attach-command", "strategy-migration"],
    promoteNote: "Phase 11 P7 exit — briefing papers chunk attach metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/field-book-promotion-execution",
    label: "Field Book promotion execution (Phase 11 P8)",
    strategyPathKeys: ["framework", "build-audit", "meta"],
    fieldBookSlugs: [
      "field-book-promotion-execution-command",
      "field-book-chunk-promotion-command",
      "strategy-migration",
      "claims-firewall",
    ],
    promoteNote: "Eight execution waves — complete P5→P8 canon pipeline with claims-gated Field Book merge.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-p8-upgrade",
    label: "Phase 11 P8 Field Book promotion execution",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["field-book-promotion-execution-command", "strategy-migration"],
    promoteNote: "Phase 11 P8 exit — promotion execution wave metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-stack-closure",
    label: "Phase 11 stack closure (P9)",
    strategyPathKeys: ["framework", "build-audit", "meta"],
    fieldBookSlugs: [
      "phase-11-stack-closure-command",
      "field-book-promotion-execution-command",
      "strategy-migration",
    ],
    promoteNote: "Nine P0–P8 checkpoints aggregated — Phase 11 exit gate for strategy-manual canon workflow.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-11-p9-upgrade",
    label: "Phase 11 P9 stack closure",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["phase-11-stack-closure-command", "strategy-migration"],
    promoteNote: "Phase 11 P9 exit — stack closure and sub-pass aggregation metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/kelly-prep-week",
    label: "Kelly prep week (Phase 15 P2)",
    strategyPathKeys: ["framework", "executive-summary", "lane"],
    fieldBookSlugs: ["kelly-prep-week-command", "claims-firewall", "debate-instruction-bridge"],
    promoteNote: "Seven-day orchestrated candidate prep — philosophy through simulation.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-15-p2-upgrade",
    label: "Phase 15 P2 Kelly prep week",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["kelly-prep-week-command", "strategy-migration"],
    promoteNote: "Phase 15 P2 exit — prep week day metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/stage-safe-filter",
    label: "Stage-safe filter (Phase 15 P3)",
    strategyPathKeys: ["framework", "programs/compliance"],
    fieldBookSlugs: ["stage-safe-filter-command", "claims-firewall", "debate-ready-governance"],
    promoteNote: "Candidate profile claims gating on trap lanes, SOS bank, and coaching scripts.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-15-p3-upgrade",
    label: "Phase 15 P3 stage-safe filter",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["stage-safe-filter-command", "strategy-migration"],
    promoteNote: "Phase 15 P3 exit — stage-safe filter surface metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/top-tier-prep",
    label: "Top-tier prep (Phase 15 P4)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["top-tier-prep-command", "debate-ready-governance", "kelly-prep-week-command"],
    promoteNote: "Promoted briefings, depth, and psychology for candidate command home.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-15-p4-upgrade",
    label: "Phase 15 P4 top-tier surfacing",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["top-tier-prep-command", "strategy-migration"],
    promoteNote: "Phase 15 P4 exit — top-tier promotion metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/evidence-honesty",
    label: "Evidence honesty (Phase 15 P5)",
    strategyPathKeys: ["framework", "programs/compliance"],
    fieldBookSlugs: ["evidence-honesty-command", "claims-firewall", "stage-safe-filter-command"],
    promoteNote: "Unified evidence tier badges on film room, briefings, opposition, and rehearse surfaces.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-15-p5-upgrade",
    label: "Phase 15 P5 evidence honesty",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["evidence-honesty-command", "strategy-migration"],
    promoteNote: "Phase 15 P5 exit — honesty badge surface metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/demo-mode",
    label: "Demo mode (Phase 15 P6)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["demo-mode-command", "evidence-honesty-command", "kelly-prep-week-command"],
    promoteNote: "Purchase-ready 15-minute walkthrough with seeded ACCA tonight scenario.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-15-p6-upgrade",
    label: "Phase 15 P6 demo mode",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["demo-mode-command", "strategy-migration"],
    promoteNote: "Phase 15 P6 exit — demo script step metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/ipad-polish",
    label: "iPad polish (Phase 15 P7)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["ipad-polish-command", "demo-mode-command", "debate-ready-governance"],
    promoteNote: "Five CCE section bottom nav for candidate iPad stage-side deploy.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-15-p7-upgrade",
    label: "Phase 15 P7 iPad polish",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["ipad-polish-command", "strategy-migration"],
    promoteNote: "Phase 15 P7 exit — iPad section tab metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/staff-backstage",
    label: "Staff backstage (Phase 15 P8)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["staff-backstage-command", "ipad-polish-command", "debate-ready-governance"],
    promoteNote: "Route-level STAFF guards on builder and operations surfaces.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-15-p8-upgrade",
    label: "Phase 15 P8 staff backstage",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["staff-backstage-command", "strategy-migration"],
    promoteNote: "Phase 15 P8 exit — staff backstage guard metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/cce-closure",
    label: "CCE closure (Phase 15 P9)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["cce-closure-command", "staff-backstage-command", "debate-ready-governance"],
    promoteNote: "Master CCE closure — eight P0+P1–P8 checkpoints at 90% bar.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-15-p9-upgrade",
    label: "Phase 15 P9 CCE closure",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["cce-closure-command", "strategy-migration"],
    promoteNote: "Phase 15 P9 exit — CCE stack closure metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/rehearsal",
    label: "Session launcher (Phase 16 P0)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["session-launcher-command", "cce-closure-command", "debate-ready-governance"],
    promoteNote: "SRE entry — four encounters and timed run-of-show into existing prep depth.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p0-upgrade",
    label: "Phase 16 P0 session launcher",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["session-launcher-command", "strategy-migration"],
    promoteNote: "Phase 16 P0 exit — encounter and run-of-show metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/run-of-show",
    label: "Run-of-show (Phase 16 P1)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["run-of-show-command", "session-launcher-command", "debate-ready-governance"],
    promoteNote: "Timed presets 15/30/45/60 min — step lists into existing prep depth.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p1-upgrade",
    label: "Phase 16 P1 run-of-show",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["run-of-show-command", "strategy-migration"],
    promoteNote: "Phase 16 P1 exit — preset and minutes alignment metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/encounters",
    label: "Encounter scenarios (Phase 16 P2)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["encounter-scenarios-command", "run-of-show-command", "debate-ready-governance"],
    promoteNote: "Four encounter scenarios — ACCA bind, clerk 1:1, three-way debate, purchase demo.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p2-upgrade",
    label: "Phase 16 P2 encounter scenarios",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["encounter-scenarios-command", "strategy-migration"],
    promoteNote: "Phase 16 P2 exit — scenario registry and ACCA bind metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/drill-queue",
    label: "Drill queue (Phase 16 P3)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["drill-queue-command", "encounter-scenarios-command", "stage-safe-filter-command"],
    promoteNote: "Sequential SOS + trap cards with stage-safe enforcement.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p3-upgrade",
    label: "Phase 16 P3 drill queue",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["drill-queue-command", "strategy-migration"],
    promoteNote: "Phase 16 P3 exit — drill queue and card metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/session-debrief",
    label: "Session debrief (Phase 16 P4)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["session-debrief-command", "drill-queue-command", "stage-safe-filter-command"],
    promoteNote: "Pre-stage checklist and post-session capture for staff action queue review.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p4-upgrade",
    label: "Phase 16 P4 session debrief",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["session-debrief-command", "strategy-migration"],
    promoteNote: "Phase 16 P4 exit — checklist and capture API metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/ipad-drill-player",
    label: "iPad drill player (Phase 16 P5)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["ipad-drill-player-command", "drill-queue-command", "ipad-polish-command"],
    promoteNote: "Full-screen iPad drill stepper — Exit · Prev · Next · Timer in candidate shell.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p5-upgrade",
    label: "Phase 16 P5 iPad drill player",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["ipad-drill-player-command", "strategy-migration"],
    promoteNote: "Phase 16 P5 exit — iPad shell drill nav and control metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/rehearsal-history",
    label: "Rehearsal history (Phase 16 P6)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["session-memory-command", "drill-queue-command", "encounter-scenarios-command"],
    promoteNote: "Continue last drill — session memory with history and staff reset.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p6-upgrade",
    label: "Phase 16 P6 session memory",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["session-memory-command", "strategy-migration"],
    promoteNote: "Phase 16 P6 exit — active session fields and persistence metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/rehearsal-coach",
    label: "Rehearsal coach (Phase 16 P7)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["rehearsal-coach-command", "session-launcher-command", "drill-queue-command"],
    promoteNote: "STAFF coach overlay — assign scenario and pin must-run drills for Kelly.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p7-upgrade",
    label: "Phase 16 P7 staff coach",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["rehearsal-coach-command", "strategy-migration"],
    promoteNote: "Phase 16 P7 exit — coach overlay fields and route guard metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/live-event",
    label: "Live event mode (Phase 16 P8)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["live-event-command", "run-of-show-command", "encounter-scenarios-command"],
    promoteNote: "ACCA countdown and shortest stage-safe day-of run-of-show for clerk week.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p8-upgrade",
    label: "Phase 16 P8 live event",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["live-event-command", "strategy-migration"],
    promoteNote: "Phase 16 P8 exit — live event fields and day-of plan metrics.",
  },
  {
    intelligenceHref: "/admin/intelligence/sre-closure",
    label: "SRE stack closure (Phase 16 P9)",
    strategyPathKeys: ["framework", "executive-summary"],
    fieldBookSlugs: ["sre-closure-command", "session-launcher-command", "drill-queue-command"],
    promoteNote: "Master SRE closure — nine P0–P8 checkpoints and stack exit gate.",
  },
  {
    intelligenceHref: "/admin/intelligence/phase-16-p9-upgrade",
    label: "Phase 16 P9 SRE closure",
    strategyPathKeys: ["framework", "meta"],
    fieldBookSlugs: ["sre-closure-command", "strategy-migration"],
    promoteNote: "Phase 16 P9 exit — SRE stack aggregation and nav cap metrics.",
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
