"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { listRoleCopilotIds, getRoleCopilot } from "@/lib/agents/role-copilots/role-copilot-registry";
import { buildCopilotIntelligenceBrief, scoreCopilotReadiness } from "@/lib/agents/role-copilots/copilot-intelligence-engine";
import { buildCopilotTaskPackage } from "@/lib/agents/role-copilots/copilot-task-package-builder";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { SPRINT_COPILOT_TOOLING_TOOL_CONTRACTS } from "@/lib/campaign-events/ai-tools/sprint-copilot-tooling-tools";
import { CopilotBriefCard } from "./CopilotBriefCard";
import { CopilotTaskPackageCard } from "./CopilotTaskPackageCard";
import { CopilotTrainingRecommendationCard } from "./CopilotTrainingRecommendationCard";
import { CopilotRiskWarningCard } from "./CopilotRiskWarningCard";

const ROLES = listRoleCopilotIds();

export function CopilotCommandCenterClient({ initialRole }: { initialRole?: string }) {
  const [role, setRole] = useState<RoleCopilotId>((initialRole as RoleCopilotId) || "campaign_manager");
  const [previewPackage, setPreviewPackage] = useState(false);

  const brief = useMemo(
    () =>
      buildCopilotIntelligenceBrief({
        role,
        skillLevel: "intermediate",
        month: "2026-03",
        pathname: "/admin/ai-command-center/copilots",
      }),
    [role],
  );

  const readiness = useMemo(() => scoreCopilotReadiness(role, "intermediate"), [role]);
  const toolCount = SPRINT_COPILOT_TOOLING_TOOL_CONTRACTS.length;
  const roleTools = brief.toolIds.length;

  const samplePkg = useMemo(
    () => (previewPackage ? buildCopilotTaskPackage(role, "daily", { title: "Preview work package" }) : null),
    [previewPackage, role],
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/15 bg-kelly-page p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Kelly Campaign OS</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">Role copilot command center</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Tool-backed operational assistants — {toolCount} copilot tools registered. Recommendations only; all actions human-gated.
        </p>
        <Link href="/admin/ai-command-center" className="mt-2 inline-block text-xs font-bold text-kelly-navy underline">
          ← Command center
        </Link>
      </header>

      <div className="flex flex-wrap gap-3">
        <select className="rounded-lg border px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as RoleCopilotId)}>
          {ROLES.map((id) => (
            <option key={id} value={id}>
              {getRoleCopilot(id)?.label ?? id}
            </option>
          ))}
        </select>
        <button type="button" className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => setPreviewPackage((p) => !p)}>
          {previewPackage ? "Hide" : "Build"} task package preview
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CopilotBriefCard brief={brief} />
        <div className="space-y-3">
          <div className="rounded-xl border p-4 text-sm">
            <p className="text-xs font-bold uppercase text-kelly-slate">Readiness</p>
            <p className="mt-1 text-2xl font-bold text-kelly-navy">{readiness.dimensions.overall}%</p>
            <p className="text-xs text-kelly-muted capitalize">{readiness.label.replace(/_/g, " ")}</p>
            <p className="mt-2 text-[10px] text-kelly-muted">
              Tools for role: {roleTools} · Training gaps: {readiness.needsTrainingFirst.length}
            </p>
          </div>
          <CopilotTrainingRecommendationCard {...brief.trainingRecommendation} />
          <CopilotRiskWarningCard warnings={brief.riskWarnings} escalation={brief.escalationNote} />
        </div>
      </div>

      <section>
        <h2 className="text-xs font-bold uppercase text-kelly-slate">Top 3 tasks</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {brief.topThreeTasks.map((p) => (
            <CopilotTaskPackageCard key={p.id} pkg={p} />
          ))}
        </div>
      </section>

      {samplePkg ? (
        <section>
          <h2 className="text-xs font-bold uppercase text-kelly-slate">Task package preview</h2>
          <CopilotTaskPackageCard pkg={samplePkg} />
        </section>
      ) : null}

      <section>
        <h2 className="text-xs font-bold uppercase text-kelly-slate">Dashboard modules</h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {brief.dashboardModules.map((m) => (
            <li
              key={m.id}
              className={`rounded-full px-3 py-1 ${m.locked ? "border border-dashed text-kelly-muted" : "bg-kelly-navy/10 font-bold text-kelly-navy"}`}
            >
              {m.locked ? "🔒 " : ""}
              {m.title}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-xs font-bold uppercase text-kelly-slate">All copilots</h2>
        <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          {ROLES.map((id) => {
            const r = scoreCopilotReadiness(id, "beginner");
            return (
              <li key={id}>
                <button type="button" className="w-full rounded-lg border px-3 py-2 text-left hover:bg-kelly-navy/5" onClick={() => setRole(id)}>
                  <strong>{getRoleCopilot(id)?.label}</strong>
                  <span className="ml-2 text-xs text-kelly-muted">{r.dimensions.overall}%</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
