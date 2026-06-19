/**
 * Static lesson bank for forum lab v1 analysis drill-downs.
 * Titles match forum-transcript-lab.json / forum-debate-upgrade-v1.json bullets.
 */
import type { ForumAnalysisLesson } from "@/lib/election-plan/forumLabAnalysisDrillDown";
import {
  EP_DEBATE_PREP_HREF,
  EP_FORUM_LAB_ANALYSIS_HREF,
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  EP_FORUM_LAB_INTEGRATION_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epDebatePrepBriefingHref,
  epDebatePrepDayHref,
  epDebateTechniqueHref,
  epForumLabAnalysisItemHref,
  epForumLabElectionLawTopicHref,
  epForumLabIntegrationDayHref,
  epOppositionResearchModuleHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";

function lesson(
  id: string,
  categoryId: ForumAnalysisLesson["categoryId"],
  title: string,
  summary: string,
  sections: ForumAnalysisLesson["sections"],
  opts?: Partial<Pick<ForumAnalysisLesson, "forumEvidence" | "debateLines" | "practiceSteps" | "claimsGate" | "relatedLinks">>,
): ForumAnalysisLesson {
  return {
    id,
    categoryId,
    title,
    summary,
    sections,
    forumEvidence: opts?.forumEvidence ?? [],
    debateLines: opts?.debateLines ?? [],
    practiceSteps: opts?.practiceSteps ?? [],
    claimsGate: opts?.claimsGate ?? [],
    relatedLinks: opts?.relatedLinks ?? [],
  };
}

export const FORUM_ANALYSIS_LESSONS: ForumAnalysisLesson[] = [
  // —— Hammer themes ——
  lesson(
    "experience-integrity",
    "hammer-themes",
    "Experience and integrity in public service",
    "Hammer leads with 16 years in the legislature and a faith-framed service narrative — Kelly answers with administrator competence, not résumé tennis.",
    [
      {
        heading: "What Hammer did at ACCA",
        body:
          "Opening statement: eight years House, eight years Senate, running partly to discern 'God's will,' and not wanting to 'put 16 years on the shelf.' He pairs longevity with election-security pride ('number one state in the nation').",
      },
      {
        heading: "Debate read",
        body:
          "Experience is his credibility anchor when clerks already know him. In a general-audience debate he will compress this into 'I've worked with clerks for 16 years' before pivoting to bills and rankings.",
      },
      {
        heading: "Kelly counter-frame",
        body:
          "Author vs administrator: senators write law; SOS runs elections for 75 counties. Agree on public service — add that voters need an operator who listens, implements, and funds clerk workflows.",
      },
      {
        heading: "Three-way note",
        body:
          "Do not diminish his service record. Pakko will welcome any 'career politician' framing — Kelly stays on implementation and clerk partnership.",
      },
    ],
    {
      forumEvidence: [
        "Hammer opening: '16 years of experience' and working with clerks throughout legislative career.",
        "Closing: 'If experience matters to you, I've got 16 years' — direct voter appeal.",
      ],
      debateLines: [
        "I respect Senator Hammer's service — I'm running to administer elections fairly for every county.",
        "Experience writing law is different from experience helping clerks implement it on time.",
      ],
      practiceSteps: [
        "Watch Hammer opening (90 sec) — note three credibility phrases.",
        "Practice agree-add: honor service → administrator pivot → clerk funding.",
        "Open author vs administrator briefing — one paragraph aloud.",
      ],
      claimsGate: ["'#1 state' ranking — verify source and year before citing on stage."],
      relatedLinks: [
        { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator" },
        { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane · experience" },
        { href: epDebatePrepDayHref("day-1-command-foundation"), label: "Command course · Day 1" },
      ],
    },
  ),
  lesson(
    "clerk-collaboration",
    "hammer-themes",
    "Collaboration with county clerks",
    "Hammer's strongest ACCA lane — 'work with you, not against you.' Kelly should agree loudly and differentiate on feedback loops and process discipline.",
    [
      {
        heading: "Forum language",
        body:
          "Pre-legislation meetings, civil disagreement, legal-team support, quarterly face-to-face meetings, direct cell phone, 'if you're not seeing me every three or four months I'm not doing my job.'",
      },
      {
        heading: "Why it works in this room",
        body:
          "Audience was county clerks and election staff. Hammer spoke their language: access, respect, proactive communication before session food fights.",
      },
      {
        heading: "Kelly advantage",
        body:
          "Kelly matched with roundtables, county visits, office hours, and Verizon process background ('clean data from DMV'). Differentiate on structured feedback before tech/policy changes — not who loves clerks more.",
      },
      {
        heading: "Capitalize move",
        body:
          "When Hammer says 'we need to work together,' Kelly agrees and adds: 'That means feedback before purchases, before mandates, and before the legislature drops another unfunded requirement.'",
      },
    ],
    {
      forumEvidence: [
        "Kelly: 'partnership between county clerks and secretary of state is one of the most important partnerships in the state.'",
        "Hammer: clerks should be 'in the front seat' with DMV on registration cleanup.",
      ],
      debateLines: [
        "Absolutely — collaboration is how elections actually work. My commitment is feedback loops before we change your systems.",
        "Clerks shouldn't be in the back seat on registration data — I'll fix the process, not blame the counties.",
      ],
      practiceSteps: [
        "List three Kelly forum proofs of listening (roundtables, visits, process dig).",
        "Rehearse capitalize trigger: Hammer 'work together' → Kelly agree-add line.",
        "Open Day 4 forum integration drill.",
      ],
      relatedLinks: [
        { href: epForumLabIntegrationDayHref(4), label: "Day 4 · forum intelligence" },
        { href: epForumLabElectionLawTopicHref("county-implementation-burden"), label: "County implementation burden" },
      ],
    },
  ),
  lesson(
    "civic-education",
    "hammer-themes",
    "Importance of civic education and engagement",
    "Shared theme across all three candidates — Kelly owns youth creativity and 'people over politics' without ceding the lane to Hammer's school-visits script.",
    [
      {
        heading: "Hammer's version",
        body:
          "Schools and colleges, poll-worker pipeline tied to 75-hour community service law, 'get the kid, get the parent,' kindergarten-through-college civic formation.",
      },
      {
        heading: "Kelly's version (stronger)",
        body:
          "Civic education program with husband for high school students; mural artist and songwriter on campaign; under-50 voting-age majority vs who actually votes; wins that pull youth in without party-committee aesthetics.",
      },
      {
        heading: "Debate tactic",
        body:
          "When Hammer emphasizes civic education, agree and extend: 'Programs that meet young people where they are — not only in government class.' Avoid sounding like you are copying his school-visits list.",
      },
    ],
    {
      forumEvidence: [
        "Kelly on youth: 'they want to use their own God-given talents' — mural artist, songwriter.",
        "Hammer: Secretary of State 'needs to be in the schools.'",
      ],
      debateLines: [
        "Civic education is essential — I'll expand programs that let young people plug in with their own talents.",
        "We have more voting-age Arkansans under 50 than over — my job is showing them their power.",
      ],
      practiceSteps: [
        "Memorize one youth engagement proof point from forum (civic ed program).",
        "Practice agree-extend when Hammer says 'schools.'",
        "Link to techniques · culture-war trap lane if debate gets polarized.",
      ],
      relatedLinks: [
        { href: epDebateTechniqueHref("culture-war-traps"), label: "Techniques · culture-war traps" },
        { href: epForumLabIntegrationDayHref(2), label: "Day 2 · read the table" },
      ],
    },
  ),
  lesson(
    "election-security",
    "hammer-themes",
    "Commitment to election security",
    "Hammer's default hammer (pun intended): #1 state, paper ballots, don't break what works. Kelly agrees on security — pivots to transparency storytelling and clerk resources.",
    [
      {
        heading: "Forum security stack",
        body:
          "Paper ballot system, Heritage scorecard alignment, 'trust and verify,' opposition to hand-count mandates as manpower nightmare, challenge: name a candidate who lost because election was stolen.",
      },
      {
        heading: "Pressure points",
        body:
          "When pressed on hand-marked hand-counted ballots, Hammer defends status quo while promising to facilitate whatever law requires. Kelly and Pakko both affirmed current system security to clerks.",
      },
      {
        heading: "Kelly frame",
        body:
          "Agree elections are secure because clerks execute locally. Add marketing-grade transparency (videos showing process) without feeding conspiracy oxygen.",
      },
    ],
    {
      forumEvidence: [
        "Hammer: 'number one state in the nation for election integrity and security' (multiple).",
        "Kelly: 'I believe our elections are so secure, just like I know you guys believe.'",
      ],
      debateLines: [
        "Election security is paramount — and it works because county clerks run it locally. I'll help tell that story clearly.",
        "Secure isn't silent — voters need to see what you already do every election.",
      ],
      claimsGate: [
        "National ranking claims — verify Heritage or other source before broadcast.",
        "Bill sponsorship lists — verify on Arkleg before 'I wrote the bills' rebuttals.",
      ],
      practiceSteps: [
        "Skim election law study · 2021 integrity package (pattern only).",
        "Practice security agree-add in 30 seconds.",
        "Open opposition research · integrity foundation 2021.",
      ],
      relatedLinks: [
        { href: epOppositionResearchModuleHref("integrity-foundation-2021"), label: "2021 integrity foundation" },
        { href: epForumLabElectionLawTopicHref("2021-integrity-package"), label: "2021 package study" },
        { href: epTrapLaneHref("2021-vs-2025-pivot"), label: "Trap lane · 2021 vs 2025" },
      ],
    },
  ),
  lesson(
    "proactive-communication",
    "hammer-themes",
    "Proactive communication and support",
    "Hammer promises an 'loud' SOS office playing offense against conspiracy narratives — Kelly can match energy with truth-forward campaigns, not partisan combat.",
    [
      {
        heading: "What 'loud' means to Hammer",
        body:
          "Promote Arkansas's top ranking, force conspiracy theorists on defense, website revamp, responsive legal answers for clerks, visibility in counties.",
      },
      {
        heading: "Risks",
        body:
          "Offense can sound partisan or dismissive of real voter anxiety. Kelly's marketing background is the positive version: educate, don't dunk.",
      },
      {
        heading: "Operator detail",
        body:
          "Kelly forum emphasis: videos, showing clerk excellence, giving counties tools to share locally. Staff should wire specific 'show don't tell' examples for debate binder.",
      },
    ],
    {
      forumEvidence: [
        "Hammer: 'We have to be an office that is loud' on election integrity messaging.",
        "Kelly: 'truth has to be louder than all of the rhetoric' — marketing campaign frame.",
      ],
      debateLines: [
        "I'll run a truth-forward campaign so voters see how secure our process really is.",
        "Conspiracy theories lose when clerks get the spotlight — not when we shout louder.",
      ],
      practiceSteps: [
        "Draft one 20-second 'show the process' video concept for staff.",
        "Contrast Hammer loud vs Kelly educate — tone check on camera.",
      ],
      relatedLinks: [
        { href: epDebatePrepDayHref("day-5-anticipate-and-capitalize"), label: "Command course · Day 5" },
      ],
    },
  ),
  lesson(
    "legal-compliance-voter-rights",
    "hammer-themes",
    "Advocacy for legal compliance and voter rights",
    "Hammer frames legal voters vs illegal votes, Save America Act duty-bound implementation, and agency cooperation (DMV). Kelly adds clerk burden analysis.",
    [
      {
        heading: "Forum cues",
        body:
          "Every vote ought to be legal; systems must communicate across agencies; will implement federal law if it comes; skeptical Save Act passes Congress.",
      },
      {
        heading: "Kelly overlap",
        body:
          "Agreed citizenship and ID already in place; warned of clerk administrative burden if federal ID rules tighten; process-fix mindset on DMV data quality.",
      },
      {
        heading: "Debate discipline",
        body:
          "Stay on legal compliance without inflammatory fraud rhetoric. Pakko will attack federal overreach — Kelly can agree on state/local execution.",
      },
    ],
    {
      forumEvidence: [
        "Hammer on Save Act: 'every vote ought to be legal' and cross-agency systems.",
        "Kelly: burden on clerks if voters must bring more documentation.",
      ],
      debateLines: [
        "Legal votes only — and that means systems that don't dump cleanup on county clerks.",
        "I'll enforce the law we have while fighting unfunded mandates on your offices.",
      ],
      practiceSteps: [
        "Read election law study · complaints and enforcement (Act 279).",
        "Practice Save Act question in 90 seconds without speculating on federal passage.",
      ],
      relatedLinks: [
        { href: epForumLabElectionLawTopicHref("complaints-and-enforcement-act279"), label: "Complaints & enforcement" },
        { href: epForumLabElectionLawTopicHref("sos-role-vs-legislature"), label: "SOS role vs legislature" },
      ],
    },
  ),

  // —— Pakko themes ——
  lesson(
    "competition-politics",
    "pakko-themes",
    "Advocacy for competition in politics",
    "Pakko's bumper sticker: 'elections are too important to leave to Democrats and Republicans.' Kelly respects the line — pivots to people-over-politics without endorsing structural fights on stage.",
    [
      {
        heading: "Forum frame",
        body:
          "Outsider economist + Libertarian Party chair; wants competition within parties and from third parties; hyper-partisan duopoly critique.",
      },
      {
        heading: "Three-way geometry",
        body:
          "Never ask Pakko voters to vote for Kelly on stage. Acknowledge competition theme; contrast your SOS implementation record vs legislative authorship.",
      },
      {
        heading: "Respect line",
        body:
          "When Pakko mentions competition: 'I agree we need more voices — my job as SOS is fair rules for every candidate and every county.'",
      },
    ],
    {
      forumEvidence: [
        "Pakko opening: 'more competition in our politics' and duopoly disenfranchisement rhetoric.",
        "Closing JQA quote — vote for principle even if alone.",
      ],
      debateLines: [
        "I agree we need more voices at the table — my job is administering fair elections for all of them.",
        "People over politics — the SOS office serves Arkansans, not party mascots.",
      ],
      practiceSteps: [
        "Rehearse three-way pivot — Hammer contrast, Pakko respect.",
        "Open techniques · three-way topic.",
      ],
      relatedLinks: [
        { href: epDebateTechniqueHref("three-way"), label: "Techniques · three-way" },
        { href: epOppositionResearchModuleHref("dossier-pakko"), label: "Pakko dossier" },
      ],
    },
  ),
  lesson(
    "transparency-integrity",
    "pakko-themes",
    "Focus on transparency and integrity in elections",
    "Pakko wants coordinated public testing demonstrations and 'more good information' vs misinformation — overlaps Kelly's transparency video idea.",
    [
      {
        heading: "Shared ground",
        body:
          "Machine testing visibility, reassuring voters, bipartisan observer participation at tests — Kelly's marketing/show-the-process aligns.",
      },
      {
        heading: "Differentiator",
        body:
          "Kelly implements through clerk partnership and state-led storytelling; Pakko critiques Heritage rankings as non-definitive — don't adopt unsourced skepticism on stage.",
      },
    ],
    {
      forumEvidence: [
        "Pakko: 'best way to combat bad information is with more good information' on machine testing.",
        "Kelly: videos showing polling-place trust when voters 'know people' working elections.",
      ],
      debateLines: [
        "Transparency builds trust — I'll help clerks show the process, not just tell it.",
      ],
      practiceSteps: [
        "Note one Pakko transparency proposal to respect on stage.",
        "Pair with Kelly opportunity · marketing public trust drill.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "marketing-public-trust"), label: "Kelly · marketing trust" },
      ],
    },
  ),
  lesson(
    "two-party-critique",
    "pakko-themes",
    "Critique of the two-party system",
    "Pakko cites gerrymandering, ballot access petitions, Thurston case — hot lane for media, risky for SOS debate soundbites.",
    [
      {
        heading: "Forum content",
        body:
          "Two-thirds of legislature seats uncontested across parties; LP petitioned eight times; independent candidate restrictions; primary structure complaints.",
      },
      {
        heading: "Kelly stance",
        body:
          "People over politics, cross-party listening, politics doesn't belong in election administration — do not litigate party reform details in 90 seconds.",
      },
      {
        heading: "Trap",
        body:
          "Hammer may bait partisan food fights. Kelly stays neutral administrator: 'I run elections fairly for every party on the ballot.'",
      },
    ],
    {
      forumEvidence: [
        "Pakko misinformation answer: low engagement + lack of competition as fundamental problem.",
        "Kelly closing: plug in 'whatever you are' — Arkansans first.",
      ],
      debateLines: [
        "Fair ballots for every qualified party — that's the SOS job.",
        "I'll leave party reform debates to the legislature — I'll run clean elections.",
      ],
      practiceSteps: [
        "Practice 20-second neutral administrator response to gerrymandering question.",
        "Read Pakko dossier · three-way section.",
      ],
      relatedLinks: [
        { href: epOppositionResearchModuleHref("dossier-pakko"), label: "Pakko dossier" },
        { href: epDebateTechniqueHref("split-the-table"), label: "Techniques · split the table" },
      ],
    },
  ),
  lesson(
    "voter-engagement",
    "pakko-themes",
    "Support for voter engagement and participation",
    "Pakko ties engagement to competition and confidence; Kelly ties to youth creativity and positive reasons to vote.",
    [
      {
        heading: "Forum alignment",
        body:
          "Both want higher participation. Pakko: structural openness. Kelly: civic wins, reducing 'vote against' polarization, Winthrop civic index critique.",
      },
      {
        heading: "Capitalize",
        body:
          "When Pakko discusses voter engagement: 'Engaging youth is crucial — I have programs already running in schools.'",
      },
    ],
    {
      forumEvidence: [
        "Kelly: Winthrop Rockefeller civic index — Arkansas at bottom of engagement.",
        "Pakko: Arkansas low engagement is a shame — competition remedy.",
      ],
      debateLines: [
        "Engaging our youth is crucial — I'm already in schools with civic education partners.",
      ],
      practiceSteps: [
        "Memorize Winthrop civic index reference — verify stat before broadcast.",
        "Open predicted question · improve voter engagement.",
      ],
      claimsGate: ["Civic index ranking — verify Winthrop study year and metric."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("predicted-debate-questions", "improve-voter-engagement"), label: "Predicted Q · voter engagement" },
      ],
    },
  ),
  lesson(
    "reducing-overreach",
    "pakko-themes",
    "Emphasis on reducing government overreach",
    "Pakko's libertarian lane — federal Save Act opposition, hand-count skepticism, spending caution except election integrity.",
    [
      {
        heading: "Forum examples",
        body:
          "Save Act 'bad idea' and unconstitutional federal meddling; enhanced ID burdens on married women; reluctant to call for spending except on election tech and integrity.",
      },
      {
        heading: "Kelly overlap",
        body:
          "Clerk burden warnings on new federal rules; process efficiency; don't expand government for its own sake — fund what clerks need.",
      },
      {
        heading: "Stage rule",
        body:
          "Agree on limiting unfunded mandates on counties; don't debate libertarian philosophy. Hammer may attack 'big government' — Kelly stays on clerk implementation.",
      },
    ],
    {
      forumEvidence: [
        "Pakko on Save Act: elections are state/local — federal step-in unnecessary.",
        "Kelly: administrative burden on clerks if documentation rules expand.",
      ],
      debateLines: [
        "I won't hand counties unfunded mandates — tell me what you need, we'll fight for it together.",
      ],
      practiceSteps: [
        "Rehearse federalism agree line with clerk burden example (DMV data).",
      ],
      relatedLinks: [
        { href: epForumLabElectionLawTopicHref("county-implementation-burden"), label: "County burden study" },
      ],
    },
  ),

  // —— Kelly opportunities ——
  lesson(
    "business-admin-competence",
    "kelly-opportunities",
    "Highlight her business experience and administrative competence",
    "30+ years business, 800-person team, Verizon HQ building — the administrator case against legislative authorship.",
    [
      {
        heading: "Forum proof",
        body:
          "Kelly: not a lifetime politician; led large team; SOS as service role and constitutional officer; process person on DMV registration cleanup.",
      },
      {
        heading: "When to use",
        body:
          "After Hammer bill lists or experience boasts; when moderator asks qualifications; when discussing technology or vendor contracts.",
      },
      {
        heading: "Avoid",
        body:
          "Corporate jargon; implying clerks are 'employees'; sounding like CEO vs public servant. Frame as service leadership.",
      },
    ],
    {
      forumEvidence: [
        "Kelly opening: 30 years business, 800 people, Verizon headquarters — administrator frame.",
        "Registration answer: Verizon M&A process discipline applied to DMV-clerk data.",
      ],
      debateLines: [
        "I'm not running for the Senate — I'm running to administer elections and support clerks like you.",
        "I led large teams in the private sector — this job is service, not politics as usual.",
      ],
      practiceSteps: [
        "90-second qualifications answer — business proof + clerk service.",
        "Open Day 3 superiority map blocks.",
      ],
      claimsGate: ["Team size and employer claims — confirm before paid media."],
      relatedLinks: [
        { href: epDebatePrepDayHref("day-3-superiority-map"), label: "Command course · Day 3" },
        { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator" },
      ],
    },
  ),
  lesson(
    "civic-education-youth",
    "kelly-opportunities",
    "Emphasize the importance of civic education and youth engagement",
    "Kelly's differentiated youth lane — creative engagement, under-50 electorate, existing programs.",
    [
      {
        heading: "Own the lane",
        body:
          "Hammer has schools script; Kelly has running programs, artists, songwriters, and demographic argument about who should vote vs who does.",
      },
      {
        heading: "Debate night",
        body:
          "Offer specifics: civic ed with husband, campaign youth ambassadors, making voting feel relevant — not partisan.",
      },
    ],
    {
      forumEvidence: [
        "Kelly: mural artist, songwriter, under-50 majority — 'y'all know who votes.'",
      ],
      debateLines: [
        "Young people want to plug in with their talents — I'll meet them there.",
      ],
      practiceSteps: [
        "Prepare one youth story (30 sec) from forum.",
        "Link to Hammer civic education drill — practice agree-extend.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("hammer-themes", "civic-education"), label: "Hammer · civic education" },
      ],
    },
  ),
  lesson(
    "unifier-cross-party",
    "kelly-opportunities",
    "Position herself as a unifier across party lines",
    "Pre-commitment with opponents to 'do this the right way' — people over politics for clerk room and general debate.",
    [
      {
        heading: "Forum moment",
        body:
          "Kelly thanked Hammer and Pakko for commitment to running the race right; closing emphasized Democrats, Republicans, Libertarians as Arkansans.",
      },
      {
        heading: "Authenticity",
        body:
          "Clerks explicitly said politics doesn't belong in election administration — Kelly quoted that back. Use in debate when partisan bait appears.",
      },
    ],
    {
      forumEvidence: [
        "Kelly opening: commitment with opponents to 'do this the right way.'",
        "Beyond elections answer: willing to go into any room — 'people over politics.'",
      ],
      debateLines: [
        "We're all Arkansans — my office serves voters, not party mascots.",
        "Politics doesn't belong in election administration — you said it, I believe it.",
      ],
      practiceSteps: [
        "Practice lowering temperature after Hammer partisan aside.",
        "Open psychology manual · composure section if available.",
      ],
      relatedLinks: [
        { href: EP_DEBATE_PREP_HREF, label: "Debate prep hub" },
        { href: epDebateTechniqueHref("three-way"), label: "Techniques · three-way" },
      ],
    },
  ),
  lesson(
    "modernize-election-tech",
    "kelly-opportunities",
    "Advocate for modernizing election technology and processes",
    "Clerk Q&A on 20-year-old software — Kelly promises advocate for funds, roundtables, right fixes.",
    [
      {
        heading: "Forum moment",
        body:
          "Audience question on outdated election software. Kelly: need advocate for funds, understand contracts, roundtables before spending.",
      },
      {
        heading: "Alignment",
        body:
          "Hammer and Pakko also supported upgrades — differentiate on feedback-before-purchase and clerk-led requirements.",
      },
    ],
    {
      forumEvidence: [
        "Clerk: system not updated in 20 years.",
        "Kelly: advocate for dollars + understand feedback before fixing right things.",
      ],
      debateLines: [
        "I'll fight for funding — after we listen to clerks on what actually needs upgrading.",
      ],
      practiceSteps: [
        "Draft 3 bullet 'tech modernization' plan from forum answers.",
        "Open claims gate · election technology upgrades.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("claims-gate-notes", "election-technology-upgrades"), label: "Claims · tech upgrades" },
        { href: epForumLabAnalysisItemHref("predicted-debate-questions", "election-technology-changes"), label: "Predicted Q · tech" },
      ],
    },
  ),
  lesson(
    "listen-county-clerks",
    "kelly-opportunities",
    "Promote her commitment to listening and responding to county clerks",
    "Kelly's core ACCA promise — visits, office hours, roundtables, feedback loops on tech and policy.",
    [
      {
        heading: "Proof stack",
        body:
          "Morning sessions before forum; trip log for county visits; specific DMV registration cleanup story; roundtables before big decisions.",
      },
      {
        heading: "Vs Hammer",
        body:
          "Both promise access. Kelly's edge: structured process improvement, not only relationship — 'feedback before policy.'",
      },
    ],
    {
      forumEvidence: [
        "Kelly: 'picked up questions and ideas this morning' from clerk conversations.",
        "First-year policy: safeguards before changes that make clerk jobs harder.",
      ],
      debateLines: [
        "My commitment is to show up, listen, and act — not just take meetings.",
      ],
      practiceSteps: [
        "List three forum examples of listening — use in closing.",
        "Open clerk collaboration Hammer theme — contrast agree-add.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("hammer-themes", "clerk-collaboration"), label: "Hammer · clerk collaboration" },
      ],
    },
  ),
  lesson(
    "marketing-public-trust",
    "kelly-opportunities",
    "Showcase her marketing background to improve public trust in elections",
    "Truth louder than rhetoric — video campaign showing clerk excellence and process security.",
    [
      {
        heading: "Forum language",
        body:
          "Marketing + training background; full-blown campaign for confidence; videos so voters see security themselves; tools for counties to share locally.",
      },
      {
        heading: "Ethical line",
        body:
          "Educate, don't manipulate. No fear ads. Spotlight clerks — they are the trust face.",
      },
    ],
    {
      forumEvidence: [
        "Kelly misinformation answer: 'truth has to be louder than all of the rhetoric.'",
        "Security question: videos showing awesome clerk work.",
      ],
      debateLines: [
        "I'll put marketing skills to work for truth — showing voters what you already do.",
      ],
      practiceSteps: [
        "Outline 60-second video storyboard: poll worker → tabulation → bipartisan observers.",
        "Open newspaper angle · Kelly collaborative vision.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("newspaper-angles", "kelly-collaborative-sos-vision"), label: "Press · collaborative SOS" },
      ],
    },
  ),

  // —— Predicted debate questions ——
  lesson(
    "improve-voter-engagement",
    "predicted-debate-questions",
    "What specific steps will you take to improve voter engagement?",
    "90-second lane: youth programs, positive reasons to vote, civic index honesty, clerk tools — not vague 'get out the vote.'",
    [
      {
        heading: "Answer architecture",
        body:
          "1) Civic education with partners already running. 2) Show under-50 power + creative on-ramps. 3) Give clerks shareable content. 4) Something to vote for, not only against.",
      },
      {
        heading: "Forum anchors",
        body:
          "Winthrop civic index bottom ranking — use carefully with claims gate. Kelly's youth ambassadors and school programs as proof.",
      },
      {
        heading: "Avoid",
        body:
          "Blaming voters for apathy; promising online voting; unfunded school mandates without clerk buy-in.",
      },
    ],
    {
      debateLines: [
        "Step one: civic education that meets young people where they are. Step two: tools for clerks to tell the story locally.",
      ],
      practiceSteps: [
        "Time 90-second answer on phone recorder.",
        "Verify civic index stat with staff.",
      ],
      claimsGate: ["Winthrop civic index — confirm publication year and metric."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "civic-education-youth"), label: "Kelly · youth engagement" },
      ],
    },
  ),
  lesson(
    "ensure-election-integrity",
    "predicted-debate-questions",
    "How will you ensure the integrity of elections in Arkansas?",
    "Agree on current strength + clerk partnership + transparency + funding for systems — don't litigate 2021 package unless Hammer forces it.",
    [
      {
        heading: "Structure",
        body:
          "Affirm clerk-led local execution → SOS support function → verify claims before citing bills → fund upgrades and training.",
      },
      {
        heading: "If Hammer attacks",
        body:
          "Author vs administrator pivot; agree on security; add implementation and county burden.",
      },
    ],
    {
      debateLines: [
        "Integrity starts in your offices — my job is support, funding, and clear rules for every county.",
      ],
      practiceSteps: [
        "Rehearse with Hammer security theme drill.",
        "Open election law study hub.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("hammer-themes", "election-security"), label: "Hammer · election security" },
        { href: epOppositionResearchModuleHref("claims-ledger"), label: "Claims ledger" },
      ],
    },
  ),
  lesson(
    "online-voter-registration",
    "predicted-debate-questions",
    "What is your stance on online voter registration?",
    "Kelly advocates; Hammer defers to legislature; Pakko supports with ID controls — know all three, stay in Kelly lane.",
    [
      {
        heading: "Forum answers",
        body:
          "Hammer: legislature decides, SOS implements. Pakko: acceptable with proper controls. Kelly: advocate, secure system, reduce county burden, youth accessibility — one of few states without OVR.",
      },
      {
        heading: "Kelly answer",
        body:
          "Support exploring secure OVR to reduce clerk load and meet young voters where they are — partner with legislature, clerks design security requirements.",
      },
    ],
    {
      forumEvidence: [
        "Kelly: handing paper forms 'five times a day' — burden on young voters and clerks.",
      ],
      debateLines: [
        "I'm for secure online registration — designed with clerks, not dumped on them.",
      ],
      practiceSteps: [
        "90-second OVR answer — youth + clerk burden + security process.",
      ],
      relatedLinks: [
        { href: epForumLabElectionLawTopicHref("sos-role-vs-legislature"), label: "SOS vs legislature" },
      ],
    },
  ),
  lesson(
    "address-misinformation",
    "predicted-debate-questions",
    "How do you plan to address misinformation about elections?",
    "Kelly forum answer: marketing campaign, truth louder than rhetoric, youth wins, tools for counties — Hammer: schools + call out 'crap' — thread carefully.",
    [
      {
        heading: "Kelly stack",
        body:
          "Education campaign, show-the-process video, empower clerks locally, reduce polarization so people vote for something.",
      },
      {
        heading: "Tone",
        body:
          "Firm on facts without mimicking Hammer's crude 'call it crap' — stay SOS-dignified.",
      },
    ],
    {
      debateLines: [
        "Fight misinformation with truth voters can see — clerk-led transparency, not shouting matches.",
      ],
      practiceSteps: [
        "Contrast Kelly vs Hammer misinformation tone on camera.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "marketing-public-trust"), label: "Kelly · marketing trust" },
      ],
    },
  ),
  lesson(
    "sos-local-election-issues",
    "predicted-debate-questions",
    "What role should the Secretary of State play in local election issues?",
    "Support function, legal guidance within limits, ally not courtroom lawyer, proactive before session — forum consensus across candidates.",
    [
      {
        heading: "Core answer",
        body:
          "SOS partners with clerks — elections are local. Provide training, guidance, funding advocacy, uniform clarity — don't micromanage counties.",
      },
      {
        heading: "Hammer overlap",
        body:
          "Legal team answers, quarterly meetings — Kelly adds feedback loops on tech and pre-session clerk input.",
      },
    ],
    {
      debateLines: [
        "Local execution, statewide support — I'm the service desk for 75 counties.",
      ],
      practiceSteps: [
        "Map SOS duties from election law study · SOS role topic.",
      ],
      relatedLinks: [
        { href: epForumLabElectionLawTopicHref("sos-role-vs-legislature"), label: "SOS role vs legislature" },
      ],
    },
  ),
  lesson(
    "support-county-clerks",
    "predicted-debate-questions",
    "How will you support county clerks in their administrative duties?",
    "Visits, roundtables, DMV process fix, funding fights, training — Kelly's strongest comparative lane at ACCA.",
    [
      {
        heading: "Checklist answer",
        body:
          "Show up in counties; office hours; roundtables before tech spend; fix inter-agency data; advocate for machine replacement funding; listen before session.",
      },
      {
        heading: "Proof",
        body:
          "Forum morning listening; Verizon process story; first-year policy on impact review before changes.",
      },
    ],
    {
      debateLines: [
        "Support means showing up, fixing processes, and fighting for your funding — not press releases.",
      ],
      practiceSteps: [
        "Memorize checklist — deliver in 90 seconds.",
        "Open Kelly opportunity · listen to clerks.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "listen-county-clerks"), label: "Kelly · listen to clerks" },
      ],
    },
  ),
  lesson(
    "election-technology-changes",
    "predicted-debate-questions",
    "What changes would you advocate for in election technology?",
    "Modernize 20-year systems, federal funds, clerk requirements first, vendor accountability — forum clerk question.",
    [
      {
        heading: "Forum consensus",
        body:
          "All three supported upgrades; Hammer emphasized federal money and vendor leverage; Pakko defer to clerk expertise; Kelly emphasized roundtables and right fixes.",
      },
      {
        heading: "Kelly specificity",
        body:
          "Advocate to legislature; understand contracts; clerk-led requirements; tech support gaps heard in counties.",
      },
    ],
    {
      debateLines: [
        "Modernize with clerks at the table — fund what you need, not what vendors sell.",
      ],
      practiceSteps: [
        "Pair with claims gate tech upgrades drill.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("claims-gate-notes", "election-technology-upgrades"), label: "Claims · tech upgrades" },
      ],
    },
  ),
  lesson(
    "foster-party-collaboration",
    "predicted-debate-questions",
    "How do you plan to foster collaboration between parties?",
    "People over politics; fair ballot access; neutral administration — avoid partisan reform laundry list.",
    [
      {
        heading: "Kelly frame",
        body:
          "SOS serves all parties on the ballot; model cross-party respect (forum opponent commitment); clerk room is neutral ground.",
      },
      {
        heading: "Pakko proximity",
        body:
          "Acknowledge competition concerns without endorsing LP platform. Hammer may claim bipartisan clerk relationships — agree, stay administrator.",
      },
    ],
    {
      debateLines: [
        "Collaboration starts with fair administration — every party gets the same rules.",
      ],
      practiceSteps: [
        "Practice Pakko respect + Hammer agree lines in one 90-second answer.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "unifier-cross-party"), label: "Kelly · unifier" },
      ],
    },
  ),

  // —— Watch for tells ——
  lesson(
    "hammer-personal-anecdotes",
    "watch-for-tells",
    "Hammer's emphasis on personal anecdotes to establish credibility",
    "93-year-old poll worker story, Riverside Grocery breakfast, church and business examples — rapport tool, not policy proof.",
    [
      {
        heading: "Pattern",
        body:
          "Hammer grounds policy answers in stories (poll worker age, DMV car analogy, fried potatoes). Builds warmth with clerks; can eat clock in 90-second limits.",
      },
      {
        heading: "Kelly response",
        body:
          "Let anecdote land — pivot to implementation: 'That's exactly why we need sustainable staffing and training pipelines.'",
      },
    ],
    {
      forumEvidence: [
        "Poll worker 93 → 94 years old story on election worker burnout.",
        "DMV analogy: clerks out of back seat, Hammer as driver.",
      ],
      practiceSteps: [
        "Watch forum clip — timestamp three anecdotes.",
        "Practice pivot from story to policy in 15 seconds.",
      ],
      relatedLinks: [
        { href: epDebatePrepDayHref("day-2-read-the-table"), label: "Command course · Day 2" },
      ],
    },
  ),
  lesson(
    "pakko-outsider-rhetoric",
    "watch-for-tells",
    "Pakko's outsider rhetoric to appeal to disenchanted voters",
    "Economist credential, LP chair, duopoly critique, 'wasted vote' inversion — signals to disaffected R/D voters.",
    [
      {
        heading: "Tells",
        body:
          "Newspaper economist intro; competition and ballot access statistics; federalism warnings; reluctant spending except elections.",
      },
      {
        heading: "Kelly read",
        body:
          "Respect outsider angle; don't argue voters wasted votes on Pakko; contrast administrator readiness when moderator compares qualifications.",
      },
    ],
    {
      practiceSteps: [
        "Draft one-sentence Pakko respect line.",
        "Open Pakko dossier.",
      ],
      relatedLinks: [
        { href: epOppositionResearchModuleHref("dossier-pakko"), label: "Pakko dossier" },
      ],
    },
  ),
  lesson(
    "kelly-collaboration-unity",
    "watch-for-tells",
    "Kelly's focus on collaboration and unity",
    "Positive tell — also risk sounding soft if Hammer gets aggressive. Balance warmth with firm administrator lines.",
    [
      {
        heading: "Strength",
        body:
          "Clerks responded to people-over-politics and opponent respect. Differentiates from Hammer bill-warrior mode.",
      },
      {
        heading: "Calibration",
        body:
          "Unity doesn't mean conceding policy. Pair every unity line with a concrete clerk or voter benefit.",
      },
    ],
    {
      practiceSteps: [
        "Review forum tone on video — note when to add firmness.",
        "Psychology manual · pressure calibration if wired.",
      ],
      relatedLinks: [
        { href: EP_DEBATE_PREP_HREF, label: "Debate prep hub" },
      ],
    },
  ),
  lesson(
    "body-language-confidence",
    "watch-for-tells",
    "Body language indicating confidence or defensiveness",
    "Day 2 observational drill — map forum footage to debate-night scouting.",
    [
      {
        heading: "Scout list",
        body:
          "Hammer: direct gaze, anecdote pacing, time-limit friction with moderator. Pakko: professorial pause, quote reading. Kelly: forward lean, hands open, thanks to opponents.",
      },
      {
        heading: "Use",
        body:
          "Staff logs tells in war room; Kelly doesn't call out body language on stage — internal intel only.",
      },
    ],
    {
      practiceSteps: [
        "Silent re-watch 10 minutes — notebook only, no audio.",
        "Share three tells with staff partner.",
      ],
      relatedLinks: [
        { href: epDebatePrepDayHref("day-2-read-the-table"), label: "Command course · Day 2" },
      ],
    },
  ),
  lesson(
    "integrity-question-reactions",
    "watch-for-tells",
    "Reactions to direct questions about election integrity",
    "High-emotion lane — who gets defensive, who over-claims rankings, who brings clerk allies into answer.",
    [
      {
        heading: "Forum pattern",
        body:
          "Hand-count question heated room. Hammer: don't break #1 system. Kelly/Pakko: affirm security, transparency opportunity. Hammer cited Heritage scorecard work.",
      },
      {
        heading: "Debate prep",
        body:
          "Pre-decide Kelly temperature: calm affirm + clerk credit + show process. Never match conspiracy tone.",
      },
    ],
    {
      practiceSteps: [
        "Rehearse hand-count question from forum transcript.",
        "Open trap lane 2021 vs 2025 if Hammer pivots to package.",
      ],
      relatedLinks: [
        { href: epTrapLaneHref("2021-vs-2025-pivot"), label: "Trap lane · 2021 vs 2025" },
      ],
    },
  ),

  // —— Newspaper angles ——
  lesson(
    "kelly-collaborative-sos-vision",
    "newspaper-angles",
    "Kelly Grappe's vision for a collaborative Secretary of State office",
    "Press will frame ACCA civility as story — Kelly owns 'people over politics' and clerk partnership if backed by specifics.",
    [
      {
        heading: "Narrative",
        body:
          "Three candidates civil to clerks; Kelly's opponent handshake; roundtables and visits as governing model not slogan.",
      },
      {
        heading: "Earned media discipline",
        body:
          "Offer reporters clerk testimonials and process examples — not opponent attacks. Claims gate all quotes.",
      },
    ],
    {
      debateLines: [
        "My vision is a service office that shows up for every county — that's the headline I'll earn.",
      ],
      practiceSteps: [
        "Draft 3-sentence press quote from forum proof points.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "listen-county-clerks"), label: "Kelly · clerk listening" },
      ],
    },
  ),
  lesson(
    "civic-education-engagement",
    "newspaper-angles",
    "The role of civic education in increasing voter engagement",
    "Shared theme — Kelly must show differentiated programs vs generic 'schools' talk.",
    [
      {
        heading: "Angle",
        body:
          "Youth creativity, civic index honesty, under-50 electorate — human interest hooks for local papers.",
      },
      {
        heading: "Risk",
        body:
          "Hammer may claim schools lane — Kelly answers with program detail and partners.",
      },
    ],
    {
      practiceSteps: [
        "Prepare one youth story safe for press (no PII).",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("hammer-themes", "civic-education"), label: "Hammer · civic education" },
      ],
    },
  ),
  lesson(
    "candidates-election-security",
    "newspaper-angles",
    "How each candidate plans to address election security and integrity",
    "Expect '#1 state' repetition — Kelly story is clerk-led security + transparency, not ranking wars.",
    [
      {
        heading: "Press frame",
        body:
          "Tri-candidate agreement on secure elections with different emphasis: Hammer legislation, Pakko testing transparency, Kelly marketing truth.",
      },
      {
        heading: "Kelly line for editors",
        body:
          "Security is local excellence — I'll fund and spotlight clerks, not argue abstract rankings.",
      },
    ],
    {
      claimsGate: ["Ranking citations — verify before giving to reporters."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("hammer-themes", "election-security"), label: "Hammer · security theme" },
      ],
    },
  ),
  lesson(
    "technology-future-elections",
    "newspaper-angles",
    "The impact of technology on the future of Arkansas elections",
    "Clerk software question is timely — federal funds, 20-year systems, AI mention from Hammer.",
    [
      {
        heading: "Story hooks",
        body:
          "Modernization funding, vendor contracts, AI governance — Hammer raised AI in business services answer.",
      },
      {
        heading: "Kelly hook",
        body:
          "Clerk-led requirements + advocate in legislature — process leader, not tech buzzwords.",
      },
    ],
    {
      practiceSteps: [
        "Read claims gate · tech upgrades before press interview.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("claims-gate-notes", "election-technology-upgrades"), label: "Claims · tech upgrades" },
      ],
    },
  ),

  // —— Claims gate notes ——
  lesson(
    "hammer-legislative-history",
    "claims-gate-notes",
    "Verify Hammer's legislative history and specific bills related to election security.",
    "Forum AI and Hammer both cite sponsorship lists and rankings — Arkleg verification required before debate or ads.",
    [
      {
        heading: "Task",
        body:
          "Pull primary/co-sponsor list for 2021 election cluster and related acts. Match forum quotes to enrolled text. Mark partial vs supported in claims ledger.",
      },
      {
        heading: "Debate rule",
        body:
          "Kelly does not cite bill numbers unless rehearsed with verified cards. Use pattern language: 'rule changes counties had to implement.'",
      },
    ],
    {
      practiceSteps: [
        "Open opposition research · integrity 2021 + timeline.",
        "Run three forum Hammer bill claims through claims ledger.",
      ],
      claimsGate: [
        "Every act number on stage — verify enrollment.",
        "Heritage #1 claim — verify year and methodology.",
      ],
      relatedLinks: [
        { href: epOppositionResearchModuleHref("integrity-foundation-2021"), label: "2021 integrity foundation" },
        { href: epOppositionResearchModuleHref("timeline"), label: "Legislative timeline" },
        { href: epOppositionResearchModuleHref("claims-ledger"), label: "Claims ledger" },
      ],
    },
  ),
  lesson(
    "pakko-ballot-access",
    "claims-gate-notes",
    "Check Pakko's claims about the Libertarian Party's ballot access challenges.",
    "Eight consecutive petitions, Thurston case, seat competition stats — verify before Kelly echoes or rebuts.",
    [
      {
        heading: "Verify",
        body:
          "LP petition history, uncontested seat fraction, Thurston holding — staff legal check, not Kelly ad-lib.",
      },
      {
        heading: "Stage",
        body:
          "Kelly can agree ballot access should be fair without validating specific LP statistics unverified.",
      },
    ],
    {
      practiceSteps: [
        "Staff memo: Pakko forum stats with sources.",
        "Open Pakko dossier claims section.",
      ],
      relatedLinks: [
        { href: epOppositionResearchModuleHref("dossier-pakko"), label: "Pakko dossier" },
      ],
    },
  ),
  lesson(
    "kelly-business-leadership",
    "claims-gate-notes",
    "Confirm Kelly's experience in business leadership roles.",
    "30 years, 800 employees, Verizon HQ — standard bio claims; confirm titles/dates for debate and press.",
    [
      {
        heading: "Verify",
        body:
          "Employment history, role titles, team size context (building vs global headcount). Align website bio with verified resume.",
      },
      {
        heading: "Opponent risk",
        body:
          "Hammer may contrast 'not a politician' vs 'no government experience' — verified business metrics are defense.",
      },
    ],
    {
      practiceSteps: [
        "Cross-check bio with campaign personnel file — no PII in logs.",
      ],
      claimsGate: ["No inflated titles; use verified phrasing in briefing book."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "business-admin-competence"), label: "Kelly · business competence" },
      ],
    },
  ),
  lesson(
    "voter-engagement-statistics",
    "claims-gate-notes",
    "Validate the statistics on voter engagement and turnout in Arkansas.",
    "Winthrop civic index, under-50 voting-age majority, who actually votes — forum-used stats need sources.",
    [
      {
        heading: "Priority stats",
        body:
          "Kelly cited Winthrop Rockefeller civic index bottom ranking; under-50 majority vs over-50 turnout pattern — get primary sources.",
      },
      {
        heading: "Use",
        body:
          "Powerful if verified; drop if needs_research — generic 'we need more engagement' still works.",
      },
    ],
    {
      practiceSteps: [
        "Staff one-pager: engagement stats with citations.",
        "Mark claims ledger entries.",
      ],
      relatedLinks: [
        { href: epOppositionResearchModuleHref("claims-ledger"), label: "Claims ledger" },
      ],
    },
  ),
  lesson(
    "election-technology-upgrades",
    "claims-gate-notes",
    "Ensure accuracy of claims regarding election technology upgrades.",
    "20-year system age, federal funding, vendor contracts — clerk forum question spawned consensus; verify facts before press.",
    [
      {
        heading: "Verify",
        body:
          "Current EMS vendor, last major upgrade, federal grant status, Cole Jester transition projects — from SOS office public info and clerk interviews.",
      },
      {
        heading: "Avoid",
        body:
          "Promising timelines or dollar amounts not approved. 'Advocate and listen first' is safe.",
      },
    ],
    {
      practiceSteps: [
        "Staff tech fact sheet from clerk forum Q&A.",
        "Link to predicted Q · election technology.",
      ],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("predicted-debate-questions", "election-technology-changes"), label: "Predicted Q · tech changes" },
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "modernize-election-tech"), label: "Kelly · modernize tech" },
      ],
    },
  ),
];
