"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  buildDashboardBlueprint,
  type DashboardBlueprint,
} from "@/lib/agents/dashboard-builder/dashboard-blueprint-builder";
import { getBlockById, type DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { getCopilotDashboardModules } from "@/lib/agents/role-copilots/role-copilot-dashboard-map";
import { getLockedDashboardModules } from "@/lib/agents/training/training-unlock-engine";
import { loadLocalTrainingProgress } from "@/lib/agents/training/training-progress-client";

export function DashboardModulePreviewClient() {
  const [role, setRole] = useState<RoleCopilotId>("campaign_manager");
  const [goal, setGoal] = useState("Run March operations calmly");
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [blueprint, setBlueprint] = useState<DashboardBlueprint | null>(null);
  const [activeIds, setActiveIds] = useState<DashboardBlockId[]>([]);
  const [pinned, setPinned] = useState<DashboardBlockId[]>([]);

  const progress = loadLocalTrainingProgress();
  const completed = progress?.completedModuleIds ?? [];

  const roleModules = useMemo(() => getCopilotDashboardModules(role, progress?.level ?? 1), [role, progress?.level]);

  const build = () => {
    const bp = buildDashboardBlueprint({
      roleLabel: role,
      taskDescription: goal,
      detailLevel: mode === "simple" ? "simple" : "standard",
      month: "2026-03",
    });
    setBlueprint(bp);
    const ids = bp.blocks.map((b) => b.id);
    setActiveIds(mode === "simple" ? ids.slice(0, 4) : ids);
  };

  const locked = getLockedDashboardModules(roleModules, completed);

  const toggle = (id: DashboardBlockId) => {
    setActiveIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const saveBlueprint = () => {
    if (!blueprint) return;
    const payload = { ...blueprint, activeIds, pinned, role, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(`kelly_blueprint_preview_${role}`, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/15 bg-kelly-page p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Kelly Campaign OS</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">Dashboard module preview</h1>
        <p className="mt-2 text-sm text-kelly-muted">Renders safe registry modules only — no code generation.</p>
        <Link href="/admin/ai-command-center/dashboard-builder" className="mt-2 inline-block text-xs font-bold text-kelly-navy underline">
          ← Blueprint builder
        </Link>
      </header>

      <section className="grid gap-3 rounded-2xl border bg-kelly-page p-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold">Role</label>
          <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as RoleCopilotId)} />
        </div>
        <div>
          <label className="text-xs font-bold">Goal</label>
          <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
        <button type="button" className="rounded-full border px-3 py-1 text-xs font-bold sm:col-span-2" onClick={() => setMode(mode === "simple" ? "advanced" : "simple")}>
          {mode === "simple" ? "Advanced mode" : "Simple mode"}
        </button>
        <button type="button" className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white sm:col-span-2" onClick={build}>
          Build & preview
        </button>
      </section>

      <section className="flex flex-wrap gap-2">
        {roleModules.map((id) => {
          const lock = locked.find((l) => l.blockId === id);
          const on = activeIds.includes(id);
          return (
            <button
              key={id}
              type="button"
              disabled={!!lock}
              title={lock ? `Complete: ${lock.moduleTitle}` : undefined}
              className={`rounded-full px-3 py-1 text-xs font-bold ${lock ? "cursor-not-allowed border border-dashed text-kelly-muted" : on ? "bg-kelly-navy text-white" : "border"}`}
              onClick={() => !lock && toggle(id)}
            >
              {lock ? "🔒 " : ""}
              {getBlockById(id)?.title ?? id}
            </button>
          );
        })}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {activeIds.map((id) => {
          const def = getBlockById(id);
          if (!def) return null;
          const isPinned = pinned.includes(id);
          return (
            <article key={id} className={`rounded-2xl border p-4 ${isPinned ? "border-kelly-navy ring-1 ring-kelly-navy/20" : ""}`}>
              <div className="flex justify-between">
                <h3 className="font-bold text-kelly-navy">{def.title}</h3>
                <button type="button" className="text-[10px] font-bold uppercase text-kelly-muted" onClick={() => setPinned((p) => (isPinned ? p.filter((x) => x !== id) : [...p, id]))}>
                  {isPinned ? "Pinned" : "Pin"}
                </button>
              </div>
              <p className="mt-1 text-xs text-kelly-muted">{def.purpose}</p>
              <p className="mt-2 text-[10px] text-kelly-muted">{def.aiExplanation}</p>
              <ul className="mt-2 space-y-1 text-xs">
                {def.routeLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-bold text-kelly-navy underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {def.routeLinks.length === 0 ? (
                <p className="mt-2 text-xs italic text-kelly-muted">{def.emptyState}</p>
              ) : null}
            </article>
          );
        })}
      </div>

      {blueprint ? (
        <button type="button" className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={saveBlueprint}>
          Save blueprint locally
        </button>
      ) : null}
    </div>
  );
}
