import Link from "next/link";
import {
  KH4_NON_PUBLISHABLE_LABEL,
  loadKimHammerKh4SuggestionAgents,
} from "@/lib/opposition/kimHammerKh4SuggestionAgents";

export default async function KimHammerKh4AgentToolsPage() {
  const data = loadKimHammerKh4SuggestionAgents();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          KH-4 Read-Only Suggestion Agents
        </p>
        <h1 className="font-heading text-2xl font-bold">Evidence Governance Copilot Registry</h1>
        <p className="mt-2 max-w-4xl text-xs text-kelly-muted">
          Read-only operator catalog sourced from `kim-hammer-kh4-agent-tools.json`. No live execution,
          claim generation, or auto-publishing on this page.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-xs text-amber-950">
        <p className="font-bold uppercase tracking-wider">{KH4_NON_PUBLISHABLE_LABEL}</p>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Registered agents</p>
          <p className="mt-1 text-xl font-bold">{data.readiness.registeredAgents}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Export-ready claims</p>
          <p className="mt-1 text-xl font-bold">{data.readiness.exportReadyClaims}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Retrieval suggestions</p>
          <p className="mt-1 text-xl font-bold">{data.readiness.retrievalSuggestions}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Safety rules</p>
          <p className="mt-1 text-xl font-bold">{data.readiness.publicationSafetyRules}</p>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Global guardrails</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.globalGuardrails.map((guardrail) => (
            <li key={guardrail}>{guardrail}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4">
        {data.agents.map((agent) => (
          <article key={agent.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-kelly-navy">{agent.name}</h2>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                {agent.publicationStatus.replaceAll("_", " ")}
              </span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                Human review required
              </span>
            </div>
            <p className="mt-2 text-kelly-muted">{agent.purpose}</p>
            <p className="mt-2 font-semibold text-kelly-navy">Input sources</p>
            <ul className="mt-1 list-inside list-disc text-kelly-muted">
              {agent.inputSources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
            <p className="mt-2 font-semibold text-kelly-navy">Output type</p>
            <p className="mt-1 text-kelly-muted">{agent.outputType}</p>
            <p className="mt-2 font-semibold text-kelly-navy">Next operator action</p>
            <p className="mt-1 text-kelly-muted">{agent.nextOperatorAction}</p>
            {agent.registryAgentId ? (
              <p className="mt-2 text-[10px] text-kelly-subtle">Registry ID: {agent.registryAgentId}</p>
            ) : null}
          </article>
        ))}
      </section>

      <section className="mt-6 flex flex-wrap gap-2 text-xs">
        <Link
          href="/admin/intelligence/kim-hammer/evidence-command"
          className="rounded border px-2 py-1 font-semibold text-kelly-navy"
        >
          Evidence Command Center
        </Link>
        <Link
          href="/admin/intelligence/kim-hammer/debate-packet-export"
          className="rounded border px-2 py-1 font-semibold text-kelly-navy"
        >
          Debate packet export
        </Link>
      </section>
    </div>
  );
}
