/** Plain-language Victory Contribution Index (VCI) — used across battlefield and county strategy UI. */

export const VCI_EXPLAINER = {
  acronym: "VCI",
  fullName: "Victory Contribution Index",
  oneLine:
    "A planning score for each county: how many votes Kelly can realistically add there through recovery, registration, persuasion, and city influence.",
  plainEnglish:
    "VCI answers one question for campaign leadership: if we invest time and money in this county, how much does it move the needle toward winning? Higher VCI = more expected votes from that county’s mix of Democratic drop-off recovery, new registrations, Republican/independent persuasion, and top-city turnout work.",
  formulaLabel: "How VCI is calculated (planning model)",
  formula:
    "Lane 2 @ 50% recovery + registration goal + GOP conversion @ 12% peel + city influence votes",
  formulaNote:
    "These are campaign planning inputs from the four-lane model — not election results, not a public polling number, and not a promise of actual turnout.",
  uses: [
    "Rank all 75 counties for travel, staff time, and volunteer priority",
    "Group counties into nine battlefield clusters and set recommended visit counts",
    "Assign each county a primary mission (recovery, registration, persuasion, etc.)",
    "Size registration goals and week-plan county targets",
  ],
  notWhatItIs: [
    "Not a vote count on Election Day",
    "Not a public opinion poll",
    "Not a substitute for relationships on the ground",
  ],
} as const;

export function vciLabelShort(): string {
  return `${VCI_EXPLAINER.acronym} (${VCI_EXPLAINER.fullName})`;
}
