/**
 * OFFENSIVE debate prep — operating principles, hand-play, and Hammer-line flips.
 * INTERNAL. Every on-stage line still passes claims gate / counsel.
 */

export type HammerStatementFlip = {
  id: string;
  hammerSays: string;
  whatItSoundsLike: string;
  kellyTurn: string;
  proofAnchor: string;
  claimsNote: string;
};

/** Non-negotiables — read before every debate rehearsal */
export const OFFENSIVE_DEBATE_PRINCIPLES = {
  headline: "Offensive principles — record, service, and voter respect",
  principles: [
    {
      id: "P1",
      title: "Attack the job he did, never the person he is",
      rule: "No pastor jokes, no family, no temperament labels. Every hit is a bill, an act, a funding line, or a clerk burden he did not solve.",
    },
    {
      id: "P2",
      title: "Kelly is the superior SOS candidate — prove it with service",
      rule: "Voters must leave believing Kelly will administer fairly in all 75 counties: phone answered, rules published, clerks funded. Superiority = competence + non-partisan deed, not volume.",
    },
    {
      id: "P3",
      title: "Integrity and participation are one package",
      rule: "Never let Hammer force a false choice (fraud OR ballot access). Kelly owns both: prosecute real fraud, protect lawful petition drives and referendum rights.",
    },
    {
      id: "P4",
      title: "Author vs administrator — the whole frame",
      rule: "Hammer legislates; Kelly implements. When he claims experience, pivot to who picks up the phone on Friday when a clerk gets a new mandate.",
    },
    {
      id: "P5",
      title: "Act-anchor or do not say it",
      rule: "Cite Act numbers only when verified on Arkleg. Slow down on the number. If unsure, say what you are still verifying — discipline builds trust.",
    },
    {
      id: "P6",
      title: "Road stories are evidence, not decoration",
      rule: "One human story per answer (15s max), then act or policy. Stories prove 'for the people'; acts prove Hammer's pattern.",
    },
    {
      id: "P7",
      title: "Respect Packo; narrow the race to who will run the office",
      rule: "Friendly to Dr. Pakko on stage. Do not coordinate votes aloud in debate week. Leave ground for phased ANYTHING BUT HAMMER — L pulling 10–12% of soft GOP helps Kelly plurality math.",
    },
    {
      id: "P8",
      title: "Offensive tone is calm certainty",
      rule: "Slower than feels natural. Methodical. Assured. Let Hammer escalate; Kelly does not match volume — the contrast is the win.",
    },
  ],
};

/** How we play our hand — strategy, not scripts */
export const HOW_WE_PLAY_OUR_HAND = {
  headline: "How we play our hand",
  tableStakes: [
    "Open with SOS-as-service before any opponent name (first 15 seconds).",
    "Name Hammer once when contrasting author vs administrator — then back to Kelly pledge.",
    "Own direct democracy early if moderator might go there — values first, Acts 218–768 pattern second, trap third.",
    "Close on superiority: best prepared to serve, non-partisan in practice, for the people.",
  ],
  rhythm: [
    "Absorb → acknowledge fair slice (if any) → pivot → act or county burden → Kelly exit.",
    "Never answer the insult inside the question — answer the voter's underlying worry (trust, cost, confusion).",
    "Press when he claims 'integrity' without data; release when moderator calls time — no filibuster.",
  ],
  whenToPress: [
    "Petition / ballot measure questions — full direct democracy corner.",
    "Experience / tenure — implementation dare (funding, training, hotline).",
    "Smooth transition / govern quote — contrast 2025 petition package with clerk partnership pledge.",
    "Election confidence slogans — ask for measurable outcomes per act.",
  ],
  whenToDeEscalate: [
    "Personal faith or biography — one sentence respect, pivot to SOS duties.",
    "Packo policy unrelated to elections administration — agree where fair, do not pile on.",
    "Gotcha on Kelly biography — brief truth, return to office job description.",
  ],
  winCondition:
    "Not 'won the argument' — voters think: Kelly will run the office for clerks and voters; Hammer wrote rules without implementation; Kelly is safest pair of integrity + access.",
};

