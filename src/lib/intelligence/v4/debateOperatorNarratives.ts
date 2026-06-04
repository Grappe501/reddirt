/**
 * Operator-facing narrative layer for Kelly debate week.
 * Plain-language guidance: why, when, how, campaign trail tie-in, and how pieces connect.
 */

import {
  enrichGuideByHref,
  enrichOperatorGuide,
} from "@/lib/intelligence/v4/debateWhatToLookForEnrichment";
import { applyOperatorGuideDepth } from "@/lib/intelligence/v4/debatePlainLanguageDepth";

export type OperatorGuide = {
  whyItMatters: string;
  howItFitsDebatePrep: string;
  whatToLookFor: string[];
  howToSetUp: string;
  howToUseInDebate: string;
  whenToUse: string;
  campaignTrailUse: string;
  tiesTogether: string;
  /** Plain-language depth — merged from debatePlainLanguageDepth at read time. */
  whatToExpectPlain?: string;
  howHeWillAttack?: string[];
  howToHandleIt?: string[];
  ifYouGetHungUp?: string[];
  handlingAdversity?: string[];
  cultureWarDefense?: string[];
};

export const KELLY_MASTER_FRAME = {
  headline: "Bring Arkansas together — transparent, accountable, non-partisan SOS",
  pillars: [
    "Transparency and accountability: field-tested in independent and Republican rooms — lean in on every answer.",
    "Work across the aisle to unite voters, not widen the division we see in politics today.",
    "Keep this office non-partisan in ballot administration — equal rules, published guidance, no thumb on the scale.",
    "Educate the public: the SOS must teach citizens the rules — Arkansas Civic Index ranks us last; that is accountability on this administration.",
    "County partnership: election workers need training, clarity, and support — not unfunded mandates from legislators.",
    "Participation + integrity: secure elections and lawful access together — not a false choice.",
  ],
  contrastMethod:
    "Acknowledge Hammer’s stated goal (integrity, experience) where fair, then contrast means and implementation burden — never motive without a source. Pivot to unity frame: service desk that educates and unites, not culture-war pulpit.",
  answerArchitecture:
    "Direct answer → transparency/accountability or non-partisan pledge → verified anchor (if citing bills) → county impact → unity bridge (cross-aisle, educate public) → SOS solution.",
};

export const DEBATE_WORKFLOW_STEPS: Array<{
  step: string;
  href: string;
  title: string;
  guide: OperatorGuide;
}> = [
  {
    step: "1",
    href: "/admin/intelligence",
    title: "Start here (command overview)",
    guide: {
      whyItMatters:
        "Debate night fails when you are surprised. This hub orients you on the opponent’s legislative pattern, your rehearsal queue, and what is still unsafe to say in public.",
      howItFitsDebatePrep:
        "Treat this as your pre-flight checklist before opening the 28-section packet. It tells you which themes Hammer will lean on and which bills anchor your best answers.",
      whatToLookFor: [
        "Executive brief ‘tonight focus’ lines — your first 60 seconds of mental model",
        "Top theme driver (petition cluster vs county administration vs enforcement)",
        "Mock debate drill bills — rehearse these before anything else",
        "Claims still needing research — do not say these on stage",
        "2021 integrity package badge — use when Hammer calls 2025 bills ‘new’",
      ],
      howToSetUp:
        "Open hub 30–60 minutes before prep block. Read executive brief, scan theme matrix, click through drill bills once.",
      howToUseInDebate:
        "You do not read the hub on stage. You internalize three moves and two anchor bills so you can redirect any question to verified record + county impact.",
      whenToUse: "Every debate prep session; first screen of the day during debate week.",
      campaignTrailUse:
        "County events: lead with county burden theme from hub. Editorial boards: cite theme matrix bills with act numbers. Fundraising: use ‘service SOS’ frame from executive brief, not attack lines.",
      tiesTogether: "Hub → Debate prep (depth) → Debate command (readiness scores) → Bill drill-down (act proof).",
    },
  },
  {
    step: "2",
    href: "/admin/intelligence/kim-hammer/debate-prep",
    title: "Debate prep (28-section packet)",
    guide: {
      whyItMatters:
        "This is the rehearsal script for values, record contrasts, and rebuttal bridges. Without section-by-section practice, you default to vague integrity talk while Hammer cites bill numbers.",
      howItFitsDebatePrep:
        "Work top-to-bottom once, then circle back to sections 4 (likely Hammer), 6–8 (answers/rebuttal/drill), 19 (2021 package), and 28 (closing checklist) on debate day.",
      whatToLookFor: [
        "Sections with empty bullets — flag staff before public use",
        "Rebuttal playbook agree/contrast/bridge triplets",
        "County and direct democracy sections for likely moderator angles",
        "Risk meter and do-not-say alignment",
      ],
      howToSetUp:
        "Block 90 minutes: 20 min skim all sections, 40 min rehearse drill + argument map aloud, 30 min practice opening/closing out loud.",
      howToUseInDebate:
        "Memorize structure, not paragraphs. When Hammer speaks, match his lane (integrity, experience, petitions) to your rehearsed bridge.",
      whenToUse: "Primary prep surface; night-before and day-of.",
      campaignTrailUse:
        "Town halls: pull county frame from section 13/26. Initiative voters: section 27. Press gaggles: section 12 reporter prep.",
      tiesTogether: "Each numbered section maps to a moderator or Hammer lane — cross-link to bill pages for act citations.",
    },
  },
  {
    step: "3",
    href: "/admin/intelligence/debate-command",
    title: "Debate command (readiness + lanes)",
    guide: {
      whyItMatters:
        "Readiness scores show where research is thin before you discover it on live TV. Message lanes keep you from drifting into unsupported attack lines.",
      howItFitsDebatePrep:
        "Use after debate prep skim to validate confidence. If film room or transcript lanes are empty, do not imply you have video proof on stage.",
      whatToLookFor: [
        "Debate prep brief score below 70",
        "Coverage gaps in film room",
        "Recommended lanes vs your planned opening",
        "Warnings flagged in red/amber",
      ],
      howToSetUp: "Open after hub; compare readiness scorecard to executive brief archive score.",
      howToUseInDebate:
        "If a lane is BLOCKED in command, avoid that attack line in debate; use county service frame instead.",
      whenToUse: "Day-of debate; staff use during mock debate.",
      campaignTrailUse:
        "Less useful on trail than hub/prep; use opposition brief scores to decide which lines are ready for TV ads or mail.",
      tiesTogether: "Validates what debate prep assumes; links to scenario simulation for trap warnings.",
    },
  },
  {
    step: "4",
    href: "/admin/intelligence/kim-hammer",
    title: "Opponent record (module map)",
    guide: {
      whyItMatters:
        "Hammer’s record is broad. The module map shows which deep dives exist without loading every staff tool on debate day.",
      howItFitsDebatePrep:
        "Use for staff deep dives. Kelly should stay on hub → debate prep → bills unless a moderator announces a specific bill.",
      whatToLookFor: ["Intelligence gaps count", "Theme matrix on command center page", "Links to 2021 package"],
      howToSetUp: "Staff assigns retrieval tasks from gaps list; Kelly reviews only highlighted modules.",
      howToUseInDebate: "Kelly rarely opens this live — pre-mark 3 modules worth mentioning if asked.",
      whenToUse: "Staff research sessions; optional deep prep for policy-heavy formats.",
      campaignTrailUse: "Researchers pull county-administration-burden and direct-democracy modules for local op-eds.",
      tiesTogether: "Modules feed bill drill-downs and claims verification.",
    },
  },
  {
    step: "5",
    href: "/admin/intelligence/claims",
    title: "Verify claims",
    guide: {
      whyItMatters:
        "One unsupported sentence can define the news cycle. This surface separates what is sourced from what still needs human review.",
      howItFitsDebatePrep:
        "Cross-check any line you plan to say in sections 11 (risk) and 24 (citation discipline). If it appears in ‘needs research,’ cut or soften it.",
      whatToLookFor: [
        "Claims marked needs research",
        "Ledger entries stuck in DRAFT",
        "Missing citation anchors",
        "Public adaptation approvals (should be zero before debate)",
      ],
      howToSetUp: "Staff reviews top 10 debate lines against ledger; Kelly reviews only flagged items.",
      howToUseInDebate: "Do not cite statistics or motives without VERIFIED_FACT or supported markdown row.",
      whenToUse: "Before any public debate; before interviews after debate.",
      campaignTrailUse: "Any TV spot, mail piece, or Facebook post must pass same gate as debate lines.",
      tiesTogether: "Feeds risk meter in prep; connects to evidence-command for export-ready claims.",
    },
  },
];

