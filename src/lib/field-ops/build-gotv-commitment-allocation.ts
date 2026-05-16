import type { CountyWinTargetRow } from "@/lib/election-targets/win-target-types";
import type { CountyVolunteerCapacityRow } from "@/lib/field-ops/volunteer-capacity-types";
import {
  DEFAULT_GOTV_COMMITMENT_ASSUMPTIONS,
  type GotvCommitmentAllocationAssumptions,
  type GotvCommitmentAllocationFile,
  type GotvCommitmentAllocationRow,
} from "@/lib/field-ops/gotv-commitment-types";

export type CountyStatsForGotvAllocation = {
  county: string;
  registrationGoal?: number;
  volunteerTarget?: number;
  volunteerCount?: number;
  campaignVisits?: number;
  newRegistrationsSinceBaseline?: number;
  registrationBaselineDate?: string;
};

export type GotvAllocationBuildInput = {
  counties: readonly string[];
  winByCounty: Map<string, CountyWinTargetRow>;
  volunteerByCounty: Map<string, CountyVolunteerCapacityRow>;
  statsByCounty: Map<string, CountyStatsForGotvAllocation>;
  highValueEventCountByCounty: Map<string, number>;
  assumptions?: Partial<GotvCommitmentAllocationAssumptions>;
};

function mergeAssumptions(p: Partial<GotvCommitmentAllocationAssumptions> | undefined): GotvCommitmentAllocationAssumptions {
  return { ...DEFAULT_GOTV_COMMITMENT_ASSUMPTIONS, ...Object.fromEntries(Object.entries(p ?? {}).filter(([, v]) => v !== undefined)) };
}

