"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AI_TOOL_LIFECYCLES,
  ALL_AI_TOOLS,
  DEFAULT_AI_TOOL_FILTERS,
  countToolsByStatus,
  filterAiTools,
  type AiToolFilters,
  type AiToolStatus,
} from "@/lib/campaign-events/ai-tools-master-catalog";

const STATUS_STYLE: Record<AiToolStatus, string> = {
  idea: "bg-kelly-wash text-kelly-muted",
  scaffolded: "bg-amber-50 text-amber-950",
  partial: "bg-kelly-navy/10 text-kelly-navy",
  functional: "bg-emerald-50 text-emerald-900",
};

export function CampaignEventAiToolsPage() {
  const [filters, setFilters] = useState<AiToolFilters>(DEFAULT_AI_TOOL_FILTERS);
  const filtered = useMemo(() => filterAiTools(ALL_AI_TOOLS, filters), [filters]);
  const counts = useMemo(() => countToolsByStatus(ALL_AI_TOOLS), []);

  const byLifecycle = useMemo(() => {
    const ids = new Set(filtered.map((t) => t.lifecycleId));
    return AI_TOOL_LIFECYCLES.filter((c) => ids.has(c.id) || filters.lifecycleId === c.id);
  }, [filtered, filters.lifecycleId]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5 font-body text-sm">
        <p>
          <strong>Master AI Agent Tool Package</strong> — {counts.total} tools across 22 lifecycles. Roadmap/inventory only unless status is
          functional or partial. Showing <strong>{filtered.length}</strong> after filters.
        </p>
        <p className="mt-2 flex flex-wrap gap-3">
          <span>Functional: {counts.functional}</span>
          <span>Partial: {counts.partial}</span>
          <span>Scaffolded: {counts.scaffolded}</span>
          <span>Idea: {counts.idea}</span>
          <span>Human approval required: {counts.humanApproval}</span>
        </p>
        <p className="mt-2">
          <Link href="/admin/campaign-events/workbench" className="font-semibold text-kelly-navy underline">
            Workbench
          </Link>
          {" · "}
          <Link href="/admin/campaign-events/travel-report?month=2026-03" className="underline">
            Travel report
          </Link>
          {" · "}
          <Link href="/admin/campaign-events/review?month=2026-03" className="underline">
            Month review
          </Link>
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Filters</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-bold text-kelly-slate">Lifecycle</span>
            <select
              className="rounded-lg border px-2 py-1.5"
              value={filters.lifecycleId}
              onChange={(e) => setFilters((f) => ({ ...f, lifecycleId: e.target.value }))}
            >
              <option value="all">All lifecycles</option>
              {AI_TOOL_LIFECYCLES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-bold text-kelly-slate">Status</span>
            <select className="rounded-lg border px-2 py-1.5" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              <option value="all">All</option>
              <option value="functional">Functional</option>
              <option value="partial">Partial</option>
              <option value="scaffolded">Scaffolded</option>
              <option value="idea">Idea</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-bold text-kelly-slate">Priority</span>
            <select className="rounded-lg border px-2 py-1.5" value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
              <option value="all">All</option>
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </label>
          <label className="flex items-end gap-2 text-sm pb-1">
            <input
              type="checkbox"
              checked={filters.humanApprovalOnly}
              onChange={(e) => setFilters((f) => ({ ...f, humanApprovalOnly: e.target.checked }))}
            />
            Human approval required
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-bold text-kelly-slate">Search</span>
            <input
              className="rounded-lg border px-2 py-1.5"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Tool name or route…"
            />
          </label>
        </div>
      </section>

      {byLifecycle.map((cat) => {
        const tools = cat.tools.filter((t) => filtered.some((f) => f.id === t.id));
        if (!tools.length && filters.lifecycleId !== "all" && filters.lifecycleId !== cat.id) return null;
        if (!tools.length) return null;
        return (
          <section key={cat.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page overflow-hidden">
            <h2 className="border-b border-kelly-text/10 bg-kelly-wash px-4 py-3 font-heading text-base font-bold">
              {cat.title} <span className="text-kelly-subtle">({tools.length})</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse font-body text-xs">
                <thead>
                  <tr className="bg-kelly-wash/80 text-left uppercase tracking-wider text-kelly-slate">
                    <th className="p-2">Tool</th>
                    <th className="p-2">Purpose</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Priority</th>
                    <th className="p-2">Trigger</th>
                    <th className="p-2">Human?</th>
                    <th className="p-2">Route</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((t) => (
                    <tr key={t.id} className="border-t border-kelly-text/5 align-top">
                      <td className="p-2 font-semibold">{t.name}</td>
                      <td className="p-2 text-kelly-muted">{t.purpose}</td>
                      <td className="p-2">
                        <span className={`rounded-full px-2 py-0.5 font-bold uppercase ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                      </td>
                      <td className="p-2 font-bold">{t.priority}</td>
                      <td className="p-2 text-kelly-muted">{t.trigger}</td>
                      <td className="p-2">{t.humanApprovalRequired ? "Yes" : "—"}</td>
                      <td className="p-2 text-kelly-muted">{t.futureRoute}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <details className="border-t border-kelly-text/10 px-4 py-2">
              <summary className="cursor-pointer text-xs font-bold text-kelly-slate">Reads / writes / guardrails</summary>
              <ul className="mt-2 grid gap-2 pb-2 sm:grid-cols-2">
                {tools.map((t) => (
                  <li key={`${t.id}-meta`} className="rounded-lg bg-kelly-wash/50 px-2 py-1.5 text-[11px]">
                    <strong>{t.name}</strong>
                    <br />
                    Reads: {t.reads}
                    <br />
                    Writes: {t.writes}
                    <br />
                    {t.guardrails}
                  </li>
                ))}
              </ul>
            </details>
          </section>
        );
      })}
    </div>
  );
}
