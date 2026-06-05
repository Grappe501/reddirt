/**
 * The Field Book — campaign encyclopedia registry.
 * Four upgrade phases (A–D) each own a section; articles cross-link Wikipedia-style.
 */

export type FieldBookPhaseId = "phase-a" | "phase-b" | "phase-c" | "phase-d";

export type FieldBookPhase = {
  id: FieldBookPhaseId;
  label: string;
  shortLabel: string;
  tagline: string;
  colorClass: string;
  borderClass: string;
  href: string;
};

export type FieldBookArticle = {
  slug: string;
  title: string;
  phaseId: FieldBookPhaseId;
  category: string;
  summary: string;
  /** Paragraphs — may contain [[slug]] or [[slug|label]] cross-links */
  body: string[];
  sidebarFacts: { label: string; value: string }[];
  seeAlso: string[];
  relatedRoutes: { href: string; label: string }[];
  trivia?: string[];
};

export const FIELD_BOOK_TITLE = "The Field Book";
export const FIELD_BOOK_TAGLINE =
  "The living encyclopedia of the Red Dirt campaign — philosophy, strategy, opposition, and operator craft.";

export const FIELD_BOOK_PHASES: FieldBookPhase[] = [
  {
    id: "phase-a",
    label: "Phase A — Safety & diligence",
    shortLabel: "Phase A",
    tagline: "Court searches, claims firewall, contrast gates — nothing hits stage unverified.",
    colorClass: "text-rose-950",
    borderClass: "border-rose-300 bg-rose-50/40",
    href: "/admin/intelligence/field-book/phase/phase-a",
  },
  {
    id: "phase-b",
    label: "Phase B — Candidate UX",
    shortLabel: "Phase B",
    tagline: "Operator guides, plain language, debate-night cheat sheets — prep for dummies done right.",
    colorClass: "text-sky-950",
    borderClass: "border-sky-300 bg-sky-50/40",
    href: "/admin/intelligence/field-book/phase/phase-b",
  },
  {
    id: "phase-c",
    label: "Phase C — Staff depth & parity",
    shortLabel: "Phase C",
    tagline: "Hammer module promotion, Pakko command center, film room MVP, ledger gaps closed.",
    colorClass: "text-violet-950",
    borderClass: "border-violet-300 bg-violet-50/40",
    href: "/admin/intelligence/field-book/phase/phase-c",
  },
  {
    id: "phase-d",
    label: "Phase D — Organization",
    shortLabel: "Phase D",
    tagline: "Three-lane nav, role profiles, strategy migration into admin + Field Book canon.",
    colorClass: "text-emerald-950",
    borderClass: "border-emerald-300 bg-emerald-50/40",
    href: "/admin/intelligence/field-book/phase/phase-d",
  },
];

