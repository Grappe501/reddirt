import "server-only";

import { getCachedCalendarReadinessLite } from "@/lib/workbench/operator-readiness-cache";

export type CalendarOperatorReadiness = {
  campaignEventTotal: number;
  upcomingInternalEvents: number;
  proposedDraftWorkflowCount: number;
  intakeNewCount: number;
  intakeFollowUpCount: number;
  intakeInReviewCount: number;
  intakeReadyForCalendarCount: number;
  intakeConvertedCount: number;
  googleEnvConfigured: boolean;
  googleAutoPublishPublicFacingNameOnly: boolean;
  googleAutoPublishEnabled: boolean;
};

/**
 * Operator-facing calendar summary — backed by bounded `getCalendarReadinessLite` (request-cached).
 */
export async function getCalendarOperatorReadiness(): Promise<CalendarOperatorReadiness> {
  const lite = await getCachedCalendarReadinessLite();
  return {
    campaignEventTotal: lite.campaignEventTotal,
    upcomingInternalEvents: lite.upcomingInternalEvents,
    proposedDraftWorkflowCount: lite.draftEventCount,
    intakeNewCount: lite.newRequestCount,
    intakeFollowUpCount: lite.needsFollowUpCount,
    intakeInReviewCount: lite.intakeInReviewCount,
    intakeReadyForCalendarCount: lite.intakeReadyForCalendarCount,
    intakeConvertedCount: lite.convertedCount,
    googleEnvConfigured: lite.googleCalendarReadiness,
    googleAutoPublishPublicFacingNameOnly: true,
    googleAutoPublishEnabled: lite.googleAutoPublishPublicFacingEnabled,
  };
}
