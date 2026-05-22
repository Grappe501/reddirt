import Link from "next/link";
import type { OsControlBundle } from "@/lib/agents/os-control/load-os-control-bundle";
import { AiCommandCenterDisclosure } from "./AiCommandCenterDisclosure";

function healthColor(score: number) {
  if (score >= 80) return "text-emerald-900 bg-emerald-50 border-emerald-200";
  if (score >= 55) return "text-amber-950 bg-amber-50 border-amber-200";
  return "text-red-950 bg-red-50 border-red-200";
}

export function CampaignOsControlPanel({ bundle }: { bundle: OsControlBundle }) {
  const { state, topMoves, preparedActions, gatesGated, gatesForbidden, toolBands, recentAudits } = bundle;

  return (
    <section className="rounded-3xl border-2 border-kelly-navy/25 bg-gradient-to-b from-kelly-navy/[0.06] to-kelly-page p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-slate">Campaign OS Control Layer</p>
      <p className="mt-1 font-body text-sm text-kelly-muted">
        Observe → interpret → plan → recommend → prepare → human approve → execute (gated) → audit → learn
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className={`rounded-2xl border px-5 py-3 ${healthColor(state.systemHealthScore)}`}>
          <p className="text-[10px] font-bold uppercase">System health</p>
          <p className="font-heading text-3xl font-bold">{state.systemHealthScore}</p>
        </div>
        <div className="min-w-[200px] flex-1 font-body text-sm">
          <p className="font-bold text-kelly-navy">Recommended workflow</p>
          <p className="text-kelly-text/75">{state.recommendedWorkflow}</p>
          <p className="mt-2 text-xs text-kelly-muted">Period {state.period} · {state.domainsNeedingAttention.join(", ") || "all domains steady"}</p>
        </div>
      </div>

      {state.activeBlockers.length ? (
        <ul className="mt-4 rounded-xl border border-amber-300/50 bg-amber-50/80 p-3 font-body text-xs text-amber-950">
          {state.activeBlockers.map((b) => (
            <li key={b}>⚠ {b}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 font-body text-xs text-emerald-900">No critical blockers detected in this snapshot.</p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AiCommandCenterDisclosure id="top-moves" title="Next 3 highest-impact moves" defaultOpen>
          <ol className="space-y-3 font-body text-sm">
            {topMoves.map((plan, i) => (
              <li key={plan.id} className="rounded-lg border border-kelly-text/10 bg-white/60 p-3">
                <p className="font-bold text-kelly-navy">
                  {i + 1}. {plan.title}
                </p>
                <p className="mt-1 text-xs text-kelly-muted">{plan.expectedOutcome}</p>
                <Link href={plan.steps[0]?.route ?? "#"} className="mt-2 inline-block text-xs font-bold underline">
                  Start → {plan.steps[0]?.title}
                </Link>
              </li>
            ))}
          </ol>
        </AiCommandCenterDisclosure>

        <AiCommandCenterDisclosure id="prepared" title="Prepared actions (human executes)" defaultOpen>
          <ul className="space-y-2 font-body text-xs">
            {preparedActions.map((a) => (
              <li key={a.id} className="rounded-lg border border-kelly-text/10 px-3 py-2">
                <p className="font-bold">{a.title}</p>
                <p className="text-kelly-muted">{a.preview}</p>
                <p className="mt-1">
                  <span className="rounded bg-kelly-navy/10 px-1.5 py-0.5 font-mono text-[10px]">{a.executionStatus}</span>
                  <span className="ml-2 text-kelly-subtle">{a.humanApprovalLabel}</span>
                </p>
                <Link href={a.reviewRoute} className="mt-1 inline-block font-bold text-kelly-navy underline">
                  Review route →
                </Link>
              </li>
            ))}
          </ul>
        </AiCommandCenterDisclosure>
      </div>

      <AiCommandCenterDisclosure id="gates" title="Human approval gates" defaultOpen={false}>
        <div className="grid gap-3 sm:grid-cols-3 font-body text-[11px]">
          <div>
            <p className="font-bold text-emerald-900">Safe ({bundle.gatesSafe.length})</p>
            <ul className="mt-1 list-inside list-disc text-kelly-muted">
              {bundle.gatesSafe.slice(0, 5).map((g) => (
                <li key={g.actionId}>{g.label}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-amber-900">Gated ({gatesGated.length})</p>
            <ul className="mt-1 list-inside list-disc text-kelly-muted">
              {gatesGated.slice(0, 6).map((g) => (
                <li key={g.actionId}>{g.label}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-red-900">Forbidden ({gatesForbidden.length})</p>
            <ul className="mt-1 list-inside list-disc text-kelly-muted">
              {gatesForbidden.map((g) => (
                <li key={g.actionId}>{g.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure id="tool-readiness" title="Tool execution readiness (sample)" defaultOpen={false}>
        <p className="text-xs text-kelly-muted">
          Can execute: {toolBands.canExecute} · Prepare-only: {toolBands.canPrepareOnly} · With blockers: {toolBands.blocked}
        </p>
        <ul className="mt-2 max-h-40 overflow-y-auto font-mono text-[10px]">
          {bundle.toolReadiness.slice(0, 12).map((t) => (
            <li key={t.toolId} className="border-b border-kelly-text/5 py-1">
              {t.toolId}: {t.canExecute ? "execute" : t.canPrepare ? "prepare" : "read"} {t.currentBlocker ? `· ${t.currentBlocker}` : ""}
            </li>
          ))}
        </ul>
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure id="audit" title="Recent agent audits" defaultOpen={false}>
        {recentAudits.length === 0 ? (
          <p className="text-xs text-kelly-muted">No runtime audits yet — use command palette to generate.</p>
        ) : (
          <ul className="space-y-1 font-body text-[11px]">
            {recentAudits.map((a) => (
              <li key={a.id} className="rounded border px-2 py-1">
                {a.intentTask} · {a.toolsSelected?.length ?? 0} tools · {new Date(a.at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </AiCommandCenterDisclosure>

      <p className="mt-4 font-body text-[10px] text-kelly-subtle">
        Docs: AGENT_OS_CONTROL_LAYER.md · CAMPAIGN_OS_AUTONOMY_BOUNDARIES.md · test: npm run agents:test-os-control
      </p>
    </section>
  );
}
