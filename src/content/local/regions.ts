import type { RegionPage } from "@/content/types";

export const regions: RegionPage[] = [
  {
    slug: "pulaski-county",
    name: "Pulaski County",
    region: "Central Arkansas",
    status: "active",
    summary:
      "Arkansas’s most populous county—with deep neighborhood diversity and a long tradition of front-porch politics waiting to be organized with intention.",
    hearing: [
      "Rent and property taxes are squeezing families block by block.",
      "People want schools resourced without turning classrooms into culture-war props.",
      "Neighbors feel unheard on development and safety decisions made downtown—not with them.",
    ],
    priorityIssues: ["Housing stability", "Public schools", "Transparent planning"],
    upcomingEventSlugs: [
      "501-fest-little-rock-2026",
      "arkansas-times-tacos-tequilas-2026-05-21",
      "listening-session-little-rock",
      "volunteer-training-central-ark",
    ],
    organizingContactNote:
      "Placeholder contact routing—Phase 5 can map to a real county lead inbox or Mobilize chapter.",
    stories: [
      {
        quote: "We’re not asking for a savior—we’re asking for a fair process.",
        attribution: "Teacher & parent, Pulaski",
      },
    ],
    resourceLinks: [
      { label: "Direct democracy & ballot process (guide)", href: "/resources/direct-democracy-guide" },
      { label: "Host a gathering", href: "/host-a-gathering" },
    ],
    cta: {
      primary: { label: "Start or join locally", href: "/start-a-local-team" },
      secondary: { label: "View events", href: "/events?region=Central%20Arkansas" },
    },
  },
  {
    slug: "saline-county",
    name: "Saline County",
    region: "Central Arkansas",
    status: "building",
    summary:
      "Fast-growing communities balancing small-town identity with commuter pressure—an ideal place for patient listening and durable teams.",
    hearing: [
      "Young families want to stay but feel priced toward the edges.",
      "Workers commute long miles because local wages haven’t caught up.",
      "People are tired of politics that only shows up at election time.",
    ],
    priorityIssues: ["Cost of living", "Communities + commutes", "County services"],
    upcomingEventSlugs: ["community-conversation-benton"],
    organizingContactNote: "Building a county anchor team—expect slower follow-up while we train hosts.",
    stories: [
      {
        quote: "We can disagree and still eat at the same table—but only if someone sets the table.",
        attribution: "Small business owner, Saline",
      },
    ],
    resourceLinks: [
      { label: "How to listen before organizing", href: "/resources#toolkit" },
      { label: "Office priorities", href: "/priorities" },
    ],
    cta: {
      primary: { label: "Host a first gathering", href: "/host-a-gathering" },
      secondary: { label: "See what’s happening", href: "/events" },
    },
  },
  {
    slug: "northwest-arkansas",
    name: "Northwest Arkansas",
    region: "Northwest Arkansas",
    status: "coming_soon",
    summary:
      "A multi-county region with distinct towns and shared economic gravity. We’re laying groundwork for a regional hub that respects local identities.",
    hearing: [
      "Growth is real—and so is the fear of being priced out of home.",
      "Workers keep the region running; they want voice, not slogans.",
      "People crave civic spaces that aren’t performative or corporate-polished.",
    ],
    priorityIssues: ["Growth + housing", "Worker voice", "Regional coordination"],
    upcomingEventSlugs: [],
    organizingContactNote:
      "Coming soon: regional coordinator + partner org handoffs. For now, use statewide intake forms.",
    stories: [],
    resourceLinks: [{ label: "Join the movement", href: "/get-involved" }],
    cta: {
      primary: { label: "Raise your hand for NWA", href: "/get-involved" },
      secondary: { label: "Read office priorities", href: "/priorities" },
    },
  },
];

export function getRegionBySlug(slug: string): RegionPage | undefined {
  return regions.find((r) => r.slug === slug);
}

export function listRegionSlugs(): string[] {
  return regions.map((r) => r.slug);
}
