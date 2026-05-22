"use client";

import Link from "next/link";
import type { WorkflowGuidanceCard } from "@/lib/dashboard-orchestration/workflow-guidance-generator";
import { useAgentObservation } from "@/components/agents/AgentObservationTracker";

export function WorkflowGuidanceCards({ cards }: { cards: WorkflowGuidanceCard[] }) {
  const { track } = useAgentObservation();
  if (!cards.length) return null;

  return (
    <section className="space-y-3" aria-label="Workflow guidance">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-slate">AI workflow guidance</p>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.id}
            className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 transition hover:border-kelly-navy/25"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-heading text-sm font-bold text-kelly-navy">{card.title}</h3>
              <span className="rounded-full border border-kelly-text/15 px-2 py-0.5 text-[9px] font-bold uppercase text-kelly-slate">
                {card.riskLevel} · {card.aiConfidence}
              </span>
            </div>
            <p className="mt-2 text-xs text-kelly-muted">
              <strong>Why:</strong> {card.whyItMatters}
            </p>
            <p className="mt-1 text-xs text-kelly-muted">
              <strong>Next:</strong> {card.nextStep} · ~{card.estimatedMinutes} min
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={card.href}
                className="rounded-full bg-kelly-navy px-3 py-1.5 text-xs font-bold text-white"
                onClick={() => track("agent_recommendation_followed", { actionId: card.id, task: card.title })}
              >
                Open workflow
              </Link>
              <button
                type="button"
                className="rounded-full border px-3 py-1.5 text-xs font-semibold text-kelly-slate"
                onClick={() => track("workflow_guidance_ignored", { actionId: card.id })}
              >
                Dismiss
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
