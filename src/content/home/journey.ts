/**
 * Homepage journey architecture — beats group related sections so the page reads as chapters,
 * not one continuous feed. IDs power scroll-spy nav + assistant context.
 */
export type JourneyBeat = {
  id: string;
  navLabel: string;
  navShort: string;
  /** Human-readable for AI + screen readers */
  description: string;
};

export const HOME_JOURNEY_BEATS: JourneyBeat[] = [
  {
    id: "beat-arrival",
    navLabel: "Arrival",
    navShort: "Start",
    description: "Hero, trust commitments, and choosing a path into the site.",
  },
  {
    id: "beat-educate",
    navLabel: "Understand",
    navShort: "Learn",
    description: "What we hear in Arkansas, who Kelly is, movement spine, office stakes, and pathways deeper.",
  },
  {
    id: "beat-civic",
    navLabel: "Civic depth",
    navShort: "Civic",
    description: "Ballot access, proof of organization, and filings / public service.",
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

export function beatById(id: string): JourneyBeat | undefined {
  return HOME_JOURNEY_BEATS.find((b) => b.id === id);
}
