/**
 * COUNTY-INTEL-2 — "How we win" narrative from aggregate data only.
 */

import type { CountyPoliticalProfileResult } from "./county-political-profile";

export const COUNTY_WIN_STRATEGY_PACKET = "COUNTY-INTEL-2-WIN" as const;

export type CountyWinStrategy = {
  packet: typeof COUNTY_WIN_STRATEGY_PACKET;
  turnoutOpportunity: string;
  registrationOpportunity: string;
  volunteerOpportunity: string;
  coalitionOpportunity: string;
  messageFrame: string;
  next7Days: string[];
  next30Days: string[];
  conventionAsks: string[];
  noIndividualTargeting: string;
  generatedAt: string;
};

export function buildCountyWinStrategy(profile: CountyPoliticalProfileResult): CountyWinStrategy {
  const now = new Date().toISOString();
  const county = profile.county?.displayName ?? "this county";
  const wn = profile.winNumberModel.majorityWinNumber;
  const exp = profile.winNumberModel.expectedTotalVotes;
  return {
    packet: COUNTY_WIN_STRATEGY_PACKET,
    turnoutOpportunity: `In ${county}, bridge the aggregate general-vs-primary and presidential-vs-midterm gaps (see turnout drop-off analysis) with relational follow-up, neighbor-to-neighbor reminders, and clear vote-plan help — we plan on ~${wn ?? "—"} votes if comparable turnout is ${exp ?? "—"} ballots, subject to the target election and verification.`,
    registrationOpportunity:
      "Expand the denominator of possible voters with legal, nonpartisan registration work where the law allows, neighbor drives, and coalition tables — see the 50K statewide goal as a field organizing anchor, with county share estimated from file totals when the pipeline is current.",
    volunteerOpportunity:
      "Build capacity through hosts, sign-up links on kellygrappe.com, and local leaders who can train others — staff-only tools handle coordinated tasks and **aggregate** review, not person-level public targeting.",
    coalitionOpportunity:
      "Unite good-government, small-business, faith, and civic groups around transparent elections and professional administration of the SoS office — all messaging stays verifiable; opposition research is title/metadata until Arkleg text review.",
    messageFrame: `People over politics — a Secretary of State who runs elections and public records with competence and transparency, starting with ${county}’s own turnout story, not with imported spin.`,
    next7Days: [
      "Publish this briefing to leaders with sources attached.",
      "One public verification pass on a flagged bill (title to full text on Arkleg).",
      "One registration or civic partner touch (nonpartisan where required by context).",
      "Log aggregate volunteer asks only in approved tools; no PII in static sites.",
    ],
    next30Days: [
      "Backfill missing ACS/BLS or voter-file snapshots so KPI lines move from 'missing' to 'current'.",
      "Re-run drop-off and plurality math after the next major election ingest or primary.",
      "Train five county leads on the Power of Five as relationship capacity, not a voter score.",
    ],
    conventionAsks: [
      "Adopt a county field plan that references **only** aggregate tables in public materials.",
      "Sponsor a nonpartisan registration table (where lawful) and route sign-ups to kellygrappe.com for volunteer follow-up.",
      "Contribute at least one verified opposition talking point to the research queue — cite Arkleg, not social rumor.",
    ],
    noIndividualTargeting:
      "This strategy section intentionally avoids individual persuasion labels, partisanship from geography, or public lists. Use governed internal tools and law-compliant registration programs for anything person-specific.",
    generatedAt: now,
  };
}
