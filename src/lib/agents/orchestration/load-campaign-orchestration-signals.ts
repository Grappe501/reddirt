/**
 * Master orchestration signal loader — Phase 2A live intake.
 * Graceful degradation: missing source → blocker + sourceHealth, never throw.
 */

import { composeCountyDashboardContext } from "@/lib/agents/county-intelligence/county-intelligence-engine";
import { composeCrossDomainContext } from "@/lib/agents/orchestration/cross-domain-context-composer";
import { loadToolBuildQueue } from "@/lib/agents/tool-builder/tool-builder-queue";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import { buildEmailProviderReadinessReport } from "@/lib/campaign-events/communications/email-provider-readiness";
import { runEmailOsMassSendGuard } from "@/lib/campaign-events/ai-tools/email-os-tool-helpers";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { composeCommunicationsIntelligenceContext } from "@/lib/communications/communications-intelligence-engine";
import { buildToolExecutionReadinessSummary } from "@/lib/agents/os-control/tool-execution-readiness";
import type { CampaignState } from "./campaign-state-types";
import { buildCampaignStateFromSignals } from "./build-campaign-state-from-signals";
import { buildCampaignKnowledgeLayer } from "@/lib/agents/orchestration/knowledge/campaign-knowledge-state";
import { emptyCampaignKnowledgeSummary } from "@/lib/agents/orchestration/knowledge/campaign-knowledge-types";
import { buildFeedbackLoopState } from "@/lib/agents/orchestration/feedback/feedback-learning-engine";
import type { OrchestrationSourceHealth } from "./orchestration-source-health";
import { sourceHealthFromSlice } from "./orchestration-source-health";

export type OrchestrationSignalSlice<T> = {
  domain: string;
  ok: boolean;
  data: T | null;
  error?: string;
};

export type OrchestrationSignalBundle = {
  period: string;
  loadedAt: string;
  slices: OrchestrationSignalSlice<unknown>[];
  errors: string[];
};

export type OrchestrationSignalsResult = {
  bundle: OrchestrationSignalBundle;
  sourceHealth: OrchestrationSourceHealth[];
  state: CampaignState;
};

const SOURCE_LABELS: Record<string, string> = {
  os_control: "OS control bundle",
  unified_context: "Unified campaign context",
  county: "County intelligence V2",
  communications: "Communications intelligence V2",
  observations: "User observations",
  tool_builder: "Tool-builder queue",
  cross_domain: "Cross-domain context",
  events_dashboard: "Campaign events dashboard",
  email_os: "Email OS / ECC readiness",
  tool_registry: "Tool execution readiness",
  campaign_knowledge: "Campaign knowledge graph + lessons",
};

async function loadSlice<T>(
  domain: string,
  loader: () => Promise<T>,
): Promise<OrchestrationSignalSlice<T>> {
  try {
    const data = await loader();
    return { domain, ok: true, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { domain, ok: false, data: null, error: message };
  }
}

function syncSlice<T>(domain: string, loader: () => T): OrchestrationSignalSlice<T> {
  try {
    const data = loader();
    return { domain, ok: true, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { domain, ok: false, data: null, error: message };
  }
}

export async function loadCampaignOrchestrationSignals(
  period = "2026-04",
  options?: { includeOsControl?: boolean; pathname?: string; role?: CampaignUserRole },
): Promise<OrchestrationSignalsResult> {
  const includeOs = options?.includeOsControl !== false;
  const pathname = options?.pathname ?? "/admin/ai-command-center";
  const role = options?.role ?? "campaign_manager";
  const slices: OrchestrationSignalSlice<unknown>[] = [];

  if (includeOs) {
    slices.push(
      await loadSlice("os_control", async () => {
        const { loadOsControlBundle } = await import("@/lib/agents/os-control/load-os-control-bundle");
        return loadOsControlBundle(period, { emitObservation: false });
      }),
    );
  }

  const eventsSlice = await loadSlice("events_dashboard", () => loadCampaignEventsDashboard(period));
  slices.push(eventsSlice);

  slices.push(
    await loadSlice("unified_context", async () => {
      const { assembleUnifiedCampaignContext } = await import(
        "@/lib/agents/campaign-intelligence/unified-campaign-context-assembler"
      );
      return assembleUnifiedCampaignContext({ period, pathname });
    }),
    syncSlice("county", () => composeCountyDashboardContext()),
    syncSlice("communications", () => composeCommunicationsIntelligenceContext()),
    syncSlice("observations", () => loadGlobalUserObservations().slice(-50)),
    syncSlice("tool_builder", () => loadToolBuildQueue()),
    syncSlice("email_os", () => {
      const readiness = buildEmailProviderReadinessReport();
      const guard = runEmailOsMassSendGuard(500);
      return {
        sendEnabled: readiness.approvalEmail.sendEnabled,
        sendGridConfigured: readiness.sendGrid.apiKeyConfigured,
        massSendBlocked: !guard.allowed,
        generatedAt: new Date().toISOString(),
      };
    }),
    syncSlice("tool_registry", () => buildToolExecutionReadinessSummary(15)),
  );

  const eventsDash = eventsSlice.ok ? eventsSlice.data : null;

  slices.push(
    syncSlice("cross_domain", () =>
      composeCrossDomainContext({
        role,
        pathname,
        period,
        snapshot: eventsDash?.snapshot ?? null,
        syncStale: eventsDash?.snapshot?.calendarSync?.jsonStale,
        recentObservations: loadGlobalUserObservations().slice(-24),
      }),
    ),
  );

  const sourceHealth: OrchestrationSourceHealth[] = slices.map((s) =>
    sourceHealthFromSlice(
      s.domain,
      SOURCE_LABELS[s.domain] ?? s.domain,
      s.ok,
      s.data,
      s.error,
      [`src/lib/agents/orchestration/load-campaign-orchestration-signals.ts#${s.domain}`],
    ),
  );

  const errors = slices.filter((s) => !s.ok).map((s) => `${s.domain}: ${s.error ?? "failed"}`);
  const bundle: OrchestrationSignalBundle = {
    period,
    loadedAt: new Date().toISOString(),
    slices,
    errors,
  };

  let knowledge = emptyCampaignKnowledgeSummary();
  const feedbackLoop = buildFeedbackLoopState();
  const prelim = buildCampaignStateFromSignals(bundle, sourceHealth, knowledge, feedbackLoop);
  try {
    const kb = await buildCampaignKnowledgeLayer(prelim, sourceHealth, period, { persistGraph: true });
    knowledge = kb.summary;
    sourceHealth.push({
      sourceId: "campaign_knowledge",
      label: SOURCE_LABELS.campaign_knowledge,
      status: kb.graph.graphHealth.entityCount > 0 ? "ready" : "degraded",
      freshness: kb.graph.generatedAt,
      detail: `${kb.graph.graphHealth.entityCount} entities · ${kb.graph.graphHealth.lessonCount} lessons · confidence ${kb.graph.graphHealth.confidence}`,
    });
  } catch (e) {
    sourceHealth.push({
      sourceId: "campaign_knowledge",
      label: SOURCE_LABELS.campaign_knowledge,
      status: "error",
      detail: e instanceof Error ? e.message : "knowledge load failed",
    });
  }

  const state = buildCampaignStateFromSignals(bundle, sourceHealth, knowledge, feedbackLoop);

  return { bundle, sourceHealth, state };
}
