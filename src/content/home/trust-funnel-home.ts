/**
 * Trust-funnel homepage copy — trust-first, constitutional-office framing.
 * Update here to revise messaging sitewide for this layout.
 *
 * Headline alternates considered: "Running the Office the Way It Should Work";
 * "Clear. Fair. Built for Arkansas." — production headline below chosen for inclusive steward tone.
 */

export const trustFunnelHomeCopy = {
  hero: {
    eyebrow: "Kelly Grappe · Secretary of State",
    /** Primary headline (alternates documented in module comment above). */
    headline: "A Secretary of State for Everyone",
    /** Subhead: four pillars, one scannable line */
    subhead:
      "Transparent systems · Accessible government · Free and fair elections · People over Politics",
    /** What the campaign is running to do — not a bio. */
    body:
      "Kelly is running to administer the Secretary of State’s office the way it should work: clear rules, reliable processes, and service that answers to every county—faithful to the law, not party pressure.",
    closing: {
      accent: "People over Politics",
      rest: "—competent administration you can count on.",
    },
    ctas: {
      learnOffice: "Learn About the Office",
      meetKelly: "Meet Kelly",
      voteRegister: "Vote / Register",
    },
  },

  officeExplainer: {
    title: "What the Office Does — And Why It Matters",
    intro:
      "The Secretary of State touches what people feel every day—how we vote, how businesses file, and how public information stays within reach.",
    cards: {
      elections: {
        title: "Elections",
        body:
          "Elections should be free, fair, transparent, and accessible—with instructions and support that build confidence in the result.",
      },
      business: {
        title: "Business Services",
        body:
          "Filing and registrations ought to be straightforward. Systems should work the first time, with less confusion, fewer loops, and real help when something breaks.",
      },
      records: {
        title: "Public Records",
        body:
          "Access should be open, and the path to get there should be clear—government shouldn’t hide behind complexity.",
      },
    },
    cta: "Understand the Office",
    ctaHref: "/understand",
  },

  competence: {
    title: "Built on Experience, Not Politics",
    intro:
      "Before this race, Kelly spent years building and running large operations—recruiting, training, systems, and day-to-day accountability when the phones are ringing.",
    bullets: [
      "Led an operation of more than 800 people at Verizon.",
      "Built recruiting and training pipelines and the management structure to support them.",
      "Ran a major call-center operation in Little Rock—high volume, real deadlines, real consequences when details slip.",
    ],
    bridge:
      "That work translates to the Secretary of State’s job: large systems that have to work under pressure, processes that need to be fair and predictable, and follow-through people can see—not promises that evaporate after the headline.",
    cta: "See How Kelly Leads",
    ctaHref: "/about",
  },

  listening: {
    title: "Listening. Learning. Showing Up.",
    intro:
      "Kelly’s background in civic work is practical: help people understand what the rules ask of them, remove avoidable obstacles, and show up when neighbors decide to participate.",
    bullets: [
      "LEARNS referendum involvement—neighbor-to-neighbor education and hands-on support, described simply and without taking sides.",
      "A Sherwood duplex turned petition headquarters so volunteers had a real base of operations.",
      "Pickup and dropoff for petitions—small logistics that protect signatures and deadlines.",
      "Notary support and plain explanation so people weren’t stuck on technicalities for doing things the right way.",
      "When the structure was clear, people showed up—proof that participation grows when the process feels respectful.",
    ],
    primaryCta: "See Where Kelly Has Been",
    primaryHref: "/from-the-road",
    secondaryCta: "Public events",
    secondaryHref: "/events",
  },

  roles: {
    title: "Everyone Has a Role",
    intro: "Start where you are. None of this requires you to ‘join a team’ unless you want to.",
    cards: {
      vote: {
        title: "Vote / Register",
        body:
          "Your ballot is the baseline. If you’re unsure whether you’re registered or what’s next, start here—no jargon, no pressure.",
        linkLabel: "Voter registration center",
      },
      volunteer: {
        title: "Volunteer",
        body:
          "If you want to help, there’s room for all kinds of skills—and you can start small. Training and clear tasks matter more than bravado.",
        linkLabel: "Volunteer sign-up",
      },
      stayConnected: {
        title: "Stay Connected",
        body:
          "Updates when you want them. Follow along on this site or read the road journal at your own pace.",
        linkLabelUpdates: "Get updates",
        linkLabelBlog: "Kelly’s Substack",
      },
      donate: {
        title: "Donate",
        body:
          "If you believe this work matters, a contribution helps keep organizers on the road and systems running. Give what’s comfortable—there’s no scoreboard.",
        linkLabel: "Donate",
      },
    },
  },

  trustBand: [
    "Serving all 75 counties",
    "Transparent systems",
    "Accessible government",
    "Non-partisan leadership",
    "People over Politics",
  ] as const,

  motion: {
    kicker: "Across Arkansas",
    title: "On the Road Across Arkansas",
    introWithFeed:
      "This campaign is underway in person—listening in communities, traveling the state, and publishing where we’ve been so you can follow along.",
    introPlaceholder:
      "When public events and trail updates are posted, they’ll appear here. Until then, you can still see where to show up and how to follow the journey—no invented stops, no filler.",
    placeholderNoteTitle: "Trail feed",
    placeholderNoteBody:
      "No preview items in this environment yet, or live content isn’t connected. The links below stay accurate.",
    followCta: "Follow the Journey",
    followHref: "/from-the-road",
    placeholderSecondaryCta: "Events calendar",
    placeholderSecondaryHref: "/events",
  },

  finalCta: {
    title: "Learn the story. Understand the office. Join the work.",
    body:
      "Take it one step at a time. Read Kelly’s story, learn what this office actually does, and lend a hand only if it fits your life.",
    ctas: {
      meetKelly: "Meet Kelly",
      voteRegister: "Vote / Register",
      volunteer: "Volunteer",
    },
  },
} as const;
