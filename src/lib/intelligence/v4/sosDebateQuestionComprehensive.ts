/**
 * Comprehensive expected-question expansion — full Kelly scripts, opponent narratives, exchange handling.
 * Merged onto each SosDebateQuestionDrillDown at load time (overrides for high-priority topics).
 */
import type {
  OpponentExchange,
  SosDebateQuestionDrillDown,
  SosQuestionComprehensiveExpansion,
} from "@/lib/intelligence/v4/sosDebateQuestionTypes";

function joinScript(parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

function buildFullScript(
  drill: SosDebateQuestionDrillDown,
  position: 1 | 2 | 3,
): string {
  const s = drill.speakOrderDrills.find((d) => d.position === position);
  if (!s) return drill.directAnswer60s;

  const core =
    position === 1
      ? joinScript([s.openingLine, s.freshAddition, drill.directAnswer60s, s.closingBeat])
      : position === 2
        ? joinScript([
            s.openingLine,
            s.freshAddition,
            "Where that leaves Arkansas counties is simple: the Secretary of State must publish rules clerks can execute, fund training when Little Rock passes new mandates, and answer the phone when a Friday afternoon rule change lands on a clerk's desk.",
            s.closingBeat,
          ])
        : joinScript([
            s.openingLine,
            s.freshAddition,
            drill.directAnswer30s,
            "That is the difference between writing election law in the Capitol and administering it in seventy-five counties — and that is why I am running.",
            s.closingBeat,
          ]);

  return core;
}

function hammerParagraph(drill: SosDebateQuestionDrillDown): string {
  const lines = drill.whatHammerLikelySays.filter(Boolean);
  if (!lines.length) {
    return "Kim Hammer will likely lean on his Senate tenure, election-integrity branding, and authorship of recent election bills. Expect act numbers, 'secure elections' language, and a claim that Arkansas runs among the best systems in the country. He may say he stands with county clerks without offering a county-by-county funding ledger or training plan.";
  }
  return `Kim Hammer will likely frame this through his legislative record: ${lines.join(" He may also say: ")}. His tone is confident and partisan-adjacent — he sells authorship and rankings more than day-to-day SOS operations.`;
}

function packoParagraph(drill: SosDebateQuestionDrillDown): string {
  const lines = drill.whatPackoMayAdd.filter(Boolean);
  if (!lines.length) {
    return "Dr. Michael Pakko may stay quiet on operational detail or add a reform-from-outside-the-duopoly line — skepticism of mandates, less government friction, or election competitiveness themes. He is measured on camera; do not attack him — differentiate administrator readiness.";
  }
  return `Dr. Michael Pakko may add: ${lines.join(" He may also say: ")}. His economist-commentator voice sounds reasonable — agree where true, then pivot to who administers Monday morning in county clerk offices.`;
}

function buildHammerExchanges(drill: SosDebateQuestionDrillDown): OpponentExchange[] {
  const out: OpponentExchange[] = [];
  for (const line of drill.whatHammerLikelySays.slice(0, 3)) {
    const rebut = drill.rebuttalIfHammerAttacks[0];
    out.push({
      opponentLine: line,
      kellyResponse: rebut
        ? `${rebut.agree} ${rebut.contrast} ${rebut.bridge}`
        : `${drill.directAnswer30s} I respect the goal of secure elections — my focus is implementation for clerks.`,
      toneNote: "Calm — never match combativeness",
    });
  }
  for (const r of drill.rebuttalIfHammerAttacks) {
    out.push({
      opponentLine: r.hammerLikelyLine,
      kellyResponse: `${r.agree} ${r.contrast} ${r.bridge}`,
      toneNote: `When he: ${r.trigger}`,
    });
  }
  return out;
}

function buildPackoExchanges(drill: SosDebateQuestionDrillDown): OpponentExchange[] {
  const out: OpponentExchange[] = [];
  for (const line of drill.whatPackoMayAdd.slice(0, 2)) {
    out.push({
      opponentLine: line,
      kellyResponse:
        "Dr. Pakko and I both want voters to trust the process — I am running to administer it in all seventy-five counties every day, not only analyze it from a panel. Reform ideas matter; clerks need a hotline, training calendar, and published rules.",
      toneNote: "Respectful — never attack Libertarian voters",
    });
  }
  return out;
}

/** Hand-crafted 3X depth for highest-impact ACCA / debate topics */
const COMPREHENSIVE_OVERRIDES: Partial<Record<string, Partial<SosQuestionComprehensiveExpansion>>> = {
  "county-clerks-unfunded-mandates": {
    questionAsAsked:
      "County clerks say they are overwhelmed — what will you actually do for them as Secretary of State?",
    scenarioContext: [
      "This is the ACCA panel's home question. Margaret Darter and clerks from all seventy-five counties listen for whether you understand their desk — not whether you can recite integrity slogans.",
      "Hammer will say he stands with clerks because he wrote the laws. Kelly's answer must name SOS deliverables: hotline, training calendar, funding advocacy, and a published County Voting System Grant Fund ledger.",
      "Pakko may agree mandates burden clerks — Kelly adds the funded implementation plan without piling on Hammer in front of this audience.",
    ],
    hammerExpectedNarrative:
      "Hammer will claim partnership with the County Clerks Association, cite Act 808 ($8.24M) and recent $11M appropriations, and say Arkansas elections are secure because of the bills he sponsored. He will not voluntarily produce a county-by-county grant spreadsheet.",
    packoExpectedNarrative:
      "Pakko may say state mandates pile paperwork on counties without paying for it — anti-duopoly, less friction. He will not offer a clerk hotline or training calendar.",
    speakFirstFullScript:
      "County clerks implement everything the legislature writes — and when Little Rock passes another election bill on a Friday afternoon, they need a Secretary of State who answers the phone. I am Kelly Grappe, and I am running to run that office as a service desk for all seventy-five counties: a clerk hotline starting day one, a published training calendar tied to each new act, and a fight in the Capitol for funding when mandates arrive without dollars. Arkansas already has a County Voting System Grant Fund — UCC fees and legislative appropriations flow through SOS grant guidelines — but there is no public county-by-county ledger clerks can budget from. I will publish that ledger. Election transparency should include election funding transparency. Clerks are the backbone of our democracy — I will show up for them, not perform for cable news.",
    speakSecondFullScript:
      "I agree county election officials are the backbone of our democracy — and I heard my opponents say they support clerks too. Where we differ is what happens Monday morning when a new act lands without a training module or a budget line. Senator Hammer cites appropriations totals in Little Rock — I am asking for the county-by-county spreadsheet clerks actually use when they budget equipment and staff time. Dr. Pakko and I both see process problems — I am the candidate asking to administer the fix clerks can use. I will publish CVSGF grant accounting county by county, run a clerk hotline, and fund training — that is the SOS job.",
    speakThirdFullScript:
      "I have listened to both of my opponents on clerks, and I agree integrity matters. What neither of you answered is what happens in a county clerk's office when Act 444 or the next session's bill hits with no training budget. Totals in Little Rock are not the same as implementation in Saline, Phillips, or Sebastian counties. I am running to administer elections — hotline, training calendar, published grant ledger — fairly in every county. Voters deserve a Secretary of State who shows up for clerks, not just authors bills.",
    hammerExchanges: [
      {
        opponentLine: "I stand with county clerks — I secured funding for voting equipment.",
        kellyResponse:
          "Senator, we both want secure elections — can you point to the county-by-county CVSGF grant ledger showing which counties received dollars after each mandate you sponsored? Appropriations in Little Rock are not the same as implementation in every county.",
        toneNote: "Curious policy learner — not prosecutor",
      },
      {
        opponentLine: "I wrote the integrity laws that protect Arkansas.",
        kellyResponse:
          "Security yes — and in 2021 your offices got six process changes in one session. Writing law is not administering seventy-five counties. SOS must publish rules and fund training when the legislature passes mandates.",
        toneNote: "2021 package continuity",
      },
    ],
    packoExchanges: [
      {
        opponentLine: "Mandates burden counties — government should get out of the way.",
        kellyResponse:
          "Dr. Pakko, I agree unfunded mandates hurt clerks — that is why I will publish grant ledgers, fund training, and run a hotline. Integrity and lawful participation together — with a SOS who administers, not only analyzes.",
        toneNote: "Agree and extend — do not attack L voters",
      },
    ],
  },
  "opening-why-running": {
    questionAsAsked: "Why are you running for Secretary of State — in your own words?",
    scenarioContext: [
      "First impression question — often question one on ACCA panel or debate open. No attacks in the first fifteen seconds.",
      "Hammer leads with integrity and experience. Pakko leads with reform and anti-duopoly. Kelly leads with service, transparency, and clerks.",
    ],
    speakFirstFullScript:
      "I am Kelly Grappe. After talking with county clerks and election commissioners across Arkansas, I am running for Secretary of State because this office is where trust is built or broken — one training calendar, one hotline, one set of rules voters can read. I am not a career politician asking for another platform. I am asking to administer elections fairly in all seventy-five counties, for voters of every party. This office should be non-partisan in administration, transparent to the public, and accountable when Arkansas finishes last on civic health. I will educate citizens about how elections work, support clerks when Little Rock changes the rules, and bring people together instead of widening division. Thank you.",
    speakSecondFullScript:
      "I am running because Arkansas needs a Secretary of State who works across the aisle to bring people together — not more division. My opponents talk about integrity and reform — I talk about what happens the Monday after this panel in a county clerk's office. I will keep this office non-partisan, publish rules voters can verify, and answer clerks' calls. That is the service desk Arkansas deserves.",
    speakThirdFullScript:
      "You have heard my opponents — Senator Hammer on the laws he wrote, Dr. Pakko on reform from outside the two parties. I am running to administer — fairly, in every county, every day. Compare who will publish guidance clerks can use Monday morning. I am Kelly Grappe, and I would be honored to earn your vote. Thank you.",
  },
  "three-way-why-kelly": {
    questionAsAsked: "Why should voters choose you over Senator Hammer and Dr. Pakko?",
    scenarioContext: [
      "Plurality geometry — respect Pakko, contrast Hammer on implementation, never tell anyone how to vote.",
      "Moderator may force direct comparison — stay job-description contrast, not personal attack.",
    ],
    speakFirstFullScript:
      "Voters deserve choices — and they deserve a Secretary of State who administers, not performs. Senator Hammer has written a great deal of election law. Dr. Pakko brings reform ideas from outside the two parties. I bring a commitment to run the office as a service desk for county clerks: hotline, training calendar, published grant ledger, rules voters can read. Ask who will answer the phone when a new act hits a county on a Friday afternoon — that is my job.",
    speakSecondFullScript:
      "Dr. Pakko and I both want voters to trust the process — the difference is I am running to administer it in all seventy-five counties every day. Senator Hammer cites integrity packages — I ask which county-by-county funding spreadsheet clerks use when budgeting. I will publish that ledger, fund training, and keep administration non-partisan.",
    speakThirdFullScript:
      "I have listened to both opponents. Integrity matters — so does participation, transparency, and clerk support. Neither answered who pays when Little Rock passes unfunded mandates. I will — with a published SOS implementation plan. Compare records, compare readiness, compare who will show up for clerks. That is Kelly Grappe.",
  },
  "cvsgf-county-funding-ledger": {
    questionAsAsked:
      "How does election equipment money reach counties — and will you publish county-by-county grant accounting?",
    scenarioContext: [
      "ES&S is platinum sponsor at ACCA — funding and vendor questions may intersect. Stay professional.",
      "Hammer cites Act 808 and $11M appropriations. Kelly cites missing public ledger — fair transparency frame.",
    ],
    hammerExpectedNarrative:
      "Hammer will cite Act 808 ($8.24M), HB1041/Act 408 appropriations ($11M CVSGF + $4M HAVA), and say he funded counties. He will not produce a county-by-county award table.",
    speakFirstFullScript:
      "I've been researching how election funding flows to Arkansas counties, and it is surprisingly difficult for the public to find a clear county-by-county accounting — election transparency should include election funding transparency. Arkansas has a County Voting System Grant Fund fed by UCC fees and legislative appropriations — the Secretary of State sets grant guidelines under statute. I will publish a county-by-county ledger: amount, date, purpose, fund source — so clerks can budget and voters can verify. Senator Hammer cites totals in Little Rock — clerks need the spreadsheet.",
  },
};

export function generateComprehensiveExpansion(
  drill: SosDebateQuestionDrillDown,
): SosQuestionComprehensiveExpansion {
  const override = COMPREHENSIVE_OVERRIDES[drill.questionId];
  const base: SosQuestionComprehensiveExpansion = {
    questionAsAsked: drill.moderatorLikelyPhrasings[0] ?? drill.title,
    scenarioContext: [
      drill.whyModeratorsAsk,
      `In a three-way forum, expect Kim Hammer to emphasize ${drill.whatHammerLikelySays[0] ?? "election integrity and his legislative record"}.`,
      drill.whatPackoMayAdd.length
        ? `Dr. Pakko may add ${drill.whatPackoMayAdd[0]}. Kelly responds with administrator contrast — respectfully.`
        : "Dr. Pakko may stay brief or align on reform themes — do not attack third-party voters.",
    ],
    hammerExpectedNarrative: hammerParagraph(drill),
    packoExpectedNarrative: packoParagraph(drill),
    hammerExchanges: buildHammerExchanges(drill),
    packoExchanges: buildPackoExchanges(drill),
    speakFirstFullScript: buildFullScript(drill, 1),
    speakSecondFullScript: buildFullScript(drill, 2),
    speakThirdFullScript: buildFullScript(drill, 3),
    additionalPhrasings: drill.moderatorLikelyPhrasings.slice(1),
  };

  if (!override) return base;

  return {
    ...base,
    ...override,
    scenarioContext: override.scenarioContext ?? base.scenarioContext,
    hammerExchanges: override.hammerExchanges ?? base.hammerExchanges,
    packoExchanges: override.packoExchanges ?? base.packoExchanges,
    additionalPhrasings: override.additionalPhrasings ?? base.additionalPhrasings,
  };
}

export function attachComprehensiveExpansion(
  drill: SosDebateQuestionDrillDown,
): SosDebateQuestionDrillDown {
  return {
    ...drill,
    comprehensive: generateComprehensiveExpansion(drill),
  };
}
