import Link from "next/link";
import { countMasterRegistryByStatus, listMasterRegistryTools } from "@/lib/agents/master-tool-registry";
import { analyzeCampaignGaps } from "@/lib/agents/campaign-intelligence/campaign-gap-analyzer";
import { loadNextActionsForPage } from "@/lib/agents/user-intelligence/load-next-actions";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { AGENT_INTELLIGENCE_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-agent-intelligence-tools";
import { CAMPAIGN_AI_HUMAN_CONTROL_RULES } from "@/lib/campaign-events/ai-tools/tool-contract";
import { AgentNextActionPanel } from "@/components/admin/campaign-events/AgentNextActionPanel";
import { DEFAULT_WRITING_PROFILE } from "@/lib/agents/writing-agent/writing-profile";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";

const AGENT_READINESS_PCT = 62;

export async function AiCommandCenterHub() {
  const counts = countMasterRegistryByStatus();
  const agentTools = AGENT_INTELLIGENCE_TOOL_CONTRACTS.length;
  const functionalAgent = AGENT_INTELLIGENCE_TOOL_CONTRACTS.filter((t) => t.currentStatus === "functional").length;
  const { snapshot } = await loadCampaignEventsDashboard("2026-03");
  const gaps = analyzeCampaignGaps({ snapshot, readinessScore: null });
  const nextActions = loadNextActionsForPage({
    role: "operator",
    pathname: "/admin/ai-command-center",
    period: snapshot.period,
    snapshot,
  });
  const uxObsCount = loadGlobalUserObservations().length;

  const sections = [
    { title: "User Intelligence", count: AGENT_INTELLIGENCE_TOOL_CONTRACTS.filter((t) => t.lifecycle === "agent_user_intelligence").length },
    { title: "Writing Agent", count: AGENT_INTELLIGENCE_TOOL_CONTRACTS.filter((t) => t.lifecycle === "agent_writing").length },
    { title: "UX Psychology", count: AGENT_INTELLIGENCE_TOOL_CONTRACTS.filter((t) => t.lifecycle === "agent_ux_intelligence").length },
    { title: "Campaign Intelligence", count: AGENT_INTELLIGENCE_TOOL_CONTRACTS.filter((t) => t.lifecycle === "agent_campaign_intelligence").length },
    { title: "System Orchestration", count: AGENT_INTELLIGENCE_TOOL_CONTRACTS.filter((t) => t.lifecycle === "agent_system_intelligence").length },
  ];

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/20 bg-kelly-navy/[0.05] p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-kelly-slate">Agent Intelligence Sprint 1</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">All-knowing agent command center</h1>
        <p className="mt-3 max-w-2xl text-sm text-kelly-text/75">
          Experience orchestration layer: personas, next actions, writing voice scaffold, microcopy, gap analysis, and{" "}
          {agentTools} new tool contracts. Agent readiness ~{AGENT_READINESS_PCT}% (V1 deterministic).
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/campaign-events/ai-tools" className="rounded-full bg-kelly-navy px-5 py-2 text-sm font-bold text-white">
            Full tool catalog ({counts.total})
          </Link>
          <Link href="/admin/campaign-manager-dashboard" className="rounded-full border px-5 py-2 text-sm font-bold">
            CM dashboard
          </Link>
        </div>
      </header>

      <AgentNextActionPanel actions={nextActions} />

      <section id="gaps" className="rounded-2xl border border-amber-600/25 bg-amber-50/80 p-5 text-sm text-amber-950">
        <h2 className="font-heading text-lg font-bold">Campaign gap analyzer</h2>
        <p className="mt-2 font-semibold">{gaps.highestImpact.title}</p>
        <p className="mt-1">{gaps.highestImpact.whyItMatters}</p>
        <p className="mt-2 text-xs">
          <strong>Action:</strong> {gaps.highestImpact.recommendedAction} · <strong>Who:</strong> {gaps.highestImpact.whoShouldAct}
        </p>
        <p className="mt-1 text-xs">Routes: {gaps.highestImpact.affectedRoutes.join(", ")}</p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-lg font-bold">Agent readiness</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-bold text-kelly-slate">Catalog tools</dt>
            <dd className="text-2xl font-bold">{counts.total}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-kelly-slate">Sprint 1 agent tools</dt>
            <dd className="text-2xl font-bold">
              {agentTools} <span className="text-sm font-normal">({functionalAgent} functional)</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-kelly-slate">UX observations logged</dt>
            <dd className="text-2xl font-bold">{uxObsCount}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
          <h2 className="font-heading font-bold">What the agent knows</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-text/70">
            <li>12 operator personas with goals and overwhelm rules</li>
            <li>Dashboard snapshots and calendar sync truth</li>
            <li>Writing profile defaults + accepted-edit log path</li>
            <li>{sections.reduce((n, s) => n + s.count, 0)} intelligence tool contracts</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
          <h2 className="font-heading font-bold">What it cannot do yet</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-text/70">
            <li>Autonomous email/SMS send or Google Calendar writes</li>
            <li>External behavioral profiling or voter manipulation</li>
            <li>Full Kelly Agent + compliance registry import</li>
            <li>LLM writing — deterministic V1 only</li>
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading font-bold">Writing agent (V1 profile)</h2>
        <p className="mt-2 text-xs text-kelly-text/70">
          Tone: {DEFAULT_WRITING_PROFILE.preferredTone} · Themes: {DEFAULT_WRITING_PROFILE.campaignThemes.slice(0, 2).join(", ")}
        </p>
        <p className="mt-1 text-xs italic">{DEFAULT_WRITING_PROFILE.candidateVoiceNotes}</p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading font-bold">Tool orchestration lanes</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {sections.map((s) => (
            <li key={s.title} className="flex justify-between rounded-lg border px-3 py-2">
              <span>{s.title}</span>
              <span className="font-bold">{s.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-red-200/40 bg-red-50/50 p-5 text-sm">
        <h2 className="font-heading font-bold text-red-950">Human-control limits</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-red-900/80">
          {CAMPAIGN_AI_HUMAN_CONTROL_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 text-xs text-kelly-text/55">
        <p className="font-bold text-kelly-slate">Docs</p>
        <p className="mt-1">USER_INTELLIGENCE_AGENT_ARCHITECTURE.md · WRITING_AGENT_ARCHITECTURE.md · UX_PSYCHOLOGY_AND_PATHWAY_TOOLS.md · ALL_KNOWING_AGENT_COMMAND_CENTER.md</p>
      </section>
    </div>
  );
}
