"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { listRoleCopilotIds, getRoleCopilot } from "@/lib/agents/role-copilots/role-copilot-registry";
import { getRoleTrainingPath } from "@/lib/agents/training/training-path-builder";
import { listTrainingModulesForRole, getTrainingModule } from "@/lib/agents/training/training-module-registry";
import {
  getOrCreateOperatorId,
  loadLocalTrainingProgress,
  saveLocalTrainingProgress,
} from "@/lib/agents/training/training-progress-client";
import { getUnlockedDashboardModules } from "@/lib/agents/training/training-unlock-engine";
import { buildProgressionSummary } from "@/lib/agents/progression/progression-summary";
import { recommendNextTrainingModule } from "@/lib/agents/training/training-recommendation-engine";

const ROLES = listRoleCopilotIds();

export function TrainingCenterClient({ initialRole }: { initialRole?: string }) {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<RoleCopilotId>((initialRole as RoleCopilotId) || "campaign_manager");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r && listRoleCopilotIds().includes(r as RoleCopilotId)) {
      setRole(r as RoleCopilotId);
    }
  }, [searchParams]);
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [progress, setProgress] = useState(() => {
    const existing = loadLocalTrainingProgress();
    if (existing) return existing;
    return {
      operatorId: getOrCreateOperatorId(),
      role,
      completedModuleIds: [] as string[],
      startedModuleIds: [] as string[],
      level: 1,
    };
  });

  const path = useMemo(() => getRoleTrainingPath(role, "beginner", progress.completedModuleIds), [role, progress.completedModuleIds]);
  const modules = useMemo(() => listTrainingModulesForRole(role), [role]);
  const next = useMemo(() => recommendNextTrainingModule(role, progress.completedModuleIds), [role, progress.completedModuleIds]);
  const unlocked = useMemo(() => getUnlockedDashboardModules(progress.completedModuleIds), [progress.completedModuleIds]);
  const progression = useMemo(() => buildProgressionSummary(role, progress.completedModuleIds), [role, progress.completedModuleIds]);
  const copilot = getRoleCopilot(role);

  const persist = useCallback(
    (nextProgress: typeof progress) => {
      setProgress(nextProgress);
      saveLocalTrainingProgress(nextProgress);
    },
    [],
  );

  const startModule = (moduleId: string) => {
    const started = new Set(progress.startedModuleIds);
    started.add(moduleId);
    persist({ ...progress, role, startedModuleIds: [...started] });
  };

  const completeModule = (moduleId: string) => {
    const completed = new Set(progress.completedModuleIds);
    const started = new Set(progress.startedModuleIds);
    completed.add(moduleId);
    started.add(moduleId);
    persist({
      ...progress,
      role,
      completedModuleIds: [...completed],
      startedModuleIds: [...started],
      level: progression.level,
    });
  };

  const askTutor = (moduleId: string) => {
    const m = getTrainingModule(moduleId);
    const q = m ? `Help me with training: ${m.title}` : "Kelly training tutor";
    window.dispatchEvent(new CustomEvent("kelly-ai-palette-open", { detail: { query: q } }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/15 bg-kelly-page p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Kelly Campaign OS</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">Training center</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Learn at your pace. Unlocks are <strong>guidance</strong> — not permission changes. High-risk actions stay human-gated.
        </p>
        <div className="mt-3 flex gap-2">
          <Link href="/admin/ai-command-center" className="text-xs font-bold text-kelly-navy underline">
            ← Command center
          </Link>
          <Link href="/admin/onboarding" className="text-xs font-bold text-kelly-navy underline">
            Onboarding
          </Link>
        </div>
      </header>

      <section className="flex flex-wrap gap-3 rounded-2xl border bg-kelly-page p-4">
        <label className="text-xs font-bold text-kelly-slate">Role</label>
        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={role}
          onChange={(e) => {
            const r = e.target.value as RoleCopilotId;
            setRole(r);
            persist({ ...progress, role: r });
          }}
        >
          {ROLES.map((id) => (
            <option key={id} value={id}>
              {getRoleCopilot(id)?.label ?? id}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded-full border px-3 py-1 text-xs font-bold"
          onClick={() => setMode(mode === "simple" ? "advanced" : "simple")}
        >
          {mode === "simple" ? "Advanced mode" : "Simple mode"}
        </button>
      </section>

      {copilot ? (
        <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-4 text-sm">
          <p className="text-xs font-bold uppercase text-kelly-slate">Role copilot</p>
          <p className="mt-1 text-kelly-navy">{copilot.mission}</p>
          <p className="mt-2 text-xs text-kelly-muted">Escalation: {copilot.escalationPath}</p>
        </section>
      ) : null}

      <section className="rounded-2xl border bg-kelly-page p-4">
        <h2 className="text-xs font-bold uppercase text-kelly-slate">Recommended path</h2>
        <p className="mt-1 text-sm text-kelly-muted">{path.rationale}</p>
        <p className="text-xs text-kelly-muted">~{path.estimatedMinutes} min · Level {progression.level}</p>
        {next ? (
          <p className="mt-2 text-sm">
            Up next: <strong>{next.title}</strong>
          </p>
        ) : (
          <p className="mt-2 text-sm text-kelly-muted">Path complete for current tier — explore advanced modules.</p>
        )}
      </section>

      {mode === "advanced" ? (
        <section className="rounded-2xl border bg-kelly-page p-4 text-xs">
          <p className="font-bold text-kelly-slate">Unlocked dashboard modules</p>
          <p className="mt-1 text-kelly-muted">{unlocked.join(", ") || "Complete modules to unlock."}</p>
          <p className="mt-2 font-bold text-kelly-slate">Locked (level {progression.nextLevel ?? "max"})</p>
          <p className="text-kelly-muted">{progression.lockedModules.join(", ") || "—"}</p>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase text-kelly-slate">Modules</h2>
        {(mode === "simple" ? path.moduleIds.map((id) => getTrainingModule(id)).filter(Boolean) : modules).map((m) => {
          if (!m) return null;
          const done = progress.completedModuleIds.includes(m.id);
          const started = progress.startedModuleIds.includes(m.id);
          return (
            <article key={m.id} className="rounded-2xl border bg-kelly-page p-4">
              <div className="flex justify-between gap-2">
                <h3 className="font-bold text-kelly-navy">{m.title}</h3>
                <span className="text-[10px] font-bold uppercase text-kelly-muted">{done ? "Done" : started ? "Started" : m.level}</span>
              </div>
              <p className="mt-1 text-xs text-kelly-muted">{m.description}</p>
              <p className="text-xs text-kelly-muted">{m.estimatedMinutes} min · {m.category.replace(/_/g, " ")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={m.linkedRoute} className="rounded-full border px-3 py-1 text-xs font-bold text-kelly-navy">
                  Open route
                </Link>
                {!started ? (
                  <button type="button" className="rounded-full bg-kelly-navy px-3 py-1 text-xs font-bold text-white" onClick={() => startModule(m.id)}>
                    Start module
                  </button>
                ) : null}
                {!done ? (
                  <button type="button" className="rounded-full border px-3 py-1 text-xs font-bold" onClick={() => completeModule(m.id)}>
                    Mark complete
                  </button>
                ) : null}
                <button type="button" className="rounded-full border px-3 py-1 text-xs font-bold text-kelly-muted" onClick={() => askTutor(m.id)}>
                  Ask AI tutor
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
