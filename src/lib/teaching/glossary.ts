/**
 * Shared copy for inline teaching (hover/focus definitions). Keep sentences short; no unsourced claims.
 */
export const GLOSSARY = {
  powerOf5: {
    label: "Power of 5",
    definition:
      "A relational organizing habit: each volunteer intentionally grows and tends a small circle (often around five people) with clear invites, follow-ups, and dignity—not a public leaderboard.",
    hint: "You will see demo numbers on public pages until live signup data connects.",
  },
  organizingIntelligence: {
    label: "organizing intelligence",
    definition:
      "The campaign’s honest map of scale, coverage, and relational depth—aggregate and regional, not individual voter surveillance on the open web.",
    hint: "OIS pages label what is registry-derived vs demo so you can learn the model without mistaking samples for live file data.",
  },
  demoSeed: {
    label: "demo / seed",
    definition:
      "Illustrative figures and labels used to show how a dashboard will read once real field data is approved and piped in.",
    hint: "Treat these as teaching scaffolding, not election outcomes or private voter stats.",
  },
  campaignRegion: {
    label: "campaign region",
    definition:
      "One of eight Arkansas field buckets used for stakeholder storytelling and rollups (e.g. River Valley, Northwest Arkansas). Counties stay on the official 75-county registry.",
    hint: "Region names are for organizers and voters learning the map—not separate secret geographies.",
  },
  relationalDepth: {
    label: "relational depth",
    definition:
      "How much organizing runs through real conversations and follow-ups versus one-off contacts—captured as aggregate patterns, not dossiers.",
    hint: "You will see this idea in KPI strips and Power of 5 panels—always labeled when numbers are illustrative.",
  },
} as const;

export type GlossaryTermId = keyof typeof GLOSSARY;
