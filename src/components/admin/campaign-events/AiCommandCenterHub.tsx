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
import { AgentCommandPalette } from "@/components/agents/AgentCommandPalette";
import { AiCommandCenterDisclosure } from "@/components/admin/campaign-events/AiCommandCenterDisclosure";
import { loadRuntimeAudit } from "@/lib/agents/runtime/runtime-audit";
import { SPRINT3_AGENT_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-agent-intelligence-3-tools";
import { summarizeAskKellyAdapter } from "@/lib/agents/adapters/ask-kelly-adapter";
import { summarizeKellyAgentAdapter } from "@/lib/agents/adapters/kelly-agent-adapter";
import { DEFAULT_WRITING_PROFILE } from "@/lib/agents/writing-agent/writing-profile";
import { loadCampaignLearningSnapshot } from "@/lib/campaign-events/hot-wash-intelligence/load-campaign-learning-snapshot";
import { SPRINT7_EVENT_INTELLIGENCE_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-event-intelligence-7-tools";
import { loadCampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import { SPRINT8_CAMPAIGN_FINANCE_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-campaign-finance-8-tools";
import { loadOsControlBundle } from "@/lib/agents/os-control/load-os-control-bundle";
import { CampaignOsControlPanel } from "./CampaignOsControlPanel";
import { AGENT_OS_CONTROL_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-agent-os-control-tools";
import { SPRINT9_DASHBOARD_NAV_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-dashboard-nav-9-tools";
import { ExecutiveSummaryStrip } from "@/components/admin/navigation/ExecutiveSummaryStrip";
import { WorkflowGuidanceCards } from "@/components/admin/navigation/WorkflowGuidanceCards";
import { loadDashboardNavigationBundle } from "@/lib/dashboard-orchestration/load-dashboard-navigation-bundle";
import { assembleUnifiedCampaignContext } from "@/lib/agents/campaign-intelligence/unified-campaign-context-assembler";
import { CampaignIntelligenceV3Panel } from "@/components/admin/campaign-intelligence/CampaignIntelligenceV3Panel";
import { SPRINT10_CAMPAIGN_INTELLIGENCE_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-10-campaign-intelligence-tools";
import { SPRINT_SINGLE_CAMPAIGN_HARDENING_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-single-campaign-hardening-tools";
import { scorePresentationReadiness } from "@/lib/agents/onboarding/presentation-readiness-scorer";
import { KELLY_CAMPAIGN_OS_TAGLINE } from "@/lib/campaign-tenancy/single-campaign-mode";
import { appendGlobalUserObservation } from "@/lib/agents/user-intelligence/user-observations";
import { KellyOsCompletionPlanPanel } from "@/components/admin/campaign-events/KellyOsCompletionPlanPanel";
import { composeCountyDashboardContext } from "@/lib/agents/county-intelligence/county-intelligence-engine";
import { CountyIntelligencePanel } from "@/components/admin/county-intelligence/CountyIntelligencePanel";
import { buildPowerOfFiveBriefing } from "@/lib/agents/county-intelligence/power-of-five-engine";
import { loadCommunicationsBundle } from "@/lib/campaign-events/communications/load-communications-bundle";
import { CommunicationsCommandCenterPanel } from "@/components/admin/campaign-events/CommunicationsCommandCenterPanel";
import { loadVolunteerSystemBundle } from "@/lib/campaign-events/volunteers/load-volunteer-bundle";
import { VolunteerIntelligencePanel } from "@/components/admin/volunteers/VolunteerIntelligencePanel";

const AGENT_READINESS_PCT = 86;

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
  const learning = await loadCampaignLearningSnapshot();
  const finance = await loadCampaignFinanceSnapshot(snapshot.period);
  const sprint2Tools = SPRINT2_AGENT_TOOL_CONTRACTS.length;
  const sprint1Tools = AGENT_INTELLIGENCE_TOOL_CONTRACTS.length;
  const sprint7Tools = SPRINT7_EVENT_INTELLIGENCE_TOOL_CONTRACTS.length;
  const sprint8Tools = SPRINT8_CAMPAIGN_FINANCE_TOOL_CONTRACTS.length;
  const osControl = await loadOsControlBundle(snapshot.period);
  const osControlSerialized = JSON.parse(JSON.stringify(osControl)) as typeof osControl;
  const osControlTools = AGENT_OS_CONTROL_TOOL_CONTRACTS.length;
  const sprint9Tools = SPRINT9_DASHBOARD_NAV_TOOL_CONTRACTS.length;
  const sprint10Tools = SPRINT10_CAMPAIGN_INTELLIGENCE_TOOL_CONTRACTS.length;
  const unified = await assembleUnifiedCampaignContext({ period: snapshot.period, pathname: "/admin/ai-command-center" });
  const presentation = scorePresentationReadiness(snapshot);
  const hardeningTools = SPRINT_SINGLE_CAMPAIGN_HARDENING_TOOL_CONTRACTS.length;
  const countyStatewide = composeCountyDashboardContext();
  const powerOfFiveBrief = buildPowerOfFiveBriefing();
  const communicationsBundle = loadCommunicationsBundle();
  const volunteerBundle = loadVolunteerSystemBundle();
  const navBundle = await loadDashboardNavigationBundle(snapshot.period, {
    pathname: "/admin/ai-command-center",
    surface: "command_center",
  });

  appendGlobalUserObservation({
    event: "executive_briefing_generated",
    actor: "system",
    role: "operator",
    pathname: "/admin/ai-command-center",
    meta: { readiness: unified.campaignReadinessIndex, momentum: unified.strategic.momentumScore },
  });
  if (unified.strategic.candidateOverloadRisk) {
    appendGlobalUserObservation({ event: "candidate_overload_detected", actor: "system", role: "operator", pathname: "/admin/ai-command-center" });
  }
  if (unified.operator.fatigueDetected) {
    appendGlobalUserObservation({ event: "operator_fatigue_detected", actor: "system", role: "operator", pathname: "/admin/ai-command-center" });
  }
  if (unified.strategic.strategicGaps.length) {
    appendGlobalUserObservation({ event: "strategic_gap_detected", actor: "system", role: "operator", pathname: "/admin/ai-command-center" });
  }

  return (
    <AgentObservationTracker role="operator" pathname="/admin/ai-command-center" period={snapshot.period}>
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 pb-16 font-body">
        <header className="rounded-3xl border border-kelly-navy/20 bg-kelly-navy/[0.05] p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-kelly-slate">{KELLY_CAMPAIGN_OS_TAGLINE}</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">Kelly Campaign OS — command center</h1>
        <p className="mt-3 max-w-2xl text-sm text-kelly-text/75">
          Strategic intelligence, supervised workflows, and on-demand dashboard blueprints for Kelly SOS.
          Presentation readiness: <strong>{presentation.score}/100</strong> ({presentation.label}).
        </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/onboarding" className="rounded-full bg-kelly-navy px-5 py-2 text-sm font-bold text-white">
              New user onboarding
            </Link>
            <Link href="/admin/ai-command-center/dashboard-builder" className="rounded-full border border-kelly-navy/30 px-5 py-2 text-sm font-bold text-kelly-navy">
              Dashboard builder
            </Link>
            <Link href="/admin/campaign-events/ai-tools" className="rounded-full border px-5 py-2 text-sm font-bold">
              Tool catalog ({counts.total})
            </Link>
            <Link href="/admin/campaign-manager-dashboard?month=2026-04" className="rounded-full border px-5 py-2 text-sm font-bold">
              CM dashboard
            </Link>
          </div>
          <p className="mt-3 text-[10px] text-kelly-subtle">
            Intelligence + OS control ({osControlTools}) + dashboard builder ({hardeningTools}) · human-gated only
          </p>
        </header>

      <KellyOsCompletionPlanPanel presentationScore={presentation.score} presentationLabel={presentation.label} />

      <CommunicationsCommandCenterPanel bundle={communicationsBundle} />

      <VolunteerIntelligencePanel bundle={volunteerBundle} />

      <CountyIntelligencePanel statewide={countyStatewide} />
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/60 p-4">
        <p className="text-xs font-bold text-kelly-navy">Power of 5 · statewide</p>
        <p className="mt-1 text-xs text-kelly-muted">{powerOfFiveBrief.narrative}</p>
        {powerOfFiveBrief.topGaps.length > 0 ? (
          <ul className="mt-2 text-[10px] text-kelly-muted">
            {powerOfFiveBrief.topGaps.slice(0, 5).map((g) => (
              <li key={g.countySlug}>
                {g.countyName}: gap {g.gap?.toLocaleString() ?? "planning"} ({g.priority})
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <CampaignIntelligenceV3Panel ctx={unified} />

      <ExecutiveSummaryStrip summary={navBundle.executiveSummary} />
      <WorkflowGuidanceCards cards={navBundle.guidanceCards} />

      <AgentCommandPalette role="operator" pathname="/admin/ai-command-center" period={snapshot.period} />

      <AgentNextActionPanel actions={bundle.nextActions} />

      <CampaignOsControlPanel bundle={osControlSerialized} />

      <AiCommandCenterDisclosure id="runtime" title="Runtime audit" defaultOpen={false}>
        <p className="text-xs">{loadRuntimeAudit().length} exchanges logged · Sprint 3 tools: {SPRINT3_AGENT_TOOL_CONTRACTS.length}</p>
        <Link href="/admin/ai-command-center/memory-review" className="mt-2 inline-block text-xs font-bold text-kelly-navy underline">
          Memory review queue →
        </Link>
        <p className="mt-2 text-[10px] text-kelly-subtle">{summarizeAskKellyAdapter()}</p>
        <p className="text-[10px] text-kelly-subtle">{summarizeKellyAgentAdapter()}</p>
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure id="observations" title="Live observations" defaultOpen>
          <p className="text-xs text-kelly-muted">
            {bundle.observations.length} total · {bundle.recent.length} recent · append-only JSON (metadata only).
          </p>
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-xs">
            {bundle.recent.length === 0 ? (
              <li className="text-kelly-subtle">No observations yet — use tracked dashboards to generate signals.</li>
            ) : (
              bundle.recent
                .slice()
                .reverse()
                .map((o) => (
                  <li key={o.id} className="rounded border border-kelly-text/10 px-2 py-1">
                    <span className="font-semibold">{USER_UX_EVENT_LABELS[o.event] ?? o.event}</span>
                    <span className="text-kelly-subtle"> · {o.role}</span>
                    {o.pathname ? <span className="text-kelly-subtle"> · {o.pathname}</span> : null}
                  </li>
                ))
            )}
          </ul>
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="learning" title="Campaign learning loop (Sprint 7)" defaultOpen>
          <p className="text-xs text-kelly-muted">
            County memory · event blueprints · messaging/issue trends from completed hot washes.
          </p>
          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <dt className="font-bold">Counties with signals</dt>
              <dd>{learning.countyCount}</dd>
            </div>
            <div>
              <dt className="font-bold">Event blueprints</dt>
              <dd>{learning.blueprintCount}</dd>
            </div>
            <div>
              <dt className="font-bold">Volunteer signals (rollup)</dt>
              <dd>{learning.volunteerSignals}</dd>
            </div>
            <div>
              <dt className="font-bold">Donor signals (rollup)</dt>
              <dd>{learning.donorSignals}</dd>
            </div>
          </dl>
          {learning.topIssues.length ? (
            <p className="mt-2 text-xs">
              <span className="font-bold">Top issues:</span> {learning.topIssues.slice(0, 5).join(" · ")}
            </p>
          ) : null}
          {learning.topFormats.length ? (
            <p className="mt-1 text-xs">
              <span className="font-bold">Strongest formats:</span> {learning.topFormats.slice(0, 4).join(" · ")}
            </p>
          ) : null}
          {learning.recurringBlockers.length ? (
            <p className="mt-1 text-xs text-amber-900">
              <span className="font-bold">Recurring blockers:</span> {learning.recurringBlockers.join(" · ")}
            </p>
          ) : null}
          <p className="mt-2 text-[10px] text-kelly-subtle">Sprint 7 tools: {sprint7Tools} · Complete hot wash on an event to feed memory.</p>
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="finance" title="Finance intelligence (Sprint 8)" defaultOpen>
          <p className="text-xs text-kelly-muted">Reimbursement pipeline · documentation health · county spend.</p>
          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <dt className="font-bold">Pipeline</dt>
              <dd>{finance.pipelineLabel}</dd>
            </div>
            <div>
              <dt className="font-bold">Approved reimbursement</dt>
              <dd>${finance.approvedReimbursement.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="font-bold">Pending receipts</dt>
              <dd>{finance.pendingReceipts}</dd>
            </div>
            <div>
              <dt className="font-bold">Exception flags</dt>
              <dd>{finance.exceptionCount}</dd>
            </div>
          </dl>
          {finance.topBlockers.length ? (
            <p className="mt-2 text-xs text-amber-900">
              <span className="font-bold">Blockers:</span> {finance.topBlockers.join(" · ")}
            </p>
          ) : null}
          {finance.countySpendNotes.length ? (
            <p className="mt-1 text-xs">
              <span className="font-bold">County spend:</span> {finance.countySpendNotes.join(" · ")}
            </p>
          ) : null}
          <p className="mt-2 text-[10px] text-kelly-subtle">Sprint 8 finance tools: {sprint8Tools}</p>
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
            <p className="mt-2 text-xs text-kelly-muted">No cross-domain blockers from snapshot.</p>
          )}
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="memory" title="Memory candidates" defaultOpen={false}>
          {bundle.memoryCandidates.length === 0 ? (
            <p className="text-xs text-kelly-muted">None flagged — high-risk memory always requires review.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {bundle.memoryCandidates.map((m, i) => (
                <li key={i} className="rounded border px-3 py-2">
                  <span className="font-bold">{m.memoryType}</span> · risk {m.riskLevel}
                  {m.requiresHumanReview ? " · needs review" : ""}
                  <p className="mt-1 text-kelly-muted">{m.reason}</p>
                  <p className="text-[10px] text-kelly-subtle">→ {m.suggestedStorageTarget}</p>
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
          <p className="mt-2 text-xs text-kelly-muted">Tools likely needed: {bundle.crossDomain.toolsLikelyNeeded.join(", ") || "—"}</p>
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="friction" title="Workflow friction" defaultOpen={false}>
          {bundle.friction.length === 0 ? (
            <p className="text-xs text-kelly-muted">No friction patterns detected yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {bundle.friction.map((f) => (
                <li key={`${f.frictionType}-${f.affectedRoute}`} className="rounded border border-orange-200/50 bg-orange-50/50 px-3 py-2">
                  <span className="font-bold">{f.frictionType}</span> ({f.severity}) ×{f.occurrenceCount}
                  <p className="mt-1">{f.suggestedUxFix}</p>
                  <p className="text-[10px] text-kelly-subtle">Tool: {f.suggestedAiTool}</p>
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
          <ul className="list-inside list-disc text-xs text-kelly-muted">
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
          <p className="mt-1 text-kelly-muted">
            {DEFAULT_WRITING_PROFILE.preferredTone} — observation hooks on edit surfaces (metadata only).
          </p>
          <p className="mt-2 text-kelly-subtle">
            Privacy: see AI_AGENT_OBSERVATION_AND_LEARNING_ROADMAP.md · test: npm run agents:test-observations
          </p>
        </section>
      </div>
    </AgentObservationTracker>
  );
}
