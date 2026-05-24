import Link from "next/link";
import type { RoleCopilotNetworkState } from "@/lib/agents/orchestration/role-copilots/role-copilot-types";

export function OrchestrationRoleCopilotPanel({ state }: { state: RoleCopilotNetworkState }) {
  const active = state.activeRoleBriefing;
  return (
    <section className="rounded-2xl border border-blue-900/15 bg-gradient-to-br from-blue-50/50 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-kelly-navy">Role Copilot Network</h2>
          <p className="mt-2 text-sm text-kelly-muted">{state.summary}</p>
          <p className="mt-1 text-xs font-bold text-amber-900">
            Role plans are read-only and preparation-only. No send, submit, export, calendar write, finance post, or production mutation controls.
          </p>
        </div>
        <Link href="/api/agents/role-copilot-state?role=campaign_manager&period=2026-04" className="text-xs font-bold text-kelly-navy underline">
          Role API
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {state.roles.slice(0, 15).map((role) => (
          <Link
            key={role.id}
            href={`/api/agents/role-copilot-state?role=${role.id}&period=2026-04`}
            className={`rounded-full border px-2 py-1 font-bold ${active?.role.id === role.id ? "bg-kelly-navy text-white" : "bg-white text-kelly-navy"}`}
          >
            {role.label}
          </Link>
        ))}
      </div>

      {active ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-white/70 p-3">
            <h3 className="text-xs font-bold uppercase text-kelly-muted">Active role briefing</h3>
            <p className="mt-1 font-bold text-kelly-navy">{active.role.label}</p>
            <p className="mt-1 text-sm text-kelly-muted">{active.executiveSummary}</p>
            <ul className="mt-3 space-y-1 text-xs text-kelly-muted">
              {active.topPriorities.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border bg-white/70 p-3">
            <h3 className="text-xs font-bold uppercase text-kelly-muted">Recommended tools</h3>
            <ul className="mt-2 space-y-2 text-xs">
              {active.recommendedTools.slice(0, 5).map((tool) => (
                <li key={tool.id}>
                  <span className="font-bold text-kelly-navy">{tool.title}</span>
                  <p className="text-kelly-muted">{tool.whyNow}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border bg-white/70 p-3">
            <h3 className="text-xs font-bold uppercase text-kelly-muted">Workflows + training</h3>
            <ul className="mt-2 space-y-2 text-xs text-kelly-muted">
              {active.recommendedWorkflows.map((w) => (
                <li key={w.id}>
                  <span className="font-bold text-kelly-navy">{w.title}</span> · canExecuteNow: {String(w.canExecuteNow)}
                </li>
              ))}
              {state.roleTraining
                .filter((t) => t.roleId === active.role.id)
                .map((t) => (
                  <li key={t.roleId}>
                    Training level {t.currentAssumedLevel}: {t.recommendedTrainingModule}
                  </li>
                ))}
            </ul>
          </div>

          <div className="rounded-lg border bg-white/70 p-3">
            <h3 className="text-xs font-bold uppercase text-kelly-muted">Learning prompts + approvals</h3>
            <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
              {active.learningPrompts.slice(0, 4).map((prompt) => (
                <li key={prompt.id}>{prompt.prompt}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-bold text-amber-900">
              Approval boundaries: {active.pendingApprovals.slice(0, 3).join("; ") || "Human gate required for restricted actions."}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
