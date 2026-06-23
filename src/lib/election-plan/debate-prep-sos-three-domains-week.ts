/**
 * SOS three domains — week-wide supplement (Days 1–7).
 * Imports Day 8 domain cards; adds per-day navigation and balance tricks.
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  DAY1_ID,
  DAY2_ID,
  DAY3_ID,
  DAY4_ID,
  DAY5_ID,
  DAY6_ID,
  DAY7_ID,
  DAY8_ID,
  type DrillDownDayId,
} from "@/lib/election-plan/debatePrepDayDrillDown";
import {
  DAY8_DOMAIN_COVERAGE_CHECK,
  DAY8_SOS_THREE_DOMAINS_FRAME,
} from "@/lib/election-plan/debate-prep-day8-crash-copy";
import {
  DAY8_SOS_DOMAIN_CARDS,
  type Day8SosDomainId,
} from "@/lib/election-plan/debate-prep-day8-sos-three-domains";
import type { IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export {
  DAY8_SOS_DOMAIN_CARDS as SOS_THREE_DOMAIN_CARDS,
  DAY8_SOS_THREE_DOMAINS_FRAME as SOS_THREE_DOMAINS_FRAME,
  DAY8_DOMAIN_COVERAGE_CHECK as SOS_DOMAIN_COVERAGE_CHECK,
};
export type { Day8SosDomainId as SosThreeDomainId };

export const SOS_WEEK_PREP_DAY_IDS = [
  DAY1_ID,
  DAY2_ID,
  DAY3_ID,
  DAY4_ID,
  DAY5_ID,
  DAY6_ID,
  DAY7_ID,
] as const;

export type SosWeekPrepDayId = (typeof SOS_WEEK_PREP_DAY_IDS)[number];

export type SosDomainWeekNavLink = {
  domainId: Day8SosDomainId;
  shortLabel: string;
  href: string;
  navLabel: string;
  spotlight: boolean;
  personaHint: string;
};

export type SosWeekDayContext = {
  dayId: SosWeekPrepDayId;
  frameNote: string;
  tonightTrick: string;
  spotlightDomainIds: readonly Day8SosDomainId[];
  domainNav: readonly SosDomainWeekNavLink[];
  day8PreviewHref: string;
  day8PreviewLabel: string;
};

type DomainHrefStep = {
  throughDay: SosWeekPrepDayId;
  href: string;
  navLabel: string;
};

/** Cumulative best block per domain — unlocked as the week progresses. */
const SOS_DOMAIN_WEEK_HREF_STEPS: Record<Day8SosDomainId, readonly DomainHrefStep[]> = {
  elections: [
    {
      throughDay: DAY1_ID,
      href: epDebatePrepDayBlockHref(DAY1_ID, "b1-author"),
      navLabel: "Author vs administrator",
    },
    {
      throughDay: DAY2_ID,
      href: epDebatePrepDayBlockHref(DAY2_ID, "b2-trap1"),
      navLabel: "Trap lane 1 · integrity pivot",
    },
    {
      throughDay: DAY3_ID,
      href: epDebatePrepDayBlockHref(DAY3_ID, "b3-claims"),
      navLabel: "Claims gate · elections proof",
    },
    {
      throughDay: DAY4_ID,
      href: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"),
      navLabel: "Forum lab · clerk intel",
    },
    {
      throughDay: DAY5_ID,
      href: epDebatePrepDayBlockHref(DAY5_ID, "b5-sos-sprint"),
      navLabel: "SOS sprint · elections timer",
    },
    {
      throughDay: DAY6_ID,
      href: epDebatePrepDayBlockHref(DAY6_ID, "b6-sim"),
      navLabel: "Full sim · elections segment",
    },
    {
      throughDay: DAY7_ID,
      href: epDebatePrepDayBlockHref(DAY7_ID, "b7-open-close"),
      navLabel: "Bookends · opening elections beat",
    },
  ],
  "business-services": [
    {
      throughDay: DAY1_ID,
      href: epDebatePrepDayBlockHref(DAY1_ID, "b1-philosophy"),
      navLabel: "Philosophy · operations executive",
    },
    {
      throughDay: DAY3_ID,
      href: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"),
      navLabel: "Superiority manual · filings",
    },
    {
      throughDay: DAY4_ID,
      href: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"),
      navLabel: "Forum lab · business-services lines",
    },
    {
      throughDay: DAY5_ID,
      href: epDebatePrepDayBlockHref(DAY5_ID, "b5-sos-sprint"),
      navLabel: "SOS sprint · business timer",
    },
    {
      throughDay: DAY6_ID,
      href: epDebatePrepDayBlockHref(DAY6_ID, "b6-sim"),
      navLabel: "Full sim · business segment",
    },
    {
      throughDay: DAY7_ID,
      href: epDebatePrepDayBlockHref(DAY7_ID, "b7-open-close"),
      navLabel: "Bookends · service desk invoke",
    },
  ],
  "capitol-management": [
    {
      throughDay: DAY1_ID,
      href: epDebatePrepDayRehearsalHref(DAY1_ID, "rehearse-opening-90s"),
      navLabel: "Opening 90s · administrator frame",
    },
    {
      throughDay: DAY3_ID,
      href: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"),
      navLabel: "Manual · petitions & records",
    },
    {
      throughDay: DAY4_ID,
      href: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"),
      navLabel: "Forum lab · transparency lines",
    },
    {
      throughDay: DAY5_ID,
      href: epDebatePrepDayBlockHref(DAY5_ID, "b5-lab-review"),
      navLabel: "Lab review · records & petition pivots",
    },
    {
      throughDay: DAY6_ID,
      href: epDebatePrepDayBlockHref(DAY6_ID, "b6-sim"),
      navLabel: "Full sim · Capitol segment",
    },
    {
      throughDay: DAY7_ID,
      href: epDebatePrepDayBlockHref(DAY7_ID, "b7-open-close"),
      navLabel: "Closing · transparent rules",
    },
  ],
};

