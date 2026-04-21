import type { EventItem } from "@/content/types";

export const events: EventItem[] = [
  {
    slug: "listening-session-little-rock",
    title: "Listening Session — Little Rock neighborhoods",
    type: "Listening Session",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-05-18T18:00:00",
    endsAt: "2026-05-18T19:30:00",
    timezone: "America/Chicago",
    locationLabel: "Community space — TBA",
    addressLine: "Little Rock, AR (exact address after RSVP)",
    summary: "A no-agenda night to name what’s breaking trust locally—and what neighbors want next.",
    description:
      "This isn’t a speech and it isn’t a debate. Facilitators keep time, take notes, and make sure quieter voices get room. You’ll leave with clarity on shared concerns and optional next steps.",
    whatToExpect: [
      "Ground rules rooted in respect",
      "Small-group listening rotations",
      "Public themes captured (no forced agreement)",
    ],
    whoItsFor: "Residents of Pulaski County who want to be heard—even if you’ve checked out of politics.",
    organizerNote: "Placeholder organizer line—Script 5 can sync names from Mobilize or CRM.",
    rsvpHref: undefined,
    audienceTags: ["Neighbors", "Faith communities"],
    relatedEventSlugs: ["volunteer-training-central-ark"],
    relatedResourceHrefs: [{ label: "Host your own session", href: "/host-a-gathering" }],
  },
  {
    slug: "volunteer-training-central-ark",
    title: "Volunteer Training — Central Arkansas cohort",
    type: "Volunteer Training",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-05-25T17:30:00",
    endsAt: "2026-05-25T20:00:00",
    timezone: "America/Chicago",
    locationLabel: "Hybrid — Zoom + in-person hub",
    summary: "Practical skills for neighbor-to-neighbor organizing: listening, mapping, follow-through.",
    description:
      "You’ll practice short conversations, learn how teams debrief without drama, and walk away with a simple plan for your next 10 doors or calls.",
    whatToExpect: ["Roleplays (kind, not corny)", "A printed one-page field plan", "Mentor pairing options"],
    whoItsFor: "New volunteers and returning organizers who want a shared baseline.",
    organizerNote: "Training team placeholder.",
    audienceTags: ["Volunteers"],
    relatedEventSlugs: ["listening-session-little-rock"],
    relatedResourceHrefs: [{ label: "Toolkit: first gathering", href: "/resources#toolkit" }],
  },
  {
    slug: "community-conversation-benton",
    title: "Community Conversation — Benton",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "saline-county",
    status: "upcoming",
    startsAt: "2026-06-04T19:00:00",
    endsAt: "2026-06-04T20:15:00",
    timezone: "America/Chicago",
    locationLabel: "Downtown Benton — venue TBA",
    summary: "A smaller circle format—coffee, names, and honest questions about what’s working and what isn’t.",
    description:
      "Designed for 15–35 people. We’ll use a simple question stack and end with optional commitments—nothing heavy, nothing performative.",
    whatToExpect: ["Name + place intros", "Two rounds of focused questions", "Optional signup for follow-up"],
    whoItsFor: "Saline County residents curious about building local power without the usual political theater.",
    organizerNote: "Local host team forming—details finalized soon.",
    audienceTags: ["Saline County"],
    relatedEventSlugs: [],
    relatedResourceHrefs: [{ label: "Start a local team", href: "/start-a-local-team" }],
  },
  {
    slug: "direct-democracy-briefing-statewide",
    title: "Direct Democracy Briefing (statewide Zoom)",
    type: "Direct Democracy Briefing",
    region: "Statewide",
    status: "past",
    startsAt: "2026-03-12T18:30:00",
    endsAt: "2026-03-12T20:00:00",
    timezone: "America/Chicago",
    locationLabel: "Online",
    summary: "How initiatives and referendums work—and how Arkansans can defend ballot access responsibly.",
    description:
      "Recording and slides will be posted to Resources after legal review. This session emphasized education, not petition language.",
    whatToExpect: [],
    whoItsFor: "Anyone considering civic action beyond election day.",
    organizerNote: "Past event archive placeholder.",
    relatedEventSlugs: [],
    relatedResourceHrefs: [{ label: "Direct democracy pillar page", href: "/direct-democracy" }],
  },
];

export const eventTypes = [
  "Town Hall",
  "Community Conversation",
  "House Gathering",
  "Volunteer Training",
  "Direct Democracy Briefing",
  "Labor / Worker Roundtable",
  "Youth Civic Session",
  "Listening Session",
] as const;

export function getEventBySlug(slug: string): EventItem | undefined {
  return events.find((e) => e.slug === slug);
}

export function listEventSlugs(): string[] {
  return events.map((e) => e.slug);
}
