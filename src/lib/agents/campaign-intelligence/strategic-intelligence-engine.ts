import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import type { CampaignTenant } from "@/lib/campaign-tenancy/types";
import type { CampaignSettings } from "@/lib/campaign-tenancy/types";

export type StrategicSignal = {
  id: string;
  category: "momentum" | "persuasion" | "turnout" | "coalition" | "field" | "schedule" | "county" | "media";
  title: string;
  insight: string;
  severity: "info" | "watch" | "urgent";
  confidence: "high" | "medium" | "low";
  suggestedAction?: string;
};

export type CampaignStrategicAssessment = {
  momentumScore: number;
  pacingHealth: "ahead" | "on_track" | "behind" | "unknown";
  candidateOverloadRisk: boolean;
  scheduleSustainability: "sustainable" | "strained" | "overloaded";
  countyEngagementGaps: string[];
  strategicOpportunities: StrategicSignal[];
  strategicGaps: StrategicSignal[];
  executiveNarrative: string;
};

export function buildCampaignStrategicIntelligence(input: {
  snapshot?: CampaignEventsDashboardSnapshot | null;
  tenant?: CampaignTenant | null;
  settings?: CampaignSettings | null;
  period: string;
}): CampaignStrategicAssessment {
  const s = input.snapshot;
  const opportunities: StrategicSignal[] = [];
  const gaps: StrategicSignal[] = [];

  let momentum = 72;
  if (s) {
    if (s.officialCount > s.tentativeCount) momentum += 8;
    if (s.pendingApprovals > 5) momentum -= 10;
    if (s.needsIntakeReviewCount > 3) momentum -= 6;
    if (s.calendarSync?.jsonStale) momentum -= 8;

    if (s.missingCounty > 2) {
      gaps.push({
        id: "county-geo-gaps",
        category: "county",
        title: "County targeting incomplete",
        insight: `${s.missingCounty} events lack county — persuasion geography and field plans need county truth.`,
        severity: "watch",
        confidence: "high",
        suggestedAction: "Run month review with county focus filter",
      });
    }
    if (s.pendingApprovals > 0) {
      gaps.push({
        id: "approval-backlog",
        category: "schedule",
        title: "Approval backlog slows momentum",
        insight: "Events cannot promote or close finance until approvals clear.",
        severity: "urgent",
        confidence: "high",
        suggestedAction: "Clear month review queue",
      });
    }
    if (s.tentativeCount > s.officialCount + 5) {
      opportunities.push({
        id: "promotion-ready",
        category: "momentum",
        title: "Promotion pipeline can build public momentum",
        insight: "Many tentative events — converting approvals to official calendar builds visibility.",
        severity: "info",
        confidence: "medium",
        suggestedAction: "Review promotion-ready rows after approvals",
      });
    }
    if ((s.actionItems?.travelReview ?? 0) > 0 || s.needsMileageReview) {
      gaps.push({
        id: "travel-friction",
        category: "field",
        title: "Travel friction drains candidate bandwidth",
        insight: "Unresolved mileage/travel rows create operator drag and candidate stress.",
        severity: "watch",
        confidence: "high",
      });
    }
  }

  const eventDensity = (s?.officialCount ?? 0) + (s?.tentativeCount ?? 0);
  const candidateOverloadRisk = eventDensity > 40 || (s?.pendingApprovals ?? 0) > 8;
  const scheduleSustainability: CampaignStrategicAssessment["scheduleSustainability"] = candidateOverloadRisk
    ? "overloaded"
    : eventDensity > 25
      ? "strained"
      : "sustainable";

  if (candidateOverloadRisk) {
    gaps.push({
      id: "candidate-overload",
      category: "schedule",
      title: "Candidate schedule may be unsustainable",
      insight: "High queue volume + approvals — protect candidate energy and prioritize high-impact events.",
      severity: "urgent",
      confidence: "medium",
      suggestedAction: "Use strategic briefing to defer low-impact holds",
    });
  }

  if (input.settings?.priorities.includes("county_organizing")) {
    opportunities.push({
      id: "county-organizing",
      category: "coalition",
      title: "County organizing priority active",
      insight: "Under-engaged counties should receive field intensity before adding new geographies.",
      severity: "info",
      confidence: "medium",
      suggestedAction: "Open county intelligence bridge",
    });
  }

  const pacingHealth: CampaignStrategicAssessment["pacingHealth"] =
    momentum >= 75 ? "on_track" : momentum >= 55 ? "behind" : "behind";

  const countyEngagementGaps: string[] = [];
  if (s && s.missingCounty > 0) countyEngagementGaps.push(`${s.missingCounty} events missing county assignment`);

  const executiveNarrative = [
    `Campaign ${input.tenant?.displayName ?? "operations"} — ${input.period}.`,
    `Momentum ~${Math.min(100, Math.max(0, momentum))}/100; schedule ${scheduleSustainability}.`,
    gaps.length
      ? `Address ${gaps.length} strategic gap(s) before expanding field intensity.`
      : "No critical strategic gaps in snapshot — focus on execution quality.",
  ].join(" ");

  return {
    momentumScore: Math.min(100, Math.max(0, momentum)),
    pacingHealth,
    candidateOverloadRisk,
    scheduleSustainability,
    countyEngagementGaps,
    strategicOpportunities: opportunities.slice(0, 6),
    strategicGaps: gaps.slice(0, 8),
    executiveNarrative,
  };
}
