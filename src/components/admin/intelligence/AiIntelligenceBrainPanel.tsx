import Link from "next/link";
import type { DailyIntelligencePacket } from "@/lib/intelligence/intelligenceAgentOrchestrator";

const card = "rounded-xl border border-kelly-text/10 bg-white p-4";

export function AiIntelligenceBrainPanel({ packet }: { packet: DailyIntelligencePacket }) {
  return (
    <section className="mb-6 rounded-2xl border-2 border-violet-800/30 bg-violet-50/40 p-5">
      <header className="mb-4 border-b border-violet-900/10 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-900">AI Intelligence Brain</p>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Daily intelligence packet</h2>
        <p className="mt-1 text-xs text-kelly-muted">
          Run {packet.runId} · {new Date(packet.generatedAt).toLocaleString()} ·{" "}
          <span className="font-bold text-amber-900">INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED</span>
        </p>
        <p className="mt-1 text-[10px] text-violet-900">{packet.confidenceSummary}</p>
      </header>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Debate readiness</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{packet.debateReadinessOverall}/100</p>
          <p className="text-xs text-kelly-muted">Computed — see debate command</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">County rollup</p>
          <p className="text-xs text-kelly-muted">
            Shell: {packet.countyReadinessRollup.SHELL_ONLY ?? 0} · Internal:{" "}
            {packet.countyReadinessRollup.INTERNAL_PLANNING_ONLY ?? 0} · Deploy-ready:{" "}
            {packet.countyReadinessRollup.DEPLOYMENT_READY ?? 0}
          </p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Queue sync</p>
          <p className="text-xs text-kelly-muted">{packet.actionsSynced} agent recommendations merged (PENDING_REVIEW)</p>
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <article className={card}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Today&apos;s top priorities</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-xs text-kelly-muted">
            {packet.topPriorities.map((p) => (
              <li key={p.rank}>
                <span className="font-semibold text-kelly-text">{p.title}</span> — {p.summary}
                <p className="text-[10px] text-violet-900">
                  {p.subsystem} · confidence {p.confidence} · {p.humanNextAction}
                </p>
              </li>
            ))}
          </ol>
        </article>

        <article className={card}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Debate + opposition</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {packet.debatePrepPriorities.slice(0, 4).map((p) => (
              <li key={p.title}>{p.title}: {p.humanNextAction}</li>
            ))}
            {packet.oppositionResearchPriorities.map((p) => (
              <li key={p.title}>{p.title}: {p.humanNextAction}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className={`${card} mb-4`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Governance warnings</h3>
        <ul className="mt-2 list-inside list-disc text-xs text-amber-950">
          {packet.governanceWarnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
          {packet.risksAndGovernanceWarnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-kelly-subtle">{packet.productionJsonPersistenceNote}</p>
      </article>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link href="/admin/intelligence/action-queue" className="rounded border border-kelly-navy/30 bg-kelly-navy px-3 py-1 font-bold text-white">
          Human action queue
        </Link>
        <Link href="/admin/intelligence/llm-review-queue" className="rounded border px-3 py-1 font-semibold text-kelly-navy">
          LLM review queue
        </Link>
        <Link href="/admin/intelligence/debate-command" className="rounded border px-3 py-1 font-semibold text-kelly-navy">
          Debate command
        </Link>
        <Link href="/admin/intelligence/kim-hammer/debate-ai-workbench" className="rounded border px-3 py-1 font-semibold text-kelly-navy">
          Generate internal draft (governed)
        </Link>
        <Link href="/admin/county-intelligence" className="rounded border px-3 py-1 font-semibold text-kelly-navy">
          County workbench
        </Link>
      </div>
    </section>
  );
}
