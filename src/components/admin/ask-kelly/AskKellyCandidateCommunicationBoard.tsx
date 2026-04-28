"use client";

import Link from "next/link";
import {
  type AskKellyCommandBoardCardState,
  ASK_KELLY_CANDIDATE_COMMUNICATION_BOARD,
} from "@/content/ask-kelly-candidate-onboarding-copy";
import { cn } from "@/lib/utils";

function statusBadge(state: AskKellyCommandBoardCardState): { text: string; className: string } {
  switch (state) {
    case "live":
      return {
        text: "Live",
        className: "bg-emerald-100/90 text-emerald-950 ring-1 ring-emerald-200/80",
      };
    case "setup":
      return {
        text: "Setup needed",
        className: "bg-amber-100/90 text-amber-950 ring-1 ring-amber-200/70",
      };
    case "planned":
      return {
        text: "Planned",
        className: "bg-kelly-text/10 text-kelly-text/75 ring-1 ring-kelly-text/15",
      };
    default:
      return { text: "", className: "" };
  }
}

function cardShellClass(state: AskKellyCommandBoardCardState): string {
  switch (state) {
    case "live":
      return "border-emerald-200/60 bg-kelly-fog/25";
    case "setup":
      return "border-amber-300/70 bg-amber-50/35";
    case "planned":
      return "border-kelly-text/15 border-dashed bg-kelly-text/[0.02]";
    default:
      return "";
  }
}

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
        {cards.map((c) => {
          const badge = statusBadge(c.state);
          return (
            <li
              key={c.id}
              className={cn(
                "flex min-h-[12rem] flex-col rounded-lg border p-4",
                cardShellClass(c.state),
                (c.relatedLinks?.length ?? 0) > 0 && "sm:min-h-[14rem]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-sm font-bold text-kelly-navy">{c.title}</h3>
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide",
                    badge.className,
                  )}
                >
                  {badge.text}
                </span>
              </div>
              <p className="mt-2 flex-1 font-body text-xs leading-relaxed text-kelly-text/80">{c.description}</p>
              {typeof c.complianceNote === "string" && c.complianceNote.trim() ? (
                <p className="mt-2 font-body text-[11px] font-medium leading-snug text-kelly-navy/90">{c.complianceNote}</p>
              ) : null}
              <div className="mt-auto border-t border-kelly-text/8 pt-3">
                {c.href ? (
                  <Link
                    href={c.href}
                    className="inline-flex min-h-[44px] items-center font-body text-xs font-semibold text-kelly-slate underline-offset-2 hover:underline sm:min-h-0"
                  >
                    {c.actionLabel}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-[44px] items-center font-body text-xs font-medium text-kelly-text/55 sm:min-h-0">
                    {c.actionLabel}
                  </span>
                )}
                {c.relatedLinks && c.relatedLinks.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 border-t border-kelly-text/[0.06] pt-3">
                    {c.relatedLinks.map((rel) => (
                      <li key={`${c.id}-${rel.href}`}>
                        <Link
                          href={rel.href}
                          className="inline-flex min-h-[40px] items-center font-body text-[11px] font-semibold leading-snug text-kelly-navy/90 underline-offset-2 hover:underline sm:min-h-0 sm:text-xs"
                        >
                          {rel.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
