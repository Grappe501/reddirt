"use client";

import Link from "next/link";
import { useState } from "react";
import type { CommandCenterSnapshot } from "@/lib/campaign-events/ai-tools-command-center";
import { filterSprint5Tools, getSprint5Contract } from "@/lib/campaign-events/ai-tools-command-center";
import type { AiToolStatus } from "@/lib/campaign-events/ai-tools-master-catalog";
import type { EnrichedAiTool } from "@/lib/campaign-events/ai-tools-operational-meta";

const STATUS_STYLE: Record<AiToolStatus, string> = {
  idea: "bg-kelly-wash text-kelly-text/60",
  scaffolded: "bg-amber-50 text-amber-950",
  partial: "bg-kelly-navy/10 text-kelly-navy",
  functional: "bg-emerald-50 text-emerald-900",
};

export function Sprint5CalendarPromotionSection({
  snap,
  onSelect,
}: {
  snap: CommandCenterSnapshot;
  onSelect: (id: string) => void;
}) {
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [obsOnly, setObsOnly] = useState(false);
  const filtered = filterSprint5Tools(snap.sprint5.tools, {
    automationBlocked: blockedOnly || undefined,
    observationEnabled: obsOnly || undefined,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-kelly-navy/25 bg-kelly-navy/[0.06] p-5 font-body text-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Sprint 5 Calendar Promotion Toolchain</h2>
        <p className="mt-2 text-kelly-text/70">
          {snap.sprint5.tools.length} V1 tools for controlled Google Calendar promotion. AI may summarize and warn — only operators click Promote.
        </p>
        <ul className="mt-3 list-inside list-disc text-xs text-kelly-text/65">
          {snap.sprint5.humanControlRules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs">
          <Link href="/admin/campaign-events/calendar-promotion" className="font-bold text-kelly-navy underline">
            Open promotion workbench →
          </Link>
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h3 className="font-heading text-sm font-bold uppercase text-kelly-slate">Pipeline</h3>
        <ol className="mt-3 space-y-2">
          {snap.sprint5.pipeline.map((stage) => (
            <li key={stage.order} className="flex flex-wrap items-center gap-2 rounded-lg border border-kelly-text/10 px-3 py-2 text-sm">
              <span className="font-mono text-xs text-kelly-text/45">{stage.order}.</span>
              <span className="font-semibold">{stage.label}</span>
              <button type="button" className="font-mono text-xs text-kelly-navy underline" onClick={() => onSelect(stage.toolId)}>
                {stage.toolId}
              </button>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[stage.status]}`}>{stage.status}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h3 className="text-xs font-bold uppercase text-kelly-slate">Tools</h3>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={blockedOnly} onChange={(e) => setBlockedOnly(e.target.checked)} />
            Automation blocked
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={obsOnly} onChange={(e) => setObsOnly(e.target.checked)} />
            Observation enabled
          </label>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {filtered.map((tool: EnrichedAiTool) => {
            const contract = getSprint5Contract(snap, tool.id);
            return (
              <li key={tool.id}>
                <button
                  type="button"
                  onClick={() => onSelect(tool.id)}
                  className="w-full rounded-lg border border-kelly-text/10 px-3 py-2 text-left text-sm hover:border-kelly-navy/30"
                >
                  <span className={`mr-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLE[tool.status]}`}>
                    {tool.status}
                  </span>
                  {tool.name}
                  {contract?.observationEvents.length ? (
                    <span className="ml-1 text-[10px] text-kelly-text/45">· obs</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
