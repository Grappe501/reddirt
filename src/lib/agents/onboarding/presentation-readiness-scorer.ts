import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";

export type PresentationReadinessReport = {
  score: number;
  label: "demo_ready" | "operator_ready" | "needs_work";
  gaps: string[];
  polishNotes: string[];
};

export function scorePresentationReadiness(snapshot?: CampaignEventsDashboardSnapshot | null): PresentationReadinessReport {
  const gaps: string[] = [];
  let score = 88;

  if (snapshot?.pendingApprovals && snapshot.pendingApprovals > 8) {
    gaps.push("High approval backlog may confuse demo narrative");
    score -= 5;
  }
  if (snapshot?.calendarSync?.jsonStale) {
    gaps.push("Calendar sync stale banner visible");
    score -= 8;
  }
  if (snapshot?.actionItems?.travelReview && snapshot.actionItems.travelReview > 0) {
    gaps.push("Travel review queue open — treasurer story needs context");
    score -= 4;
  }

  gaps.push("Multi-tenant UI de-emphasized — Kelly single-campaign mode active");

  const label: PresentationReadinessReport["label"] =
    score >= 82 ? "demo_ready" : score >= 70 ? "operator_ready" : "needs_work";

  return {
    score: Math.max(0, Math.min(100, score)),
    label,
    gaps,
    polishNotes: [
      "Kelly Campaign OS branding on admin shell",
      "Executive summaries on primary dashboards",
      "Command palette (Ctrl+K) globally available",
      "Dashboard builder + role onboarding for new users",
    ],
  };
}
