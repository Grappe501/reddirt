import "server-only";

import { loadEventCoveragePlans } from "@/lib/calendar/load-event-coverage-plans";
import type { EventCoveragePlanToolOutput } from "@/lib/calendar/event-coverage-types";

export function buildEventCoveragePlanToolOutput(eventId: string, repoRoot?: string): EventCoveragePlanToolOutput | null {
  const plan = loadEventCoveragePlans(repoRoot).find((p) => p.campaignEventId === eventId || p.calendarItemId === eventId);
  if (!plan) return null;
  return {
    eventId,
    recommendedCoverageMode: plan.coverageMode,
    reason: plan.notes ?? "Coverage plan generated from event type, Kelly decision state, and campaign logistics defaults.",
    volunteersNeeded: plan.volunteersNeeded,
    materialsNeeded: {
      pushCards: plan.materials.pushCards,
      fans: plan.materials.fans,
      shirts: plan.shirtsNeeded,
      brandedMints: plan.materials.brandedMints,
      fourFootTablecloths: plan.materials.fourFootTablecloths,
      pullUpBanners: plan.materials.pullUpBanners,
      signupSheets: plan.materials.signupSheets ?? 0,
      clipboards: plan.materials.clipboards ?? 0,
      pens: plan.materials.pens ?? 0,
      qrCodeCards: plan.materials.qrCodeCards ?? 0,
      yardSigns: plan.materials.yardSigns ?? 0,
      voterRegistrationForms: plan.materials.voterRegistrationForms ?? 0,
    },
    tablingRecommendation: plan.tableNeeded
      ? plan.tableStatus === "needs_permission"
        ? "ask_permission"
        : "table_if_possible"
      : "not_needed",
    staffNextActions: plan.staffNextActions,
    humanDecisionRequired: plan.status === "needs_decision" || plan.status === "needs_staff_call" || plan.volunteerLeadNeeded,
  };
}

export function buildEventCoverageGapSummary(repoRoot?: string) {
  const plans = loadEventCoveragePlans(repoRoot);
  return {
    total: plans.length,
    needsDecision: plans.filter((p) => p.status === "needs_decision").length,
    needsVolunteerLead: plans.filter((p) => p.volunteerLeadNeeded && !p.volunteerLeadName).length,
    needsTablePermission: plans.filter((p) => p.tableNeeded && p.tableStatus === "needs_permission").length,
    ready: plans.filter((p) => p.status === "ready" || p.status === "covered").length,
    topStaffActions: plans
      .flatMap((p) => p.staffNextActions)
      .reduce<Record<string, number>>((acc, action) => {
        acc[action] = (acc[action] ?? 0) + 1;
        return acc;
      }, {}),
  };
}
