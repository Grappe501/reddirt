"use client";

import { useCallback, useEffect, useState } from "react";

import type { Day4VerifiedQuoteLine } from "@/lib/election-plan/load-day4-forum-pipeline-surface";

const STORAGE_KEY = "kelly-day4-predicted-hammer-line-v1";

function loadSelected(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveSelected(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

export function ElectionPlanForumPredictedLinePicker({
  lines,
  scriptId,
}: {
  lines: Day4VerifiedQuoteLine[];
  scriptId: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(loadSelected());
  }, []);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    saveSelected(id);
  }, []);

  if (scriptId !== "rehearse-forum-counter-60s") return null;

  if (lines.length === 0) {
    return (
      <section className="ep-card mb-6 border-2 border-amber-200 bg-amber-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-amber-900">Predicted Hammer line · claims-gated only</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          No verified Hammer forum quotes yet. Complete v2 deep analysis and claims review before rehearsal — use pattern
          language from block study until green.
        </p>
      </section>
    );
  }

  const selected = lines.find((l) => l.id === selectedId);

  return (
    <section className="ep-card mb-6 border-2 border-violet-300/50 bg-violet-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-violet-900">Pick predicted Hammer line · verified only</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Choose one claims-cleared forum line for your 60s counter — source and timestamp required on every option.
      </p>

      <ul className="mt-4 space-y-2">
        {lines.map((line) => {
          const active = line.id === selectedId;
          return (
            <li key={line.id}>
              <button
                type="button"
                onClick={() => select(line.id)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  active ? "border-violet-500 bg-white ring-2 ring-violet-300" : "border-[var(--ep-border)] bg-white"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                    Verified
                  </span>
                  <span className="text-[10px] text-[var(--ep-navy-muted)]">
                    {line.sourceLabel} · {formatTs(line.timestamp)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[var(--ep-navy)]">&ldquo;{line.quote}&rdquo;</p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{line.context}</p>
              </button>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <article className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50/50 p-4">
          <p className="text-xs font-bold uppercase text-emerald-900">Rehearsal prompt — say your counter aloud</p>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">They said:</p>
          <p className="mt-1 text-lg font-semibold text-[var(--ep-navy)]">&ldquo;{selected.quote}&rdquo;</p>
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">Your job: clerk-centered 60s counter — no unverified quotes back.</p>
        </article>
      ) : null}
    </section>
  );
}

export function getDay4SelectedHammerLineId(): string | null {
  return loadSelected();
}
