/**
 * Trust-funnel homepage copy — LIVE CANON shell for `/` (HYBRID upgrades via forward-plan slices).
 * Real content or clearly marked pending only. Do not invent quotes, counties, or résumé claims.
 * @see docs/website/HOMEPAGE_CURRENT_STATE_ASSESSMENT.md
 * @see docs/website/HOMEPAGE_FORWARD_PLAN.md
 * @see docs/website/WEBSITE_CONTENT_INTEGRITY_AUDIT.md
 */

export const trustFunnelHomeCopy = {
  hero: {
    eyebrow: "Kelly Grappe · Secretary of State",
    headline: "Government That Works for Every Arkansan",
    philosophy: "People Over Politics",
    body:
      "The Secretary of State's office should serve every community, business, nonprofit, county, and voter. Kelly Grappe is committed to modernizing state services, supporting all 75 county clerks, strengthening election administration, improving business filings, and making Arkansas government easier to access.",
    ctas: [
      { label: "Meet Kelly", href: "/about", variant: "primary" },
      { label: "Our Plan", href: "/priorities", variant: "secondary" },
      { label: "What the Office Does", href: "/understand", variant: "secondary" },
      { label: "Business Services", href: "/office/business", variant: "secondary" },
      { label: "Secure Elections", href: "/office/elections", variant: "secondary" },
      { label: "Get Involved", href: "/get-involved", variant: "secondary" },
    ] as const,
  },

  fourPillars: {
    title: "The Office Serves Arkansas in Four Ways",
    intro:
      "The Secretary of State is much more than elections. These four pillars show how the office touches daily life across Arkansas.",
    pillars: [
      {
        id: "elections",
        title: "Secure Elections",
        href: "/office/elections",
        bullets: [
          "Secure, accurate elections",
          "Strong support for all 75 county clerks",
          "Faster reporting",
          "Voter registration",
          "Civic participation",
        ],
      },
      {
        id: "business",
        title: "Strong Business Services",
        href: "/office/business",
        bullets: [
          "Easier online filing",
          "Better customer service",
          "Small business success",
          "Nonprofit support",
          "Modern digital systems",
        ],
      },
      {
        id: "government",
        title: "Transparent Government",
        href: "/office/records",
        bullets: [
          "Open public records",
          "Modern technology",
          "Better online access",
          "Efficient operations",
          "Accountability",
        ],
      },
      {
        id: "capitol",
        title: "Capitol Leadership",
        href: "/office/capitol",
        bullets: [
          "Capitol Complex stewardship",
          "Capitol Police support",
          "Leadership development",
          "Civic education",
          "Professional public service",
        ],
      },
    ] as const,
  },

  officeServes: {
    title: "The Secretary of State Serves Arkansas Every Day",
    intro:
      "From elections to the Capitol Complex, the office touches Arkansans in many ways. Explore each responsibility.",
    cards: [
      { id: "elections", label: "Elections", href: "/office/elections", icon: "vote" },
      {
        id: "business",
        label: "Businesses & Commercial Services",
        href: "/office/business",
        icon: "building",
      },
      { id: "records", label: "Public Records", href: "/office/records", icon: "file" },
      { id: "capitol", label: "Capitol Complex", href: "/office/capitol", icon: "landmark" },
      { id: "police", label: "Capitol Police", href: "/office/capitol", icon: "shield" },
      {
        id: "clerks",
        label: "County Clerk Support",
        href: "/office/elections",
        icon: "handshake",
      },
      { id: "digital", label: "Digital Government", href: "/understand", icon: "monitor" },
      { id: "civic", label: "Civic Education", href: "/understand", icon: "book" },
    ] as const,
  },

  meetKelly: {
    title: "Meet Kelly",
    intro:
      "Kelly Grappe is running for Arkansas Secretary of State to put people over politics—listening across all 75 counties and preparing to serve with professionalism.",
    body:
      "She brings executive leadership and a record of community organizing around fair elections and ballot access. The full story—background, civic work, and why she entered this race—lives on Meet Kelly.",
    cta: "Read Meet Kelly",
    ctaHref: "/about",
  },

  /** Kept for reference / possible reuse; not rendered on the trust-funnel homepage. */
  officeExplainer: {
    title: "What the Secretary of State Does",
    intro:
      "The Secretary of State touches how we vote, how businesses file, how public information stays within reach, and how the Capitol complex is stewarded.",
    cards: {
      elections: {
        title: "Elections",
        body:
          "Election administration should be free, fair, transparent, and accessible—with instructions and support that build confidence in the result.",
        detail:
          "The aim is consistent guidance: the same rules explained plainly and applied evenly across counties.",
        learnMoreHref: "/office/elections",
        learnMoreLabel: "Elections & the office →",
      },
      business: {
        title: "Business Services",
        body:
          "Filing and registrations ought to be straightforward—predictable systems with real help when something breaks.",
        detail:
          "When filings are predictable, owners and treasurers spend less time fighting the process.",
        learnMoreHref: "/office/business",
        learnMoreLabel: "Business & filings →",
      },
      records: {
        title: "Transparency & Records",
        body:
          "Access should be open, and the path to get there should be clear—you should not need to be an expert to understand your own government.",
        detail:
          "Plain steps, real guidance, and accountability within what this office actually controls.",
        learnMoreHref: "/office/records",
        learnMoreLabel: "Public records →",
      },
      capitol: {
        title: "Capitol & Public Safety",
        body:
          "The people’s house should feel professionally managed—safe, respectful access and steady stewardship alongside Capitol Police.",
        detail:
          "Operational leadership: clear standards and public servants supported—not fear politics.",
        learnMoreHref: "/office/capitol",
        learnMoreLabel: "Capitol stewardship →",
      },
    },
    cta: "Understand the office",
    ctaHref: "/understand",
    pathwayWhyRace: {
      label: "Why Kelly is running",
      supportingLine:
        "Arkansas elections administered for Arkansans—under law, without partisan favoritism.",
      href: "/about/why-kelly",
    },
  },

  directDemocracy: {
    eyebrow: "Campaign center pillar",
    title: "Direct democracy & the ballot initiative process",
    lead:
      "Kelly entered this race to defend fair elections and the citizen path to ballot measures—not to narrow who gets to petition or how signatures are counted.",
    body:
      "Stand Up Arkansas, LEARNS petition work, and the commitment network are the same story: neighbors learning the process, circulating responsibly, and holding power accountable when it overreaches.",
    pillars: [
      {
        title: "Protect ballot access",
        body: "Initiatives and referenda belong to volunteers and voters—not gatekeepers who treat signature gathering as a privilege.",
      },
      {
        title: "Teach the official process",
        body: "Plain-language steps from title drafting through verification—so organizers know what the Secretary of State’s office actually controls.",
      },
      {
        title: "Organize the commitment network",
        body: "Circulators, notaries, and local captains who pledge to follow Arkansas law and keep citizen-led work in citizens’ hands.",
      },
      {
        title: "Kelly’s organizing record",
        body: "Grassroots petition work after LEARNS—including temporary field offices and neighbor-to-neighbor training—is part of why she is running.",
      },
    ] as const,
    ctas: {
      hub: "Direct democracy hub",
      process: "How initiatives reach the ballot",
      commitment: "Join the commitment network",
    },
  },

  /** Soft differentiator — no employer names or headcounts on the homepage. */
  executiveLeadership: {
    title: "Proven Executive Leadership",
    lead: "Government doesn't improve because of campaign slogans.",
    body:
      "It improves because leaders know how to build strong teams, modernize operations, solve complex problems, and serve the public with professionalism.",
    closer:
      "Kelly brings decades of executive leadership, organizational development, technology modernization, and large-team management experience to the Secretary of State's office—focused on building a culture of service that puts Arkansas first.",
    cta: "Learn more about Kelly's experience →",
    ctaHref: "/about",
  },

  listening: {
    title: "Listening across Arkansas",
    intro:
      "This campaign grows through real conversations—in county rooms, community gatherings, and faith spaces. Field updates appear on From the Road and the events calendar when verified.",
    bullets: [
      "Invite Kelly to your county, club, church, chamber, fair, or community gathering.",
      "Share local event opportunities—we review every request before anything is public.",
      "Volunteer, host, or stay connected without joining a formal team unless you want to.",
    ] as const,
    primaryCta: "Invite Kelly",
    primaryHref: "/events/request",
    secondaryCta: "Share an event opportunity",
    secondaryHref: "/schedule",
  },

  inviteKelly: {
    title: "Invite Kelly",
    intro:
      "Invite Kelly to your county. Share local events. Help us find fairs, festivals, civic clubs, churches, chambers, and community gatherings.",
    body:
      "Every request goes through staff review—nothing is confirmed from a form alone. Mixed political rooms are welcome when the conversation stays civil.",
    cta: "Start an invite",
    ctaHref: "/events/request",
    secondaryCta: "Schedule request form",
    secondaryHref: "/schedule",
  },

  roles: {
    title: "Get Involved",
    intro: "Real actions only—start where you are. None of this requires joining a formal team unless you want to.",
    cards: {
      vote: {
        title: "Vote / Register",
        body: "Your ballot is the baseline. Start here if you are unsure whether you are registered.",
        linkLabel: "Voter registration center",
      },
      volunteer: {
        title: "Volunteer",
        body: "Event help, calls, doors, hosting, or logistics—pick a lane that fits your week.",
        linkLabel: "Volunteer sign-up",
      },
      stayConnected: {
        title: "Stay Connected",
        body: "Updates when you want them—on this site or Kelly’s Substack.",
        linkLabelUpdates: "Get updates",
        linkLabelBlog: "Kelly’s Substack",
      },
      donate: {
        title: "Donate",
        body: "If this work matters to you, a contribution helps keep organizers on the road. Give what is comfortable.",
        linkLabel: "Donate",
      },
    },
  },

  trustBand: [
    "Defend direct democracy & ballot access",
    "All 75 counties deserve equal service",
    "Transparent systems",
    "Accessible government",
    "Administration faithful to the law",
    "People Over Politics",
  ] as const,

  motion: {
    kicker: "Events",
    title: "Upcoming Events",
    introWithFeed:
      "Published campaign events only—verified before they appear here. For the full calendar, open Events.",
    introPlaceholder:
      "No published events are listed right now. Invite Kelly or share a local gathering—we review every request before anything goes public.",
    placeholderNoteTitle: "Events",
    placeholderNoteBody:
      "Upcoming events appear here only when published and verified. No invented stops or crowd claims.",
    followCta: "Events calendar",
    followHref: "/events",
    placeholderSecondaryCta: "Invite Kelly",
    placeholderSecondaryHref: "/events/request",
  },

  finalCta: {
    title: "Learn the story. Defend ballot access. Join the work.",
    body:
      "Read Meet Kelly, walk through the ballot initiative process, and lend a hand—circulating, hosting, or staying connected on your timeline.",
    ctas: {
      meetKelly: "Meet Kelly",
      directDemocracy: "Direct democracy",
      inviteKelly: "Invite Kelly",
      volunteer: "Get involved",
    },
  },
} as const;
