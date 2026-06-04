/**
 * OFFENSIVE narrative control — stage story, Hammer "Check My Record," Packo geometry.
 * Walk Kelly through delivery beat-by-beat. INTERNAL; claims gate on every act cite.
 */

export type DeliveryBeat = {
  step: number;
  label: string;
  sayThis: string;
  deliveryNotes: string[];
  doNot: string[];
};

export type RecordFindingFrame = {
  id: string;
  headline: string;
  narrative: string;
  exampleActs: string[];
  citizenHarm: string;
  kellyContrast: string;
  trapIfHeDoublesDown: string;
};

/** Who controls what story on a three-person stage */
export const STAGE_NARRATIVE_CONTROL = {
  headline: "Control the narrative on stage — Kelly sets the frame, Hammer reacts, Packo widens the lane",
  thesis:
    "Hammer wants a referendum on your biography. Packo wants a referendum on the two-party system. Kelly wants a referendum on who will run the Secretary of State's office for the next four years. Every answer returns to that third story.",
  theThreeStories: [
    {
      candidate: "Hammer",
      storyHeWants: "Career legislator, election integrity champion, check my record, smooth governing hand.",
      storyWeAllow: "He has a record — we checked it. It is a legislator's record, not an administrator's partnership with counties.",
      storyWeRefuse: "Culture-war protagonist, personal attack target, or the only adult in the room.",
    },
    {
      candidate: "Packo",
      storyHeWants: "Reform outsider, anti-duopoly, competent alternative for voters tired of establishment.",
      storyWeAllow: "Respectful reform voice; voters deserve choices; Dr. Pakko analyzes, Kelly administers.",
      storyWeRefuse: "Spoiler, wasted vote, or someone Kelly needs to attack to please Republicans.",
    },
    {
      candidate: "Kelly",
      storyHeWants: "N/A — Kelly does not chase opponent frames.",
      storyWeAllow: "For the people SOS: non-partisan in deed, clerk partner, transparent rules, integrity + lawful participation together.",
      storyWeRefuse: "Debate as courtroom drama about personality — always service desk for 75 counties. Repeat: Trust you can verify · Counties you can support · Participation with real integrity.",
    },
  ],
  moderatorQuestions: [
    "Whatever the question, answer the voter's fear first (confusion, cost, trust), then one act or road story, then SOS pledge.",
    "If asked about Packo: narrow to administration — 'Who will run the office Monday morning?'",
    "If asked about Hammer record: use Check My Record playbook — do not improvise new acts under lights.",
  ],
  packoWhileHammerDominates:
    "When Hammer filibusters record, glance once at moderator — not at Packo. If Packo is praised for reform, agree briefly; if Packo piles on Hammer, do not join — 'I am running to administer, not to score points.'",
  closingNarrativeLock:
    "Last image: Kelly calm, prepared, checked the record, still standing for clerks. Hammer loud with slogans. Packo optional third path. Voters remember who will answer the phone.",
};

