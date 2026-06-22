"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DAY6_READINESS_TARGET_LABEL, DAY6_SIM_CLAIMS_GATE } from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";

const STORAGE_KEY = "kelly-day6-readiness-audit-v1";

const DIMENSIONS = [
  { id: "opening", label: "Opening bookend · administrator frame" },
  { id: "traps", label: "Trap lane pivots · 60s each" },
  { id: "sos", label: "SOS answers · clerk image in last 10s" },
  { id: "closing", label: "Closing bookend · peak-end calm" },
  { id: "claims", label: "Claims gate · no BLOCKED lines in script" },
] as const;

type DimensionId = (typeof DIMENSIONS)[number]["id"];

type AuditState = {
  scores: Record<DimensionId, number>;
  blockedLinesCut: boolean;
};

const DEFAULT_SCORES: Record<DimensionId, number> = {
  opening: 70,
  traps: 70,
  sos: 70,
  closing: 70,
  claims: 70,
};

function load(): AuditState {
  if (typeof window === "undefined") {
    return { scores: DEFAULT_SCORES, blockedLinesCut: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditState) : { scores: DEFAULT_SCORES, blockedLinesCut: false };
  } catch {
    return { scores: DEFAULT_SCORES, blockedLinesCut: false };
  }
}

function save(state: AuditState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanReadinessAuditPanel() {
  const [state, setState] = useState<AuditState>({ scores: DEFAULT_SCORES, blockedLinesCut: false });

  useEffect(() => {
    setState(load());
  }, []);

  const setScore = useCallback((id: DimensionId, score: number) => {
    setState((prev) => {
      const next = { ...prev, scores: { ...prev.scores, [id]: score } };
      save(next);
      return next;
    });
  }, []);

  const toggleBlocked = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, blockedLinesCut: !prev.blockedLinesCut };
      save(next);
      return next;
    });
  }, []);

  const values = Object.values(state.scores);
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const allAbove70 = values.every((v) => v >= 70);

  return (
    <section className="ep-card border-amber-200 bg-amber-50/30 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-amber-950">Debate command readiness audit</p>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{DAY6_READINESS_TARGET_LABEL}</p>

      <ul className="mt-4 space-y-4">
        {DIMENSIONS.map((dim) => (
          <li key={dim.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-[var(--ep-navy)]">{dim.label}</span>
              <span className="font-mono text-sm font-bold text-[var(--ep-navy)]">{state.scores[dim.id]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={state.scores[dim.id]}
              onChange={(e) => setScore(dim.id, Number(e.target.value))}
              className="mt-2 w-full"
            />
          </li>
        ))}
      </ul>

      <p className="mt-4 font-heading text-xl font-bold text-[var(--ep-navy)]">{avg}% average</p>
      <p className="text-xs text-[var(--ep-navy-muted)]">
        {allAbove70 && state.blockedLinesCut
          ? "Readiness gate met — honest baseline for Day 7."
          : "Adjust sim script — cut BLOCKED lines before travel."}
      </p>

      <label className="mt-4 flex cursor-pointer items-start gap-2">
        <input type="checkbox" checked={state.blockedLinesCut} onChange={toggleBlocked} className="mt-1" />
        <span className="text-sm text-[var(--ep-navy)]">
          I cut every BLOCKED debate-command line from tonight&apos;s sim script.
        </span>
      </label>

      <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-amber-950">
        {DAY6_SIM_CLAIMS_GATE.slice(0, 2).map((line) => (
          <li key={line.slice(0, 40)}>{line}</li>
        ))}
      </ul>

      <Link
        href={epDebatePrepLaneHref("lane-d6-readiness")}
        className="mt-4 inline-block text-xs font-bold text-[var(--ep-navy)] underline"
      >
        Readiness audit lane →
      </Link>
    </section>
  );
}
