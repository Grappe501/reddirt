/**
 * Invite Kelly — three-layer pathway (Why → How → What).
 * Routes: /events/request, /events/request/how-it-works, /events/request/what-you-can-host
 * Not listed individually in the main Events dropdown (entry is Layer 1 only).
 */

export type InviteKellyHostCard = {
  title: string;
  body: string;
};

export const inviteKellyFutureWorkflowNotes = [
  "Connect Layer 3 “Start a request” to workflow intake / pending approval queue when form is approved.",
  "Pending-approval calendar for staff — never surface unconfirmed stops as public schedule.",
  "Approved public Google Calendar read-only feed (later phase).",
  "Email notification flow for hosts (later phase).",
] as const;

export const inviteKellyContent = {
  slug: "invite-kelly",
  futureWorkflowNotes: inviteKellyFutureWorkflowNotes,
  meta: {
    layerOne: {
      title: "Invite Kelly",
      description:
        "Bring Kelly Grappe into your community — homes, coffee shops, faith spaces, county meetings, and backyards. Built on real conversations, not staged politics.",
      path: "/events/request",
    },
    layerTwo: {
      title: "How inviting Kelly works",
      description:
        "Start a request, get campaign follow-up, shape the conversation, and understand how public calendar listing works — with respect for private or invitation-only gatherings.",
      path: "/events/request/how-it-works",
    },
    layerThree: {
      title: "What you can host",
      description:
        "House parties, backyards, coffee meetups, county meetings, faith gatherings, civic clubs, roundtables, campus events, volunteer trainings, media, and fairs — sized for neighbors, not ballrooms.",
      path: "/events/request/what-you-can-host",
    },
  },

  layerOne: {
    eyebrow: "Invite Kelly · Why",
    title: "Invite Kelly",
    subtitle: "Bring Kelly into your community, your table, or your backyard.",
    leadParagraphs: [
      "Invite Kelly to your county. Share local events. Help us find fairs, festivals, civic clubs, churches, chambers, and community gatherings.",
      "Every request is reviewed by the campaign—nothing is confirmed from a form alone. Mixed political crowds are welcome when the conversation stays civil.",
    ] as const,
    sections: [
      {
        heading: "Why invite Kelly?",
        bullets: [
          "Real conversations build trust.",
          "People ask better questions in familiar places.",
          "The campaign wants to hear from every county and every kind of community.",
        ] as const,
      },
      {
        heading: "Who should consider hosting?",
        bullets: [
          "Neighbors",
          "Local organizers",
          "County party leaders",
          "Faith and community leaders",
          "Small business owners",
          "Teachers and educators",
          "Civic clubs",
          "Families and friend groups",
        ] as const,
      },
    ] as const,
    nextCta: {
      label: "See how it works & what you can host",
      href: "/events/request/how-it-works",
    },
  },

  layerTwo: {
    eyebrow: "Invite Kelly · How",
    title: "How It Works",
    subtitle:
      "You choose the place. You gather the people. The campaign helps shape the conversation, confirm logistics, and decide whether the event should be public, private, or invitation-only.",
    introParagraphs: [
      "Nothing here is a promise that every request will work with the schedule — it is a promise that serious requests get a serious follow-up.",
    ] as const,
    steps: [
      {
        title: "Start a request",
        body: "Tell us where, when, and what kind of gathering you have in mind — rough dates are fine while you are still organizing.",
      },
      {
        title: "Campaign follow-up",
        body: "Someone follows up to confirm details, crowd size, format, travel, accessibility, and safety and logistics.",
      },
      {
        title: "Conversation design",
        body: "Together you may shape the flow — house party, coffee, Q&A, listening circle, county meeting format, training, or community forum — whatever fits the room.",
      },
      {
        title: "Calendar review",
        body: "Requests go through a review step. Confirmed public events can appear on the campaign calendar later. Private or invitation-only gatherings may stay off the public calendar.",
      },
      {
        title: "Respectful ground rules",
        body: "Mixed political crowds are welcome. Civil conversation is required. Hard questions are welcome. Personal attacks are not.",
      },
    ] as const,
    nextCta: {
      label: "Start a request",
      href: "/events/request/how-it-works#start-request",
    },
  },

  layerThree: {
    eyebrow: "Invite Kelly · What",
    title: "What You Can Host",
    subtitle:
      "You do not need a ballroom or a formal program. You need a place, a few people, and a willingness to host a respectful conversation.",
    closing:
      "If you are unsure whether your idea fits, send it anyway. The campaign would rather have a real conversation about what is possible than miss a good room.",
    hostCards: [
      {
        title: "House Party",
        body: "10–15 people in a living room or kitchen — the classic neighbor conversation.",
      },
      {
        title: "Backyard Conversation",
        body: "Informal outdoor gathering when weather and noise allow — still structured enough for real questions.",
      },
      {
        title: "Coffee Meetup",
        body: "Restaurant, diner, coffee shop, or local cafe — a public-ish room with a little more elbow room.",
      },
      {
        title: "County Party Meeting",
        body: "Democratic, Republican, Libertarian, independent, or nonpartisan civic group — serious process questions welcome.",
      },
      {
        title: "Faith or Community Gathering",
        body: "Church, synagogue, mosque, community center, or fellowship room — listening with respect in spaces people already trust.",
      },
      {
        title: "Civic Club / Local Group",
        body: "Service clubs, neighborhood associations, issue groups — anywhere neighbors already meet with purpose.",
      },
      {
        title: "Small Business / Nonprofit Roundtable",
        body: "Local employers, entrepreneurs, and nonprofit leaders talking filings, access, and how government shows up at the counter.",
      },
      {
        title: "Campus / Youth Event",
        body: "Students, youth groups, and civic education spaces — keep the tone grounded and the stakes honest.",
      },
      {
        title: "Volunteer Training",
        body: "Local team launch, Power of 5, relational organizing — train the people who train the counties.",
      },
      {
        title: "Podcast / Interview / Local Media",
        body: "Audio, video, livestream, or local Q&A — coordinated so neighbors recognize the same Kelly they would meet in a county room.",
      },
      {
        title: "County Fair / Festival",
        body: "Invite the campaign to table, walk the grounds, speak briefly, or simply meet people where summer gathers.",
      },
    ] as const satisfies readonly InviteKellyHostCard[],
    formPlaceholderTitle: "Request form coming soon",
    formPlaceholderBody:
      "When the form goes live, it will live here — same review standards as other campaign touchpoints. Until then, email with your county, timing range, venue type, expected headcount, and any accessibility notes.",
    primaryCtaLabel: "Start a request",
    secondaryLinks: [
      { label: "Events", href: "/events" },
      { label: "From the Road", href: "/from-the-road" },
    ] as const,
  },
} as const;
