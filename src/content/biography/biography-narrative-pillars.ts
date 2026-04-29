/**
 * Four narrative pillars for the literary biography — mirrors Meet Kelly themes without replacing /about/[slug] essays.
 * Used by `/biography` hub cards and planning copy; chapter orders align with `BIOGRAPHY_CHAPTERS` in biography-config.
 */
export type BiographyNarrativePillar = {
  id: string;
  /** Short label for Meet Kelly dropdown (“Biography — …”) */
  navShortLabel: string;
  /** Short card heading */
  title: string;
  /** Hub teaser — one tight graf tone */
  summary: string;
  /** `order` values from BiographyChapter (1–9 incl. epilogue) */
  chapterOrders: readonly number[];
};

export const BIOGRAPHY_NARRATIVE_PILLARS: readonly BiographyNarrativePillar[] = [
  {
    id: "formation",
    navShortLabel: "Roots & voice",
    title: "Roots, voice, and the turn toward stewardship",
    summary:
      "Arkansas childhood and hearth-formed confidence; mentors and journalism; the foster-care daycare beat that bent purpose toward industrial psychology—Chapters 1–3.",
    chapterOrders: [1, 2, 3],
  },
  {
    id: "scale-and-home",
    navShortLabel: "Leadership & family",
    title: "Leadership at scale and intentional family",
    summary:
      "Alltel and Verizon training floors through Little Rock’s river tower; drift and reunion with Steve; adoption and Grace; Rose Bud between Romance and Joy—Chapters 4–6.",
    chapterOrders: [4, 5, 6],
  },
  {
    id: "civic-ground",
    navShortLabel: "Ground-up Arkansas",
    title: "Ground-up Arkansas — LEARNS, Sherwood, six petitions",
    summary:
      "Private steadiness steps into public organizing: referendum work, duplex headquarters, volunteers carrying simultaneous initiatives—Chapter 7.",
    chapterOrders: [7],
  },
  {
    id: "office-and-road",
    navShortLabel: "Office & road",
    title: "Systems, trust, and the road still unwinding",
    summary:
      "Why constitutional-office work fits the accumulated habits—elections, filings, records, operational trust—and the epilogue’s lived continuity beyond any title—Chapters 8–9.",
    chapterOrders: [8, 9],
  },
] as const;