const SOS_WEEK_DAY_CONTEXT: Record<SosWeekPrepDayId, Omit<SosWeekDayContext, "dayId" | "domainNav">> = {
  [DAY1_ID]: {
    frameNote:
      "Plant the administrator frame tonight: SOS runs elections, business services, and Capitol management — not one-note election talk later.",
    tonightTrick:
      "Trick · after author/administrator block, say all three jobs aloud once — no notes — before you stop.",
    spotlightDomainIds: ["elections", "business-services", "capitol-management"],
    day8PreviewHref: epDebatePrepDayConceptHref(DAY8_ID, "sos-three-domains-d8"),
    day8PreviewLabel: "Preview Day 8 · three-domain concept",
  },
  [DAY2_ID]: {
    frameNote:
      "Trap lanes are election-heavy because the forum was ACCA — bridge pivots with service-desk language that leaves room for business filings and Capitol rules this week.",
    tonightTrick:
      "Trick · end one trap pivot with: 'That is the elections desk — the SOS also runs business services and Capitol management.'",
    spotlightDomainIds: ["elections"],
    day8PreviewHref: epDebatePrepDayConceptHref(DAY8_ID, "sos-three-domains-d8"),
    day8PreviewLabel: "Preview Day 8 · domain balance",
  },
  [DAY3_ID]: {
    frameNote:
      "Tonight the superiority manual makes business services and Capitol management explicit — stack all three SOS duties until the list feels boring.",
    tonightTrick:
      "Trick · qualification stack must name elections + business filings + petition/records competence — one breath each.",
    spotlightDomainIds: ["business-services", "capitol-management"],
    day8PreviewHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-opening-workshop"),
    day8PreviewLabel: "Preview Day 8 · opening three-domain beats",
  },
  [DAY4_ID]: {
    frameNote:
      "Forum lab is clerk-room intel — extract green lines for business-services answers and Capitol transparency too, not only election integrity.",
    tonightTrick:
      "Trick · notecard gets three columns: elections · business services · Capitol — one claims-green line per column from transcript.",
    spotlightDomainIds: ["elections"],
    day8PreviewHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-middle-game"),
    day8PreviewLabel: "Preview Day 8 · middle-game SOS tabs",
  },
  [DAY5_ID]: {
    frameNote:
      "Pre-load when-X-say-Y pairs for all three domains — integrity traps alone will shrink you to clerk-only on debate day.",
    tonightTrick:
      "Trick · SOS sprint timer: 90s each for elections, business services, Capitol — log weakest domain for Day 6 sim.",
    spotlightDomainIds: ["elections", "business-services", "capitol-management"],
    day8PreviewHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-middle-game"),
    day8PreviewLabel: "Day 8 · timed SOS per domain",
  },
  [DAY6_ID]: {
    frameNote:
      "Full sim must fail on all three SOS jobs under fatigue — not a clerk-only dress rehearsal before Arkansas voters watch APA statewide.",
    tonightTrick:
      "Trick · debrief top fix: which domain was weakest? Day 7 bookends must invoke that domain by name.",
    spotlightDomainIds: ["elections", "business-services", "capitol-management"],
    day8PreviewHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-run-through"),
    day8PreviewLabel: "Preview Day 8 · crash run-through",
  },
  [DAY7_ID]: {
    frameNote:
      "Debate eve polish: opening and closing bookends invoke service desk for elections + business services + Capitol management — clerk competence stays inside, not alone on stage.",
    tonightTrick:
      "Trick · closing beat 1 names all three domains before quotable lock — picture Marcia T. for statewide APA tone.",
    spotlightDomainIds: ["elections", "business-services", "capitol-management"],
    day8PreviewHref: epDebatePrepDayHref(DAY8_ID),
    day8PreviewLabel: "Module 8 · command course",
  },
};

