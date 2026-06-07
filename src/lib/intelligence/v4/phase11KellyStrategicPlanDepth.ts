/**
 * Phase 11 P1 — Kelly SOS strategic plan chapter depth overlays.
 */
import { STRATEGY_MD_ENTRIES } from "@/lib/campaign-strategy/md-manifest";
import { KELLY_STRATEGIC_PLAN_HUB_HREF } from "@/lib/campaign-strategy/kelly-strategic-plan-nav";

export type KellyStrategicPlanChapterOverlay = {
  pathKey: string;
  strategicRole: string;
  debateApplication: string[];
  operatorSteps: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
  linkedPhilosophyBriefingIds: string[];
  linkedManualChapterRefs: string[];
};

const HUB = "/admin/intelligence/strategy-philosophy-hub";
const OPPOSITION = "/admin/intelligence/opposition-strategy";
const ALIGNMENT = "/admin/intelligence/strategy-alignment";
const PATHWAY = "/admin/intelligence/strategic-target-pathway";
const CSM = "/admin/intelligence/campaign-system-manual";
const DEBATE_CMD = "/admin/intelligence/debate-command";

function chapter(
  pathKey: string,
  role: string,
  debate: string[],
  steps: string[],
  links: Array<{ href: string; label: string }>,
  briefings: string[] = [],
  refs: string[] = [],
): KellyStrategicPlanChapterOverlay {
  return {
    pathKey,
    strategicRole: role,
    debateApplication: debate,
    operatorSteps: steps,
    intelligenceLinks: [
      { href: HUB, label: "Strategy & philosophy hub" },
      { href: ALIGNMENT, label: "Strategy alignment" },
      { href: DEBATE_CMD, label: "Debate command" },
      ...links,
    ],
    linkedPhilosophyBriefingIds: briefings,
    linkedManualChapterRefs: refs.length ? refs : [pathKey || "framework"],
  };
}

