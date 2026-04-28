"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { AskKellyCandidateCommunicationBoard } from "@/components/admin/ask-kelly/AskKellyCandidateCommunicationBoard";
import { AskKellyCandidateIntegrationStatus } from "@/components/admin/ask-kelly/AskKellyCandidateIntegrationStatus";
import {
  ASK_KELLY_COMMAND_CONSOLE_HEADER,
  ASK_KELLY_CONFIDENCE_BLOCK,
  ASK_KELLY_DIXIE_CONSOLE_NOTE,
  ASK_KELLY_MANUAL_OF_EVERYTHING_STATUS,
  ASK_KELLY_ONBOARDING_COMMAND_CENTER_TAGLINE,
  ASK_KELLY_ROLE_CONSOLE_FRAMING,
  ASK_KELLY_SAFE_ACCESS_SECTION,
  ASK_KELLY_WRITING_SURFACE_PARTNER,
} from "@/content/ask-kelly-candidate-onboarding-copy";
import { cn } from "@/lib/utils";

/** Persisted display mode for Candidate onboarding console (V2.13). */
export const ASK_KELLY_CONSOLE_VIEW_MODE_STORAGE_KEY = "ask_kelly_console_view_mode_v1";

export type AskKellyConsoleViewMode = "minimized" | "docked" | "fullscreen";

/** High-priority admin destinations — same rails as the staged walkthrough below. */
const CONSOLE_QUICK_LINKS: { href: string; label: string }[] = [
  { href: "/admin/pages", label: "Page content" },
  { href: "/admin/workbench/ask-kelly-beta", label: "Beta feedback" },
  { href: "/admin/workbench", label: "Workbench" },
];

const WORKSPACE_HINT =
  "Keep the console open while you work, or minimize it when you need the full dashboard.";

const RESEARCH_TOOLS_PLACEHOLDER = {
  title: "Research tools",
  status: "Planned · controlled access",
  body:
    "Future research tools should be opened deliberately, use approved sources, and return cited summaries for review. Open-web browsing is not part of this deployment today.",
};

function readStoredMode(): AskKellyConsoleViewMode {
  if (typeof window === "undefined") return "docked";
  try {
    const v = window.localStorage.getItem(ASK_KELLY_CONSOLE_VIEW_MODE_STORAGE_KEY);
    if (v === "minimized" || v === "docked" || v === "fullscreen") return v;
  } catch {
    /* ignore */
  }
  return "docked";
}