const CLAIMS_SURFACE_GUIDE: OperatorGuide = {
  whyItMatters:
    "Legal and reputational firewall — one unsupported line can define the news cycle. P2 links synopsis markdown to the governed ledger with debate-week tags.",
  howItFitsDebatePrep:
    "Step 5 after debate prep skim: green queue = internal-rehearsal OK; red = do-not-say from hub risk list; amber = finish sourcing. Sections 11 (risk) and 24 (citation discipline) depend on this screen.",
  whatToLookFor: [
    "HUMAN_APPROVED_INTERNAL — safe for rehearsal, not auto-approved for TV",
    "REJECTED / DO_NOT_USE — never on stage",
    "citationAnchorIds empty — do not cite statistics",
    "Safer wording column in claims-review table vs raw synopsis claim",
  ],
  howToSetUp:
    "Run seed once per deploy refresh if ledger empty: npx tsx scripts/seed-debate-week-claims.ts. Staff maps each planned debate line to a ledger row before mock debate.",
  howToUseInDebate:
    "Kelly does not read the ledger on stage. Staff verifier on headset; if a line is not green, Kelly softens or uses research-question framing.",
  whenToUse: "Before debate, before interviews, before any rapid-response post.",
  campaignTrailUse: "Same gate for ads, mail, and surrogates — public adaptation requires separate approval on claim detail.",
  tiesTogether: "claims-review table → ledger rows → evidence-command export tier → hub do-not-say list.",
};

