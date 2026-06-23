/**
 * Day 8 — three SOS job domains (compressed seven-day course spine).
 * Elections · Business services · Capitol management.
 */
import { epDebatePrepDayBlockHref, epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";

export const DAY8_SOS_DOMAIN_IDS = ["elections", "business-services", "capitol-management"] as const;

export type Day8SosDomainId = (typeof DAY8_SOS_DOMAIN_IDS)[number];

export type Day8SosDomainCard = {
  id: Day8SosDomainId;
  label: string;
  shortLabel: string;
  /** What voters ask about — plain language */
  voterQuestion: string;
  /** Kelly operational proof — claims-green template, not invented stats */
  kellyProofTemplate: string;
  /** Who to picture when you speak this domain */
  personaSpeakTo: string;
  /** Week source for import — no new research */
  weekImport: string;
  href: string;
  /** Moderator question theme for middle-game drill */
  moderatorTheme: string;
  /** 90s answer spine — last 20s must translate for living-room voter */
  answerSpine: string;
};

export const DAY8_SOS_THREE_DOMAINS_FRAME =
  "The Secretary of State runs three jobs — elections, business services, and Capitol management. Modules 1–7 built each pillar. This course lines them up for stage: administrator frame, one proof point per domain, Arkansas promise.";

/** Module map — compressed path with links back to full blocks. */
export const DAY8_WEEK_BALANCE_CORRECTION =
  "Course map — opening: Modules 1 + 7 · persona and traps: Modules 2, 4, 5 · SOS drills: Module 3 manual + Module 5 sprint. Use deep-study links to reopen any full block.";

export const DAY8_SOS_DOMAIN_CARDS: readonly Day8SosDomainCard[] = [
  {
    id: "elections",
    label: "Elections & county support",
    shortLabel: "Elections",
    voterQuestion: "Can you run honest elections and back my county clerk?",
    kellyProofTemplate:
      "I've organized with clerks in the room and managed teams under deadline — elections are county-run; the SOS job is to fund, train, and answer the phone on night three of early voting.",
    personaSpeakTo: "Rev. James H. · Carol W.",
    weekImport: "Days 1–4 · clerk partnership + integrity without panic",
    href: epDebatePrepDayHref("day-4-forum-intelligence"),
    moderatorTheme: "Define election integrity in one sentence Arkansans can repeat.",
    answerSpine:
      "Integrity is clerks with funded equipment, transparent processes, and a SOS office that picks up the phone — then translate: your ballot in [county] depends on that desk working.",
  },
  {
    id: "business-services",
    label: "Business services & filings",
    shortLabel: "Business services",
    voterQuestion: "Will the SOS office help my small business, not just lawyers in Little Rock?",
    kellyProofTemplate:
      "I've run nonprofits and civic organizations with real budgets — business filings and UCC are half the SOS desk. Main Street deserves clear forms, rural phone support, and modernization without surprise fees.",
    personaSpeakTo: "Robert K. · Marcia T.",
    weekImport: "Day 3 manual · forum business-services themes · Kelly platform",
    href: epDebatePrepDayBlockHref("day-3-superiority-map", "b3-manual"),
    moderatorTheme: "What will you do to modernize SOS business services for rural Arkansas?",
    answerSpine:
      "Lead with administrator competence — audit backlogs, plain-language forms, rural support blocks — then translate: a filing mistake should not cost a Berryville shop owner a week of revenue.",
  },
  {
    id: "capitol-management",
    label: "Capitol management & public records",
    shortLabel: "Capitol management",
    voterQuestion: "Will you run transparent rules for petitions, records, and Capitol access?",
    kellyProofTemplate:
      "I've built direct-democracy coalitions and published implementation plans — Capitol management means petition rules everyone can read, public records on time, and a SOS who publishes guidance before Friday rule drops.",
    personaSpeakTo: "Diane P. · Marcia T.",
    weekImport: "Day 3–4 · petitions · transparency · direct democracy",
    href: epDebatePrepDayBlockHref("day-3-superiority-map", "b3-manual"),
    moderatorTheme: "How will you handle ballot measures and public records requests fairly?",
    answerSpine:
      "Courts decide fights — SOS administers fairly — transparent titles, published timelines, records without scavenger hunts — then translate: your signature on a petition deserves rules you can read without a law degree.",
  },
] as const;

export const DAY8_OPENING_DOMAIN_BEATS = DAY8_SOS_DOMAIN_CARDS.map((domain, index) => ({
  beat: index + 1,
  domainId: domain.id,
  domainLabel: domain.shortLabel,
  objective: `${domain.shortLabel} — one breath · picture ${domain.personaSpeakTo.split(" · ")[0]}`,
  templateLine: domain.kellyProofTemplate.split(" — ")[0] ?? domain.kellyProofTemplate,
  href: domain.href,
}));

export function getDay8SosDomain(domainId: Day8SosDomainId): Day8SosDomainCard | undefined {
  return DAY8_SOS_DOMAIN_CARDS.find((d) => d.id === domainId);
}
