/**
 * Election Plan — opponent biography pages (Kelly must engrave before stage).
 * Composes dossier narrative, depth sections, and forum rhetoric profiles.
 */
import {
  EP_DEBATE_QUESTIONS_HREF,
  EP_FORUM_LAB_DEEP_ANALYSIS_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  EP_TRAP_LANES_HREF,
  epDebatePrepDayHref,
  epForumLabDeepAnalysisLessonHref,
  epForumLabCapitalizeMoveHref,
  epOpponentBioHref,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";
import type { DrillDownLink } from "@/lib/election-plan/debatePrepDayDrillDown";
import {
  buildHammerBioNarrativeChapter,
  buildPakkoBioNarrativeChapter,
  buildOpponentSectionReadAloud,
} from "@/lib/intelligence/v4/candidateDossierBriefingBook";
import { getDeepProfessorLesson } from "@/lib/election-plan/forumLabDeepAnalysisDrillDown";
import {
  getOpponentDossierSectionsForCandidate,
  type OpponentDossierDepthSection,
} from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import { loadKimHammerCandidateDossier, loadMichaelPackoCandidateDossier } from "@/lib/intelligence/v4/loadOpponentCandidateDossier";

export type OpponentBioId = "kim-hammer" | "michael-packo";

export type OpponentBioReadingPhase = {
  dayNumber: 2 | 4 | 6;
  dayId: string;
  title: string;
  minutesLabel: string;
  focus: string;
  steps: string[];
  successCheck: string;
};

export type OpponentBioDossierSectionView = {
  sectionId: string;
  title: string;
  eyebrow: string;
  whyItMatters: string;
  narrative: string[];
  debateUse: string[];
  clerkUse: string[];
  doNotSay: string[];
  readAloudDebate?: string;
  readAloudClerk?: string;
};

export type OpponentBioPage = {
  opponentId: OpponentBioId;
  displayName: string;
  partyLabel: string;
  subtitle: string;
  professorLead: string;
  priorities: Array<{ heading: string; body: string }>;
  psychology: Array<{ heading: string; body: string }>;
  biographyParagraphs: string[];
  commandMode: Array<{ heading: string; body: string }>;
  debateTells: string[];
  forecast: Array<{ heading: string; body: string }>;
  memoryLines: Array<{ label: string; text: string; note?: string }>;
  dossierSections: OpponentBioDossierSectionView[];
  readingPhases: OpponentBioReadingPhase[];
  doNotSay: string[];
  claimsGate: string[];
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export const OPPONENT_BIO_HUB = {
  title: "Opponent biographies — engrave before stage",
  description:
    "Everything Kelly should understand about Kim Hammer and Dr. Michael Pakko before sharing a stage: priorities, psychology, tells, and how to stay in Command Mode. Read both bios at the end of Day 2, re-read after Day 4 forum intelligence, and lock in again on Day 6 before simulation.",
  readingCadence: [
    {
      day: 2 as const,
      dayId: "day-2-read-the-table",
      label: "First read — end of Day 2",
      body: "After forum tell briefs and trap lanes: read full Hammer bio (30 min), then full Pakko bio (30 min). Goal is recognition — nothing on stage should surprise you.",
    },
    {
      day: 4 as const,
      dayId: "day-4-forum-intelligence",
      label: "Re-read — after Day 4 forum lab",
      body: "After transcript analysis: re-read both bios with forum notes in hand. Update mental model — what did they actually say vs what we forecast?",
    },
    {
      day: 6 as const,
      dayId: "day-6-full-simulation",
      label: "Lock-in — before Day 6 simulation",
      body: "Third read: memory lines + command mode sections only (30 min total). Then full simulation — bios are muscle memory, not homework.",
    },
  ],
};

const OPPONENT_ORDER: OpponentBioId[] = ["kim-hammer", "michael-packo"];

function mapDossierSection(section: OpponentDossierDepthSection): OpponentBioDossierSectionView {
  const readAloud = buildOpponentSectionReadAloud(section);
  return {
    sectionId: section.sectionId,
    title: section.title,
    eyebrow: section.eyebrow,
    whyItMatters: section.whyItMattersForKelly,
    narrative: section.narrativeOverview,
    debateUse: section.howToUseInDebate,
    clerkUse: section.howToUseInClerkRoom,
    doNotSay: section.doNotSay,
    readAloudDebate: readAloud.debate,
    readAloudClerk: readAloud.clerkRoom,
  };
}

function hammerReadingPhases(): OpponentBioReadingPhase[] {
  return [
    {
      dayNumber: 2,
      dayId: "day-2-read-the-table",
      title: "Day 2 — first read (after forum briefs)",
      minutesLabel: "30 min",
      focus: "Who Hammer is, what he wants, three tells — authorship, ranking, mandate.",
      steps: [
        "Read professor lead + biography — speak read-aloud debate line once.",
        "Study priorities and psychology — name three tells from forum transcript briefs.",
        "Skim all dossier sections — star ACCA panel tactics and 2021 six-bill deep.",
        "Memorize author vs administrator contrast — not motive attack.",
      ],
      successCheck: "Can name three Hammer tells and one agree-add pivot without notes.",
    },
    {
      dayNumber: 4,
      dayId: "day-4-forum-intelligence",
      title: "Day 4 — re-read (after forum lab)",
      minutesLabel: "20 min",
      focus: "Match forum transcript to forecast — update capitalize triggers.",
      steps: [
        "Open forum lab Hammer themes — compare to forecast section.",
        "Re-read debate tells + memory lines — adjust if transcript differs.",
        "Link top forum quotes to capitalize moves (work together, security).",
        "Claims-gate any new Hammer lines before using on stage.",
      ],
      successCheck: "Five forum Hammer lines paired with Kelly agree-add responses.",
    },
    {
      dayNumber: 6,
      dayId: "day-6-full-simulation",
      title: "Day 6 — lock-in (before simulation)",
      minutesLabel: "15 min",
      focus: "Memory lines + command mode only — then sim.",
      steps: [
        "Read memory lines aloud twice — clerk room + debate versions.",
        "Review command mode: stay warm, add SOS layer, never end on agree.",
        "Staff calls three bait lines — 45s response each.",
      ],
      successCheck: "Simulation-ready — Hammer bait feels boring, not threatening.",
    },
  ];
}

function pakkoReadingPhases(): OpponentBioReadingPhase[] {
  return [
    {
      dayNumber: 2,
      dayId: "day-2-read-the-table",
      title: "Day 2 — first read (after Pakko contrast block)",
      minutesLabel: "30 min",
      focus: "Third-candidate geometry — respect, not attack; reform analyst vs administrator.",
      steps: [
        "Read biography + three-way geometry dossier section.",
        "Memorize respect line — speak aloud without sounding patronizing.",
        "Study psychology: viewers punish pile-ons on third candidates.",
        "Read kellyDo / kellyDoNot contrast lists — contrast gate applies.",
      ],
      successCheck: "One Pakko acknowledge + pivot delivered naturally in 30s.",
    },
    {
      dayNumber: 4,
      dayId: "day-4-forum-intelligence",
      title: "Day 4 — re-read (after forum lab)",
      minutesLabel: "20 min",
      focus: "Duopoly lines vs forum reality — where Pakko helped Kelly's clerk frame.",
      steps: [
        "Compare Pakko forum themes to forecast — note competition / transparency lines.",
        "Re-read three-way geometry — when Hammer and Pakko both attack mandates.",
        "Do not coordinate vote strategy aloud — internal math only.",
      ],
      successCheck: "Can explain when to agree with Pakko without becoming LP surrogate.",
    },
    {
      dayNumber: 6,
      dayId: "day-6-full-simulation",
      title: "Day 6 — lock-in (before simulation)",
      minutesLabel: "15 min",
      focus: "Respect line + command posture when Pakko speaks third.",
      steps: [
        "Memory lines aloud — debate close with all three names.",
        "Rehearse: curious face while Pakko speaks — no eye-roll.",
        "Staff simulates Pakko duopoly line → Kelly 30s response.",
      ],
      successCheck: "Simulation-ready — Pakko is interlocutor, not target.",
    },
  ];
}

function buildHammerBio(): OpponentBioPage {
  const narrative = buildHammerBioNarrativeChapter();
  const dossier = loadKimHammerCandidateDossier();
  const profile = getDeepProfessorLesson("profile-hammer");
  const sections = getOpponentDossierSectionsForCandidate("kim-hammer").map(mapDossierSection);

  const priorities = [
    {
      heading: "Election-law authorship as SOS credential",
      body: "Hammer's central priority is collapsing legislative credit into executive readiness — 'I wrote the bills that secured Arkansas elections.'",
    },
    {
      heading: "Integrity ranking & #1 state framing",
      body: "National scorecard language sounds factual and non-partisan — shifts debate away from county implementation.",
    },
    {
      heading: "Clerk solidarity rhetoric",
      body: "Claims partnership with clerks without publishing county-by-county funding ledgers or training calendars.",
    },
    {
      heading: "GOP base + pastoral identity",
      body: "Faith and service framing — Kelly never attacks personal faith; contrast stays on job fit.",
    },
  ];

  const psychology = profile?.psychology ?? [
    {
      heading: "Viewer read",
      body: "Confident elder statesman to R-leaning viewers; risk is 'career politician' if Kelly contrasts implementation.",
    },
    {
      heading: "Pressure tells",
      body: "Runs long when storytelling; bristles at time limits; doubles down on rankings when challenged.",
    },
  ];

  const forecast = profile?.sections ?? [
    {
      heading: "Debate night forecast",
      body: "Opens with service and security; cites bills when pressed; agrees on clerk partnership then claims authorship.",
    },
  ];

  const debateTells = [
    "Authorship pivot — 'I wrote the integrity laws' within first two answers",
    "Ranking cite — Heritage or '#1 state' when challenged on experience",
    "Mandate close — 'clerks adapted' without funding line items",
    "Storytelling pace — accelerates when comfortable; Kelly stays slower",
    "Combative spike — 'call a spade a spade' when feeling misquoted",
  ];

  const commandMode = [
    {
      heading: "Agree-add, never argue-add",
      body: "Honor security and clerk partnership once — then add SOS implementation Kelly owns: ledger, training, hotline.",
    },
    {
      heading: "Author vs administrator",
      body: "Writing law and running the office clerks depend on are different jobs. One sentence, no apology.",
    },
    {
      heading: "Command through stillness",
      body: "When Hammer tells stories, Kelly listens with quiet body — then answers at her pace, not his.",
    },
    {
      heading: "Claims discipline",
      body: "Never improvise bill numbers or ranking stats — NEEDS_RESEARCH stays off stage.",
    },
  ];

  const doNotSay = [
    ...(profile?.doNotSay ?? []),
    "He's just a legislator — dismissive",
    "Hammer doesn't care about clerks — unproven motive attack",
    "Stolen election / fraud without evidence",
  ];

  const claimsGate = [
    ...(profile?.claimsGate ?? []),
    "Bill sponsorship — verify in claims ledger before Kelly cites",
    "Heritage rankings — NEEDS_REVIEW before rebutting on stage",
  ];

  return {
    opponentId: "kim-hammer",
    displayName: narrative.displayName,
    partyLabel: dossier.party ?? "Republican",
    subtitle: "Primary opponent · senator · election-law authorship frame",
    professorLead:
      "Hammer is the familiarity candidate — sixteen years, pastor identity, clerk-room relationships from the Capitol. Kelly cannot beat him on 'I've known you for years.' She beats him on 'I will run the office you depend on Monday morning.' Engrave his priorities until bait lines feel predictable, not personal.",
    priorities,
    psychology,
    biographyParagraphs: narrative.paragraphs,
    commandMode,
    debateTells,
    forecast: forecast.map((s) => ({ heading: s.heading, body: s.body })),
    memoryLines: [
      { label: "Clerk room", text: narrative.readAloudClerkRoom },
      { label: "Debate", text: narrative.readAloudDebate },
      {
        label: "Ranking pivot",
        text: "Rankings measure rhetoric. I measure whether a county clerk got her grant question answered this week.",
      },
      {
        label: "Authorship pivot",
        text: "Clerks secured those elections — in every county. I want an office that answers their calls, not one that takes credit from the Capitol.",
      },
    ],
    dossierSections: sections,
    readingPhases: hammerReadingPhases(),
    doNotSay: [...new Set(doNotSay)],
    claimsGate: [...new Set(claimsGate)],
    practiceSteps: profile?.practiceSteps ?? [
      "Day 2 full read",
      "Day 4 forum crosswalk",
      "Day 6 memory lock-in before sim",
    ],
    relatedLinks: [
      { href: epOpponentBioHref("kim-hammer"), label: "This biography" },
      { href: epOppositionResearchModuleHref("dossier-hammer"), label: "Staff dossier depth" },
      { href: epForumLabDeepAnalysisLessonHref("profile-hammer"), label: "Forum rhetoric profile" },
      { href: epForumLabCapitalizeMoveHref("hammer-work-together"), label: "Capitalize · work together" },
      { href: epForumLabCapitalizeMoveHref("hammer-security"), label: "Capitalize · security" },
      { href: EP_TRAP_LANES_HREF, label: "Trap lanes" },
      { href: EP_DEBATE_QUESTIONS_HREF, label: "40 expected questions" },
    ],
  };
}

function buildPakkoBio(): OpponentBioPage {
  const narrative = buildPakkoBioNarrativeChapter();
  const dossier = loadMichaelPackoCandidateDossier();
  const profile = getDeepProfessorLesson("profile-pakko");
  const sections = getOpponentDossierSectionsForCandidate("michael-packo").map(mapDossierSection);

  const priorities = [
    {
      heading: "Anti-duopoly reform",
      body: "'Elections are too important to leave to Democrats and Republicans' — frames Kelly and Hammer as the same establishment.",
    },
    {
      heading: "Fiscal transparency & process reform",
      body: "Economist credential — machine testing, ballot access, SOS business services modernization.",
    },
    {
      heading: "Mandate skepticism",
      body: "May align with clerk burden complaints — Kelly agrees on burden, adds funded implementation.",
    },
    {
      heading: "Libertarian protest lane",
      body: "Attracts disaffected voters — Kelly respects participation without coordinating vote strategy on stage.",
    },
  ];

  const psychology = profile?.psychology ?? [
    {
      heading: "Viewer read",
      body: "Attracts disaffected and libertarian-leaning viewers — Kelly must not alienate them while keeping SOS neutrality.",
    },
    {
      heading: "Respect signal",
      body: "Small nod when Pakko speaks competition — viewers punish pile-ons on third candidates.",
    },
  ];

  const forecast = profile?.sections ?? [
    {
      heading: "Debate night forecast",
      body: "Challenges two-party structure; agrees on secure elections; offers process reforms; may use humor.",
    },
  ];

  const debateTells = [
    "Duopoly frame — 'both parties failed' early in answers",
    "Statistics-forward — cites legal cases and reform data",
    "Agreement trap — validates Kelly's clerk burden frame then asks for more reform",
    "Respect candidate — measured tone; Kelly mirrors warmth, not combat",
    "Close risk — may ask for Libertarian vote — Kelly stays administrator",
  ];

  const commandMode = [
    {
      heading: "Three-way geometry",
      body: "Never ask Pakko voters to vote Kelly on stage. Agree on voices + fair rules — differentiate administrator job.",
    },
    {
      heading: "Respect before contrast",
      body: "Dr. Pakko is right that more voices strengthen democracy — my job is fair ballots for every party.",
    },
    {
      heading: "Overlap lanes",
      body: "Transparency, tech modernization, clerk burden — agree and add implementation detail Hammer cannot supply.",
    },
    {
      heading: "No pile-on",
      body: "When Hammer and Pakko both attack mandates, do not attack Pakko to hurt Hammer in front of clerks.",
    },
  ];

  const doNotSay = [
    ...(profile?.doNotSay ?? []),
    "Third parties are spoilers",
    "Libertarian ideas are extreme",
    "Attack Libertarian voters or tell them not to vote Pakko on stage",
    "Coordinate 'vote L' or 'anything but Hammer' aloud",
  ];

  const claimsGate = [
    ...(profile?.claimsGate ?? []),
    "Ballot access statistics — verify before echo",
    "Pakko contrast gate — no attack lines until PACKO-02 quote ledger at PARTIAL minimum",
  ];

  return {
    opponentId: "michael-packo",
    displayName: narrative.displayName,
    partyLabel: dossier.party ?? "Libertarian",
    subtitle: "Third candidate · economist · reform & transparency frame",
    professorLead:
      "Pakko is the respect candidate in three-way geometry — not the attack target. Kelly validates participation, then claims neutral administration. Underestimating him loses Libertarian-leaning clerks and protest voters. Engrave his reform priorities until duopoly lines feel predictable — then pivot to SOS service desk.",
    priorities,
    psychology,
    biographyParagraphs: narrative.paragraphs,
    commandMode,
    debateTells,
    forecast: forecast.map((s) => ({ heading: s.heading, body: s.body })),
    memoryLines: [
      { label: "Clerk room", text: narrative.readAloudClerkRoom },
      { label: "Debate", text: narrative.readAloudDebate },
      {
        label: "Respect line",
        text: "Dr. Pakko is right that more voices strengthen democracy — my job is fair ballots for every party.",
      },
      {
        label: "Three-way close",
        text: "Dr. Pakko raises reform questions; Senator Hammer wrote election law; I am running to administer it fairly in all seventy-five counties every day.",
      },
    ],
    dossierSections: sections,
    readingPhases: pakkoReadingPhases(),
    doNotSay: [...new Set(doNotSay)],
    claimsGate: [...new Set(claimsGate)],
    practiceSteps: profile?.practiceSteps ?? [
      "Day 2 full read + respect line",
      "Day 4 forum crosswalk",
      "Day 6 lock-in before sim",
    ],
    relatedLinks: [
      { href: epOpponentBioHref("michael-packo"), label: "This biography" },
      { href: epOppositionResearchModuleHref("dossier-pakko"), label: "Staff dossier depth" },
      { href: epForumLabDeepAnalysisLessonHref("profile-pakko"), label: "Forum rhetoric profile" },
      { href: epForumLabCapitalizeMoveHref("pakko-competition"), label: "Capitalize · competition" },
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: EP_DEBATE_QUESTIONS_HREF, label: "40 expected questions" },
    ],
  };
}

const BIO_BY_ID: Record<OpponentBioId, () => OpponentBioPage> = {
  "kim-hammer": buildHammerBio,
  "michael-packo": buildPakkoBio,
};

export function listOpponentBioIds(): OpponentBioId[] {
  return [...OPPONENT_ORDER];
}

export function getOpponentBio(opponentId: string): OpponentBioPage | undefined {
  const builder = BIO_BY_ID[opponentId as OpponentBioId];
  return builder ? builder() : undefined;
}

export function listOpponentBios(): OpponentBioPage[] {
  return OPPONENT_ORDER.map((id) => BIO_BY_ID[id]());
}

export function getOpponentBioHubLinks(): DrillDownLink[] {
  return [
    { href: epDebatePrepDayHref("day-2-read-the-table"), label: "Day 2 · read the table" },
    { href: epDebatePrepDayHref("day-4-forum-intelligence"), label: "Day 4 · forum intelligence" },
    { href: epDebatePrepDayHref("day-6-full-simulation"), label: "Day 6 · full simulation" },
    { href: EP_FORUM_LAB_DEEP_ANALYSIS_HREF, label: "Forum deep analysis" },
    { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research (staff)" },
  ];
}
