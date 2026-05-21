import type { ScheduleCampaignEventBody } from "@/lib/forms/public-schedule-schema";
import type { IntakeInferenceSnapshot } from "./intake-inference";

export type WebsiteIntakeBridgeMeta = {
  version: 1;
  workflowIntakeId: string;
  eventRequestId: string;
  submissionId: string;
  duplicateRisk: boolean;
  scheduleConflict: boolean;
  duplicateReasons: string[];
  conflictReasons: string[];
  inferred: IntakeInferenceSnapshot;
  intakeSummary: string;
  recommendedNextAction: string;
  submittedAt: string;
  publicForm: {
    eventType: string;
    flexibility: string;
    speakingRequested: boolean;
    localHostAvailable: boolean;
    requesterName: string;
    organization: string | null;
  };
};

export function buildWebsiteEntrySourceKey(workflowIntakeId: string): string {
  return `website_entry:${workflowIntakeId}`;
}

export function buildWebsiteIntakeCalendarSourceId(workflowIntakeId: string): string {
  return `website_intake:${workflowIntakeId}`;
}

export function parseWebsiteIntakeMeta(raw: unknown): WebsiteIntakeBridgeMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== 1) return null;
  if (typeof o.workflowIntakeId !== "string") return null;
  return o as unknown as WebsiteIntakeBridgeMeta;
}

export function parseIntakeMetaFromFactCard(factCardRaw: unknown): WebsiteIntakeBridgeMeta | null {
  if (!factCardRaw || typeof factCardRaw !== "object") return null;
  const o = factCardRaw as Record<string, unknown>;
  return parseWebsiteIntakeMeta(o._intake);
}

export function attachIntakeMetaToFactCard(
  envelopeData: object,
  meta: WebsiteIntakeBridgeMeta,
): object {
  return { ...(envelopeData as Record<string, unknown>), _intake: meta };
}

export function publicFormSnapshot(body: ScheduleCampaignEventBody): WebsiteIntakeBridgeMeta["publicForm"] {
  return {
    eventType: body.eventType,
    flexibility: body.flexibility,
    speakingRequested: body.speakingRequested,
    localHostAvailable: body.localHostAvailable,
    requesterName: body.requesterName,
    organization: body.organization ?? null,
  };
}
