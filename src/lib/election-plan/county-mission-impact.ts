import { COUNTY_COVERAGE_EXPLAINER } from "@/lib/election-plan/location-links";
import { COUNTY_TIER_GUIDANCE } from "@/lib/election-plan/county-playbook-operator-guide";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { FOUR_LANE_DEFINITIONS } from "@/lib/election-plan/four-lanes-labels";
import type { CountyVictoryTarget } from "@/lib/election-plan/load-county-victory-targets";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import type { ElectionPlanCounty } from "@/lib/election-plan/types";
import { VCI_EXPLAINER } from "@/lib/election-plan/vci-explainer";

const TIER_VISIT_PLAN: Record<string, number> = {
  A: 5,
  B: 3,
  C: 2,
  D: 1,
};

export type CountyMissionImpact = {
  primaryTitle: string;
  primaryLaneLabel: string;
  primaryExplanation: string;
  primaryVoteLine: string;
  secondaryTitle: string;
  secondaryExplanation: string;
  secondaryVoteLine: string;
  cadenceHeadline: string;
  cadenceDetail: string;
  victoryImpactLine: string;
  volunteerThisWeek: string[];
  tierGuidance: string;
};

function missionLaneKey(mission: string): "lane2" | "lane3" | "lane4" | "po5" | null {
  const m = mission.toLowerCase();
  if (m.includes("lane 2") || m.includes("recovery") || m.includes("drop-off")) return "lane2";
  if (m.includes("registration") || m.includes("lane 3")) return "lane3";
  if (m.includes("republican") || m.includes("persuasion") || m.includes("conversion") || m.includes("outreach")) {
    return "lane4";
  }
  if (m.includes("power of 5") || m.includes("po5") || m.includes("organizing")) return "po5";
  return null;
}

function laneVoteLine(
  lane: "lane2" | "lane3" | "lane4" | "po5",
  county: ElectionPlanCounty,
  rates: { lane2: number; lane3: number; lane4: number },
): string {
  if (lane === "lane2") {
    const expected = Math.round(county.lane2Recovery50 * rates.lane2);
    return `${formatVotes(county.lane2Recovery50)} Democratic drop-off pool (Lane 2 working goal) → ~${formatVotes(expected)} expected capture at ${Math.round(rates.lane2 * 100)}% achievement`;
  }
  if (lane === "lane3") {
    const expected = Math.round(county.registrationGoal * rates.lane3);
    return `${formatVotes(county.registrationGoal)} new registrations allocated (chapter 05) → ~${formatVotes(expected)} votes at ${Math.round(rates.lane3 * 100)}% Lane 3 achievement`;
  }
  if (lane === "lane4") {
    const expected = Math.round(county.gopConversionPotential * rates.lane4);
    return `${formatVotes(county.gopConversionPotential)} persuasion pool (12% peel model) → ~${formatVotes(expected)} votes at ${Math.round(rates.lane4 * 100)}% conversion achievement`;
  }
  return `Relational depth — Power of Five circles turn trust into turnout where broadcast cannot reach`;
}

function missionPlainEnglish(mission: string, lane: ReturnType<typeof missionLaneKey>): string {
  if (lane === "lane2") {
    return "Win back Democrats who voted in recent statewide races but skipped the 2022 Secretary of State election — relational chase, not new registration.";
  }
  if (lane === "lane3") {
    return "Add eligible voters through deputy registrar partnerships, fairs, campuses, and Help 10 Participate — every registration check counts toward the county goal.";
  }
  if (lane === "lane4") {
    return "Relationship persuasion with moderate Republicans and independents — validator-led conversations, not attack ads.";
  }
  if (lane === "po5") {
    return "Build Power of Five circles — each core supporter brings five trusted conversations — to multiply field capacity in smaller counties.";
  }
  return `Execute ${mission} with county-specific relationships and verified data — see Path to Victory drill-down for lane math.`;
}

function secondaryPlainEnglish(mission: string, lane: ReturnType<typeof missionLaneKey>): string {
  if (mission.toLowerCase().includes("volunteer")) {
    return "This county also produces volunteers, Po5 leaders, and house party hosts for the statewide field — Tier A/B counties are volunteer factories for the rest of Arkansas.";
  }
  return missionPlainEnglish(mission, lane);
}

