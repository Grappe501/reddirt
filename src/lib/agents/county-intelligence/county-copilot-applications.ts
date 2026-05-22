import type { CopilotIntelligenceBrief } from "@/lib/agents/role-copilots/copilot-intelligence-types";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { buildCopilotIntelligenceBrief } from "@/lib/agents/role-copilots/copilot-intelligence-engine";
import { buildCountyActionPackage, buildCountyActionPackagesForWeakCounties } from "./county-action-package-builder";
import {
  buildCountyIntelligenceSummary,
  composeCountyDashboardContext,
  identifyWeakCounties,
  recommendCountyEventsForPeriod,
} from "./county-intelligence-engine";
import type { CountyActionPackage, CountyIntelligenceSummary, FieldManagerDailyCountyPlan } from "./county-kpi-types";
import { summarizeStatewidePowerOfFiveGaps } from "./power-of-five-engine";
import { loadCountyKpis } from "./county-workbench-adapter";
export type CountyCopilotApplication = {
  role: RoleCopilotId;
  headline: string;
  operatorGuidance: string[];
  recommendedPackages: CountyActionPackage[];
  dailyPlan?: FieldManagerDailyCountyPlan;
  countySlugFocus?: string;
};

export function buildFieldManagerDailyCountyPlan(): FieldManagerDailyCountyPlan {
  const weak = identifyWeakCounties(8);
  const p5Gaps = summarizeStatewidePowerOfFiveGaps(5);
  const events = recommendCountyEventsForPeriod("2026-03", 6);
  return {
    date: new Date().toISOString().slice(0, 10),
    topWeakCounties: weak.map((c) => ({
      slug: c.countySlug,
      name: c.countyName,
      reason: c.topWeaknesses[0] ?? `Readiness ${c.countyReadinessScore}/100`,
    })),
    dailyFieldTasks: [
      "Review top 5 weak counties in county command center",
      "Assign county leads to Power of 5 gaps",
      "Confirm volunteer slots for next week events",
      "Log field notes to county memory after calls",
    ],
    powerOfFiveFocus: p5Gaps.map((g) => `${g.countyName}: gap ${g.gap?.toLocaleString() ?? "TBD"} (${g.priority})`),
    volunteerGaps: events.map((e) => `${e.countyName} — ${e.reason}`),
    eventRecommendations: events.map((e) => `Plan event in ${e.countyName}`),
    routes: [
      { label: "County command center", href: "/admin/county-intelligence" },
      { label: "County intel panel", href: "/admin/ai-command-center" },
      { label: "Volunteers", href: "/admin/volunteers" },
    ],
  };
}

export function applyCountyIntelToCopilot(role: RoleCopilotId, countySlug?: string): CountyCopilotApplication {
  const statewide = composeCountyDashboardContext();
  const packages = countySlug
    ? [buildCountyActionPackage(countySlug, "county_recovery")].filter((p): p is CountyActionPackage => !!p)
    : buildCountyActionPackagesForWeakCounties(3);

  const base: CountyCopilotApplication = {
    role,
    headline: `${role} · county intelligence`,
    operatorGuidance: [],
    recommendedPackages: packages,
    countySlugFocus: countySlug ?? packages[0]?.countySlug,
  };

  switch (role) {
    case "field_manager": {
      base.headline = "Field manager · statewide county plan";
      base.dailyPlan = buildFieldManagerDailyCountyPlan();
      base.operatorGuidance = [
        `Focus weak counties: ${statewide.weakCounties.slice(0, 3).map((c) => c.countyName).join(", ")}`,
        "Power of 5 gaps drive relational outreach this week",
        "Do not promote events until volunteer slots filled",
        ...base.dailyPlan.dailyFieldTasks,
      ];
      break;
    }
    case "county_lead": {
      const slug = countySlug ?? packages[0]?.countySlug ?? "pulaski";
      const kpi = loadCountyKpis(slug);
      base.headline = `County lead · ${kpi?.countyName ?? slug}`;
      base.operatorGuidance = [
        `Local goals: registration ${kpi?.registrationGoal?.toLocaleString() ?? "—"}, PO5 ${kpi?.powerOfFiveGoal?.toLocaleString() ?? "—"}`,
        `Weaknesses: ${kpi?.topWeaknesses.join(" · ") || "verify profile"}`,
        "Suggested outreach: house parties, party meetings, leader 1:1s",
        "Escalate to field manager before paid media",
      ];
      break;
    }
    case "volunteer_coordinator": {
      base.operatorGuidance = [
        `Counties needing volunteers: ${statewide.weakCounties.slice(0, 5).map((c) => c.countyName).join(", ")}`,
        "Match Power of 5 helpers to high-gap counties",
        "Staff events from workbench volunteer_needs",
        "No mass SMS — coordinator approves",
      ];
      break;
    }
    case "intern": {
      base.operatorGuidance = [
        "Safe: county profile review, leader contact research notes, data cleanup flags",
        "Supervisor reviews before any outreach",
        "Read-only countyWorkbench — no voter export",
        ...(packages[0]?.internTaskList ?? []),
      ];
      break;
    }
    case "communications_lead": {
      const slug = countySlug ?? statewide.topAttention[0]?.countySlug;
      const pkg = slug ? buildCountyActionPackage(slug, "county_growth") : null;
      base.operatorGuidance = [
        pkg?.communicationsRecommendation ?? "Draft county-specific angle",
        `Issue patterns: ${statewide.weakCounties[0]?.topWeaknesses[0] ?? "profile depth"}`,
        "Power of 5 outreach copy — draft only",
        "EMAIL_SEND_ENABLED gate required before send",
      ];
      break;
    }
    case "candidate": {
      const slug = countySlug ?? packages[0]?.countySlug ?? "pulaski";
      const pkg = buildCountyActionPackage(slug, "candidate_visit");
      base.operatorGuidance = pkg?.candidateTalkingPoints ?? ["County briefing before travel"];
      break;
    }
    default:
      base.operatorGuidance = [`${statewide.counties.length} counties in bridge · ${statewide.weakCounties.length} need attention`];
  }

  return base;
}

export function mergeCountyIntoCopilotBrief(
  role: RoleCopilotId,
  brief: CopilotIntelligenceBrief,
  countySlug?: string,
): CopilotIntelligenceBrief {
  const app = applyCountyIntelToCopilot(role, countySlug);
  if (!app.recommendedPackages.length) return brief;
  const pkg = app.recommendedPackages[0];
  return {
    ...brief,
    riskWarnings: [
      ...brief.riskWarnings,
      ...(pkg.topGaps[0] ? [`County gap: ${pkg.topGaps[0]}`] : []),
    ].slice(0, 6),
    recommendedNextTask: {
      ...brief.recommendedNextTask,
      title: pkg.eventRecommendation.slice(0, 80) || brief.recommendedNextTask.title,
      routeLinks: pkg.routesToOpen.slice(0, 2),
    },
    toolIds: [...new Set([...brief.toolIds, "county-action-package-builder", "field-manager-county-plan-builder"])],
  };
}

export function buildCandidateCountyBriefing(countySlug: string): CountyIntelligenceSummary | null {
  return buildCountyIntelligenceSummary(countySlug);
}

export function buildCopilotBriefWithCounty(role: RoleCopilotId, countySlug?: string) {
  const brief = buildCopilotIntelligenceBrief({ role, pathname: "/admin/county-intelligence" });
  return mergeCountyIntoCopilotBrief(role, brief, countySlug);
}

