/**
 * Phase 5 — Intelligence debate glossary (Wikipedia-style term registry).
 * Terms cross-link to Field Book articles and intelligence routes.
 */

export type DebateGlossaryCategory =
  | "governance"
  | "debate-craft"
  | "organization"
  | "election-ops"
  | "opposition"
  | "candidate-ux";

export type DebateGlossaryTerm = {
  id: string;
  label: string;
  definition: string;
  category: DebateGlossaryCategory;
  fieldBookSlug?: string;
  intelligenceHref?: string;
  seeAlso?: string[];
};

export const DEBATE_GLOSSARY_CATEGORIES: { id: DebateGlossaryCategory; label: string }[] = [
  { id: "governance", label: "Governance & claims" },
  { id: "debate-craft", label: "Debate craft" },
  { id: "organization", label: "Organization & nav" },
  { id: "election-ops", label: "Election operations" },
  { id: "opposition", label: "Opposition research" },
  { id: "candidate-ux", label: "Candidate UX" },
];

export const DEBATE_GLOSSARY_TERMS: DebateGlossaryTerm[] = [
  {
    id: "claims-firewall",
    label: "Claims firewall",
    definition:
      "No stage line, Field Book body update, or public adaptation until the claim registers in the ledger with a classification tier staff can defend.",
    category: "governance",
    fieldBookSlug: "claims-firewall",
    intelligenceHref: "/admin/intelligence/claims",
    seeAlso: ["claims-gate", "counsel-frame"],
  },
  {
    id: "claims-gate",
    label: "Claims gate",
    definition:
      "Per-page reminder on trap lanes, SOS questions, and drill-downs — shows VERIFIED, NEEDS_REVIEW, or RESEARCH_QUESTION before Kelly rehearses the line.",
    category: "governance",
    fieldBookSlug: "claims-firewall",
    seeAlso: ["claims-firewall", "research-question"],
  },
  {
    id: "counsel-frame",
    label: "Counsel review frame",
    definition:
      "When diligence returns HIT_REQUIRES_COUNSEL, staff pauses debate adaptation until counsel initials the log — incomplete frame pivots to service, not denial.",
    category: "governance",
    fieldBookSlug: "counsel-review-frame",
    intelligenceHref: "/admin/intelligence/diligence",
    seeAlso: ["diligence-log", "five-search-order"],
  },
  {
    id: "diligence-log",
    label: "Diligence log",
    definition:
      "JSON court-search record per candidate — civil, criminal, UCC, entity, property rows with status, initials, and counsel toggle. Never speculate in prep docs.",
    category: "governance",
    fieldBookSlug: "court-diligence-protocol",
    intelligenceHref: "/admin/intelligence/diligence",
    seeAlso: ["five-search-order", "counsel-frame"],
  },
  {
    id: "five-search-order",
    label: "Five-search order",
    definition:
      "Fixed CourtConnect and SOS sequence: civil → criminal → UCC → business entity → property tax. Same order for Kelly, Hammer, and Pakko defensive diligence.",
    category: "governance",
    fieldBookSlug: "kelly-five-search-checklist",
    intelligenceHref: "/admin/intelligence/diligence",
    seeAlso: ["diligence-log", "pacer-search"],
  },
  {
    id: "research-question",
    label: "Research question",
    definition:
      "Claims tier for lines that may be asked on stage but cannot be answered with verified numbers yet — pivot to process and records request, not fabrication.",
    category: "governance",
    fieldBookSlug: "cvsgf-ledger-gap",
    seeAlso: ["claims-gate", "cvsgf"],
  },
  {
    id: "verified-tier",
    label: "VERIFIED",
    definition:
      "Ledger classification meaning staff holds a primary source anchor — act text, official record, or logged search outcome counsel approved for stage use.",
    category: "governance",
    fieldBookSlug: "claims-firewall",
    intelligenceHref: "/admin/intelligence/claims",
    seeAlso: ["claims-firewall", "act-proof"],
  },
  {
    id: "speak-order",
    label: "Speak order",
    definition:
      "Three-way debate sequence: Kelly first layer, Hammer second, Pakko third — each SOS question drill-down ships speakOrderDrills for all three layers.",
    category: "debate-craft",
    fieldBookSlug: "three-way-speak-order",
    intelligenceHref: "/admin/intelligence/sos-debate-questions",
    seeAlso: ["sos-question-bank", "debate-command"],
  },
  {
    id: "trap-lane",
    label: "Trap lane",
    definition:
      "Offensive setup where Kelly invites Hammer onto verified legislative ground — six lanes with step coverage, rebuttal scripts, and claims gates per lane.",
    category: "debate-craft",
    fieldBookSlug: "claims-firewall",
    intelligenceHref: "/admin/intelligence/trap-lanes",
    seeAlso: ["act-proof", "five-layer-standard"],
  },
  {
    id: "act-proof",
    label: "Act proof",
    definition:
      "Bill drill-down pairing enrolled act text, Arkleg link, and county example — primary offensive anchor when personal contrast is counsel-gated.",
    category: "debate-craft",
    fieldBookSlug: "kim-hammer-legislative-record",
    intelligenceHref: "/admin/intelligence/kim-hammer",
    seeAlso: ["trap-lane", "film-room"],
  },
  {
    id: "five-layer-standard",
    label: "Five-layer standard",
    definition:
      "Phase 3 depth bar: orientation → narrative → evidence table → operator scripts → gates. Required on trap lanes, SOS bank, and command surfaces.",
    category: "debate-craft",
    fieldBookSlug: "five-block-drill-template",
    intelligenceHref: "/admin/intelligence/phase-3-upgrade",
    seeAlso: ["operator-guide", "debate-briefing"],
  },
  {
    id: "operator-guide",
    label: "Operator guide",
    definition:
      "Five-block drill template on drill-down pages: why it matters, when to use, first read, rehearse, claims gate — V4OperatorGuide component.",
    category: "debate-craft",
    fieldBookSlug: "five-block-drill-template",
    seeAlso: ["five-layer-standard", "plain-language-prep"],
  },
  {
    id: "debate-briefing",
    label: "Debate briefing",
    definition:
      "Quick-read panel on SOS questions: why this answer works, alternative openers/closers, Hammer research hooks — philosophy library for cross-cutting frames.",
    category: "debate-craft",
    intelligenceHref: "/admin/intelligence/debate-briefings",
    seeAlso: ["sos-question-bank", "speak-order"],
  },
  {
    id: "sos-question-bank",
    label: "SOS question bank",
    definition:
      "35 expected moderator questions with 30-second direct answers, speak-order drills, and comprehensive scripts — indexed by topic and readiness score.",
    category: "debate-craft",
    fieldBookSlug: "three-way-speak-order",
    intelligenceHref: "/admin/intelligence/sos-debate-questions",
    seeAlso: ["speak-order", "debate-briefing"],
  },
  {
    id: "encounter-depth",
    label: "Encounter depth",
    definition:
      "Plain-language whatToExpectPlain block on prep sections — tells Kelly what Hammer likely says and how to pivot without jargon.",
    category: "debate-craft",
    fieldBookSlug: "plain-language-prep-sections",
    intelligenceHref: "/admin/intelligence/kim-hammer/debate-prep",
    seeAlso: ["plain-language-prep", "psychology-manual"],
  },
  {
    id: "plain-language-prep",
    label: "Plain language prep",
    definition:
      "Section-specific sixth-grade English for all 28 debate prep sections — every jargon term links to this glossary or a Field Book article on first use.",
    category: "debate-craft",
    fieldBookSlug: "plain-language-prep-sections",
    seeAlso: ["encounter-depth", "debate-glossary"],
  },
  {
    id: "canon-strip",
    label: "Canon strip",
    definition:
      "Gold FieldBookCanonPanel on bound intelligence routes — shows encyclopedia articles and strategy manual hints governing that page.",
    category: "organization",
    fieldBookSlug: "strategy-migration",
    intelligenceHref: "/admin/intelligence/field-book/canon",
    seeAlso: ["canon-binding", "field-book"],
  },
  {
    id: "canon-binding",
    label: "Canon binding",
    definition:
      "Route prefix mapped to Field Book slugs and optional claims ledger href — Phase 4 registry; Phase 5 extends to all intelligence hubs.",
    category: "organization",
    fieldBookSlug: "strategy-migration",
    intelligenceHref: "/admin/intelligence/field-book/canon",
    seeAlso: ["canon-strip", "strategy-migration"],
  },
  {
    id: "three-lane-nav",
    label: "Three-lane nav",
    definition:
      "Kelly (emerald), Clerks (sky), Staff (violet), Phase A (rose) — color-coded sidebar and subnav replacing flat debate-week lists.",
    category: "organization",
    fieldBookSlug: "three-lane-nav",
    seeAlso: ["nav-profile", "teal-release-chip"],
  },
  {
    id: "nav-profile",
    label: "Nav profile",
    definition:
      "NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE reshapes lane visibility: CANDIDATE hides staff lane; CLERK_WEEK elevates county path; STAFF shows full audit routes.",
    category: "organization",
    fieldBookSlug: "role-based-nav-profiles",
    seeAlso: ["three-lane-nav", "ipad-candidate-mode"],
  },
  {
    id: "teal-release-chip",
    label: "Teal release chip",
    definition:
      "New-link highlight on nav hrefs in the current deploy batch until visited once — tracked in navLinkReleaseManifest per phase push.",
    category: "organization",
    fieldBookSlug: "three-lane-nav",
    seeAlso: ["nav-profile"],
  },
  {
    id: "strategy-migration",
    label: "Strategy migration",
    definition:
      "Bridge from intelligence routes to Kelly SOS manual pathKeys and Field Book slugs — preview chunks at strategy-alignment before canon promotion.",
    category: "organization",
    fieldBookSlug: "strategy-migration",
    intelligenceHref: "/admin/intelligence/strategy-alignment",
    seeAlso: ["canon-binding", "field-book"],
  },
  {
    id: "field-book",
    label: "The Field Book",
    definition:
      "Campaign encyclopedia with Wikipedia-style [[slug]] cross-links — four upgrade phases (A–D) plus debate glossary index.",
    category: "organization",
    fieldBookSlug: "debate-glossary",
    intelligenceHref: "/admin/intelligence/field-book",
    seeAlso: ["canon-strip", "debate-glossary"],
  },
  {
    id: "debate-glossary",
    label: "Debate glossary",
    definition:
      "Alphabetical term registry for intelligence workbench jargon — links every prep section and drill-down to plain-English definitions.",
    category: "organization",
    fieldBookSlug: "debate-glossary",
    intelligenceHref: "/admin/intelligence/field-book/glossary",
    seeAlso: ["plain-language-prep", "field-book"],
  },
  {
    id: "cvsgf",
    label: "CVSGF",
    definition:
      "County Voting System Grant Fund — state remittance program; county totals remain research-question-only until ledger ingested.",
    category: "election-ops",
    fieldBookSlug: "cvsgf-ledger-gap",
    intelligenceHref: "/admin/intelligence/election-funding",
    seeAlso: ["research-question", "election-funding"],
  },
  {
    id: "election-funding",
    label: "Election funding depth",
    definition:
      "Clerk-path drill-downs on HAVA, CVSGF, and county equipment budgets — statute verified, numeric totals gated.",
    category: "election-ops",
    fieldBookSlug: "cvsgf-ledger-gap",
    intelligenceHref: "/admin/intelligence/election-funding",
    seeAlso: ["cvsgf", "vvsg"],
  },
  {
    id: "vvsg",
    label: "VVSG",
    definition:
      "Voluntary Voting System Guidelines — federal equipment standards referenced in clerk-week and equipment intelligence surfaces.",
    category: "election-ops",
    intelligenceHref: "/admin/intelligence/election-equipment-vvsg",
    seeAlso: ["election-funding", "clerk-week"],
  },
  {
    id: "clerk-week",
    label: "County clerk week",
    definition:
      "Seven-day clerk audience path with ACCA panel, daily essays, and election funding — Pakko elevation policy: do not introduce unless asked.",
    category: "election-ops",
    intelligenceHref: "/admin/intelligence/county-clerk-week",
    seeAlso: ["acca-panel", "nav-profile"],
  },
  {
    id: "acca-panel",
    label: "ACCA panel",
    definition:
      "Association of Arkansas Counties summer conference SOS candidates panel — clerk-room vocabulary, 120-minute format, Mountain View Jun 11.",
    category: "election-ops",
    intelligenceHref: "/admin/intelligence/county-clerk-week/acca-summer-conference",
    seeAlso: ["clerk-week", "speak-order"],
  },
  {
    id: "arkleg",
    label: "Arkleg",
    definition:
      "Arkansas Legislature bill index — every Hammer bill drill-down links to official act-proof URL when enrolled.",
    category: "opposition",
    fieldBookSlug: "kim-hammer-legislative-record",
    intelligenceHref: "/admin/intelligence/kim-hammer",
    seeAlso: ["act-proof", "legislative-record"],
  },
  {
    id: "legislative-record",
    label: "Legislative record",
    definition:
      "Verified votes and sponsorship as primary Hammer offensive surface when court diligence is NOT_SEARCHED — no personal speculation.",
    category: "opposition",
    fieldBookSlug: "kim-hammer-legislative-record",
    intelligenceHref: "/admin/intelligence/kim-hammer",
    seeAlso: ["arkleg", "hammer-diligence"],
  },
  {
    id: "hammer-diligence",
    label: "Hammer diligence",
    definition:
      "Offensive five-search checklist on Kim Hammer — same counsel frame as Kelly; court hits gate personal contrast modules.",
    category: "opposition",
    fieldBookSlug: "hammer-diligence-checklist",
    intelligenceHref: "/admin/intelligence/diligence/kim-hammer",
    seeAlso: ["five-search-order", "legislative-record"],
  },
  {
    id: "pakko-contrast-gate",
    label: "Pakko contrast gate",
    definition:
      "Third-candidate personal contrast locked until PACKO-01 finance and PACKO-02 quotes reach PARTIAL — rehearsal modules live when gate open.",
    category: "opposition",
    fieldBookSlug: "pakko-contrast-gate",
    intelligenceHref: "/admin/intelligence/opponents/michael-packo",
    seeAlso: ["pakko-command-center", "speak-order"],
  },
  {
    id: "pakko-command-center",
    label: "Pakko command center",
    definition:
      "Hammer-parity hub for Michael Pakko — dossier, quotes, finance, contrast vs Kelly, diligence, and debate coaching scaffolds.",
    category: "opposition",
    fieldBookSlug: "pakko-command-center",
    intelligenceHref: "/admin/intelligence/opponents/michael-packo",
    seeAlso: ["pakko-contrast-gate", "three-way-debate"],
  },
  {
    id: "film-room",
    label: "Film room",
    definition:
      "Committee clip inventory per focus bill — NON_PUBLISHABLE until VERIFIED in claims ledger; links from trap lanes and Hammer prep.",
    category: "opposition",
    fieldBookSlug: "film-room-mvp",
    intelligenceHref: "/admin/intelligence/film-room",
    seeAlso: ["act-proof", "claims-gate"],
  },
  {
    id: "opposition-strategy",
    label: "Opposition strategy layer",
    definition:
      "Unified offense command: 2021 integrity package, 2025 petition cluster, trap lane map, and Kelly offensive moves wired to live readiness.",
    category: "opposition",
    intelligenceHref: "/admin/intelligence/opposition-strategy",
    seeAlso: ["trap-lane", "offensive-moves"],
  },
  {
    id: "offensive-moves",
    label: "Offensive moves",
    definition:
      "Kelly respond · rebut · lead framework — six moves pairing trap lanes with Hammer legislative anchors and Pakko elevation policy.",
    category: "opposition",
    intelligenceHref: "/admin/intelligence/kelly-debate-coaching",
    seeAlso: ["opposition-strategy", "trap-lane"],
  },
  {
    id: "psychology-manual",
    label: "Psychology manual",
    definition:
      "Debate psychology training sections — body language, pivot frames, and stress drills cross-linked from prep sections and glossary.",
    category: "candidate-ux",
    intelligenceHref: "/admin/intelligence/debate-prep/psychology-manual",
    seeAlso: ["encounter-depth", "debate-night-cheat-sheet"],
  },
  {
    id: "debate-night-cheat-sheet",
    label: "Debate-night cheat sheet",
    definition:
      "One-page printable: speak order, three-way pivots, incomplete diligence frames, top six trap setups — live from debate-command.",
    category: "candidate-ux",
    fieldBookSlug: "debate-night-cheat-sheet",
    intelligenceHref: "/admin/intelligence/debate-command",
    seeAlso: ["speak-order", "psychology-manual"],
  },
  {
    id: "ipad-candidate-mode",
    label: "iPad candidate mode",
    definition:
      "NEXT_PUBLIC_CANDIDATE_IPAD_MODE — touch targets, bottom nav, Kelly alignment profile in More menu only; staff surfaces gated.",
    category: "candidate-ux",
    fieldBookSlug: "ipad-candidate-ux",
    seeAlso: ["nav-profile", "debate-night-cheat-sheet"],
  },
  {
    id: "supreme-workbench",
    label: "Supreme workbench",
    definition:
      "Unified readiness command surface — eight dimensions, operator sequences T-24h through spin room, links to Phase A checklist first.",
    category: "candidate-ux",
    intelligenceHref: "/admin/intelligence/supreme-workbench",
    seeAlso: ["debate-command", "five-layer-standard"],
  },
  {
    id: "pacer-search",
    label: "PACER search",
    definition:
      "Optional federal court search when civil hits suggest interstate litigation — counsel only, documented in diligence notes, not a sixth required search.",
    category: "governance",
    fieldBookSlug: "pacer-search",
    seeAlso: ["five-search-order", "counsel-frame"],
  },
];

export const FIELD_BOOK_GLOSSARY_HREF = "/admin/intelligence/field-book/glossary";

export function getDebateGlossaryTerm(id: string): DebateGlossaryTerm | undefined {
  return DEBATE_GLOSSARY_TERMS.find((t) => t.id === id);
}

export function getDebateGlossaryTermsForCategory(category: DebateGlossaryCategory): DebateGlossaryTerm[] {
  return DEBATE_GLOSSARY_TERMS.filter((t) => t.category === category);
}

export function searchDebateGlossaryTerms(query: string): DebateGlossaryTerm[] {
  const q = query.toLowerCase().trim();
  if (!q) return DEBATE_GLOSSARY_TERMS;
  return DEBATE_GLOSSARY_TERMS.filter(
    (t) =>
      t.label.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q),
  );
}
