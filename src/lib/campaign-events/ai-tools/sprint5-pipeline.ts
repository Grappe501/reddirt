import type { AiToolStatus } from "../ai-tools-master-catalog";
import { getContractById } from "./tool-contract";
import { SPRINT5_PROMOTION_TOOL_CONTRACTS } from "../calendar-promotion/sprint5-promotion-tools";

export type Sprint5PipelineStage = {
  order: number;
  label: string;
  toolId: string;
  status: AiToolStatus;
  nextBuildAction: string;
};

const STAGES: Array<{ order: number; label: string; toolId: string; next: string }> = [
  { order: 1, label: "Readiness check", toolId: "promotion-readiness-checker", next: "Expand duplicate detection against live GCal" },
  { order: 2, label: "Tentative router", toolId: "tentative-calendar-router", next: "V2: auto-suggest lane from event type" },
  { order: 3, label: "Official router", toolId: "official-calendar-router", next: "V2: move tentative→official without duplicate" },
  { order: 4, label: "Conflict scan", toolId: "promotion-conflict-scanner", next: "Wire live GCal overlap query" },
  { order: 5, label: "Payload build", toolId: "google-payload-builder", next: "Attendee list when host emails known" },
  { order: 6, label: "Write guard", toolId: "google-write-guard", next: "CI check for GOOGLE_CALENDAR_WRITE_ENABLED in prod" },
  { order: 7, label: "Audit log", toolId: "promotion-audit-logger", next: "Export promotion log CSV" },
  { order: 8, label: "Risk summary", toolId: "promotion-risk-summary-writer", next: "V2: model-assisted risk tiers" },
  { order: 9, label: "Retry handler", toolId: "promotion-retry-handler", next: "Backoff + max attempts policy" },
  { order: 10, label: "Human gate", toolId: "promotion-human-review-gate", next: "Optional second operator confirm for official" },
  { order: 11, label: "Duplicate detect", toolId: "duplicate-google-event-detector", next: "Search by title+start on target calendar" },
  { order: 12, label: "Lane health", toolId: "calendar-lane-health-checker", next: "Alert when refresh token expires" },
  { order: 13, label: "Observations", toolId: "promotion-observation-recorder", next: "Aggregate promotion funnel metrics" },
  { order: 14, label: "Official safety", toolId: "official-calendar-safety-blocker", next: "Separate prod/staging calendar IDs" },
  { order: 15, label: "Status summary", toolId: "google-write-status-summarizer", next: "Dashboard widget on CM home" },
];

export function buildSprint5CalendarPromotionPipeline(): Sprint5PipelineStage[] {
  return STAGES.map((s) => {
    const contract = getContractById(SPRINT5_PROMOTION_TOOL_CONTRACTS, s.toolId);
    return {
      order: s.order,
      label: s.label,
      toolId: s.toolId,
      status: contract?.currentStatus ?? "partial",
      nextBuildAction: s.next,
    };
  });
}
