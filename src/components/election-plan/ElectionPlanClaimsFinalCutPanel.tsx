"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  DAY7_CLAIMS_FINAL_STORAGE_KEY,
  DAY7_CUT_DONT_ADD,
  DAY7_POLISH_CLAIMS_GATE,
} from "@/lib/election-plan/debate-prep-day7-polish-copy";
import { epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";

type ClaimsFinalState = {
  blockedLinesCut: boolean;
  noNewMaterial: boolean;
  quotableChecked: boolean;
  staffSignedOff: boolean;
};

function emptyState(): ClaimsFinalState {
  return {
    blockedLinesCut: false,
    noNewMaterial: false,
    quotableChecked: false,
    staffSignedOff: false,
  };
}

function loadState(): ClaimsFinalState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(DAY7_CLAIMS_FINAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClaimsFinalState) : emptyState();
  } catch {
    return emptyState();
  }
}

function saveState(state: ClaimsFinalState) {
  try {
    window.localStorage.setItem(DAY7_CLAIMS_FINAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanClaimsFinalCutPanel() {
  const [state, setState] = useState<ClaimsFinalState>(emptyState);

  useEffect(() => {
    setState(loadState());
  }, []);

  const toggle = useCallback((key: keyof ClaimsFinalState) => {
    setState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveState(next);
      return next;
    });
  }, []);

  const doneCount = Object.values(state).filter(Boolean).length;
  const complete = doneCount === 4;

  return (
    <section className="ep-card border-amber-200 bg-amber-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-amber-900">Final claims scan · cut gate</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY7_CUT_DONT_ADD}</p>

      <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-[var(--ep-navy-muted)]">
        {DAY7_POLISH_CLAIMS_GATE.map((line) => (
          <li key={line.slice(0, 48)}>{line}</li>
        ))}
      </ul>

      <div className="mt-4 space-y-3">
        {(
          [
            ["blockedLinesCut", "Every BLOCKED line cut from stage script"],
            ["noNewMaterial", "No new stats or opponent quotes added during scan"],
            ["quotableChecked", "Staff-cleared quotable line passes claims gate"],
            ["staffSignedOff", "Staff signed final claims-green script"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-start gap-2">
            <input type="checkbox" checked={state[key]} onChange={() => toggle(key)} className="mt-0.5" />
            <span className="text-sm text-[var(--ep-navy)]">{label}</span>
          </label>
        ))}
      </div>

      <p className="mt-4 text-xs font-bold text-emerald-900">
        {complete ? "Claims final scan complete — bookends rehearsal cleared." : `${doneCount}/4 gates checked.`}
      </p>

      <Link
        href={epDebatePrepDayBlockHref("day-3-superiority-map", "b3-claims")}
        className="mt-3 inline-block text-xs font-bold text-[var(--ep-navy)] underline"
      >
        Day 3 claims gate reference →
      </Link>
    </section>
  );
}
