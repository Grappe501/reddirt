"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildCommandCenterSnapshot,
  getToolById,
  supplementToolCount,
  type CommandCenterSnapshot,
} from "@/lib/campaign-events/ai-tools-command-center";
import { AI_AGENT_RUNBOOK } from "@/lib/campaign-events/ai-agent-runbook";
import type { AiToolStatus } from "@/lib/campaign-events/ai-tools-master-catalog";
import type { EnrichedAiTool } from "@/lib/campaign-events/ai-tools-operational-meta";
import { MasterBuildDocsBanner } from "@/components/admin/campaign-events/MasterBuildDocsBanner";

const STATUS_STYLE: Record<AiToolStatus, string> = {
  idea: "bg-kelly-wash text-kelly-text/60",
  scaffolded: "bg-amber-50 text-amber-950",
  partial: "bg-kelly-navy/10 text-kelly-navy",
  functional: "bg-emerald-50 text-emerald-900",
};

type TabId = "dashboard" | "runbook" | "matrix" | "catalog";

function ProgressBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between font-body text-xs">
        <span className="font-bold text-kelly-slate">{label}</span>
        <span className="font-bold">{pct}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-kelly-wash">
        <div className="h-full rounded-full bg-kelly-navy transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-kelly-text/10 bg-kelly-page px-4 py-3">
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate">{label}</p>
      <p className="font-heading text-2xl font-bold text-kelly-text">{value}</p>
      {sub ? <p className="mt-0.5 font-body text-xs text-kelly-text/55">{sub}</p> : null}
    </div>
  );
}

function ToolChip({ tool, onSelect }: { tool: EnrichedAiTool; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tool.id)}
      className="rounded-lg border border-kelly-text/10 bg-kelly-wash/40 px-2 py-1.5 text-left font-body text-xs hover:border-kelly-navy/30"
    >
      <span className={`mr-1.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLE[tool.status]}`}>
        {tool.status}
      </span>
      <span className="font-semibold">{tool.name}</span>
      <span className="ml-1 text-kelly-text/45">({tool.priority})</span>
    </button>
  );
}

