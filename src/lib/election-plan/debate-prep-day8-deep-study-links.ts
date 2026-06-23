/**
 * Day 8 — hyperlinks back to Day 1–7 blocks where Kelly did deep study.
 * Used on crash course sections, panels, and study guides.
 */
import {
  EP_TRAP_LANES_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayHref,
  epDebatePrepDayRehearsalHref,
  epVoterAudienceProfileHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY8_SEVEN_DAY_DEEP_LINKS } from "@/lib/election-plan/debate-prep-day8-crash-copy";

export type Day8DeepStudyLink = {
  href: string;
  label: string;
};

const D1 = "day-1-command-foundation" as const;
const D2 = "day-2-read-the-table" as const;
const D3 = "day-3-superiority-map" as const;
const D4 = "day-4-forum-intelligence" as const;
const D5 = "day-5-anticipate-and-capitalize" as const;
const D6 = "day-6-full-simulation" as const;
const D7 = "day-7-refine-and-steal-show" as const;
const D8 = "day-8-command-mode-debate" as const;

/** Per-section deep study — open any block when Kelly wants the full week material. */
export const DAY8_SECTION_DEEP_STUDY_LINKS: Record<string, readonly Day8DeepStudyLink[]> = {
  "s8-orient": DAY8_SEVEN_DAY_DEEP_LINKS.map((link) => ({
    href: link.href,
    label: link.label,
  })),
  "s8-pre-debate": [
    { href: epDebatePrepDayBlockHref(D7, "b7-claims-final"), label: "Day 7 · claims final cut" },
    { href: epDebatePrepDayBlockHref(D7, "b7-open-close"), label: "Day 7 · opening + closing polish" },
    { href: epDebatePrepDayBlockHref(D8, "s8-lock-sheet"), label: "Day 8 · lock sheet preview" },
  ],
  "s8-command": [
    { href: epDebatePrepDayBlockHref(D1, "b1-posture"), label: "Day 1 · posture + breath" },
    { href: epDebatePrepDayBlockHref(D1, "b1-psych"), label: "Day 1 · listen face + composure" },
    { href: epDebatePrepDayBlockHref(D2, "b2-coaching"), label: "Day 2 · stage presence coaching" },
  ],
  "s8-persona-wall": [
    { href: epDebatePrepDayBlockHref(D5, "b5-lab-review"), label: "Day 5 · voter translation drills" },
    { href: epDebatePrepDayBlockHref(D4, "b4-lab"), label: "Day 4 · forum lab + tone" },
    { href: epVoterAudienceProfileHref("county-champion"), label: "Voter audiences hub" },
  ],
  "s8-opening-workshop": [
    { href: epDebatePrepDayRehearsalHref(D1, "rehearse-opening-90s"), label: "Day 1 · 90s opening rehearsal" },
    { href: epDebatePrepDayBlockHref(D1, "b1-tutor"), label: "Day 1 · administrator frame" },
    { href: epDebatePrepDayBlockHref(D3, "b3-manual"), label: "Day 3 · SOS manual + platform" },
    { href: epDebatePrepDayBlockHref(D4, "b4-lab"), label: "Day 4 · forum opening tone" },
    { href: epDebatePrepDayBlockHref(D4, "b4-sos"), label: "Day 4 · SOS question bank" },
  ],
  "s8-middle-game": [
    { href: epDebatePrepDayBlockHref(D2, "b2-trap1"), label: "Day 2 · trap lane 1 drills" },
    { href: epDebatePrepDayBlockHref(D2, "b2-film"), label: "Day 2 · opponent tells on film" },
    { href: epDebatePrepDayBlockHref(D4, "b4-sos"), label: "Day 4 · moderator SOS bank" },
    { href: epDebatePrepDayBlockHref(D5, "b5-lab-review"), label: "Day 5 · when-X-say-Y sheet" },
    { href: EP_TRAP_LANES_HREF, label: "Trap lanes hub" },
  ],
  "s8-closing-workshop": [
    { href: epDebatePrepDayBlockHref(D7, "b7-open-close"), label: "Day 7 · bookends polish" },
    { href: epDebatePrepDayBlockHref(D6, "b6-sim"), label: "Day 6 · sim debrief fixes" },
    { href: epDebatePrepDayBlockHref(D6, "b6-depth"), label: "Day 6 · if-stuck bridges" },
  ],
  "s8-run-through": [
    { href: epDebatePrepDayBlockHref(D6, "b6-sim"), label: "Day 6 · full simulation" },
    { href: epDebatePrepDayRehearsalHref(D8, "rehearse-crash-run-through"), label: "Day 8 · run-through script" },
  ],
  "s8-lock-sheet": [
    { href: epDebatePrepDayBlockHref(D7, "b7-claims-final"), label: "Day 7 · claims final cut" },
    { href: epDebatePrepDayBlockHref(D7, "b7-open-close"), label: "Day 7 · locked bookends" },
    { href: epDebatePrepDayHref(D8), label: "Day 8 · course complete check" },
  ],
};

export function getDay8SectionDeepStudyLinks(sectionId: string): readonly Day8DeepStudyLink[] {
  return DAY8_SECTION_DEEP_STUDY_LINKS[sectionId] ?? [];
}

/** Domain cards → block-level deep study (elections / business / Capitol). */
export const DAY8_DOMAIN_DEEP_STUDY_LINKS: Record<
  "elections" | "business-services" | "capitol-management",
  readonly Day8DeepStudyLink[]
> = {
  elections: [
    { href: epDebatePrepDayBlockHref(D4, "b4-lab"), label: "Day 4 · forum elections intel" },
    { href: epDebatePrepDayBlockHref(D4, "b4-sos"), label: "Day 4 · integrity SOS answers" },
    { href: epDebatePrepDayHref(D4), label: "Day 4 overview" },
  ],
  "business-services": [
    { href: epDebatePrepDayBlockHref(D3, "b3-manual"), label: "Day 3 · business services manual" },
    { href: epDebatePrepDayBlockHref(D5, "b5-lab-review"), label: "Day 5 · Main Street capitalize" },
  ],
  "capitol-management": [
    { href: epDebatePrepDayBlockHref(D3, "b3-manual"), label: "Day 3 · petitions + transparency" },
    { href: epDebatePrepDayBlockHref(D4, "b4-sos"), label: "Day 4 · ballot measure SOS" },
  ],
};
