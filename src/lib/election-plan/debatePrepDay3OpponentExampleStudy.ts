/**
 * Day 3 opponent examples — deep drill-down study guides.
 */
import {
  EP_OPPOSITION_RESEARCH_HREF,
  epDebatePrepBriefingHref,
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayRehearsalHref,
  epHammerBillHref,
  epOpponentBioHref,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY3_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { OpponentExampleStudyDeep } from "@/lib/election-plan/debatePrepDay1OpponentExampleStudy";

export const DAY3_OPPONENT_EXAMPLE_STUDY: Record<string, OpponentExampleStudyDeep> = {
  "ex3-hammer-admin": {
    exampleId: "ex3-hammer-admin",
    drillDownTitle: "Hammer bill list vs administrator — qualification stack pivot",
    opponent: "Hammer",
    theirMove: "Lists bill numbers as proof he can run SOS.",
    kellyResponse:
      "I've managed organizations, budgets, and people who depend on timely answers. Clerks need an administrator on night three of early voting — not a sponsor reading act numbers.",
    whyItWorks: "Stacks Kelly operational history vs Hammer legislative history.",
    sourceNote: "Author vs administrator briefing — verify any act numbers before broadcast.",
    overview:
      "Hammer collapses legislative authorship into SOS competence by listing act numbers. Kelly does not debate the bill list — she stacks three operational beats and names the administrator job clerks need on night three of early voting.",
    professorLead:
      "This is Hammer's qualification bait — bill numbers as proof of SOS readiness. Your hands stay still, voice slows, three beats maximum — then stop and smile.",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Decode the bill-list move",
        steps: [
          "Read Hammer line twice — hear authorship + volume bundled as competence proof.",
          "Write: what job is he claiming with bill numbers?",
          "Write: what job are you asking voters to hire you for?",
          "Note: bill count is not county implementation on night three of early voting.",
        ],
      },
      {
        minutesLabel: "8–20 min",
        title: "Three-beat administrator pivot",
        steps: [
          "Staff reads bill-list move verbatim.",
          "Kelly delivers primary response under 45 seconds — three jobs, no bill numbers.",
          "Alternate: 'Writing law and running the office clerks depend on are different jobs.'",
          "Alternate: 'Rankings measure rhetoric — I measure whether your clerk got her grant question answered.'",
          "Three clean takes on video — stop at three beats even if a fourth job tempts.",
        ],
      },
      {
        minutesLabel: "20–30 min",
        title: "Enrolled sections & implementation contrast",
        steps: [
          "Skim one Hammer enrolled bill section — implementation burden for clerks, not act-number recitation.",
          "One research-frame line: clerks implement what the Capitol passes.",
          "Link to b3-opposition offense move if claims gate is green.",
          "Do not cite act numbers unless claims-verified.",
        ],
      },
      {
        minutesLabel: "30–40 min",
        title: "Lock-in & claims gate",
        steps: [
          "One administrator pivot without notes — under 45 seconds.",
          "Body check: still hands when Hammer voice would accelerate.",
          "Claims gate: red-line any act number or org stat not green.",
          "Mark optional example complete.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Bill list vs administrator job",
        body:
          "Hammer's bill numbers prove legislative tenure — not whether SOS answered the clerk's grant question this week. Kelly stacks operational history: nonprofit admin, organizing with clerks in the room, platform implementation.",
      },
      {
        title: "Night three of early voting",
        body:
          "Concrete image beats abstract authorship. County clerks on the longest early-voting night need an administrator — not a sponsor reading act numbers from the Capitol.",
      },
      {
        title: "Three beats maximum",
        body:
          "When Hammer sprays bill numbers, Kelly slows down and stops at three qualification beats. Adding a fourth reads as insecurity. Smile, pause, wait — then-scan.",
      },
      {
        title: "Implementation contrast (research frame)",
        body:
          "Enrolled act text shows clerk burden — contrast sponsor credit with county execution without act-number tennis. Research frame unless claims-verified.",
      },
      {
        title: "Common mistakes",
        body:
          "Debating bill count line by line. Citing unverified act numbers to counter Hammer. Sounding arrogant instead of specific. Skipping claims gate because pivot feels obvious.",
      },
    ],
    psychology: [
      {
        title: "Marcia Truman · skeptical administrator",
        body:
          "Skeptical administrators reward specific operational beats over legislative volume. Three slow, verified jobs beat a fast bill list every time.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer follow-up",
        body:
          "May double down with ranking cite or ACCA panel credit — bridge to clerk phone line, not scorecard debate. May tag-team with Pakko — look at moderator, one clerk sentence.",
      },
    ],
    sampleLines: [
      {
        label: "Primary",
        text: "I've managed organizations, budgets, and people who depend on timely answers — clerks need an administrator on night three of early voting, not a sponsor reading act numbers.",
      },
      {
        label: "Author vs administrator",
        text: "Writing law and running the office clerks depend on are different jobs — I am asking for the administrator job.",
      },
      {
        label: "Clerk service",
        text: "Rankings measure rhetoric. I measure whether your county clerk got her grant question answered this week.",
      },
    ],
    doNotSay: [
      "Bill-number tennis without claims verification",
      "Fourth job story on stage",
      "Motive attacks before administrator pivot",
      "Heritage or ranking stats without green check",
    ],
    claimsGate: [
      "No act numbers on stage unless claims-verified.",
      "Org titles and budget figures in superiority stack — green in claims ledger.",
      "Enrolled-text quotes — verify before broadcast use.",
    ],
    keyTakeaways: [
      "Three operational beats — stop even if Hammer keeps listing acts.",
      "Administrator frame in first sentence when possible.",
      "Optional example — skip if manual + claims blocks ran long.",
    ],
    practiceSteps: [
      "Three administrator pivot reps under 45s each.",
      "One video take with then-scan.",
      "Claims-check every fact in the response.",
    ],
    relatedLinks: [
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
      { href: epDebatePrepDayDrillHref(DAY3_ID, "d3-qual-stack"), label: "Qualification stack drill" },
      { href: epDebatePrepDayRehearsalHref(DAY3_ID, "rehearse-qualified-90s"), label: "90s qualification rehearsal" },
      { href: epHammerBillHref("SB486"), label: "Hammer bill · enrolled sections (verify)" },
      { href: epOpponentBioHref("kim-hammer"), label: "Hammer bio" },
      { href: epOppositionResearchModuleHref("claims-ledger"), label: "Claims ledger" },
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research" },
    ],
  },
};

export function getDay3OpponentExampleStudy(exampleId: string): OpponentExampleStudyDeep | undefined {
  return DAY3_OPPONENT_EXAMPLE_STUDY[exampleId];
}