function share(value: number | undefined, total: number): number {
  if (!value || value <= 0 || total <= 0) return 0;
  return value / total;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function largestRemainderRebalance(
  rows: Array<GotvCommitmentAllocationRow & { _raw: number; _minApplied: number }>,
  total: number,
): GotvCommitmentAllocationRow[] {
  const current = rows.reduce((s, r) => s + r.volunteerCommitmentTarget, 0);
  if (current < total) {
    const add = total - current;
    const ranked = [...rows].sort((a, b) => b._raw % 1 - (a._raw % 1));
    for (let i = 0; i < add; i++) ranked[i % ranked.length].volunteerCommitmentTarget += 1;
  } else if (current > total) {
    let remove = current - total;
    const ranked = [...rows].sort((a, b) => b.volunteerCommitmentTarget - a.volunteerCommitmentTarget);
    let guard = 0;
    while (remove > 0 && guard < total * 2) {
      for (const r of ranked) {
        if (remove <= 0) break;
        if (r.volunteerCommitmentTarget > r._minApplied) {
          r.volunteerCommitmentTarget -= 1;
          remove -= 1;
        }
      }
      guard += 1;
    }
  }
  return rows.map(({ _raw: _rawIgnored, _minApplied: _minIgnored, ...r }) => {
    const commitmentGap = Math.max(0, r.volunteerCommitmentTarget - (r.currentCommitments ?? 0));
    return {
      ...r,
      commitmentGap,
      estimatedRelationalCoverage: r.volunteerCommitmentTarget * DEFAULT_GOTV_COMMITMENT_ASSUMPTIONS.relationalPowerOfFive,
    };
  });
}

export function buildGotvCommitmentAllocation(input: GotvAllocationBuildInput): GotvCommitmentAllocationFile {
  const assumptions = mergeAssumptions(input.assumptions);
  const wins = input.counties.map((county) => input.winByCounty.get(county));
  const totalTargetGain = wins.reduce((s, w) => s + Math.max(0, w?.targetVoteGain ?? 0), 0);
  const totalRegistrationGoal = input.counties.reduce((s, county) => {
    const stats = input.statsByCounty.get(county);
    const win = input.winByCounty.get(county);
    return s + Math.max(0, stats?.registrationGoal ?? win?.registrationGoal ?? 0);
  }, 0);
  const totalTurnoutHeadroom = wins.reduce((s, w) => s + Math.max(0, w?.turnoutHeadroom ?? 0), 0);
  const totalHighValue = input.counties.reduce((s, c) => s + Math.max(0, input.highValueEventCountByCounty.get(c) ?? 0), 0);

  const rawComponents = input.counties.map((county) => {
    const win = input.winByCounty.get(county);
    const vol = input.volunteerByCounty.get(county);
    const stats = input.statsByCounty.get(county);
    const highValue = input.highValueEventCountByCounty.get(county) ?? 0;
    const registrationGoal = stats?.registrationGoal ?? win?.registrationGoal;
    const currentCommitments = stats?.volunteerCount ?? vol?.currentVolunteerCount;

    const targetVoteGainShare = share(win?.targetVoteGain, totalTargetGain);
    const registrationGoalShare = share(registrationGoal, totalRegistrationGoal);
    const turnoutHeadroomShare = share(win?.turnoutHeadroom, totalTurnoutHeadroom);
    const opportunityLoadShare = share(highValue, totalHighValue);
    const localInfrastructureGapShare = clamp01((vol?.localGuideNeed ?? 1) / 3);
    const lowTouchCountyBoost = clamp01(1 - Math.min(1, (stats?.campaignVisits ?? vol?.touchCountSinceNov1 ?? 0) / 5));
    const accessSupportNeedShare =
      vol?.hispanicCommunityAccessNeed === "needs_local_partner"
        ? 1
        : vol?.hispanicCommunityAccessNeed === "needs_bilingual_materials"
          ? 0.85
          : vol?.hispanicCommunityAccessNeed === "monitor"
            ? 0.45
            : 0.15;

    const countyVolunteerNeedWeight =
      0.35 * targetVoteGainShare +
      0.2 * registrationGoalShare +
      0.15 * turnoutHeadroomShare +
      0.1 * opportunityLoadShare +
      0.1 * localInfrastructureGapShare +
      0.05 * lowTouchCountyBoost +
      0.05 * accessSupportNeedShare;

    return {
      county,
      win,
      vol,
      stats,
      highValue,
      registrationGoal,
      currentCommitments,
      targetVoteGainShare,
      registrationGoalShare,
      turnoutHeadroomShare,
      opportunityLoadShare,
      localInfrastructureGapShare,
      lowTouchCountyBoost,
      accessSupportNeedShare,
      countyVolunteerNeedWeight,
    };
  });

  const weightSum = rawComponents.reduce((s, c) => s + c.countyVolunteerNeedWeight, 0) || 1;

  const provisional = rawComponents.map((c) => {
    const normalizedWeight = c.countyVolunteerNeedWeight / weightSum;
    const rawCountyTarget = Math.round(assumptions.statewideCommitmentGoal * normalizedWeight);
    const priorityMinimum = (c.win?.targetVoteGain ?? 0) > 0 || (c.registrationGoal ?? 0) > 0 ? assumptions.priorityCountyMinimum : assumptions.minimumPerCounty;
    const opportunityMinimum = c.highValue >= 2 ? assumptions.highOpportunityCountyMinimum : priorityMinimum;
    const minApplied = Math.max(assumptions.minimumPerCounty, opportunityMinimum);
    const volunteerCommitmentTarget = Math.max(rawCountyTarget, minApplied);
    const housePartyGoal = Math.ceil(
      volunteerCommitmentTarget /
        (assumptions.housePartyAverageAttendance * assumptions.usableCommitmentRateFromHouseParty),
    );
    const commitmentGap = Math.max(0, volunteerCommitmentTarget - (c.currentCommitments ?? 0));
    const missingData = [
      !c.win ? "win_target_row" : null,
      c.registrationGoal == null ? "registration_goal" : null,
      c.currentCommitments == null ? "current_commitments" : null,
      !c.vol ? "volunteer_capacity_row" : null,
    ].filter(Boolean) as string[];

    const confidence: GotvCommitmentAllocationRow["confidence"] =
      missingData.length === 0 ? "high" : missingData.length <= 2 ? "medium" : "low";

    const staffNextActions = [
      commitmentGap > 0 ? `Recruit ${commitmentGap} more GOTV commitment-card signers in ${c.county}.` : `Confirm ${c.county} commitments are still active.`,
      housePartyGoal > 0 ? `Line up ${housePartyGoal} house-party / living-room commitment events or equivalent host conversations.` : null,
      (c.vol?.localGuideNeed ?? 0) > 0 ? `Confirm ${c.vol?.localGuideNeed} local guide slot(s) before principal travel.` : null,
      c.accessSupportNeedShare >= 0.85 ? "Prepare bilingual/access materials and identify a local partner before the event ask." : null,
    ].filter(Boolean) as string[];

    const countyVolunteerNeedFormula =
      `0.35*targetGainShare(${(c.targetVoteGainShare * 100).toFixed(2)}%) + ` +
      `0.20*registrationGoalShare(${(c.registrationGoalShare * 100).toFixed(2)}%) + ` +
      `0.15*turnoutHeadroomShare(${(c.turnoutHeadroomShare * 100).toFixed(2)}%) + ` +
      `0.10*opportunityLoadShare(${(c.opportunityLoadShare * 100).toFixed(2)}%) + ` +
      `0.10*localInfrastructureGap(${c.localInfrastructureGapShare.toFixed(2)}) + ` +
      `0.05*lowTouch(${c.lowTouchCountyBoost.toFixed(2)}) + ` +
      `0.05*accessSupport(${c.accessSupportNeedShare.toFixed(2)})`;

    return {
      county: c.county,
      volunteerCommitmentTarget,
      currentCommitments: c.currentCommitments,
      commitmentGap,
      targetVotes: c.win?.targetVotes,
      targetVoteGain: c.win?.targetVoteGain,
      registrationGoal: c.registrationGoal,
      turnoutHeadroom: c.win?.turnoutHeadroom,
      opportunityLoadScore: c.opportunityLoadShare,
      localInfrastructureGapScore: c.localInfrastructureGapShare,
      accessSupportNeedScore: c.accessSupportNeedShare,
      countyVolunteerNeedWeight: normalizedWeight,
      countyVolunteerNeedPct: normalizedWeight * 100,
      countyVolunteerNeedFormula,
      housePartyGoal,
      estimatedRelationalCoverage: volunteerCommitmentTarget * assumptions.relationalPowerOfFive,
      phoneBankCapacityHours: Math.ceil(commitmentGap / assumptions.phoneBankContactsPerHour),
      postcardCapacityEstimate: Math.ceil(commitmentGap / assumptions.postcardBatchPerVolunteerHour) * assumptions.postcardBatchPerVolunteerHour,
      textVolunteerCapacityHours: Math.ceil(commitmentGap / assumptions.textConversationsPerVolunteerHour),
      eventStaffingNeed: c.vol?.eventStaffingNeed ?? 0,
      localGuideNeed: c.vol?.localGuideNeed ?? 0,
      followUpVolunteerNeed: c.vol?.followUpVolunteerNeed ?? 0,
      fundraisingSupportGoal: c.vol?.realisticCountyFundraisingGoal,
      confidence,
      missingData,
      staffNextActions,
      _raw: assumptions.statewideCommitmentGoal * normalizedWeight,
      _minApplied: minApplied,
    };
  });

  const counties = largestRemainderRebalance(provisional, assumptions.statewideCommitmentGoal).map((r) => {
    const commitmentGap = Math.max(0, r.volunteerCommitmentTarget - (r.currentCommitments ?? 0));
    const housePartyGoal = Math.ceil(
      r.volunteerCommitmentTarget /
        (assumptions.housePartyAverageAttendance * assumptions.usableCommitmentRateFromHouseParty),
    );
    const staffNextActions = [
      commitmentGap > 0 ? `Recruit ${commitmentGap} more GOTV commitment-card signers in ${r.county}.` : `Confirm ${r.county} commitments are still active.`,
      housePartyGoal > 0 ? `Line up ${housePartyGoal} house-party / living-room commitment events or equivalent host conversations.` : null,
      r.localGuideNeed > 0 ? `Confirm ${r.localGuideNeed} local guide slot(s) before principal travel.` : null,
      r.accessSupportNeedScore >= 0.85 ? "Prepare bilingual/access materials and identify a local partner before the event ask." : null,
    ].filter(Boolean) as string[];
    return {
      ...r,
      commitmentGap,
      housePartyGoal,
      estimatedRelationalCoverage: r.volunteerCommitmentTarget * assumptions.relationalPowerOfFive,
      phoneBankCapacityHours: Math.ceil(commitmentGap / assumptions.phoneBankContactsPerHour),
      postcardCapacityEstimate: Math.ceil(commitmentGap / assumptions.postcardBatchPerVolunteerHour) * assumptions.postcardBatchPerVolunteerHour,
      textVolunteerCapacityHours: Math.ceil(commitmentGap / assumptions.textConversationsPerVolunteerHour),
      staffNextActions,
    };
  });

  const currentCommitments = counties.reduce((s, c) => s + (c.currentCommitments ?? 0), 0);

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    modelNote:
      "County-level GOTV commitment allocation for opt-in commitment cards and staff capacity planning. Not voter-level targeting; humans approve tactics and outreach.",
    commitmentMessage: "I commit to help 5 people make a plan to vote.",
    assumptions,
    statewide: {
      commitmentGoal: assumptions.statewideCommitmentGoal,
      currentCommitments,
      commitmentGap: Math.max(0, assumptions.statewideCommitmentGoal - currentCommitments),
      estimatedRelationalCoverage: assumptions.statewideCommitmentGoal * assumptions.relationalPowerOfFive,
    },
    counties,
    warnings: [
      "Allocation is county-level operations math; do not use it as a voter-level targeting or automated persuasion engine.",
      "All outreach automations require opt-in, compliance review, and human approval before sending.",
    ],
  };
}
