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
    "This campaign is not being built from a conference room. Kelly is working the trail — county meetings, community rooms, faith spaces, civic gatherings, and small conversations where people ask real questions. In February alone, the campaign logged 3,200+ miles and 27 engagements, and that pace has continued month after month.",
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
    title: "What the road looked like (verified)",
    intro:
      "These numbers come from the campaign’s own February log — not estimates for other months, and not a substitute for every county yet visited.",
    items: [
      { label: "Miles (February)", value: "3,200+", note: "Campaign log — February" },
      { label: "Engagements (February)", value: "27", note: "Campaign log — February" },
      { label: "Pace since then", value: "Month after month", note: "Similar energy has continued — see field posts and calendar below." },
    ] as const,
    /** Display only — TODO: replace when Steve supplies verified totals. */
    countyPlaceholderLabel: "Counties reached (verified total pending)",
    cityPlaceholderLabel: "Cities visited (verified total pending)",
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
    title: "Trail map (coming with verified stops)",
    /** Accessible description for placeholder graphic — no markers until data is approved. */
    placeholderAriaLabel:
      "Placeholder for an Arkansas trail map. Verified county and city stops will be plotted here after approval. There are no map markers yet.",
    placeholderCaption:
      "TODO: Connect verified stops and county data — no fabricated pins.",
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
        title: "February on the road",
        body:
          "In February the campaign logged more than 3,200 miles and 27 engagements — work the team has worked to keep up month after month.",
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
