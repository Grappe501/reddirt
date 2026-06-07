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
      "Phase 9 doubles dossier and ACCA narrative corpus at read time — kellyDossierDepthExpansion, opponentDossierDepthExpansion, and accaConferenceDepthExpansion merge via applyDossierDepthExpansion so every section carries fourteen or more narrative paragraphs and eight or more sourced facts before panel day.",
      "Next ACCA conference: Sep 9–11, 2026 Benton Events Center — add to campaign calendar at panel close and capture clerk feedback from Mountain View for Field Book promotion after debrief.",
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
    slug: "strategy-philosophy-command",
    title: "Strategy & political philosophy command",
    phaseId: "phase-c",
    category: "Governance",
    summary:
      "Phase 10 pass — unified inventory of debate philosophy briefings, psychology manual, civic philosophy graph, Kelly strategic plan manual, and intelligence strategy surfaces at Phase 9 depth standard.",
    body: [
      "Phase 9 closed the dossier-to-debate spine gap. Phase 10 closes the strategy-to-intelligence gap: every debate political philosophy briefing, psychology manual section, and civic philosophy graph node receives Phase 10 depth overlays at read time via applyPhase10StrategyPhilosophy.",
      "Eight debate philosophy briefings (agree-but-never-only-agree through direct-democracy-offense) gain extended core philosophy, framework chapter crosswalks, psychology section links, and intelligence surface links. Hub at /admin/intelligence/strategy-philosophy-hub surfaces full inventory.",
      "Nineteen psychology manual sections crosswalk to philosophy briefings and Kelly manual chapters (framework, executive-summary, build-audit). kellyApplication arrays append strategy notes at getter time.",
      "Eight NSI-4 civic philosophy graph nodes (civic trust through direct democracy) enrich with debateApplication, kellySosFraming, strategyCrosswalk, and intelligenceLinks — visible on strategy-philosophy-hub and campaign-intelligence-graph.",
      "Kelly SOS strategic plan manual (22 chapters) — intelligence reader at /admin/intelligence/kelly-strategic-plan with Phase 11 P1 overlays on every chapter.",
      "Strategy migration bridge extended with debate-briefings, strategic-target-pathway, campaign-intelligence-graph, scenario-simulation, and strategy-philosophy-hub routes — 37 total intelligence bindings.",
      "Canon binding on strategy-philosophy-hub surfaces this article plus [[debate-glossary]] and [[strategy-migration]] — pair with opposition-strategy and strategy-alignment before major strategy decisions.",
    ],
    sidebarFacts: [
      { label: "Philosophy briefings", value: "8 enriched" },
      { label: "Psychology sections", value: "19 crosswalked" },
      { label: "Graph nodes", value: "8 enriched" },
      { label: "Hub", value: "/admin/intelligence/strategy-philosophy-hub" },
    ],
    seeAlso: ["strategy-migration", "debate-glossary", "debate-instruction-bridge"],
    relatedRoutes: [
      { href: "/admin/intelligence/strategy-philosophy-hub", label: "Strategy & philosophy hub" },
      { href: "/admin/intelligence/debate-briefings", label: "Philosophy briefings" },
      { href: "/admin/campaign-strategy/framework", label: "Theory of change" },
    ],
  },
  {
    slug: "campaign-system-manual-command",
    title: "Campaign system manual command",
    phaseId: "phase-c",
    category: "Governance",
    summary:
      "Phase 11 P0 pass — 252 operational documents surfaced in intelligence with category inventory, browsable reader, and priority tome guides.",
    body: [
      "Phase 10 catalogued strategy and philosophy surfaces but left the campaign-system manual as a single agent-chunked entry. Phase 11 P0 closes that gap: every markdown file under campaign-system-manual/ is inventoried and readable at /admin/intelligence/campaign-system-manual.",
      "Eight category guides (root tomes, chapters, playbooks, roles, workflows, inventories, maps, web presentation) include operator use notes and intelligence cross-links — morning brief, scenario simulation, strategy hub, claims ledger, Field Book canon.",
      "Priority tomes flagged for staff prep include CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL, SIMULATION_AND_FORECASTING_SYSTEM_PLAN, CAMPAIGN_TOOL_STACK_OPERATING_SYSTEM_MAP, WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM, and ANYONE_CAN_ONBOARD_CAMPAIGN_CULTURE_AND_PATHWAY_SYSTEM — start here before debate-week deep dives.",
      "Strategy Partner RAG and /api/admin/campaign-strategy/chunks remain for agent retrieval — intelligence reader is the human browse path before Field Book promotion batches.",
      "Canon binding on campaign-system-manual hub surfaces this article plus [[strategy-migration]] and [[strategy-philosophy-command]] — no chunk promotes to Field Book body until claims VERIFIED.",
      "Phase 11 upgrade hub at /admin/intelligence/phase-11-upgrade tracks file count, category coverage, migration bridge wiring, and P0 exit metrics before P1 Kelly plan surfacing.",
    ],
    sidebarFacts: [
      { label: "Files", value: "252 surfaced" },
      { label: "Categories", value: "8 guides" },
      { label: "Hub", value: "/admin/intelligence/campaign-system-manual" },
      { label: "Lane", value: "Staff · violet" },
    ],
    seeAlso: ["strategy-migration", "strategy-philosophy-command", "three-lane-nav"],
    relatedRoutes: [
      { href: "/admin/intelligence/campaign-system-manual", label: "Campaign system hub" },
      { href: "/admin/intelligence/phase-11-upgrade", label: "Phase 11 upgrade" },
      { href: "/admin/intelligence/strategy-philosophy-hub", label: "Strategy & philosophy hub" },
    ],
  },
  {
    slug: "kelly-strategic-plan-command",
    title: "Kelly SOS strategic plan command",
    phaseId: "phase-c",
    category: "Governance",
    summary:
      "Phase 11 P1 pass — 22-chapter Kelly SOS strategic plan in intelligence tree with full chapter depth overlays.",
    body: [
      "Phase 10 enriched three Kelly manual chapters in strategy-philosophy inventory but the reader remained at /admin/campaign-strategy outside the intelligence tree. Phase 11 P1 surfaces all 22 chapters at /admin/intelligence/kelly-strategic-plan.",
      "Every chapter receives Phase 11 P1 overlay: strategicRole, debateApplication, operatorSteps, intelligenceLinks, and linkedPhilosophyBriefingIds where applicable — visible in KellyStrategicPlanChapterPanel above markdown.",
      "Foundation chapters (framework, executive-summary, build-audit, LANE) anchor debate philosophy briefings. Program chapters crosswalk to opposition narrative-testing bill categories, county clerk week, and campaign-system workflows.",
      "Legacy admin reader at /admin/campaign-strategy retains Strategy Partner RAG — intelligence reader is the debate-week browse path with canon strip and Field Book promotion workflow.",
      "Canon binding on kelly-strategic-plan hub surfaces this article plus [[strategy-philosophy-command]] and [[strategy-migration]] — chapter prose promotes to Field Book only after claims VERIFIED.",
      "Phase 11 P1 upgrade hub at /admin/intelligence/phase-11-p1-upgrade tracks chapter overlay completion — all 22 chapters must reach the briefing bar before P2 movement philosophy.",
    ],
    sidebarFacts: [
      { label: "Chapters", value: "22 enriched" },
      { label: "Hub", value: "/admin/intelligence/kelly-strategic-plan" },
      { label: "Spine", value: "framework theory-of-change" },
      { label: "Lane", value: "Kelly · emerald" },
    ],
    seeAlso: ["strategy-philosophy-command", "strategy-migration", "debate-glossary"],
    relatedRoutes: [
      { href: "/admin/intelligence/kelly-strategic-plan", label: "Kelly strategic plan hub" },
      { href: "/admin/intelligence/kelly-strategic-plan/framework", label: "Theory of change" },
      { href: "/admin/intelligence/phase-11-p1-upgrade", label: "Phase 11 P1 upgrade" },
    ],
  },
  {
    slug: "movement-philosophy-command",
    title: "Movement philosophy command",
    phaseId: "phase-c",
    category: "Governance",
    summary:
      "Phase 11 P2 pass — public philosophy corpus (docs/philosophy + VOL-CORE-1) surfaced in intelligence with debate and volunteer overlays.",
    body: [
      "Phase 10 catalogued debate philosophy briefings and Kelly manual chapters but left docs/philosophy and volunteer-philosophy-foundation.md unwired. Phase 11 P2 closes that gap at /admin/intelligence/movement-philosophy.",
      "Five documents: philosophy index, vision-and-goals, core-principles, positioning-and-coalition, and volunteer-philosophy-foundation (VOL-CORE-1). Each receives P2 overlay — movementRole, debateApplication, volunteerSystemImplications, intelligenceLinks.",
      "VOL-CORE-1 is authoritative tone source for volunteer AI and onboarding — engineering must not paraphrase for edge; cross-read core-principles before copy changes.",
      "Debate command philosophy readiness feed reads movement doc completion % — stage tone must match calm-steady-leadership and clarity-without-cynicism from corpus.",
      "Canon binding on movement-philosophy hub surfaces this article plus [[strategy-philosophy-command]] and [[strategy-migration]] — public philosophy promotes to Field Book only after claims VERIFIED.",
      "Phase 11 P2 upgrade hub at /admin/intelligence/phase-11-p2-upgrade tracks doc overlay completion (5/5 at bar) and staff strategy wiring.",
    ],
    sidebarFacts: [
      { label: "Documents", value: "5 surfaced" },
      { label: "Hub", value: "/admin/intelligence/movement-philosophy" },
      { label: "VOL-CORE", value: "VOL-CORE-1 bound" },
      { label: "Lane", value: "Movement · indigo" },
    ],
    seeAlso: ["strategy-philosophy-command", "staff-strategy-command", "strategy-migration"],
    relatedRoutes: [
      { href: "/admin/intelligence/movement-philosophy", label: "Movement philosophy hub" },
      { href: "/admin/intelligence/movement-philosophy/core-principles", label: "Core principles" },
      { href: "/admin/intelligence/phase-11-p2-upgrade", label: "Phase 11 P2 upgrade" },
    ],
  },
  {
    slug: "staff-strategy-command",
    title: "Staff strategy command",
    phaseId: "phase-c",
    category: "Governance",
    summary:
      "Phase 11 P2 pass — morning brief, briefing papers, writing toolbox, and NSI pathway/graph/simulation wired with operator overlays and migration bridge.",
    body: [
      "Campaign-system manual P0 surfaced WORKBENCH_MORNING_BRIEF and MESSAGE_CREATION_TO_DISTRIBUTION tomes but staff intelligence surfaces lacked unified command hub. Phase 11 P2 opens /admin/intelligence/staff-strategy-command.",
      "Six surfaces enriched: morning-brief (NSI-7), briefing-papers, writing-toolbox, strategic-target-pathway (NSI-7), campaign-intelligence-graph (NSI-4), scenario-simulation — each with strategicRole, operatorUse, debateApplication, and intelligence cross-links.",
      "Staff lane pairs live surfaces with campaign-system-manual refs — morning brief ↔ WORKBENCH_MORNING_BRIEF; briefing papers ↔ MESSAGE_CREATION_TO_DISTRIBUTION; pathway/simulation ↔ SIMULATION_AND_FORECASTING_SYSTEM_PLAN.",
      "Debate philosophy readiness feed includes staff surface completion % — thin morning brief rollups flag debate prep gaps before candidate briefings.",
      "Canon bindings on each staff surface route surface this article plus [[strategy-migration]] — staff prose promotes to Field Book only through claims gate.",
      "Migration bridge extended for all six surfaces plus staff-strategy-command hub — closes Phase 10 unbound href gaps for staff lane strategy inventory.",
    ],
    sidebarFacts: [
      { label: "Surfaces", value: "6 enriched" },
      { label: "Hub", value: "/admin/intelligence/staff-strategy-command" },
      { label: "NSI", value: "NSI-4 + NSI-7" },
      { label: "Lane", value: "Staff · violet" },
    ],
    seeAlso: ["campaign-system-manual-command", "movement-philosophy-command", "strategy-migration"],
    relatedRoutes: [
      { href: "/admin/intelligence/staff-strategy-command", label: "Staff strategy hub" },
      { href: "/admin/intelligence/morning-brief", label: "Morning brief" },
      { href: "/admin/intelligence/phase-11-p2-upgrade", label: "Phase 11 P2 upgrade" },
    ],
  },
  {
    slug: "strategy-doctrine-command",
    title: "Strategy doctrine JSON command",
    phaseId: "phase-c",
    category: "Governance",
    summary:
      "Phase 11 P3 pass — nine SDI-1 JSON artifacts surfaced in intelligence with debate and alignment overlays.",
    body: [
      "Phase 10 wired strategy alignment dashboard but left data/strategy-doctrine/ JSON files as loader-only inputs — not individually browsable in intelligence. Phase 11 P3 closes that gap at /admin/intelligence/strategy-doctrine.",
      "Nine artifacts: registry, Steve doctrine, grassroots principles, relational organizing, event visibility, GOTV calendar, poll watcher model, county source index, Rockefeller case study.",
      "Every artifact receives P3 overlay: strategicRole, debateApplication, alignmentUse, reviewGate, and intelligence cross-links to strategy alignment, debate command, and claims ledger.",
      "Registry file indexes all doctrines with reviewStatus — APPROVED_FOR_INTERNAL_USE vs NEEDS_REVIEW governs external debate use and stage-safe promotion into Field Book canon.",
      "Canon binding on strategy-doctrine hub surfaces this article plus [[strategy-philosophy-command]] and [[strategy-migration]] — doctrine JSON promotes to Field Book only after steward approval.",
      "Phase 11 P3 upgrade hub at /admin/intelligence/phase-11-p3-upgrade tracks 9/9 artifact overlay completion and SDI-1 registry alignment before philosophy graph claims review.",
    ],
    sidebarFacts: [
      { label: "Artifacts", value: "9 surfaced" },
      { label: "Hub", value: "/admin/intelligence/strategy-doctrine" },
      { label: "SDI", value: "SDI-1 registry" },
      { label: "Lane", value: "Strategy · amber" },
    ],
    seeAlso: ["strategy-philosophy-command", "strategy-migration", "movement-philosophy-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/strategy-doctrine", label: "Strategy doctrine hub" },
      { href: "/admin/intelligence/strategy-doctrine/steve-strategy-doctrine", label: "Steve doctrine" },
      { href: "/admin/intelligence/phase-11-p3-upgrade", label: "Phase 11 P3 upgrade" },
    ],
  },
  {
    slug: "kelly-prep-week-command",
    title: "Kelly prep week command",
    phaseId: "phase-d",
    category: "Canon",
    summary:
      "Phase 15 P2 pass — seven-day orchestrated candidate prep path mirroring clerk-week sequencing for debate prep.",
    body: [
      "Phase 15 P0 collapsed nav into five sections; P1 unified command home. Phase 15 P2 closes the orchestration gap Kelly felt — a guided week instead of eighty links.",
      "Seven days: philosophy framing, trap lanes 1–3, SOS question drills, opposition + claims, three-way geometry, full simulation, and claims-only rest day.",
      "Each day lists ordered reads with minutes, extract goals, rehearsal out loud lines, and success checks — same pattern as county clerk seven-day path.",
      "Hub at /admin/intelligence/kelly-prep-week with per-day pages and progress state in kelly-prep-week-state.json Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Wired into candidate Home nav section and command home compact panel — staff uses supreme workbench; Kelly uses prep week.",
      "Canon binding surfaces this article plus [[claims-firewall]] and [[debate-instruction-bridge]] on prep week routes Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Prep days", value: "7 wired" },
      { label: "Hub", value: "/admin/intelligence/kelly-prep-week" },
      { label: "Reads", value: "24+ ordered" },
      { label: "Lane", value: "Command · indigo" },
    ],
    seeAlso: ["claims-firewall", "debate-instruction-bridge", "phase-11-stack-closure-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/kelly-prep-week", label: "Prep week hub" },
      { href: "/admin/intelligence", label: "Command home" },
      { href: "/admin/intelligence/phase-15-p2-upgrade", label: "Phase 15 P2 upgrade" },
      { href: "/admin/intelligence/county-clerk-week", label: "Clerk week path (parallel)" },
    ],
  },
  {
    slug: "stage-safe-filter-command",
    title: "Stage-safe filter command",
    phaseId: "phase-d",
    category: "Governance",
    summary:
      "Phase 15 P3 pass — candidate profile redacts NEEDS_REVIEW rehearse lines on trap lanes, SOS questions, and coaching scripts.",
    body: [
      "Phase 15 P0+P1 collapsed nav and unified command home; P2 added Kelly prep week. P3 closes the buyability gap where Kelly could still read unverified scripts on candidate deploy.",
      "Candidate and clerk-week profiles evaluate each surface claimsGate — NEEDS_REVIEW, VERIFY, GENERAL_FRAME, and RESEARCH_QUESTION gates block operator scripts.",
      "Blocked cards show StageSafeBlockedPanel with research-question framing and link to [[claims-firewall]] — opponent expectations and trap mechanics stay visible.",
      "Trap lane drill-downs redact sample scripts, rebuttals, zingers, and Kelly pivot when gated. SOS questions redact speak-order scripts and quick answers.",
      "Kelly debate coaching ScriptCard uses the same filter — staff profile (NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=STAFF) shows full scripts Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Inventory hub at /admin/intelligence/stage-safe-filter lists every gated surface with claims gate string and clear vs blocked badge Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Profiles gated", value: "CANDIDATE · CLERK_WEEK" },
      { label: "Hub", value: "/admin/intelligence/stage-safe-filter" },
      { label: "Surfaces", value: "Traps · SOS · coaching" },
      { label: "Lane", value: "Safety · rose" },
    ],
    seeAlso: ["claims-firewall", "debate-ready-governance", "kelly-prep-week-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/stage-safe-filter", label: "Filter hub" },
      { href: "/admin/intelligence/claims", label: "Claims ledger" },
      { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
      { href: "/admin/intelligence/phase-15-p3-upgrade", label: "Phase 15 P3 upgrade" },
    ],
  },
  {
    slug: "top-tier-prep-command",
    title: "Top-tier prep command",
    phaseId: "phase-d",
    category: "Canon",
    summary:
      "Phase 15 P4 pass — eight briefings, five depth guides, and eight psychology sections promoted to command home.",
    body: [
      "Phase 15 P0–P3 collapsed nav, unified home, prep week, and stage-safe filter. P4 closes the surfacing gap — Kelly's best philosophy content was buried under Philosophy nav while builder dashboards dominated attention.",
      "Twenty-one surfaces promoted at /admin/intelligence/top-tier-prep: tier A briefings and depth, tier B psychology sections with rehearse-out-loud lines Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Command home shows top five promoted reads in CandidateTopTierStrip — minutes estimate and direct links, not a flat index.",
      "Home nav links Top-tier prep first; Philosophy section points here before the full briefing library Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Kelly prep week day-1 philosophy reads cross-link to promoted briefings — same orchestration pattern as clerk week Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[debate-ready-governance]] and [[kelly-prep-week-command]] on top-tier routes Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Promoted", value: "8+5+8 surfaces" },
      { label: "Hub", value: "/admin/intelligence/top-tier-prep" },
      { label: "Home strip", value: "Top 5 tonight" },
      { label: "Lane", value: "Philosophy · violet" },
    ],
    seeAlso: ["kelly-prep-week-command", "debate-ready-governance", "stage-safe-filter-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/top-tier-prep", label: "Top-tier hub" },
      { href: "/admin/intelligence/debate-briefings", label: "Briefing library" },
      { href: "/admin/intelligence", label: "Command home" },
      { href: "/admin/intelligence/phase-15-p4-upgrade", label: "Phase 15 P4 upgrade" },
    ],
  },
  {
    slug: "evidence-honesty-command",
    title: "Evidence honesty command",
    phaseId: "phase-d",
    category: "Governance",
    summary:
      "Phase 15 P5 pass — unified VERIFIED / NEEDS_REVIEW / NON_PUBLISHABLE badges on film room, briefings, opposition, and rehearse surfaces.",
    body: [
      "Phase 15 P0–P4 collapsed nav, unified home, prep week, stage-safe filter, and top-tier surfacing. P5 closes the honesty gap — Kelly could still read proof language before seeing evidence tier.",
      "Eight surface categories tagged at /admin/intelligence/evidence-honesty: film room drills, briefing papers, opposition strategy, morning brief, trap lanes, SOS bank, debate coaching, and claims ledger.",
      "EvidenceHonestyBadge component resolves tier from claimsGate strings, speaker verification, and confidence labels — Kelly sees badge before rehearse or cite language.",
      "Film room media drills and clip rows show per-drill badges; trap/SOS/coaching drill-downs pair ClaimsGateBanner with honesty badge Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Command home CandidateEvidenceHonestyStrip reminds Kelly to read badge before any line with proof language Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[claims-firewall]] and [[stage-safe-filter-command]] on evidence honesty routes Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Surfaces", value: "8 categories" },
      { label: "Hub", value: "/admin/intelligence/evidence-honesty" },
      { label: "Tiers", value: "Verified · review · draft" },
      { label: "Lane", value: "Safety · amber" },
    ],
    seeAlso: ["claims-firewall", "stage-safe-filter-command", "top-tier-prep-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/evidence-honesty", label: "Honesty hub" },
      { href: "/admin/intelligence/claims", label: "Claims ledger" },
      { href: "/admin/intelligence/film-room", label: "Film room" },
      { href: "/admin/intelligence/phase-15-p5-upgrade", label: "Phase 15 P5 upgrade" },
    ],
  },
  {
    slug: "demo-mode-command",
    title: "Demo mode command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 15 P6 pass — purchase-ready demo with seeded tonight scenario and 15-minute walkthrough script.",
    body: [
      "Phase 15 P0–P5 collapsed nav, unified home, prep week, stage-safe filter, top-tier surfacing, and evidence honesty. P6 closes the buyability gap — buyers saw builder progress, not a coached purchase walkthrough.",
      "Seeded scenario at /admin/intelligence/demo-mode: ACCA summer conference panel — Jun 11 Mountain View — clerk-room audience with 20-minute prep path.",
      "Seven-step script (~15 minutes): command home orient, trap lane, philosophy briefing, opposition contrast, clerk pocket card, iPad deploy note, staff backstage close.",
      "Each step links to live intelligence routes with buyer line and staff note — not a slide deck, a product tour.",
      "Set NEXT_PUBLIC_INTELLIGENCE_DEMO_MODE=true with NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=CANDIDATE on Netlify preview for purchase demos Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Command home CandidateDemoModeStrip reminds staff to run the script; IntelligenceDemoModeBanner shows when demo env is live Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[evidence-honesty-command]] and [[kelly-prep-week-command]] on demo mode routes Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Script", value: "7 steps · ~15 min" },
      { label: "Hub", value: "/admin/intelligence/demo-mode" },
      { label: "Scenario", value: "ACCA panel tonight" },
      { label: "Env", value: "NEXT_PUBLIC_INTELLIGENCE_DEMO_MODE" },
    ],
    seeAlso: ["evidence-honesty-command", "kelly-prep-week-command", "top-tier-prep-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/demo-mode", label: "Demo hub" },
      { href: "/admin/intelligence", label: "Command home" },
      { href: "/admin/intelligence/county-clerk-week/acca-summer-conference", label: "ACCA panel prep" },
      { href: "/admin/intelligence/phase-15-p6-upgrade", label: "Phase 15 P6 upgrade" },
    ],
  },
  {
    slug: "ipad-polish-command",
    title: "iPad polish command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 15 P7 pass — candidate iPad bottom nav aligned to five CCE sections with touch-safe section sheets.",
    body: [
      "Phase 15 P0–P6 collapsed nav, unified home, prep paths, filters, surfacing, honesty badges, and purchase demo script. P7 closes the stage-side deploy gap — Kelly's iPad had six ad-hoc tabs plus More/AI clutter.",
      "CandidateIpadIntelligenceShell now uses five bottom tabs: Home, Rehearse, Philosophy, Opposition, Safety — mirroring CandidateCommandSectionNav Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Non-home tabs open CandidateIpadSectionSheet with that section's links — min 48px touch targets, safe-area padding, 820px max column.",
      "Home tab navigates directly to command home; AI prep moves to header button — not bottom bar clutter.",
      "Set NEXT_PUBLIC_CANDIDATE_IPAD_MODE=true with NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=CANDIDATE on Netlify for Kelly stage-side builds Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Hub at /admin/intelligence/ipad-polish inventories section link counts and deploy hints Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[demo-mode-command]] and [[debate-ready-governance]] on iPad polish routes Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Bottom tabs", value: "5 CCE sections" },
      { label: "Hub", value: "/admin/intelligence/ipad-polish" },
      { label: "Column", value: "820px max" },
      { label: "Env", value: "NEXT_PUBLIC_CANDIDATE_IPAD_MODE" },
    ],
    seeAlso: ["demo-mode-command", "debate-ready-governance", "kelly-prep-week-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/ipad-polish", label: "iPad polish hub" },
      { href: "/admin/intelligence", label: "Command home" },
      { href: "/admin/intelligence/demo-mode", label: "Demo script" },
      { href: "/admin/intelligence/phase-15-p7-upgrade", label: "Phase 15 P7 upgrade" },
    ],
  },
  {
    slug: "staff-backstage-command",
    title: "Staff backstage command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 15 P8 pass — route-level STAFF profile guards on builder and operations surfaces; CANDIDATE and CLERK_WEEK redirect to command home.",
    body: [
      "Phase 15 P0–P7 collapsed nav, unified home, prep paths, filters, surfacing, honesty badges, demo script, and iPad polish. P8 closes the profile enforcement gap — nav hiding alone is not enough.",
      "StaffBackstageRouteGuard in the intelligence layout redirects non-STAFF profiles away from builder infra and operations prefixes Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Eight guarded categories: phase upgrades, build progress, chunk pipeline, supreme workbench, command center, agent tooling, morning brief, strategy hub.",
      "Blocked redirects land on command home with ?staff-backstage-blocked= query — StaffBackstageBlockedBanner explains the profile requirement Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Set NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=STAFF for operator access; CANDIDATE and CLERK_WEEK never reach builder URLs even via direct link Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Hub at /admin/intelligence/staff-backstage inventories guard categories and route prefix coverage Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[ipad-polish-command]] and [[debate-ready-governance]] on staff backstage routes Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Guard categories", value: "8 surfaces" },
      { label: "Hub", value: "/admin/intelligence/staff-backstage" },
      { label: "Profile", value: "STAFF only (builder/ops)" },
      { label: "Env", value: "NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE" },
    ],
    seeAlso: ["ipad-polish-command", "debate-ready-governance", "demo-mode-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/staff-backstage", label: "Staff backstage hub" },
      { href: "/admin/intelligence", label: "Command home" },
      { href: "/admin/intelligence/supreme-workbench", label: "Supreme workbench (STAFF)" },
      { href: "/admin/intelligence/phase-15-p8-upgrade", label: "Phase 15 P8 upgrade" },
    ],
  },
  {
    slug: "cce-closure-command",
    title: "CCE closure command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 15 P9 pass — master CCE closure aggregating P0+P1–P8 sub-passes with eight checkpoints and Phase 15 exit gate.",
    body: [
      "Phase 15 P0+P1 collapsed nav and unified command home. P2–P8 added prep week, stage-safe filter, top-tier surfacing, evidence honesty, demo mode, iPad polish, and staff backstage route guards.",
      "P9 closes the Candidate Command Experience at /admin/intelligence/cce-closure — eight checkpoints must each reach 90% before CCE exit.",
      "CCE closure verifies staff backstage enforced (P8), candidate nav ≤25 links, command home strip wired, and Field Book + canon bindings.",
      "Each checkpoint links to its upgrade pass and operational hub — staff uses the queue panel to spot gaps before marking Phase 15 complete.",
      "Exit gate on /admin/intelligence/phase-15-p9-upgrade runs assertPhase15P9Bar — 8/8 passes, stack average ≥90%, staff backstage live Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding on cce-closure hub surfaces this article plus [[staff-backstage-command]] and [[debate-ready-governance]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Checkpoints", value: "8 CCE passes" },
      { label: "Hub", value: "/admin/intelligence/cce-closure" },
      { label: "Stack bar", value: "≥90%" },
      { label: "Nav cap", value: "≤25 links" },
    ],
    seeAlso: ["staff-backstage-command", "debate-ready-governance", "ipad-polish-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/cce-closure", label: "CCE closure hub" },
      { href: "/admin/intelligence", label: "Command home" },
      { href: "/admin/intelligence/staff-backstage", label: "Staff backstage (P8)" },
      { href: "/admin/intelligence/phase-15-p9-upgrade", label: "Phase 15 P9 upgrade" },
    ],
  },
  {
    slug: "session-launcher-command",
    title: "Session launcher command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 16 P0 pass — Stage Rehearsal Engine entry with four encounter types and default 30-minute debate-prep run-of-show.",
    body: [
      "Phase 15 closed the Candidate Command Experience shell — nav, home, gating, iPad, demo, staff backstage. Phase 16 opens the coached session loop.",
      "Session launcher at /admin/intelligence/rehearsal — pick debate prep, ACCA panel, clerk 1:1, or purchase walkthrough (demo-mode) Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Default 30-minute debate-prep run-of-show: command home → top-tier → trap lane → SOS → film room → claims — no new content silos.",
      "Each step deep-links existing intelligence routes with stage-safe flags on drill steps Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "CandidateRehearsalLauncherStrip on command home — Start rehearsal CTA with default encounter Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Hub in Rehearse nav (replaces debate coaching link — coaching still reachable via debate prep) Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[cce-closure-command]] and [[debate-ready-governance]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Encounters", value: "4 types" },
      { label: "Hub", value: "/admin/intelligence/rehearsal" },
      { label: "Default", value: "30 min · 6 steps" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["cce-closure-command", "demo-mode-command", "stage-safe-filter-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/rehearsal", label: "Session launcher hub" },
      { href: "/admin/intelligence", label: "Command home" },
      { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
      { href: "/admin/intelligence/phase-16-p0-upgrade", label: "Phase 16 P0 upgrade" },
    ],
  },
  {
    slug: "run-of-show-command",
    title: "Run-of-show command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 16 P1 pass — four timed run-of-show presets (15 / 30 / 45 / 60 min) with step lists into existing prep surfaces.",
    body: [
      "Phase 16 P0 opened the session launcher with four encounter types. P1 adds duration presets so Kelly picks how long she has, not just what kind of event.",
      "Run-of-show hub at /admin/intelligence/run-of-show — quick-15, standard-30, deep-45, full-60 presets Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Standard 30 matches P0 debate-prep run: command home → top-tier → trap → SOS → film room → claims.",
      "Deep 45 adds second trap lane and philosophy briefing; full 60 adds prep week, coaching, and pile-on survival.",
      "Each step deep-links existing routes — stage-safe flags on drill steps, no new content silos Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "CandidateRunOfShowStrip on command home; hub in Rehearse nav (replaces film room link — film room still in step lists).",
      "Canon binding surfaces this article plus [[session-launcher-command]] and [[debate-ready-governance]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Presets", value: "15 · 30 · 45 · 60 min" },
      { label: "Hub", value: "/admin/intelligence/run-of-show" },
      { label: "Standard", value: "6 steps · 30 min" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["session-launcher-command", "stage-safe-filter-command", "top-tier-prep-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/run-of-show", label: "Run-of-show hub" },
      { href: "/admin/intelligence/rehearsal", label: "Session launcher" },
      { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
      { href: "/admin/intelligence/phase-16-p1-upgrade", label: "Phase 16 P1 upgrade" },
    ],
  },
  {
    slug: "encounter-scenarios-command",
    title: "Encounter scenarios command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 16 P2 pass — four encounter scenarios with primary route binds, evidence honesty rules, and ACCA summer conference anchor.",
    body: [
      "Phase 16 P0 opened the session launcher; P1 added timed presets. P2 adds a scenario registry so Kelly picks the encounter type with context, not just duration.",
      "Encounter scenarios hub at /admin/intelligence/encounters — three-way debate, ACCA panel, clerk 1:1, purchase walkthrough Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "ACCA scenario primary bind: /admin/intelligence/county-clerk-week/acca-summer-conference — clerk-room vocabulary and pocket pledge Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Purchase scenario routes to Phase 15 demo-mode script — buyer demo with evidence honesty on proof lines Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Each scenario inherits evidence honesty badges from Phase 15 P5 — NEEDS_REVIEW lines stay research-question framing only Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "CandidateEncounterScenariosStrip on command home; hub in Rehearse nav (replaces demo-mode Home link — purchase via encounter scenario) Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[run-of-show-command]] and [[debate-ready-governance]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Scenarios", value: "4 types" },
      { label: "Hub", value: "/admin/intelligence/encounters" },
      { label: "ACCA bind", value: "acca-summer-conference" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["run-of-show-command", "demo-mode-command", "stage-safe-filter-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/encounters", label: "Encounter scenarios hub" },
      { href: "/admin/intelligence/rehearsal", label: "Session launcher" },
      { href: "/admin/intelligence/county-clerk-week/acca-summer-conference", label: "ACCA panel prep" },
      { href: "/admin/intelligence/phase-16-p2-upgrade", label: "Phase 16 P2 upgrade" },
    ],
  },
  {
    slug: "drill-queue-command",
    title: "Drill queue command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 16 P3 pass — sequential speak-order drill queue with SOS and trap lane cards and stage-safe gates.",
    body: [
      "Phase 16 P0–P2 opened session launcher, timed presets, and encounter scenarios. P3 closes the reference-library gap — one card at a time.",
      "Drill queue hub at /admin/intelligence/drill-queue — standard tonight, SOS speak-order, and trap pivot queues Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Each card pulls from existing SOS bank or trap lane drill-down — speak line or pivot script with claims gate evaluation.",
      "NEEDS_REVIEW lines never appear as say-this — StageSafeBlockedPanel shows research-question framing only Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "CandidateDrillQueueStrip on command home; hub in Rehearse nav (replaces expected questions link — full SOS bank still on each card).",
      "Canon binding surfaces this article plus [[encounter-scenarios-command]] and [[stage-safe-filter-command]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Queues", value: "3 tracks" },
      { label: "Hub", value: "/admin/intelligence/drill-queue" },
      { label: "Standard", value: "6 cards · mixed" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["encounter-scenarios-command", "stage-safe-filter-command", "run-of-show-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/drill-queue", label: "Drill queue hub" },
      { href: "/admin/intelligence/sos-debate-questions", label: "SOS question bank" },
      { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
      { href: "/admin/intelligence/phase-16-p3-upgrade", label: "Phase 16 P3 upgrade" },
    ],
  },
  {
    slug: "session-debrief-command",
    title: "Session debrief command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 16 P4 pass — pre-stage checklist and post-session capture with staff follow-ups for human action queue review.",
    body: [
      "Phase 16 P0–P3 opened launcher, presets, encounters, and drill queue. P4 adds warm-up and cooldown — bookends for every rehearsal session.",
      "Session debrief hub at /admin/intelligence/session-debrief — five-item pre-stage checklist with auto-evaluated claims and safe-line status Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Post-session capture: feltRisky[] and staffFollowUps[] persisted to data/intelligence/rehearsal-session-debrief-state.json Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Candidate read-only write via POST /api/admin/intelligence/session-debrief — staff reviews on human action queue, no LLM Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "CandidateSessionDebriefStrip on command home; hub in Rehearse nav (replaces debate prep link — prep still via encounter scenarios).",
      "Canon binding surfaces this article plus [[drill-queue-command]] and [[stage-safe-filter-command]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Checklist", value: "5 items" },
      { label: "Hub", value: "/admin/intelligence/session-debrief" },
      { label: "Capture", value: "JSON persistence" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["drill-queue-command", "stage-safe-filter-command", "encounter-scenarios-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/session-debrief", label: "Session debrief hub" },
      { href: "/admin/intelligence/action-queue", label: "Human action queue" },
      { href: "/admin/intelligence/claims", label: "Claims ledger" },
      { href: "/admin/intelligence/phase-16-p4-upgrade", label: "Phase 16 P4 upgrade" },
    ],
  },
  {
    slug: "ipad-drill-player-command",
    title: "iPad drill player command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 16 P5 pass — full-screen drill stepper in candidate iPad shell with Exit · Prev · Next · Timer controls.",
    body: [
      "Phase 16 P3 opened desktop drill queue. P5 extends CandidateIpadIntelligenceShell — when /admin/intelligence/ipad-drill-player is active, five-tab CCE nav collapses to drill controls.",
      "Bottom nav: Exit (command home) · Prev · Next · Timer — min 48px touch targets, safe-area padding, 820px column preserved.",
      "Header AI prep button stays — drill player is separate from agent tooling hub (staff guard in P8).",
      "Reuses P3 drill queue card inventory — same stage-safe gates and speak lines, optimized for side-stage iPad rehearsal.",
      "CandidateIpadDrillPlayerStrip on command home; hub in Rehearse nav (replaces run-of-show link — presets still via session launcher) Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[drill-queue-command]] and [[ipad-polish-command]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Controls", value: "Exit · Prev · Next · Timer" },
      { label: "Hub", value: "/admin/intelligence/ipad-drill-player" },
      { label: "Touch", value: "≥48px" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["drill-queue-command", "ipad-polish-command", "session-debrief-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/ipad-drill-player", label: "iPad drill player hub" },
      { href: "/admin/intelligence/drill-queue", label: "Desktop drill queue" },
      { href: "/admin/intelligence/ipad-polish", label: "iPad polish (P7)" },
      { href: "/admin/intelligence/phase-16-p5-upgrade", label: "Phase 16 P5 upgrade" },
    ],
  },
  {
    slug: "session-memory-command",
    title: "Session memory command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 16 P6 pass — continue last drill on command home with persisted rehearsal session state, history list, and staff reset.",
    body: [
      "Phase 16 P3–P5 opened drill queue, debrief, and iPad player. P6 records progress when those hubs load and surfaces Continue on command home.",
      "Active session fields: kind, step position, continue href, label, updated-at — five overlays at bar on rehearsal history hub.",
      "Persistence in data/intelligence/rehearsal-session-state.json — history capped at 20 entries; staff POST clear on /api/admin/intelligence/rehearsal-session Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Recording hooks on drill-queue, ipad-drill-player, and encounters pages — no new content silos, deep-links existing prep surfaces Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "CandidateSessionMemoryStrip on command home; Rehearsal history in Home nav (5th link — no Rehearse swap) Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[drill-queue-command]] and [[encounter-scenarios-command]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Fields", value: "5 active-session overlays" },
      { label: "Hub", value: "/admin/intelligence/rehearsal-history" },
      { label: "History max", value: "20 entries" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["drill-queue-command", "encounter-scenarios-command", "session-debrief-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/rehearsal-history", label: "Rehearsal history hub" },
      { href: "/admin/intelligence/drill-queue", label: "Drill queue (records progress)" },
      { href: "/admin/intelligence/encounters", label: "Encounters (records progress)" },
      { href: "/admin/intelligence/phase-16-p6-upgrade", label: "Phase 16 P6 upgrade" },
    ],
  },
  {
    slug: "rehearsal-coach-command",
    title: "Rehearsal coach command",
    phaseId: "phase-d",
    category: "Staff",
    summary:
      "Phase 16 P7 pass — STAFF-only coach overlay to assign tonight's encounter and pin up to three must-run drills on command home.",
    body: [
      "Phase 16 P0–P6 built the candidate rehearsal loop. P7 adds the staff assignment layer without exposing builder surfaces to Kelly.",
      "Coach hub at /admin/intelligence/rehearsal-coach — assign one of four encounter types; pins deep-link drill queue cards Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Persistence in data/intelligence/rehearsal-coach-state.json — POST /api/admin/intelligence/rehearsal-coach for assign, pin, unpin, clear Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "CandidateStaffCoachStrip on command home shows assigned scenario and pinned drills — route guard blocks candidate profile from coach hub.",
      "Rehearsal coach in STAFF Operations nav — extends P8 backstage prefix list Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding surfaces this article plus [[session-launcher-command]] and [[drill-queue-command]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Max pins", value: "3 drills" },
      { label: "Hub", value: "/admin/intelligence/rehearsal-coach" },
      { label: "Profile", value: "STAFF only" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["session-launcher-command", "drill-queue-command", "staff-backstage-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/rehearsal-coach", label: "Rehearsal coach hub" },
      { href: "/admin/intelligence/rehearsal", label: "Session launcher" },
      { href: "/admin/intelligence/drill-queue", label: "Drill queue" },
      { href: "/admin/intelligence/phase-16-p7-upgrade", label: "Phase 16 P7 upgrade" },
    ],
  },
  {
    slug: "live-event-command",
    title: "Live event command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 16 P8 pass — ACCA Jun 11 countdown on command home with day-of shortest stage-safe run-of-show when clerk week or live env is active.",
    body: [
      "Phase 16 P1–P2 built timed run-of-show and ACCA encounter scenario. P8 adds live event mode without duplicating the seven-day clerk week path.",
      "Hub at /admin/intelligence/live-event — countdown to Thu Jun 11 1pm panel, day-of card, and compressed safe rehearsal steps.",
      "Activate via NEXT_PUBLIC_SRE_LIVE_EVENT=acca-panel-2026 or NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE=county_clerks (CLERK_WEEK profile) Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Day-of plan auto-selects shortest stage-safe path — ACCA compressed prep + claims on panel day; quick-15 safe subset otherwise.",
      "CandidateLiveEventStrip on command home; live event in Home nav (replaces CCE closure link — strip remains on command home).",
      "Canon binding surfaces this article plus [[run-of-show-command]] and [[encounter-scenarios-command]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Event", value: "ACCA Jun 11 · 1–3pm" },
      { label: "Hub", value: "/admin/intelligence/live-event" },
      { label: "Env", value: "NEXT_PUBLIC_SRE_LIVE_EVENT" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["run-of-show-command", "encounter-scenarios-command", "session-launcher-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/live-event", label: "Live event hub" },
      { href: "/admin/intelligence/county-clerk-week/acca-summer-conference", label: "ACCA summer conference prep" },
      { href: "/admin/intelligence/encounters", label: "Encounter scenarios" },
      { href: "/admin/intelligence/phase-16-p8-upgrade", label: "Phase 16 P8 upgrade" },
    ],
  },
  {
    slug: "sre-closure-command",
    title: "SRE stack closure command",
    phaseId: "phase-d",
    category: "Candidate UX",
    summary:
      "Phase 16 P9 pass — master Stage Rehearsal Engine closure aggregating P0–P8 with nine checkpoints and SRE exit gate.",
    body: [
      "Phase 16 P0–P8 built the coached rehearsal loop — session launcher through live event mode. P9 closes the SRE stack at /admin/intelligence/sre-closure.",
      "Nine checkpoints: P0 session launcher, P1 run-of-show, P2 encounters, P3 drill queue, P4 debrief, P5 iPad player, P6 session memory, P7 staff coach, P8 live event.",
      "Exit gate requires 9/9 sub-passes ≥90%, stack average ≥90%, staff coach STAFF-only, iPad shell wired, drill queue stage-safe, and candidate nav ≤25 links.",
      "CandidateSreClosureStrip on command home sits alongside the CCE closure strip — SRE closure appears in Home nav once staff marks checkpoints complete.",
      "State persists to data/intelligence/phase-16-sre-closure-state.json on hub page load so operators can resume the nine-checkpoint queue across rehearsal sessions.",
      "Canon binding on sre-closure routes surfaces this article together with [[session-launcher-command]] and [[drill-queue-command]] for governed staff promotion workflow.",
    ],
    sidebarFacts: [
      { label: "Checkpoints", value: "9 (P0–P8)" },
      { label: "Hub", value: "/admin/intelligence/sre-closure" },
      { label: "Exit bar", value: "90% stack avg" },
      { label: "Engine", value: "Stage Rehearsal (SRE)" },
    ],
    seeAlso: ["session-launcher-command", "drill-queue-command", "cce-closure-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/sre-closure", label: "SRE closure hub" },
      { href: "/admin/intelligence/rehearsal", label: "Session launcher (P0)" },
      { href: "/admin/intelligence/build-progress", label: "Build progress" },
      { href: "/admin/intelligence/phase-16-p9-upgrade", label: "Phase 16 P9 upgrade" },
    ],
  },
  {
    slug: "phase-11-stack-closure-command",
    title: "Phase 11 stack closure command",
    phaseId: "phase-d",
    category: "Canon",
    summary:
      "Phase 11 P9 pass — master stack closure aggregating P0–P8 sub-passes with nine checkpoints and Phase 11 exit gate.",
    body: [
      "Phase 11 P0–P8 built the strategy-manual → Field Book canon pipeline: campaign system surfacing, Kelly plan, movement philosophy, doctrine JSON, philosophy claims, chunk promotion, alignment preview, briefing attach, and promotion execution.",
      "Phase 11 P9 closes the stack at /admin/intelligence/phase-11-stack-closure — nine checkpoints must each reach 90% before stack exit.",
      "Stack closure verifies promotion pipeline ready (P8), debate philosophy feed score, Field Book + canon bindings, and migration bridge route coverage.",
      "Each checkpoint links to its upgrade pass and operational hub — staff uses the queue panel to spot gaps before marking Phase 11 complete.",
      "Exit gate on /admin/intelligence/phase-11-p9-upgrade runs assertPhase11P9Bar — 9/9 passes, stack average ≥90%, pipeline ready Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding on phase-11-stack-closure hub surfaces this article plus [[field-book-promotion-execution-command]] and [[strategy-migration]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Stack checkpoints", value: "9 (P0–P8)" },
      { label: "Hub", value: "/admin/intelligence/phase-11-stack-closure" },
      { label: "Exit bar", value: "90% stack avg" },
      { label: "Lane", value: "Canon · indigo" },
    ],
    seeAlso: ["field-book-promotion-execution-command", "strategy-migration", "strategy-philosophy-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/phase-11-stack-closure", label: "Stack closure hub" },
      { href: "/admin/intelligence/phase-11-p9-upgrade", label: "P9 upgrade pass" },
      { href: "/admin/intelligence/strategy-philosophy-hub", label: "Strategy & philosophy hub" },
      { href: "/admin/intelligence/field-book-promotion-execution", label: "Promotion execution (P8)" },
    ],
  },
  {
    slug: "field-book-promotion-execution-command",
    title: "Field Book promotion execution command",
    phaseId: "phase-d",
    category: "Canon",
    summary:
      "Phase 11 P8 pass — eight promotion execution waves complete the P5→P8 canon pipeline with claims-gated Field Book body merge workflow.",
    body: [
      "Phase 11 P5 catalogued chunks, P6 added alignment preview, P7 wired briefing attach. Phase 11 P8 closes execution at /admin/intelligence/field-book-promotion-execution.",
      "Eight waves: Kelly foundation/programs/operations, CSM lifecycle/operator/structure/web, and canon-closure gate Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Each wave maps P5 promotion batches to target Field Book slugs with operator execution steps and claims gate checklist.",
      "Execution does not auto-write Field Book bodies — staff merges approved chunk summaries via editor after claim-review API clearance.",
      "Canon-closure wave verifies all eleven P5 batches, 18+ canon bindings, and Phase 11 stack readiness before pipeline marks complete.",
      "Hub integrates with field-book/canon loop — gold strip bindings surface execution command on promotion routes Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Execution waves", value: "8 wired" },
      { label: "Hub", value: "/admin/intelligence/field-book-promotion-execution" },
      { label: "Pipeline", value: "P5→P8" },
      { label: "Lane", value: "Canon · amber" },
    ],
    seeAlso: ["field-book-chunk-promotion-command", "strategy-migration", "claims-firewall"],
    relatedRoutes: [
      { href: "/admin/intelligence/field-book-promotion-execution", label: "Execution hub" },
      { href: "/admin/intelligence/field-book/canon", label: "Canon loop hub" },
      { href: "/admin/intelligence/field-book-chunk-promotion", label: "Chunk promotion (P5)" },
      { href: "/admin/intelligence/phase-11-p8-upgrade", label: "Phase 11 P8 upgrade" },
    ],
  },
  {
    slug: "briefing-papers-chunk-attach-command",
    title: "Briefing papers chunk attach command",
    phaseId: "phase-d",
    category: "Staff",
    summary:
      "Phase 11 P7 pass — eight briefing paper attach lanes wire P6 chunk previews into governed paper deep sections with claim-review API gate.",
    body: [
      "Phase 11 P6 added SDI-1 alignment chunk preview lanes. Phase 11 P7 closes the attach gap at /admin/intelligence/briefing-papers-chunk-attach.",
      "Eight attach lanes map paperIds (morning-intelligence, debate-prep, county-pulaski, opposition-research, etc.) to P6 preview lanes and P5 promotion batches.",
      "Each lane defines attachSteps for merging chunk plainText summaries into briefing paper deep sections — not raw markdown dumps.",
      "claimsAttachSteps require POST /api/admin/intelligence/claim-review before paper lines reach debate command or Field Book Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Per-lane pages show sample attachable chunks filtered from strategy-chunking — staff validates before merge Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Claims-gated brief merge lane is the final gate before Field Book promotion from briefing paper content Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding on briefing-papers-chunk-attach hub surfaces this article plus [[staff-strategy-command]] and [[field-book-chunk-promotion-command]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Attach lanes", value: "8 wired" },
      { label: "Hub", value: "/admin/intelligence/briefing-papers-chunk-attach" },
      { label: "API gate", value: "claim-review" },
      { label: "Lane", value: "Staff · teal" },
    ],
    seeAlso: ["staff-strategy-command", "strategy-alignment-chunk-preview-command", "claims-firewall"],
    relatedRoutes: [
      { href: "/admin/intelligence/briefing-papers-chunk-attach", label: "Chunk attach hub" },
      { href: "/admin/intelligence/briefing-papers", label: "Briefing papers" },
      { href: "/admin/intelligence/strategy-alignment-chunk-preview", label: "Chunk preview (P6)" },
      { href: "/admin/intelligence/phase-11-p7-upgrade", label: "Phase 11 P7 upgrade" },
    ],
  },
  {
    slug: "strategy-alignment-chunk-preview-command",
    title: "Strategy alignment chunk preview command",
    phaseId: "phase-d",
    category: "Canon",
    summary:
      "Phase 11 P6 pass — eight SDI-1 alignment preview lanes wire P5 promotion batches to strategy-alignment chunk filters and claims-gated Field Book handoff.",
    body: [
      "Phase 11 P5 catalogued ~2,795 strategy manual chunks into eleven promotion batches. Phase 11 P6 closes the preview gap at /admin/intelligence/strategy-alignment-chunk-preview.",
      "Strategy migration bridge already marked strategy-alignment as the primary surface for manual chunk preview — P6 adds the actual preview lanes, chunk filters, and sample displays.",
      "Eight lanes: foundation civic trust, programs comms/GOTV, operations KPI/dashboard, lifecycle tome, debate-week workflows, playbook escalation, SDI-1 doctrine crosswalk, and claims-gated promotion queue.",
      "Each lane carries P6 overlays — operator preview steps, claims preview gate, alignment doctrine IDs, and Field Book target slugs.",
      "Per-lane pages show sample chunk plainText previews filtered from strategy-chunking — staff validates against SDI-1 alignment signals before merging into briefing-papers or Field Book.",
      "Claims-gated lane requires /api/admin/intelligence/claim-review clearance before batch status advances to promotion_ready in field-book-chunk-promotion-state Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Canon binding on strategy-alignment-chunk-preview hub surfaces this article plus [[strategy-migration]] and [[field-book-chunk-promotion-command]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Preview lanes", value: "8 wired" },
      { label: "Hub", value: "/admin/intelligence/strategy-alignment-chunk-preview" },
      { label: "SDI-1", value: "Doctrine crosswalk" },
      { label: "Lane", value: "Strategy · purple" },
    ],
    seeAlso: ["strategy-migration", "field-book-chunk-promotion-command", "claims-firewall"],
    relatedRoutes: [
      { href: "/admin/intelligence/strategy-alignment-chunk-preview", label: "Chunk preview hub" },
      { href: "/admin/intelligence/strategy-alignment", label: "Strategy alignment" },
      { href: "/admin/intelligence/field-book-chunk-promotion", label: "Chunk promotion (P5)" },
      { href: "/admin/intelligence/phase-11-p6-upgrade", label: "Phase 11 P6 upgrade" },
    ],
  },
  {
    slug: "field-book-chunk-promotion-command",
    title: "Field Book chunk promotion command",
    phaseId: "phase-d",
    category: "Canon",
    summary:
      "Phase 11 P5 pass — ~2,795 strategy manual H2/H3 chunks catalogued into eleven promotion batches with operator overlays and claims gates for Field Book canon execution.",
    body: [
      "Phase D strategy-migration article described chunk promotion conceptually; Phase 11 P5 closes the execution gap at /admin/intelligence/field-book-chunk-promotion Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Chunks originate from Kelly SOS strategic plan (docs/kelly-grappe-sos-strategic-plan-manual) and campaign-system-manual — indexed at GET /api/admin/campaign-strategy/chunks for RAG and staff preview.",
      "Eleven batches: three Kelly lanes (foundation, programs, operations) plus eight campaign-system categories (root tomes through web presentation) Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Each batch carries P5 overlays — operator steps, claims gate checklist, Field Book target slugs, and do-not-promote-until guardrails.",
      "Promotion executes only after ~98% phase-11 stack readiness (P0–P4 passes) and claims-firewall clearance on stage-adjacent lines Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
      "Staff uses strategy-alignment dashboard to preview chunks before merging summaries into Field Book bodies via [[slug]] wiki syntax — not raw chunk dumps.",
      "Canon binding on field-book-chunk-promotion hub surfaces this article plus [[strategy-migration]] and [[claims-firewall]] Staff cross-check [[claims-firewall]] and ledger classification before promoting any line to debate rehearsal or Field Book canon..",
    ],
    sidebarFacts: [
      { label: "Chunks", value: "~2,795" },
      { label: "Batches", value: "11 wired" },
      { label: "Hub", value: "/admin/intelligence/field-book-chunk-promotion" },
      { label: "Gate", value: "~98% intelligence" },
    ],
    seeAlso: ["strategy-migration", "claims-firewall", "campaign-system-manual-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/field-book-chunk-promotion", label: "Chunk promotion hub" },
      { href: "/admin/intelligence/field-book/canon", label: "Canon loop hub" },
      { href: "/admin/intelligence/strategy-alignment", label: "Strategy alignment" },
      { href: "/admin/intelligence/phase-11-p5-upgrade", label: "Phase 11 P5 upgrade" },
    ],
  },
  {
    slug: "philosophy-graph-claims-command",
    title: "Philosophy graph claims review command",
    phaseId: "phase-c",
    category: "Governance",
    summary:
      "Phase 11 P4 pass — eight NSI-4 philosophy graph nodes bound to governed claim ledger with review workflow overlays.",
    body: [
      "Phase 10 enriched philosophy graph nodes with debate application overlays but all eight nodes remained NEEDS_REVIEW with no claims workflow. Phase 11 P4 closes that gap at /admin/intelligence/philosophy-graph-claims-review.",
      "Each philosophy node seeds a claim-philosophy-* ledger row with topicTags philosophy-graph — staff clears via /api/admin/intelligence/claim-review before stage use.",
      "P4 overlays add stage-safe wording, do-not-say lines, claim review steps, and operator workflow on every philosophy graph node before Kelly rehearses debate philosophy lines.",
      "Hub queue panel shows approved, needs review, and blocked counts — mirrors the debate-week claims panel pattern staff already uses on trap lanes.",
      "Per-node pages crosswalk Phase 10 debate application with P4 claims discipline, linked doctrine IDs, and briefing paper attach lanes from Phase 11 P7.",
      "Canon binding on philosophy-graph-claims-review hub surfaces this article together with [[strategy-philosophy-command]] and [[claims-firewall]] for governed staff promotion workflow.",
    ],
    sidebarFacts: [
      { label: "Nodes", value: "8 wired" },
      { label: "Hub", value: "/admin/intelligence/philosophy-graph-claims-review" },
      { label: "Ledger", value: "claim-philosophy-*" },
      { label: "Lane", value: "NSI-4 · violet" },
    ],
    seeAlso: ["strategy-philosophy-command", "claims-firewall", "strategy-doctrine-command"],
    relatedRoutes: [
      { href: "/admin/intelligence/philosophy-graph-claims-review", label: "Philosophy claims hub" },
      { href: "/admin/intelligence/campaign-intelligence-graph", label: "Intelligence graph" },
      { href: "/admin/intelligence/phase-11-p4-upgrade", label: "Phase 11 P4 upgrade" },
    ],
  },
  {
    slug: "debate-instruction-bridge",
    title: "Debate instruction bridge — dossier corpus to stage drills",
    phaseId: "phase-c",
    category: "Debate prep",
    summary:
      "Phase 9 pass — wires 2× dossier depth expansion into all 28 prep sections, six trap lanes, and 35 SOS questions with dossier cross-links, clerk-room scripts, and eight-step coaching runbook.",
    body: [
      "Phase 8 enriched dossier and ACCA silos without integrating the debate spine. Phase 9 closes that gap: phase9DebateInstructionDepth defines per-section dossier crosswalks; applyPhase9DebateInstruction merges at read time into getPrepSectionDrillDown, getTrapLaneDrillDown, and getSosDebateQuestionDrillDown.",
      "Every prep section gains ≥2 dossier section links, additional rehearsal steps, clerk-room bridge language, and ACCA panel notes. Trap lanes gain clerk-room scripts safe for Mountain View continuing-education tone — max three traps, curious not prosecutorial.",
      "SOS questions inherit category-level dossier briefing hooks — elections-integrity pulls hammer-2021-six-bill-deep; county-administration pulls kelly-road-stories-fieldbook; three-way-race pulls packo-economist-platform-deep.",
      "phase9DebateCoachingRunbook documents eight operator steps from T-14 through post-event Field Book promotion. Hub at /admin/intelligence/phase-9-upgrade surfaces orchestration gap tracker — closed vs partial vs open items including Phase 10 debate-command integration.",
      "2× dossier depth from Phase 9 wave 1 (kellyDossierDepthExpansion, opponentDossierDepthExpansion, accaConferenceDepthExpansion) remains the content foundation — debate bridge is the orchestration layer that makes research corpus reachable from debate prep surfaces.",
      "Final KH wave 4 promotes ai-suggestion-sandbox and ai-opposition-copilot — last staff-stub modules. Claims gate and diligence logs remain operator-driven; Phase 9 adds instruction, not auto-verified claims.",
      "Canon binding on phase-9-upgrade surfaces this article plus [[dossier-research-acca-closure]] and [[debate-ready-governance]] — pair with kelly-debate-coaching before any stage event.",
    ],
    sidebarFacts: [
      { label: "Prep sections", value: "28 with dossier bridge" },
      { label: "Trap lanes", value: "6 clerk-room scripts" },
      { label: "SOS questions", value: "35 category hooks" },
      { label: "Hub", value: "/admin/intelligence/phase-9-upgrade" },
    ],
    seeAlso: ["dossier-research-acca-closure", "debate-ready-governance", "debate-glossary"],
    relatedRoutes: [
      { href: "/admin/intelligence/phase-9-upgrade", label: "Phase 9 upgrade" },
      { href: "/admin/intelligence/kelly-debate-coaching", label: "Debate coaching" },
      { href: "/admin/intelligence/kim-hammer/debate-prep", label: "Prep drill-downs" },
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
      { href: "/admin/intelligence/field-book-chunk-promotion", label: "Chunk promotion hub" },
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
