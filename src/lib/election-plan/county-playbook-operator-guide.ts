/** Static operator instruction copy for county playbook surfaces (Election Plan lane). */

export const COUNTY_PLAYBOOK_LAYERS = [
  {
    id: "ch9",
    label: "Chapter 9 · County operating playbook",
    route: "operating-center",
    detail: "Mission table, electoral summary, Top-40 cities, field targets, fair & clerk hooks.",
  },
  {
    id: "ch4",
    label: "Chapter 4 · Democratic drop-off",
    route: "drop-off",
    detail: "Lane 2 recovery — where 2022/2024 Democratic voters stayed home and how to win them back.",
  },
  {
    id: "ch5",
    label: "Chapter 5 · Registration dashboard",
    route: "registration-dashboard",
    detail: "Lane 3 expansion — new voter pace, Help 10 Participate, county registration allocation.",
  },
] as const;

export const COUNTY_WEEKLY_OPERATOR_FLOW = [
  {
    step: 1,
    title: "Pick your county & read the mission",
    detail: "Open the operating center. Confirm tier, VCI rank, primary mission, and victory target on the overview.",
  },
  {
    step: 2,
    title: "Study electoral math (Ch. 4 + Ch. 5)",
    detail: "Drop-off tells you who to win back; registration dashboard tells you who to add. Cross-check numbers before any public line.",
  },
  {
    step: 3,
    title: "Align leadership & party intel",
    detail: "County chair contact, strike team roster, immersion mission, and networking contacts — assign owners before field.",
  },
  {
    step: 4,
    title: "Run field & Mobilize cadence",
    detail: "Log field entry, bind calendar week plans, activate Po5 leaders, and create Mobilize events from Brain priorities.",
  },
  {
    step: 5,
    title: "Close the loop",
    detail: "Upload county media to the vault, log event outcomes, and update registration allocation vs. weekly pace.",
  },
] as const;

export const MOBILIZE_COUNTY_PLAYBOOK_STEPS = [
  "County Captain approves event from Brain priority list",
  "Events Captain creates Mobilize event from category template",
  "Volunteer Captain fills shifts · recruits from Power of 5",
  "Faith / Postcard / Phone captains activate parallel programs if applicable",
  "Media Captain assigns Substack story after event",
  "Log outcomes in event-outcomes workflow (field entry + calendar truth)",
] as const;

export const COUNTY_TIER_GUIDANCE: Record<string, string> = {
  A: "Tier A — maximum visit cadence, full strike team, Top-40 city focus, chair alignment weekly.",
  B: "Tier B — strong Po5 + fair presence; Ch. 4 drop-off recovery is usually the fastest vote path.",
  C: "Tier C — registration (Lane 3) and clerk partnerships often outperform persuasion spend.",
  D: "Tier D — protect guardrails; one proof event + one registration path beats scattered activity.",
};

export const CH4_READING_GUIDE = [
  "Start with the county vote table — note Democratic baseline vs. 2022/2024 turnout.",
  "Identify the largest drop-off buckets (age, precinct, or city) before writing field targets.",
  "Crosswalk recovery scenarios to Lane 2 on the county overview — do not double-count with registration.",
  "Any contrast line for stage must pass claims gate — use research-question framing until verified.",
] as const;

export const CH5_READING_GUIDE = [
  "Compare registration goal to current pace on the county registration allocation panel.",
  "Use Help 10 Participate doctrine — ten conversations that each recruit ten participants.",
  "Tie campus and fair calendars to registration windows in the field section.",
  "Report weekly pace to the registration goals OS — county chairs expect percent-to-goal language.",
] as const;
