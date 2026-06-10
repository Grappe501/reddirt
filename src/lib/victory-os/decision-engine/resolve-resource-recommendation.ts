/**
 * Victory OS — season-aware resource + Kelly tier resolution (Layer 1).
 * Deterministic only — CM approves before any deployment.
 */

import type {
  CampaignVictorySeasonId,
  CountyVictoryContext,
  KellyDeploymentTier,
  VictoryResourceType,
} from "../types";

export type CountyDecisionRecommendation = {
  recommendation: string;
  resourceType: VictoryResourceType;
  kellyTier: KellyDeploymentTier;
  expectedOutcome: string;
  reason: string;
};

function importanceLabel(v: CountyVictoryContext["electoralImportance"]): string {
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function seasonInfrastructureFocus(seasonId: CampaignVictorySeasonId): boolean {
  return seasonId === "season_1_build_organization";
}

function seasonVisibilityFocus(seasonId: CampaignVictorySeasonId): boolean {
  return seasonId === "season_2_build_familiarity" || seasonId === "season_3_build_confidence";
}

function seasonTurnoutFocus(seasonId: CampaignVictorySeasonId): boolean {
  return seasonId === "season_4_build_turnout" || seasonId === "season_5_build_urgency";
}

/** Doctrine: strong readiness in critical county → surrogate before Kelly. */
function resolveStrongCriticalCounty(
  ctx: CountyVictoryContext,
  seasonId: CampaignVictorySeasonId,
): CountyDecisionRecommendation {
  const baseReason = `${importanceLabel(ctx.electoralImportance)} county, ${ctx.opportunityLevel} opportunity, strong readiness`;
  if (seasonVisibilityFocus(seasonId)) {
    return {
      recommendation: `Send surrogate to maintain visibility — do not deploy Kelly this week`,
      resourceType: "surrogate",
      kellyTier: 3,
      expectedOutcome: "Maintain visibility without candidate time · ~150 voter contacts",
      reason: `${baseReason} — volunteer/surrogate coverage sufficient`,
    };
  }
  if (seasonInfrastructureFocus(seasonId)) {
    return {
      recommendation: `County chair check-in — confirm captain pipeline and fair inventory`,
      resourceType: "county_chair",
      kellyTier: 4,
      expectedOutcome: "Chair contacted · volunteer captain gap closed or scheduled",
      reason: `${baseReason} — infrastructure hold, not candidate deployment`,
    };
  }
  return {
    recommendation: `Surrogate or phone bank shift — preserve Kelly for higher-leverage counties`,
    resourceType: "surrogate",
    kellyTier: 3,
    expectedOutcome: "Sustain county momentum · ~100–200 contacts",
    reason: baseReason,
  };
}

/** Weak readiness — infrastructure before visibility. */
function resolveWeakReadiness(
  ctx: CountyVictoryContext,
  seasonId: CampaignVictorySeasonId,
): CountyDecisionRecommendation {
  const baseReason = `${importanceLabel(ctx.electoralImportance)} county, ${ctx.opportunityLevel} opportunity, weak readiness`;
  if (ctx.electoralImportance === "maintenance") {
    return {
      recommendation: `Assign volunteer captain — light-touch infrastructure check`,
      resourceType: "volunteer",
      kellyTier: 4,
      expectedOutcome: "Volunteer lead identified · county meeting or booth on calendar",
      reason: `${baseReason} — maintenance county; volunteer before Kelly`,
    };
  }
  if (seasonInfrastructureFocus(seasonId) || ctx.organizationalReadiness === "weak") {
    const kellyTier: KellyDeploymentTier =
      ctx.electoralImportance === "critical" && ctx.opsStatus === "red" ? 2 : 3;
    return {
      recommendation:
        kellyTier <= 2
          ? `Deploy Kelly to county fair or chair summit — close infrastructure gap`
          : `Recruit volunteer captain and confirm county chair within 7 days`,
      resourceType: kellyTier <= 2 ? "kelly" : "volunteer",
      kellyTier,
      expectedOutcome:
        kellyTier <= 2
          ? "Chair + captain pipeline · +200 voter contacts at flagship event"
          : "Captain recruited · fair/festival booth staffed · chair engaged",
      reason: `${baseReason} — readiness gap requires intervention`,
    };
  }
  return {
    recommendation: `Volunteer captain assignment — build bench before Kelly deployment`,
    resourceType: "volunteer",
    kellyTier: 3,
    expectedOutcome: "Infrastructure improvement · volunteer bench +15%",
    reason: baseReason,
  };
}

function resolveModerateReadiness(
  ctx: CountyVictoryContext,
  seasonId: CampaignVictorySeasonId,
): CountyDecisionRecommendation {
  const baseReason = `${importanceLabel(ctx.electoralImportance)} county, ${ctx.opportunityLevel} opportunity, moderate readiness`;
  if (seasonTurnoutFocus(seasonId)) {
    return {
      recommendation: `Launch phone bank + canvass shift — turnout season push`,
      resourceType: "phone_bank",
      kellyTier: ctx.electoralImportance === "critical" ? 2 : 3,
      expectedOutcome: "+250 vote commitments or early vote pledges",
      reason: `${baseReason} — turnout season leverage`,
    };
  }
  if (seasonVisibilityFocus(seasonId) && ctx.opportunityLevel === "high") {
    const kellyTier: KellyDeploymentTier = ctx.electoralImportance === "critical" ? 1 : 2;
    return {
      recommendation:
        kellyTier === 1
          ? `Deploy Kelly to county fair or community festival`
          : `Kelly preferred at chamber/rotary — if weekly capacity allows`,
      resourceType: "kelly",
      kellyTier,
      expectedOutcome: `+${kellyTier === 1 ? "300" : "200"} voter contacts · visibility in ${ctx.county}`,
      reason: `${baseReason} — high opportunity visibility window`,
    };
  }
  if (ctx.opsStatus === "red" || ctx.opsStatus === "yellow") {
    return {
      recommendation: `Schedule surrogate or Kelly Tier 2 event — county neglected ${ctx.neglectDays ?? 45}+ days`,
      resourceType: ctx.electoralImportance === "critical" ? "kelly" : "surrogate",
      kellyTier: ctx.electoralImportance === "critical" ? 2 : 3,
      expectedOutcome: "Restore county touch rhythm · +150 contacts",
      reason: `${baseReason} · ops ${ctx.opsStatus}`,
    };
  }
  return {
    recommendation: `Volunteer-led community event — maintain presence without Kelly`,
    resourceType: "volunteer",
    kellyTier: 3,
    expectedOutcome: "Sustain county rhythm · +75–100 contacts",
    reason: baseReason,
  };
}

export function resolveCountyDecisionRecommendation(
  ctx: CountyVictoryContext,
  seasonId: CampaignVictorySeasonId,
): CountyDecisionRecommendation {
  if (ctx.electoralImportance === "maintenance" && ctx.opsStatus === "green" && ctx.opportunityLevel === "low") {
    return {
      recommendation: `No Kelly — optional volunteer touch if capacity allows`,
      resourceType: "none",
      kellyTier: 4,
      expectedOutcome: "Maintain baseline presence only",
      reason: "Maintenance county · low opportunity · green ops",
    };
  }

  if (ctx.organizationalReadiness === "strong" && ctx.electoralImportance === "critical") {
    return resolveStrongCriticalCounty(ctx, seasonId);
  }

  if (ctx.organizationalReadiness === "weak") {
    return resolveWeakReadiness(ctx, seasonId);
  }

  return resolveModerateReadiness(ctx, seasonId);
}

/** Fundraising unlock recommendation for high-importance counties with weak bench. */
export function resolveFundraisingUnlock(ctx: CountyVictoryContext): CountyDecisionRecommendation | null {
  if (ctx.electoralImportance === "maintenance") return null;
  if (ctx.organizationalReadiness !== "weak" && ctx.opsStatus === "green") return null;
  return {
    recommendation: `Fundraising call block — unlock field capacity in ${ctx.county}`,
    resourceType: "fundraising",
    kellyTier: 4,
    expectedOutcome: `$5k–$15k unlocks volunteer stipend + literature for ${ctx.county}`,
    reason: `${importanceLabel(ctx.electoralImportance)} county needs resources before Kelly multiplies impact`,
  };
}

export function maxKellyTier1SlotsForSeason(seasonId: CampaignVictorySeasonId): number {
  switch (seasonId) {
    case "season_1_build_organization":
      return 2;
    case "season_2_build_familiarity":
      return 4;
    case "season_3_build_confidence":
      return 3;
    case "season_4_build_turnout":
      return 3;
    case "season_5_build_urgency":
      return 5;
    default:
      return 3;
  }
}
