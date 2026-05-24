/**
 * Deterministic helpers for Email OS agent tools — human-gated, no autonomous send.
 */
import { loadCommunicationsBundle } from "@/lib/campaign-events/communications/load-communications-bundle";
import { buildEmailProviderReadinessReport } from "@/lib/campaign-events/communications/email-provider-readiness";
import { discoverContactSources } from "@/lib/campaign-events/communications/contact-source-discovery";
import { loadCommunicationsStore } from "@/lib/campaign-events/communications/communications-store";
import { CAMPAIGN_AI_HUMAN_CONTROL_RULES } from "./tool-contract";
import { buildDeterministicDraftCritique } from "@/lib/email-command-center/ai-draft-critic";
import {
  createEmptyDraft,
  type MessageStudioLocalDraft,
} from "@/components/admin/email-command-center/message-studio-local-drafts";
import {
  firstFailedPreflightCheckId,
  parsePreflightCheckRows,
  parsePreflightRecipientBreakdown,
} from "@/lib/email-command-center/send-execution-preflight-json";
import { AUTOMATION_POLICIES } from "@/lib/email-command-center/automation-policies";
import { getGmailWatchProductionReadiness } from "@/lib/email-command-center/gmail-production-watch";
import { getEmailAiReadiness } from "@/lib/email-workflow/ai/config";
import { getEmailWorkflowAllowedManualTransitions } from "@/lib/email-workflow/governance";
import type { EmailWorkflowStatus } from "@prisma/client";
import { composeCommunicationsIntelligenceContext } from "@/lib/communications/communications-intelligence-engine";
import { buildRelationshipGraph } from "@/lib/communications/relationship-intelligence/relationship-intelligence-engine";
import { buildCommunicationSequence } from "@/lib/communications/sequences/communication-sequence-builder";
import { routeCampaignWriting } from "@/lib/communications/writing-orchestration/campaign-writing-router";
import {
  detectImportDuplicates,
  validateContactImportRow,
  type NormalizedImportRow,
} from "@/lib/email-command-center/contact-import";
export type EmailOsMassSendGuardResult = {
  allowed: boolean;
  reasons: string[];
  humanApprovalRequired: true;
};

export type EmailOsSuiteManifest = {
  toolCount: number;
  lifecycles: string[];
  humanControlRules: readonly string[];
  rails: { id: string; route: string; purpose: string }[];
};

const ECC_ROUTES = [
  "/admin/workbench/email-command-center",
  "/admin/workbench/email-command-center/message-studio",
  "/admin/workbench/email-command-center/send-execution",
  "/admin/workbench/email-command-center/readiness",
  "/admin/communications",
  "/admin/communications/intelligence",
  "/admin/communications/studio",
] as const;

export function getEmailOsSuiteManifest(toolCount: number): EmailOsSuiteManifest {
  return {
    toolCount,
    lifecycles: ["email_os_suite", "communications_system", "sprint4_approval_email"],
    humanControlRules: CAMPAIGN_AI_HUMAN_CONTROL_RULES,
    rails: [
      { id: "ecc", route: "/admin/workbench/email-command-center", purpose: "Governed SendGrid send execution" },
      { id: "comms_center", route: "/admin/communications", purpose: "Campaign OS JSON contacts + templates" },
      { id: "message_studio", route: "/admin/workbench/email-command-center/message-studio", purpose: "Draft + critique + revisions" },
      { id: "approval_email", route: "/campaign-events/approval", purpose: "Tokenized calendar approvals" },
      { id: "inbox_workflow", route: "/admin/workbench/email-command-center/gmail", purpose: "Gmail ingest + task intelligence" },
    ],
  };
}

export function runEmailOsProviderReadiness() {
  return buildEmailProviderReadinessReport();
}

export function runEmailOsCommunicationsBundle() {
  return loadCommunicationsBundle();
}

export function runEmailOsMassSendGuard(recipientCount: number): EmailOsMassSendGuardResult {
  const r = buildEmailProviderReadinessReport();
  const reasons = [...r.safety.massEmailBlockReasons];
  if (recipientCount > 1) reasons.push(`Recipient count ${recipientCount} requires ECC send execution + human SEND APPROVED`);
  if (!r.approvalEmail.sendEnabled) reasons.push("EMAIL_SEND_ENABLED is false");
  return {
    allowed: false,
    reasons,
    humanApprovalRequired: true,
  };
}

export function runEmailOsPreflightExplain(preflightJson: unknown) {
  return {
    checks: parsePreflightCheckRows(preflightJson),
    firstFailure: firstFailedPreflightCheckId(preflightJson),
    breakdown: parsePreflightRecipientBreakdown(preflightJson),
  };
}

export function runEmailOsDraftCritique(draft: Pick<MessageStudioLocalDraft, "subject" | "body" | "preheader">) {
  const minimal = createEmptyDraft({
    subject: draft.subject ?? "",
    body: draft.body ?? "",
    preheader: draft.preheader ?? "",
    title: "Email OS tool probe",
  });
  return buildDeterministicDraftCritique(minimal);
}

export function runEmailOsAutomationPolicyCatalog() {
  return AUTOMATION_POLICIES.map((p) => ({ id: p.id, title: p.title, mode: p.evaluationMode }));
}

export function runEmailOsGmailWatchReadiness() {
  return getGmailWatchProductionReadiness();
}

export function runEmailOsInboxAiReadiness() {
  return getEmailAiReadiness();
}

export function runEmailOsWorkflowTransitions(status: EmailWorkflowStatus = "NEW") {
  return getEmailWorkflowAllowedManualTransitions(status);
}

export function runEmailOsContactSources() {
  return discoverContactSources();
}

export function runEmailOsStoreHealth() {
  const store = loadCommunicationsStore();
  return {
    contacts: store.contacts.length,
    suppressions: store.suppressions.length,
    sends: store.sends.length,
    templates: store.templates?.length ?? 0,
  };
}

export function runEmailOsIntelligenceContext() {
  return composeCommunicationsIntelligenceContext();
}

export function runEmailOsRelationshipGraph() {
  return buildRelationshipGraph(false);
}

export function runEmailOsSequence(type: "volunteer_onboarding" | "host_onboarding" | "event_followup" = "volunteer_onboarding") {
  return buildCommunicationSequence(type, "Email OS probe audience");
}

export function runEmailOsWritingRouter() {
  return routeCampaignWriting({ audience: "volunteer", purpose: "welcome", urgency: "low" });
}

export function runEmailOsImportRowCheck(row: NormalizedImportRow) {
  return {
    validation: validateContactImportRow(row),
    duplicateMapSize: detectImportDuplicates([row]).size,
  };
}

export function runEmailOsCrossRailChecklist() {
  const bundle = loadCommunicationsBundle();
  const readiness = buildEmailProviderReadinessReport();
  return {
    massBlocked: bundle.massEmailStatus === "blocked",
    sendEnabled: readiness.approvalEmail.sendEnabled,
    broadcastAllowed: readiness.sendGrid.broadcastAllowed,
    risks: bundle.risks,
    steps: readiness.recommendedNextSteps,
    routes: ECC_ROUTES,
  };
}
