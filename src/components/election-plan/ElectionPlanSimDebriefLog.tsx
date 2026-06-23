"use client";

import { useCallback, useEffect, useState } from "react";

import { DAY6_DEBRIEF_PROMPTS, DAY6_DEBRIEF_TOP_FIXES_LABEL, DAY6_SIM_DEBRIEF_STORAGE_KEY } from "@/lib/election-plan/debate-prep-day6-simulation-copy";

const STORAGE_KEY = DAY6_SIM_DEBRIEF_STORAGE_KEY;

type DebriefState = {
  fixes: [string, string, string];
  agreeOnlyCloseCount: number;
  weakestSegmentLabel: string;
  updatedAt?: string;
};

const EMPTY: DebriefState = {
  fixes: ["", "", ""],
  agreeOnlyCloseCount: 0,
  weakestSegmentLabel: "",
};

function load(): DebriefState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DebriefState) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(state: DebriefState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanSimDebriefLog({ segmentLabels }: { segmentLabels: string[] }) {
  const [state, setState] = useState<DebriefState>(EMPTY);

  useEffect(() => {
    setState(load());
  }, []);

  const updateFix = useCallback((index: 0 | 1 | 2, value: string) => {
    setState((prev) => {
      const fixes = [...prev.fixes] as [string, string, string];
      fixes[index] = value;
      const next = { ...prev, fixes };
      save(next);
      return next;
    });
  }, []);

  const bumpAgreeOnly = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, agreeOnlyCloseCount: prev.agreeOnlyCloseCount + 1 };
      save(next);
      return next;
    });
  }, []);

  const setWeakest = useCallback((label: string) => {
    setState((prev) => {
      const next = { ...prev, weakestSegmentLabel: label };
      save(next);
      return next;
    });
  }, []);

  const filledFixes = state.fixes.filter((f) => f.trim().length > 0).length;

  return (
    <section className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-violet-900">30-minute debrief · top 3 fixes</p>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{DAY6_DEBRIEF_TOP_FIXES_LABEL}</p>

      <div className="mt-4 space-y-3">
        {state.fixes.map((fix, i) => (
          <label key={`fix-${i}`} className="block">
            <span className="text-[10px] font-bold uppercase text-violet-800">Fix {i + 1}</span>
            <input
              type="text"
              value={fix}
              onChange={(e) => updateFix(i as 0 | 1 | 2, e.target.value)}
              placeholder="One sentence — clerk-centered, claims-green"
              className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={bumpAgreeOnly}
          className="rounded-full border border-violet-400 bg-white px-4 py-2 text-xs font-bold text-violet-900"
        >
          +1 agree-only close moment
        </button>
        <span className="text-xs text-[var(--ep-navy-muted)]">Logged: {state.agreeOnlyCloseCount}</span>
      </div>

      <label className="mt-4 block">
        <span className="text-[10px] font-bold uppercase text-violet-800">Weakest segment</span>
        <select
          value={state.weakestSegmentLabel}
          onChange={(e) => setWeakest(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
        >
          <option value="">Select segment…</option>
          {segmentLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-bold text-[var(--ep-navy)]">Debrief prompts</summary>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[var(--ep-navy-muted)]">
          {DAY6_DEBRIEF_PROMPTS.map((p) => (
            <li key={p.slice(0, 40)}>{p}</li>
          ))}
        </ul>
      </details>

      <p className="mt-4 text-xs font-bold text-emerald-900">
        {filledFixes >= 3 ? "Top 3 fixes logged — ready for Day 7 polish." : `${filledFixes}/3 fixes logged.`}
      </p>
    </section>
  );
}
