/**
 * Journey & community drill-down copy (level 2 — no third-level chapter routes).
 */

export const meetKellyJourneyCopy = {
  hero: {
    eyebrow: "Meet Kelly",
    title: "Her journey",
    subtitle:
      "From Tennessee roots to Arkansas home—from hearth speeches and band rows to corporate training rooms and Rose Bud soil. Campaign-facing summary; long-form manuscript stays offline until Kelly approves.",
  },
  arcs: [
    {
      title: "Roots & voice",
      body:
        "Selmer, Tennessee; extended family; 4-H public speaking; father's work with Modern Woodmen; first Arkansas road trip before the move. Sylvan Hills High School—band, yearbook editor, prom committee. Voters deserve to know the person behind the office—not a performance biography.",
      status: "NEEDS KELLY APPROVAL" as const,
    },
    {
      title: "Career & systems",
      body:
        "Nearly 25 years with Alltel and Verizon in operations leadership—training rooms, team leadership, process discipline. The career that maps to running a constitutional office serving businesses statewide. Kelly also knows the other side of the counter: a small market and farm operations where permits, cash flow, and paperwork friction are daily reality.",
      status: "NEEDS SOURCE" as const,
    },
    {
      title: "Family & land",
      body:
        "Kelly and Steve, Grace, Rose Bud and Forevermost Farms—the small market, hard seasons, and stewardship when the math changes. Integrity when costs shift and the work still has to be done.",
      status: "NEEDS KELLY APPROVAL" as const,
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
      status: "VERIFIED" as const,
    },
    {
      title: "Ballot petitions & LEARNS",
      body:
        "After the LEARNS Act, Kelly and neighbors organized referendum and initiative support—including a temporary Sherwood office for petition packets and notaries. Timeline and scope need campaign verification. Democracy starts local; citizen-led work stays volunteer-centered.",
      href: "/direct-democracy/ballot-initiative-process",
      hrefLabel: "How initiatives reach the ballot",
      status: "NEEDS KELLY APPROVAL" as const,
    },
    {
      title: "Forevermost Farms & local market",
      body:
        "Family farm and market in Rose Bud—ground truth for small-business filers and rural community texture.",
      href: "https://forevermostfarms.com/",
      hrefLabel: "forevermostfarms.com",
      status: "VERIFIED" as const,
    },
  ],
} as const;