/** Hammer's trail slogan — prepared response */
export const CHECK_MY_RECORD_PLAYBOOK = {
  headline: 'When Hammer says "Check my record" — welcome it, then reframe the job',
  whenItComes: [
    "Mid-debate when Kelly lands an act or county burden — he retreats to authority.",
    "After a petition / direct democracy exchange — he cannot defend data, changes subject.",
    "Closing segment — 'look at my years' as emotional anchor.",
    "Any time he feels Kelly gaining trust — experience is his safe harbor.",
  ],
  mentalModel:
    "This is not a trap for Kelly — it is a gift. He invited the comparison. You smile inside, slow down, and show the room you already did the homework. You are not afraid of his record; you are explaining why his record is the wrong record for SOS.",
  openingLineChoices: [
    {
      id: "cmr-welcome",
      label: "Preferred — welcome the challenge",
      text: "I have checked your record, Senator — and I respect your years in the legislature. The question is what that record does to county clerks, petition volunteers, and voters when the Secretary of State has to implement it.",
      deliveryNotes: ["Half-beat pause after 'checked your record'", "No sarcasm on 'respect'"],
    },
    {
      id: "cmr-direct",
      label: "Shorter — if time is tight",
      text: "I checked your record. You wrote the rules — I am asking to help counties live under them fairly.",
      deliveryNotes: ["Point to chest on 'I checked' — once only", "Then hands still"],
    },
  ],
  deliveryWalkthrough: [
    {
      step: 1,
      label: "Absorb without flinching",
      sayThis: "(Listen. Do not interrupt. Let him say 'check my record' or list years.)",
      deliveryNotes: [
        "Face moderator, not him, while he speaks — shows composure.",
        "One slow breath in through nose before you talk.",
      ],
      doNot: ["Eye-roll", "Head shake", "Mouth 'that's not true' while he talks"],
    },
    {
      step: 2,
      label: "Welcome + prove preparation",
      sayThis:
        "I have checked your record, Senator. Our team verified the bills on Arkleg — the 2025 petition package alone includes Acts 218, 240, 274, 241, and 768 that you sponsored.",
      deliveryNotes: [
        "Say 'verified on Arkleg' — signals preparation, not opposition research gossip.",
        "Pause half-beat after each act number (max three acts in one answer unless moderator invites more).",
        "If nervous, use only Act 768 + 'and a stack of petition bills in the same session' instead of listing all.",
      ],
      doNot: ["Say 'we dug up dirt'", "Cite act without verification", "List more than four numbers in one breath"],
    },
    {
      step: 3,
      label: "Reframe — wrong job description",
      sayThis:
        "That record is real legislative experience — but Secretary of State is not the Senate floor. It is the office that must publish rules clerks can read, fund training, and answer the phone when a mandate lands on a Friday afternoon.",
      deliveryNotes: ["Voice drops slightly — authority without anger", "Friday afternoon line = road story hook"],
      doNot: ["Say he is unqualified as a human", "Compare to pastor or church"],
    },
    {
      step: 4,
      label: "Citizen harm — one concrete frame",
      sayThis:
        "When I talk to clerks and petition volunteers, they are not asking for more slogans about integrity — they are asking who pays for the next layer of rules and who explains them to voters.",
      deliveryNotes: [
        "Insert road story here if you have verified county (15 seconds max).",
        "Otherwise: 'a clerk in south Arkansas' or 'a volunteer who gave up a lawful drive'.",
      ],
      doNot: ["Fabricate county name", "Claim Hammer hates voters"],
    },
    {
      step: 5,
      label: "Trap — data or funding (pick one)",
      sayThis:
        "Senator, you asked voters to check your record — so help us check the outcome: how many fraud convictions justified Act 241, and what funding line did counties get the month Act 768 became law?",
      deliveryNotes: [
        "Question inflection down at end — calm prosecutor, not shouting.",
        "If he deflects, do not chase — nod and pivot to Kelly SOS pledge.",
      ],
      doNot: ["Ask three questions at once", "Follow him into 2021 package unless time allows"],
    },
    {
      step: 6,
      label: "Kelly exit — superiority close on the exchange",
      sayThis:
        "I am not running to add another bill. I am running to administer fairly — for every county, every party — with integrity and participation together. That is what I found when I checked the record versus what this office needs.",
      deliveryNotes: ["Stop talking when done — do not fill silence with more attacks", "Let moderator or Hammer respond"],
      doNot: ["Keep piling acts after he is silent", "End on insult"],
    },
  ] as DeliveryBeat[],
  ifHeSaysCheckYours: {
    sayThis:
      "Fair question. I am not asking you to trust my years in the Senate — I am asking you to compare who will run the statewide service desk. I have listened in all seventy-five counties; my record is what I will do starting day one: publish rules, support clerks, protect lawful petition drives.",
    deliveryNotes: ["No defensiveness on biography", "Pivot in one sentence"],
    doNot: ["Long autobiography", "Attack his faith or family in response"],
  },
  indexCardVersion: "Checked record → acts verified → wrong job → clerk harm → one trap → administer fairly",
};

