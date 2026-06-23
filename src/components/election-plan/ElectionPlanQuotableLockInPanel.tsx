"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DAY7_QUOTABLE_LOCK_STORAGE_KEY,
  DAY7_QUOTABLE_RULE,
} from "@/lib/election-plan/debate-prep-day7-polish-copy";

type LockState = {
  selectedIndex: number;
  staffCleared: boolean;
};

function emptyState(): LockState {
  return { selectedIndex: -1, staffCleared: false };
}

function loadState(): LockState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(DAY7_QUOTABLE_LOCK_STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as LockState;
    return {
      selectedIndex: typeof parsed.selectedIndex === "number" ? parsed.selectedIndex : -1,
      staffCleared: Boolean(parsed.staffCleared),
    };
  } catch {
    return emptyState();
  }
}

function saveState(state: LockState) {
  try {
    window.localStorage.setItem(DAY7_QUOTABLE_LOCK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanQuotableLockInPanel({ candidates }: { candidates: string[] }) {
  const [state, setState] = useState<LockState>(emptyState);

  useEffect(() => {
    setState(loadState());
  }, []);

  const select = useCallback((index: number) => {
    setState((prev) => {
      const next = { ...prev, selectedIndex: index };
      saveState(next);
      return next;
    });
  }, []);

  const toggleStaffCleared = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, staffCleared: !prev.staffCleared };
      saveState(next);
      return next;
    });
  }, []);

  const selectedLine = state.selectedIndex >= 0 ? candidates[state.selectedIndex] : undefined;

  return (
    <section className="ep-card border-rose-200 bg-rose-50/30 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-rose-900">Quotable line lock-in</p>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{DAY7_QUOTABLE_RULE}</p>

      <fieldset className="mt-4 space-y-3">
        <legend className="sr-only">Pick one quotable line for stage</legend>
        {candidates.map((line, index) => (
          <label
            key={`${index}-${line.slice(0, 32)}`}
            className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
              state.selectedIndex === index
                ? "border-rose-500 bg-white ring-2 ring-rose-300"
                : "border-[var(--ep-border)] bg-white/80"
            }`}
          >
            <input
              type="radio"
              name="quotable-line"
              checked={state.selectedIndex === index}
              onChange={() => select(index)}
              className="mt-1"
            />
            <span className="leading-relaxed text-[var(--ep-navy)]">{line}</span>
          </label>
        ))}
      </fieldset>

      <label className="mt-4 flex cursor-pointer items-center gap-2">
        <input type="checkbox" checked={state.staffCleared} onChange={toggleStaffCleared} />
        <span className="text-xs font-bold text-[var(--ep-navy)]">Staff confirms claims-green for stage</span>
      </label>

      {selectedLine && state.staffCleared ? (
        <p className="mt-4 text-xs font-bold text-emerald-900">Quotable line locked for closing beat 3 and rehearsal.</p>
      ) : (
        <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">Pick one line + staff sign-off before debate eve rehearsal.</p>
      )}
    </section>
  );
}
