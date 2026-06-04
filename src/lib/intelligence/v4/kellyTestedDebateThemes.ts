/**
 * Field-tested Kelly themes — strong reaction in independent and Republican rooms statewide.
 * INTERNAL · verify Civic Index citation in claims before any broadcast use.
 */

export type KellyTestedTheme = {
  id: string;
  label: string;
  fieldNote: string;
  debateLine30s: string;
  debateLine60s: string;
  freshAddWhenSecond: string;
  freshAddWhenThird: string;
  claimsGate: string;
};

export const KELLY_FIELD_TESTED_THEMES: KellyTestedTheme[] = [
  {
    id: "unity-across-aisle",
    label: "Transparency · accountability · bring people together",
    fieldNote:
      "Tested to GREAT reaction in independent and Republican rooms — lean in. Contrast division in politics with SOS as honest broker, not another partisan pulpit.",
    debateLine30s:
      "Arkansas does not need more division from this office — we need transparency, accountability, and leaders who work across the aisle so voters can trust the process again.",
    debateLine60s:
      "I have heard the same thing in county courthouses and community rooms across this state: people are tired of being divided against each other. The Secretary of State should model transparency and accountability — and work with anyone, Republican, Democrat, or independent, who wants fair rules clerks can implement. That is how you bring people together instead of widening the split we see in Little Rock.",
    freshAddWhenSecond:
      "I agree we need secure elections — and I add this: the office must be a place that builds trust across the aisle, not another stage for culture-war headlines.",
    freshAddWhenThird:
      "Fresh close: voters told me they want an SOS who unites Arkansas around clear rules — not a legislator who keeps picking fights.",
    claimsGate: "Tone OK — do not name opponents' motives without sourced quotes.",
  },
  {
    id: "nonpartisan-office",
    label: "Keep this office non-partisan",
    fieldNote: "Resonates everywhere — pair with transparent ballot administration, not partisan enforcement.",
    debateLine30s:
      "The Secretary of State must stay non-partisan in how ballots are administered — equal rules, published guidance, and no thumb on the scale for either party.",
    debateLine60s:
      "This office is not a campaign headquarters. It is where Arkansas certifies elections, trains clerks, and answers when rules change. I will keep administration non-partisan, publish what voters need to know, and let legislators debate policy — while the SOS makes implementation fair in all seventy-five counties.",
    freshAddWhenSecond:
      "Non-partisan administration is not a slogan — it is published checklists, clerk training, and audits voters can understand.",
    freshAddWhenThird:
      "Remember: non-partisan service desk — not bully pulpit for one party.",
    claimsGate: "OK — avoid implying opponent is personally corrupt without evidence.",
  },
  {
    id: "public-education",
    label: "SOS must educate the public",
    fieldNote: "Ties SOS statutory role to civic literacy — contrast with performative integrity talk.",
    debateLine30s:
      "The Secretary of State is responsible for educating the public — plain-English voter guides, business filing help, and honest answers when laws change.",
    debateLine60s:
      "When citizens cannot find the rules, participation collapses. I will run an education-first SOS: online guides, clerk partnerships, and public meetings so voters and entrepreneurs understand their rights and responsibilities — not another year of confusion.",
    freshAddWhenSecond:
      "Agree confidence matters — fresh add: education is how you earn it, not slogans.",
    freshAddWhenThird:
      "Close: educate first, administer fairly, support clerks — that is the job description voters expect.",
    claimsGate: "OK — cite SOS duties generally; verify specific program promises with staff.",
  },
  {
    id: "civic-index-accountability",
    label: "Arkansas Civic Index — accountability for results",
    fieldNote:
      "Arkansas ranks last in the country on the Arkansas Civic Index — staff frames as direct reflection on the administration of this office. VERIFY source/year before stage.",
    debateLine30s:
      "The Arkansas Civic Index ranks us last in civic health in this country — that is not a talking point, that is a report card on how this office has educated and engaged Arkansans.",
    debateLine60s:
      "When Arkansas finishes last in civic health, that is accountability for the Secretary of State's administration — not something to blame on voters. I will publish transparent civic goals, partner with schools and clerks, and measure progress so we are not last again.",
    freshAddWhenSecond:
      "I agree we need integrity — and I add: last-in-the-nation civic health means the SOS must educate and engage, not just police paperwork.",
    freshAddWhenThird:
      "Memorable close: last place is unacceptable — transparency, education, and non-partisan service are how we climb the index together.",
    claimsGate:
      "NEEDS_REVIEW: Confirm Arkansas Civic Index publisher, metric definition, year, and 'last in country' before broadcast. Hold exact rank until claims row VERIFIED.",
  },
];

/** One-line spine for panels and index banners */
export const KELLY_UNITY_SPINE =
  "Transparency · accountability · non-partisan administration · public education — work across the aisle to bring Arkansans together, not widen division.";

/** Weave into any answer after direct response */
export function kellyThemeBridge(topic: "turnout" | "nonpartisan" | "misinformation" | "opening" | "closing" | "general"): string {
  const civic = KELLY_FIELD_TESTED_THEMES.find((t) => t.id === "civic-index-accountability")!;
  const unity = KELLY_FIELD_TESTED_THEMES.find((t) => t.id === "unity-across-aisle")!;
  switch (topic) {
    case "turnout":
      return civic.debateLine30s;
    case "nonpartisan":
      return KELLY_FIELD_TESTED_THEMES.find((t) => t.id === "nonpartisan-office")!.debateLine30s;
    case "misinformation":
      return KELLY_FIELD_TESTED_THEMES.find((t) => t.id === "public-education")!.debateLine30s;
    case "opening":
      return unity.debateLine30s;
    case "closing":
      return `${unity.debateLine30s} That is the Secretary of State I am asking you to hire.`;
    default:
      return KELLY_UNITY_SPINE;
  }
}