function ToolDetailDrawer({ tool, onClose }: { tool: EnrichedAiTool; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="dialog" aria-modal="true">
      <button type="button" className="flex-1" aria-label="Close" onClick={onClose} />
      <aside className="flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-kelly-text/15 bg-kelly-page shadow-xl">
        <header className="sticky top-0 z-10 border-b border-kelly-text/10 bg-kelly-page px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-body text-xs font-bold uppercase text-kelly-slate">{tool.lifecycleTitle}</p>
              <h2 className="font-heading text-xl font-bold">{tool.name}</h2>
              <p className="mt-1 font-mono text-[11px] text-kelly-text/50">{tool.id}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border px-3 py-1 text-xs font-bold">
              Close
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLE[tool.status]}`}>{tool.status}</span>
            <span className="rounded-full border px-2 py-0.5 text-xs font-bold">{tool.priority}</span>
            {tool.availableNow ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900">Available now</span>
            ) : null}
            {tool.blocksAutomation ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-950">Blocks automation</span>
            ) : null}
          </div>
        </header>
        <div className="space-y-5 px-5 py-4 font-body text-sm">
          <section>
            <h3 className="text-xs font-bold uppercase text-kelly-slate">What it does</h3>
            <p className="mt-1 text-kelly-text/80">{tool.purpose}</p>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase text-kelly-slate">Trigger</h3>
              <p className="mt-1">{tool.trigger}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-kelly-slate">Human approval</h3>
              <p className="mt-1">{tool.humanApprovalRequired ? "Required" : "Not required"}</p>
            </div>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase text-kelly-slate">Input data</h3>
              <p className="mt-1 text-kelly-text/75">{tool.inputData}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-kelly-slate">Output data</h3>
              <p className="mt-1 text-kelly-text/75">{tool.outputData}</p>
            </div>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase text-kelly-slate">Guardrails</h3>
            <p className="mt-1 text-kelly-text/75">{tool.guardrails || "—"}</p>
          </section>
          {tool.implementationFiles.length > 0 ? (
            <section>
              <h3 className="text-xs font-bold uppercase text-kelly-slate">Implementation files</h3>
              <ul className="mt-1 list-inside list-disc font-mono text-[11px] text-kelly-text/70">
                {tool.implementationFiles.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <section>
            <h3 className="text-xs font-bold uppercase text-kelly-slate">Routes / entry points</h3>
            <ul className="mt-1 space-y-1">
              {(tool.relatedRoutes.length ? tool.relatedRoutes : [tool.futureRoute]).map((r) =>
                r.startsWith("/admin") ? (
                  <li key={r}>
                    <Link href={r} className="font-semibold text-kelly-navy underline">
                      {r}
                    </Link>
                  </li>
                ) : (
                  <li key={r} className="font-mono text-xs text-kelly-text/65">
                    {r}
                  </li>
                ),
              )}
            </ul>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase text-kelly-slate">Next build step</h3>
            <p className="mt-1">{tool.nextBuildStep}</p>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase text-kelly-slate">Test checklist</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-kelly-text/75">
              {tool.testChecklist.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-3 text-xs">
            <p>
              <strong>Catalog reads/writes:</strong> {tool.reads} → {tool.writes}
            </p>
          </section>
        </div>
      </aside>
    </div>
  );
}

function CapabilityMatrix({ tools, onSelect }: { tools: EnrichedAiTool[]; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.lifecycleTitle.toLowerCase().includes(q),
    );
  }, [tools, search]);

  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page overflow-hidden">
      <div className="border-b border-kelly-text/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold">Tool capability matrix</h2>
        <input
          className="rounded-lg border px-3 py-1.5 text-sm max-w-xs"
          placeholder="Filter tools…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full min-w-[1400px] border-collapse font-body text-[11px]">
          <thead className="sticky top-0 z-10 bg-kelly-wash text-left uppercase tracking-wider text-kelly-slate">
            <tr>
              <th className="p-2">Tool</th>
              <th className="p-2">Lifecycle</th>
              <th className="p-2">Status</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Trigger</th>
              <th className="p-2">Reads</th>
              <th className="p-2">Writes</th>
              <th className="p-2">Human?</th>
              <th className="p-2">Now?</th>
              <th className="p-2">Blocks auto?</th>
              <th className="p-2">Route</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-kelly-text/5 align-top hover:bg-kelly-wash/30">
                <td className="p-2">
                  <button type="button" className="font-semibold text-kelly-navy underline text-left" onClick={() => onSelect(t.id)}>
                    {t.name}
                  </button>
                </td>
                <td className="p-2 text-kelly-text/60">{t.lifecycleTitle}</td>
                <td className="p-2">
                  <span className={`rounded-full px-1.5 py-0.5 font-bold uppercase ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                </td>
                <td className="p-2 font-bold">{t.priority}</td>
                <td className="p-2 text-kelly-text/65 max-w-[120px]">{t.trigger}</td>
                <td className="p-2 text-kelly-text/65 max-w-[140px]">{t.reads}</td>
                <td className="p-2 text-kelly-text/65 max-w-[140px]">{t.writes}</td>
                <td className="p-2">{t.humanApprovalRequired ? "Yes" : "—"}</td>
                <td className="p-2">{t.availableNow ? "✓" : "—"}</td>
                <td className="p-2">{t.blocksAutomation ? "Yes" : "—"}</td>
                <td className="p-2 text-kelly-text/55 max-w-[160px] truncate" title={t.futureRoute}>
                  {t.futureRoute}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-kelly-text/10 px-4 py-2 text-xs text-kelly-text/50">{filtered.length} tools shown</p>
    </section>
  );
}

