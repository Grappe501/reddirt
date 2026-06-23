"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  DAY6_DEBRIEF_TOP_FIXES_LABEL,
  DAY6_SIM_DEBRIEF_STORAGE_KEY,
} from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import { DAY7_DEBRIEF_IMPORT_LABEL } from "@/lib/election-plan/debate-prep-day7-polish-copy";

type DebriefState = {
  fixes: [string, string, string];
  agreeOnlyCloseCount: number;
  weakestSegmentLabel: string;
};

const EMPTY: DebriefState = {
  fixes: ["", "", ""],
  agreeOnlyCloseCount: 0,
  weakestSegmentLabel: "",
};

function loadDebrief(): DebriefState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(DAY6_SIM_DEBRIEF_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DebriefState) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function ElectionPlanDay7DebriefImportPanel({
  day6DebriefBlockHref,
}: {
  day6DebriefBlockHref: string;
}) {
  const [state, setState] = useState<DebriefState>(EMPTY);

  useEffect(() => {
    setState(loadDebrief());
  }, []);

  const refresh = useCallback(() => {
    setState(loadDebrief());
  }, []);

  const fixOne = state.fixes[0]?.trim() ?? "";
  const filledCount = state.fixes.filter((f) => f.trim().length > 0).length;

  return (
    <section className="ep-card border-rose-200 bg-rose-50/30 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-rose-900">Day 6 debrief import · closing beat 2</p>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{DAY7_DEBRIEF_IMPORT_LABEL}</p>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{DAY6_DEBRIEF_TOP_FIXES_LABEL}</p>

      {fixOne ? (
        <blockquote className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-[var(--ep-navy)]">
          <p className="text-[10px] font-bold uppercase text-emerald-900">Fix #1 → weave into closing beat 2</p>
          <p className="mt-2 font-semibold leading-relaxed">{fixOne}</p>
        </blockquote>
      ) : (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
          No Day 6 fix #1 logged yet — open the sim debrief block and log top 3 fixes, then refresh here.
        </p>
      )}

      {state.weakestSegmentLabel ? (
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          Weakest sim segment: <strong className="text-[var(--ep-navy)]">{state.weakestSegmentLabel}</strong>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={refresh}
          className="rounded-full border border-rose-400 bg-white px-4 py-2 text-xs font-bold text-rose-900"
        >
          Refresh from Day 6 debrief
        </button>
        <Link href={day6DebriefBlockHref} className="text-xs font-bold text-[var(--ep-navy)] underline">
          Open Day 6 sim debrief →
        </Link>
      </div>

      <p className="mt-4 text-xs font-bold text-emerald-900">
        {filledCount >= 1 ? `${filledCount}/3 fixes available from Day 6` : "Log fixes on Day 6 before weaving tonight."}
      </p>
    </section>
  );
}
