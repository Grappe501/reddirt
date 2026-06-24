/**
 * Day 8 drill-down registry — crash course sections (§0–§8).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  DAY8_ARKANSAS_PEOPLE_FRAME,
  DAY8_CLAIMS_GATE,
  DAY8_COURSE_INTRO,
  DAY8_PM_EXECUTION_NOTE,
  DAY8_WEEK_BALANCE_CORRECTION,
} from "@/lib/election-plan/debate-prep-day8-crash-copy";
import {
  DAY8_SOS_DOMAIN_CARDS,
  DAY8_SOS_THREE_DOMAINS_FRAME,
} from "@/lib/election-plan/debate-prep-day8-sos-three-domains";
import {
  getDay8SectionDeepStudyLinks,
} from "@/lib/election-plan/debate-prep-day8-deep-study-links";
import {
  DAY8_CRASH_SECTION_SPECS,
  DAY8_SECTION_IDS,
  type Day8CrashSectionSpec,
  type Day8WeekImportTag,
} from "@/lib/election-plan/debate-prep-day8-crash-sections";
import type {
  DayBlockDrillDown,
  DayCommandDrillDown,
  DayConceptDrillDown,
  DayExampleDrillDown,
  DayMicroLessonDrillDown,
  DayRehearsalDrillDown,
} from "@/lib/election-plan/debate-prep-drill-down-types";

const DAY8 = "day-8-command-mode-debate" as const;

export {
  DAY8_CRASH_SECTION_SPECS,
  DAY8_SECTION_IDS,
  type Day8CrashSectionSpec,
  type Day8WeekImportTag,
} from "@/lib/election-plan/debate-prep-day8-crash-sections";

export const DAY8_CONCEPTS: DayConceptDrillDown[] = [
  {
    id: "arkansas-people-frame-d8",
    label: "Arkansas people frame",
    summary: DAY8_ARKANSAS_PEOPLE_FRAME,
    sections: [
      {
        title: "Audience shift",
        body: "Clerks belong inside your answers. Voters and press belong in front of your eyes when you speak.",
      },
    ],
    practiceSteps: [
      "Read frame once aloud.",
      "Name one clerk sentence you will translate for Marcia T.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY8, "s8-persona-wall"), label: "Persona wall section" },
      { href: epDebatePrepDayConceptHref(DAY8, "debate-anatomy-d8"), label: "Debate anatomy" },
    ],
  },
  {
    id: "sos-three-domains-d8",
    label: "Three SOS domains",
    summary: DAY8_SOS_THREE_DOMAINS_FRAME,
    sections: DAY8_SOS_DOMAIN_CARDS.map((d) => ({
      title: d.label,
      body: `${d.voterQuestion} · Speak to ${d.personaSpeakTo}`,
    })),
    practiceSteps: [
      "Name all three domains without notes.",
      "One claims-green proof line per domain aloud.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY8, "s8-orient"), label: "Orient section" },
      { href: epDebatePrepDayBlockHref(DAY8, "s8-opening-workshop"), label: "Opening workshop" },
    ],
  },
  {
    id: "debate-anatomy-d8",
    label: "Debate anatomy",
    summary: "Stage order: backstage → walk-on → opening → listen → traps → SOS → pile-on → closing → leave calm.",
    sections: [
      {
        title: "Pre-stage vs stage",
        body: "This course rehearses the arc. Stage is travel, broadcast, and debrief — execution from the lock sheet.",
      },
    ],
    practiceSteps: [
      "Recite stage segments in order without notes.",
      "Point to which section of the course maps to each segment.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY8, "s8-run-through"), label: "Run-through section" },
      { href: epDebatePrepDayHref(DAY8), label: "Day 8 overview" },
    ],
  },
  {
    id: "opening-construction-d8",
    label: "Opening construction",
    summary: "90 seconds · administrator → elections + business services + Capitol management → Arkansas promise.",
    sections: [
      {
        title: "Beat A",
        body: "Administrator frame — SOS runs three jobs, not a bill sponsor (Day 1).",
      },
      {
        title: "Beat B · Three domains",
        body: DAY8_SOS_DOMAIN_CARDS.map((d) => `${d.shortLabel}: ${d.kellyProofTemplate.slice(0, 120)}…`).join(" "),
      },
      {
        title: "Beat C",
        body: "Arkansas promise — picture primary persona (Day 4/5 tone).",
      },
    ],
    practiceSteps: [
      "Write three beats on one notecard — claims-green only.",
      "Deliver one timed 90s rep.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY8, "s8-opening-workshop"), label: "Opening workshop" },
      { href: epDebatePrepDayRehearsalHref("day-1-command-foundation", "rehearse-opening-90s"), label: "Day 1 · 90s opening" },
    ],
  },
  {
    id: "middle-game-traps-d8",
    label: "Middle game",
    summary: "Four trap pairs + three SOS answers — one timed 90s answer per domain with voter translation.",
    sections: DAY8_SOS_DOMAIN_CARDS.map((d) => ({
      title: `SOS · ${d.shortLabel}`,
      body: `${d.moderatorTheme} — ${d.answerSpine.slice(0, 140)}…`,
    })),
    practiceSteps: [
      "Four trap pairs under 60s each.",
      "Three SOS answers under 90s with voter translation.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY8, "s8-middle-game"), label: "Middle game section" },
      { href: epDebatePrepDayBlockHref("day-5-anticipate-and-capitalize", "b5-lab-review"), label: "Day 5 capitalize sheet" },
    ],
  },
  {
    id: "closing-construction-d8",
    label: "Closing construction",
    summary: "60 seconds · service desk invoke (three domains) → sim fix → quotable with pause.",
    sections: [
      {
        title: "Beat 1 · Three domains",
        body: "Closing invokes elections, business filings, and transparent Capitol rules — not clerk-only.",
      },
      {
        title: "Beat 2 · Sim fix",
        body: "One Day 6 debrief fix on weakest domain — single sentence.",
      },
      {
        title: "Peak-end",
        body: "Hold silence two seconds after the last word.",
      },
    ],
    practiceSteps: [
      "Import one Day 6 debrief fix into beat 2.",
      "Two timed 60s reps.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY8, "s8-closing-workshop"), label: "Closing workshop" },
      { href: epDebatePrepDayBlockHref("day-7-refine-and-steal-show", "b7-open-close"), label: "Day 7 bookends" },
    ],
  },
  {
    id: "success-check-d8",
    label: "Success check",
    summary: "Opening + closing delivered; all three SOS domains covered; lock sheet exported.",
    sections: [
      {
        title: "Stage handoff",
        body: DAY8_PM_EXECUTION_NOTE,
      },
    ],
    practiceSteps: [
      "Answer evening review questions on Day 8 overview.",
      "Staff confirms lock sheet is claims-green.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY8, "s8-lock-sheet"), label: "Lock sheet section" },
      { href: epDebatePrepDayHref(DAY8), label: "Day 8 overview" },
    ],
  },
];

export const DAY8_REHEARSAL: DayRehearsalDrillDown[] = [
  {
    id: "rehearse-crash-run-through",
    label: "Abbreviated debate arc · speak aloud",
    durationLabel: "~22 minutes",
    script:
      "Walk-on breath → opening 90s (administrator + elections + business services + Capitol management) → two trap lanes → three domain SOS timed → pile-on → closing 60s (service desk invoke). Log one fix.",
    presenceNotes: [
      "Picture Marcia T. for opening/closing · Robert K. for business services SOS · Diane P. for Capitol SOS.",
      "Claims-green only — no new stats under stress.",
    ],
    successCheck: [
      "Full arc complete without stopping for research.",
      "Elections, business services, and Capitol each answered in SOS segment.",
      "One fix logged.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY8, "s8-run-through"), label: "Run-through section" },
      { href: epDebatePrepDayBlockHref("day-6-full-simulation", "b6-sim"), label: "Day 6 full sim reference" },
    ],
  },
];

export function buildDay8Blocks(): DayBlockDrillDown[] {
  return DAY8_CRASH_SECTION_SPECS.map((section) => {
    const sections: Array<{ title: string; body: string }> = [
      { title: "Activity", body: section.activity },
      { title: "Why this section", body: section.why },
      { title: "Week imports", body: section.weekImports.length > 0 ? section.weekImports.join(", ") : "Orientation only" },
    ];

    if (section.id === "s8-orient") {
      sections.unshift({ title: "Three SOS domains", body: DAY8_SOS_THREE_DOMAINS_FRAME });
      sections.unshift({ title: "Course map", body: DAY8_WEEK_BALANCE_CORRECTION });
      sections.unshift({ title: "Orientation", body: DAY8_COURSE_INTRO });
    }

    const practiceSteps: string[] = [];
    if (section.id === "s8-orient") {
      practiceSteps.push(
        "Read course intro + three-domain frame.",
        "Name elections, business services, Capitol management.",
        "Choose full or essentials path.",
      );
    } else if (section.id === "s8-pre-debate") {
      practiceSteps.push(
        "Preview lock sheet — staff-approved lines only.",
        "Write three if-X-then-Y cards.",
        "Hydrate — no new content ingestion.",
      );
    } else if (section.id === "s8-command") {
      practiceSteps.push(
        "4-4-6 breath ×3 with mic pause.",
        "Scan protocol — moderator, opponents, camera, persona.",
        "Listen face drill — staff reads bait.",
      );
    } else if (section.id === "s8-persona-wall") {
      practiceSteps.push(
        "Map each domain to persona chip.",
        "Three voter-translation drills (elections, business, Capitol).",
        "Set primary speak-to for opening beat C.",
      );
    } else if (section.id === "s8-opening-workshop") {
      practiceSteps.push(
        "Build four-beat notecard — Beat B names all three domains.",
        "Deliver rep 1 timed 90s.",
        "Deliver rep 2 — fix weakest domain beat only.",
      );
    } else if (section.id === "s8-middle-game") {
      practiceSteps.push(
        "Four when-X-say-Y reps under 60s.",
        "Three SOS answers — one per domain, 90s each.",
        "One pile-on pivot cold.",
      );
    } else if (section.id === "s8-closing-workshop") {
      practiceSteps.push(
        "Import one Day 6 fix into beat 2.",
        "Two timed 60s reps — peak-end pause.",
      );
    } else if (section.id === "s8-run-through") {
      practiceSteps.push(
        "Run full abbreviated arc without stopping.",
        "Log one fix for debrief.",
      );
    } else if (section.id === "s8-lock-sheet") {
      practiceSteps.push(
        "Export lock sheet.",
        "Read stage handoff protocol.",
      );
    }

    const relatedLinks: Array<{ href: string; label: string }> = [
      ...getDay8SectionDeepStudyLinks(section.id),
      { href: epDebatePrepDayConceptHref(DAY8, "sos-three-domains-d8"), label: "Three SOS domains concept" },
    ];
    if (section.id === "s8-middle-game") {
      relatedLinks.push({ href: epDebatePrepDayConceptHref(DAY8, "middle-game-traps-d8"), label: "Middle game concept" });
    }
    if (section.id === "s8-opening-workshop") {
      relatedLinks.push({ href: epDebatePrepDayConceptHref(DAY8, "opening-construction-d8"), label: "Opening construction" });
    }
    if (section.id === "s8-closing-workshop") {
      relatedLinks.push({ href: epDebatePrepDayConceptHref(DAY8, "closing-construction-d8"), label: "Closing construction" });
    }
    if (section.id === "s8-lock-sheet") {
      relatedLinks.push({ href: epDebatePrepDayConceptHref(DAY8, "success-check-d8"), label: "Success check" });
    }

    return {
      blockId: section.id,
      title: `${section.sectionLabel} · ${section.title}`,
      minutes: section.minutes,
      activity: section.activity,
      why: section.why,
      sections,
      practiceSteps,
      relatedLinks,
    };
  });
}

export function buildDay8MicroLessons(): DayMicroLessonDrillDown[] {
  return [];
}

export function buildDay8Drills(): DayCommandDrillDown[] {
  return [];
}

export function buildDay8Examples(): DayExampleDrillDown[] {
  return [];
}