/** How record findings feed offensive + defensive strategy */
export const RECORD_FINDING_FRAMES: RecordFindingFrame[] = [
  {
    id: "rf-citizens",
    headline: "Hurts citizens and volunteers — not abstract policy",
    narrative:
      "Each petition act adds compliance weight on volunteers and confusion for voters. Hammer's record centralizes complexity in Little Rock; counties and citizens pay in time, legal risk, and abandoned lawful drives.",
    exampleActs: ["218", "241", "768"],
    citizenHarm: "Lawful circulators quit; voters see ballot access shrink without seeing fraud prosecuted.",
    kellyContrast: "Kelly publishes plain-language rules and defends lawful participation while prosecuting real fraud.",
    trapIfHeDoublesDown: "Name the fraud cases or admit the squeeze was about process, not crime.",
  },
  {
    id: "rf-centralized",
    headline: "Supports centralized government from the Capitol",
    narrative:
      "Hammer's pattern moves discretion and burden to state-level rulemaking without county funding. That is Big Government in practice — more mandates, less local capacity.",
    exampleActs: ["274", "279", "764"],
    citizenHarm: "Quorum courts and clerks absorb unfunded mandates; Little Rock authors, counties implement.",
    kellyContrast: "Kelly advocates for funding at the Capitol and trains at the SOS — partnership, not orders.",
    trapIfHeDoublesDown: "Which county got new state money the same month the act passed?",
  },
  {
    id: "rf-sos-power",
    headline: "Prepares SOS office for more power, less transparency",
    narrative:
      "Poll watchers, complaints timelines, and petition rules expand SOS referee role without mandating training or public clarity. Hammer legislates power into the office; Kelly must either use it fairly or refuse the imperial SOS model.",
    exampleActs: ["444", "279", "768"],
    citizenHarm: "Precinct judges and clerks become referees without resources; power concentrates without accountability.",
    kellyContrast: "Kelly limits herself to transparent rules, hotline, and public calendars — power in service of voters.",
    trapIfHeDoublesDown: "Which SOS training module did you fund when Act 444 passed?",
  },
  {
    id: "rf-direct-democracy",
    headline: "Weakens direct democracy — referendum and local initiative",
    narrative:
      "2025 session stack is not one fix — it is a sustained squeeze on signature gathering and local initiatives. Media already frames him as leading that charge; Kelly confirms with acts, not adjectives.",
    exampleActs: ["218", "240", "274", "241", "768"],
    citizenHarm: "Arkansas loses outlet when legislating from the Capitol feels safer than trusting voters.",
    kellyContrast: "Kelly pairs integrity with referendum rights — prosecute fraud, protect lawful drives.",
    trapIfHeDoublesDown: "You sponsored Act 768 — what documented local petition problem did it fix?",
  },
  {
    id: "rf-pattern",
    headline: "2021 package proves this is not a one-year story",
    narrative:
      "Hammer cannot claim 2025 was a fresh start. Six-bill 2021 election package shows continuity — Kelly breaks pattern with service, not another authorship spree.",
    exampleActs: ["727", "728", "729", "730", "731"],
    citizenHarm: "Voters hear 'integrity' every cycle; clerks get new rules every cycle.",
    kellyContrast: "Kelly stops adding without implementing — training calendar, funding advocacy, readable rules.",
    trapIfHeDoublesDown: "What changed for clerks between 2021 and 2025 besides more paper?",
  },
];

/** Packo narrative — ally lane without losing control */
export const PACKO_NARRATIVE_CONTROL = {
  headline: "Packo on stage — friendly, narrow, never lose the SOS story",
  whenPackoAttacksDuopoly:
    "Agree voters deserve choices. Pivot: 'This office runs elections in seventy-five counties every day — I am running to do that work transparently.'",
  whenPackoAttacksHammerRecord:
    "Do not pile on. 'Dr. Pakko and I both see process problems — I am the candidate asking to administer the fix clerks can use Monday morning.'",
  whenHammerAttacksPackoAsSpoiler:
    "Defend voter choice without endorsing L on stage: 'Arkansas deserves more than two voices — and deserves a Secretary of State who shows up for clerks.'",
  whenModeratorAsksWhoIsMostQualified:
    "Kelly: only candidate running to administer full-time. Packo: ideas. Hammer: author of rules counties must implement. Compare jobs, not IQ.",
  narrativeDoNot: [
    "Debate Packo on economics or foreign policy.",
    "Say 'vote Libertarian' in three-way forum (phased later).",
    "Let Hammer bait Kelly into attacking Packo — splits anti-Hammer energy.",
  ],
};

/** Rehearsal script — read aloud 3x before debate */
export const CHECK_MY_RECORD_REHEARSAL_SCRIPT = {
  label: "Full 45–60 second Check My Record answer (rehearse standing)",
  claimsGate: "NEEDS_REVIEW — verify act list with staff night-before",
  text: `Senator, I have checked your record — and I respect your years in the legislature. Our team verified your bills on Arkleg. In 2025 alone you sponsored a stack of petition laws — Acts 218, 240, 274, 241, and 768 — that tighten signature gathering and local initiatives.

That record is real — but Secretary of State is not the Senate floor. It is the office that must publish rules clerks can read, fund training, and answer the phone when a mandate lands on a Friday afternoon. On the road, a clerk told me they got new rules from Little Rock and no training budget — that is what your record does in practice.

You asked voters to check your record — so check the outcome with me: how many fraud convictions justified Act 241, and what funding did counties get when Act 768 became law?

I am not running to add another bill. I am running to administer fairly — integrity and participation together — in every county, for every party. That is what I found when I checked the record, and that is why I am asking for this job.`,
  deliveryChecklist: [
    "Total time: aim 50 seconds — moderator may cut at 45.",
    "Acts: pause after 768; do not rush the list.",
    "Road story: swap 'a clerk told me' for verified county when approved.",
    "Trap question: one breath, downward inflection.",
    "Final sentence: eyes to camera/voters, not Hammer.",
  ],
};

export function getRecordFrameById(id: string): RecordFindingFrame | undefined {
  return RECORD_FINDING_FRAMES.find((f) => f.id === id);
}