const WEEK_DAY_ORDER: readonly SosWeekPrepDayId[] = SOS_WEEK_PREP_DAY_IDS;

function weekDayIndex(dayId: SosWeekPrepDayId): number {
  return WEEK_DAY_ORDER.indexOf(dayId);
}

function resolveDomainHrefForDay(
  domainId: Day8SosDomainId,
  dayId: SosWeekPrepDayId,
): { href: string; navLabel: string } {
  const idx = weekDayIndex(dayId);
  const steps = SOS_DOMAIN_WEEK_HREF_STEPS[domainId];
  let best = steps[0]!;
  for (const step of steps) {
    if (weekDayIndex(step.throughDay) <= idx) best = step;
    else break;
  }
  return { href: best.href, navLabel: best.navLabel };
}

export function isSosWeekPrepDay(dayId: IntensiveDayId): dayId is SosWeekPrepDayId {
  return (SOS_WEEK_PREP_DAY_IDS as readonly string[]).includes(dayId);
}

export function getSosWeekDayContext(dayId: IntensiveDayId): SosWeekDayContext | undefined {
  if (!isSosWeekPrepDay(dayId)) return undefined;
  const base = SOS_WEEK_DAY_CONTEXT[dayId];
  const spotlight = new Set(base.spotlightDomainIds);

  const domainNav: SosDomainWeekNavLink[] = DAY8_SOS_DOMAIN_CARDS.map((card) => {
    const link = resolveDomainHrefForDay(card.id, dayId);
    return {
      domainId: card.id,
      shortLabel: card.shortLabel,
      href: link.href,
      navLabel: link.navLabel,
      spotlight: spotlight.has(card.id),
      personaHint: card.personaSpeakTo.split(" · ")[0] ?? card.personaSpeakTo,
    };
  });

  return { dayId, ...base, domainNav };
}

export function getSosWeekDayTrick(dayId: DrillDownDayId): string | undefined {
  return getSosWeekDayContext(dayId)?.tonightTrick;
}

export function listSosWeekPrepDayIds(): readonly SosWeekPrepDayId[] {
  return SOS_WEEK_PREP_DAY_IDS;
}
