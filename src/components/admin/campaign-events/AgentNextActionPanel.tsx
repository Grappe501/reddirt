"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextActionResult } from "@/lib/agents/user-intelligence/next-action-engine";

export function AgentNextActionPanel({ actions, compact }: { actions: NextActionResult; compact?: boolean }) {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-4 font-body text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Recommended next</p>
          <p className="mt-1 text-xs text-kelly-text/60">{actions.calmSummary}</p>
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
        <Link href={actions.primary.href} className="font-heading text-base font-bold text-kelly-navy underline">
          {actions.primary.title}
        </Link>
        <p className="mt-1 text-xs text-kelly-text/70">{actions.primary.why}</p>
        <p className="mt-2 text-[10px] font-semibold text-kelly-text/50">
          {actions.primary.urgency.replaceAll("_", " ")} · confidence {actions.primary.confidence}
        </p>
      </div>

      {expanded && actions.secondary.length ? (
        <ul className="mt-3 space-y-2 text-xs">
          {actions.secondary.map((s) => (
            <li key={s.id} className="rounded-lg border border-kelly-text/10 px-3 py-2">
              <Link href={s.href} className="font-semibold text-kelly-navy underline">
                {s.title}
              </Link>
              <p className="mt-0.5 text-kelly-text/55">{s.why}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-[10px] text-kelly-text/45">{actions.avoidOverwhelmNote}</p>
    </section>
  );
}
