/**
 * Copy for the immersive /biography reading experience (intro + earned conversion).
 * Facts stay in chapter markdown; this file is framing only.
 */
export const biographyReadingIntro = {
  title: "The Road That Brought Her Here",
  intro:
    "This is the longer narrative—offered without hurry for anyone who has already walked a few pages with Kelly. Take it in order, or pick up wherever your curiosity lands. The chapters are the story; everything here serves the reading.",
  beginCta: "Begin the Story",
} as const;

export const biographyConversionCopy = {
  title: "If This Story Meant Something to You",
  why: {
    title: "Why",
    body:
      "This campaign is about building an office that works for everyone—transparent elections, protected voter access, and non-partisan administration under Arkansas law. People over Politics is not a slogan here; it is the standard Kelly means to hold.",
  },
  how: {
    title: "How",
    body:
      "We win by building trust the same way this story was built: one relationship, one county, one conversation at a time. No shortcut around showing up.",
  },
  what: {
    title: "What you can do next",
    cards: [
      {
        title: "Volunteer",
        body:
          "Volunteers help reach neighbors who do not always get asked—events, calls, doors, host-at-home gatherings, and carrying this story into your own community with respect and clarity.",
        cta: "Volunteer",
      },
      {
        title: "Donate",
        body:
          "Contributions keep statewide travel, voter education, organizing tools, printed materials, events, digital infrastructure, and reach into all 75 counties possible—without pretending money is the only thing that matters.",
        cta: "Donate",
      },
      {
        title: "Bring 5 Friends",
        body:
          "If this story gave you confidence in Kelly, bring five people with you. Send them the story. Invite them to an event. Ask them to vote. Ask them to bring five more.",
        cta: "Share the Story",
      },
    ] as const,
  },
} as const;
