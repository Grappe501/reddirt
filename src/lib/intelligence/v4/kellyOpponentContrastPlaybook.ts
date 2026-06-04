import type { OpponentContrastLane, PlaybookStep, TrapSetup } from "@/lib/intelligence/v4/debateOperatorPlaybookTypes";

export const SOS_JOB_CONTRAST = {
  headline: "Secretary of State is a service job — not a culture-war platform",
  kellyProfile:
    "Kelly Grappe: rebuild trust, support all 75 counties equally, publish rules voters can read, protect lawful participation while prosecuting real fraud.",
  hammerProfile:
    "Kim Hammer: long legislative tenure and election-law specialization — record shows repeated rule changes; verify county funding and SOS implementation experience.",
  experienceGapSteps: [
    {
      step: 1,
      dimension: "WHAT" as const,
      detail: "SOS administers elections statewide, trains clerks, certifies results, guides ballot measures — different from sponsoring bills in the Senate.",
    },
    {
      step: 2,
      dimension: "WHEN" as const,
      detail: "When Hammer says ‘I wrote the laws’ or ‘I know elections better than anyone.’",
    },
    {
      step: 3,
      dimension: "WHERE" as const,
      detail: "Debate opening, ‘qualifications’ segment, editorial board interviews.",
    },
    {
      step: 4,
      dimension: "WHY" as const,
      detail: "Voters need an administrator who implements fairly — not only a legislator who adds mandates.",
    },
    {
      step: 5,
      dimension: "HOW" as const,
      detail: "Credit his Senate service → ask who will fund clerk training and publish SOS guidance → Kelly implementation plan.",
    },
    {
      step: 6,
      dimension: "WHO" as const,
      detail: "County clerks and voters in all 75 counties — equal treatment, not partisan theater.",
    },
  ],
  inexperienceFraming:
    "Do not say ‘inexperienced’ as insult. Say: ‘Writing election law is not the same as running the Secretary of State’s office for 75 counties — Kelly’s campaign is built on service, transparency, and clerk partnership.’",
  backgroundWeaknessesSafe: [
    "Narrow 2026 runoff margin — coalition not settled (source reporting; INTERPRETATION).",
    "Pattern of petition/access restrictions — frame as voter burden, cite bills.",
    "2021 rhetoric controversy — stay values-based; cite news coverage, not ad hominem.",
    "County burden questions still open — use research-question framing until funded.",
    "No documented statewide SOS administration tenure — contrast job requirements vs Senate record.",
  ],
};

export const OPPONENT_TRAP_LANES: TrapSetup[] = [
  {
    name: "2021 vs 2025 pivot",
    baitLineYouWantFromOpponent: "‘My 2025 bills are a fresh start on election security.’",
    moderatorOrKellySetupQuestion: "You sponsored six major election bills in 2021 — how is 2025 different for county clerks?",
    kellyPivotWhenHeBites: "Open 2021 package timeline — continuity of architecture, not a new direction.",
    whyItWorks: "Pre-briefed voters see pattern; he must defend cumulative record.",
  },
  {
    name: "Integrity without participation",
    baitLineYouWantFromOpponent: "‘You have to choose security or chaos.’",
    moderatorOrKellySetupQuestion: "Name one bill where you added county funding for the security rule you passed the year before.",
    kellyPivotWhenHeBites: "Kelly: participation and integrity together — SOS publishes rules and supports clerks.",
    whyItWorks: "Breaks false binary; positions Kelly as problem-solver.",
  },
  {
    name: "County champion",
    baitLineYouWantFromOpponent: "‘I'm the counties' guy.’",
    moderatorOrKellySetupQuestion: "Which county clerk associations endorsed your implementation plan for Act 350?",
    kellyPivotWhenHeBites: "Kelly lists concrete SOS deliverables: training calendar, funding ask, hotline for clerks.",
    whyItWorks: "Tests vague rural identity against verifiable support.",
  },
  {
    name: "Fraud data dare",
    baitLineYouWantFromOpponent: "‘Fraud is everywhere — that's why we need these bills.’",
    moderatorOrKellySetupQuestion: "How many Arkansas election-fraud convictions in the last five years justify each bill number you cite tonight?",
    kellyPivotWhenHeBites: "Prosecute real fraud; don't criminalize volunteers — transparent SOS rules.",
    whyItWorks: "Moves emotion to data; Kelly stays tough on crime without overclaiming.",
  },
  {
    name: "Experience equals SOS-ready",
    baitLineYouWantFromOpponent: "‘Nobody knows election law like I do.’",
    moderatorOrKellySetupQuestion: "What did you do in office to help all 75 counties implement your bills on time?",
    kellyPivotWhenHeBites: "Senate experience is one chapter; SOS is service to every county equally.",
    whyItWorks: "Shifts from authorship to implementation — Kelly's frame.",
  },
  {
    name: "Culture-war escalation",
    baitLineYouWantFromOpponent: "Personal attack or partisan war language.",
    moderatorOrKellySetupQuestion: "(Kelly declines bait) ‘I'm running to make the Secretary of State's office work for every voter — let's talk about acts and counties.’",
    kellyPivotWhenHeBites: "Return to bill anchor + county impact + bridge.",
    whyItWorks: "Voters reward composure; clips favor Kelly discipline.",
  },
];

