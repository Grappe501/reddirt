/**
 * Full offensive approach depth — respond, rebut, lead framework with explanations.
 */

export type OffensiveMove = {
  id: string;
  name: string;
  whenToUse: string;
  setup: string;
  execution: string;
  expectedOpponentResponse: string;
  secondRoundKelly: string;
  thirdRoundKelly: string;
  backupEvidence: string;
  riskIfOverused: string;
  educationNote: string;
};

export const KELLY_OFFENSIVE_MOVES: OffensiveMove[] = [
  {
    id: "integrity-funding-trap",
    name: "Integrity without funding",
    whenToUse: "Hammer opens on election security or cites Act numbers without county detail.",
    setup: "Agree on integrity goal — then ask what funding line accompanied the last act.",
    execution:
      "I agree we need secure elections — show us the training dollars and SOS guidance counties got when Act [X] landed.",
    expectedOpponentResponse: "Lists more bill numbers; claims bipartisan support; pivots to 2020.",
    secondRoundKelly:
      "Security fails when clerks are left holding the bag — seventy-five counties do not implement at the same speed.",
    thirdRoundKelly:
      "One act, one county impact, SOS service close — no new claims in spin room without claims gate.",
    backupEvidence: "Anchor bills SB250/Act 350, HB1457 — Arkleg enrolled text",
    riskIfOverused: "Sounds like anti-security if tone is hot — stay calm, slow, factual.",
    educationNote:
      "Novice: memorize setup question only. Expert: pair with theme matrix row and one verified county example.",
  },
  {
    id: "author-vs-administrator",
    name: "Author vs administrator contrast",
    whenToUse: "Experience/readiness question or Hammer says 'I wrote the laws.'",
    setup: "Thank moderator — define SOS as service desk before opponent defines it as authorship.",
    execution:
      "Writing election law is not the same job as administering it in seventy-five counties — I am asking to help clerks live under the rules you pass.",
    expectedOpponentResponse: "Cites years in office; may interrupt with bill list.",
    secondRoundKelly:
      "Respect his legislative service — contrast who answers the phone when a mandate hits a Friday afternoon in Saline County.",
    thirdRoundKelly: "Shorter answer — win next exchange with county hotline frame.",
    backupEvidence: "2022 AR SOS debate pattern — role of office questions",
    riskIfOverused: "Do not mock legislature — voters respect service language.",
    educationNote: "Core offensive frame for entire debate — return after every Hammer record cite.",
  },
  {
    id: "direct-democracy-lead",
    name: "Direct democracy offensive lead",
    whenToUse: "Petition, initiative, or ballot-access question likely.",
    setup: "State Arkansas tradition — integrity and participation are not enemies.",
    execution:
      "Arkansas voters cherish ballot measures — I will not trade away direct democracy for slogans. SOS protects lawful signatures with transparent rules.",
    expectedOpponentResponse: "Hammer: fraud prevention needed; Packo: both parties failed reform.",
    secondRoundKelly:
      "Name verified act if claims clear — ask for Arkansas fraud cases justifying each restriction.",
    thirdRoundKelly: "Dr. Pakko and I both want voters heard — I will administer the office daily.",
    backupEvidence: "2025 petition package acts — verify on Arkleg before stage",
    riskIfOverused: "Do not say 'vote Libertarian' on stage — internal strategy only until late cycle.",
    educationNote: "Offensive lead — Kelly sets frame before Hammer lists restriction bills.",
  },
  {
    id: "check-my-record-counter",
    name: "Verified check-my-record counter",
    whenToUse: "Hammer invites record comparison or says 'look at my bills.'",
    setup: "Welcome the comparison — signal preparation with 'verified on Arkleg.'",
    execution:
      "I have checked your record, Senator — our team verified the bills on Arkleg. The question is who helps counties implement them.",
    expectedOpponentResponse: "Rapid act list; may accuse Kelly of opposition research.",
    secondRoundKelly: "Pattern: Little Rock adds rules; counties implement without new money.",
    thirdRoundKelly: "Kelly difference: SOS partnership, not another unfunded mandate.",
    backupEvidence: "Claims ledger + bill index sourceLinks",
    riskIfOverused: "Only with night-before act verification — NEEDS_REVIEW blocks stage use.",
    educationNote: "Expert move — requires staff verification pass T-24h.",
  },
  {
    id: "county-clerk-anchor",
    name: "County clerk anchor offensive",
    whenToUse: "Any county, rural, or administration question — also defensive reset.",
    setup: "Center clerks as heroes — Kelly sides with them against unfunded mandates.",
    execution:
      "County clerks told us what they need: clear rules, training, and funding clarity — not new duties without help.",
    expectedOpponentResponse: "Hammer claims county champion status; cites poll watcher bills.",
    secondRoundKelly: "Name three concrete funding lines for clerk training on his bills — or pivot to SOS plan.",
    thirdRoundKelly: "One clerk story (verified permission) + SOS hotline pledge.",
    backupEvidence: "County clerk week path + HB1457 act proof drill-down",
    riskIfOverused: "No clerk quotes without permission — no fabricated funding claims.",
    educationNote: "Works in every trap lane — universal offensive reset.",
  },
];

export const OFFENSIVE_APPROACH_NARRATIVE = {
  headline: "Offensive = set fair questions, force record detail, lead with SOS service — never personal attacks",
  philosophy: [
    "Kelly leads with unity and county service — Hammer must defend unfunded mandates.",
    "Every offensive move has a second and third round — never improvise new facts under pressure.",
    "Packo is respect lane, not attack lane — contrast Hammer record, not Libertarian platform.",
    "Claims gate is part of offense — verified beats loud every time.",
  ],
  minuteByMinute: [
    "0:00–0:30 — Thank voters; SOS service frame; no opponent names.",
    "0:30–1:30 — First trap setup if Hammer spoke on integrity.",
    "Mid-debate — One anchor bill with act proof drill-down rehearsed.",
    "Close — Civic index / cross-aisle line; no new claims.",
  ],
};
