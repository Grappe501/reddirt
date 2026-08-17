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
  title: "From the Road with Kelly Grappe",
  description:
    "Stories, people and lessons from 75 counties. Kelly writes during the campaign about what she is hearing, seeing, and learning across Arkansas.",
} as const;

export const fromTheRoadJournalCopy = {
  eyebrow: "From the Road",
  title: "From the Road with Kelly Grappe",
  tagline: "Stories, people and lessons from 75 counties.",
  framing:
    "Kelly is writing during this campaign about what she is hearing, seeing, and learning as she shows up across Arkansas. This is the journal of that work — the written companion to the county map, the photographs, and the rooms along the way.",
  latestEyebrow: "Latest from Kelly",
  archiveTitle: "Journal archive",
  archiveIntro: "Earlier entries, newest first. Open any piece to read it here on the campaign site.",
  subscribeTitle: "Subscribe to Kelly’s Substack",
  subscribeBody:
    "Get From the Road in your inbox. Writing is published on Substack; you read it here. Sign-up, comments, and the full Substack archive stay with her Substack account.",
  subscribeCta: "Subscribe to Kelly’s Substack",
  emptyTitle: "New trail writing is on the way",
  emptyBody: "When Kelly publishes the next entry, it will appear here first. You can still subscribe so you do not miss it.",
  discussCta: "Discuss on Substack",
  archiveOnSubstackCta: "Full archive on Substack",
  moreFromCountyCta: "More from this county",
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
    eyebrow: "From the Road",
    title: "From the Road with Kelly Grappe",
    subtitle: "Stories, people and lessons from 75 counties.",
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
      { label: "Pace since then", value: "Month after month", note: "Similar energy has continued." },
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
    title: "On the road across Arkansas",
    placeholderAriaLabel:
      "Arkansas trail map. County visits and photos live on From the Road and Events.",
    placeholderCaption:
      "See Events and From the Road for where Kelly has been and where she is headed next.",
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