export const SURFACE_GUIDES: Record<string, OperatorGuide> = {
  debatePrepPage: {
    whyItMatters:
      "This is the full rehearsal packet — not a skim. Twenty-eight sections walk you from strategy through closing checklist so you never improvise a high-stakes election-law answer.",
    howItFitsDebatePrep:
      "Run hub first for orientation, then live here for 90-minute blocks. Executive brief at top is your compressed ‘tonight’ view; rehearsal deck and argument map are oral practice; numbered sections are reference depth.",
    whatToLookFor: [
      "Sections with empty bullets — staff must fill before public use",
      "Rehearsal deck risk tags — drill HIGH risk bills twice",
      "Section 19 (2021 package) before any ‘new pivot’ rebuttal",
      "Section 28 closing checklist five minutes before stage",
    ],
    howToSetUp:
      "Block 90 min: 15 min executive brief + argument map, 40 min stand-and-deliver drill cards, 35 min scroll sections 4, 6–8, 13, 19, 28 with bill tabs open.",
    howToUseInDebate:
      "You internalize structure, not paragraphs. When Hammer cites a bill, you already drilled that card; when he generalizes, you use argument-map bridges.",
    whenToUse: "Night before and morning of debate; primary Kelly prep surface.",
    campaignTrailUse:
      "Town halls: sections 13/26 county. Petition voters: 14/27. Press: 12/25 reporter + media follow-up.",
    tiesTogether: "Hub step 2 → bill drill-downs → claims step 5 → debate command validation.",
  },
  executiveBrief: {
    whyItMatters:
      "Compresses the entire opposition profile into headline, tonight focus, three moves, and readiness scores — the last thing Kelly should read before walking in.",
    howItFitsDebatePrep:
      "Mirrors prep section ‘executive-tonight’ and hub scorecard. If archive confidence is low, narrow claims on stage.",
    whatToLookFor: [
      "Tonight focus lines — memorize order",
      "Three moves — one sentence each in your voice",
      "Readiness dimension under 70 — avoid that lane publicly",
      "Archive confidence vs claims ‘needs research’ count",
    ],
    howToSetUp: "Screenshot three moves; staff prints one page if venue has no devices.",
    howToUseInDebate: "Mental reset when lost — return to headline and first move.",
    whenToUse: "Last 10–15 minutes before stage; after mock debate debrief.",
    campaignTrailUse: "Staff distills into one-page county briefing; not for voter handouts.",
    tiesTogether: "Hub + debate prep header; debate command scores validate it.",
  },
  hub: {
    whyItMatters: "Single orientation point for debate week — prevents scattered deep dives that cause timeouts and confusion.",
    howItFitsDebatePrep: "Feeds every other surface; executive brief is the narrative spine.",
    whatToLookFor: ["Drill queue bills", "Theme matrix top row", "Argument map preview", "Claims needing research count"],
    howToSetUp: "Start every session here; share nothing publicly from this URL.",
    howToUseInDebate: "Internal only; memorize outputs not screens.",
    whenToUse: "First and last screen each prep day.",
    campaignTrailUse: "Staff translates hub themes into county-specific one-pagers.",
    tiesTogether: "Step 1 of five-step path.",
  },
  rehearsalDeck: {
    whyItMatters: "Muscle memory for bill-tied answers — debates turn on whether you can name acts and county impact under pressure.",
    howItFitsDebatePrep: "Sections 8 (drill) and 6 (answer builder) in concrete card form.",
    whatToLookFor: ["30s vs 60s length discipline", "Rebuttal pivot line", "Risk level on each card"],
    howToSetUp: "Stand and deliver each card aloud twice; time with phone.",
    howToUseInDebate: "When moderator asks about a bill in drill queue, use 30s structure; follow-up gets 60s.",
    whenToUse: "Night before debate; morning of debate.",
    campaignTrailUse: "Practice county questions using same 30s structure at Lincoln Day dinners.",
    tiesTogether: "Each card links to bill drill-down for deeper narrative.",
  },
  argumentMap: {
    whyItMatters: "Hammer will repeat predictable lanes (integrity, experience, uniformity). Map gives you agree/contrast/bridge without sounding defensive.",
    howItFitsDebatePrep: "Section 4 (likely Hammer) and 16 (argument map) — rehearse bridges until natural.",
    whatToLookFor: ["Evidence he may cite", "Agree line — use first", "Kelly bridge — last sentence before pivot"],
    howToSetUp: "Read each row; write one personal sentence for each bridge in your voice.",
    howToUseInDebate: "On rebuttal time: agree → contrast on implementation → bridge to SOS service.",
    whenToUse: "Whenever Hammer generalizes without bill numbers — redirect to map lane then act anchor.",
    campaignTrailUse: "TV interviews: same bridges work for ‘why not Hammer’ questions.",
    tiesTogether: "Pairs with rebuttal playbook JSON and debate profile markdown.",
  },
  themeMatrix: {
    whyItMatters: "Shows pattern, not one-off bills — voters hear ‘integrity package’ not isolated SB numbers.",
    howItFitsDebatePrep: "Section 21; hub top theme; ties to 2021 package narrative.",
    whatToLookFor: ["Petition cluster density", "County administration bills", "Which themes overlap same bill"],
    howToSetUp: "Pick one theme to own tonight (usually county burden or direct democracy).",
    howToUseInDebate: "‘The pattern matters: multiple bills in [theme] shift burden to counties without…’",
    whenToUse: "When asked ‘why so many election bills?’",
    campaignTrailUse: "County clerk meetings: open with their theme row bills.",
    tiesTogether: "Click bill → drill-down; compare timeline for accumulation story.",
  },
  timeline: {
    whyItMatters: "Proves continuity — Hammer may claim 2025 is a new direction; timeline shows architecture back to 2021.",
    howItFitsDebatePrep: "Section 20; supports 2021 integrity package section 19.",
    whatToLookFor: ["2021 cluster", "Sponsor role", "Impact categories stacking"],
    howToSetUp: "Scan by year; mark three rows to cite with act numbers verified.",
    howToUseInDebate: "‘This did not start last session — in [year] you sponsored [bill/act] which…’",
    whenToUse: "Rebutting ‘recent reaction’ framing.",
    campaignTrailUse: "Editorial board chronology charts for policy stories.",
    tiesTogether: "Bill pages show timeline hits per bill.",
  },
  billDrilldown: {
    whyItMatters: "Act-level proof is your credibility anchor — generalities lose to Hammer’s bill citations.",
    howItFitsDebatePrep: "Destination from drill cards and theme matrix; read strategic briefing ‘when to use / when not to use.’",
    whatToLookFor: [
      "Kelly vs Hammer vs county frames",
      "Publication risk tag",
      "2021 package badge",
      "Office-stacking research question block",
    ],
    howToSetUp: "Open bill from drill queue; read narrative + county impact; verify act on Arkleg if high stakes.",
    howToUseInDebate: "Name bill and act once, then county impact, then Kelly frame — never stack motives.",
    whenToUse: "Whenever that bill is named by moderator or opponent.",
    campaignTrailUse: "County-specific mail: one bill, one county impact paragraph.",
    tiesTogether: "Feeds answer builder and rehearsal deck.",
  },
  claims: CLAIMS_SURFACE_GUIDE,
  debateCommand: {
    whyItMatters: "Sanity-check before lights go up — scores reflect research depth, not spin.",
    howItFitsDebatePrep: "After packet skim; confirms which lanes are safe.",
    whatToLookFor: ["Scores under 70", "Empty film room", "Trap warnings"],
    howToSetUp: "Staff runs legislature pipeline if transcript lanes empty.",
    howToUseInDebate: "Avoid BLOCKED lanes; lean on READY lanes from brief pack.",
    whenToUse: "Day-of; post-mock debate review.",
    campaignTrailUse: "Decide which research is ready for paid media.",
    tiesTogether: "Step 3 of workflow.",
  },
  scenarioSimulation: {
    whyItMatters: "Surfaces trap questions and high-risk lanes before mock debate — reduces clip-worthy mistakes.",
    howItFitsDebatePrep: "Run after debate prep skim and before debate command; debrief scenarios with risk section 11.",
    whatToLookFor: ["HIGH risk score scenarios", "whatNotToDo lines", "Linked bills and narratives"],
    howToSetUp: "Staff runs simulation; Kelly reads top 3 HIGH risk cards only.",
    howToUseInDebate: "When a scenario matches live question, use pre-written avoid line and pivot to county frame.",
    whenToUse: "Night-before mock debate; staff prep for spin room traps.",
    campaignTrailUse: "Town hall prep for hostile Q&A — same trap warnings.",
    tiesTogether: "Debate command warnings + argument map.",
  },
  evidenceCommand: {
    whyItMatters:
      "Staff export and citation discipline — which Hammer claims are export-ready vs blocked. Keeps debate and press lines tied to verified anchors.",
    howItFitsDebatePrep:
      "Open after Claims (step 5). Headset staff filter export-ready claims and close HIGH retrieval tasks before Kelly cites bills on stage.",
    whatToLookFor: [
      "Export-ready count — only these IDs in debate packet / rapid response",
      "NEEDS_REVIEW and BLOCKED — never read aloud",
      "Claim review panel — transition to APPROVED_FOR_EXTERNAL_USE",
      "Retrieval task panel — HIGH rank open tasks",
    ],
    howToSetUp: "Debate week: use condensed view + links to claims, action queue, LLM review.",
    howToUseInDebate: "Kelly does not use live — staff whispers only export-ready act numbers.",
    whenToUse: "Pre-debate staff huddle; spin room; post-debate quote check.",
    campaignTrailUse: "Same export filter for mail, digital, and county handouts.",
    tiesTogether: "Claims → evidence command → citation locker → debate packet export.",
  },
  debateProfile: {
    whyItMatters: "Argument lanes Hammer will use — integrity, experience, uniformity — with Kelly response frames.",
    howItFitsDebatePrep: "Pairs with likely-arguments and rebuttal prep; section 4 of the 28-section packet.",
    whatToLookFor: ["High-probability lanes", "Practice questions", "Risky phrasing to avoid"],
    howToSetUp: "Skim markdown sections; cross-link to argument map.",
    howToUseInDebate: "Match his lane to a rehearsed frame before citing acts.",
    whenToUse: "Pre-mock debate and when moderator goes policy-heavy.",
    campaignTrailUse: "County forums: use county-impact frames from profile lanes.",
    tiesTogether: "Debate prep section 4 → argument map → bill drill-downs.",
  },
  contrastVsKelly: {
    whyItMatters: "Values-forward contrast without motive attacks — how Kelly differs on methods and county burden.",
    howItFitsDebatePrep: "Feeds core-frame and pillars sections.",
    whatToLookFor: ["Evidence status per frame", "Hammer position summaries", "Safer contrast wording"],
    howToSetUp: "Pick two frames to own tonight (trust + counties).",
    howToUseInDebate: "Acknowledge goal → contrast implementation → bridge to SOS service.",
    whenToUse: "Whenever Hammer generalizes about 'integrity'.",
    campaignTrailUse: "Editorial boards and TV hits — same frames, shorter.",
    tiesTogether: "Argument map bridges + hub executive brief.",
  },
  rebuttalPrep: {
    whyItMatters: "Structured agree/contrast/bridge triplets — prevents defensive tone on live TV.",
    howItFitsDebatePrep: "Section 16 argument map and section 7 rebuttal drills.",
    whatToLookFor: ["Kelly bridge line", "Evidence status", "Source category"],
    howToSetUp: "Rehearse each prompt aloud once in your voice.",
    howToUseInDebate: "Rebuttal time: agree → contrast → bridge → act anchor.",
    whenToUse: "Live rebuttal segments and hostile follow-ups.",
    campaignTrailUse: "Press gaggles after county events.",
    tiesTogether: "Likely arguments JSON + debate profile markdown.",
  },
  strengthsWeaknesses: {
    whyItMatters: "Fair acknowledgment of opponent strengths plus debate-safe vulnerability wording.",
    howItFitsDebatePrep: "Sections 17–18 of v4 prep extension.",
    whatToLookFor: ["Evidence status on strengths", "Safer wording on weaknesses", "Debate usefulness tags"],
    howToSetUp: "Memorize one strength to acknowledge and two safer vulnerability framings.",
    howToUseInDebate: "Acknowledge strength briefly; pivot to county implementation contrast.",
    whenToUse: "When Hammer cites experience or coalition support.",
    campaignTrailUse: "Avoid raw vulnerability lines in paid media — use safer wording only.",
    tiesTogether: "Argument map + claims gate.",
  },
  intelligenceGaps: {
    whyItMatters: "Open retrieval tasks block export-ready messaging — debate lines need closure or research framing.",
    howItFitsDebatePrep: "Section 23 retrieval queue; hub claims count.",
    whatToLookFor: ["HIGH priority tasks", "CLOSED vs OPEN status", "Recommended human action"],
    howToSetUp: "Staff assigns owners before debate; Kelly avoids OPEN gap topics on stage.",
    howToUseInDebate: "Do not cite gaps marked needs research — use question framing instead.",
    whenToUse: "Staff prep only; Kelly uses hub do-not-say list.",
    campaignTrailUse: "Prioritize county video and forum retrieval before mail drops.",
    tiesTogether: "Action queue + claims ledger.",
  },
  backgroundDeep: {
    whyItMatters: "Deep dossier context for staff — education, civic work, writings — not for verbatim debate quotes.",
    howItFitsDebatePrep: "KH-3 layer when moderator goes biographical.",
    whatToLookFor: ["Evidence status tags", "INTERPRETATION vs VERIFIED", "Thin sections flagged"],
    howToSetUp: "Staff briefs Kelly on at most two biographical facts with sources.",
    howToUseInDebate: "Only cite items staff pre-verified — never improvise biography.",
    whenToUse: "Rare on debate night unless personality attack surfaces.",
    campaignTrailUse: "Long-form profiles and research memos.",
    tiesTogether: "Profile modules KH-1 + archive store.",
  },
  integrity2021: {
    whyItMatters: "Six-bill 2021 package proves continuity when Hammer claims a 2025 pivot.",
    howItFitsDebatePrep: "Section 19; timeline rows for same years.",
    whatToLookFor: ["Bill numbers with acts", "Narrative arc bullets", "Strategic briefing notes"],
    howToSetUp: "Link each package bill to a drill card.",
    howToUseInDebate: "‘This architecture started in 2021 with [bills/acts]…’",
    whenToUse: "Rebutting ‘new direction’ or ‘only recent bills’ framing.",
    campaignTrailUse: "Policy stories and county clerk briefings.",
    tiesTogether: "Theme matrix + timeline + bill pages.",
  },
  websiteAnalysis: {
    whyItMatters: "How Hammer messages publicly — predict lines he will repeat on stage.",
    howItFitsDebatePrep: "Informs likely-arguments and message-analysis lanes.",
    whatToLookFor: ["Integrity framing", "Experience claims", "County references"],
    howToSetUp: "Compare website bullets to debate profile lanes.",
    howToUseInDebate: "When he quotes his own site — redirect to record and county impact.",
    whenToUse: "Pre-debate research block for staff.",
    campaignTrailUse: "Rapid response when opponent updates site.",
    tiesTogether: "Likely arguments + contrast frames.",
  },
  messageAnalysis: {
    whyItMatters: "Election-record messaging guidance — county concerns and reporter questions.",
    howItFitsDebatePrep: "Sections 12–14 and county/direct democracy drills.",
    whatToLookFor: ["County official concerns", "Reporter question bank", "Direct democracy critiques"],
    howToSetUp: "Align top 3 reporter questions with drill queue bills.",
    howToUseInDebate: "Press gaggle and town hall Q&A — same discipline as debate.",
    whenToUse: "Post-debate media and trail events.",
    campaignTrailUse: "County-specific mail and clerk meetings.",
    tiesTogether: "Hub report questions + claims review.",
  },
  rapidResponse: {
    whyItMatters: "Pre-staged evidence locker items for staff spin room — not Kelly on-stage reading.",
    howItFitsDebatePrep: "Section 22 rapid response; pairs with evidence command.",
    whatToLookFor: ["Verification status", "Category tags", "NON_PUBLISHABLE items"],
    howToSetUp: "Staff marks export-ready items before debate ends.",
    howToUseInDebate: "Kelly does not read locker live — staff confirms citations post-debate.",
    whenToUse: "Spin room and same-night social.",
    campaignTrailUse: "All outbound comms after claims gate.",
    tiesTogether: "Evidence command + claims.",
  },
  debateWarRoomP4: {
    whyItMatters:
      "Film room + cross-exam + argument library turn record into performance prep — how to bait pivots and use clips without fake certainty.",
    howItFitsDebatePrep:
      "Run after debate prep skim, before stage. Pairs with bill playbooks (step-by-step) and trap lanes.",
    whatToLookFor: [
      "Direct clip count — do not imply video proof if zero",
      "Speaker verification warnings on legislative chunks",
      "Cross-exam questions tied to bill anchors",
      "Social snippets marked claims-gate",
    ],
    howToSetUp:
      "Staff: verify one clip quote; Kelly: rehearse 3 cross-exam pivots and 2 argument-library bridges aloud.",
    howToUseInDebate:
      "Kelly does not play clips live — staff tracks timestamp; Kelly uses pivots when opponent bites on setup questions.",
    whenToUse: "Debate command step 3; film room night-before; post-debate social only after claims review.",
    campaignTrailUse:
      "County events: use cross-exam questions in town hall Q&A; social team uses thread outlines after gate.",
    tiesTogether: "Legislative video + opposition clips + argument map + bill drill-downs.",
  },
  crossExamBank: {
    whyItMatters: "Questions that force implementation detail — where sponsor record is weakest vs SOS service job.",
    howItFitsDebatePrep: "Section 5 question bank + trap positioning playbook.",
    whatToLookFor: ["Bill-anchored questions", "HIGH risk tags", "Kelly pivot line"],
    howToSetUp: "Pick 5 questions; assign staff to track answers in spin room.",
    howToUseInDebate: "Ask when opponent cites bill without county detail; stay calm — not prosecutorial tone.",
    whenToUse: "Rebuttal and Q&A blocks.",
    campaignTrailUse: "Press questions to opponent (not Kelly on stage) — adapt wording.",
    tiesTogether: "Bill playbooks + 2021 package trap.",
  },
  "debate-depth-index": {
    whyItMatters:
      "Plain-language layer on top of every intelligence surface — what to expect, how Hammer attacks, how to handle adversity, recovery if stuck, and culture-war defense.",
    howItFitsDebatePrep:
      "Read culture-war and if-stuck before mock debate; read hammer-attacks before trap lanes; use three-way before SOS bank rehearsal.",
    whatToLookFor: [
      "Five topic guides with full depth blocks",
      "Auto depth on hub, prep sections, SOS questions, trap lanes",
      "Links from culture-war guide to trap lane 6",
    ],
    howToSetUp: "Kelly: 45 min on culture-war + if-stuck + one trap lane; staff: hammer-attacks + adversity.",
    howToUseInDebate: "Memorize recovery lines — not full paragraphs.",
    whenToUse: "Night before debate; green room if bait expected.",
    campaignTrailUse: "Town halls: adversity and stuck recovery apply without three-way complexity.",
    tiesTogether: "Hub depth hub → trap lanes → SOS bank → coaching.",
  },
  kellyDebateCoaching: {
    whyItMatters:
      "Stage presence, openings/closings, Check My Record, and three-way dynamics — the human performance layer on top of policy prep.",
    howItFitsDebatePrep:
      "After debate prep sections 9 and 28; before walk-on. Pairs with film room pivots, not clip playback on stage.",
    whatToLookFor: [
      "Opening and closing memorized",
      "Road stories with claims gate",
      "Packo agreement traps",
      "Copilot dock — internal only",
    ],
    howToSetUp: "Rehearse opening standing; staff times closing under broadcast limit.",
    howToUseInDebate: "Middle answers from SOS bank; bookends from coaching.",
    whenToUse: "Debate morning and green room.",
    campaignTrailUse: "Town hall openings shortened; same composure rules.",
    tiesTogether: "Hub → coaching → SOS questions → trap lanes.",
  },
  opponents: {
    whyItMatters:
      "Routes to Hammer record and Packo scaffold — staff research depth; Kelly uses distilled prep surfaces on debate night.",
    howItFitsDebatePrep:
      "Staff assigns modules by gap; Kelly stays on hub, prep, SOS bank, trap lanes, coaching.",
    whatToLookFor: ["Packo scaffold status", "KH module gaps", "Evidence command link"],
    howToSetUp: "Staff briefing 30 min before stage on Packo one-liners only.",
    howToUseInDebate: "Kelly does not browse modules on stage.",
    whenToUse: "Weekly research; debate day staff only.",
    campaignTrailUse: "Opposition research for rapid response.",
    tiesTogether: "Kim-hammer command center → bills → claims.",
  },
  "agent-tooling-index": {
    whyItMatters:
      "Single debate-week hub for governed AI copilot runs — sequences for staff T-24h, Kelly pre-stage, and spin room without hunting 30 tools across modules.",
    howItFitsDebatePrep:
      "Run after debate prep skim: execute Kelly pre-stage sequence, then open SOS question bank for speak-order rehearsal. Staff runs source-gap + claim-strength before export-ready lines go to headset.",
    whatToLookFor: [
      "Readiness signals — export-ready claims and open retrieval tasks",
      "Sequence steps — run in order; each output is INTERNAL_DRAFT",
      "Trap + rebuttal tools — pair with trap lanes and Claims gate",
      "LLM review queue link when NSI-12 draft is queued",
    ],
    howToSetUp: "Open hub → run staff T-24h OR Kelly pre-stage sequence → verify output in Claims.",
    howToUseInDebate: "Kelly does not run tools on stage — staff may re-run trap detector in spin room only.",
    whenToUse: "Night-before prep, green-room (iPad quick tools), post-debate staff debrief.",
    campaignTrailUse: "Shorten to what-not-to-say + 30/60/90 on town hall days — same governance.",
    tiesTogether: "AI tools registry + debate AI workbench + SOS bank + evidence command + LLM queue.",
  },
  "sos-debate-questions-index": {
    whyItMatters:
      "Moderators ask SOS-office questions, not bill trivia. Researched prompts with 1st/2nd/3rd speak-order drills — lean into field-tested unity themes (transparency, accountability, cross-aisle, non-partisan, public education, Civic Index accountability).",
    howItFitsDebatePrep:
      "Run after debate prep skim and before mock debate. Open hub narrative spine, then rehearse HIGH topics with unity lines — especially turnout/civic index, non-partisan role, and opening/closing.",
    whatToLookFor: [
      "Speak order block — fresh addition mandatory; weave unity theme when agreeing",
      "Field-tested themes panel on hub — GREAT reaction in independent and Republican rooms",
      "Arkansas Civic Index 'last in country' — verify in claims before citing rank on stage",
      "Hammer likely lines + Packo three-way add-ons",
    ],
    howToSetUp: "Index → open 5 questions → read 30s answer → practice position 2 and 3 closes.",
    howToUseInDebate: "When moderator asks broad SOS question, use direct 30s then add county clerk line; if others agreed first, use position-2 or -3 script.",
    whenToUse: "Opening/closing blocks and integrity/access segments.",
    campaignTrailUse: "Town halls: shorten 60s answer; keep agree-plus-fresh-add discipline.",
    tiesTogether: "Trap lanes for record fights + film room for clip proof + claims gate.",
  },
  "trap-lanes-index": {
    whyItMatters:
      "Six trap lanes position Hammer into Kelly's hand — bait, setup question, pivot. Summary cards on hub link here for full narrative, rebuttals, and scripts.",
    howItFitsDebatePrep:
      "Run after argument map and before mock debate. Pick 1–2 lanes for tonight's lead theme (usually petition pattern or Check My Record).",
    whatToLookFor: [
      "Each lane drill-down: what Hammer will say, setup moves, sample scripts",
      "Offensive vs defensive tags on expanded findings below",
    ],
    howToSetUp: "Read index → open 2 lanes → rehearse 45s script standing.",
    howToUseInDebate: "Deploy setup question when moderator allows; pivot when he bites or deflects.",
    whenToUse: "Mid-debate record fights; after he says check my record.",
    campaignTrailUse: "Town hall hostile Q: use county-champion or fraud-dare lanes without debate tone.",
    tiesTogether: "Opponent contrast panel + Check My Record coaching + bill acts.",
  },
  opponentRecord: {
    whyItMatters: "Map of staff research modules — keeps Kelly from drowning in 40+ pages.",
    howItFitsDebatePrep: "Staff navigation; Kelly uses hub/debate prep instead on debate day.",
    whatToLookFor: ["Gap list", "Theme matrix duplicate", "2021 package summary"],
    howToSetUp: "Assign modules to researchers by gap priority.",
    howToUseInDebate: "Kelly: only if pre-briefed on 2–3 modules.",
    whenToUse: "Weekly research meetings.",
    campaignTrailUse: "Build county and initiative voter content from module exports.",
    tiesTogether: "Step 4; links to evidence-command for staff.",
  },
};

