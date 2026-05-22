"use client";

import { useState } from "react";
import Link from "next/link";
import type { ToolBuildTicket, ToolBuildTicketStatus } from "@/lib/agents/tool-builder/tool-builder-types";

type Props = {
  initialTickets: ToolBuildTicket[];
};

export function ToolBuilderQueueClient({ initialTickets }: Props) {
  const [tickets, setTickets] = useState(initialTickets);
  const [status, setStatus] = useState<"idle" | "saving">("idle");

  const updateStatus = async (id: string, next: ToolBuildTicketStatus, notes?: string) => {
    setStatus("saving");
    try {
      const res = await fetch("/api/agents/tool-builder-queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, reviewerNotes: notes }),
      });
      if (res.ok) {
        const data = (await res.json()) as { ticket: ToolBuildTicket };
        setTickets((prev) => prev.map((t) => (t.id === id ? data.ticket : t)));
      }
    } finally {
      setStatus("idle");
    }
  };

  const detectGaps = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/agents/tool-builder-queue", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { tickets: ToolBuildTicket[] };
        setTickets(data.tickets);
      }
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/15 bg-kelly-page p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Kelly Campaign OS</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">AI tool-builder queue</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Human-reviewed specs only — AI does <strong>not</strong> auto-build code or deploy.
        </p>
        <Link href="/admin/ai-command-center" className="mt-2 inline-block text-xs font-bold text-kelly-navy underline">
          ← Command center
        </Link>
      </header>

      <div className="flex gap-2">
        <button type="button" disabled={status === "saving"} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={detectGaps}>
          Detect gaps from observations
        </button>
      </div>

      <ul className="space-y-4">
        {tickets.map((t) => (
          <li key={t.id} className="rounded-2xl border bg-kelly-page p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <h2 className="font-bold text-kelly-navy">{t.proposedToolName}</h2>
              <span className="text-[10px] font-bold uppercase text-kelly-muted">
                {t.status} · risk {t.riskLevel} · score {t.priorityScore ?? "—"}
              </span>
            </div>
            <p className="mt-1 text-sm text-kelly-muted">{t.observedProblem}</p>
            <p className="text-xs text-kelly-muted">Workflow: {t.workflowAffected}</p>
            <p className="mt-2 text-xs">{t.proposedToolContract}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["accepted", "backlog", "rejected"] as ToolBuildTicketStatus[]).map((s) => (
                <button key={s} type="button" className="rounded-full border px-3 py-1 text-xs font-bold capitalize" onClick={() => updateStatus(t.id, s)}>
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
