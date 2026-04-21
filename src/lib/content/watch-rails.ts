/**
 * Curated topic rails on `/watch`. Match videos by `InboundContentItem.contentSeries`
 * or a single `issueTags` entry (editorial slugs / labels).
 */
export type WatchRailDef = {
  id: string;
  title: string;
  /** Short campaign-voice line under the heading (public UX). */
  strapline: string;
  /** Prefer `contentSeries` on inbound rows (stable slug). */
  contentSeries?: string;
  /** Fallback: any of these issue tags (OR). */
  issueTags?: string[];
};

export const WATCH_RAIL_DEFS: WatchRailDef[] = [
  {
    id: "why_im_running",
    title: "Why I'm in this race",
    strapline: "The through-line: who this office is for, and what “the people rule” has to mean in practice.",
    contentSeries: "why_im_running",
  },
  {
    id: "people_over_politics",
    title: "People over politics",
    strapline: "Leadership that treats voters, clerks, and counties as the boss—not the party or the headline.",
    contentSeries: "people_over_politics",
  },
  {
    id: "on_the_road",
    title: "On the road in Arkansas",
    strapline: "Showing up, listening hard, and carrying what we hear back into honest answers.",
    contentSeries: "on_the_road",
  },
  {
    id: "election_transparency",
    title: "Election transparency",
    strapline: "How systems work, how they’re tested, and how we earn confidence after Election Day.",
    contentSeries: "election_transparency",
  },
  {
    id: "ballot_rights",
    title: "Ballot rights & direct democracy",
    strapline: "Defending the people’s path to the ballot—clear timelines, fair notice, and respect for signatures.",
    contentSeries: "ballot_rights",
  },
  {
    id: "county_conversations",
    title: "County conversations",
    strapline: "Rural towns, county seats, and regional hubs—the office has to work in every community.",
    contentSeries: "county_conversations",
    issueTags: ["county_conversations", "counties"],
  },
];
