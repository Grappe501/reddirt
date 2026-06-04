/**
 * Strategic OFFENSIVE debate plan — record-based, Kelly superiority, Packo alliance lane.
 * INTERNAL strategy doc — public lines must pass claims gate.
 */

export const KELLY_SUPERIORITY_PILLARS = {
  headline: "The only candidate running to administer — not to perform outrage",
  forThePeople: [
    "Non-partisan in deed: serve all 75 counties, all parties, all lawful petition drives.",
    "For the people = clerks get a partner, voters get readable rules, volunteers get fair notice.",
    "Road stories over insults — Kelly listens; Hammer legislates; Pakko analyzes.",
  ],
  vsHammer: "Record shows rule-after-rule without implementation partnership — SOS is service, not authorship.",
  vsPacko: "Respect reform voice; Kelly will run the office daily — Pakko will not.",
};

export const OFFENSIVE_OPENING_HEELS = {
  headline: "Put Hammer on his heels from the first answer — stay calm, stay factual",
  minuteOneMoves: [
    "Thank moderator and voters — no opponent names in first 15 seconds.",
    "Second sentence: 'This office is who answers the phone when a county clerk gets a new mandate.'",
    "Third: 'Senator Hammer has spent years writing election law — I am asking to help counties live under it.'",
    "Optional fourth (if petition question likely): 'Arkansas voters cherish ballot measures — I will not trade away direct democracy for slogans.'",
  ],
  firstTrapWithin90s:
    "If Hammer speaks before you on integrity: 'I agree on integrity — show us the funding line for clerks implementing your last act.'",
  tone: "Offensive on record, never offensive on person. Slow. Methodical. Assured.",
};

export const ANYTHING_BUT_HAMMER_STRATEGY = {
  phase: "Roll out slowly — internal now, public later in cycle",
  electoralMath:
    "Target 10–12% GOP breakaway to Libertarian column — reduces Hammer ceiling; plurality math favors Kelly when L pulls soft Republicans.",
  publicMessagingPhases: [
    {
      phase: "Debate week",
      message: "Respect Dr. Pakko; contrast Hammer record vs Kelly service — do not say 'vote L' on stage yet.",
    },
    {
      phase: "Late October",
      message: "Republicans uncomfortable with petition restrictions may choose a competent Libertarian over Hammer — anything but Hammer's record on direct democracy.",
    },
    {
      phase: "GOTV",
      message: "Cannot vote Democrat? Vote for Arkansas's future SOS administrator — or Libertarian — not the senator who led the petition squeeze.",
    },
  ],
  packoFriendlyLines: [
    "Dr. Pakko and I both believe voters deserve more than a two-party duopoly — the difference is I am running to administer elections in all seventy-five counties every day.",
    "If you want election reform ideas, listen to Dr. Pakko. If you want a Secretary of State who shows up for clerks, that's my job.",
    "I am not asking anyone to leave their party — I am asking you to look at who will actually run the office.",
  ],
  doNotSayYet: [
    "Explicit 'vote Libertarian' from Kelly mouth in three-way debate (sounds coordinated).",
    "Call Hammer dangerous as a person — use 'dangerous to direct democracy rights' with act cites.",
    "Attack Pako economics platform — irrelevant to SOS duties.",
  ],
};

export const RECORD_OFFENSE_PLAYBOOK = {
  headline: "Use the record to attack the job he did — not the pastor, not the person",
  lanes: [
    {
      lane: "Direct democracy corner",
      acts: ["218", "240", "274", "241", "279", "764", "768"],
      hammerPaint: "Led charge to restrict signature gathering and local initiatives (media framing + bill pattern).",
      kellyExit: "I defend referendum rights and integrity together — publish rules, fund clerks.",
    },
    {
      lane: "Implementation dare",
      acts: ["350", "444", "279"],
      hammerPaint: "Authored without SOS-style implementation plan.",
      kellyExit: "Kelly hotline, training calendar, quorum-court funding advocacy.",
    },
    {
      lane: "2021 six-bill package continuity",
      acts: ["727", "728", "729", "730", "731"],
      hammerPaint: "Cannot claim 2025 is a fresh start.",
      kellyExit: "Pattern → Kelly breaks pattern with service.",
    },
  ],
  closingSuperiority:
    "Voters should leave knowing Kelly is the best prepared to serve — non-partisan in practice, for the people, proven listener on the road, and disciplined on facts.",
};

export const OFFENSIVE_OPENING_30 = {
  text: "I'm Kelly Grappe. I'm running for Secretary of State because clerks across Arkansas told me they need a statewide partner — not another rule from the Capitol without training or a phone number that answers. Senator Hammer wrote a lot of election law. I am asking to help people live under it fairly — in every county, every party. Ask me about the acts — I'll answer directly.",
  delivery: "Slower than feels natural. Hammer name once only. 'Acts' signals readiness.",
};

export const ROAD_STORY_INTEGRATION = {
  headline: "Lean into road stories — they prove 'for the people'",
  rules: [
    "One story per answer max — 15 seconds, then act number.",
    "Always permission-based counties in public — or generic 'a clerk in south Arkansas'.",
    "Pair story with direct democracy or county burden theme when attacking record.",
  ],
};
