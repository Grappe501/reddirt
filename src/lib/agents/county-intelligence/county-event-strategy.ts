import { slugifyCounty } from "@/lib/campaign-events/media/media-path-builder";
import { buildCountyIntelligenceSummary } from "./county-intelligence-engine";
import { buildCountyActionPackage } from "./county-action-package-builder";
import type { CountyIntelligenceSummary, EventCountyPlanningGuidance } from "./county-kpi-types";

export function countySlugFromEventCounty(countyName?: string | null): string {
  return slugifyCounty(countyName);
}

export function loadEventCountyContext(countyName?: string | null): CountyIntelligenceSummary | null {
  const slug = countySlugFromEventCounty(countyName);
  if (slug === "unknown-county") return null;
  return buildCountyIntelligenceSummary(slug);
}

export function buildEventCountyPlanningGuidance(countyName?: string | null): EventCountyPlanningGuidance | null {
  const ctx = loadEventCountyContext(countyName);
  if (!ctx) return null;
  const slug = countySlugFromEventCounty(countyName);
  const pkg = buildCountyActionPackage(slug, "event_preparation");
  const { county } = ctx;
  return {
    countyName: county.countyName,
    whyCountyMatters: ctx.whyHere,
    eventPurpose: [
      pkg?.eventRecommendation ?? "Advance county registration and relational goals",
      ctx.eventGoals[0] ?? "Capture leaders and volunteers in hot wash",
      county.topOpportunities[0] ? `Opportunity: ${county.topOpportunities[0]}` : "Build local capacity",
    ],
    powerOfFiveAsk: [
      "Ask each attendee to bring five people into the relational network",
      pkg?.powerOfFiveTarget ?? "Connect to county Power of 5 target",
      "Log new contacts in hot wash — no autonomous outreach",
    ],
    volunteerRecruitmentAsk: [
      pkg?.volunteerNeed ?? "Fill check-in and outreach slots",
      ...ctx.recruitTargets.slice(0, 2),
    ],
    suggestedFollowUp: pkg?.followUpPlan ?? ctx.followUpActions,
    candidateTalkingPoints: ctx.kellyTalkingPoints,
    candidateListeningPoints: [
      county.topWeaknesses[0] ? `Listen for: ${county.topWeaknesses[0]}` : "Listen for local economic and healthcare concerns",
      "Ask who else should host or volunteer",
      "Note leaders for county memory — verify before outreach",
    ],
    routes: pkg?.routesToOpen ?? county.sourceLinks,
  };
}
