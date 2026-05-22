"use client";

import { useState } from "react";
import type { CommandCenterSnapshot } from "@/lib/campaign-events/ai-tools-command-center";
import { filterSprint4Tools, getSprint4Contract } from "@/lib/campaign-events/ai-tools-command-center";
import type { AiToolStatus } from "@/lib/campaign-events/ai-tools-master-catalog";
import type { EnrichedAiTool } from "@/lib/campaign-events/ai-tools-operational-meta";

const STATUS_STYLE: Record<AiToolStatus, string> = {
  idea: "bg-kelly-wash text-kelly-muted",
  scaffolded: "bg-amber-50 text-amber-950",
  partial: "bg-kelly-navy/10 text-kelly-navy",
  functional: "bg-emerald-50 text-emerald-900",
};

export function Sprint4ApprovalToolchainSection({
  snap,
  onSelect,
}: {
  snap: CommandCenterSnapshot;
  onSelect: (id: string) => void;
}) {
  const [sprint4Only, setSprint4Only] = useState(true);
  const [v1Only, setV1Only] = useState(true);
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [obsOnly, setObsOnly] = useState(false);

  const filtered = filterSprint4Tools(snap.sprint4.tools, {
    automationBlocked: blockedOnly || undefined,
    observationEnabled: obsOnly || undefined,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-kelly-navy/25 bg-kelly-navy/[0.06] p-5 font-body text-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Sprint 4 Approval Email Toolchain</h2>
        <p className="mt-2 text-kelly-muted">
          {snap.sprint4.tools.length} V1 tools · Catalog grew from ~{snap.sprint4.toolCountBeforeSupplement} to {snap.counts.total}{" "}
          with supplement. AI tools lead the system — each stage has a contract, helper, and observation hooks.
        </p>
        <ul className="mt-3 list-inside list-disc text-xs text-kelly-muted">
          {snap.sprint4.humanControlRules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h3 className="text-xs font-bold uppercase text-kelly-slate">Filters</h3>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sprint4Only} readOnly className="opacity-60" />
            Sprint 4
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={v1Only} readOnly className="opacity-60" />
            V1 tools
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={blockedOnly} onChange={(e) => setBlockedOnly(e.target.checked)} />
            Automation blocked
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={obsOnly} onChange={(e) => setObsOnly(e.target.checked)} />
            Observation enabled
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h3 className="font-heading text-sm font-bold uppercase text-kelly-slate">Pipeline</h3>
        <ol className="mt-3 space-y-2">
          {snap.sprint4.pipeline.map((stage) => (
            <li key={stage.order} className="flex flex-wrap items-center gap-2 rounded-lg border border-kelly-text/10 px-3 py-2 text-sm">
              <span className="font-mono text-xs text-kelly-subtle">{stage.order}.</span>
              <span className="font-semibold">{stage.label}</span>
              <button type="button" className="font-mono text-xs text-kelly-navy underline" onClick={() => onSelect(stage.toolId)}>
                {stage.toolId}
              </button>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[stage.status]}`}>{stage.status}</span>
              <span className="text-xs text-kelly-muted">{stage.nextBuildAction}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 overflow-hidden">
        <h3 className="border-b bg-kelly-wash px-4 py-2 font-heading text-sm font-bold">
          Sprint 4 tools ({filtered.length})
        </h3>
        <ul className="divide-y font-body text-sm">
          {filtered.map((t) => (
            <Sprint4ToolRow key={t.id} tool={t} contract={getSprint4Contract(snap, t.id)} onSelect={onSelect} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function Sprint4ToolRow({
  tool,
  contract,
  onSelect,
}: {
  tool: EnrichedAiTool;
  contract: ReturnType<typeof getSprint4Contract>;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <button type="button" className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-kelly-wash/40" onClick={() => onSelect(tool.id)}>
        <span className="font-semibold">{tool.name}</span>
        <span className="font-mono text-[10px] text-kelly-subtle">{tool.id}</span>
        {contract ? (
          <span className="text-xs text-kelly-muted">
            Observations: {contract.observationEvents.join(", ") || "—"} · V2: {contract.futureAutomationPath.slice(0, 80)}…
          </span>
        ) : null}
      </button>
    </li>
  );
}
