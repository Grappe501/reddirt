"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { Day4SosMappingRow } from "@/lib/election-plan/load-day4-forum-pipeline-surface";
import { EP_DEBATE_QUESTIONS_HREF } from "@/lib/election-plan/debate-prep-links";

const STORAGE_KEY = "kelly-day4-sos-mapping-v1";

type RowDraft = {
  forumTopic: string;
  questionId: string;
  questionTitle: string;
  hammerLine: string;
  clerkResponse: string;
};

type WorksheetState = Record<number, RowDraft>;

function emptyRow(row: Day4SosMappingRow): RowDraft {
  return {
    forumTopic: row.forumTopic,
    questionId: row.suggestedQuestionId,
    questionTitle: row.suggestedQuestionTitle,
    hammerLine: row.hammerLineSuggestion ?? "",
    clerkResponse: "",
  };
}

function loadState(rows: Day4SosMappingRow[]): WorksheetState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as WorksheetState) : {};
    const out: WorksheetState = {};
    for (const row of rows) {
      out[row.rowIndex] = parsed[row.rowIndex] ?? emptyRow(row);
    }
    return out;
  } catch {
    return Object.fromEntries(rows.map((r) => [r.rowIndex, emptyRow(r)]));
  }
}

function saveState(state: WorksheetState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanForumSosMappingWorksheet({ rows }: { rows: Day4SosMappingRow[] }) {
  const [drafts, setDrafts] = useState<WorksheetState>({});

  useEffect(() => {
    setDrafts(loadState(rows));
  }, [rows]);

  const update = useCallback((rowIndex: number, patch: Partial<RowDraft>) => {
    setDrafts((prev) => {
      const next = { ...prev, [rowIndex]: { ...prev[rowIndex]!, ...patch } };
      saveState(next);
      return next;
    });
  }, []);

  const filled = rows.filter((r) => {
    const d = drafts[r.rowIndex];
    return d && d.forumTopic.trim() && d.clerkResponse.trim();
  }).length;

  return (
    <section className="ep-card mt-6 border-2 border-indigo-200/80 bg-indigo-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-indigo-900">Forum → SOS mapping worksheet</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Five forum themes → moderator question → Hammer line (verified only pre-filled) → clerk-centered response sketch.
      </p>
      <Link href={EP_DEBATE_QUESTIONS_HREF} className="mt-2 inline-block text-xs font-bold text-indigo-800">
        Open SOS question bank →
      </Link>

      <div className="mt-5 space-y-4">
        {rows.map((row) => {
          const draft = drafts[row.rowIndex] ?? emptyRow(row);
          const hammerGreen = row.hammerLineClaimsStatus === "green" && row.hammerLineSuggestion;
          return (
            <article key={row.rowIndex} className="rounded-lg border border-[var(--ep-border)] bg-white p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Row {row.rowIndex}</p>

              <label className="mt-3 block">
                <span className="text-xs font-bold text-[var(--ep-navy)]">Forum theme</span>
                <input
                  type="text"
                  value={draft.forumTopic}
                  onChange={(e) => update(row.rowIndex, { forumTopic: e.target.value })}
                  placeholder="Topic from forum lab"
                  className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
                />
              </label>

              <div className="mt-3">
                <span className="text-xs font-bold text-[var(--ep-navy)]">SOS bank question</span>
                {row.suggestedQuestionHref ? (
                  <Link
                    href={row.suggestedQuestionHref}
                    className="mt-1 block rounded-lg border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm font-semibold text-[var(--ep-navy)]"
                  >
                    {draft.questionTitle || "Pick from bank"} →
                  </Link>
                ) : (
                  <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Match a topic to open the question bank.</p>
                )}
              </div>

              <label className="mt-3 block">
                <span className="text-xs font-bold text-[var(--ep-navy)]">Hammer repeat line</span>
                {hammerGreen ? (
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                    Verified · {row.hammerLineSource}
                  </span>
                ) : (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    Pattern language only until claims green
                  </span>
                )}
                <textarea
                  value={draft.hammerLine}
                  onChange={(e) => update(row.rowIndex, { hammerLine: e.target.value })}
                  rows={2}
                  placeholder="Verified forum quote or pattern language"
                  className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
                />
              </label>

              <label className="mt-3 block">
                <span className="text-xs font-bold text-emerald-900">Clerk-centered response sketch</span>
                <textarea
                  value={draft.clerkResponse}
                  onChange={(e) => update(row.rowIndex, { clerkResponse: e.target.value })}
                  rows={3}
                  placeholder="90s answer sketch — no timed sprint tonight"
                  className="mt-1 w-full rounded-lg border border-emerald-200 bg-emerald-50/30 px-3 py-2 text-sm"
                />
              </label>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">{filled} of {rows.length} rows with clerk response sketched</p>
    </section>
  );
}
