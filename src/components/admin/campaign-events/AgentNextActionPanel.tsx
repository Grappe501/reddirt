"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextActionResult } from "@/lib/agents/user-intelligence/next-action-engine";
import { useAgentObservation } from "@/components/agents/AgentObservationTracker";

export function AgentNextActionPanel({ actions, compact }: { actions: NextActionResult; compact?: boolean }) {
  const [expanded, setExpanded] = useState(!compact);
  const { track } = useAgentObservation();

  const onActionClick = (actionId: string, href: string, primary: boolean) => {
    track("next_action_clicked", { actionId, href, primary });
  };

  return (
    <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-4 font-body text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Recommended next</p>
          <p className="mt-1 text-xs text-kelly-muted">{actions.calmSummary}</p>
        </div>
        <button
          type="button"
          className="text-xs font-bold text-kelly-navy underline"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-kelly-navy/25 bg-kelly-page px-4 py-3">
        <Link
          href={actions.primary.href}
          className="font-heading text-base font-bold text-kelly-navy underline"
          onClick={() => onActionClick(actions.primary.id, actions.primary.href, true)}
        >
          {actions.primary.title}
        </Link>
        <p className="mt-1 text-xs text-kelly-muted">{actions.primary.why}</p>
        <p className="mt-2 text-[10px] font-semibold text-kelly-subtle">
          {actions.primary.category} · {actions.primary.urgency.replaceAll("_", " ")} · confidence{" "}
          {actions.primary.confidence}
        </p>
      </div>

      {expanded && actions.secondary.length ? (
        <ul className="mt-3 space-y-2 text-xs">
          {actions.secondary.map((s) => (
            <li key={s.id} className="rounded-lg border border-kelly-text/10 px-3 py-2">
              <Link
                href={s.href}
                className="font-semibold text-kelly-navy underline"
                onClick={() => onActionClick(s.id, s.href, false)}
              >
                {s.title}
              </Link>
              <p className="mt-0.5 text-kelly-muted">{s.why}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {actions.sprintAwareNote ? (
        <p className="mt-2 text-[10px] text-kelly-slate/70">{actions.sprintAwareNote}</p>
      ) : null}
      <p className="mt-3 text-[10px] text-kelly-subtle">{actions.avoidOverwhelmNote}</p>
    </section>
  );
}
