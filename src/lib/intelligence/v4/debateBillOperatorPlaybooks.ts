import type { V3BillNarrative } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
import type { BillOperatorPlaybook, PlaybookStep, TrapSetup } from "@/lib/intelligence/v4/debateOperatorPlaybookTypes";
import {
  buildIndexCuratedPlaybooks,
  MANUAL_CURATED_BILL_NUMBERS,
} from "@/lib/intelligence/v4/debateBillPlaybookIndexCurator";

function mkIntegrity2021Curated(
  billNumber: string,
  actNumber: string,
  headline: string,
  what: string,
  countyImpact: string,
  bait: string,
  question: string,
  pivot: string,
): Omit<BillOperatorPlaybook, "billNumber" | "isCurated"> {
  return {
    actNumber,
    headline,
    recordItemLabel: `${billNumber} → Act ${actNumber}`,
    steps: [
      { step: 1, dimension: "WHAT", detail: what },
      { step: 2, dimension: "WHEN", detail: `When Hammer cites 2021 six-bill package or Act ${actNumber}.` },
      { step: 3, dimension: "WHERE", detail: "Debate, county forums, editorial boards — verify act text before cite." },
      { step: 4, dimension: "WHY", detail: countyImpact },
      { step: 5, dimension: "HOW", detail: `Act ${actNumber} anchor → county burden → SOS service bridge.` },
      { step: 6, dimension: "WHO", detail: "County clerks and voters — not opponent motives." },
    ],
    debateUse: {
      bringUpWhen: `Hammer bundles 2021 package without naming Act ${actNumber} implementation.`,
      openingLine: `Act ${actNumber} from ${billNumber} changed rules for counties — did clerks get training and funding?`,
      actAnchor: `${billNumber} became Act ${actNumber} in the 2021 session — verify on Arkleg.`,
      countyOrVoterImpact: countyImpact,
      kellyBridge: "SOS publishes rules and partners with clerks — security and accessibility together.",
      rebuttalIfHeCounters: "Welcome security goal; ask for funding line tied to this act.",
      doNotSay: ["Stolen election framing", "Fraud without sourced proof"],
    },
    socialMediaUse: {
      platforms: ["Facebook", "X"],
      postFormat: `${billNumber} / Act ${actNumber} + county impact + Arkleg link.`,
      threadOutline: ["2021 package continuity", `${billNumber} link`, "County burden", "Kelly SOS frame"],
      graphicCaption: `Act ${actNumber}: who implements?`,
      claimsGateReminder: "Verify enrolled act before boost.",
    },
    peopleImpactFrame: countyImpact,
    trapSetup: {
      name: "2021 package virtue",
      baitLineYouWantFromOpponent: bait,
      moderatorOrKellySetupQuestion: question,
      kellyPivotWhenHeBites: pivot,
      whyItWorks: "Forces cumulative record defense — Kelly wins on service frame.",
    },
    kellyDifference: `Kelly offers implementation partnership; Hammer authored Act ${actNumber}.`,
  };
}

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
    actNumber: "279",
    headline: "Election-law complaint deadlines / enforcement (Act 279)",
    recordItemLabel: "SB291 → Act 279",
    steps: [
      { step: 1, dimension: "WHAT", detail: "2025 bill amending election-law complaint procedures and deadlines (Act 279) — verify enrolled text." },
      { step: 2, dimension: "WHEN", detail: "When debate turns to ‘prosecuting fraud’ or complaint timelines." },
      { step: 3, dimension: "WHERE", detail: "Statewide TV debate, law-and-order leaning audiences, county clerk forums." },
      { step: 4, dimension: "WHY", detail: "Shorter complaint windows and expanded enforcement culture land on counties unevenly." },
      { step: 5, dimension: "HOW", detail: "Act 279 anchor → proportional enforcement question → SOS education + county partnership." },
      { step: 6, dimension: "WHO", detail: "Volunteers and clerks navigating complaint processes — not ‘criminals.’" },
    ],
    debateUse: {
      bringUpWhen: "He promises to ‘go after election fraud’ via complaint reforms.",
      openingLine: "Prosecute real fraud — but don’t shorten windows so much that lawful challenges can’t be heard.",
      actAnchor: "SB291 became Act 279 in the 2025 session — verify on Arkleg.",
      countyOrVoterImpact: "Clerks and SBEC absorb new complaint volume — uneven enforcement across counties.",
      kellyBridge: "SOS sets clear, public rules so enforcement targets real wrongdoing, not confusion.",
      rebuttalIfHeCounters: "Ask for Arkansas conviction data vs new complaint deadlines added.",
      doNotSay: ["Elections are full of fraud (unsupported)", "He wants to jail voters"],
    },
    socialMediaUse: {
      platforms: ["Facebook", "X"],
      postFormat: "Act 279 + complaint deadline line + Arkleg link.",
      threadOutline: ["Real fraud should be prosecuted.", "Question: scope of Act 279.", "County fairness.", "Kelly transparency frame."],
      graphicCaption: "Tough on real fraud — fair to lawful voters.",
      claimsGateReminder: "Deadline claims require act text HIGH confidence.",
    },
    peopleImpactFrame:
      "Complaint deadline changes affect whether ordinary participants can challenge real problems — frame as county burden, not motive.",
    trapSetup: {
      name: "Fraud prosecutor trap",
      baitLineYouWantFromOpponent: "‘We need harsh penalties or elections aren’t safe.’",
      moderatorOrKellySetupQuestion: "How many Arkansas election-fraud convictions occurred the year before Act 279?",
      kellyPivotWhenHeBites: "Pivot to proportional enforcement + SOS education role.",
      whyItWorks: "Forces data; avoids Kelly sounding soft on crime while exposing overreach.",
    },
    kellyDifference: "Kelly: transparent rules + targeted enforcement; opponent: Act 279 complaint changes — verify proportionality.",
  },
  SB584: {
    actNumber: "768",
    headline: "Local initiative / referendum petitions (Act 768)",
    recordItemLabel: "SB584 → Act 768",
    steps: [
      { step: 1, dimension: "WHAT", detail: "2025 bill amending local initiative and referendum petition procedures (Act 768) — verify enrolled text." },
      { step: 2, dimension: "WHEN", detail: "When Hammer groups petition reform with ‘securing elections.’" },
      { step: 3, dimension: "WHERE", detail: "Initiative supporter forums, county quorum courts, press on ballot measures." },
      { step: 4, dimension: "WHY", detail: "Local petition changes land on volunteer circulators and county verification staff." },
      { step: 5, dimension: "HOW", detail: "Agree on anti-fraud goals → contrast process burden → Act 768 → lawful participation + integrity." },
      { step: 6, dimension: "WHO", detail: "Volunteer circulators and rural signers — not ‘activist elites.’" },
    ],
    debateUse: {
      bringUpWhen: "He groups local petition reform with ‘securing elections.’",
      openingLine: "Integrity and participation are not enemies — local petitions should have clear rules, not impossible ones.",
      actAnchor: "SB584 became Act 768 in the 2025 session — verify on Arkleg.",
      countyOrVoterImpact: "Tighter local petition rules land on volunteers and county verification staff.",
      kellyBridge: "SOS should protect lawful signatures and transparent rules — not choke local initiatives without evidence.",
      rebuttalIfHeCounters: "Ask for documented fraud rates justifying Act 768 restrictions — not anecdotes.",
      doNotSay: ["He hates democracy", "Republicans hate petitions (broad brush)"],
    },
    socialMediaUse: {
      platforms: ["X", "Facebook"],
      postFormat: "Act 768 + local petition impact + Arkleg link.",
      threadOutline: ["Local petitions = local voice.", "Act 768 link.", "County verification burden.", "Kelly: integrity + access."],
      graphicCaption: "Your signature is your voice — rules should be clear, not impossible.",
      claimsGateReminder: "Pattern claims = INTERPRETATION until staff verifies act text.",
    },
    peopleImpactFrame:
      "Act 768 makes it harder for ordinary Arkansans to bring local issues to the ballot — frame as reducing citizen power, not elite conspiracy.",
    trapSetup: {
      name: "Integrity vs participation false choice",
      baitLineYouWantFromOpponent: "‘We had to tighten local petitions to stop fraud.’",
      moderatorOrKellySetupQuestion: "What specific fraud cases in Arkansas justified Act 768’s restrictions?",
      kellyPivotWhenHeBites: "If thin evidence: ‘Voters deserve both security and access — SOS can deliver both with transparent rules.’",
      whyItWorks: "Shifts from emotion to evidence where restriction pattern is vulnerable.",
    },
    kellyDifference: "Kelly defends lawful initiative process; Act 768 tightens local petitions — contrast methods with verified text.",
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
  SB486: {
    actNumber: "728",
    headline: "2021 integrity — electioneering penalties (Act 728)",
    recordItemLabel: "SB486 → Act 728",
    steps: [
      { step: 1, dimension: "WHAT", detail: "2021 primary-sponsored bill tightening electioneering rules and voting-related misdemeanor penalties (Act 728)." },
      { step: 2, dimension: "WHEN", detail: "When Hammer cites the 2021 ‘integrity foundation’ package without county training detail." },
      { step: 3, dimension: "WHERE", detail: "Polling-place enforcement debates, county clerk forums, editorial boards." },
      { step: 4, dimension: "WHY", detail: "Expanded enforcement surface lands on poll workers and voters — not abstract Capitol virtue." },
      { step: 5, dimension: "HOW", detail: "Act 728 anchor → proportional enforcement question → SOS education + county partnership." },
      { step: 6, dimension: "WHO", detail: "Poll workers and voters navigating new boundaries — center clerks." },
    ],
    debateUse: {
      bringUpWhen: "He bundles 2021 acts as proof he ‘secured elections.’",
      openingLine: "Act 728 changed electioneering rules — did counties get training before the next election?",
      actAnchor: "SB486 became Act 728 in the 2021 session — verify enrolled text on Arkleg.",
      countyOrVoterImpact: "Clerks and poll workers absorb new enforcement boundaries at the door.",
      kellyBridge: "Integrity and accessibility together — SOS publishes rules clerks can implement.",
      rebuttalIfHeCounters: "Welcome security goal; ask for statewide training funding tied to Act 728.",
      doNotSay: ["Poll workers are the problem", "He wants to intimidate voters (without act proof)"],
    },
    socialMediaUse: {
      platforms: ["Facebook", "X"],
      postFormat: "Act 728 + one county-impact line + Arkleg link.",
      threadOutline: ["2021 integrity package — what changed at the polling place?", "Act 728 link.", "Who trained poll workers?", "Kelly SOS service frame."],
      graphicCaption: "Act 728 changed electioneering rules — clerks need partners.",
      claimsGateReminder: "Penalty expansion claims need act text — claims gate before boost.",
    },
    peopleImpactFrame: "New misdemeanor penalties affect voters and poll workers at the polling place — frame as implementation burden, not motive.",
    trapSetup: {
      name: "2021 package virtue",
      baitLineYouWantFromOpponent: "‘I passed the 2021 integrity laws.’",
      moderatorOrKellySetupQuestion: "Which Act 728 training dollars did county clerks receive before the next election?",
      kellyPivotWhenHeBites: "Security fails when poll workers get new rules Friday afternoon with no SOS hotline.",
      whyItWorks: "Forces 2021 package from slogan to county implementation — Kelly wins on service.",
    },
    kellyDifference: "Kelly offers statewide implementation partnership; Hammer's 2021 record shows rule changes — verify matching county support.",
  },
  SB487: {
    actNumber: "729",
    headline: "Precinct boundaries / polling sites / vote centers (Act 729)",
    recordItemLabel: "SB487 → Act 729",
    steps: [
      { step: 1, dimension: "WHAT", detail: "2021 bill altering precinct boundaries, polling sites, and vote center establishment (Act 729)." },
      { step: 2, dimension: "WHEN", detail: "When Hammer claims he helped rural counties with polling access." },
      { step: 3, dimension: "WHERE", detail: "Rural county events, clerk association meetings, regional TV." },
      { step: 4, dimension: "WHY", detail: "Precinct changes are felt at the kitchen table — voters notice when polling places move." },
      { step: 5, dimension: "HOW", detail: "Act 729 → who decides site changes → county burden → SOS coordination frame." },
      { step: 6, dimension: "WHO", detail: "Rural voters driving farther to vote — center their experience." },
    ],
    debateUse: {
      bringUpWhen: "He cites vote centers or precinct consolidation as efficiency.",
      openingLine: "Act 729 changed how polling sites get moved — clerks need lead time and public notice voters can find.",
      actAnchor: "SB487 → Act 729 — verify quorum court and clerk procedures on Arkleg.",
      countyOrVoterImpact: "Each site change is a training cycle and voter confusion risk for understaffed offices.",
      kellyBridge: "SOS should coordinate statewide notice standards — clerks shouldn't guess alone.",
      rebuttalIfHeCounters: "Welcome efficiency; ask what state support accompanied Act 729 implementation.",
      doNotSay: ["He closed rural polling places (without county-specific proof)"],
    },
    socialMediaUse: {
      platforms: ["Facebook"],
      postFormat: "Act 729 + rural voter drive-time question + Kelly SOS frame.",
      threadOutline: ["When polling places move, who notices first?", "Act 729.", "Clerk burden.", "Kelly partnership."],
      graphicCaption: "Act 729 changed polling site rules — clerks need lead time.",
      claimsGateReminder: "Site-closure claims need county-specific verification.",
    },
    peopleImpactFrame: "Precinct and vote-center changes affect whether Arkansans can vote without driving an extra hour — clerks implement, voters feel it.",
    trapSetup: {
      name: "Rural access virtue",
      baitLineYouWantFromOpponent: "‘We made voting more efficient with vote centers.’",
      moderatorOrKellySetupQuestion: "Under Act 729, who pays when a rural precinct loses its polling site?",
      kellyPivotWhenHeBites: "Efficiency without notice is disenfranchisement — SOS publishes standards clerks can meet.",
      whyItWorks: "Moves from buzzword to county cost — Kelly's SOS service frame wins.",
    },
    kellyDifference: "Kelly coordinates statewide voter notice; Hammer authored Act 729 — contrast implementation support.",
  },
  SB488: mkIntegrity2021Curated(
    "SB488",
    "727",
    "Voted ballot records / FOIA (Act 727)",
    "2021 bill creating FOIA exemption for voted ballots and amending ballot public-records access (Act 727).",
    "Clerks navigate narrowed public inspection rules — transparency rhetoric splits from voter access.",
    "‘We protected ballot integrity by limiting fishing expeditions.’",
    "Under Act 727, what can a county voter still inspect without a formal complaint?",
    "Transparency means rules voters can read — not opacity for clerks fielding confusion.",
  ),
  SB582: mkIntegrity2021Curated(
    "SB582",
    "1051",
    "County election board governance (Act 1051)",
    "2021 bill modifying county election board governance and related procedures (Act 1051).",
    "Election board procedure changes — another training cycle for county officials.",
    "‘We fixed how election boards work.’",
    "Which county election commissioners got state training dollars when Act 1051 took effect?",
    "Governance changes land on volunteers and clerks — SOS should publish one statewide playbook.",
  ),
  SB643: mkIntegrity2021Curated(
    "SB643",
    "973",
    "Absentee ballot handling (Act 973)",
    "2021 bill tightening absentee ballot handling procedures (Act 973).",
    "Absentee workflow changes — clerks reprogram processes before the next election.",
    "‘We secured absentee ballots.’",
    "What did Act 973 change for your county clerk's absentee team in the first cycle?",
    "Security and access together — clerks need lead time, not Friday-afternoon surprises.",
  ),
  SB644: mkIntegrity2021Curated(
    "SB644",
    "974",
    "Election-law complaint hotline (Act 974)",
    "2021 bill establishing election-law complaint hotline and related compliance duties (Act 974).",
    "New hotline-driven complaints — counties absorb compliance volume.",
    "‘We gave voters a hotline for election problems.’",
    "Who staffs the hotline follow-through for county clerks under Act 974?",
    "Hotlines without county support become unfunded mandates — SOS coordinates response.",
  ),
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

const INDEX_CURATED = buildIndexCuratedPlaybooks();

export function getBillOperatorPlaybook(
  billNumber: string,
  narrative: V3BillNarrative,
  opts?: { inIntegrity2021?: boolean; themeLabels?: string[] },
): BillOperatorPlaybook {
  const upper = billNumber.toUpperCase();
  const curated = CURATED[upper] ?? INDEX_CURATED[upper];
  if (curated) {
    return { billNumber: upper, ...curated, isCurated: true };
  }
  return synthesizeBillPlaybook(narrative, opts);
}

export function listCuratedBillPlaybookNumbers(): string[] {
  const keys = new Set([...Object.keys(CURATED), ...Object.keys(INDEX_CURATED)]);
  return [...keys].sort();
}

export function listManualCuratedBillPlaybookNumbers(): string[] {
  return [...MANUAL_CURATED_BILL_NUMBERS].sort();
}

export function listIndexCuratedBillPlaybookNumbers(): string[] {
  return Object.keys(INDEX_CURATED).sort();
}