const CHAPTER_OVERLAYS: Record<string, KellyStrategicPlanChapterOverlay> = {
  "": chapter(
    "",
    "Manual orientation — how Kelly SOS strategic plan connects to debate prep, field programs, and intelligence command.",
    [
      "Use overview to orient new staff before debate week — not a stage document.",
      "Points to foundation chapters (framework, executive-summary, LANE) as debate-safe anchors.",
    ],
    [
      "Start here for staff onboarding; candidate lane should jump to framework + executive-summary.",
      "Cross-link to strategy-philosophy-hub inventory before deep-diving program chapters.",
    ],
    [{ href: KELLY_STRATEGIC_PLAN_HUB_HREF, label: "Intelligence reader home" }, { href: ALIGNMENT, label: "Strategy alignment" }],
    [],
    ["framework", "executive-summary"],
  ),
  meta: chapter(
    "meta",
    "Governance, disclaimers, and publication-safety rails for all manual-derived messaging.",
    [
      "Meta chapter governs what may leave admin — pair with claims ledger before any external line.",
      "Debate answers inherit counsel-review frame from Field Book when citing manual prose.",
    ],
    [
      "Read before promoting manual chunks to Field Book.",
      "Flag INTERPRETATION vs VERIFIED_FACT when staff copies lines into briefing papers.",
    ],
    [
      { href: "/admin/intelligence/claims", label: "Claims ledger" },
      { href: "/admin/intelligence/field-book/counsel-review-frame", label: "Counsel frame" },
    ],
    [],
    ["meta"],
  ),
  lane: chapter(
    "lane",
    "Victory math, budget targets, registration goals — internal finance/field alignment (redact before external share).",
    [
      "LANE underpins strategic-target-pathway NSI-7 — use aggregate language on stage, never voter-level targeting.",
      "Hammer contrast: administrator SOS runs counties; LANE shows Kelly plans implementation scale.",
    ],
    [
      "Never paste raw LANE tables into public settings.",
      "Cross-check registration assumptions with strategic-target-pathway missing-county flags.",
    ],
    [
      { href: PATHWAY, label: "Strategic target pathway" },
      { href: "/admin/intelligence/election-funding", label: "Election funding" },
    ],
    ["author-vs-administrator"],
    ["lane", "framework"],
  ),
  "executive-summary": chapter(
    "executive-summary",
    "Kelly as operations executive — primary author-vs-administrator debate anchor.",
    [
      "Executive summary is the philosophical spine for author-vs-administrator briefing.",
      "Three-way debates: executive tone contrasts Hammer legislator frame and Pakko direct-democracy lane.",
    ],
    [
      "Rehearse 30-second executive summary before every debate prep block.",
      "Pair with psychology manual dad-test-reliable-leader section.",
    ],
    [
      { href: "/admin/intelligence/debate-briefings/author-vs-administrator", label: "Author vs administrator" },
      { href: OPPOSITION, label: "Opposition strategy" },
    ],
    ["author-vs-administrator", "presence-without-repetition"],
    ["executive-summary", "framework"],
  ),
  "build-audit": chapter(
    "build-audit",
    "RedDirt + county workbench proof — implementation capacity vs opponent slogans.",
    [
      "Build-audit backs competence-test answers when Hammer cites experience-equals-SOS-ready trap.",
      "County clerk partnership philosophy maps to relational-field + election-funding drill-downs.",
    ],
    [
      "Cite only VERIFIED build-audit claims on stage.",
      "Cross-read county-clerk-week ACCA runbook before clerk-room events.",
    ],
    [
      { href: "/admin/intelligence/county-clerk-week/acca-summer-conference", label: "ACCA conference" },
      { href: "/admin/intelligence/build-progress", label: "Build progress" },
    ],
    ["county-clerk-partnership", "author-vs-administrator"],
    ["build-audit", "framework"],
  ),
  framework: chapter(
    "framework",
    "Theory of change — master strategic philosophy spine for entire intelligence system.",
    [
      "Framework chapter feeds all eight debate philosophy briefings via Phase 10 crosswalk.",
      "Agree-then-contrast discipline starts here: shared values + SOS deliverable addition.",
    ],
    [
      "Mandatory pre-read for debate command and strategy-philosophy-hub.",
      "Link every trap lane answer back to one framework principle.",
    ],
    [
      { href: "/admin/intelligence/debate-briefings", label: "Philosophy briefings" },
      { href: "/admin/intelligence/debate-command", label: "Debate command" },
    ],
    ["agree-but-never-only-agree", "integrity-without-nationalizing"],
    ["framework"],
  ),
  "programs/registration": chapter(
    "programs/registration",
    "Voter registration program — field math without micro-targeting language on stage.",
    [
      "Registration chapter supports pathway-to-win answers without naming individual voters.",
      "Contrast Hammer bills touching ballot access with Kelly county-support registration posture.",
    ],
    [
      "Pair with strategic-target-pathway when moderator asks about turnout mechanics.",
      "Use kim-hammer narrative-testing registration category for opposition framing.",
    ],
    [{ href: PATHWAY, label: "Target pathway" }, { href: "/admin/intelligence/kim-hammer/narrative-testing", label: "Narrative testing" }],
    ["direct-democracy-offense"],
    ["programs/registration", "lane"],
  ),
  "programs/turnout-persuasion-youth": chapter(
    "programs/turnout-persuasion-youth",
    "Turnout gaps, persuasion, youth — coalition expansion doctrine.",
    [
      "Youth and persuasion lanes answer 'how do you grow the electorate' without culture-war bait.",
      "Integrity-without-nationalizing briefing pairs with rural + faith program chapters.",
    ],
    [
      "Cross-read psychology manual when-audience-skeptical before youth-focused answers.",
      "Avoid opponent-style voter sorting language.",
    ],
    [{ href: "/admin/intelligence/debate-briefings/integrity-without-nationalizing", label: "Integrity framing" }],
    ["integrity-without-nationalizing"],
    ["programs/turnout-persuasion-youth"],
  ),
  "programs/relational-field": chapter(
    "programs/relational-field",
    "Relational organizing + community intelligence — grassroots scale thesis.",
    [
      "Relational field is the field translation of philosophy graph civic-trust node.",
      "ACCA clerk rooms: relational field intel supports county-clerk-partnership briefing.",
    ],
    [
      "Pair with county-clerk-week and Hammer relational-field bill category attacks.",
      "Link to campaign-system workflows FIELD_REPORTING_TO_DASHBOARD_ROLLUP.",
    ],
    [
      { href: "/admin/intelligence/county-clerk-week", label: "County clerk week" },
      { href: `${CSM}/workflows/FIELD_REPORTING_TO_DASHBOARD_ROLLUP`, label: "Field reporting workflow" },
    ],
    ["county-clerk-partnership"],
    ["programs/relational-field"],
  ),
  "programs/comms-media": chapter(
    "programs/comms-media",
    "Communications, media, collateral — debate message discipline and earned media.",
    [
      "Comms-media governs what clips and lines may appear in film room and debate prep.",
      "Trap lanes and SOS questions reference comms-media for stage-safe contrast density.",
    ],
    [
      "Run claims firewall before any new comms line enters debate spine.",
      "Cross-read writing-toolbox for staff drafts.",
    ],
    [
      { href: "/admin/intelligence/writing-toolbox", label: "Writing toolbox" },
      { href: "/admin/intelligence/film-room", label: "Film room" },
    ],
    ["rebuttal-architecture", "presence-without-repetition"],
    ["programs/comms-media"],
  ),
  "programs/rural": chapter(
    "programs/rural",
    "75-county rural thesis — Arkansas scale answers for suburban/rural mix audiences.",
    [
      "Rural chapter anchors absentee-voting and clerk-burden answers without national mail-voting fights.",
      "Election integrity tour program pairs with integrity-without-nationalizing on stage.",
    ],
    [
      "Use county examples only when sourced in dossier or claims ledger.",
      "Pair with election-funding for small-county resource questions.",
    ],
    [{ href: "/admin/intelligence/election-funding", label: "Election funding" }],
    ["county-clerk-partnership", "integrity-without-nationalizing"],
    ["programs/rural"],
  ),
  "programs/faith-communities": chapter(
    "programs/faith-communities",
    "Faith and diverse communities — coalition tone without sectarian debate traps.",
    [
      "Faith communities program supports warm-trust answers in psychology manual trust-equation section.",
      "Avoid opponent-style culture-war framing; stay on SOS service and inclusion.",
    ],
    [
      "Pre-brief faith outreach staff separately from debate stage lines.",
      "Cross-read agree-but-never-only-agree for shared-values openings.",
    ],
    [{ href: "/admin/intelligence/debate-briefings/agree-but-never-only-agree", label: "Agree-then-contrast" }],
    ["agree-but-never-only-agree"],
    ["programs/faith-communities"],
  ),
  "programs/direct-contact": chapter(
    "programs/direct-contact",
    "Mail, phone, text, door — field contact doctrine and volunteer safety.",
    [
      "Direct contact supports GOTV answers without revealing operational targeting on stage.",
      "Relational field + direct contact = complete field program contrast vs opponent bill burden.",
    ],
    [
      "Staff-only operational detail — summarize on stage as 'support counties and volunteers'.",
      "Link to campaign-system role guides for volunteer lane.",
    ],
    [{ href: `${CSM}/roles/volunteer/README`, label: "Volunteer role guide" }],
    [],
    ["programs/direct-contact", "programs/relational-field"],
  ),
  "programs/gotv": chapter(
    "programs/gotv",
    "GOTV and Election Day — administrator readiness under pressure.",
    [
      "GOTV chapter answers 'how would you run Election Day statewide' — core SOS competence test.",
      "Contrast Hammer enforcement bills with Kelly county-support GOTV posture.",
    ],
    [
      "Pair with election_enforcement bill category in narrative-testing lab.",
      "Never promise outcomes — promise processes and clerk support.",
    ],
    [
      { href: "/admin/intelligence/kim-hammer/narrative-testing", label: "Narrative testing" },
      { href: "/admin/intelligence/sos-debate-questions", label: "SOS questions" },
    ],
    ["author-vs-administrator"],
    ["programs/gotv"],
  ),
  "programs/integrity-tour": chapter(
    "programs/integrity-tour",
    "Election integrity listening tour — local integrity without nationalizing.",
    [
      "Primary stage companion to integrity-without-nationalizing philosophy briefing.",
      "Pairs with Hammer 2021 integrity foundation package in opposition-strategy layer.",
    ],
    [
      "Use tour stories only when claims-verified.",
      "Cross-read election-funding before CVSGF/HAVA questions.",
    ],
    [
      { href: "/admin/intelligence/debate-briefings/integrity-without-nationalizing", label: "Integrity briefing" },
      { href: "/admin/intelligence/kim-hammer/integrity-foundation-2021", label: "2021 integrity foundation" },
    ],
    ["integrity-without-nationalizing"],
    ["programs/integrity-tour"],
  ),
  "programs/fundraising": chapter(
    "programs/fundraising",
    "Fundraising and operations — internal; avoid detailed finance debate unless asked.",
    [
      "Fundraising chapter is staff-lane — redirect debate to operations competence and transparency.",
      "Supports author-vs-administrator 'managed budgets' theme without specific donor talk.",
    ],
    [
      "Do not cite LANE dollar figures on stage unless pre-approved.",
      "Link to compliance chapter for ethics questions.",
    ],
    [{ href: "/admin/intelligence/election-funding", label: "Election funding (public)" }],
    ["author-vs-administrator"],
    ["programs/fundraising", "programs/compliance"],
  ),
  "programs/social": chapter(
    "programs/social",
    "Distributed social network — message discipline at scale.",
    [
      "Social program connects to comms-media and writing-toolbox for volunteer amplification governance.",
      "Debate pivot: SOS office doesn't run memes — it runs trustworthy election administration.",
    ],
    [
      "Staff uses campaign-system SEGMENTED_MESSAGE workflow before any rapid response.",
      "Claims gate on all social lines attributed to Kelly.",
    ],
    [{ href: "/admin/intelligence/writing-toolbox", label: "Writing toolbox" }],
    ["presence-without-repetition"],
    ["programs/social", "programs/comms-media"],
  ),
  "programs/institutional-media": chapter(
    "programs/institutional-media",
    "Institutional and earned media — press and debate tone alignment.",
    [
      "Earned media program pairs with rebuttal-architecture briefing for crisp contrast.",
      "Film room clips must pass comms-media governance before debate citation.",
    ],
    [
      "Cross-read briefing-papers before major media hits.",
      "Never ad-lib policy beyond verified manual + ledger claims.",
    ],
    [
      { href: "/admin/intelligence/briefing-papers", label: "Briefing papers" },
      { href: "/admin/intelligence/film-room", label: "Film room" },
    ],
    ["rebuttal-architecture"],
    ["programs/institutional-media"],
  ),
  "programs/kpis": chapter(
    "programs/kpis",
    "KPIs and measurement — administrator accountability vs opponent slogans.",
    [
      "KPI chapter supports NSI-7 strategic-target-pathway and scenario-simulation answers.",
      "Competence frame: measurable SOS outcomes, not legislative authorship counts.",
    ],
    [
      "Use aggregate metrics only on stage.",
      "Pair with build-audit for RedDirt tooling proof.",
    ],
    [
      { href: PATHWAY, label: "Target pathway" },
      { href: "/admin/intelligence/scenario-simulation", label: "Scenario simulation" },
    ],
    ["author-vs-administrator"],
    ["programs/kpis", "lane"],
  ),
  "programs/compliance": chapter(
    "programs/compliance",
    "Compliance, governance, risk — ethics and counsel alignment.",
    [
      "Compliance chapter backs counsel-review-frame answers when debate turns to ethics.",
      "Meta + compliance = publication safety for all manual-derived lines.",
    ],
    [
      "Mandatory read for staff promoting manual content to Field Book.",
      "Link claims ledger on every new attack line.",
    ],
    [
      { href: "/admin/intelligence/claims", label: "Claims ledger" },
      { href: "/admin/intelligence/diligence", label: "Diligence hub" },
    ],
    [],
    ["programs/compliance", "meta"],
  ),
  "programs/quarterly-rhythm": chapter(
    "programs/quarterly-rhythm",
    "Quarterly execution rhythm — operations cadence for SOS-scale administration.",
    [
      "Quarterly rhythm translates executive-summary operations executive frame into cadence language.",
      "Contrast with Hammer 'writes bills' vs Kelly 'runs quarterly execution'.",
    ],
    [
      "Use for 'first 100 days' moderator questions.",
      "Cross-link campaign-system CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL for staff depth.",
    ],
    [
      { href: `${CSM}/CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL`, label: "Lifecycle manual" },
      { href: "/admin/intelligence/morning-brief", label: "Morning brief" },
    ],
    ["author-vs-administrator"],
    ["programs/quarterly-rhythm", "executive-summary"],
  ),
  appendix: chapter(
    "appendix",
    "Glossary and references — tie to debate glossary registry.",
    [
      "Appendix glossary terms should match debate-glossary Field Book and Phase 5 registry.",
      "On stage, prefer plain-language prep sections over jargon density.",
    ],
    [
      "Promote new terms through Phase 5 glossary upgrade pass before debate use.",
      "Cross-read field-book/glossary index.",
    ],
    [{ href: "/admin/intelligence/field-book/glossary", label: "Debate glossary" }],
    [],
    ["appendix"],
  ),
};

