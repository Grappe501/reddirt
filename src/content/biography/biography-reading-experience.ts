/**
 * Copy for the immersive /biography reading experience (intro + earned conversion).
 * Facts stay in chapter markdown; this file is framing only.
 */
export const biographyReadingIntro = {
  title: "The Road That Brought Her Here",
  intro:
    "This is the longer narrative—offered without hurry, for anyone who has already walked a few pages with Kelly. Read straight through or pick up wherever your curiosity lands. The chapters are the story; what you find here only clears space for the reading.",
  beginCta: "Begin the Story",
} as const;

export const biographyConversionCopy = {
  title: "If This Story Meant Something to You",
  bridge:
    "You’ve come to the end of the chapters—calmly, the way long stories deserve. If what you read cleared something up—or stirred something worth acting on—here is a simple way to step in. No pressure; only an honest next step if it fits.",
  why: {
    title: "Why",
    body:
      "This campaign is about protecting an office that belongs to everyone: transparent elections, voter access, voter privacy, and non-partisan administration under Arkansas law. People over Politics is the standard Kelly asks to be held to—not decoration.",
  },
  how: {
    title: "How",
    body:
      "We win by building trust one relationship, one county, one conversation at a time. No shortcut around showing up.",
  },
  what: {
    title: "What you can do next",
    cards: [
      {
        title: "Volunteer",
        body:
          "Volunteers widen the circle—host a gathering, make calls, knock doors, help at events, tell the story in your own community, and bring people into the work without treating anyone like a number.",
        cta: "Volunteer",
      },
      {
        title: "Bring 5 Friends",
        body:
          "If this story gave you confidence in Kelly, bring five people with you. Send them this story. Invite them to an event. Ask them to vote. Then ask them to bring five more.",
        cta: "Share the Story",
      },
      {
        title: "Donate",
        body:
          "Giving is never the whole story—but it keeps hard things possible: statewide travel, printed materials, voter education, organizing tools, digital infrastructure, and work that reaches all 75 counties. Chip in if it sits right with you.",
        cta: "Donate",
      },
    ] as const,
  },
} as const;
