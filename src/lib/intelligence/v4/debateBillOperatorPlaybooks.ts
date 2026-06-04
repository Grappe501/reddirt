import type { V3BillNarrative } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
import type { BillOperatorPlaybook, PlaybookStep, TrapSetup } from "@/lib/intelligence/v4/debateOperatorPlaybookTypes";

/** Curated anchor bills — full step-by-step playbooks (verify acts before public use). */
const CURATED: Record<string, Omit<BillOperatorPlaybook, "billNumber" | "isCurated">> = {
  SB250: {
    actNumber: "350",
    headline: "Paper ballot / counting changes (Act 350)",
    recordItemLabel: "SB250 → Act 350",
    steps: [
      { step: 1, dimension: "WHAT", detail: "2023 primary-sponsored bill changing paper ballot marking, counting, and results declaration procedures (verify enrolled Act 350 text)." },
      { step: 2, dimension: "WHEN", detail: "Bring up when Hammer says ‘integrity package’ or ‘secure paper ballots’ without naming county implementation cost." },
      { step: 3, dimension: "WHERE", detail: "Debate stage, county clerk forums, editorial boards covering election administration — not random culture-war threads." },
      { step: 4, dimension: "WHY", detail: "Voters feel election rules through county workers and polling places — unfunded process changes land on clerks, not the Capitol." },
      { step: 5, dimension: "HOW", detail: "Direct answer → ‘Act 350 from SB250’ → county training/time burden → Kelly SOS-as-service bridge (funding, guidance, lead time)." },
      { step: 6, dimension: "WHO", detail: "Center county election officials and voters following new procedures — not Hammer’s motives." },
    ],
    debateUse: {
      bringUpWhen: "He cites SB250/Act 350 as proof he ‘secured elections.’",
      openingLine: "I agree we need clear, trusted ballot procedures — the question is whether counties got the support to implement Act 350 without breaking their budgets.",
      actAnchor: "The record shows SB250 became Act 350 in the 2023 session.",
      countyOrVoterImpact: "Seventy-five counties do not implement changes at the same speed — clerks need training dollars and lead time.",
      kellyBridge: "As Secretary of State I would call balls and strikes: transparent rules, county partnership, and timelines voters can understand.",
      rebuttalIfHeCounters: "Acknowledge security goal; ask what state funding or SOS guidance accompanied the mandate.",
      doNotSay: ["Fraud without evidence", "He wants to suppress votes (without sourced act text)", "Stolen election framing"],
    },
    socialMediaUse: {
      platforms: ["Facebook (county audiences)", "X thread for press", "Instagram story card for clerks"],
      postFormat: "One act number + one county-impact sentence + CTA to Kelly SOS service frame.",
      threadOutline: [
        "Hook: ‘When the legislature changes how ballots are counted, who pays for training?’",
        "Fact: SB250 → Act 350 (link Arkleg).",
        "Impact: clerks + voters absorb new procedures.",
        "Contrast: integrity yes — implementation with county support.",
        "Close: SOS as service, not unfunded mandates.",
      ],
      graphicCaption: "Act 350 changed counting rules — counties need partners, not surprises. #ARpol",
      claimsGateReminder: "Run act-specific claims through claims ledger before paid boost.",
    },
    peopleImpactFrame:
      "This record item shifts operational burden to county election workers and voters learning new procedures — without stating unfunded mandates as fact until act text confirms funding clauses.",
    trapSetup: {
      name: "Integrity without counties",
      baitLineYouWantFromOpponent: "‘I passed Act 350 to secure Arkansas elections.’",
      moderatorOrKellySetupQuestion: "What funding and SOS guidance did counties receive to implement Act 350 on time?",
      kellyPivotWhenHeBites: "If he cannot name support, pivot: ‘Security and accessibility fail when clerks are left holding the bag.’",
      whyItWorks: "Forces implementation detail where his record is thin and your SOS service frame wins.",
    },
    kellyDifference:
      "Kelly offers statewide implementation partnership; Hammer’s record shows rule changes — verify whether matching county support followed.",
  },
  HB1457: {
    actNumber: null,
    headline: "County election administration / ballot access cluster",
    recordItemLabel: "HB1457",
    steps: [
      { step: 1, dimension: "WHAT", detail: "Election-law bill in county administration / ballot access theme — confirm enrollment and act number on Arkleg before citing penalties." },
      { step: 2, dimension: "WHEN", detail: "When moderator asks about county clerks, poll watchers, or ‘helping rural counties.’" },
      { step: 3, dimension: "WHERE", detail: "County Lincoln Day events, clerk association meetings, regional TV markets." },
      { step: 4, dimension: "WHY", detail: "Rural voters trust their county clerk more than any candidate — show you side with clerks on workable rules." },
      { step: 5, dimension: "HOW", detail: "Name bill → ask implementation question → county frame → participation + integrity together." },
      { step: 6, dimension: "WHO", detail: "Election workers and voters in line — not partisan labels." },
    ],
    debateUse: {
      bringUpWhen: "Hammer claims he is the ‘county senator’ on election law.",
      openingLine: "County clerks told us what they need: clear rules, training, and funding clarity — not new duties without help.",
      actAnchor: "HB1457 is part of his election-law pattern — verify act text before citing specifics.",
      countyOrVoterImpact: "Each new observer rule or access change is another training cycle for understaffed offices.",
      kellyBridge: "Secretary of State should be the clerk’s partner in Little Rock, not another unfunded mandate.",
      rebuttalIfHeCounters: "Welcome his clerk anecdotes; ask for statewide funding/support votes tied to the same bills.",
      doNotSay: ["Clerks are corrupt", "Poll watchers are always intimidation (without act proof)"],
    },
    socialMediaUse: {
      platforms: ["Facebook", "Nextdoor-style county groups"],
      postFormat: "Photo of clerk handshake + policy line + bill link.",
      threadOutline: [
        "Thank a county clerk (generic, no PII).",
        "HB1457 sits in a pattern of election-law changes — link index.",
        "Ask: implementation support?",
        "Kelly: SOS service for all 75 counties.",
      ],
      graphicCaption: "Our clerks run elections — they deserve a Secretary of State who funds clarity.",
      claimsGateReminder: "No clerk quotes without permission; no fabricated funding claims.",
    },
    peopleImpactFrame:
      "When rules change faster than training, everyday voters see longer lines, confused poll workers, and eroded trust — frame as burden on communities, not villainy.",
    trapSetup: {
      name: "County champion test",
      baitLineYouWantFromOpponent: "‘I always stand with county clerks.’",
      moderatorOrKellySetupQuestion: "Name three concrete ways HB1457 and related bills funded clerk training.",
      kellyPivotWhenHeBites: "Pivot to Kelly’s SOS implementation plan for all counties equally.",
      whyItWorks: "Moves abstract ‘county friend’ rhetoric to verifiable support.",
    },
    kellyDifference: "Kelly centers clerk partnership as SOS core job; opponent record emphasizes rule changes — verify support bills.",
  },
  SB291: {
    actNumber: null,
    headline: "Direct democracy / petition process restriction",
    recordItemLabel: "SB291",
    steps: [
      { step: 1, dimension: "WHAT", detail: "Bill in petition/ballot-access theme matrix — likely tightens initiative or signature rules (confirm act)." },
      { step: 2, dimension: "WHEN", detail: "When Hammer or moderator mentions ‘ballot integrity’ and ‘petitions’ in same breath." },
      { step: 3, dimension: "WHERE", detail: "Initiative supporter forums, young voter events, press questions on ballot measures." },
      { step: 4, dimension: "WHY", detail: "Arkansas has a direct democracy tradition — voters hear access restrictions as ‘politicians blocking the people.’" },
      { step: 5, dimension: "HOW", detail: "Agree on anti-fraud goals → contrast process burden → cite bill → bridge to lawful participation + integrity." },
      { step: 6, dimension: "WHO", detail: "Volunteer circulators, rural signers, not ‘activist elites.’" },
    ],
    debateUse: {
      bringUpWhen: "He groups petition reform with ‘securing elections.’",
      openingLine: "Integrity and participation are not enemies — voters should not have to choose between security and having a voice.",
      actAnchor: "SB291 is one of several petition-process bills in his record — name only after act verification.",
      countyOrVoterImpact: "Shorter circulation windows and tighter rules land on volunteers and county verification staff.",
      kellyBridge: "SOS should protect lawful signatures and transparent rules — not choke citizen initiatives without evidence of fraud.",
      rebuttalIfHeCounters: "Ask for documented fraud rates justifying each restriction — not anecdotes.",
      doNotSay: ["He hates democracy", "Republicans hate petitions (broad brush)"],
    },
    socialMediaUse: {
      platforms: ["X", "TikTok explainer", "Facebook"],
      postFormat: "Before/after: ‘How hard should it be for citizens to qualify a ballot measure?’",
      threadOutline: [
        "State the question in plain English.",
        "List bill number with Arkleg link.",
        "Theme: multiple petition bills = pattern.",
        "Kelly: integrity + access.",
      ],
      graphicCaption: "Your signature is your voice — rules should be clear, not impossible.",
      claimsGateReminder: "Pattern claims = INTERPRETATION until staff verifies count of restriction bills.",
    },
    peopleImpactFrame:
      "This record item makes it harder for ordinary Arkansans to bring issues to the ballot — frame as reducing citizen power, not elite conspiracy.",
    trapSetup: {
      name: "Integrity vs participation false choice",
      baitLineYouWantFromOpponent: "‘We had to tighten petitions to stop fraud.’",
      moderatorOrKellySetupQuestion: "What specific fraud cases in Arkansas justified SB291’s restrictions?",
      kellyPivotWhenHeBites: "If thin evidence: ‘Voters deserve both security and access — SOS can deliver both with transparent rules.’",
      whyItWorks: "Shifts from emotion to evidence where restriction pattern is vulnerable.",
    },
    kellyDifference: "Kelly defends lawful initiative process; record shows repeated access tightening — contrast methods with verified bills.",
  },
  SB584: {
    actNumber: null,
    headline: "Election enforcement / compliance expansion",
    recordItemLabel: "SB584",
    steps: [
      { step: 1, dimension: "WHAT", detail: "Enforcement-themed election bill — verify criminal/civil provisions in enrolled act." },
      { step: 2, dimension: "WHEN", detail: "When debate turns to ‘prosecuting fraud’ or ‘tough on cheaters.’" },
      { step: 3, dimension: "WHERE", detail: "Statewide TV debate, law-and-order leaning audiences." },
      { step: 4, dimension: "WHY", detail: "Over-broad enforcement chills participation — voters fear innocent mistakes become crimes." },
      { step: 5, dimension: "HOW", detail: "Agree on prosecuting real fraud → ask scope of bill → county implementation → transparent SOS guidance." },
      { step: 6, dimension: "WHO", detail: "Volunteers, elderly voters, first-time signers — not ‘criminals.’" },
    ],
    debateUse: {
      bringUpWhen: "He promises to ‘go after election fraud.’",
      openingLine: "Prosecute real fraud — but don’t criminalize confusion or intimidate lawful participation.",
      actAnchor: "SB584 fits his enforcement cluster — cite only with verified act language.",
      countyOrVoterImpact: "Clerks and prosecutors interpret new standards — uneven enforcement across counties.",
      kellyBridge: "SOS sets clear, public rules so enforcement targets real wrongdoing, not volunteers.",
      rebuttalIfHeCounters: "Ask for Arkansas conviction data vs new penalties added.",
      doNotSay: ["Elections are full of fraud (unsupported)", "He wants to jail voters"],
    },
    socialMediaUse: {
      platforms: ["Facebook", "X"],
      postFormat: "Quote enrolled penalty section (after verification) + ‘chilling effect’ line.",
      threadOutline: ["Real fraud should be prosecuted.", "Question: scope of SB584.", "County fairness.", "Kelly transparency frame."],
      graphicCaption: "Tough on real fraud — fair to lawful voters.",
      claimsGateReminder: "Penalty claims require act text HIGH confidence.",
    },
    peopleImpactFrame:
      "Heavy enforcement without clarity scares everyday participants away from petitions and the ballot — that hurts the people’s ability to hold power accountable.",
    trapSetup: {
      name: "Fraud prosecutor trap",
      baitLineYouWantFromOpponent: "‘We need harsh penalties or elections aren’t safe.’",
      moderatorOrKellySetupQuestion: "How many Arkansas election-fraud convictions occurred the year before SB584?",
      kellyPivotWhenHeBites: "Pivot to proportional enforcement + SOS education role.",
      whyItWorks: "Forces data; avoids Kelly sounding soft on crime while exposing overreach.",
    },
    kellyDifference: "Kelly: transparent rules + targeted enforcement; opponent: expansion of enforcement toolkit — verify proportionality.",
  },
  HB1707: {
    actNumber: null,
    headline: "Ballot access / SOS duties / write-in access",
    recordItemLabel: "HB1707",
    steps: [
      { step: 1, dimension: "WHAT", detail: "Multi-topic access bill (write-ins, SOS duties) — read enrolled act sections before debate citations." },
      { step: 2, dimension: "WHEN", detail: "When opponent says he ‘opened’ or ‘closed’ ballot access." },
      { step: 3, dimension: "WHERE", detail: "Minor-party forums, reform-minded press, college campuses." },
      { step: 4, dimension: "WHY", detail: "Access bills signal whether politicians trust voters with choices." },
      { step: 5, dimension: "HOW", detail: "Quote specific section → voter choice impact → Kelly participation pillar." },
      { step: 6, dimension: "WHO", detail: "Grassroots candidates and write-in voters in low-turnout races." },
    ],
    debateUse: {
      bringUpWhen: "He claims to protect ‘ballot integrity’ while record tightens access.",
      openingLine: "Ballot integrity includes lawful choices — not only fewer choices.",
      actAnchor: "HB1707 — verify whether it narrows write-ins or SOS transparency duties.",
      countyOrVoterImpact: "Clerks reprogram ballots and retrain on filing rules.",
      kellyBridge: "Participation and integrity together — SOS publishes rules voters can read.",
      rebuttalIfHeCounters: "Contrast any access restriction with his public ‘integrity’ branding.",
      doNotSay: ["He banned democracy"],
    },
    socialMediaUse: {
      platforms: ["Instagram", "X"],
      postFormat: "Side-by-side: choices on ballot vs bills that remove options.",
      threadOutline: ["Access is integrity.", "HB1707 link.", "Ask voters: fewer choices = more trust?", "Kelly SOS transparency."],
      graphicCaption: "Integrity means ballots you can trust — and choices you can make.",
      claimsGateReminder: "Write-in elimination claims need act text proof.",
    },
    peopleImpactFrame:
      "Removing lawful candidacy paths tells voters their choices don’t matter — that’s anti-participation, not pro-people.",
    trapSetup: {
      name: "Choice reduction",
      baitLineYouWantFromOpponent: "‘We cleaned up the ballot.’",
      moderatorOrKellySetupQuestion: "Which voters gained power when write-in or access paths changed under HB1707?",
      kellyPivotWhenHeBites: "Kelly: orderly ballots plus lawful paths for citizens.",
      whyItWorks: "Reframes ‘cleanup’ as voter disempowerment with a question he struggles to answer.",
    },
    kellyDifference: "Kelly expands transparent access; verify whether HB1707 narrows it — contrast on voter empowerment.",
  },
};