export const FIELD_BOOK_ARTICLES: FieldBookArticle[] = [
  {
    slug: "court-diligence-protocol",
    title: "Court diligence protocol",
    phaseId: "phase-a",
    category: "Governance",
    summary:
      "The five-search order every candidate and opponent must complete before debate — civil, criminal, UCC, business entity, property tax.",
    body: [
      "Before any debate-stage line references personal or financial records, staff completes the [[kelly-five-search-checklist]] in order. Outcomes are logged — never speculated.",
      "The protocol mirrors across [[hammer-diligence-checklist]] and [[pakko-diligence-checklist]] so offensive and defensive diligence use the same counsel frame.",
      "Optional [[pacer-search]] applies when civil hits suggest federal litigation — counsel only, never candidate-facing without review.",
      "Incomplete searches trigger the incomplete frame: pivot to service and SOS implementation, not denial or attack.",
    ],
    sidebarFacts: [
      { label: "Search order", value: "Civil → Criminal → UCC → Entity → Property" },
      { label: "Counsel gate", value: "Required on any HIT_REQUIRES_COUNSEL" },
      { label: "Log location", value: "data/intelligence/*-court-diligence-log.json" },
    ],
    seeAlso: ["kelly-five-search-checklist", "counsel-review-frame", "claims-firewall"],
    relatedRoutes: [
      { href: "/admin/intelligence/diligence", label: "Diligence hub" },
      { href: "/admin/intelligence/claims", label: "Verify claims" },
    ],
    trivia: [
      "Whisper campaigns on business filings spike in the final two weeks — entity search is not optional.",
    ],
  },
  {
    slug: "kelly-five-search-checklist",
    title: "Kelly five-search checklist",
    phaseId: "phase-a",
    category: "Candidate defense",
    summary: "Defensive diligence on Kelly Grappe — log CourtConnect and SOS searches before Hammer pivots to personal attack.",
    body: [
      "Kelly's checklist lives in the diligence hub under [[court-diligence-protocol]]. Staff initials each row; counsel toggles review on hits.",
      "Public civics facts (Stand Up Arkansas, Forevermost business frame) stay in the public brief module — separate from staff search logs.",
      "The attack vector court-records-staff-search stays NEEDS_RESEARCH until all five rows show CLEAN or HIT_REQUIRES_COUNSEL with counsel reviewed.",
    ],
    sidebarFacts: [
      { label: "Subject ID", value: "kelly-grappe" },
      { label: "Public brief", value: "kellyCandidatePublicRecordBrief" },
      { label: "Debate coaching", value: "Attack vector drills" },
    ],
    seeAlso: ["court-diligence-protocol", "counsel-review-frame"],
    relatedRoutes: [
      { href: "/admin/intelligence/diligence/kelly-grappe", label: "Kelly diligence" },
      { href: "/admin/intelligence/kelly-debate-coaching", label: "Debate coaching" },
    ],
  },
  {
    slug: "hammer-diligence-checklist",
    title: "Kim Hammer diligence checklist",
    phaseId: "phase-a",
    category: "Opposition offense",
    summary: "Offensive five-search mirror on the incumbent — factual logs only, no broadcast until counsel on hits.",
    body: [
      "Hammer diligence follows the same [[court-diligence-protocol]] as Kelly. Findings feed trap lanes and dossier sections — not ad-lib stage attacks.",
      "Pair civil hits with [[kim-hammer-legislative-record]] and county-burden modules before any personal contrast.",
      "PACER optional when interstate litigation appears in civil search results.",
    ],
    sidebarFacts: [
      { label: "Subject ID", value: "kim-hammer" },
      { label: "Command center", value: "/admin/intelligence/kim-hammer" },
      { label: "Module count", value: "~54 briefing modules" },
    ],
    seeAlso: ["court-diligence-protocol", "pakko-diligence-checklist"],
    relatedRoutes: [
      { href: "/admin/intelligence/diligence/kim-hammer", label: "Hammer diligence" },
      { href: "/admin/intelligence/kim-hammer", label: "Hammer command center" },
    ],
  },
  {
    slug: "pakko-diligence-checklist",
    title: "Michael Pakko diligence checklist",
    phaseId: "phase-a",
    category: "Third candidate",
    summary: "Five-search protocol plus PACKO finance and quote gates — see [[pakko-contrast-gate]].",
    body: [
      "Pakko (spelled Packo on campaign site) gets the same five searches under [[court-diligence-protocol]].",
      "Contrast UI hard-blocks until PACKO-01 (finance) and PACKO-02 (quote ledger) reach PARTIAL — enforced by [[pakko-contrast-gate]].",
      "In clerk rooms: do not elevate the Libertarian third candidate unless asked. In debate: acknowledge reform goals, pivot to implementation.",
    ],
    sidebarFacts: [
      { label: "Campaign site", value: "pakko4ar.com" },
      { label: "Party", value: "Libertarian" },
      { label: "Open tasks", value: "PACKO-01, PACKO-02" },
    ],
    seeAlso: ["pakko-contrast-gate", "court-diligence-protocol"],
    relatedRoutes: [
      { href: "/admin/intelligence/diligence/michael-packo", label: "Pakko diligence" },
      { href: "/admin/intelligence/opponents", label: "Opponents hub" },
    ],
  },
  {
    slug: "pakko-contrast-gate",
    title: "Pakko contrast gate",
    phaseId: "phase-a",
    category: "Claims gate",
    summary: "Hard UI lock on Pakko attack lines until PACKO-01 and PACKO-02 are at least PARTIAL.",
    body: [
      "The gate reads michael-packo-opposition-scaffold.json research priorities. OPEN on PACKO-01 or PACKO-02 blocks contrast modules and dossier attack framing.",
      "Claims gate string from scaffold: no Packo attack until quote ledger partial. UI banner surfaces on opponents hub and Pakko dossier.",
      "When gate opens: still use [[counsel-review-frame]] on any court hit — finance summary alone does not authorize personal attack.",
    ],
    sidebarFacts: [
      { label: "PACKO-01", value: "Ballot & finance disclosures" },
      { label: "PACKO-02", value: "Public statements quote ledger" },
      { label: "Clerk rule", value: "Do not elevate unless asked" },
    ],
    seeAlso: ["claims-firewall", "pakko-diligence-checklist"],
    relatedRoutes: [{ href: "/admin/intelligence/opponents", label: "Opponents hub" }],
  },
  {
    slug: "claims-firewall",
    title: "Claims firewall",
    phaseId: "phase-a",
    category: "Governance",
    summary: "Legal firewall — VERIFIED vs NEEDS_REVIEW vs research-question-only before any broadcast line.",
    body: [
      "The claims ledger at /admin/intelligence/claims is the governance firewall. Classifications use NEEDS_REVIEW (not NEEDS_RESEARCH) for ledger rows.",
      "Trap lanes and SOS question bank carry per-item claimsGate strings. Stage-blocked gates show research-question-only framing — cite statute pattern, not unverified totals.",
      "Every upgrade phase deepens Field Book articles tied to closed claims — see [[strategy-migration]] in Phase D.",
    ],
    sidebarFacts: [
      { label: "Ledger path", value: "data/intelligence/claims/claim-ledger.json" },
      { label: "API", value: "/api/admin/intelligence/claim-review" },
      { label: "Trap lanes", value: "Six lanes with drill-downs" },
    ],
    seeAlso: ["counsel-review-frame", "court-diligence-protocol"],
    relatedRoutes: [
      { href: "/admin/intelligence/claims", label: "Verify claims" },
      { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
    ],
  },
  {
    slug: "counsel-review-frame",
    title: "Counsel review frame",
    phaseId: "phase-a",
    category: "Legal",
    summary: "When counsel must review before stage — hits, incomplete searches, and debate-stage lines.",
    body: [
      "Any HIT_REQUIRES_COUNSEL in a diligence log requires counselReviewed=true before debateStageLine may be used on air.",
      "Incomplete Kelly searches: 'I am running to run the Secretary of State's office for every voter.' Clean + logged: pivot to small-business survival in one sentence.",
      "Never fabricate denials. Never cite case numbers without counsel-approved wording.",
    ],
    sidebarFacts: [
      { label: "Kelly incomplete", value: "Service frame pivot" },
      { label: "Hammer incomplete", value: "Legislative record only" },
      { label: "Pakko incomplete", value: "No attack — contrast gate" },
    ],
    seeAlso: ["kelly-five-search-checklist", "claims-firewall"],
    relatedRoutes: [{ href: "/admin/intelligence/diligence", label: "Diligence hub" }],
  },
  {
    slug: "pacer-search",
    title: "PACER search (optional)",
    phaseId: "phase-a",
    category: "Research",
    summary: "Optional federal docket search when state civil hits suggest interstate litigation.",
    body: [
      "PACER is optional under [[court-diligence-protocol]] for Hammer and Pakko diligence modules. Staff + counsel only.",
      "Not a sixth required search — document in notes field if run.",
    ],
    sidebarFacts: [{ label: "Priority", value: "Optional" }, { label: "Audience", value: "Staff + counsel" }],
    seeAlso: ["hammer-diligence-checklist", "court-diligence-protocol"],
    relatedRoutes: [],
  },
  {
    slug: "operator-guides-revival",
    title: "Operator guides revival",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "Re-enable compact V4OperatorGuide on drill-downs — currently hidden on candidate debate builds.",
    body: [
      "Phase B re-enables shouldHideOperatorGuide() for debate prep surfaces. Each drill-down gets the five-block template: why it matters, when to use, first read, rehearse, claims gate.",
      "Pairs with [[plain-language-prep-sections]] across all 28 prep sections.",
    ],
    sidebarFacts: [{ label: "Component", value: "V4OperatorGuide.tsx" }, { label: "Status", value: "Planned — Phase B" }],
    seeAlso: ["five-block-drill-template", "debate-night-cheat-sheet"],
    relatedRoutes: [{ href: "/admin/intelligence/supreme-workbench", label: "Supreme workbench" }],
  },
  {
    slug: "five-block-drill-template",
    title: "Five-block drill template",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "Standard operator guide blocks on every intelligence drill-down page.",
    body: [
      "Blocks: (1) Why it matters (2) When to use (3) First read path (4) Rehearsal step (5) Claims gate reminder.",
      "Ships on trap lanes, SOS questions, Kim Hammer modules, and county clerk day paths.",
    ],
    sidebarFacts: [{ label: "Phase", value: "B" }, { label: "Scope", value: "All drill-downs" }],
    seeAlso: ["operator-guides-revival", "plain-language-prep-sections"],
    relatedRoutes: [],
  },
  {
    slug: "plain-language-prep-sections",
    title: "Plain language prep sections",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "Section-specific plain English for all 28 debate prep sections — no jargon without glossary link.",
    body: [
      "Extends debatePlainLanguageDepth and psychology manual cross-links. Every section links to Field Book terms on first use.",
      "County clerk audience gets clerk-first phrasing; iPad mode gets shorter blocks.",
    ],
    sidebarFacts: [{ label: "Sections", value: "28 prep sections" }, { label: "Phase", value: "B" }],
    seeAlso: ["debate-night-cheat-sheet", "ipad-candidate-ux"],
    relatedRoutes: [{ href: "/admin/intelligence/debate-prep/psychology-manual", label: "Psychology manual" }],
  },
  {
    slug: "debate-night-cheat-sheet",
    title: "Debate-night cheat sheet",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "One-page printable: speak order, three-way pivots, incomplete diligence frames, top six trap setups.",
    body: [
      "Ships as /admin/intelligence/debate-command cheat export plus iPad-optimized scroll.",
      "Pulls live readiness from debate-command and [[counsel-review-frame]] incomplete lines.",
    ],
    sidebarFacts: [{ label: "Phase", value: "B" }, { label: "Format", value: "Print + iPad" }],
    seeAlso: ["three-way-speak-order", "operator-guides-revival"],
    relatedRoutes: [{ href: "/admin/intelligence/debate-command", label: "Debate command" }],
  },
  {
    slug: "three-way-speak-order",
    title: "Three-way speak order",
    phaseId: "phase-b",
    category: "Debate craft",
    summary: "Kelly → Hammer → Pakko speak-order cards for expected SOS questions.",
    body: [
      "Each SOS question drill-down includes speakOrderDrills: first layer, second layer, third layer, agree phrase.",
      "Phase B ships dedicated cards on debate coaching and iPad More menu.",
    ],
    sidebarFacts: [{ label: "Question bank", value: "35 expected questions" }],
    seeAlso: ["debate-night-cheat-sheet", "pakko-contrast-gate"],
    relatedRoutes: [{ href: "/admin/intelligence/sos-debate-questions", label: "Expected questions" }],
  },
  {
    slug: "ipad-candidate-ux",
    title: "iPad candidate UX",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "Refactor bottom nav — remove alignment profile from primary bar; gate staff Kelly research.",
    body: [
      "NEXT_PUBLIC_CANDIDATE_IPAD_MODE enables touch targets and bottom nav. Phase B moves Kelly alignment profile to More menu only.",
      "Staff-only surfaces (Kelly mirror, morning brief depth) gated behind role flags — see [[role-based-nav-profiles]].",
    ],
    sidebarFacts: [{ label: "Env flag", value: "NEXT_PUBLIC_CANDIDATE_IPAD_MODE" }],
    seeAlso: ["role-based-nav-profiles", "operator-guides-revival"],
    relatedRoutes: [],
  },
  {
    slug: "kim-hammer-stub-promotion",
    title: "Kim Hammer stub promotion",
    phaseId: "phase-c",
    category: "Staff depth",
    summary: "Promote top 10 KH stubs (citation-locker, county-briefings, debate-archive) or remove from candidate nav.",
    body: [
      "Staff-stub render type modules show placeholder until promoted. Phase C either fills content or hides from candidate-facing nav.",
      "Priority stubs: citation-locker, county-briefings, debate-archive — pair with [[film-room-mvp]].",
    ],
    sidebarFacts: [{ label: "KH modules", value: "~54 total" }, { label: "Phase", value: "C" }],
    seeAlso: ["film-room-mvp", "pakko-command-center"],
    relatedRoutes: [{ href: "/admin/intelligence/kim-hammer", label: "Hammer command center" }],
  },
  {
    slug: "pakko-command-center",
    title: "Pakko mini command center",
    phaseId: "phase-c",
    category: "Staff depth",
    summary: "Hammer-parity hub for Michael Pakko — scaffold, dossier, diligence, contrast playbook.",
    body: [
      "Mirrors KimHammerCommandCenterV3 layout at /admin/intelligence/opponents/michael-packo (planned route).",
      "Requires [[pakko-contrast-gate]] open before attack modules surface.",
    ],
    sidebarFacts: [{ label: "Phase", value: "C" }, { label: "Status", value: "Planned" }],
    seeAlso: ["pakko-diligence-checklist", "pakko-contrast-gate"],
    relatedRoutes: [{ href: "/admin/intelligence/opponents", label: "Opponents hub" }],
  },
  {
    slug: "cvsgf-ledger-gap",
    title: "CVSGF ledger gap",
    phaseId: "phase-c",
    category: "Election funding",
    summary: "Close remittance totals research gap or lock trap lane 3 to research-question-only.",
    body: [
      "UCC-to-CVSGF remittance totals remain research-question-only in SOS question bank until staff ingests annual figures.",
      "Statute pattern VERIFIED; numeric county totals blocked on stage — see [[claims-firewall]].",
    ],
    sidebarFacts: [{ label: "Trap lane", value: "Lane 3 — funding" }, { label: "Statute", value: "VERIFIED" }],
    seeAlso: ["claims-firewall"],
    relatedRoutes: [{ href: "/admin/intelligence/election-funding", label: "Election funding" }],
  },
  {
    slug: "film-room-mvp",
    title: "Film room MVP",
    phaseId: "phase-c",
    category: "Media",
    summary: "Minimum viable clip set per focus bill — index before debate week.",
    body: [
      "Each focus bill gets at least one committee clip + transcript chunk in film room.",
      "Links from Kim Hammer debate prep and trap lane drill-downs.",
    ],
    sidebarFacts: [{ label: "Route", value: "/admin/intelligence/film-room" }],
    seeAlso: ["kim-hammer-stub-promotion"],
    relatedRoutes: [{ href: "/admin/intelligence/film-room", label: "Film room" }],
  },
  {
    slug: "three-lane-nav",
    title: "Three-lane navigation",
    phaseId: "phase-d",
    category: "Organization",
    summary: "Kelly (emerald) / Clerks (sky) / Staff (violet) / Phase A (rose) lanes — sidebar, subnav, and teal new-link chips.",
    body: [
      "Phase D replaces flat debate-week nav with four color-coded lanes. Each lane has a fixed palette in sidebar headers, horizontal subnav chips, and the canon strip lane badge.",
      "Phase A (rose): diligence hub, Field Book, candidate dossiers, build progress — safety rails before narrative depth. Kelly (emerald): debate prep, trap lanes, SOS questions, coaching — candidate-safe on stage.",
      "Clerks (sky): county clerk week, ACCA panel, election funding, VVSG equipment — clerk-room vocabulary only. Staff (violet): Hammer modules, action queues, evidence command, NSI research — hidden from candidate profile unless explicitly promoted.",
      "Teal highlight on nav links marks routes introduced in the current deploy batch until the user visits them once — see navLinkReleaseManifest batches. Phase D batch id: 2026-06-05-phase-d-organization-canon.",
      "Implementation lives in threeLaneNav.ts — buildThreeLaneNavGroups() feeds IntelligenceLaunchBoardShell sidebar and IntelligenceDebateSubnav horizontal chips. Pair with [[role-based-nav-profiles]] for Netlify deploy variants.",
    ],
    sidebarFacts: [
      { label: "Kelly lane", value: "Emerald · candidate-safe" },
      { label: "Clerks lane", value: "Sky · county path" },
      { label: "Staff lane", value: "Violet · NSI research" },
      { label: "Phase A lane", value: "Rose · diligence + canon" },
      { label: "New links", value: "Teal until visited" },
    ],
    seeAlso: ["role-based-nav-profiles", "strategy-migration", "claims-firewall"],
    relatedRoutes: [
      { href: "/admin/intelligence/supreme-workbench", label: "Supreme workbench" },
      { href: "/admin/intelligence/field-book/canon", label: "Canon loop hub" },
      { href: "/admin/intelligence/build-progress", label: "Build progress" },
    ],
  },
  {
    slug: "role-based-nav-profiles",
    title: "Role-based nav profiles",
    phaseId: "phase-d",
    category: "Organization",
    summary: "NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=CANDIDATE|STAFF|CLERK_WEEK reshapes lane order and staff visibility.",
    body: [
      "Extends NEXT_PUBLIC_CANDIDATE_IPAD_MODE with explicit role profiles for Netlify deploy variants. Set NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE on build — default AUTO picks CLERK_WEEK when county clerk audience flag is active, otherwise CANDIDATE.",
      "CANDIDATE profile: hides the Staff lane entirely from sidebar and subnav — Kelly mirror, morning brief depth, LLM review queue, and Hammer evidence command stay off primary chrome. Staff must use STAFF profile deploy or direct URLs.",
      "STAFF profile: full four-lane access with Phase A first, then Kelly, Clerks, Staff — used for link audit route expansion and master build sessions.",
      "CLERK_WEEK profile: reorders lanes to Phase A → Clerks → Kelly → Staff — county clerk week path surfaces before debate prep chips. Pair with ACCA panel and election funding routes.",
      "Profiles do not change claims gates or diligence requirements — they only reshape navigation. See [[three-lane-nav]] for lane colors and [[ipad-candidate-ux]] for touch-target mode.",
    ],
    sidebarFacts: [
      { label: "Env flag", value: "NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE" },
      { label: "Values", value: "CANDIDATE · STAFF · CLERK_WEEK · AUTO" },
      { label: "Default", value: "AUTO → CANDIDATE or CLERK_WEEK" },
      { label: "iPad flag", value: "NEXT_PUBLIC_CANDIDATE_IPAD_MODE" },
    ],
    seeAlso: ["three-lane-nav", "ipad-candidate-ux", "strategy-migration"],
    relatedRoutes: [{ href: "/admin/intelligence/county-clerk-week", label: "County clerk week" }],
  },
  {
    slug: "strategy-migration",
    title: "Strategy migration",
    phaseId: "phase-d",
    category: "Canon",
    summary: "After ~98% intelligence — migrate strategy manual chunks into admin dashboard editor and Field Book connected canon.",
    body: [
      "2,795 chunks from campaign-system-manual and Kelly SOS strategic plan feed Field Book articles over successive upgrade phases. Phase A articles are live now; B–D expand as each deploy ships real depth.",
      "The canon loop (fieldBookCanonRegistry.ts) binds intelligence routes to Field Book slugs — every page with a binding shows a gold canon strip promoting encyclopedia entries and claims ledger gates.",
      "Admin strategy reader becomes editor; Field Book becomes connected canon with [[claims-firewall]] on every public-adaptation path. Staff promotes page summaries into articles; cross-links use [[slug]] or [[slug|label]] syntax.",
      "Build progress tracks canon completion: binding count, article slugs linked, routes with claims gates. Phase D exit criteria: three-lane nav live on Netlify, canon hub reachable, teal new-link batch for organization routes.",
      "Do not migrate unverified claims — close NEEDS_REVIEW rows in the ledger before promoting stage lines into Field Book body text. See [[counsel-review-frame]] for counsel hits.",
    ],
    sidebarFacts: [
      { label: "Manual chunks", value: "2,795" },
      { label: "Target readiness", value: "~98% intelligence" },
      { label: "Canon bindings", value: "12 route prefixes" },
      { label: "Hub route", value: "/admin/intelligence/field-book/canon" },
    ],
    seeAlso: ["claims-firewall", "three-lane-nav", "court-diligence-protocol"],
    relatedRoutes: [
      { href: "/admin/intelligence/strategy-alignment", label: "Strategy alignment" },
      { href: "/admin/intelligence/briefing-papers", label: "Briefing papers" },
      { href: "/admin/intelligence/field-book/canon", label: "Canon loop hub" },
      { href: "/admin/intelligence/build-progress", label: "Build progress" },
    ],
  },
  {
    slug: "kim-hammer-legislative-record",
    title: "Kim Hammer legislative record",
    phaseId: "phase-c",
    category: "Opposition",
    summary: "Verified bill votes and sponsorship — primary offensive surface when court diligence incomplete.",
    body: [
      "When [[hammer-diligence-checklist]] is incomplete, stay on enrolled acts and committee record — not personal speculation.",
      "Pairs with trap lanes and film room clips.",
    ],
    sidebarFacts: [{ label: "Module layer", value: "KH-1 through KH-4" }],
    seeAlso: ["hammer-diligence-checklist", "film-room-mvp"],
    relatedRoutes: [{ href: "/admin/intelligence/kim-hammer/debate-prep", label: "Hammer debate prep" }],
  },
];

export function getFieldBookPhase(phaseId: string): FieldBookPhase | undefined {
  return FIELD_BOOK_PHASES.find((p) => p.id === phaseId);
}

export function getFieldBookArticle(slug: string): FieldBookArticle | undefined {
  return FIELD_BOOK_ARTICLES.find((a) => a.slug === slug);
}

export function getFieldBookArticlesForPhase(phaseId: FieldBookPhaseId): FieldBookArticle[] {
  return FIELD_BOOK_ARTICLES.filter((a) => a.phaseId === phaseId);
}

export function getAllFieldBookSlugs(): string[] {
  return FIELD_BOOK_ARTICLES.map((a) => a.slug);
}

export function searchFieldBookArticles(query: string): FieldBookArticle[] {
  const q = query.toLowerCase().trim();
  if (!q) return FIELD_BOOK_ARTICLES;
  return FIELD_BOOK_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.body.some((p) => p.toLowerCase().includes(q)),
  );
}

/** Resolve [[slug]] or [[slug|label]] in article body text */
export function parseFieldBookCrossLinks(text: string): Array<{ type: "text" | "link"; value: string; slug?: string }> {
  const parts: Array<{ type: "text" | "link"; value: string; slug?: string }> = [];
  const re = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const slug = match[1]!;
    const label = match[2] ?? getFieldBookArticle(slug)?.title ?? slug;
    parts.push({ type: "link", value: label, slug });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }
  return parts.length ? parts : [{ type: "text", value: text }];
}

export const FIELD_BOOK_HUB_HREF = "/admin/intelligence/field-book";

export function getFieldBookLinkAuditRoutes(): string[] {
  return [
    FIELD_BOOK_HUB_HREF,
    "/admin/intelligence/field-book/canon",
    ...FIELD_BOOK_PHASES.map((p) => p.href),
    ...FIELD_BOOK_ARTICLES.map((a) => `${FIELD_BOOK_HUB_HREF}/${a.slug}`),
  ];
}
