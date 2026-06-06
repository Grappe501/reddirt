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
      "Before any debate-stage line references personal or financial records, staff completes the [[kelly-five-search-checklist]] in order. Outcomes are logged in JSON diligence files — never speculated in prep docs or candidate-facing scripts.",
      "The protocol mirrors across [[hammer-diligence-checklist]] and [[pakko-diligence-checklist]] so offensive and defensive diligence use the same counsel frame. Same five searches, same log fields, same HIT_REQUIRES_COUNSEL workflow.",
      "Search order is fixed: Arkansas CourtConnect civil, then criminal, then SOS UCC filings, then SOS business entity standing, then county assessor property tax on campaign-relevant parcels only. Do not reorder — civil hits inform whether optional [[pacer-search]] is warranted.",
      "Each row in the diligence hub ships operator prose: where to click, what case numbers to log, and the counsel trigger — even when status is still NOT_SEARCHED. Staff expands the guide, runs the search, sets initials and date, then marks CLEAN or HIT_REQUIRES_COUNSEL.",
      "Optional [[pacer-search]] applies when civil hits suggest interstate or federal litigation — counsel only, never candidate-facing without review. Document PACER in the notes field; it is not a sixth required search.",
      "Incomplete searches trigger the incomplete frame: pivot to service and SOS implementation, not denial or attack. Kelly uses the service frame; Hammer stays on legislative record; Pakko acknowledges reform goals without personal contrast until gates open.",
      "The diligence hub at /admin/intelligence/diligence aggregates all three subjects with completion percentages. Phase A upgrade pass tracks checklist progress alongside claims firewall and Pakko contrast gate status.",
      "Field Book Phase A articles cross-link every search type to [[counsel-review-frame]] and [[claims-firewall]] — operator canon, not empty forms.",
    ],
    sidebarFacts: [
      { label: "Search order", value: "Civil → Criminal → UCC → Entity → Property" },
      { label: "Counsel gate", value: "Required on any HIT_REQUIRES_COUNSEL" },
      { label: "Log location", value: "data/intelligence/*-court-diligence-log.json" },
      { label: "Operator guides", value: "15 rows — Kelly + Hammer + Pakko" },
    ],
    seeAlso: ["kelly-five-search-checklist", "counsel-review-frame", "claims-firewall"],
    relatedRoutes: [
      { href: "/admin/intelligence/diligence", label: "Diligence hub" },
      { href: "/admin/intelligence/claims", label: "Verify claims" },
    ],
    trivia: [
      "Whisper campaigns on business filings spike in the final two weeks — entity search is not optional.",
      "CourtConnect sessions time out — screenshot case numbers as you go; do not rely on memory across five searches.",
    ],
  },
  {
    slug: "kelly-five-search-checklist",
    title: "Kelly five-search checklist",
    phaseId: "phase-a",
    category: "Candidate defense",
    summary: "Defensive diligence on Kelly Grappe — log CourtConnect and SOS searches before Hammer pivots to personal attack.",
    body: [
      "Kelly's checklist lives in the diligence hub under [[court-diligence-protocol]]. Staff initials each row; counsel toggles review on hits. The interactive panel saves via /api/admin/intelligence/diligence-log — refresh confirms persistence.",
      "Public civics facts (Stand Up Arkansas, Forevermost business frame) stay in the public brief module — separate from staff search logs. Never paste CourtConnect party narratives into the public brief or debate scripts.",
      "The attack vector court-records-staff-search stays NEEDS_RESEARCH until all five rows show CLEAN or HIT_REQUIRES_COUNSEL with counsel reviewed. Debate coaching drills reference this vector explicitly — do not claim a clean search on stage until logged.",
      "Civil search: run all-county CourtConnect for Kelly Grappe plus name variants. Log case numbers and disposition only. If multiple counties: mark IN_PROGRESS until complete, then CLEAN or HIT.",
      "Criminal search: same session, criminal docket tab. Zero hits after all relevant counties → CLEAN with date and initials. Any open matter → HIT_REQUIRES_COUNSEL, counselReviewed before debateStageLine.",
      "UCC and entity searches cover Forevermost and related LLCs. Farm economics stress may be spun in whisper campaigns — factual filing numbers in notes, counsel on anything that could become an attack line.",
      "Property tax: Faulkner and campaign-relevant counties only. No PII beyond counsel-approved scope. Incomplete on debate night: 'I am running to run the Secretary of State's office for every voter.'",
    ],
    sidebarFacts: [
      { label: "Subject ID", value: "kelly-grappe" },
      { label: "Public brief", value: "kellyCandidatePublicRecordBrief" },
      { label: "Debate coaching", value: "Attack vector drills" },
      { label: "Diligence route", value: "/admin/intelligence/diligence/kelly-grappe" },
    ],
    seeAlso: ["court-diligence-protocol", "counsel-review-frame"],
    relatedRoutes: [
      { href: "/admin/intelligence/diligence/kelly-grappe", label: "Kelly diligence" },
      { href: "/admin/intelligence/kelly-debate-coaching", label: "Debate coaching" },
    ],
    trivia: [
      "Kelly's incomplete frame is the most-used debate pivot in Phase A — memorize it before any personal-records question.",
      "Forevermost entity search often completes before civil — still log in protocol order for counsel consistency.",
    ],
  },
  {
    slug: "hammer-diligence-checklist",
    title: "Kim Hammer diligence checklist",
    phaseId: "phase-a",
    category: "Opposition offense",
    summary: "Offensive five-search mirror on the incumbent — factual logs only, no broadcast until counsel on hits.",
    body: [
      "Hammer diligence follows the same [[court-diligence-protocol]] as Kelly. Findings feed trap lanes and dossier sections — not ad-lib stage attacks. Offensive diligence is factual logging with the same counsel gate as defensive work.",
      "Pair civil hits with legislative record and county-burden modules before any personal contrast. A filing alone is not a debate line — it needs counsel-approved debateStageLine text in the log row.",
      "PACER optional when interstate litigation appears in civil search results. Document in notes if run; staff and counsel only. See [[pacer-search]] for when to escalate beyond state courts.",
      "Civil search covers Kim Hammer across all counties with probate and domestic relations included. Screenshot case numbers; log open vs closed disposition. Multiple hits do not automatically mean usable contrast — counsel filters.",
      "Criminal docket: same discipline as Kelly module. Clean search → focus debate prep on verified votes and public statements. Hit → HIT_REQUIRES_COUNSEL, no broadcast until counselReviewed.",
      "UCC and entity searches catch whisper-campaign material on business standing. Incumbent financial narratives often cite entity status — verify against SOS primary record before trap lane integration.",
      "Property tax on campaign-relevant parcels only. Incomplete Hammer diligence on debate night: stay on legislative record — never speculate about court records the log has not cleared.",
    ],
    sidebarFacts: [
      { label: "Subject ID", value: "kim-hammer" },
      { label: "Command center", value: "/admin/intelligence/kim-hammer" },
      { label: "Module count", value: "~54 briefing modules" },
      { label: "PACER", value: "Optional — notes field" },
    ],
    seeAlso: ["court-diligence-protocol", "pakko-diligence-checklist", "pacer-search"],
    relatedRoutes: [
      { href: "/admin/intelligence/diligence/kim-hammer", label: "Hammer diligence" },
      { href: "/admin/intelligence/kim-hammer", label: "Hammer command center" },
    ],
    trivia: [
      "Hammer civil hits plus legislative votes are the standard trap-lane pairing — never lead with court speculation alone.",
    ],
  },
  {
    slug: "pakko-diligence-checklist",
    title: "Michael Pakko diligence checklist",
    phaseId: "phase-a",
    category: "Third candidate",
    summary: "Five-search protocol plus PACKO finance and quote gates — see [[pakko-contrast-gate]].",
    body: [
      "Pakko (spelled Packo on campaign site) gets the same five searches under [[court-diligence-protocol]]. Subject ID in logs is michael-packo; use both spellings in CourtConnect name-variant searches.",
      "Contrast UI hard-blocks until PACKO-01 (finance) and PACKO-02 (quote ledger) reach PARTIAL — enforced by [[pakko-contrast-gate]]. Court diligence alone does not open attack framing.",
      "In clerk rooms: do not elevate the Libertarian third candidate unless asked. In debate: acknowledge reform goals, pivot to SOS implementation. Personal contrast waits for gate plus counsel on any court hit.",
      "Five-search operator guides mirror Kelly and Hammer rows. Each NOT_SEARCHED row expands to step-by-step prose in the diligence panel — staff runs searches in protocol order, logs outcomes only.",
      "Finance disclosures (PACKO-01) and public quote ledger (PACKO-02) live in opposition scaffold and command center routes. Diligence log tracks court/financial searches separately from those research priorities.",
      "Civil and criminal CourtConnect: all counties, factual case numbers in notes. UCC/entity: search Pakko-linked business names from campaign filings. Property tax: campaign-relevant parcels only.",
      "When contrast gate opens: still apply [[counsel-review-frame]] before any debateStageLine citing filings. Finance summary partial does not authorize personal attack without counsel-reviewed wording.",
    ],
    sidebarFacts: [
      { label: "Campaign site", value: "pakko4ar.com" },
      { label: "Party", value: "Libertarian" },
      { label: "Open tasks", value: "PACKO-01, PACKO-02" },
      { label: "Command center", value: "/admin/intelligence/opponents/michael-packo" },
    ],
    seeAlso: ["pakko-contrast-gate", "court-diligence-protocol"],
    relatedRoutes: [
      { href: "/admin/intelligence/diligence/michael-packo", label: "Pakko diligence" },
      { href: "/admin/intelligence/opponents/michael-packo", label: "Pakko command center" },
    ],
    trivia: [
      "Third-candidate elevation in clerk rooms is a common staff mistake — default to Kelly service frame unless moderator asks about Pakko.",
    ],
  },
  {
    slug: "pakko-contrast-gate",
    title: "Pakko contrast gate",
    phaseId: "phase-a",
    category: "Claims gate",
    summary: "Hard UI lock on Pakko attack lines until PACKO-01 and PACKO-02 are at least PARTIAL.",
    body: [
      "The gate reads michael-packo-opposition-scaffold.json research priorities. OPEN on PACKO-01 or PACKO-02 blocks contrast modules and dossier attack framing across opponents hub and Pakko command center.",
      "Claims gate string from scaffold: no Packo attack until quote ledger partial. UI banner surfaces on opponents hub, Pakko dossier, and diligence subject page when blocked.",
      "When gate opens: still use [[counsel-review-frame]] on any court hit — finance summary alone does not authorize personal attack. Two gates: research priority PARTIAL minimum, then counsel on filing-based lines.",
      "PACKO-01 covers ballot and finance disclosures — staff marks PARTIAL when minimum disclosure set is logged with sources. OPEN means contrast UI shows locked state with task ids visible.",
      "PACKO-02 covers public statements quote ledger — starter JSON in data/intelligence with verified quotes only. Attack lines require ledger partial plus counsel on any court-derived contrast.",
      "Test script test-pakko-command-center asserts contrast gate behavior and command center routes. Gate status feeds Phase A upgrade pass and build progress dashboard.",
      "Clerk-room rule persists even when gate opens: do not elevate third candidate unless asked. Gate controls attack framing in admin prep — not county clerk panel etiquette.",
    ],
    sidebarFacts: [
      { label: "PACKO-01", value: "Ballot & finance disclosures" },
      { label: "PACKO-02", value: "Public statements quote ledger" },
      { label: "Clerk rule", value: "Do not elevate unless asked" },
      { label: "Scaffold path", value: "michael-packo-opposition-scaffold.json" },
    ],
    seeAlso: ["claims-firewall", "pakko-diligence-checklist"],
    relatedRoutes: [
      { href: "/admin/intelligence/opponents", label: "Opponents hub" },
      { href: "/admin/intelligence/opponents/michael-packo", label: "Pakko command center" },
    ],
    trivia: [
      "Contrast gate and court diligence are independent — staff can complete five searches while PACKO-01/02 remain OPEN.",
    ],
  },
  {
    slug: "claims-firewall",
    title: "Claims firewall",
    phaseId: "phase-a",
    category: "Governance",
    summary: "Legal firewall — VERIFIED vs NEEDS_REVIEW vs research-question-only before any broadcast line.",
    body: [
      "The claims ledger at /admin/intelligence/claims is the governance firewall. Classifications use NEEDS_REVIEW (not NEEDS_RESEARCH) for ledger rows — staff verify before broadcast.",
      "Trap lanes and SOS question bank carry per-item claimsGate strings. Stage-blocked gates show research-question-only framing — cite statute pattern, not unverified totals.",
      "Every upgrade phase deepens Field Book articles tied to closed claims — see strategy migration in Phase D when intelligence build approaches completion.",
      "API route /api/admin/intelligence/claim-review updates classifications with audit trail. NEEDS_REVIEW count feeds Phase A upgrade pass and supreme workbench readiness dimensions.",
      "VERIFIED rows may appear in debate scripts and trap lane drill-downs. NEEDS_REVIEW rows show staff warning banners — candidate sees research-question-only phrasing, not asserted facts.",
      "Diligence logs and claims ledger are separate systems: court search outcomes live in diligence JSON; broadcast assertions live in claim-ledger.json. Cross-check both before any stage line.",
      "CVSGF and election-funding claims often carry research-question-only gates — cite Ark. Code Ann. pattern and records-request status, not fabricated county totals.",
    ],
    sidebarFacts: [
      { label: "Ledger path", value: "data/intelligence/claims/claim-ledger.json" },
      { label: "API", value: "/api/admin/intelligence/claim-review" },
      { label: "Trap lanes", value: "Six lanes with drill-downs" },
      { label: "Classification", value: "VERIFIED · NEEDS_REVIEW" },
    ],
    seeAlso: ["counsel-review-frame", "court-diligence-protocol"],
    relatedRoutes: [
      { href: "/admin/intelligence/claims", label: "Verify claims" },
      { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
    ],
    trivia: [
      "NEEDS_REVIEW is intentional naming — ledger rows are staff-verify tasks, not open research questions like attack vectors.",
    ],
  },
  {
    slug: "counsel-review-frame",
    title: "Counsel review frame",
    phaseId: "phase-a",
    category: "Legal",
    summary: "When counsel must review before stage — hits, incomplete searches, and debate-stage lines.",
    body: [
      "Any HIT_REQUIRES_COUNSEL in a diligence log requires counselReviewed=true before debateStageLine may be used on air. The checkbox in the diligence panel is the system of record.",
      "Incomplete Kelly searches: 'I am running to run the Secretary of State's office for every voter.' Clean + logged: pivot to small-business survival in one sentence. Never fabricate denials.",
      "Never fabricate denials. Never cite case numbers without counsel-approved wording. Staff logs case numbers in JSON notes — debate scripts get counsel-filtered single sentences only.",
      "Hammer incomplete diligence: stay on verified legislative record and public statements. Offensive contrast from unlogged court speculation is prohibited — same counsel gate as Kelly defense.",
      "Pakko incomplete: no personal attack; acknowledge reform goals and pivot to SOS implementation. Contrast gate (PACKO-01/02) is an additional lock beyond counsel frame.",
      "debateStageLine field in each diligence row holds counsel-approved stage text when a hit exists. Empty debateStageLine with HIT_REQUIRES_COUNSEL means counsel has not cleared broadcast wording.",
      "Phase 2 operator guides embed incomplete pivot text per search row so staff rehearse frames before debate night — see diligence hub expandable guides.",
    ],
    sidebarFacts: [
      { label: "Kelly incomplete", value: "Service frame pivot" },
      { label: "Hammer incomplete", value: "Legislative record only" },
      { label: "Pakko incomplete", value: "No attack — contrast gate" },
      { label: "Counsel checkbox", value: "counselReviewed in log row" },
    ],
    seeAlso: ["kelly-five-search-checklist", "claims-firewall"],
    relatedRoutes: [{ href: "/admin/intelligence/diligence", label: "Diligence hub" }],
    trivia: [
      "Candidates sometimes want to 'deny' unsearched vectors — incomplete frame is the legally safer pivot.",
    ],
  },
  {
    slug: "pacer-search",
    title: "PACER search (optional)",
    phaseId: "phase-a",
    category: "Research",
    summary: "Optional federal docket search when state civil hits suggest interstate litigation.",
    body: [
      "PACER is optional under [[court-diligence-protocol]] for Hammer and Pakko diligence modules. Staff + counsel only — never candidate-facing without review.",
      "Not a sixth required search — document in notes field if run. Completion percentage on diligence hub counts only the five required rows.",
      "Trigger: state civil search returns cases suggesting federal jurisdiction, bankruptcy, or interstate litigation. Counsel decides whether PACER adds value beyond state docket.",
      "Access requires PACER account billing — log search date and case numbers in diligence notes, not in public brief or trap lane scripts until counsel clears.",
      "Kelly defensive module typically does not need PACER unless civil hits explicitly reference removed-to-federal cases — still counsel-only.",
      "Pair PACER findings with [[hammer-diligence-checklist]] trap lane integration only after counselReviewed on the originating state civil row.",
      "If PACER is not run: note 'PACER not indicated' in civil row notes when civil search is CLEAN — documents deliberate skip for audit trail.",
    ],
    sidebarFacts: [
      { label: "Priority", value: "Optional" },
      { label: "Audience", value: "Staff + counsel" },
      { label: "Subjects", value: "Hammer · Pakko (typical)" },
      { label: "Log field", value: "notes on civil row" },
    ],
    seeAlso: ["hammer-diligence-checklist", "court-diligence-protocol"],
    relatedRoutes: [{ href: "/admin/intelligence/diligence/kim-hammer", label: "Hammer diligence" }],
    trivia: [
      "PACER fees accumulate quickly — counsel approval before broad name searches prevents surprise billing.",
    ],
  },
  {
    slug: "operator-guides-revival",
    title: "Operator guides revival",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "Re-enable compact V4OperatorGuide on drill-downs — currently hidden on candidate debate builds.",
    body: [
      "Phase B re-enables shouldHideOperatorGuide() for debate prep surfaces. Each drill-down gets the [[five-block-drill-template]]: why it matters, when to use, first read, rehearse, claims gate.",
      "The V4OperatorGuide component ships collapsed by default on candidate iPad builds — staff expand for rehearsal; candidates see plain-language blocks only unless NEXT_PUBLIC_CANDIDATE_IPAD_MODE is off.",
      "Trap lane and SOS question drill-downs already wire five-layer chrome from Phase 3 — Phase B unifies the older operator guide component with the same five blocks so staff see one consistent template.",
      "Kim Hammer prep sections (28 total) and county clerk day paths receive the guide when encounter depth is present — pair with [[plain-language-prep-sections]] so jargon links to [[debate-glossary]] on first use.",
      "Claims gate block always links to [[claims-firewall]] — never hide the gate on candidate-facing builds; shorten the copy, do not remove the tier badge.",
      "Build progress tracks operator guide coverage separately from five-layer bar — both must be green before Field Book promotion of section summaries.",
      "See [[debate-night-cheat-sheet]] for printable one-pager that pulls live readiness without exposing staff-only operator notes.",
    ],
    sidebarFacts: [
      { label: "Component", value: "V4OperatorGuide.tsx" },
      { label: "Status", value: "Phase B live" },
      { label: "Blocks", value: "5 — matches five-layer standard" },
    ],
    seeAlso: ["five-block-drill-template", "debate-night-cheat-sheet", "debate-glossary"],
    relatedRoutes: [
      { href: "/admin/intelligence/supreme-workbench", label: "Supreme workbench" },
      { href: "/admin/intelligence/phase-3-upgrade", label: "Phase 3 waves" },
    ],
  },
  {
    slug: "five-block-drill-template",
    title: "Five-block drill template",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "Standard operator guide blocks on every intelligence drill-down page.",
    body: [
      "Block 1 — Why it matters: one paragraph tying the page to debate-night outcome or clerk-room audience. Block 2 — When to use: timing relative to T-24h, green room, or on-stage pivot.",
      "Block 3 — First read path: ordered links to dossier section, act-proof, or diligence log before Kelly rehearses scripts. Block 4 — Rehearsal step: speak-order drill or trap lane step coverage summary.",
      "Block 5 — Claims gate reminder: VERIFIED / NEEDS_REVIEW / RESEARCH_QUESTION badge with link to [[claims-firewall]] ledger row when applicable.",
      "Phase 3 five-layer standard extends this template with orientation banner, narrative paragraphs, and evidence tables — operator guide is the compact staff view of the same content.",
      "Ships on trap lanes, SOS questions, Kim Hammer modules, county clerk day paths, and psychology manual sections after Phase 5 glossary links resolve jargon.",
      "Do not duplicate full scripts in block 5 — point to drill-down script fields; the gate is the only mandatory block on candidate iPad mode.",
      "Field Book promotion: when all five blocks are populated on a route, staff may paste block 1–2 prose into encyclopedia entries after claims review.",
    ],
    sidebarFacts: [
      { label: "Phase", value: "B" },
      { label: "Scope", value: "All drill-downs" },
      { label: "Layer map", value: "Phase 3 five-layer superset" },
    ],
    seeAlso: ["operator-guides-revival", "plain-language-prep-sections", "debate-glossary"],
    relatedRoutes: [{ href: "/admin/intelligence/trap-lanes", label: "Trap lanes" }],
  },
  {
    slug: "plain-language-prep-sections",
    title: "Plain language prep sections",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "Section-specific plain English for all 28 debate prep sections — no jargon without glossary link.",
    body: [
      "Extends debatePlainLanguageDepth and psychology manual cross-links. Every prep section at /admin/intelligence/kim-hammer/debate-prep/* includes whatToExpectPlain when encounter depth is complete.",
      "County clerk audience gets clerk-first phrasing on shared sections — avoid debate-stage metaphors when the same content appears on election funding or ACCA routes.",
      "iPad mode gets shorter blocks: max three sentences per paragraph, glossary links open in slide-over rather than navigating away from rehearsal.",
      "Phase 5 ships [[debate-glossary]] — forty-plus terms with definitions, Field Book slugs, and intelligence hrefs. Prep sections link terms on first use via [[debate-glossary]] index.",
      "Build progress flags prep sections below encounter depth bar — currently 43% complete; Phase B target is 90% before debate week.",
      "Staff NSI research modules stay in plain English headers even when body content is stub — candidate nav hides stubs via [[role-based-nav-profiles]] STAFF profile.",
      "Promotion workflow: verified plain-language paragraphs may migrate into Field Book after claims ledger row is VERIFIED — never paste CourtConnect party narratives.",
    ],
    sidebarFacts: [
      { label: "Sections", value: "28 prep sections" },
      { label: "Glossary", value: "40+ debate terms" },
      { label: "Phase", value: "B + Phase 5" },
    ],
    seeAlso: ["debate-night-cheat-sheet", "ipad-candidate-ux", "debate-glossary"],
    relatedRoutes: [
      { href: "/admin/intelligence/debate-prep/psychology-manual", label: "Psychology manual" },
      { href: "/admin/intelligence/field-book/glossary", label: "Debate glossary" },
    ],
  },
  {
    slug: "debate-night-cheat-sheet",
    title: "Debate-night cheat sheet",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "One-page printable: speak order, three-way pivots, incomplete diligence frames, top six trap setups.",
    body: [
      "Ships as /admin/intelligence/debate-command cheat export plus iPad-optimized scroll — pulls live readiness scores and blocked trap lanes from debate-command API.",
      "Section 1: [[three-way-speak-order]] quick reference — Kelly first, Hammer second, Pakko third on expected SOS questions. Section 2: top six trap lanes by readiness score.",
      "Section 3: incomplete diligence frames from [[counsel-review-frame]] — service pivot lines when Kelly or Hammer searches are NOT_SEARCHED. Never print clean-search claims.",
      "Section 4: claims gate summary — count of NEEDS_REVIEW rows with link to /admin/intelligence/claims. Section 5: ACCA/clerk pivot phrases if CLERK_WEEK profile active.",
      "Print CSS hides staff-only operator blocks — candidates get speak-order cards and pivot lines only. Staff PDF includes evidence table footnotes.",
      "Regenerate after every diligence log save and claims ledger update — supreme workbench shows last-generated timestamp.",
      "Field Book cross-link: cheat sheet content does not replace encyclopedia articles — promote only verified pivot frames into [[debate-glossary]] entries.",
    ],
    sidebarFacts: [
      { label: "Phase", value: "B" },
      { label: "Format", value: "Print + iPad" },
      { label: "Live source", value: "debate-command scores" },
    ],
    seeAlso: ["three-way-speak-order", "operator-guides-revival", "debate-glossary"],
    relatedRoutes: [{ href: "/admin/intelligence/debate-command", label: "Debate command" }],
  },
  {
    slug: "three-way-speak-order",
    title: "Three-way speak order",
    phaseId: "phase-b",
    category: "Debate craft",
    summary: "Kelly → Hammer → Pakko speak-order cards for expected SOS questions.",
    body: [
      "Each SOS question drill-down includes speakOrderDrills: first layer (Kelly direct answer 30s), second layer (Hammer likely attack), third layer (Pakko elevation if asked), agree phrase.",
      "Phase B ships dedicated cards on debate coaching and iPad More menu — compact cards link to full drill-down at /admin/intelligence/sos-debate-questions/[id].",
      "Pakko third layer respects [[pakko-contrast-gate]] — when gate closed, third layer is acknowledge-only with no personal contrast rehearsal on stage.",
      "Clerk-week profile may hide Pakko third layer on funding questions — use research-question framing per [[cvsgf-ledger-gap]] instead of candidate contrast.",
      "Speak-order drills are candidate-safe when claims tier is VERIFIED or RESEARCH_QUESTION — NEEDS_REVIEW blocks the card with red badge.",
      "Philosophy briefings at /admin/intelligence/debate-briefings provide cross-cutting frames that apply across multiple speak-order cards and trap lane setups.",
      "Glossary term speak-order defined at [[debate-glossary]] — prep sections link here on first use of three-way or speak-order jargon.",
    ],
    sidebarFacts: [
      { label: "Question bank", value: "35 expected questions" },
      { label: "Layers", value: "Kelly · Hammer · Pakko" },
      { label: "Gate", value: "Claims tier per question" },
    ],
    seeAlso: ["debate-night-cheat-sheet", "pakko-contrast-gate", "debate-glossary"],
    relatedRoutes: [{ href: "/admin/intelligence/sos-debate-questions", label: "Expected questions" }],
  },
  {
    slug: "ipad-candidate-ux",
    title: "iPad candidate UX",
    phaseId: "phase-b",
    category: "Candidate UX",
    summary: "Refactor bottom nav — remove alignment profile from primary bar; gate staff Kelly research.",
    body: [
      "NEXT_PUBLIC_CANDIDATE_IPAD_MODE enables touch targets and bottom nav. Phase B moves Kelly alignment profile to More menu only — primary bar: Debate command, SOS questions, Trap lanes, Cheat sheet.",
      "Staff-only surfaces (Kelly mirror, morning brief depth, action queue, agent tooling) gated behind NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=STAFF — candidates never see violet lane chips.",
      "Glossary links from prep sections open in 320px slide-over panel — preserves rehearsal context on iPad without full navigation.",
      "Debate-night cheat sheet scroll mode uses sticky speak-order header — thumb-reachable pivot buttons at bottom safe area on candidate iPad builds.",
      "Role profile AUTO selects CLERK_WEEK when county clerk audience flag active — reorders bottom nav to clerk week before debate prep.",
      "Canon strip compacts to single gold line on iPad — tap expands Field Book article links; strategy manual hints move to More menu.",
      "See [[role-based-nav-profiles]] for deploy variants and [[debate-glossary]] for candidate-facing term definitions on every prep surface.",
    ],
    sidebarFacts: [
      { label: "Env flag", value: "NEXT_PUBLIC_CANDIDATE_IPAD_MODE" },
      { label: "Nav profile", value: "CANDIDATE default" },
      { label: "Primary bar", value: "4 debate shortcuts" },
    ],
    seeAlso: ["role-based-nav-profiles", "operator-guides-revival", "debate-glossary"],
    relatedRoutes: [{ href: "/admin/intelligence/kelly-debate-coaching", label: "Kelly coaching" }],
  },
  {
    slug: "kim-hammer-stub-promotion",
    title: "Kim Hammer stub promotion",
    phaseId: "phase-c",
    category: "Staff depth",
    summary: "Promote top 10 KH stubs (citation-locker, county-briefings, debate-archive) or remove from candidate nav.",
    body: [
      "Staff-stub render type modules show placeholder until promoted. Phase C either fills content or hides from candidate-facing nav via [[role-based-nav-profiles]].",
      "Priority stubs: citation-locker, county-briefings, debate-archive — pair with [[film-room-mvp]] clip inventory before promoting debate-archive summaries to candidate nav.",
      "Build progress tracks kh-staff-modules at 36% live — 35 of 54 modules remain staff-stub. Phase 5 does not auto-promote stubs; it documents promotion order.",
      "Promotion bar: module must have operator prose, claims gate, and link to Field Book article before leaving stub state.",
      "Debate-week critical path: debate-prep sections, bills act-proof, evidence-command — promote these before long-tail NSI research stubs in the Hammer module map.",
      "Candidate nav must never link to staff-stub hrefs — link audit script flags stub routes in TIER_4 primary nav.",
      "Canon binding on /admin/intelligence/kim-hammer surfaces [[kim-hammer-legislative-record]] — stub modules inherit legislative record gate when personal contrast is blocked.",
    ],
    sidebarFacts: [
      { label: "KH modules", value: "~54 total" },
      { label: "Live", value: "36% at Phase 5" },
      { label: "Priority", value: "Top 10 debate-week" },
    ],
    seeAlso: ["film-room-mvp", "pakko-command-center", "kim-hammer-legislative-record"],
    relatedRoutes: [{ href: "/admin/intelligence/kim-hammer", label: "Hammer command center" }],
  },
  {
    slug: "pakko-command-center",
    title: "Pakko mini command center",
    phaseId: "phase-c",
    category: "Staff depth",
    summary: "Hammer-parity hub for Michael Pakko — scaffold, dossier, diligence, contrast playbook.",
    body: [
      "Live at /admin/intelligence/opponents/michael-packo — mirrors Hammer command center layout for third-candidate findability. Phase 0 front door; Phase C expands module depth.",
      "Modules: executive dossier, quote ledger (PACKO-02), finance scaffold (PACKO-01), contrast vs Kelly, diligence checklist, debate coaching, film room.",
      "Requires [[pakko-contrast-gate]] open for contrast rehearsal — PACKO-01 and PACKO-02 at PARTIAL minimum before personal attack modules unlock.",
      "Speak-order third layer on SOS questions references Pakko elevation policy — do not introduce Pakko in clerk room unless moderator asks.",
      "Diligence hub includes Pakko five-search checklist — same [[court-diligence-protocol]] order as Kelly and Hammer; log outcomes at /admin/intelligence/diligence/michael-packo.",
      "Canon binding on Pakko routes surfaces [[pakko-diligence-checklist]], contrast gate, and this article in the gold strip on every Pakko command center page.",
      "Strategy migration bridge links Pakko hub to manual comms/media chapter — clerk-room elevation rules govern when third-candidate contrast appears on stage.",
    ],
    sidebarFacts: [
      { label: "Route", value: "/admin/intelligence/opponents/michael-packo" },
      { label: "Phase", value: "0 live · C depth" },
      { label: "Gate", value: "PACKO-01/02 PARTIAL" },
    ],
    seeAlso: ["pakko-diligence-checklist", "pakko-contrast-gate", "three-way-speak-order"],
    relatedRoutes: [
      { href: "/admin/intelligence/opponents/michael-packo", label: "Pakko command center" },
      { href: "/admin/intelligence/opponents/dossiers/michael-packo", label: "Pakko dossier" },
    ],
  },
  {
    slug: "cvsgf-ledger-gap",
    title: "CVSGF ledger gap",
    phaseId: "phase-c",
    category: "Election funding",
    summary: "Close remittance totals research gap or lock trap lane 3 to research-question-only.",
    body: [
      "UCC-to-CVSGF remittance totals remain research-question-only in SOS question bank until staff ingests annual county figures from primary budget documents.",
      "Statute pattern VERIFIED; numeric county totals blocked on stage — see [[claims-firewall]]. Trap lane 3 (funding) uses research-question framing exclusively until ledger closes.",
      "Garland $14,340 figure flagged for primary county budget verification — do not cite on stage without VERIFIED ledger row.",
      "75-county budget scrape incomplete — records request drafted; build progress tracks election-funding-cvsgf at 88% with explicit defer flags.",
      "Clerk audience questions on CVSGF get process answers: how remittance works, where to request totals — not fabricated county comparisons.",
      "Election funding drill-downs at /admin/intelligence/election-funding/* document statute anchors and deferred numeric fields separately.",
      "Glossary terms cvsgf and research-question defined at [[debate-glossary]] — link from every funding prep section on first use.",
    ],
    sidebarFacts: [
      { label: "Trap lane", value: "Lane 3 — funding" },
      { label: "Statute", value: "VERIFIED" },
      { label: "Numeric totals", value: "RESEARCH_QUESTION" },
    ],
    seeAlso: ["claims-firewall", "debate-glossary"],
    relatedRoutes: [{ href: "/admin/intelligence/election-funding", label: "Election funding" }],
  },
  {
    slug: "film-room-mvp",
    title: "Film room MVP",
    phaseId: "phase-c",
    category: "Media",
    summary: "Minimum viable clip set per focus bill — index before debate week.",
    body: [
      "Each focus bill gets at least one committee clip plus transcript chunk in film room at /admin/intelligence/film-room — NON_PUBLISHABLE until VERIFIED in claims ledger.",
      "Links from Kim Hammer debate prep and trap lane drill-downs — clip ID must match ledger row before Kelly cites timestamp on stage.",
      "Phase 3 five-layer chrome on film room hub explains clip governance — comms/media manual chapter governs what Kelly may cite on stage from committee video.",
      "Staff ingest workflow: index clip, draft transcript summary, register claims row, set VERIFIED after counsel review on publishable excerpts.",
      "Pakko and Kelly film room scaffolds mirror Hammer layout — empty inventory until PACKO/Kelly clip policy is counsel-approved for debate-week rehearsal.",
      "Field Book promotion: transcript summaries migrate to [[kim-hammer-legislative-record]] only after VERIFIED — never paste raw clip titles as facts.",
      "Glossary term film-room at [[debate-glossary]] — pairs with act-proof drill-downs for offensive rehearsal paths on verified legislative anchors.",
    ],
    sidebarFacts: [
      { label: "Route", value: "/admin/intelligence/film-room" },
      { label: "Publish gate", value: "Claims VERIFIED" },
      { label: "MVP", value: "1 clip + transcript per focus bill" },
    ],
    seeAlso: ["kim-hammer-stub-promotion", "kim-hammer-legislative-record", "debate-glossary"],
    relatedRoutes: [{ href: "/admin/intelligence/film-room", label: "Film room" }],
  },
  {
    slug: "debate-glossary",
    title: "Debate glossary",
    phaseId: "phase-b",
    category: "Reference",
    summary: "Alphabetical intelligence workbench term registry — Wikipedia-style definitions with Field Book and route links.",
    body: [
      "Phase 5 ships the debate glossary index at /admin/intelligence/field-book/glossary — forty-plus terms across governance, debate craft, organization, election ops, opposition, and candidate UX.",
      "Every term includes plain-English definition (40+ characters), optional Field Book slug, and intelligence route href. Search filters by label, definition, or category.",
      "[[plain-language-prep-sections]] requires glossary link on first jargon use — prep writers link [[debate-glossary]] or specific term anchors instead of unexplained acronyms.",
      "Terms cross-link to encyclopedia articles: claims-firewall, three-way-speak-order, cvsgf-ledger-gap, etc. Field Book [[slug]] syntax and glossary term ids share the same slug namespace where possible.",
      "Distinct from volunteer public glossary at /volunteer/resources/glossary — debate glossary is staff and candidate intelligence workbench canon only.",
      "Distinct from county Wikipedia ingest — CC BY-SA county reference is RAG advisory for visit prep, not debate craft or stage-line canon.",
      "Canon strip on glossary index binds to this article plus [[strategy-migration]] — promote new terms into DEBATE_GLOSSARY_TERMS registry after staff review.",
    ],
    sidebarFacts: [
      { label: "Terms", value: "40+ at Phase 5 bar" },
      { label: "Index route", value: "/admin/intelligence/field-book/glossary" },
      { label: "Categories", value: "6" },
    ],
    seeAlso: ["plain-language-prep-sections", "five-block-drill-template", "strategy-migration"],
    relatedRoutes: [
      { href: "/admin/intelligence/field-book/glossary", label: "Glossary index" },
      { href: "/admin/intelligence/phase-5-upgrade", label: "Phase 5 upgrade" },
    ],
  },
  {
    slug: "debate-ready-governance",
    title: "Debate-ready governance",
    phaseId: "phase-c",
    category: "Governance",
    summary: "Phase 6 pass — prep encounter depth, trap lane rebuttals, claims review wave, and priority Hammer module promotion before stage.",
    body: [
      "Phase 6 closes the debate-ready governance gap between intelligence content and stage-safe rehearsal. All 28 debate prep drill-downs now ship section-specific encounter depth via PREP_SECTION_ENCOUNTER_DEPTH — what Hammer will do, how Kelly handles it, and culture-war pivots where relevant.",
      "Checklist-style prep sections (opening, closing, retrieval queue, closing checklist) receive default rebuttal scripts and rehearsal steps through phase6PrepSectionCompletion — so build progress no longer flags empty rebuttal arrays on non-debate meta sections.",
      "Trap lanes fraud-data-dare and experience-equals-sos-ready now include full rebuttalScripts and five whatToExpectHammerToSay lines — bringing trap lane bar from 67% to 100% on build progress.",
      "Ten priority Kim Hammer modules promote from staff-stub to live render specs: debate-archive, county-briefings, citation-locker, debate-packet-export, narrative-drift-monitor, attack-surface, response-model, pattern-analysis, debate-ai-workbench, intel-heat-map.",
      "Claims review wave panel on /admin/intelligence/phase-6-upgrade surfaces NEEDS_REVIEW rows with approve-internal and require-evidence actions wired to /api/admin/intelligence/claim-review — staff clears the firewall before Kelly rehearses blocked lines.",
      "Diligence logs remain operator-driven NOT_SEARCHED until staff executes five-search order — Phase 6 documents counsel frame but does not fabricate CLEAN search outcomes. Incomplete diligence frames still govern stage claims per [[counsel-review-frame]].",
      "Canon binding on phase-6-upgrade surfaces this article plus [[debate-glossary]] and [[claims-firewall]] — promote verified governance prose into Field Book after claims tier closes.",
    ],
    sidebarFacts: [
      { label: "Prep sections", value: "28/28 encounter depth" },
      { label: "Trap lanes", value: "6/6 rebuttal bar" },
      { label: "KH promoted", value: "10 priority modules" },
      { label: "Hub", value: "/admin/intelligence/phase-6-upgrade" },
    ],
    seeAlso: ["debate-glossary", "claims-firewall", "counsel-review-frame", "kim-hammer-stub-promotion"],
    relatedRoutes: [
      { href: "/admin/intelligence/phase-6-upgrade", label: "Phase 6 upgrade" },
      { href: "/admin/intelligence/claims", label: "Claims ledger" },
      { href: "/admin/intelligence/kim-hammer/debate-prep", label: "Debate prep" },
    ],
  },
  {
    slug: "dossier-diligence-closure",
    title: "Dossier briefing closure + diligence runbook",
    phaseId: "phase-c",
    category: "Governance",
    summary: "Phase 7 pass — briefing-book bar on all dossier sections, five-search operator runbook, CVSGF transparency frame, and second-wave Hammer module promotion.",
    body: [
      "Phase 7 closes the gap between dossier intelligence content and debate-week briefing-book readiness. Read-time enrichment via phase7DossierBriefingEnrichment ensures every Kelly, Hammer, and Pakko dossier section meets the Phase 1 bar: two narrative paragraphs of thirty-five or more words plus at least one debate script.",
      "The five-search diligence operator runbook documents counsel-safe steps for Kelly, Hammer, and Pakko diligence logs — civil, criminal, UCC, business entity, and property tax — without fabricating CLEAN outcomes. Incomplete pivots govern stage lines until staff logs real search results per [[counsel-review-frame]].",
      "Election funding sections receive phase7ElectionFundingEnrichment at read time: speak from verified statute and appropriation totals, defer county-by-county award lines until SOS publishes a master ledger, and never imply fraud without sourced disbursement records.",
      "Ten second-wave Kim Hammer modules promote from staff-stub to live render specs: audit-log, export-control-center, narrative-state, kh3-operational, modern-sos-contrast, bill-relationship-graph, timeline-heatmap, profile, electoral-history, media-footprint — twenty total with Phase 6 wave one.",
      "Phase 7 hub at /admin/intelligence/phase-7-upgrade surfaces DiligenceRunbookPanel and Phase7UpgradePassPanel — pair with candidate-dossiers hub and diligence hub before ACCA Mountain View.",
      "Claims ledger NEEDS_REVIEW rows remain operator-driven — Phase 7 does not auto-verify claims. Staff clears the firewall through claim-review API before Kelly rehearses blocked lines.",
      "Canon binding on phase-7-upgrade surfaces this article plus [[debate-ready-governance]] and [[cvsgf-ledger-gap]] — promote verified dossier prose into Field Book after counsel review.",
    ],
    sidebarFacts: [
      { label: "Dossier bar", value: "95%+ overall · 90%+ per candidate" },
      { label: "Diligence runbook", value: "15 operator guides" },
      { label: "KH wave 2", value: "10 promoted modules" },
      { label: "Hub", value: "/admin/intelligence/phase-7-upgrade" },
    ],
    seeAlso: ["debate-ready-governance", "counsel-review-frame", "cvsgf-ledger-gap", "kim-hammer-stub-promotion"],
    relatedRoutes: [
      { href: "/admin/intelligence/phase-7-upgrade", label: "Phase 7 upgrade" },
      { href: "/admin/intelligence/candidate-dossiers", label: "Dossier briefing book" },
      { href: "/admin/intelligence/diligence", label: "Diligence hub" },
    ],
  },
  {
    slug: "acca-summer-conference-2026",
    title: "ACCA Summer Conference 2026 — Mountain View",
    phaseId: "phase-b",
    category: "County clerks",
    summary: "Arkansas County Clerks Association continuing-education conference Jun 10–12 at Ozark Mountain Folk Center — SOS candidates panel Thu Jun 11 1–3pm.",
    body: [
      "The ACCA Continuing Education Summer Conference is Kelly's highest-value clerk audience before general election — county clerks, election commissioners, quorum court members, vendors, and state agencies in one room at Mountain View.",
      "Theme: Honoring the Past. Serving the Present. Shaping the Future — RED, WHITE & BLUE. This is continuing education, not cable news. Kelly wins by sounding like a statewide SOS partner who publishes rules clerks can execute.",
      "Headline event: Thu Jun 11, 1:00–3:00pm — two-hour Secretary of State Candidates Moderated Panel Q&A with Kim Hammer (R), Kelly Grappe (D), and Dr. Michael Pakko (L). ES&S is platinum sponsor — pair integrity talk with CVSGF grant transparency, not vendor bashing.",
      "Phase 8 adds phase8AccaPanelEnrichment on all thirteen conference depth sections and an eight-step operator runbook from T-7 through post-panel debrief. Max three trap questions in curious tone; respect Pakko; never attack Hammer faith.",
      "Staff day-of checklist, hammer-traps-clerk-room, three-way-panel-geometry, and cvsgf-for-clerks sections are mandatory pre-read before panel. Moderator name remains NEEDS_RESEARCH until AAC confirms.",
      "Next ACCA conference: Sep 9–11, 2026 Benton Events Center — add to campaign calendar at panel close.",
    ],
    sidebarFacts: [
      { label: "Panel", value: "Thu Jun 11 · 1–3pm" },
      { label: "Venue", value: "Ozark Mountain Folk Center" },
      { label: "Candidates", value: "Hammer · Grappe · Pakko" },
      { label: "Route", value: "/admin/intelligence/county-clerk-week/acca-summer-conference" },
    ],
    seeAlso: ["dossier-research-acca-closure", "cvsgf-ledger-gap", "counsel-review-frame"],
    relatedRoutes: [
      { href: "/admin/intelligence/county-clerk-week/acca-summer-conference", label: "ACCA hub" },
      { href: "/admin/intelligence/phase-8-upgrade", label: "Phase 8 upgrade" },
    ],
  },
  {
    slug: "dossier-research-acca-closure",
    title: "Dossier research depth + ACCA panel closure",
    phaseId: "phase-c",
    category: "Governance",
    summary: "Phase 8 pass — sourced research corpus on all candidate dossier sections, ACCA Mountain View panel operator runbook, and third-wave Hammer module promotion.",
    body: [
      "Phase 8 replaces thin dossier scaffolding with a sourced research corpus. kellyDossierResearchDepth and opponentDossierResearchDepth overlays merge at read time via applyCandidateDossierResearchDepth — each section gains additional narrative paragraphs, sourced facts, field research notes, and walkthrough steps drawn from opposition JSON, public-record brief, road stories, bill index, and bio timelines.",
      "Three new Kelly sections (career timeline, public-record defensive, road stories fieldbook), two new Hammer sections (2021 six-bill deep, background pastoral), and one new Pakko section (economist platform) expand the briefing book to thirty-four total narrative sections with research depth panels visible in the dossier UI.",
      "ACCA Mountain View Thu Jun 11 panel prep receives phase8AccaPanelEnrichment at read time — every conference depth section meets panel-prep bar with howToPresentInPanel or staffActions checklist. phase8AccaPanelOperatorRunbook documents eight operator steps from T-7 through T+24h post-panel debrief.",
      "Ten third-wave Kim Hammer modules promote from staff-stub to live render specs: geographic-narrative-intelligence, narrative-usage-analytics, management-capacity, network-influence, vulnerability-matrix-kh3, narrative-testing, county-exposure, public-timeline, public-controversies, kh4-agent-tools — thirty total with Phase 6 and 7 waves.",
      "Phase 8 hub at /admin/intelligence/phase-8-upgrade surfaces AccaPanelPrepPanel and Phase8UpgradePassPanel — pair with candidate-dossiers hub and county-clerk-week/acca-summer-conference before panel day.",
      "Diligence logs and claims NEEDS_REVIEW rows remain operator-driven — Phase 8 documents ACCA panel scripts but does not fabricate CLEAN search outcomes or auto-verify claims.",
      "Canon binding on phase-8-upgrade surfaces this article plus [[dossier-diligence-closure]] and [[acca-summer-conference-2026]] — promote verified panel prose into Field Book after ACCA debrief.",
    ],
    sidebarFacts: [
      { label: "Dossier sections", value: "34 with research corpus" },
      { label: "ACCA panel", value: "Thu Jun 11 · Mountain View" },
      { label: "KH wave 3", value: "10 promoted modules" },
      { label: "Hub", value: "/admin/intelligence/phase-8-upgrade" },
    ],
    seeAlso: ["dossier-diligence-closure", "acca-summer-conference-2026", "counsel-review-frame"],
    relatedRoutes: [
      { href: "/admin/intelligence/phase-8-upgrade", label: "Phase 8 upgrade" },
      { href: "/admin/intelligence/candidate-dossiers", label: "Dossier briefing book" },
      { href: "/admin/intelligence/county-clerk-week/acca-summer-conference", label: "ACCA conference" },
    ],
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
      "Phase 4 canon loop binds each intelligence route to Field Book slugs — the gold canon strip on every page shows which encyclopedia entries govern that surface. See [[strategy-migration]] for manual promotion workflow.",
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
      "Phase 4 canon strip shows lane badge on every bound route — role profile only changes which lanes appear in sidebar, not which Field Book articles govern a page.",
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
      "strategyMigrationBridge.ts maps each intelligence route to strategy manual pathKeys (framework, build-audit, comms-media, etc.) — staff uses strategy-alignment dashboard to preview chunks before canon promotion.",
      "Phase 4 upgrade pass tracks binding count (18+ routes), Phase D article depth, and strategy bridge coverage. Exit signal: route bindings + strategy migration live on Netlify.",
    ],
    sidebarFacts: [
      { label: "Manual chunks", value: "2,795" },
      { label: "Target readiness", value: "~98% intelligence" },
      { label: "Canon bindings", value: "18+ route prefixes" },
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
      "When [[hammer-diligence-checklist]] is incomplete, stay on enrolled acts and committee record — not personal speculation or unsourced court narratives on stage.",
      "Pairs with trap lanes and film room clips — legislative record is the primary offensive surface when court searches are NOT_SEARCHED across all counties.",
      "Bill act-proof drill-downs at /admin/intelligence/kim-hammer/bills/*/act-proof provide VERIFIED anchors for contrast framing, trap lane step coverage, and debate briefing enrichment.",
      "Kim Hammer module map (~54 modules) organizes research by theme — promote module summaries into this Field Book article as each reaches briefing depth on build progress.",
      "Offensive diligence follows counsel gate on any court hit — legislative votes alone do not require counsel but must match claims ledger classification.",
      "Canon loop binding on /admin/intelligence/kim-hammer and opponent dossier routes surfaces this article in the gold strip on staff research pages.",
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
    "/admin/intelligence/field-book/glossary",
    ...FIELD_BOOK_PHASES.map((p) => p.href),
    ...FIELD_BOOK_ARTICLES.map((a) => `${FIELD_BOOK_HUB_HREF}/${a.slug}`),
  ];
}
