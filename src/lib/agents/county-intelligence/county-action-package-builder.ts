import { buildCountyActionPlan, buildCountyIntelligenceSummary, identifyWeakCounties } from "./county-intelligence-engine";
import { loadCountyKpis } from "./county-workbench-adapter";
import type { CountyActionPackage, CountyActionPackageType, CountyActionPlan } from "./county-kpi-types";
import { summarizePowerOfFiveForCounty } from "./power-of-five-engine";

function priorityFromReadiness(score: number): CountyActionPlan["priority"] {
  if (score < 25) return "critical";
  if (score < 45) return "high";
  if (score < 65) return "medium";
  return "low";
}

function routesForCounty(slug: string) {
  return [
    { label: "County workbench", href: `/admin/counties/${slug}` },
    { label: "County intel center", href: "/admin/county-intelligence" },
    { label: "Events workbench", href: "/admin/campaign-events/workbench?month=2026-03" },
  ];
}

export function buildCountyActionPackage(
  countySlug: string,
  type: CountyActionPackageType = "county_recovery",
): CountyActionPackage | null {
  const county = loadCountyKpis(countySlug);
  if (!county) return null;
  const plan = buildCountyActionPlan(countySlug);
  const summary = buildCountyIntelligenceSummary(countySlug);
  const p5 = summarizePowerOfFiveForCounty(countySlug);

  const topGoals = [
    county.registrationGoal != null ? `Registration planning target: ${county.registrationGoal.toLocaleString()}` : "Set registration target with county lead",
    county.powerOfFiveGoal != null ? `Power of 5 target: ${county.powerOfFiveGoal.toLocaleString()}` : "Define Power of 5 county target",
    county.volunteerGoal != null ? `Volunteer target: ${county.volunteerGoal}` : "Staff volunteer pipeline",
  ];

  const pkg: CountyActionPackage = {
    id: `cap_${countySlug}_${type}_${Date.now().toString(36)}`,
    type,
    countySlug,
    countyName: county.countyName,
    countySummary: `${county.countyName} readiness ${county.countyReadinessScore}/100 · field ${county.fieldStrengthScore}/100 · ${county.goalSource} goals`,
    topGoals,
    topGaps: county.topWeaknesses.length ? county.topWeaknesses : ["Profile depth — verify in countyWorkbench"],
    powerOfFiveTarget:
      p5?.goal != null
        ? `Close gap toward ${p5.goal.toLocaleString()} (priority ${p5.priority})`
        : "Connect governance sheet for Power of 5 target",
    registrationTarget:
      county.registrationGoal != null
        ? `Advance toward ${county.registrationGoal.toLocaleString()} registration contacts`
        : "Clarify registration goal",
    volunteerNeed: plan?.volunteerRecommendations[0] ?? "Recruit check-in and outreach volunteers for next event",
    eventRecommendation:
      type === "event_preparation"
        ? (plan?.eventRecommendations[0] ?? "Plan house party or community gathering in population center")
        : (plan?.eventRecommendations.join(" · ") || "Schedule county-tagged event on workbench"),
    communicationsRecommendation:
      type === "county_growth"
        ? `Local angle: ${county.topOpportunities[0] ?? "county organizing momentum"} — draft only, human send`
        : `Highlight ${county.countyName} progress; no mass email without audience safety review`,
    fieldTaskList: plan?.fieldManagerNotes ?? county.recommendedActions.slice(0, 4),
    internTaskList: [
      "Review county profile completeness in countyWorkbench (read-only)",
      "Log missing local leader contact notes for supervisor",
      "Compare hot wash notes to county KPI gaps",
      "Do not export voter lists or send outreach",
    ],
    candidateTalkingPoints: summary?.kellyTalkingPoints ?? [
      `Why ${county.countyName} matters now`,
      county.topOpportunities[0] ?? "Listen for local concerns",
      "Close with volunteer or host ask",
    ],
    followUpPlan: summary?.followUpActions ?? county.recommendedActions,
    routesToOpen: routesForCounty(countySlug),
    priority: plan?.priority ?? priorityFromReadiness(county.countyReadinessScore),
    generatedAt: new Date().toISOString(),
  };

  if (type === "power_of_five_push") {
    pkg.fieldTaskList = [
      "Train hosts on Power of 5 ask after events",
      ...(p5?.recommendations ?? []),
    ];
    pkg.communicationsRecommendation = "Draft relational organizing invite — supervisor approves send";
  }
  if (type === "volunteer_recruitment") {
    pkg.fieldTaskList = ["Match volunteers to county events", "Fill check-in slots", "Coordinator reviews assignments"];
  }
  if (type === "candidate_visit") {
    pkg.candidateTalkingPoints = summary?.kellyTalkingPoints ?? pkg.candidateTalkingPoints;
    pkg.internTaskList = ["Prep county one-pager for candidate", "Stage photos metadata only"];
  }
  if (type === "post_event_followup") {
    pkg.followUpPlan = [
      "File hot wash to county memory",
      "Schedule follow-up within 48h",
      ...(county.countyReadinessScore < 50 ? ["Plan second event within 30 days"] : []),
    ];
  }

  return pkg;
}

export function buildCountyActionPackagesForWeakCounties(limit = 5): CountyActionPackage[] {
  return identifyWeakCounties(limit)
    .map((c) => buildCountyActionPackage(c.countySlug, "county_recovery"))
    .filter((p): p is CountyActionPackage => p != null);
}