export const OPPONENT_CONTRAST_LANES: OpponentContrastLane[] = [
  {
    id: "sos-admin-vs-sponsor",
    title: "Legislator vs statewide administrator",
    hammerLikelyClaim: "I wrote the election laws that keep Arkansas secure.",
    kellyContrast: "We need someone who implements fairly in all 75 counties — not only adds rules from the Capitol.",
    experienceGap: "Sponsoring bills ≠ running SOS operations, clerk training, and uniform guidance.",
    debateSteps: SOS_JOB_CONTRAST.experienceGapSteps,
    socialUse: "Carousel: ‘Senator writes rules / SOS helps clerks implement them’ — Kelly third slide is service plan.",
    trapSetup: OPPONENT_TRAP_LANES[4],
  },
  {
    id: "petition-pattern",
    title: "Direct democracy / petition pattern",
    hammerLikelyClaim: "We tightened petitions to stop fraud.",
    kellyContrast: "Integrity without strangling lawful citizen initiatives.",
    experienceGap: "Multiple restriction bills in theme matrix — pattern INTERPRETATION until staff counts verified acts.",
    debateSteps: [
      { step: 1, dimension: "WHAT", detail: "Cluster of petition/ballot-access bills across sessions." },
      { step: 2, dimension: "WHEN", detail: "Initiative voters, young voters, reform press." },
      { step: 3, dimension: "WHERE", detail: "Town halls, campus events, X threads." },
      { step: 4, dimension: "WHY", detail: "Arkansas identity includes ballot measures." },
      { step: 5, dimension: "HOW", detail: "Theme first, then 2–3 bill numbers with acts verified." },
      { step: 6, dimension: "WHO", detail: "Volunteer circulators, not ‘elite activists.’" },
    ],
    socialUse: "Map graphic: bills by theme — ‘pattern matters’ with claims gate.",
    trapSetup: OPPONENT_TRAP_LANES[1],
  },
  {
    id: "county-burden",
    title: "County administration burden",
    hammerLikelyClaim: "Clerks want stronger election laws.",
    kellyContrast: "Clerks want partners — funding, training, clear timelines.",
    experienceGap: "Open research questions on unfunded mandates — do not state as fact without act text.",
    debateSteps: [
      { step: 1, dimension: "WHAT", detail: "County-themed bills in matrix + message guidance concerns." },
      { step: 2, dimension: "WHEN", detail: "Rural counties, clerk endorsements context, debate county segment." },
      { step: 3, dimension: "WHERE", detail: "County fairs, clerk meetings, local radio." },
      { step: 4, dimension: "WHY", detail: "Uneven implementation erodes trust." },
      { step: 5, dimension: "HOW", detail: "County frame before partisan frame." },
      { step: 6, dimension: "WHO", detail: "Election workers in understaffed offices." },
    ],
    socialUse: "Quote clerk concern from message guidance (paraphrase) + Kelly SOS pledge.",
    trapSetup: OPPONENT_TRAP_LANES[2],
  },
];

/** County clerks week — primary audience framing (not TV debate theater). */
export const COUNTY_CLERK_EVENT_FRAME = {
  headline: "Clerk rooms: partnership first, opponent second",
  opening90Seconds:
    "Thank clerks for the oath they keep. Name SOS as statewide back office — training calendar, hotline, funding advocacy. Do not open with Hammer.",
  whenToContrast:
    "Only when asked about opponents or when Hammer is present and claims authorship without implementation detail.",
  trapQuestions: [
    "What line items funded your 2021 package for our county?",
    "What is your SOS staff ratio per county for the newest mandate?",
    "Who trains poll watchers when disputes land on precinct judges?",
  ],
  packoRule: "Do not elevate Libertarian third candidate in clerk rooms unless asked — stay SOS-service.",
  closePledge:
    "Kelly SOS pledge: publish implementation guidance, answer your phone, advocate quorum-court funding with specifics.",
};

export const RECORD_ITEM_FRAMING_PRIMER = {
  title: "How to say a record item works against everyday Arkansans (safely)",
  steps: [
    "1. Name the bill/act (verified on Arkleg).",
    "2. Describe what changed in plain English for voters or clerks.",
    "3. Explain who bears the cost (time, money, confusion, fewer choices).",
    "4. Avoid motive words (corrupt, fraudster, stolen) unless claims ledger approves.",
    "5. Bridge to Kelly: SOS service — transparent rules, county support, lawful participation.",
    "6. Offer forward-looking fix: what Kelly’s SOS would do differently.",
  ],
  debateVsSocial: {
    debate: "60 seconds max: direct answer → act → impact → bridge. No scrolling notes on stage.",
    social: "One claim per post; link Arkleg; run claims gate; no paid boost on NEEDS_RESEARCH lines.",
  },
};