/** Turn Hammer's lines into Kelly offensive strengths */
export const HAMMER_STATEMENT_FLIPS: HammerStatementFlip[] = [
  {
    id: "flip-experience",
    hammerSays: "I've served 16+ years — I know how government works.",
    whatItSoundsLike: "Experience equals qualification for SOS.",
    kellyTurn:
      "Legislative experience is real — and this job is different. SOS administers what the Capitol passes. Clerks need a partner who publishes rules and funds training — not another author without a hotline.",
    proofAnchor: "Road story: clerk Friday call · TBP announcement clerk pledge vs 2025 acts",
    claimsNote: "NEEDS_REVIEW — do not dispute his years; dispute fit for administering.",
  },
  {
    id: "flip-integrity",
    hammerSays: "Election integrity is my priority / #1 ranking.",
    whatItSoundsLike: "Only Hammer protects elections.",
    kellyTurn:
      "I agree we must prosecute real fraud — show us the conviction data that justified each petition bill, and the funding line for clerks implementing Act 768 the month it passed.",
    proofAnchor: "Acts 218, 240, 274, 241, 768 · trap: fraud cases per act",
    claimsNote: "Verify ranking claim before citing on stage — use record pattern if not verified.",
  },
  {
    id: "flip-smooth-transition",
    hammerSays: "My job is not to blow the place up — smooth transition, govern.",
    whatItSoundsLike: "Steady hand; Kelly is disruptive.",
    kellyTurn:
      "Smooth for whom? Counties implementing a stack of new petition laws need transition support — training, funding, readable rules. I am running to govern the office clerks actually use.",
    proofAnchor: "KATV transcript smooth-transition line · 2025 petition package",
    claimsNote: "NEEDS_REVIEW — quote verified in opponent-media-transcripts.json.",
  },
  {
    id: "flip-petition-protect",
    hammerSays: "We protected the constitution / stopped fraud on petitions.",
    whatItSoundsLike: "Reform was necessary and modest.",
    kellyTurn:
      "If the problem was fraud, name the cases. If the problem was confusion, the Secretary of State should publish rules voters can read — not pile seven acts on volunteers in one session.",
    proofAnchor: "Acts 218, 240, 274, 241, 279, 764, 768 — debate sequence in legislative offense tab",
    claimsNote: "Do not say 'dismantled' without counsel — use 'squeeze' or 'stack of restrictions' with cites.",
  },
  {
    id: "flip-clerks",
    hammerSays: "I will work with county clerks and election commissioners.",
    whatItSoundsLike: "He is the clerks' ally.",
    kellyTurn:
      "Clerks do not need another promise from Little Rock — they need a Secretary of State who shows up with a training calendar and advocates at the Capitol when mandates are unfunded. That is what I heard on the road.",
    proofAnchor: "Road story road-01 or road-05 · implementation dare",
    claimsNote: "Use verified county story when available; generic 'a clerk in south Arkansas' until then.",
  },
  {
    id: "flip-direct-democracy-charge",
    hammerSays: "(Silence or deflect when asked about restricting signature gathering.)",
    whatItSoundsLike: "Press already framed him — he has no short answer.",
    kellyTurn:
      "Arkansas voters cherish ballot measures. I will defend referendum rights and integrity together — and I will not trade away direct democracy for slogans.",
    proofAnchor: "THV11 'led the charge' framing · Act 768 local initiative",
    claimsNote: "THV11 line NEEDS_REVIEW before attributing to reporter on stage.",
  },
  {
    id: "flip-inexperience",
    hammerSays: "My opponent has never run anything / first-time candidate.",
    whatItSoundsLike: "Kelly is unqualified.",
    kellyTurn:
      "I am not asking for a legislative platform — I am asking to run a statewide service desk. I have listened in all seventy-five counties; Senator Hammer has written the laws clerks must live under. Compare who will administer fairly starting day one.",
    proofAnchor: "Superiority pillars · road story count",
    claimsNote: "Do not invent résumé claims — stay on SOS duties and listening tour.",
  },
  {
    id: "flip-pro-business",
    hammerSays: "Pro-business — cut red tape at SOS.",
    whatItSoundsLike: "Hammer is modernizer; Kelly is bureaucrat.",
    kellyTurn:
      "Business filings matter — so do election workers. Transparency is pro-business: predictable rules, fast answers, no surprise mandates on counties that businesses depend on for elections.",
    proofAnchor: "SOS business services division · transparency pillar",
    claimsNote: "GENERAL_FRAME — no unsourced business stats.",
  },
  {
    id: "flip-packo-split",
    hammerSays: "(Attacks Packo or third party as spoiler.)",
    whatItSoundsLike: "Kelly should join pile-on.",
    kellyTurn:
      "Voters deserve choices. Dr. Pakko brings reform ideas; I bring daily administration for clerks in every county. This office is too important to reduce to party theater.",
    proofAnchor: "Packo-friendly lines · ANYTHING BUT HAMMER phased (do not say vote L on stage yet)",
    claimsNote: "Never call Packo spoiler — aligns with GOP break strategy without coordination.",
  },
];

export function getHammerFlipById(id: string): HammerStatementFlip | undefined {
  return HAMMER_STATEMENT_FLIPS.find((f) => f.id === id);
}
