/**
 * Master orchestration signal loader — Phase 2 will wire live domain bundles.
 * V1: graceful degradation; missing domains become blockers, never throws.
 */

import type { CampaignState } from "./campaign-state-types";
import { buildSkeletonCampaignState } from "./campaign-state-types";

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

/** Planned loaders (Phase 2+) — stubs return null until wired. */
export async function loadCampaignOrchestrationSignals(
  period = "2026-04",
  options?: { includeOsControl?: boolean },
): Promise<{ bundle: OrchestrationSignalBundle; state: CampaignState }> {
  const includeOs = options?.includeOsControl !== false;
  const slices: OrchestrationSignalSlice<unknown>[] = [];

  if (includeOs) {
    slices.push(
      await loadSlice("os_control", async () => {
        const { loadOsControlBundle } = await import("@/lib/agents/os-control/load-os-control-bundle");
        return loadOsControlBundle(period, { emitObservation: false });
      }),
    );
  }

  slices.push(
    await loadSlice("unified_context", async () => {
      const { assembleUnifiedCampaignContext } = await import(
        "@/lib/agents/campaign-intelligence/unified-campaign-context-assembler"
      );
      return assembleUnifiedCampaignContext({ period });
    }),
    await loadSlice("county", async () => {
      const { composeCountyDashboardContext } = await import(
        "@/lib/agents/county-intelligence/county-intelligence-engine"
      );
      return composeCountyDashboardContext();
    }),
    await loadSlice("communications", async () => {
      const { composeCommunicationsIntelligenceContext } = await import(
        "@/lib/communications/communications-intelligence-engine"
      );
      return composeCommunicationsIntelligenceContext();
    }),
    await loadSlice("observations", async () => {
      const { loadGlobalUserObservations } = await import("@/lib/agents/user-intelligence/user-observations");
      return loadGlobalUserObservations().slice(-50);
    }),
    await loadSlice("tool_builder", async () => {
      const { loadToolBuildQueue } = await import("@/lib/agents/tool-builder/tool-builder-queue");
      return loadToolBuildQueue();
    }),
  );

  const errors = slices.filter((s) => !s.ok).map((s) => `${s.domain}: ${s.error ?? "failed"}`);
  const state = buildSkeletonCampaignState(period);
  state.signalLoadErrors = errors;
  if (errors.length) {
    state.activeBlockers.push({
      id: "signal-load-partial",
      domainId: "campaign_management",
      severity: "P1",
      message: `Partial signal load (${errors.length} domain(s) failed)`,
    });
  }

  const osSlice = slices.find((s) => s.domain === "os_control" && s.ok);
  if (osSlice?.data && typeof osSlice.data === "object" && osSlice.data !== null && "state" in osSlice.data) {
    const os = osSlice.data as { state: { systemHealthScore?: number; activeBlockers?: { message: string }[] } };
    if (typeof os.state.systemHealthScore === "number") {
      state.operationalReadiness = os.state.systemHealthScore;
      state.overallHealth = os.state.systemHealthScore >= 80 ? "strong" : os.state.systemHealthScore >= 60 ? "stable" : "weak";
    }
    if (Array.isArray(os.state.activeBlockers)) {
      for (const b of os.state.activeBlockers.slice(0, 5)) {
        state.activeBlockers.push({
          id: `os-${state.activeBlockers.length}`,
          domainId: "campaign_management",
          severity: "P1",
          message: b.message,
        });
      }
    }
  }

  state.observationSummary =
    errors.length === 0
      ? `Signals loaded for period ${period} (${slices.length} domains).`
      : `Signals partial: ${slices.filter((s) => s.ok).length}/${slices.length} OK.`;

  return {
    bundle: { period, loadedAt: new Date().toISOString(), slices, errors },
    state,
  };
}