export function AskKellyCommandConsole({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AskKellyConsoleViewMode>("docked");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setModeState(readStoredMode());
    setHydrated(true);
  }, []);

  const setMode = useCallback((next: AskKellyConsoleViewMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(ASK_KELLY_CONSOLE_VIEW_MODE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  /** Before hydration, render docked so layout matches server. */
  const effectiveMode = hydrated ? mode : "docked";

  const toolbar = (
    <div
      role="toolbar"
      aria-label="Ask Kelly console display"
      className="flex flex-col gap-3 border-b border-kelly-text/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"
    >
      <p className="max-w-xl font-body text-xs leading-relaxed text-kelly-text/75">{WORKSPACE_HINT}</p>
      <div className="flex flex-wrap items-center gap-2">
        {effectiveMode === "fullscreen" && (
          <button
            type="button"
            title="Restore default console width (docked layout)"
            className="rounded-md border border-kelly-forest/25 bg-kelly-forest/10 px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy transition hover:bg-kelly-forest/15"
            onClick={() => setMode("docked")}
          >
            Exit full screen
          </button>
        )}
        {effectiveMode !== "minimized" && (
          <button
            type="button"
            className="rounded-md border border-kelly-text/15 bg-[var(--color-surface-elevated)] px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy transition hover:border-kelly-navy/25"
            onClick={() => setMode("minimized")}
          >
            Minimize
          </button>
        )}
        {effectiveMode === "docked" && (
          <button
            type="button"
            className="rounded-md border border-kelly-blue/30 bg-kelly-blue/10 px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy transition hover:bg-kelly-blue/15"
            onClick={() => setMode("fullscreen")}
          >
            Expand
          </button>
        )}
        {effectiveMode === "minimized" && (
          <button
            type="button"
            className="rounded-md border border-kelly-blue/30 bg-kelly-blue/10 px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy transition hover:bg-kelly-blue/15"
            onClick={() => setMode("docked")}
          >
            Expand
          </button>
        )}
      </div>
    </div>
  );

  const inner = (
    <>
      {toolbar}

      <header className="relative px-6 py-9 sm:px-10 sm:py-11">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-navy/70">Campaign operating system</p>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-kelly-navy sm:text-[2.1rem]">
          {ASK_KELLY_COMMAND_CONSOLE_HEADER.title}
        </h1>
        <p className="mt-4 max-w-3xl font-body text-base leading-relaxed text-kelly-text/92">
          {ASK_KELLY_COMMAND_CONSOLE_HEADER.lead}
        </p>
        <p className="mt-5 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">{ASK_KELLY_ONBOARDING_COMMAND_CENTER_TAGLINE}</p>

        <nav
          aria-label="Suggested next actions"
          className="mt-8 flex flex-wrap gap-2.5 border-t border-kelly-text/10 pt-7"
        >
          {CONSOLE_QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex rounded-md border border-kelly-navy/20 bg-kelly-fog/40 px-4 py-2 font-body text-xs font-bold uppercase tracking-wide text-kelly-navy transition hover:border-kelly-gold/40 hover:bg-kelly-fog/70"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="relative space-y-6 px-6 pb-6 pt-0 sm:px-10 sm:pb-9">
        <section
          aria-labelledby="manual-of-everything-status"
          className="rounded-xl border border-kelly-navy/14 bg-kelly-blue/[0.04] p-5 sm:p-6"
        >
          <h2 id="manual-of-everything-status" className="font-heading text-base font-bold text-kelly-navy sm:text-lg">
            {ASK_KELLY_MANUAL_OF_EVERYTHING_STATUS.title}
          </h2>
          <p className="mt-2 font-body text-xs leading-relaxed text-kelly-text/78">{ASK_KELLY_MANUAL_OF_EVERYTHING_STATUS.intro}</p>
          <ul className="mt-4 divide-y divide-kelly-text/10 rounded-lg border border-kelly-text/10 bg-[var(--color-surface-elevated)]">
            {ASK_KELLY_MANUAL_OF_EVERYTHING_STATUS.rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5 font-body text-sm text-kelly-text/88">
                <span>{row.label}</span>
                <span className="shrink-0 font-semibold text-kelly-navy/90">{row.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <AskKellyCandidateCommunicationBoard />

        <AskKellyCandidateIntegrationStatus />

        <section
          aria-labelledby="ask-kelly-confidence"
          className="rounded-xl border border-kelly-forest/20 bg-gradient-to-br from-kelly-fog/80 to-transparent p-6 sm:p-7"
        >
          <h2 id="ask-kelly-confidence" className="font-heading text-lg font-bold text-kelly-navy sm:text-xl">
            {ASK_KELLY_CONFIDENCE_BLOCK.title}
          </h2>
          <div className="mt-4 space-y-3">
            {ASK_KELLY_CONFIDENCE_BLOCK.paragraphs.map((p) => (
              <p key={p} className="font-body text-sm leading-relaxed text-kelly-text/88">
                {p}
              </p>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section
            aria-labelledby="candidate-console-card"
            className={cn(
              "rounded-xl border border-kelly-navy/12 bg-gradient-to-b from-[var(--color-surface-elevated)] to-kelly-blue/[0.04]",
              "p-6 shadow-[var(--shadow-soft)]",
            )}
          >
            <h2 id="candidate-console-card" className="font-heading text-lg font-bold text-kelly-navy">
              {ASK_KELLY_ROLE_CONSOLE_FRAMING.candidate.title}
            </h2>
            <div className="mt-3 space-y-2.5">
              {ASK_KELLY_ROLE_CONSOLE_FRAMING.candidate.body.map((p) => (
                <p key={p} className="font-body text-sm leading-relaxed text-kelly-text/88">
                  {p}
                </p>
              ))}
            </div>
          </section>
          <section
            aria-labelledby="manager-console-card"
            className="rounded-xl border border-kelly-navy/12 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
          >
            <h2 id="manager-console-card" className="font-heading text-lg font-bold text-kelly-navy">
              {ASK_KELLY_ROLE_CONSOLE_FRAMING.manager.title}
            </h2>
            <div className="mt-3 space-y-2.5">
              {ASK_KELLY_ROLE_CONSOLE_FRAMING.manager.body.map((p) => (
                <p key={p} className="font-body text-sm leading-relaxed text-kelly-text/88">
                  {p}
                </p>
              ))}
            </div>
          </section>
        </div>

        <section
          aria-labelledby="safe-access-console"
          className="rounded-xl border border-kelly-text/10 bg-kelly-text/[0.02] p-6"
        >
          <h2 id="safe-access-console" className="font-heading text-lg font-bold text-kelly-navy">
            {ASK_KELLY_SAFE_ACCESS_SECTION.title}
          </h2>
          <div className="mt-3 space-y-2.5">
            {ASK_KELLY_SAFE_ACCESS_SECTION.paragraphs.map((p) => (
              <p key={p} className="font-body text-sm leading-relaxed text-kelly-text/88">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="research-tools-console"
          className="rounded-xl border border-kelly-navy/15 border-dashed bg-kelly-fog/30 p-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="research-tools-console" className="font-heading text-lg font-bold text-kelly-navy">
              {RESEARCH_TOOLS_PLACEHOLDER.title}
            </h2>
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-navy/55">
              {RESEARCH_TOOLS_PLACEHOLDER.status}
            </span>
          </div>
          <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">{RESEARCH_TOOLS_PLACEHOLDER.body}</p>
        </section>

        <section
          aria-labelledby="writing-surface-console"
          className="rounded-xl border border-kelly-blue/14 bg-[var(--color-surface-elevated)] p-6"
        >
          <h2 id="writing-surface-console" className="font-heading text-lg font-bold text-kelly-navy">
            {ASK_KELLY_WRITING_SURFACE_PARTNER.title}
          </h2>
          <div className="mt-3 space-y-2.5">
            {ASK_KELLY_WRITING_SURFACE_PARTNER.paragraphs.map((p) => (
              <p key={p} className="font-body text-sm leading-relaxed text-kelly-text/88">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="dixie-console-note"
          className="rounded-xl border border-kelly-gold/25 bg-kelly-gold/[0.06] p-5"
        >
          <h2 id="dixie-console-note" className="font-heading text-base font-bold text-kelly-navy">
            {ASK_KELLY_DIXIE_CONSOLE_NOTE.title}
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 font-body text-sm leading-relaxed text-kelly-text/88">
            {ASK_KELLY_DIXIE_CONSOLE_NOTE.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );

  const cardShell = (
    <div className="relative overflow-hidden rounded-2xl border border-kelly-navy/18 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)] transition-[max-width] duration-200 ease-out">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_110%_70%_at_50%_-30%,var(--tw-gradient-stops))] from-kelly-blue/12 via-transparent to-transparent"
      />
      <div className="relative">{inner}</div>
    </div>
  );

  /** Focus mode: widen within main column; sidebar stays visible (aligned with admin shell aside width). */
  const shellClass =
    effectiveMode === "fullscreen"
      ? cn(
          "fixed z-30 overflow-y-auto bg-kelly-wash/98 px-4 py-6 shadow-2xl backdrop-blur-sm sm:px-8",
          "left-0 right-0 top-0 min-h-screen max-h-screen md:left-[min(280px,100vw)]",
        )
      : "mx-auto w-full max-w-5xl px-1 sm:px-0";

  if (effectiveMode === "minimized") {
    return (
      <div className="mx-auto w-full max-w-5xl px-1 sm:px-0">
        <div
          className={cn(
            "fixed bottom-4 z-20 flex items-center justify-between gap-3 rounded-xl border border-kelly-navy/20",
            "bg-[var(--color-surface-elevated)] px-4 py-3 shadow-[var(--shadow-soft)]",
            "left-4 right-4 md:left-[min(280px,100vw)] md:right-8",
          )}
          role="region"
          aria-label="Ask Kelly console minimized"
        >
          <div>
            <p className="font-heading text-sm font-bold text-kelly-navy">Ask Kelly</p>
            <p className="font-body text-xs text-kelly-text/70">Candidate onboarding — compact</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-kelly-blue/30 bg-kelly-blue/10 px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy transition hover:bg-kelly-blue/15"
              onClick={() => setMode("docked")}
            >
              Open Ask Kelly
            </button>
            <button
              type="button"
              className="rounded-md border border-kelly-navy/20 px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy"
              onClick={() => setMode("fullscreen")}
            >
              Expand
            </button>
          </div>
        </div>
        <p className="mt-2 font-body text-xs text-kelly-text/60">{WORKSPACE_HINT}</p>
        <div className="mt-8 space-y-10">{children}</div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div
        className={cn(
          effectiveMode === "fullscreen" && "mx-auto w-full max-w-[min(96rem,calc(100vw-2rem))]",
          effectiveMode === "docked" && "mx-auto max-w-5xl px-1 sm:px-0",
        )}
      >
        {cardShell}
        <div className="mt-10 space-y-10">{children}</div>
      </div>
    </div>
  );
}
