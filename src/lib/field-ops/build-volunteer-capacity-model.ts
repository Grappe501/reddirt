import type {
  CountyVolunteerCapacityRow,
  HispanicCommunityAccessNeed,
  VolunteerCapacityAssumptions,
  VolunteerCapacityModelFile,
} from "@/lib/field-ops/volunteer-capacity-types";
import { DEFAULT_VOLUNTEER_CAPACITY_ASSUMPTIONS } from "@/lib/field-ops/volunteer-capacity-types";

export type PriorityLite = {
  pastTouchesSinceNov1: number;
  nextScheduledAnchor?: string;
  fewOpportunities?: boolean;
  underTouched?: boolean;
  notes?: string;
};

export type WinTargetLite = {
  targetVotes: number;
  targetVoteGain: number;
  registrationGoal?: number;
};

export type VolunteerRosterLite = {
  currentVolunteerCount?: number;
  activeVolunteerCount?: number;
  trainedVolunteerCount?: number;
  housePartyHostsKnown?: number;
  localGuidesKnown?: number;
  bilingualSupportKnown?: number;
  knownLocalPartners?: number;
};

export type AcsContextLite = {
  hispanicLatinoPopulationSharePercent?: number;
};

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

export type VolunteerCapacityBuildInput = {
  counties: readonly string[];
  assumptions?: Partial<VolunteerCapacityAssumptions>;
  winByCounty: Map<string, WinTargetLite>;
  prioritiesByCounty: Map<string, PriorityLite>;
  highValueEventCountByCounty: Map<string, number>;
  upcomingEventCountByCounty: Map<string, number>;
  campusEventCountByCounty: Map<string, number>;
  seniorTouchpointCountByCounty: Map<string, number>;
  volunteerRosterByCounty: Map<string, VolunteerRosterLite>;
  acsByCounty: Map<string, AcsContextLite>;
};

function mergeAssumptions(p: Partial<VolunteerCapacityAssumptions> | undefined): VolunteerCapacityAssumptions {
  return { ...DEFAULT_VOLUNTEER_CAPACITY_ASSUMPTIONS, ...p };
}

function classifyHispanicAccess(args: {
  share?: number;
  threshold: number;
  bilingualKnown?: number;
  partners?: number;
}): { level: HispanicCommunityAccessNeed; notes?: string; missing: string[] } {
  const missing: string[] = [];
  if (args.share == null || Number.isNaN(args.share)) {
    missing.push("acs_hispanic_latino_share");
    return { level: "monitor", notes: "No ACS / public share on file — treat as monitor until county intelligence is imported.", missing };
  }
  const partners = args.partners ?? 0;
  if (args.share >= args.threshold * 1.8 && partners < 2) {
    return {
      level: "needs_local_partner",
      notes: "Elevated Hispanic or Latino population share (public ACS-style input) — prioritize trusted local partners for materials and event access (nonpartisan civic engagement).",
      missing,
    };
  }
  if (args.share >= args.threshold && (args.bilingualKnown ?? 0) < 1) {
    return {
      level: "needs_bilingual_materials",
      notes: "Consider bilingual event flyers, translation review, and bilingual volunteer coverage for accessibility — not voter targeting.",
      missing,
    };
  }
  if (args.share >= args.threshold * 0.6) {
    return { level: "monitor", notes: "Share approaching threshold — keep community access materials on standby.", missing };
  }
  return { level: "none_known", missing };
}

function campusNeed(c: number): CountyVolunteerCapacityRow["campusYouthAccessNeed"] {
  if (c >= 3) return "needs_partner";
  if (c >= 1) return "monitor";
  return "none_known";
}

function seniorNeed(c: number): CountyVolunteerCapacityRow["seniorCommunityAccessNeed"] {
  if (c >= 3) return "needs_partner";
  if (c >= 1) return "monitor";
  return "none_known";
}

