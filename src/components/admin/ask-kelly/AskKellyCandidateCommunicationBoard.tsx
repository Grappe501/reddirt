"use client";

import Link from "next/link";
import { ASK_KELLY_CANDIDATE_COMMUNICATION_BOARD } from "@/content/ask-kelly-candidate-onboarding-copy";
import { cn } from "@/lib/utils";

export function AskKellyCandidateCommunicationBoard() {
  const { sectionTitle, sectionLead, cards } = ASK_KELLY_CANDIDATE_COMMUNICATION_BOARD;

  return (
    <section
      aria-labelledby="candidate-communication-command-board-heading"
      className="rounded-xl border border-kelly-blue/18 bg-[var(--color-surface-elevated)] p-5 sm:p-6"
    >
      <h2
        id="candidate-communication-command-board-heading"
        className="font-heading text-lg font-bold text-kelly-navy sm:text-xl"
      >
        {sectionTitle}
      </h2>
      <p className="mt-2 font-body text-xs leading-relaxed text-kelly-text/75 sm:text-sm">{sectionLead}</p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li
            key={c.id}
            className={cn(
              "flex min-h-[8.5rem] flex-col rounded-lg border p-4",
              c.state === "live"
                ? "border-kelly-navy/15 bg-kelly-fog/25"
                : "border-kelly-text/15 border-dashed bg-kelly-text/[0.02]",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-sm font-bold text-kelly-navy">{c.title}</h3>
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide",
                  c.state === "live" ? "bg-kelly-forest/15 text-kelly-navy" : "bg-kelly-text/10 text-kelly-text/70",
                )}
              >
                {c.stateLabel}
              </span>
            </div>
            <p className="mt-2 flex-1 font-body text-xs leading-relaxed text-kelly-text/80">{c.description}</p>
            {typeof c.complianceNote === "string" && c.complianceNote.trim() ? (
              <p className="mt-2 font-body text-[11px] font-medium leading-snug text-kelly-navy/90">{c.complianceNote}</p>
            ) : null}
            <div className="mt-3">
              {c.href ? (
                <Link
                  href={c.href}
                  className="inline-flex font-body text-xs font-semibold text-kelly-slate underline-offset-2 hover:underline"
                >
                  {c.actionLabel}
                </Link>
              ) : (
                <span className="font-body text-xs font-medium text-kelly-text/55">{c.actionLabel}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
