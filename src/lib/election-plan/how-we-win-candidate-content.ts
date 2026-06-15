/** How We Win — Kelly Grappe (Candidate Version). Source: executive-narrative/candidate-version.md */

export const HOW_WE_WIN_CANDIDATE = {
  title: "How We Win",
  subtitle: "Kelly Grappe · Candidate version",
  tagline: "Your north star for every room — 10 minutes, from the heart.",
  opening: {
    lead: "Arkansas 2026 is not a majority-or-nothing race. It's a plurality race. Three names on the ballot. Largest coalition wins.",
    body: "I'm not asking Arkansas to become a different state overnight. I'm asking us to assemble the coalition that already exists — and add to it.",
  },
  threeTruths: [
    {
      headline: "102,000 Democrats",
      body: "voted in 2024 but skipped the 2022 midterm. They're not strangers. They're our people. We bring them back first.",
    },
    {
      headline: "50,000 registrations",
      body: "sounds impossible until you hear 2,500 a week. That's achievable in every county.",
    },
    {
      headline: "Relationships beat television.",
      body: "Power of 5. Clerks. Fairs. Faith. Eyeball to eyeball.",
    },
  ],
  winningPaths: [
    { label: "Working goal", votes: "400,000+" },
    { label: "Expected scenario", votesKey: "expectedProjection" as const },
    { label: "Plurality range", votesKey: "pluralityRange" as const },
  ],
  fourLanesScript: [
    { action: "Hold", detail: "our Democrats" },
    { action: "Bring back", detailKey: "recovery50" as const },
    { action: "Register", detail: "50,000 new voters" },
    { action: "Convert", detail: "through trust — not attacks" },
  ],
  close:
    "Recover Democrats → Register new voters → Build relationships → Split the opposition → Win the largest coalition.",
  voiceNote:
    "Big Table Democrat — working-class Democrat · bigger table · dignity for all Arkansans.",
} as const;
