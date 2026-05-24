/**
 * Route agent tool IDs to deterministic Email OS helpers (no send side effects).
 */
import { getContractById } from "./tool-contract";
import { SPRINT_EMAIL_OS_AGENT_TOOL_CONTRACTS } from "./sprint-email-os-agent-tools";
import {
  getEmailOsSuiteManifest,
  runEmailOsAutomationPolicyCatalog,
  runEmailOsCommunicationsBundle,
  runEmailOsContactSources,
  runEmailOsCrossRailChecklist,
  runEmailOsDraftCritique,
  runEmailOsGmailWatchReadiness,
  runEmailOsInboxAiReadiness,
  runEmailOsIntelligenceContext,
  runEmailOsMassSendGuard,
  runEmailOsPreflightExplain,
  runEmailOsProviderReadiness,
  runEmailOsRelationshipGraph,
  runEmailOsSequence,
  runEmailOsStoreHealth,
  runEmailOsWritingRouter,
  runEmailOsWorkflowTransitions,
} from "./email-os-tool-helpers";

export type EmailOsToolRouteResult = {
  toolId: string;
  ok: boolean;
  kind: "manifest" | "readiness" | "guard" | "draft" | "intelligence" | "unknown";
  payload: unknown;
  error?: string;
};

export function listRoutableEmailOsToolIds(): string[] {
  return SPRINT_EMAIL_OS_AGENT_TOOL_CONTRACTS.map((t) => t.id);
}

export function routeEmailOsAgentTool(
  toolId: string,
  input?: Record<string, unknown>,
): EmailOsToolRouteResult {
  const contract = getContractById(SPRINT_EMAIL_OS_AGENT_TOOL_CONTRACTS, toolId);
  if (!contract) {
    return { toolId, ok: false, kind: "unknown", payload: null, error: "Unknown Email OS tool id" };
  }

  try {
    switch (toolId) {
      case "email-os-suite-manifest":
      case "email-os-human-control-matrix":
        return {
          toolId,
          ok: true,
          kind: "manifest",
          payload: getEmailOsSuiteManifest(SPRINT_EMAIL_OS_AGENT_TOOL_CONTRACTS.length),
        };
      case "email-os-cross-rail-checklist":
        return { toolId, ok: true, kind: "readiness", payload: runEmailOsCrossRailChecklist() };
      case "email-provider-readiness-orchestrator":
      case "approval-send-readiness-bridge":
        return { toolId, ok: true, kind: "readiness", payload: runEmailOsProviderReadiness() };
      case "mass-send-block-enforcer": {
        const count = typeof input?.recipientCount === "number" ? input.recipientCount : 100;
        return { toolId, ok: true, kind: "guard", payload: runEmailOsMassSendGuard(count) };
      }
      case "send-execution-preflight-explainer":
      case "recipient-breakdown-explainer":
        return {
          toolId,
          ok: true,
          kind: "readiness",
          payload: runEmailOsPreflightExplain(input?.preflightJson),
        };
      case "deterministic-draft-critic":
      case "email-risk-compliance-scanner":
        return {
          toolId,
          ok: true,
          kind: "draft",
          payload: runEmailOsDraftCritique({
            subject: String(input?.subject ?? "Test subject"),
            body: String(input?.body ?? "Draft body for compliance scan."),
            preheader: String(input?.preheader ?? ""),
          }),
        };
      case "automation-policy-catalog-reader":
        return { toolId, ok: true, kind: "readiness", payload: runEmailOsAutomationPolicyCatalog() };
      case "gmail-watch-readiness-scanner":
        return { toolId, ok: true, kind: "readiness", payload: runEmailOsGmailWatchReadiness() };
      case "email-ai-readiness-checker":
        return { toolId, ok: true, kind: "readiness", payload: runEmailOsInboxAiReadiness() };
      case "email-workflow-governance-checker":
        return { toolId, ok: true, kind: "readiness", payload: runEmailOsWorkflowTransitions("NEW") };
      case "communications-bundle-orchestrator":
        return { toolId, ok: true, kind: "readiness", payload: runEmailOsCommunicationsBundle() };
      case "campaign-os-contact-store-auditor":
        return { toolId, ok: true, kind: "readiness", payload: runEmailOsStoreHealth() };
      case "contact-source-unifier":
        return { toolId, ok: true, kind: "readiness", payload: runEmailOsContactSources() };
      case "communications-intelligence-composer":
        return { toolId, ok: true, kind: "intelligence", payload: runEmailOsIntelligenceContext() };
      case "relationship-graph-email-bridge":
        return { toolId, ok: true, kind: "intelligence", payload: runEmailOsRelationshipGraph() };
      case "communication-sequence-email-packager":
        return { toolId, ok: true, kind: "intelligence", payload: runEmailOsSequence("volunteer_onboarding") };
      case "campaign-writing-router-ecc-bridge":
        return { toolId, ok: true, kind: "draft", payload: runEmailOsWritingRouter() };
      default:
        return {
          toolId,
          ok: true,
          kind: "manifest",
          payload: {
            contract: { id: contract.id, name: contract.name, helper: contract.deterministicHelperPath },
            note: "Tool registered — invoke helper module directly for full behavior",
          },
        };
    }
  } catch (e) {
    return {
      toolId,
      ok: false,
      kind: "unknown",
      payload: null,
      error: e instanceof Error ? e.message : "route failed",
    };
  }
}