function buildStaffActions(r: CountyVolunteerCapacityRow, coverage: number): string[] {
  const out: string[] = [];
  if (r.eventStaffingNeed > 0) {
    out.push(`Logistics: schedule ${r.eventStaffingNeed} volunteer slots for upcoming high-attention community events in ${r.county} (coverage score ${coverage.toFixed(2)}).`);
  }
  if (r.localGuideNeed > 0) {
    out.push(`Relationship: assign or confirm ${r.localGuideNeed} local guide(s) before principal travel in ${r.county}.`);
  }
  if (r.housePartyHostNeed > 0) {
    out.push(`House parties: recruit up to ${r.housePartyHostNeed} host conversation(s) for civic engagement follow-up — staff approval on cadence.`);
  }
  if (r.hispanicCommunityAccessNeed === "needs_bilingual_materials" || r.hispanicCommunityAccessNeed === "needs_local_partner") {
    out.push(`Access: ${r.county} — ${r.languageAccessNotes ?? "Review bilingual / partner plan for public events."}`);
  }
  if (r.campusYouthAccessNeed === "needs_partner") {
    out.push(`Campus / youth access: line up a vetted partner organization for tabling norms in ${r.county}.`);
  }
  if (r.followUpVolunteerNeed > 4) {
    out.push(`Follow-up desk: allocate volunteer hours for post-event thank-yous and nonpartisan voter registration education in ${r.county}.`);
  }
  if (r.missingData.length > 2) {
    out.push(`Data hygiene call: backfill volunteer roster + ACS context for ${r.county} before expanding asks.`);
  }
  if (out.length === 0) {
    out.push(`Routine check-in: confirm volunteer coverage is still accurate for ${r.county}.`);
  }
  return out.slice(0, 8);
}

