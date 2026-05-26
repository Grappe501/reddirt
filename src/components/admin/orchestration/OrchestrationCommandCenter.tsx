import Link from "next/link";
import type { OrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";
import { OrchestrationExecutiveSummaryCard } from "./OrchestrationExecutiveSummaryCard";
import { OrchestrationTopMoves } from "./OrchestrationTopMoves";
import { OrchestrationSourceHealthGrid } from "./OrchestrationSourceHealthGrid";
import { OrchestrationBlockersRisksOpportunities } from "./OrchestrationBlockersPanel";
import { OrchestrationWorkflowPanel } from "./OrchestrationWorkflowPanel";
import { OrchestrationDomainStatusGrid } from "./OrchestrationDomainStatusGrid";
import { OrchestrationLearningPanel } from "./OrchestrationLearningPanel";
import { OrchestrationKnowledgeMemoryPanel } from "./OrchestrationKnowledgeMemoryPanel";
import { OrchestrationAgentToolingPanel } from "./OrchestrationAgentToolingPanel";
import { OrchestrationFeedbackLoopPanel } from "./OrchestrationFeedbackLoopPanel";
import { OrchestrationCrossDomainPanel } from "./OrchestrationCrossDomainPanel";
import { OrchestrationRoleCopilotPanel } from "./OrchestrationRoleCopilotPanel";
import { OrchestrationSafetyGateCard } from "./OrchestrationSafetyGateCard";
import { OrchestrationCountyAgentRuntimePanel } from "./OrchestrationCountyAgentRuntimePanel";
import { OrchestrationCampaignManagerAnalysisPanel } from "./OrchestrationCampaignManagerAnalysisPanel";

export function OrchestrationCommandCenter({ payload }: { payload: OrchestrationStatePayload }) {
  const { campaignState, meta, sourceHealth } = payload;
  const readyCount = sourceHealth.filter((s) => s.status === "ready").length;
  const roleActions = payload.campaignState.roleActions[meta.role] ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16 font-body text-kelly-text">
      <header className="border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Kelly Campaign OS · Orchestration</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Campaign Orchestration Command Center</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          Live AI-readable campaign state, diagnosis, workflows, blockers, risks, and recommended next moves.
        </p>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-kelly-muted">
          <div>
            <dt className="inline font-bold">Generated </dt>
            <dd className="inline">{new Date(payload.generatedAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="inline font-bold">Period </dt>
            <dd className="inline">{meta.period}</dd>
          </div>
          <div>
            <dt className="inline font-bold">Role </dt>
            <dd className="inline">{meta.role.replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt className="inline font-bold">Mode </dt>
            <dd className="inline">{campaignState.operatingMode}</dd>
          </div>
          <div>
            <dt className="inline font-bold">Live </dt>
            <dd className="inline">{campaignState.isLive ? "yes" : "no"}</dd>
          </div>
          <div>
            <dt className="inline font-bold">Sources </dt>
            <dd className="inline">
              {readyCount}/{sourceHealth.length} ready
            </dd>
          </div>
        </dl>
        {!payload.ok ? (
          <p className="mt-2 text-xs font-bold text-amber-900">
            Partial load — {payload.errors?.join("; ") ?? "some signals unavailable"}
          </p>
        ) : null}
        <p className="mt-3 text-xs">
          <Link href="/admin/ai-command-center" className="font-bold text-kelly-navy underline">
            AI command center
          </Link>
          {" · "}
          <Link href="/api/agents/campaign-knowledge-state" className="font-bold text-kelly-navy underline">
            Knowledge API
          </Link>
          {" · "}
          <Link href="/api/agents/orchestration-tooling-state" className="font-bold text-kelly-navy underline">
            Tooling API
          </Link>
        </p>
      </header>

      <OrchestrationExecutiveSummaryCard payload={payload} />
      <OrchestrationTopMoves payload={payload} />
      <OrchestrationSourceHealthGrid sources={sourceHealth} />
      <OrchestrationBlockersRisksOpportunities payload={payload} />
      <OrchestrationWorkflowPanel workflows={payload.recommendedWorkflows} />

      {roleActions.length > 0 ? (
        <section className="rounded-2xl border p-5">
          <h2 className="text-sm font-bold text-kelly-navy">Role-specific next actions ({meta.role.replaceAll("_", " ")})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {roleActions.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 rounded-lg border px-3 py-2">
                <span>{a.title}</span>
                {a.route ? (
                  <Link href={a.route} className="text-xs font-bold underline">
                    View →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <OrchestrationDomainStatusGrid campaignState={campaignState} sourceHealth={sourceHealth} />
      <OrchestrationKnowledgeMemoryPanel knowledge={campaignState.knowledge} />
      <OrchestrationAgentToolingPanel tooling={payload.agentTooling} />
      <OrchestrationCountyAgentRuntimePanel runtime={payload.countyAgentRuntime} />
      <OrchestrationCampaignManagerAnalysisPanel analysis={payload.campaignManagerAnalysis} />
      <OrchestrationFeedbackLoopPanel payload={payload} />
      <OrchestrationCrossDomainPanel state={payload.crossDomainOrchestration} />
      <OrchestrationRoleCopilotPanel state={payload.campaignState.roleCopilots} />
      <OrchestrationLearningPanel insights={payload.learningInsights} />
      <OrchestrationSafetyGateCard safety={payload.safety} />
    </div>
  );
}