function DashboardTab({ snap, onSelect }: { snap: CommandCenterSnapshot; onSelect: (id: string) => void }) {
  const functionalPct = snap.counts.total ? Math.round((snap.counts.functional / snap.counts.total) * 100) : 0;
  const partialPct = snap.counts.total ? Math.round((snap.counts.partial / snap.counts.total) * 100) : 0;
  const availablePct = snap.counts.total ? Math.round((snap.counts.availableNow / snap.counts.total) * 100) : 0;
  const aprilReadiness = Math.min(100, Math.round(snap.readinessScore * 1.15));
  const automationReadiness = Math.max(
    0,
    Math.round(((snap.counts.functional + snap.counts.partial * 0.5) / Math.max(1, snap.counts.total)) * 100) -
      snap.counts.automationBlocked * 2,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-kelly-navy/25 bg-kelly-navy/[0.06] p-6">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Tool system readiness</p>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <p className="font-heading text-5xl font-bold text-kelly-navy">{snap.readinessScore}%</p>
          <p className="font-body text-sm text-kelly-text/70 max-w-md">
            Weighted maturity across {snap.counts.total} tools (master + {supplementToolCount()} supplement). Functional = 100pts,
            partial = 65, scaffolded = 30, idea = 5.
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Functional" value={snap.counts.functional} sub={`${functionalPct}% of catalog`} />
          <StatCard label="Partial" value={snap.counts.partial} sub={`${partialPct}% of catalog`} />
          <StatCard label="Available now" value={snap.counts.availableNow} sub={`${availablePct}% operator-usable`} />
          <StatCard label="Automation blocked" value={snap.counts.automationBlocked} sub="Email, send, GCal, etc." />
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Pass progress</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ProgressBar label="AI Tool Command Center" value={95} />
          <ProgressBar label="Tool catalog completeness" value={Math.min(100, snap.counts.total)} max={100} />
          <ProgressBar label="Tool detail views" value={100} />
          <ProgressBar label="Capability matrix" value={100} />
          <ProgressBar label="Agent runbook" value={100} />
          <ProgressBar label="Implemented tool mapping" value={functionalPct + partialPct} />
          <ProgressBar label="Next-build recommendations" value={snap.buildNextRecommendations.length >= 5 ? 100 : 80} />
          <ProgressBar label="Event/travel AI readiness" value={Math.round(snap.readinessScore)} />
          <ProgressBar label="April cleanup AI readiness" value={aprilReadiness} />
          <ProgressBar label="Automation readiness" value={automationReadiness} />
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-700/20 bg-emerald-50/50 p-5">
        <h2 className="font-heading text-base font-bold text-emerald-950">Build next (top 5)</h2>
        <ol className="mt-4 space-y-3">
          {snap.buildNextRecommendations.map((rec, i) => (
            <li key={rec.tool.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-emerald-900/10 bg-white/80 px-4 py-3">
              <div>
                <p className="font-body text-xs font-bold text-emerald-800">#{i + 1} · {rec.tool.priority}</p>
                <button type="button" className="font-heading text-sm font-bold text-kelly-navy underline" onClick={() => onSelect(rec.tool.id)}>
                  {rec.tool.name}
                </button>
                <p className="mt-1 font-body text-xs text-kelly-text/65">{rec.rationale}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[rec.tool.status]}`}>{rec.tool.status}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-emerald-700/15 p-4">
          <h2 className="font-heading text-sm font-bold text-emerald-900">Functional now ({snap.functionalNow.length})</h2>
          <div className="mt-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
            {snap.functionalNow.slice(0, 24).map((t) => (
              <ToolChip key={t.id} tool={t} onSelect={onSelect} />
            ))}
            {snap.functionalNow.length > 24 ? (
              <p className="text-xs text-kelly-text/50">+{snap.functionalNow.length - 24} more in catalog tab</p>
            ) : null}
          </div>
        </section>
        <section className="rounded-2xl border border-amber-700/15 p-4">
          <h2 className="font-heading text-sm font-bold text-amber-950">Needs build ({snap.needsBuild.length})</h2>
          <div className="mt-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
            {snap.needsBuild.slice(0, 16).map((t) => (
              <ToolChip key={t.id} tool={t} onSelect={onSelect} />
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-red-700/15 p-4">
          <h2 className="font-heading text-sm font-bold text-red-950">Automation blocked ({snap.automationBlocked.length})</h2>
          <div className="mt-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
            {snap.automationBlocked.slice(0, 16).map((t) => (
              <ToolChip key={t.id} tool={t} onSelect={onSelect} />
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-base font-bold">High-priority next tools</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {snap.highPriorityNext.map((t) => (
            <ToolChip key={t.id} tool={t} onSelect={onSelect} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-base font-bold">By lifecycle</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {snap.byLifecycle.map(({ lifecycle, tools }) => {
            const fn = tools.filter((x) => x.status === "functional").length;
            return (
              <div key={lifecycle.id} className="rounded-xl border border-kelly-text/10 px-3 py-2 font-body text-xs">
                <p className="font-semibold">{lifecycle.title}</p>
                <p className="text-kelly-text/55">
                  {tools.length} tools · {fn} functional
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RunbookTab({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-kelly-text/70">
        Agent runbook for event/travel — each stage lists goals, tools, human decisions, failures, and next actions. Click a tool id to
        open detail.
      </p>
      {AI_AGENT_RUNBOOK.map((stage) => (
        <article key={stage.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page overflow-hidden">
          <header className="border-b border-kelly-text/10 bg-kelly-wash px-4 py-3">
            <p className="font-body text-xs font-bold text-kelly-slate">Stage {stage.order}</p>
            <h2 className="font-heading text-lg font-bold">{stage.title}</h2>
          </header>
          <dl className="grid gap-4 p-4 font-body text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold uppercase text-kelly-slate">Agent goal</dt>
              <dd className="mt-1">{stage.agentGoal}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-kelly-slate">Tools used</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {stage.toolsUsed.map((id) => (
                  <button key={id} type="button" onClick={() => onSelect(id)} className="rounded bg-kelly-navy/10 px-2 py-0.5 font-mono text-[10px] font-bold text-kelly-navy hover:underline">
                    {id}
                  </button>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-kelly-slate">Data needed</dt>
              <dd className="mt-1">
                <ul className="list-inside list-disc text-kelly-text/75">
                  {stage.dataNeeded.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-kelly-slate">Expected human decision</dt>
              <dd className="mt-1">{stage.expectedHumanDecision}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-kelly-slate">Failure states</dt>
              <dd className="mt-1">
                <ul className="list-inside list-disc text-red-900/80">
                  {stage.failureStates.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold uppercase text-kelly-slate">Next action</dt>
              <dd className="mt-1 font-semibold text-kelly-navy">{stage.nextAction}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function CatalogTab({ snap, onSelect }: { snap: CommandCenterSnapshot; onSelect: (id: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filteredLifecycles = useMemo(() => {
    return snap.byLifecycle
      .map(({ lifecycle, tools }) => ({
        lifecycle,
        tools: statusFilter === "all" ? tools : tools.filter((t) => t.status === statusFilter),
      }))
      .filter((x) => x.tools.length > 0);
  }, [snap.byLifecycle, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["all", "functional", "partial", "scaffolded", "idea"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${statusFilter === s ? "bg-kelly-navy text-white" : "border border-kelly-text/15"}`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>
      {filteredLifecycles.map(({ lifecycle, tools }) => (
        <section key={lifecycle.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page overflow-hidden">
          <h2 className="border-b border-kelly-text/10 bg-kelly-wash px-4 py-3 font-heading text-base font-bold">
            {lifecycle.title} <span className="text-kelly-text/45">({tools.length})</span>
          </h2>
          <ul className="divide-y divide-kelly-text/5">
            {tools.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => onSelect(t.id)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-kelly-wash/40">
                  <span className="font-body text-sm font-semibold">{t.name}</span>
                  <span className="flex gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                    <span className="text-xs font-bold">{t.priority}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function AiToolsCommandCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolParam = searchParams.get("tool");
  const [tab, setTab] = useState<TabId>("dashboard");

  const snap = useMemo(() => buildCommandCenterSnapshot(), []);
  const selectedTool = useMemo(() => (toolParam ? getToolById(snap, toolParam) : undefined), [snap, toolParam]);

  const openTool = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tool", id);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const closeTool = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tool");
    const q = params.toString();
    router.push(q ? `?${q}` : "/admin/campaign-events/ai-tools", { scroll: false });
  }, [router, searchParams]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "dashboard", label: "Command center" },
    { id: "runbook", label: "Agent runbook" },
    { id: "matrix", label: "Capability matrix" },
    { id: "catalog", label: "Full catalog" },
  ];

  return (
    <div className="space-y-6">
      <MasterBuildDocsBanner />
      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5 font-body text-sm">
        <p>
          <strong>Operational AI Agent Tool System</strong> — {snap.counts.total} tools across {snap.lifecycles.length} lifecycles
          (master 73 + supplement {supplementToolCount()}). Open any tool for implementation files, routes, guardrails, and test
          checklist.
        </p>
        <p className="mt-2 flex flex-wrap gap-3 text-xs">
          <Link href="/admin/campaign-events/month-readiness?month=2026-04" className="font-semibold text-kelly-navy underline">
            April readiness
          </Link>
          <Link href="/admin/campaign-events/review?month=2026-04" className="underline">
            Month review
          </Link>
          <Link href="/admin/campaign-events/travel-report?month=2026-04" className="underline">
            Travel report
          </Link>
          <Link href="/admin/campaign-events/workbench" className="underline">
            Workbench
          </Link>
          <span className="text-kelly-text/55">Docs: RedDirt/docs/campaign-events/AI_AGENT_OPERATIONAL_TOOL_SYSTEM.md</span>
        </p>
      </section>

      <nav className="flex flex-wrap gap-2 border-b border-kelly-text/10 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 font-body text-sm font-bold ${tab === t.id ? "bg-kelly-navy text-white" : "border border-kelly-text/15 text-kelly-text/70"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "dashboard" && <DashboardTab snap={snap} onSelect={openTool} />}
      {tab === "runbook" && <RunbookTab onSelect={openTool} />}
      {tab === "matrix" && <CapabilityMatrix tools={snap.tools} onSelect={openTool} />}
      {tab === "catalog" && <CatalogTab snap={snap} onSelect={openTool} />}

      {selectedTool ? <ToolDetailDrawer tool={selectedTool} onClose={closeTool} /> : null}
    </div>
  );
}
