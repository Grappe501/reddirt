import { discoverContactSources, countUnifiedSources } from "./contact-source-discovery";
import { buildEmailProviderReadinessReport } from "./email-provider-readiness";
import { ensureDefaultTemplates, loadCommunicationsStore } from "./communications-store";

export type CommunicationsBundle = {
  readiness: ReturnType<typeof buildEmailProviderReadinessReport>;
  sources: ReturnType<typeof discoverContactSources>;
  unifiedSourceCount: number;
  store: ReturnType<typeof loadCommunicationsStore>;
  templates: ReturnType<typeof ensureDefaultTemplates>;
  risks: string[];
  volunteerWorkflowReadiness: "scaffolded" | "partial" | "ready";
  teamWorkflowReadiness: "scaffolded" | "partial" | "ready";
  massEmailStatus: "blocked" | "gated";
};

export function loadCommunicationsBundle(): CommunicationsBundle {
  const readiness = buildEmailProviderReadinessReport();
  const sources = discoverContactSources();
  const templates = ensureDefaultTemplates();
  const store = loadCommunicationsStore();

  const risks: string[] = [];
  if (!readiness.sendGrid.apiKeyConfigured) risks.push("SendGrid API key not configured");
  if (!readiness.sendGrid.asmGroupConfigured) risks.push("Unsubscribe ASM group missing — broadcast unsafe");
  if (!readiness.approvalEmail.sendEnabled) risks.push("Approval email send disabled (EMAIL_SEND_ENABLED)");
  if (store.suppressions.length === 0) risks.push("No suppressions in V1 JSON store yet — use ECC SendGridSuppression for production");
  risks.push("Three outbound rails (ECC, comms workbench, approval) — operators need one checklist");

  return {
    readiness,
    sources,
    unifiedSourceCount: countUnifiedSources(sources),
    store,
    templates,
    risks,
    volunteerWorkflowReadiness: readiness.safety.testSendPossible ? "partial" : "scaffolded",
    teamWorkflowReadiness: "partial",
    massEmailStatus: "blocked",
  };
}