export function getKellyStrategicPlanChapterOverlay(pathKey: string): KellyStrategicPlanChapterOverlay {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  return (
    CHAPTER_OVERLAYS[key] ??
    chapter(
      key,
      "Kelly SOS strategic plan chapter — crosswalk to framework and strategy-philosophy-hub.",
      ["Map this chapter to one debate philosophy briefing before stage use."],
      ["Open strategy-philosophy-hub inventory.", "Verify claims before external use."],
      [{ href: HUB, label: "Strategy hub" }],
      [],
      ["framework"],
    )
  );
}

export function kellyChapterMeetsPhase11P1Bar(overlay: KellyStrategicPlanChapterOverlay): boolean {
  return (
    overlay.debateApplication.length >= 2 &&
    overlay.operatorSteps.length >= 2 &&
    overlay.intelligenceLinks.length >= 3
  );
}

export function countKellyChaptersAtPhase11P1Bar(): { atBar: number; total: number } {
  const keys = STRATEGY_MD_ENTRIES.map((e) => e.path);
  const atBar = keys.filter((k) => kellyChapterMeetsPhase11P1Bar(getKellyStrategicPlanChapterOverlay(k))).length;
  return { atBar, total: keys.length };
}

export const PHASE11_P1_KELLY_CHAPTER_TOTAL = STRATEGY_MD_ENTRIES.length;
