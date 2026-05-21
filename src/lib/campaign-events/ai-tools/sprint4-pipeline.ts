import type { AiToolStatus } from "../ai-tools-master-catalog";
import { getContractById } from "./tool-contract";
import { SPRINT4_APPROVAL_EMAIL_TOOL_CONTRACTS } from "./sprint4-approval-email-tools";

export type Sprint4PipelineStage = {
  order: number;
  label: string;
  toolId: string;
  status: AiToolStatus;
  nextBuildAction: string;
};

const STAGES: Array<{ order: number; label: string; toolId: string; next: string }> = [
  { order: 1, label: "Config check", toolId: "approval-email-config-checker", next: "Set production APPROVAL_BASE_URL + SendGrid env" },
  { order: 2, label: "Architecture trace", toolId: "email-architecture-tracer", next: "Document provider in Netlify" },
  { order: 3, label: "Package + summary", toolId: "approval-email-summary-writer", next: "Harden missing-field detection" },
  { order: 4, label: "Risk scan", toolId: "approval-email-risk-scanner", next: "V2: predictive hold suggestions" },
  { order: 5, label: "Subject + summary", toolId: "approval-email-subject-writer", next: "Wire observation on edit" },
  { order: 6, label: "Template build", toolId: "approval-email-template-builder", next: "V2: tone learning from edits" },
  { order: 7, label: "Token build", toolId: "approval-token-builder", next: "Migrate tokens to Prisma if multi-instance" },
  { order: 8, label: "Human send gate", toolId: "approval-human-review-gate", next: "Optional CM co-sign" },
  { order: 9, label: "Send guard", toolId: "approval-send-guard", next: "Keep EMAIL_SEND_ENABLED off until launch" },
  { order: 10, label: "Audit log", toolId: "approval-send-audit-logger", next: "Export logs for compliance" },
  { order: 11, label: "Dashboard inbox", toolId: "approval-inbox-router", next: "CM inbox when email configured" },
  { order: 12, label: "Token validate", toolId: "approval-token-validator", next: "Signed JWT option" },
  { order: 13, label: "Decision write", toolId: "approval-action-writer", next: "V2: reply-by-email parser" },
  { order: 14, label: "Google write blocker", toolId: "approval-google-write-blocker", next: "CI guard script" },
  { order: 15, label: "Follow-up hint", toolId: "approval-followup-recommender", next: "Implement timing model" },
];

export function buildSprint4ApprovalPipeline(): Sprint4PipelineStage[] {
  return STAGES.map((s) => {
    const contract = getContractById(SPRINT4_APPROVAL_EMAIL_TOOL_CONTRACTS, s.toolId);
    return {
      order: s.order,
      label: s.label,
      toolId: s.toolId,
      status: contract?.currentStatus ?? "partial",
      nextBuildAction: s.next,
    };
  });
}