function expandRecommendedAction(county: ElectionPlanCounty): string[] {
  const planned = TIER_VISIT_PLAN[county.tier] ?? 1;
  const visitsGap = Math.max(0, planned - county.coverageCompleted);
  const actions: string[] = [];

  const primaryLane = missionLaneKey(county.primaryMission);
  if (primaryLane === "lane2") {
    actions.push("Pull chapter-04 drop-off list for this county and assign relational owners (internal tools only — no PII on public pages).");
    actions.push("Schedule Po5 check-ins: each leader owes five conversations toward the county recovery goal.");
  } else if (primaryLane === "lane3") {
    actions.push("Report registration pace vs. county allocation — use the Lane 3 panel and Help 10 Participate weekly tally.");
    actions.push("Confirm one deputy registrar or clerk partnership event on the county calendar.");
  } else if (primaryLane === "lane4") {
    actions.push("Identify two local validators (veteran, business, faith) for persuasion conversations — document in field entry.");
    actions.push("Pair every persuasion touch with a ballot-plan ask for a specific election date.");
  } else {
    actions.push("Stand up at least one new Power of Five circle and log aggregate counts in field entry.");
  }

  if (visitsGap > 0) {
    actions.push(
      `Close the visit gap: ${county.coverageCompleted}/${planned} Tier ${county.tier} contacts complete — schedule ${visitsGap} more before expanding secondary lanes.`,
    );
  } else {
    actions.push(`Visit cadence on track (${county.coverageCompleted}/${planned}) — shift surplus capacity to ${county.secondaryMission.toLowerCase()}.`);
  }

  if (county.guardrailStatus !== "ok") {
    actions.push(`Guardrail ${county.guardrailStatus} — fix visit pacing before adding new programs.`);
  }

  return actions.slice(0, 4);
}

function cadenceHeadline(county: ElectionPlanCounty): string {
  const planned = TIER_VISIT_PLAN[county.tier] ?? 1;
  if (county.recommendedAction.toLowerCase().includes("priority visit")) {
    return `Priority visit county — field presence behind plan`;
  }
  if (county.recommendedAction.toLowerCase().includes("maintain")) {
    return `Maintain Tier ${county.tier} cadence — stay on the visit plan`;
  }
  return county.recommendedAction;
}

function cadenceDetail(county: ElectionPlanCounty): string {
  const planned = TIER_VISIT_PLAN[county.tier] ?? 1;
  const pct = county.coveragePct;
  return (
    `Tier ${county.tier} counties plan ${planned} Kelly/field visit contacts. ` +
    `${county.county} is at ${county.coverageCompleted}/${planned} (${pct}%). ` +
    COUNTY_COVERAGE_EXPLAINER
  );
}

export function buildCountyMissionImpact(
  county: ElectionPlanCounty,
  victoryTarget?: CountyVictoryTarget | null,
): CountyMissionImpact {
  const data = loadElectionPlanSnapshot();
  const rates = data.lanesOverview.achievementRates;
  const primaryLane = missionLaneKey(county.primaryMission);
  const secondaryLane = missionLaneKey(county.secondaryMission);

  const primaryLaneLabel =
    primaryLane === "lane2"
      ? FOUR_LANE_DEFINITIONS.lane2.fullLabel
      : primaryLane === "lane3"
        ? FOUR_LANE_DEFINITIONS.lane3.fullLabel
        : primaryLane === "lane4"
          ? FOUR_LANE_DEFINITIONS.lane4.fullLabel
          : "Relational organizing";

  const victoryImpactLine = victoryTarget
    ? `County must add +${formatVotes(victoryTarget.growthNeeded)} votes (${victoryTarget.percentIncrease.toFixed(1)}% over baseline) — ~${formatVotes(victoryTarget.weeklyVoteGoal)}/week · ${victoryTarget.powerOf5LeadersNeeded} Po5 leaders`
    : `VCI #${county.vciRank} (${formatVotes(county.vci)}) — ${VCI_EXPLAINER.oneLine}`;

  return {
    primaryTitle: county.primaryMission,
    primaryLaneLabel,
    primaryExplanation: missionPlainEnglish(county.primaryMission, primaryLane),
    primaryVoteLine: primaryLane ? laneVoteLine(primaryLane, county, rates) : `VCI-ranked contribution: ${formatVotes(county.vci)}`,
    secondaryTitle: county.secondaryMission,
    secondaryExplanation: secondaryPlainEnglish(county.secondaryMission, secondaryLane),
    secondaryVoteLine: secondaryLane
      ? laneVoteLine(secondaryLane, county, rates)
      : "Supports statewide volunteer production and surplus capacity when primary lane is on pace.",
    cadenceHeadline: cadenceHeadline(county),
    cadenceDetail: cadenceDetail(county),
    victoryImpactLine,
    volunteerThisWeek: expandRecommendedAction(county),
    tierGuidance: COUNTY_TIER_GUIDANCE[county.tier] ?? COUNTY_TIER_GUIDANCE.D,
  };
}
