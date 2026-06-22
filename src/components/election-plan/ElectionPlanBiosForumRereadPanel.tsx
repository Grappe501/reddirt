"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { Day4BioRereadRow } from "@/lib/election-plan/load-day4-forum-pipeline-surface";
import { epOpponentBioHref } from "@/lib/election-plan/debate-prep-links";
import { EP_OPPOSITION_DEBATE_NIGHT_HREF } from "@/lib/election-plan/debate-prep-links";

const STORAGE_KEY = "kelly-day4-bios-reread-v1";

type ForecastVerdict = "confirmed" | "changed" | "contradicted" | "";

type BioRowState = {
  verdicts: Record<string, ForecastVerdict>;
  memoryLine: string;
  forumSurprise: string;
};

type WorksheetState = Record<string, BioRowState>;

function loadState(rows: Day4BioRereadRow[]): WorksheetState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorksheetState) : {};
  } catch {
    return {};
  }
}

function saveState(state: WorksheetState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

const VERDICT_OPTIONS: Array<{ id: ForecastVerdict; label: string }> = [
  { id: "confirmed", label: "Confirmed" },
  { id: "changed", label: "Changed" },
  { id: "contradicted", label: "Contradicted" },
];

export function ElectionPlanBiosForumRereadPanel({ rows }: { rows: Day4BioRereadRow[] }) {
  const [state, setState] = useState<WorksheetState>({});

  useEffect(() => {
    setState(loadState(rows));
  }, [rows]);

  const patchRow = useCallback((opponentId: string, patch: Partial<BioRowState>) => {
    setState((prev) => {
      const current = prev[opponentId] ?? { verdicts: {}, memoryLine: "", forumSurprise: "" };
      const next = {
        ...prev,
        [opponentId]: { ...current, ...patch },
      };
      saveState(next);
      return next;
    });
  }, []);

  const setVerdict = useCallback(
    (opponentId: string, heading: string, verdict: ForecastVerdict) => {
      setState((prev) => {
        const row = prev[opponentId] ?? { verdicts: {}, memoryLine: "", forumSurprise: "" };
        const next = {
          ...prev,
          [opponentId]: { ...row, verdicts: { ...row.verdicts, [heading]: verdict } },
        };
        saveState(next);
        return next;
      });
    },
    [],
  );

  return (
    <section className="ep-card mt-6 border-2 border-rose-200/80 bg-rose-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-rose-900">Bios re-read · forum vs forecast</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Compare pre-forum forecast to what they actually said — verified forum lines only below.
      </p>
      <Link href={EP_OPPOSITION_DEBATE_NIGHT_HREF} className="mt-2 inline-block text-xs font-bold text-rose-800">
        Debate-night export card →
      </Link>

      <div className="mt-5 space-y-6">
        {rows.map((bio) => {
          const rowState = state[bio.opponentId] ?? { verdicts: {}, memoryLine: "", forumSurprise: "" };
          return (
            <article key={bio.opponentId} className="rounded-lg border border-[var(--ep-border)] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{bio.displayName}</h3>
                <Link href={epOpponentBioHref(bio.opponentId)} className="text-xs font-bold text-violet-800">
                  Full bio →
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {bio.forecastSections.map((section) => (
                  <div key={section.heading} className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-3">
                    <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">{section.heading}</p>
                    <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{section.body}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {VERDICT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setVerdict(bio.opponentId, section.heading, opt.id)}
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                            rowState.verdicts[section.heading] === opt.id
                              ? "bg-violet-900 text-white"
                              : "bg-white text-[var(--ep-navy-muted)] ring-1 ring-[var(--ep-border)]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {bio.verifiedForumLines.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase text-emerald-900">Verified forum lines (claims green)</p>
                  <ul className="mt-2 space-y-2">
                    {bio.verifiedForumLines.map((line) => (
                      <li key={line.id} className="rounded-lg border border-emerald-200 bg-emerald-50/40 px-3 py-2 text-xs">
                        <span className="font-bold text-emerald-900">{line.sourceLabel}</span>
                        <p className="mt-1 text-[var(--ep-navy)]">&ldquo;{line.quote}&rdquo;</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-xs text-amber-800">No verified forum quotes yet — use pattern phrases after lab ingest.</p>
              )}

              {bio.patternPhrases.length > 0 ? (
                <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
                  Pattern phrases: {bio.patternPhrases.join(" · ")}
                </p>
              ) : null}

              <label className="mt-4 block">
                <span className="text-xs font-bold text-[var(--ep-navy)]">Forum surprise (one line)</span>
                <input
                  type="text"
                  value={rowState.forumSurprise}
                  onChange={(e) => patchRow(bio.opponentId, { forumSurprise: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
                />
              </label>

              <label className="mt-3 block">
                <span className="text-xs font-bold text-emerald-900">Adjusted memory line (claims-gated if quoting forum)</span>
                <textarea
                  value={rowState.memoryLine}
                  onChange={(e) => patchRow(bio.opponentId, { memoryLine: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-emerald-200 bg-emerald-50/30 px-3 py-2 text-sm"
                />
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}
