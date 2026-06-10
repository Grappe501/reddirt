/**
 * Journey page — expanded life story (non-chronological hub with arc links).
 * Manuscript-derived claims marked draft until campaign review.
 */

export const meetKellyJourneyCopy = {
  hero: {
    eyebrow: "Meet Kelly",
    title: "Her journey",
    subtitle:
      "From Tennessee roots to Arkansas home—from hearth speeches and band rows to corporate training rooms and Rose Bud soil. Not every detail is public-ready; manuscript chapters remain draft until Kelly approves.",
  },
  arcs: [
    {
      title: "Roots & voice",
      body:
        "Selmer, Tennessee; extended family; 4-H public speaking; father's work with Modern Woodmen; first Arkansas road trip before the move. Sylvan Hills High School—band, yearbook editor, prom committee.",
      href: "/about/story",
      hrefLabel: "Trust & story chapter",
      status: "NEEDS KELLY APPROVAL" as const,
    },
    {
      title: "Career & systems",
      body:
        "Alltel and Verizon operations—training rooms, team leadership, process discipline. The career that maps to running a constitutional office serving businesses statewide.",
      href: "/about/business",
      hrefLabel: "Business & process chapter",
      status: "NEEDS SOURCE" as const,
    },
    {
      title: "Family & land",
      body:
        "Kelly and Steve, Grace, Rose Bud and Forevermost Farms—the small market, hard seasons, and stewardship when the math changes.",
      href: "/about/forevermost",
      hrefLabel: "Forevermost Farms chapter",
      status: "NEEDS KELLY APPROVAL" as const,
    },
    {
      title: "Long-form manuscript",
      body:
        "Eight literary chapters plus epilogue—draft narrative for campaign review. Not linked publicly until depth gate opens.",
      href: null,
      hrefLabel: null,
      status: "DRAFT" as const,
    },
  ],
  learnings: [
    "Systems must respect people—not the other way around.",
    "Small businesses feel every friction in paperwork and process.",
    "Democracy is a skill neighbors will practice when the work is intelligible.",
    "Leadership often lives in temporary rooms—duplex offices, training floors—not monuments.",
  ],
} as const;

export const meetKellyCommunityCopy = {
  hero: {
    eyebrow: "Meet Kelly",
    title: "Community & civic work",
    subtitle:
      "Organizations Kelly helps lead, grassroots petition work, and civics as skill-building—not performance. Specific initiative claims require Kelly approval before publication.",
  },
  sections: [
    {
      title: "Stand Up Arkansas",
      body:
        "Nonprofit civic organization focused on voter education and community engagement—recruiting, training, and activating leaders across the state.",
      href: "https://www.standuparkansas.com/",
      hrefLabel: "standuparkansas.com",
      chapterHref: "/about/stand-up-arkansas",
      status: "VERIFIED" as const,
    },
    {
      title: "Ballot petitions & LEARNS",
      body:
        "After the LEARNS Act, Kelly and neighbors organized referendum and initiative support—including a temporary Sherwood office for petition packets and notaries. Timeline and scope need campaign verification.",
      href: "/about/initiatives-petitions",
      hrefLabel: "Initiatives & petitions chapter",
      status: "NEEDS KELLY APPROVAL" as const,
    },
    {
      title: "Forevermost Farms & local market",
      body:
        "Family farm and market in Rose Bud—ground truth for small-business filers and rural community texture.",
      href: "https://forevermostfarms.com/",
      hrefLabel: "forevermostfarms.com",
      chapterHref: "/about/forevermost",
      status: "VERIFIED" as const,
    },
  ],
} as const;
