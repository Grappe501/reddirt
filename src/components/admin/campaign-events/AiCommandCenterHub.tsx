import Link from "next/link";
import { countMasterRegistryByStatus } from "@/lib/agents/master-tool-registry";
import { analyzeCampaignGaps } from "@/lib/agents/campaign-intelligence/campaign-gap-analyzer";
import { loadAgentIntelligenceBundle } from "@/lib/agents/orchestration/load-agent-intelligence-bundle";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { AGENT_INTELLIGENCE_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-agent-intelligence-tools";
import { SPRINT2_AGENT_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-agent-intelligence-2-tools";
import { CAMPAIGN_AI_HUMAN_CONTROL_RULES } from "@/lib/campaign-events/ai-tools/tool-contract";
import { USER_UX_EVENT_LABELS } from "@/lib/agents/user-intelligence/user-observations";
import { AgentNextActionPanel } from "@/components/admin/campaign-events/AgentNextActionPanel";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";
import { AiCommandCenterDisclosure } from "@/components/admin/campaign-events/AiCommandCenterDisclosure";
import { DEFAULT_WRITING_PROFILE } from "@/lib/agents/writing-agent/writing-profile";

const AGENT_READINESS_PCT = 78;

export async function AiCommandCenterHub() {
  const counts = countMasterRegistryByStatus();
  const { snapshot } = await loadCampaignEventsDashboard("2026-04");
  const bundle = loadAgentIntelligenceBundle({
    role: "operator",
    pathname: "/admin/ai-command-center",
    period: snapshot.period,
    snapshot,
  });
  const gaps = analyzeCampaignGaps({ snapshot, readinessScore: null });
  const sprint2Tools = SPRINT2_AGENT_TOOL_CONTRACTS.length;
  const sprint1Tools = AGENT_INTELLIGENCE_TOOL_CONTRACTS.length;

  return (
    <AgentObservationTracker role="operator" pathname="/admin/ai-command-center" period={snapshot.period}>
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 pb-16 font-body">
        <header className="rounded-3xl border border-kelly-navy/20 bg-kelly-navy/[0.05] p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-kelly-slate">Agent Intelligence Sprint 2</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">All-knowing agent command center</h1>
          <p className="mt-3 max-w-2xl text-sm text-kelly-text/75">
            Live observation, cross-domain context, friction detection, and memory planning — human-controlled. Readiness
            ~{AGENT_READINESS_PCT}%.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/campaign-events/ai-tools"
              className="rounded-full bg-kelly-navy px-5 py-2 text-sm font-bold text-white"
            >
              Full catalog ({counts.total})
            </Link>
            <Link href="/admin/campaign-manager-dashboard?month=2026-04" className="rounded-full border px-5 py-2 text-sm font-bold">
              CM dashboard
            </Link>
          </div>
        </header>

        <AgentNextActionPanel actions={bundle.nextActions} />

        <AiCommandCenterDisclosure id="observations" title="Live observations" defaultOpen>
          <p className="text-xs text-kelly-text/65">
            {bundle.observations.length} total · {bundle.recent.length} recent · append-only JSON (metadata only).
          </p>
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-xs">
            {bundle.recent.length === 0 ? (
              <li className="text-kelly-text/50">No observations yet — use tracked dashboards to generate signals.</li>
            ) : (
              bundle.recent
                .slice()
                .reverse()
                .map((o) => (
                  <li key={o.id} className="rounded border border-kelly-text/10 px-2 py-1">
                    <span className="font-semibold">{USER_UX_EVENT_LABELS[o.event] ?? o.event}</span>
                    <span className="text-kelly-text/50"> · {o.role}</span>
                    {o.pathname ? <span className="text-kelly-text/45"> · {o.pathname}</span> : null}
                  </li>
                ))
            )}
          </ul>
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="bottlenecks" title="Current bottlenecks" defaultOpen>
          <p className="font-semibold text-amber-950">{gaps.highestImpact.title}</p>
          <p className="mt-1 text-xs">{gaps.highestImpact.whyItMatters}</p>
          {bundle.crossDomain.currentBlockers.length ? (
            <ul className="mt-2 list-inside list-disc text-xs">
              {bundle.crossDomain.currentBlockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-kelly-text/55">No cross-domain blockers from snapshot.</p>
          )}
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="memory" title="Memory candidates" defaultOpen={false}>
          {bundle.memoryCandidates.length === 0 ? (
            <p className="text-xs text-kelly-text/55">None flagged — high-risk memory always requires review.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {bundle.memoryCandidates.map((m, i) => (
                <li key={i} className="rounded border px-3 py-2">
                  <span className="font-bold">{m.memoryType}</span> · risk {m.riskLevel}
                  {m.requiresHumanReview ? " · needs review" : ""}
                  <p className="mt-1 text-kelly-text/60">{m.reason}</p>
                  <p className="text-[10px] text-kelly-text/45">→ {m.suggestedStorageTarget}</p>
                </li>
              ))}
            </ul>
          )}
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="context" title="Cross-domain context" defaultOpen={false}>
          <p className="text-sm">{bundle.crossDomain.contextSummary}</p>
          <p className="mt-2 text-xs">
            Active: <strong>{bundle.crossDomain.activeDomain}</strong> · Related:{" "}
            {bundle.crossDomain.relatedDomains.join(", ")} · Confidence: {bundle.crossDomain.confidence}
          </p>
          <p className="mt-2 text-xs text-kelly-text/60">Tools likely needed: {bundle.crossDomain.toolsLikelyNeeded.join(", ") || "—"}</p>
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="friction" title="Workflow friction" defaultOpen={false}>
          {bundle.friction.length === 0 ? (
            <p className="text-xs text-kelly-text/55">No friction patterns detected yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {bundle.friction.map((f) => (
                <li key={`${f.frictionType}-${f.affectedRoute}`} className="rounded border border-orange-200/50 bg-orange-50/50 px-3 py-2">
                  <span className="font-bold">{f.frictionType}</span> ({f.severity}) ×{f.occurrenceCount}
                  <p className="mt-1">{f.suggestedUxFix}</p>
                  <p className="text-[10px] text-kelly-text/50">Tool: {f.suggestedAiTool}</p>
                </li>
              ))}
            </ul>
          )}
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="tools" title="Tool usage signals" defaultOpen={false}>
          {bundle.toolSignals.length === 0 ? (
            <p className="text-xs">No toolId observations yet.</p>
          ) : (
            <ul className="text-xs">
              {bundle.toolSignals.map((t) => (
                <li key={t.toolId}>
                  {t.toolId}: {t.count}
                </li>
              ))}
            </ul>
          )}
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="sprint" title="Sprint readiness" defaultOpen={false}>
          <dl className="grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <dt className="font-bold">Sprint 1 contracts</dt>
              <dd>{sprint1Tools}</dd>
            </div>
            <div>
              <dt className="font-bold">Sprint 2 contracts</dt>
              <dd>{sprint2Tools} (live observation layer)</dd>
            </div>
            <div>
              <dt className="font-bold">Catalog total</dt>
              <dd>{counts.total}</dd>
            </div>
            <div>
              <dt className="font-bold">UX observations</dt>
              <dd>{bundle.observations.length}</dd>
            </div>
          </dl>
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="ux" title="UX simplification opportunities" defaultOpen={false}>
          <ul className="list-inside list-disc text-xs text-kelly-text/70">
            <li>Expand MicrocopyHint on workbench filters and promotion workbench</li>
            <li>Surface travel queue count on reimbursement before print</li>
            <li>Reduce duplicate page visits via stronger primary next action</li>
          </ul>
        </AiCommandCenterDisclosure>

        <section className="rounded-2xl border border-red-200/40 bg-red-50/50 p-5 text-sm">
          <h2 className="font-heading font-bold text-red-950">Human approval guardrails</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-red-900/80">
            {CAMPAIGN_AI_HUMAN_CONTROL_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
            {bundle.crossDomain.humanApprovalReminders.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 text-xs">
          <p className="font-bold">Writing profile (V1)</p>
          <p className="mt-1 text-kelly-text/60">
            {DEFAULT_WRITING_PROFILE.preferredTone} — observation hooks on edit surfaces (metadata only).
          </p>
          <p className="mt-2 text-kelly-text/45">
            Privacy: see AI_AGENT_OBSERVATION_AND_LEARNING_ROADMAP.md · test: npm run agents:test-observations
          </p>
        </section>
      </div>
    </AgentObservationTracker>
  );
}