export const PREP_SECTION_GUIDES: Record<string, OperatorGuide> = {
  strategy: {
    whyItMatters: "Sets your debate goal: educate on record and SOS philosophy, not win a courtroom argument.",
    howItFitsDebatePrep: "Foundation for sections 2–14; revisit if you feel pulled into attack mode.",
    whatToLookFor: ["Educate vs attack language", "Mock debate structure reminders", "High-probability lanes from debate profile"],
    howToSetUp: "Read purpose paragraphs from debate profile markdown in hub background.",
    howToUseInDebate: "When tempted to interrupt — return to educate frame.",
    whenToUse: "Opening of prep block.",
    campaignTrailUse: "Same educate frame for town halls — less rebuttal, more explain.",
    tiesTogether: "Feeds pillars (section 3) and opening (section 9).",
  },
  "core-frame": {
    whyItMatters: "Your north star contrast: service, transparency, counties — not personality warfare.",
    howItFitsDebatePrep: "Every answer should trace back here.",
    whatToLookFor: ["Contrast bullets vs Kelly SOS-as-service", "Avoid motive claims without sources"],
    howToSetUp: "Write one sentence version in your own words.",
    howToUseInDebate: "Closing line of many answers.",
    whenToUse: "Whenever debate gets heated.",
    campaignTrailUse: "Sticker message for trail: trust + counties + participation.",
    tiesTogether: "Links to contrast-vs-Kelly research and argument map.",
  },
  pillars: {
    whyItMatters: "Three buckets voters remember after debate.",
    howItFitsDebatePrep: "Organize drill cards and bill narratives under these three.",
    whatToLookFor: ["Trust/transparency examples", "County support examples", "Participation + integrity examples"],
    howToSetUp: "Assign top 3 bills to each pillar.",
    howToUseInDebate: "Tag answers: ‘That’s a county support issue…’",
    whenToUse: "Structuring 60s answers.",
    campaignTrailUse: "Three pillars = three mail themes.",
    tiesTogether: "Sections 13 county, 27 direct democracy map to pillars.",
  },
  "likely-hammer": {
    whyItMatters: "No surprises — you have heard these lines before moderator asks.",
    howItFitsDebatePrep: "Pairs with argument map and section 16.",
    whatToLookFor: ["Bill anchors he may cite", "Heritage/ranking claims — verify before repeating"],
    howToSetUp: "Rehearse each bullet with a rebuttal bridge.",
    howToUseInDebate: "Listen for lane; deploy matching bridge.",
    whenToUse: "Live rebuttal segments.",
    campaignTrailUse: "Anticipate same lines at GOP forums you attend as observer.",
    tiesTogether: "Bill question bank section 5.",
  },
  "question-bank": {
    whyItMatters: "Moderators often use bill-specific questions drawn from public record.",
    howItFitsDebatePrep: "Turn each question into a drilled 60s with act number.",
    whatToLookFor: ["Top questions from hub", "When-to-use notes on narrative cards"],
    howToSetUp: "Practice answering top 5 aloud.",
    howToUseInDebate: "Direct answer first — do not dodge.",
    whenToUse: "Q&A and cross-examination blocks.",
    campaignTrailUse: "County press often asks same bill questions.",
    tiesTogether: "Bill drill-downs.",
  },
  "answer-builder": {
    whyItMatters: "Stops rambling — voters remember structured answers.",
    howItFitsDebatePrep: "Template for rehearsal deck 30s/60s.",
    whatToLookFor: ["Direct answer first", "Act anchor", "Values contrast", "Bridge"],
    howToSetUp: "Rewrite one drill card using all five steps explicitly.",
    howToUseInDebate: "Under time pressure, skip only county impact if clock runs out — never skip act anchor if you have it.",
    whenToUse: "Every substantive question.",
    campaignTrailUse: "Same five steps at Lincoln Day Q&A.",
    tiesTogether: "Section 28 checklist.",
  },
  rebuttal: {
    whyItMatters: "Rebuttal wins perception without sounding angry.",
    howItFitsDebatePrep: "Uses agree/contrast/bridge from argument map.",
    whatToLookFor: ["Acknowledge integrity goal", "Implementation burden pivot"],
    howToSetUp: "Practice one rebuttal with a friend playing Hammer.",
    howToUseInDebate: "Short sentences; end on bridge.",
    whenToUse: "After Hammer attacks your record or SOS readiness.",
    campaignTrailUse: "Surrogate briefings use same structure.",
    tiesTogether: "Rehearsal deck rebuttal hints.",
  },
  drill: {
    whyItMatters: "Performance prep — debate is oral, not reading.",
    howItFitsDebatePrep: "Same content as hub rehearsal deck.",
    whatToLookFor: ["Risk on each card", "60s paragraphs for substance"],
    howToSetUp: "Timed run-through all cards.",
    howToUseInDebate: "Muscle memory from cards.",
    whenToUse: "Final prep block.",
    campaignTrailUse: "Oral practice for high-stakes interviews.",
    tiesTogether: "Hub rehearsal deck UI.",
  },
  opening: {
    whyItMatters: "First impression sets trust for entire debate.",
    howItFitsDebatePrep: "Pull how-to-message from top narrative cards.",
    whatToLookFor: ["Service over culture war", "County partnership", "No unsupported bombs"],
    howToSetUp: "Write 90-second opening; read aloud 5 times.",
    howToUseInDebate: "Deliver calm and concrete — one act optional, not ten.",
    whenToUse: "Opening statement block.",
    campaignTrailUse: "Stump speech intro — same tone.",
    tiesTogether: "Core frame + pillars.",
  },
  closing: {
    whyItMatters: "What voters remember last: competence and calm.",
    howItFitsDebatePrep: "Mirror opening pillars with forward-looking SOS vision.",
    whatToLookFor: ["Trust, counties, participation", "Why SOS matters daily"],
    howToSetUp: "Memorize closing checklist section 28.",
    howToUseInDebate: "End on Kelly vision, not Hammer attack.",
    whenToUse: "Closing statement.",
    campaignTrailUse: "Rally close before GOTV ask.",
    tiesTogether: "Executive brief three moves.",
  },
  risk: {
    whyItMatters: "Protects campaign from legal and fairness blowback.",
    howItFitsDebatePrep: "Do-not-say list on hub.",
    whatToLookFor: ["Motive claims", "Fraud without evidence", "Needs research count"],
    howToSetUp: "Staff reads risk bullets to Kelly before walk-on.",
    howToUseInDebate: "If unsure, use research-question framing or omit.",
    whenToUse: "Before stepping on stage.",
    campaignTrailUse: "Applies to all public comms.",
    tiesTogether: "Claims page.",
  },
  reporter: {
    whyItMatters: "Spin room and next-day stories follow predictable questions.",
    howItFitsDebatePrep: "Section 25 media follow-up extends this.",
    whatToLookFor: ["Report questions list", "Message guidance reporter section"],
    howToSetUp: "Prepare 3 crisp quotes with act anchors.",
    howToUseInDebate: "Stay on record — do not freelance new claims.",
    whenToUse: "Post-debate gaggle prep.",
    campaignTrailUse: "Press availabilities on trail.",
    tiesTogether: "Claims verification before quoting.",
  },
  county: {
    whyItMatters: "County clerks and election workers are credibility validators for SOS race.",
    howItFitsDebatePrep: "Sections 26 deep dive; Kelly’s differentiator vs legislator record.",
    whatToLookFor: ["Unfunded mandates", "Training and support gaps", "County frame on bill cards"],
    howToSetUp: "Name one Arkansas county example if verified locally.",
    howToUseInDebate: "‘County officials have to implement this — the SOS office should help, not pile on.’",
    whenToUse: "County impact questions; rural audience events.",
    campaignTrailUse: "Core trail message for clerk endorsements.",
    tiesTogether: "County administration theme row.",
  },
  "direct-democracy": {
    whyItMatters: "Initiative voters are a key persuasion cluster — Hammer record includes petition restrictions.",
    howItFitsDebatePrep: "Section 27 petition cluster.",
    whatToLookFor: ["HB/SB petition bills in theme matrix", "Access vs security framing"],
    howToSetUp: "Verify act text before citing signature rules.",
    howToUseInDebate: "Respect security goal; contrast process burden on citizens and counties.",
    whenToUse: "Petition or ballot initiative questions.",
    campaignTrailUse: "Direct democracy advocates, initiative campaigns.",
    tiesTogether: "Petition theme matrix bills.",
  },
  "executive-tonight": {
    whyItMatters: "Compresses entire packet into three moves for debate night.",
    howItFitsDebatePrep: "Read immediately before walking into venue.",
    whatToLookFor: ["Tonight focus bullets", "Headline", "Archive confidence"],
    howToSetUp: "Screenshot or print three moves.",
    howToUseInDebate: "Mental anchor when lost.",
    whenToUse: "Last 10 minutes before stage.",
    campaignTrailUse: "Staff distills for rapid briefing doc.",
    tiesTogether: "Hub executive brief.",
  },
  "argument-map": {
    whyItMatters: "Structured rebuttal without ad hominem.",
    howItFitsDebatePrep: "Duplicate of hub argument map for in-packet review.",
    whatToLookFor: ["Agree/contrast/bridge per lane"],
    howToSetUp: "Rehearse each lane once.",
    howToUseInDebate: "Match lane to Hammer soundbite.",
    whenToUse: "All rebuttal time.",
    campaignTrailUse: "TV surrogate prep.",
    tiesTogether: "Likely arguments JSON.",
  },
  "strengths-ack": {
    whyItMatters: "Voters penalize candidates who sound unfair — brief acknowledgment disarms attack.",
    howItFitsDebatePrep: "One sentence per strength before pivot.",
    whatToLookFor: ["VERIFIED_FACT strengths only on stage"],
    howToSetUp: "Pick two strengths to acknowledge.",
    howToUseInDebate: "‘He has tenure — the question is what kind of SOS you want.’",
    whenToUse: "Experience and pastoral identity attacks.",
    campaignTrailUse: "Shows fairness in interviews.",
    tiesTogether: "Contrast section.",
  },
  vulnerabilities: {
    whyItMatters: "Safer wording prevents clip-worthy overreach.",
    howItFitsDebatePrep: "Use saferWording lines verbatim until verified.",
    whatToLookFor: ["debateUsefulness HIGH", "sourceConfidence", "RESEARCH_QUESTION tags"],
    howToSetUp: "Staff flags which vulnerabilities are debate-ready.",
    howToUseInDebate: "Only use lines marked safer wording; never improvise fraud claims.",
    whenToUse: "When going on offense — sparingly.",
    campaignTrailUse: "Op-eds need same safer wording.",
    tiesTogether: "Risk section.",
  },
  "integrity-2021": {
    whyItMatters: "Proves ‘integrity architecture’ is longitudinal — central to debating 2025 petition bills.",
    howItFitsDebatePrep: "When Hammer says ‘new issue’ — pivot here.",
    whatToLookFor: ["Six bill numbers", "narrativeArc bullets", "whenNotToUse"],
    howToSetUp: "Memorize package bill list and one plain-English summary sentence.",
    howToUseInDebate: "‘In 2021 you sponsored a six-bill package (Acts …) that changed county duties — pattern, not reaction.’",
    whenToUse: "Petition cluster or integrity architecture debates.",
    campaignTrailUse: "Policy white paper for press.",
    tiesTogether: "Timeline 2021 rows; bill badges on drill-downs.",
  },
  timeline: {
    whyItMatters: "Visual story of accumulation for voters and press.",
    howItFitsDebatePrep: "Supports 2021 package argument.",
    whatToLookFor: ["Year clusters", "hammerRole sponsor", "impact categories"],
    howToSetUp: "Pick 3 rows to cite with confidence HIGH.",
    howToUseInDebate: "Chronology rebuttal when opponent narrows to one bill.",
    whenToUse: "Pattern questions.",
    campaignTrailUse: "Timeline graphics for digital.",
    tiesTogether: "Theme matrix.",
  },
  "theme-matrix": {
    whyItMatters: "Explains breadth without reading 29 bills aloud.",
    howItFitsDebatePrep: "Strategic grouping for answers.",
    whatToLookFor: ["Top bill counts per theme", "Overlapping bills across themes"],
    howToSetUp: "Choose lead theme for tonight.",
    howToUseInDebate: "Theme-first, bill-second citations.",
    whenToUse: "‘Why so many bills?’ questions.",
    campaignTrailUse: "County-specific theme emphasis.",
    tiesTogether: "Themes page UI.",
  },
  "rapid-response": {
    whyItMatters: "Staff needs known-good assets after debate surprises.",
    howItFitsDebatePrep: "Post-debate more than on-stage.",
    whatToLookFor: ["READY vs PENDING verification"],
    howToSetUp: "Staff assigns asset to quote response.",
    howToUseInDebate: "Kelly cites only READY items if any.",
    whenToUse: "Spin room with staff support.",
    campaignTrailUse: "Rapid response social within 1 hour — staff only.",
    tiesTogether: "Evidence locker staff tools.",
  },
  "retrieval-queue": {
    whyItMatters: "Honest list of what research still cannot support publicly.",
    howItFitsDebatePrep: "Do not read aloud — informs risk section.",
    whatToLookFor: ["HIGH priority OPEN/PARTIAL", "recommendedHumanAction"],
    howToSetUp: "Staff works queue; Kelly avoids NOT_READY topics.",
    howToUseInDebate: "If asked about gap topic, say ‘we need verified sources before I claim that publicly.’",
    whenToUse: "Internal staff only.",
    campaignTrailUse: "Prioritize research budget.",
    tiesTogether: "Intelligence gaps module.",
  },
  actionQueue: {
    whyItMatters:
      "NSI-15 staff assignment queue — who should review citations, close retrieval gaps, or prep debate responses before export.",
    howItFitsDebatePrep:
      "After claims review; before Kelly cites new acts. Headset staff mark ACCEPTED/IN_PROGRESS — Kelly uses Claims only on stage.",
    whatToLookFor: [
      "URGENT + CRITICAL priority rows",
      "PREPARE_DEBATE_RESPONSE and REVIEW_CITATION types",
      "Blocked-by lines — do not export until cleared",
    ],
    howToSetUp: "Debate week loads persisted JSON only (fast). Assign owners from owner-role view.",
    howToUseInDebate: "Kelly does not open this page live — staff whispers export-ready act numbers only.",
    whenToUse: "Daily staff huddle; post-debate debrief.",
    campaignTrailUse: "Same queue discipline for mail and rapid response.",
    tiesTogether: "Evidence command + action queue + intelligence gaps.",
  },
  "citation-discipline": {
    whyItMatters: "Campaign survival — one bad citation becomes ‘Kelly lied.’",
    howItFitsDebatePrep: "Final gate before stage.",
    whatToLookFor: ["Act number match", "VERIFIED vs INTERPRETATION", "needs research count"],
    howToSetUp: "Verifier staff on headset if possible.",
    howToUseInDebate: "Cite acts not anecdotes.",
    whenToUse: "Always.",
    campaignTrailUse: "All paid comms.",
    tiesTogether: "Claims ledger.",
  },
  "media-followup": {
    whyItMatters: "Debate impact is 40% spin room.",
    howItFitsDebatePrep: "Prep 3 quotes in advance from reporter question list.",
    whatToLookFor: ["Report questions overlap with hub"],
    howToSetUp: "Write quotes on index card.",
    howToUseInDebate: "Seed quotes you want repeated in answers.",
    whenToUse: "Post-debate.",
    campaignTrailUse: "Press avails same day after major events.",
    tiesTogether: "Reporter section 12.",
  },
  "county-deep": {
    whyItMatters: "Deepest Kelly differentiation — Hammer legislated; Kelly would serve counties.",
    howItFitsDebatePrep: "Expand section 13 with narrative county paragraphs.",
    whatToLookFor: ["countyImpactNarrative per bill"],
    howToSetUp: "Pick two bills with strongest county story.",
    howToUseInDebate: "Humanize election workers.",
    whenToUse: "Rural counties, clerk forums.",
    campaignTrailUse: "Primary trail persuasion.",
    tiesTogether: "County officials concerns list.",
  },
  "petition-cluster": {
    whyItMatters: "Direct democracy voters need to hear you respect both access and security.",
    howItFitsDebatePrep: "List bills from theme matrix.",
    whatToLookFor: ["verify act text note", "directDemocracyConcerns bullets"],
    howToSetUp: "One verified example bill for debate.",
    howToUseInDebate: "Process impact on signature gatherers and counties.",
    whenToUse: "Initiative/petition questions.",
    campaignTrailUse: "Alliance with initiative campaigns.",
    tiesTogether: "Direct democracy section 14.",
  },
  "closing-checklist": {
    whyItMatters: "Last check before lights — prevents amateur mistakes.",
    howItFitsDebatePrep: "Final page of packet.",
    whatToLookFor: ["Do-not-say reviewed", "NOT_READY claims known"],
    howToSetUp: "Run checklist verbally with staff.",
    howToUseInDebate: "Mental, not literal.",
    whenToUse: "5 minutes before stage.",
    campaignTrailUse: "Before any high-stakes live appearance.",
    tiesTogether: "Three moves + pillars.",
  },
  "debate-profile": {
    whyItMatters: "Background on debate format, moderator tendencies, and high-probability lanes — sets realistic expectations.",
    howItFitsDebatePrep: "Read once during strategy block (section 1); informs likely-hammer and argument map.",
    whatToLookFor: ["Educate vs attack framing", "High-probability question lanes", "Time limits per segment"],
    howToSetUp: "Staff highlights three moderator angles Kelly should expect.",
    howToUseInDebate: "Adjust pace — do not over-answer in 30s blocks.",
    whenToUse: "First prep session of debate week.",
    campaignTrailUse: "Less relevant on trail unless formal forum format.",
    tiesTogether: "Hub research background + strategy section.",
  },
  "likely-args": {
    whyItMatters: "Markdown depth behind the JSON argument map — fuller phrasing for staff briefings.",
    howItFitsDebatePrep: "Staff reads; Kelly uses hub argument map for oral bridges.",
    whatToLookFor: ["Overlap with JSON rebuttal cards", "Evidence citations to verify"],
    howToSetUp: "Staff extracts one bridge per lane into Kelly's voice.",
    howToUseInDebate: "Same agree/contrast/bridge as argument map UI.",
    whenToUse: "Mock debate prep with staff playing Hammer.",
    campaignTrailUse: "Surrogate packet source material.",
    tiesTogether: "Argument map component on hub and debate prep.",
  },
  contrast: {
    whyItMatters: "Kelly vs Hammer SOS philosophy — the race is office type and implementation, not personal attack.",
    howItFitsDebatePrep: "Underpins core-frame and every Kelly frame on bill cards.",
    whatToLookFor: ["Service SOS vs legislator record", "County partnership vs unfunded mandates"],
    howToSetUp: "Write one contrast sentence per pillar.",
    howToUseInDebate: "End substantive answers with contrast bridge.",
    whenToUse: "Whenever Hammer lists credentials without bills.",
    campaignTrailUse: "Core contrast mail and stump.",
    tiesTogether: "Bill drill-down Kelly frames.",
  },
  themes: {
    whyItMatters: "Narrative explanation of theme buckets before you click individual bills.",
    howItFitsDebatePrep: "Pairs with theme matrix UI and section 21.",
    whatToLookFor: ["Which theme has most bills", "Overlap with 2021 package"],
    howToSetUp: "Choose lead theme for tonight's answers.",
    howToUseInDebate: "Theme-first explanation, then 1–2 act anchors.",
    whenToUse: "‘Why so many election bills?’ questions.",
    campaignTrailUse: "County-specific theme emphasis in local press.",
    tiesTogether: "Themes page + theme matrix component.",
  },
  gaps: {
    whyItMatters: "Honest research debt — prevents Kelly from asserting what staff has not verified.",
    howItFitsDebatePrep: "Informs risk section and retrieval queue; not for on-stage reading.",
    whatToLookFor: ["HIGH priority gaps", "externalMessageReadiness NOT_READY"],
    howToSetUp: "Staff assigns retrieval from action queue.",
    howToUseInDebate: "Decline to claim; offer to follow up with verified sources.",
    whenToUse: "Internal staff meetings.",
    campaignTrailUse: "Research budget prioritization.",
    tiesTogether: "Retrieval queue section + claims ledger.",
  },
  kh3: {
    whyItMatters: "Dossier excerpt for opponent biography and public record context — use only verified lines on stage.",
    howItFitsDebatePrep: "Optional depth if moderator asks about background beyond bills.",
    whatToLookFor: ["VERIFIED vs INTERPRETATION tags", "Safer wording suggestions"],
    howToSetUp: "Staff flags 2–3 biography lines safe for debate.",
    howToUseInDebate: "Brief acknowledgment then pivot to SOS service frame.",
    whenToUse: "Personal background questions only.",
    campaignTrailUse: "Press bios and intro remarks — verify first.",
    tiesTogether: "Opponent record modules.",
  },
};

export function getPrepSectionGuide(sectionId: string): OperatorGuide | undefined {
  let guide: OperatorGuide | undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy break circular import with drill-downs
    const { getPrepSectionGuideFromDrillDown } = require("@/lib/intelligence/v4/debatePrepSectionDrillDowns") as {
      getPrepSectionGuideFromDrillDown: (id: string) => OperatorGuide | undefined;
    };
    guide = getPrepSectionGuideFromDrillDown(sectionId) ?? PREP_SECTION_GUIDES[sectionId];
  } catch {
    guide = PREP_SECTION_GUIDES[sectionId];
  }
  if (!guide) return undefined;
  return applyOperatorGuideDepth(enrichOperatorGuide(guide, sectionId), sectionId);
}

export function getSurfaceGuide(key: string): OperatorGuide | undefined {
  const guide = SURFACE_GUIDES[key];
  if (!guide) return undefined;
  return applyOperatorGuideDepth(enrichOperatorGuide(guide, key), key);
}

export function getWorkflowStepByHref(href: string) {
  const step = DEBATE_WORKFLOW_STEPS.find((s) => s.href === href);
  if (!step) return undefined;
  return {
    ...step,
    guide: enrichGuideByHref(step.guide, href),
  };
}