export function buildVolunteerCapacityModel(input: VolunteerCapacityBuildInput): VolunteerCapacityModelFile {
  const assumptions = mergeAssumptions(input.assumptions);
  const warnings: string[] = [
    "Operational planning model — not persuasion targeting. Political decisions stay with campaign leadership.",
    "Assumptions are editable defaults; widen ranges when data is thin.",
  ];

  const counties: CountyVolunteerCapacityRow[] = [];

  for (const county of input.counties) {
    const win = input.winByCounty.get(county);
    const pr = input.prioritiesByCounty.get(county);
    const roster = input.volunteerRosterByCounty.get(county) ?? {};
    const acs = input.acsByCounty.get(county) ?? {};
    const highVal = input.highValueEventCountByCounty.get(county) ?? 0;
    const upcoming = input.upcomingEventCountByCounty.get(county) ?? 0;
    const campus = input.campusEventCountByCounty.get(county) ?? 0;
    const senior = input.seniorTouchpointCountByCounty.get(county) ?? 0;

    const missingData: string[] = [];

    const targetVotes = win?.targetVotes;
    const targetVoteGain = win?.targetVoteGain;
    const registrationGoal = win?.registrationGoal ?? undefined;
    if (!win) missingData.push("win_target_row");
    if (registrationGoal == null) missingData.push("registration_goal");

    const touchCountSinceNov1 = pr?.pastTouchesSinceNov1;
    const nextScheduledVisit = pr?.nextScheduledAnchor;
    if (!pr) missingData.push("county_priority_snapshot");

    if (roster.currentVolunteerCount == null) missingData.push("volunteer_roster_counts");
    if (roster.localGuidesKnown == null) missingData.push("local_guides_known");

    const nGain = targetVoteGain ?? 0;
    const normalizedTargetVoteGain = clamp01(nGain / 4500);
    const normalizedRegistrationGoal = clamp01((registrationGoal ?? 0) / 18_000);
    const opportunityLoadScore = clamp01(highVal / 10);

    const touches = touchCountSinceNov1 ?? 0;
    const lowTouchPenalty = clamp01(1 - Math.min(1, touches / 5));

    let localInfrastructureGap = 0.35;
    if (pr?.fewOpportunities) localInfrastructureGap += 0.35;
    if (pr?.underTouched) localInfrastructureGap += 0.25;
    localInfrastructureGap = clamp01(localInfrastructureGap);

    const hispanic = classifyHispanicAccess({
      share: acs.hispanicLatinoPopulationSharePercent,
      threshold: assumptions.bilingualSupportThresholdPct,
      bilingualKnown: roster.bilingualSupportKnown,
      partners: roster.knownLocalPartners,
    });
    missingData.push(...hispanic.missing);
    const accessSupportNeed =
      hispanic.level === "needs_local_partner"
        ? 0.95
        : hispanic.level === "needs_bilingual_materials"
          ? 0.85
          : hispanic.level === "monitor"
            ? 0.45
            : 0.2;

    const coverageNeedScore = clamp01(
      0.25 * normalizedTargetVoteGain +
        0.2 * normalizedRegistrationGoal +
        0.2 * opportunityLoadScore +
        0.15 * lowTouchPenalty +
        0.1 * localInfrastructureGap +
        0.1 * accessSupportNeed,
    );
    const countyVolunteerNeedWeight = coverageNeedScore;
    const countyVolunteerNeedPct = countyVolunteerNeedWeight * 100;
    const countyVolunteerNeedFormula =
      `0.25*targetGain(${normalizedTargetVoteGain.toFixed(3)}) + ` +
      `0.20*regGoal(${normalizedRegistrationGoal.toFixed(3)}) + ` +
      `0.20*opportunity(${opportunityLoadScore.toFixed(3)}) + ` +
      `0.15*lowTouch(${lowTouchPenalty.toFixed(3)}) + ` +
      `0.10*localGap(${localInfrastructureGap.toFixed(3)}) + ` +
      `0.10*access(${accessSupportNeed.toFixed(3)})`;

    const eventStaffingNeed = Math.ceil(highVal * assumptions.eventVolunteerMinimum);
    const housePartyHostNeed = Math.ceil(coverageNeedScore * 6);
    const followUpVolunteerNeed = Math.ceil((upcoming + housePartyHostNeed) / 2);
    const voterRegistrationEducationNeed = Math.ceil(
      clamp01((registrationGoal ?? 0) / 12_000) * 3 + coverageNeedScore * 2,
    );
    const phoneBankCapacityNeedHours = Math.round(coverageNeedScore * 25);
    const postcardCapacityNeedEstimate = Math.round(coverageNeedScore * 500);

    const guidesKnown = roster.localGuidesKnown ?? 0;
    const localGuideNeed = Math.max(0, assumptions.localGuidePerCountyMinimum - guidesKnown);

    const realisticCountyFundraisingGoal =
      typeof targetVotes === "number" && targetVotes > 0 ? Math.round(targetVotes * 0.012) : undefined;

    let fundraisingConfidence: CountyVolunteerCapacityRow["fundraisingConfidence"] = "medium";
    if (missingData.length >= 3) fundraisingConfidence = "needs_data";
    else if (missingData.length === 0) fundraisingConfidence = "high";

    let housePartyFundraisingPotential: CountyVolunteerCapacityRow["housePartyFundraisingPotential"] = "medium";
    if ((roster.housePartyHostsKnown ?? 0) >= 3) housePartyFundraisingPotential = "high";
    else if ((roster.housePartyHostsKnown ?? 0) === 0 && coverageNeedScore > 0.55) housePartyFundraisingPotential = "low";
    if (missingData.includes("volunteer_roster_counts")) housePartyFundraisingPotential = "needs_data";

    const confidence: CountyVolunteerCapacityRow["confidence"] =
      missingData.length === 0 ? "high" : missingData.length <= 2 ? "medium" : "low";

    const draft: CountyVolunteerCapacityRow = {
      county,
      targetVotes,
      targetVoteGain,
      registrationGoal,
      touchCountSinceNov1,
      nextScheduledVisit,
      countyVolunteerNeedWeight,
      countyVolunteerNeedPct,
      countyVolunteerNeedFormula,
      currentVolunteerCount: roster.currentVolunteerCount,
      activeVolunteerCount: roster.activeVolunteerCount,
      trainedVolunteerCount: roster.trainedVolunteerCount,
      housePartyHostsKnown: roster.housePartyHostsKnown,
      localGuidesKnown: roster.localGuidesKnown,
      bilingualSupportKnown: roster.bilingualSupportKnown,
      eventStaffingNeed,
      localGuideNeed,
      housePartyHostNeed,
      followUpVolunteerNeed,
      voterRegistrationEducationNeed,
      phoneBankCapacityNeedHours,
      postcardCapacityNeedEstimate,
      hispanicCommunityAccessNeed: hispanic.level,
      languageAccessNotes: hispanic.notes,
      campusYouthAccessNeed: campusNeed(campus),
      seniorCommunityAccessNeed: seniorNeed(senior),
      realisticCountyFundraisingGoal,
      fundraisingConfidence,
      housePartyFundraisingPotential,
      confidence,
      missingData: [...new Set(missingData)],
      staffNextActions: [],
    };
    draft.staffNextActions = buildStaffActions(draft, coverageNeedScore);
    counties.push(draft);
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    modelNote:
      "County volunteer capacity + community coverage — logistics and access support. Replace unknowns with staff-confirmed roster and ACS-derived context (see docs/field-ops/VOLUNTEER_CAPACITY_MODEL_V1.md).",
    assumptions,
    counties,
    warnings,
  };
}
