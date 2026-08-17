/**
 * Trust-funnel homepage copy — LIVE CANON for `/` (48h launch sprint narrative).
 * Real content or clearly marked pending only. Do not invent quotes, counties, or résumé claims.
 * @see docs/website/HOMEPAGE_48H_LAUNCH_SPRINT_MAP.md
 * @see docs/website/WEBSITE_CONTENT_INTEGRITY_AUDIT.md
 */

export const trustFunnelHomeCopy = {
  hero: {
    brand: "THE PEOPLE RULE.",
    office: "Kelly Grappe for Arkansas Secretary of State",
    promise: "The Arkansas Constitution says that “all political power is inherent in the people.”",
    body:
      "Our state motto, Regnat Populus — “The People Rule” — should be more than words on a seal. It should define how the Secretary of State serves the people of Arkansas. I’m running to take the politics out of this office, restore trust in our systems, and make the Secretary of State’s office work better for the people it belongs to.",
    ctas: [
      { label: "Meet Kelly", href: "/about", variant: "primary" },
      { label: "See My Plan", href: "/priorities", variant: "secondary" },
    ] as const,
  },

  /**
   * Homepage body — Kelly Grappe Website Master Direction (approved).
   * Keep concise here; proof and subsections live on /priorities.
   */
  approvedHome: {
    restoreTrust: {
      title: "My First Priority: Restore Trust",
      paragraphs: [
        "Trust cannot be demanded. It has to be earned.",
        "I want to lift up the hood on Arkansas elections and show people how our systems actually work — how votes are cast, protected, counted and verified, and why those systems are secure.",
        "That also means being willing to hear hard questions. When people have concerns, we should answer them with facts instead of dismissing them. And when we find a problem, we should say so, fix it and tell the public what we did.",
        "Transparency isn’t a threat to election security. It’s one of the ways we build confidence in it.",
      ],
    },
    officeResponsibility: {
      title: "What the Secretary of State Is Responsible For",
      paragraphs: [
        "The Secretary of State is responsible for major functions of Arkansas government — including statewide election administration and support, business and commercial services, public and government records, the initiative and referendum process, and stewardship of the State Capitol.",
        "At its core, this is a large and complex service organization.",
        "That is why my experience matters. I spent decades leading teams, managing complex systems, serving customers and businesses, solving operational problems, and turning complicated information into something people can actually use.",
        "I’m not running because I’ve spent my career in politics. I’m running because I’ve spent my career making organizations work better for people.",
      ],
    },
    planCards: {
      title: "My Plan",
      intro: "Seven commitments for an office that belongs to the people.",
      cards: [
        {
          id: "restore-trust",
          title: "Restore Trust in Our Elections",
          href: "/priorities#restore-trust",
        },
        {
          id: "peoples-voice",
          title: "Protect the People’s Constitutional Voice",
          href: "/priorities#peoples-voice",
        },
        {
          id: "counties",
          title: "Support All 75 Counties",
          href: "/priorities#counties",
        },
        {
          id: "transparency",
          title: "Make Government More Transparent",
          href: "/priorities#transparency",
        },
        {
          id: "election-processes",
          title: "Make Election Processes Work Better",
          href: "/priorities#election-processes",
        },
        {
          id: "engagement",
          title: "Build a More Engaged Arkansas",
          href: "/priorities#engagement",
        },
        {
          id: "business",
          title: "Make It Easier to Do Business With Arkansas",
          href: "/priorities#business",
        },
      ],
    },
    arkansasElections: {
      title: "Arkansas Runs Arkansas Elections",
      paragraphs: [
        "I will be a fierce advocate for Arkansas’s constitutional role in administering our elections. I will comply with federal law and work constructively with federal partners where appropriate, but I will oppose attempts to unnecessarily nationalize election administration or take legitimate decision-making authority away from Arkansas and our local election officials.",
        "If federal overreach threatens Arkansas’s lawful authority over our elections, I will hold the line.",
      ],
    },
  },

  governmentThatWorks: {
    title: "Government That Works",
    /** Target: 35–75 words */
    intro:
      "The Secretary of State’s office touches how Arkansans vote, file a business, find public records, and enter their Capitol. Each pillar below states the duty, why it matters, what Kelly believes, what she will improve, and what the office cannot do alone.",
    pillars: [
      {
        id: "elections",
        title: "Secure, accessible elections",
        href: "/office/elections",
        exploreLabel: "See how elections work",
        body:
          "Voters deserve confidence that rules are clear, applied evenly, and explained in plain language. County clerks—who run Election Day in all 75 counties—need a partner in Little Rock, not another layer of confusion.",
        commitments: [
          "Consistent guidance and training support for all 75 county clerks",
          "Faster, clearer election reporting the public can follow",
          "Voter registration and participation tools that reduce friction",
          "Administration faithful to Arkansas law—not partisan favoritism",
        ],
      },
      {
        id: "business",
        title: "Business and nonprofit filings that work",
        href: "/office/business",
        exploreLabel: "See how filings work",
        body:
          "Owners, treasurers, and volunteer boards should not fight the filing system to stay legal. Predictable online services and real help when something breaks keep Main Street working.",
        commitments: [
          "Easier online filing with fewer dead ends",
          "Customer service that answers when filings stall",
          "Systems that support small businesses and nonprofits alike",
          "Modern digital tools instead of paper-era bottlenecks",
        ],
      },
      {
        id: "records",
        title: "Transparent records and digital access",
        href: "/office/records",
        exploreLabel: "See how records access works",
        body:
          "Public information should be findable without a specialist. When people understand how to get records and track filings, accountability stops being a slogan.",
        commitments: [
          "Clearer paths to open public records",
          "Better online access to what the office already holds",
          "Efficient operations that respect taxpayers’ time",
          "Accountability within the duties this office actually controls",
        ],
      },
      {
        id: "capitol",
        title: "Capitol stewardship and public service",
        href: "/office/capitol",
        exploreLabel: "See how Capitol stewardship works",
        body:
          "The people’s house should feel professionally managed—safe, respectful, and focused on service. Civic education and steady operations belong in the same office that keeps the lights on.",
        commitments: [
          "Professional stewardship of the Capitol Complex",
          "Support for Capitol Police and operational standards",
          "Civic education that helps Arkansans understand their government",
          "A culture of service that puts Arkansas first",
        ],
      },
    ] as const,
  },

  /** @deprecated Prefer governmentThatWorks — kept for orphan explainer reference */
  fourPillars: {
    title: "Government That Works",
    intro:
      "The Secretary of State’s office touches how Arkansans vote, file a business, find public records, and walk into their Capitol.",
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

  primaryMessage: {
    eyebrow: "Watch Kelly’s Message",
    /** Target: 25–60 words — frame, do not explain the video away */
    introduction:
      "Kelly explains why she believes the Secretary of State’s office must remain accountable to the people it serves — clear, direct, and in her own words.",
  },

  meetKelly: {
    title: "Meet Kelly",
    /** Three focused beats; total target 150–220 words — rhythm via layout, not more biography */
    beats: [
      {
        label: "Who she is",
        body: "Kelly Grappe is a community organizer and operations leader running for Arkansas Secretary of State. She lives and works in Arkansas community life—organizing neighbors, building volunteer capacity, and treating public process as something ordinary people should be able to understand and use.",
      },
      {
        label: "What prepared her",
        body: "She spent nearly 25 years in telecom operations leadership—training teams and protecting customer-impacting work when systems could not fail—and years organizing around fair elections and ballot access, including grassroots petition work after LEARNS. She also knows the filer’s side of the counter through small-market and farm operations. That mix of administration and listening shapes how she would run the office: professionally, transparently, and with equal respect for all 75 counties.",
      },
      {
        label: "Why this office",
        body: "Those experiences led her to seek this office: modernize what is broken inside its legal duties, defend lawful ballot access, and make state services easier for ordinary Arkansans to use.",
      },
    ] as const,
    principle: "People over politics — competence, accessibility, and accountable public service.",
    /** @deprecated Prefer beats — kept for message-psychology word-count invariants */
    intro:
      "Kelly Grappe is a community organizer and operations leader running for Arkansas Secretary of State. She lives and works in Arkansas community life—organizing neighbors, building volunteer capacity, and treating public process as something ordinary people should be able to understand and use.",
    body:
      "She spent nearly 25 years in telecom operations leadership—training teams and protecting customer-impacting work when systems could not fail—and years organizing around fair elections and ballot access, including grassroots petition work after LEARNS. She also knows the filer’s side of the counter through small-market and farm operations. That mix of administration and listening shapes how she would run the office: professionally, transparently, and with equal respect for all 75 counties.",
    values:
      "Those experiences led her to seek this office: modernize what is broken inside its legal duties, defend lawful ballot access, and make state services easier for ordinary Arkansans to use. People over politics means competence, accessibility, and accountable public service—not personality worship.",
    cta: "Read About Kelly’s Experience",
    ctaHref: "/about",
  },

  acrossArkansas: {
    eyebrow: "On the trail",
    title: "Kelly Across Arkansas",
    /** Target: 35–75 words — method, not romance */
    intro:
      "Kelly travels to confirmed stops, listens, asks questions, and learns what is working and what is not. Photography and video here are evidence of that method—not claims of coverage everywhere.",
    /** Quiet presence line — only named places with confirmed geography on this band */
    presenceLabel: "Confirmed communities in this band",
    videoIntroduction:
      "A trail story from Hot Springs Village: neighbors gathering, conversations starting, and the work of showing up.",
    cta: "From the Road",
    ctaHref: "/from-the-road",
  },

  campaignPhotos: {
    title: "Latest Campaign Photos",
    intro:
      "Curated trail stills—listening, speaking, working, and community stops across Arkansas.",
  },

  endorsements: {
    eyebrow: "Trust",
    title: "Endorsements",
    intro:
      "Only formal, campaign-confirmed endorsements appear here. Categories show coalition breadth—not a ranking of names.",
    emptyState:
      "This space stays empty on purpose until organizations and community leaders formally announce support—with the organization name and source on record.",
    viewAll: "View All Endorsements",
  },

  newsUpdates: {
    eyebrow: "Updates",
    title: "Campaign news & updates",
    intro:
      "What the campaign has actually released: announcements, trail notes, and published events—not a filler feed.",
    emptyState:
      "No public updates are queued right now. Follow From the Road and the events calendar as verified posts and stops are published.",
    fromTheRoadCta: "From the Road",
    eventsCta: "Events calendar",
  },

  finalAction: {
    /** Motto already appears once in the hero — close with the organizing ask. */
    mottoLatin: "Get Involved",
    mottoEnglish: "Your power is closer than you think.",
    title: "Be part of it",
    body:
      "Start with five people you know. Volunteer. Host Kelly. Or support the work. This campaign grows through relationships — one conversation at a time.",
    ctas: {
      join: "Activate Your Power of 5",
      volunteer: "Volunteer",
      priorities: "Host Kelly",
      donate: "Donate",
    },
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
      "LEARNS petition work is the same story: neighbors learning the process, circulating responsibly, and holding power accountable when it overreaches.",
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
        title: "Organize volunteers",
        body: "Circulators, notaries, and local captains who follow Arkansas law and keep citizen-led work in citizens’ hands.",
      },
      {
        title: "Kelly’s organizing record",
        body: "Grassroots petition work after LEARNS—including temporary field offices and neighbor-to-neighbor training—is part of why she is running.",
      },
    ] as const,
    ctas: {
      hub: "The People's Constitutional Voice",
      process: "How initiatives reach the ballot",
      getInvolved: "Get involved",
    },
  },

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
    title: "The next step is yours",
    body:
      "You have met Kelly’s purpose, heard her message, and seen the trail. Join the work, stay connected, or dig into her story.",
    ctas: {
      meetKelly: "Meet Kelly",
      directDemocracy: "Direct democracy",
      inviteKelly: "Invite Kelly",
      volunteer: "Get involved",
    },
  },
} as const;
