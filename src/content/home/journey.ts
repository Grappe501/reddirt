/**
 * Journey beat definitions — scroll anchors (`data-journey-beat`) + assistant copy.
 * Landing page only mounts a subset; full trail lives on `/campaign-trail`.
 */
export type JourneyBeat = {
  id: string;
  navLabel: string;
  navShort: string;
  description: string;
};

/** Full list — `beatById`, assistant, and docs */
export const JOURNEY_BEAT_DEFINITIONS: JourneyBeat[] = [
  {
    id: "beat-arrival",
    navLabel: "Arrival",
    navShort: "Start",
    description: "Hero, trust commitments, and choosing a path into the site.",
  },
  {
    id: "beat-field",
    navLabel: "In the field",
    navShort: "Field",
    description: "Statewide presence, video, and Arkansas story.",
  },
  {
    id: "beat-people",
    navLabel: "Voices",
    navShort: "People",
    description: "Stories, editorial, notebook, and campaign trail.",
  },
  {
    id: "beat-conviction",
    navLabel: "Conviction",
    navShort: "Why",
    description: "Campaign principle and closing argument.",
  },
  {
    id: "beat-act",
    navLabel: "Your move",
    navShort: "Act",
    description: "Ways to help, donate, and stay connected.",
  },
];

/** Homepage (`/`): hero, trust ribbon, pathway cards, Step in (get involved) */
export const LANDING_JOURNEY_BEATS: JourneyBeat[] = JOURNEY_BEAT_DEFINITIONS.filter(
  (b) => b.id === "beat-arrival" || b.id === "beat-act",
);

/** Former middle of homepage — field, voices, conviction */
export const CAMPAIGN_TRAIL_JOURNEY_BEATS: JourneyBeat[] = JOURNEY_BEAT_DEFINITIONS.filter((b) =>
  ["beat-field", "beat-people", "beat-conviction"].includes(b.id),
);

/** @deprecated Use JOURNEY_BEAT_DEFINITIONS — alias for assistant compatibility */
export const HOME_JOURNEY_BEATS = JOURNEY_BEAT_DEFINITIONS;

export function beatById(id: string): JourneyBeat | undefined {
  return JOURNEY_BEAT_DEFINITIONS.find((b) => b.id === id);
}
