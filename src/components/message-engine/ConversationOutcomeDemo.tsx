"use client";

import { useMemo, useState } from "react";
import {
  CONVERSATION_OUTCOMES,
  mapConversationOutcomeToPipelineMovement,
  summarizeMessageFeedback,
  type ConversationOutcome,
  type MessageFeedback,
} from "@/lib/message-engine";
import { cn } from "@/lib/utils";

const DEMO_TEMPLATE_ID = "demo_training_template";

/**
 * **Training-only** surface: pick an outcome and inspect pipeline hints + sample aggregate summary.
 * Does not submit data, store cookies, or touch voter records.
 */
export function ConversationOutcomeDemo({ className }: { className?: string }) {
  const [outcome, setOutcome] = useState<ConversationOutcome>("listened");

  const movement = useMemo(() => mapConversationOutcomeToPipelineMovement(outcome), [outcome]);

  const sampleSummary = useMemo(() => {
    const sample: MessageFeedback[] = [
      {
        templateId: DEMO_TEMPLATE_ID,
        responseBucket: "positive",
        conversationOutcome: outcome,
        recordedAt: new Date().toISOString(),
      },
      {
        templateId: "another_demo_row",
        responseBucket: "mixed",
        conversationOutcome: "unknown",
        recordedAt: new Date().toISOString(),
      },
    ];
    return summarizeMessageFeedback(sample);
  }, [outcome]);

  return (
    <section
      className={cn(
        "rounded-2xl border border-kelly-text/10 bg-kelly-page/95 p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/55">Message engine</p>
      <h2 className="font-heading mt-1 text-lg font-bold text-kelly-navy">Log conversation outcome (demo)</h2>
      <p className="mt-2 text-xs leading-relaxed text-kelly-text/75">
        Local preview only — no network, no database. Use outcomes for aggregate coaching and pipeline language, not public
        labels on individuals.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CONVERSATION_OUTCOMES.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOutcome(o)}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 font-body text-xs font-semibold transition",
              outcome === o
                ? "border-kelly-navy bg-kelly-navy text-white"
                : "border-kelly-text/15 bg-white/80 text-kelly-text hover:border-kelly-navy/30",
            )}
          >
            {o.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3 rounded-xl border border-kelly-text/10 bg-white/70 p-3 text-sm text-kelly-text/90">
        <p className="font-medium text-kelly-navy">{movement.headline}</p>
        <ul className="list-disc space-y-1 pl-5 text-xs">
          {movement.hints.map((h) => (
            <li key={`${h.pipelineId}-${h.momentum}`}>
              <span className="font-mono text-[11px]">{h.pipelineId}</span> — {h.momentum} (strength{" "}
              {h.strength.toFixed(2)})
            </li>
          ))}
        </ul>
        {movement.suggestedCategories.length > 0 ? (
          <p className="text-xs text-kelly-text/75">
            Suggested categories next:{" "}
            <span className="font-medium text-kelly-text">{movement.suggestedCategories.join(", ")}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-kelly-text/15 bg-kelly-gold/5 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-navy/50">Sample aggregate summary</p>
        <p className="mt-2 text-xs text-kelly-text/80">Total rows: {sampleSummary.total}</p>
        <ul className="mt-2 space-y-1 text-xs text-kelly-text/75">
          {sampleSummary.coachingNotes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
