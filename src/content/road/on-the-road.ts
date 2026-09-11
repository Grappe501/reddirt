/**
 * Copy and constants for `/from-the-road` (“On the Road Across Arkansas”) and related Office Layer 3 proof.
 *
 * Guardrails: only verified facts belong in live copy. Additional stops, counts, and dates require approval.
 *
 * ## Future stop data model (not wired yet)
 * ```ts
 * type OnTheRoadStopVerified = {
 *   date: string;
 *   city: string;
 *   county: string;
 *   venue: string;
 *   eventType: string;
 *   notes?: string;
 *   mediaUrl?: string;
 *   tags?: ("faith" | "community" | "civic")[];
 * };
 * ```
 */

export const onTheRoadPageMeta = {
  title: "On the Road Across Arkansas",
  description:
    "Kelly Grappe’s campaign trail: showing up across Arkansas—in counties, communities, and faith spaces—with verified milestones and ways to follow along.",
} as const;

/** Shared Layer 3 band for Office full-picture pages (Elections primary; optional elsewhere). */
export const OFFICE_LAYER_THREE_CAMPAIGN_TRAIL_PROOF = {
  title: "The Work Behind the Campaign",
  body:
    "This campaign is not being built from a conference room. Kelly is working the trail — county meetings, community rooms, faith spaces, civic gatherings, and small conversations where people ask real questions. Through August the campaign has logged 23,419 miles, 245 engagements, and visits in 58 counties.",
  ctaLabel: "See Kelly on the road",
  ctaHref: "/from-the-road",
} as const;

export const onTheRoadProofCopy = {
  hero: {
    eyebrow: "Campaign trail",
    title: "On the Road Across Arkansas",
    subtitle:
      "Kelly is showing up where Arkansans live, work, worship, organize, and ask hard questions.",
    bodyParagraphs: [
      "From the night she filed, Kelly went straight to the people. Her first stop was Faulkner County Democrats, where she stood up for the first time and said, “I’m Kelly Grappe, and I’m running for Secretary of State.” Thank you to Teresa Huff for giving her that first platform.",
    ] as const,
    messageLine:
      "You cannot serve all 75 counties if you do not show up — so the campaign keeps putting miles on the road and hours in the room.",
  },

  metrics: {
    title: "What the road looks like (through August)",
    intro:
      "Campaign totals through August — miles from travel logs and reimbursements, engagements from the field count, counties from the public visit ledger.",
    items: [
      { label: "Miles", value: "23,419", note: "Through August" },
      { label: "Engagements", value: "245", note: "Through August" },
      { label: "Counties", value: "58", note: "Visited through August" },
    ] as const,
    /**
     * County/city totals stay off the public page until Steve marks rows Confirmed in
     * docs/website/CALENDAR_PRESENCE_CONFIRMATION.md (Unknown stays Unknown).
     */
  },

  community: {
    title: "Showing Up in Every Kind of Room",
    list: [
      "County meetings",
      "Living rooms",
      "Community gatherings",
      "Churches",
      "Synagogues",
      "Mosques",
      "Local events",
      "Civic spaces",
    ] as const,
    bodyParagraphs: [
      "Kelly has been welcomed into churches, synagogues, and mosques, and the campaign is grateful for the community shared in each place. The point is not to perform politics in sacred spaces — it is to listen with respect wherever Arkansans gather.",
    ] as const,
  },

  map: {
    title: "Counties on the trail",
    intro:
      "Filled from the campaign county ledger — completed public visits and published stops only.",
    moreHref: "/arkansas-visits",
    moreLabel: "Full county calendar →",
  },

  stories: {
    title: "Snapshots from the trail",
    introWhenPlaceholder: "Until more posts are synced here, a few verified moments anchor the story.",
    placeholders: [
      {
        id: "first-stop",
        title: "First stop after filing",
        body:
          "From the night she filed, Kelly went to Faulkner County Democrats — the first time she introduced herself publicly as a candidate for Secretary of State. Thank you to Teresa Huff for that first platform.",
      },
      {
        id: "february-mileage",
        title: "Miles on the road",
        body:
          "Through August the campaign has logged 23,419 miles, 245 engagements, and visits in 58 of Arkansas’s 75 counties.",
      },
      {
        id: "faith-rooms",
        title: "Faith and community rooms",
        body:
          "Kelly has shown up in churches, synagogues, and mosques, and is grateful for the hospitality and shared community in each place.",
      },
    ] as const,
  },

  hubHandoff: {
    eyebrow: "Follow along",
    title: "Channels, writing, and field updates",
    body:
      "Everything below is the same bookmark-friendly hub: social channels, live embeds when available, trail photos, Substack writing, and posts from the field.",
  },
} as const;