function defaultTrap(narrative: V3BillNarrative): TrapSetup | null {
  if (narrative.publicationRisk === "HIGH") return null;
  return {
    name: "Act anchor challenge",
    baitLineYouWantFromOpponent: `I'm proud of ${narrative.billNumber}.`,
    moderatorOrKellySetupQuestion: `What did ${narrative.billNumber} change for county clerks in the first election after passage?`,
    kellyPivotWhenHeBites: "If vague: pivot to SOS implementation support and verified act text.",
    whyItWorks: "Moves from slogan to operational accountability.",
  };
}

export function synthesizeBillPlaybook(
  narrative: V3BillNarrative,
  opts?: { inIntegrity2021?: boolean; themeLabels?: string[] },
): BillOperatorPlaybook {
  const act = narrative.actNumber ? `Act ${narrative.actNumber}` : "act number needs verification";
  const themes = opts?.themeLabels?.length ? opts.themeLabels.join(", ") : "election-law theme (see matrix)";

  const steps: PlaybookStep[] = [
    { step: 1, dimension: "WHAT", detail: `${narrative.billNumber}: ${narrative.plainEnglishSummary}` },
    { step: 2, dimension: "WHEN", detail: narrative.strategicBriefing.whenToUse },
    { step: 3, dimension: "WHERE", detail: "Debate stage when bill named; county events if county frame applies; social only after claims gate." },
    { step: 4, dimension: "WHY", detail: narrative.countyImpactNarrative || narrative.billNarrative },
    {
      step: 5,
      dimension: "HOW",
      detail: `${narrative.strategicBriefing.howToMessage} Themes: ${themes}.${opts?.inIntegrity2021 ? " Part of 2021 integrity package — use continuity argument." : ""}`,
    },
    { step: 6, dimension: "WHO", detail: "Voters and county election workers affected by rule changes — not opponent motives." },
  ];

  return {
    billNumber: narrative.billNumber,
    actNumber: narrative.actNumber,
    headline: narrative.title.slice(0, 120),
    recordItemLabel: `${narrative.billNumber} → ${act}`,
    steps,
    debateUse: {
      bringUpWhen: narrative.strategicBriefing.whenToUse,
      openingLine: narrative.debateFrames.kellyFrame,
      actAnchor: narrative.actNumber
        ? `The record shows ${narrative.billNumber} enacted as Act ${narrative.actNumber}.`
        : `Verify enrollment for ${narrative.billNumber} before citing act numbers on stage.`,
      countyOrVoterImpact: narrative.debateFrames.countyFrame,
      kellyBridge: narrative.strategicBriefing.howToMessage,
      rebuttalIfHeCounters: `Acknowledge: ${narrative.debateFrames.hammerFrame}. Contrast implementation and county support.`,
      doNotSay: [
        narrative.strategicBriefing.whenNotToUse,
        "Fraud or stolen-election claims without sourced proof",
        "Personal motive attacks",
      ],
    },
    socialMediaUse: {
      platforms: ["Facebook", "X"],
      postFormat: "Bill number + one impact sentence + Arkleg link + Kelly pillar hashtag.",
      threadOutline: [
        `What changed: ${narrative.plainEnglishSummary.slice(0, 140)}`,
        `Hammer frame (expect): ${narrative.debateFrames.hammerFrame.slice(0, 100)}`,
        `Kelly frame: ${narrative.debateFrames.kellyFrame.slice(0, 100)}`,
        "Claims gate before paid promotion.",
      ],
      graphicCaption: `${narrative.billNumber}: who bears the burden? Verify act before boosting.`,
      claimsGateReminder: `Publication risk ${narrative.publicationRisk} — staff review required.`,
    },
    peopleImpactFrame: `This record item ${narrative.counterArguments[0] ?? "may shift burden to counties or voters"} — frame as impact on Arkansans' ability to participate and on clerks who serve them, not as character attack.`,
    trapSetup: defaultTrap(narrative),
    kellyDifference: narrative.strategicBriefing.debateImpact,
    isCurated: false,
  };
}

export function getBillOperatorPlaybook(
  billNumber: string,
  narrative: V3BillNarrative,
  opts?: { inIntegrity2021?: boolean; themeLabels?: string[] },
): BillOperatorPlaybook {
  const upper = billNumber.toUpperCase();
  const curated = CURATED[upper];
  if (curated) {
    return { billNumber: upper, ...curated, isCurated: true };
  }
  return synthesizeBillPlaybook(narrative, opts);
}

export function listCuratedBillPlaybookNumbers(): string[] {
  return Object.keys(CURATED);
}
