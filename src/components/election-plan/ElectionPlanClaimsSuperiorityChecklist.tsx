"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { epOppositionResearchModuleHref } from "@/lib/election-plan/debate-prep-links";
import type { ElectionPlanClaimsSuperioritySummary } from "@/lib/election-plan/debate-prep-claims-superiority-types";

const STORAGE_KEY = "kelly-day3-claims-superiority-v1";

type SuperiorityLineStatus = "unset" | "green" | "red";

type ChecklistState = {
  lines: [string, string, string];
  statuses: [SuperiorityLineStatus, SuperiorityLineStatus, SuperiorityLineStatus];
};

function emptyState(): ChecklistState {
  return {
    lines: ["", "", ""],
    statuses: ["unset", "unset", "unset"],
  };
}

function loadChecklist(): ChecklistState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ChecklistState;
    if (!Array.isArray(parsed.lines) || parsed.lines.length !== 3) return emptyState();
    if (!Array.isArray(parsed.statuses) || parsed.statuses.length !== 3) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function saveChecklist(state: ChecklistState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function ElectionPlanClaimsSuperiorityChecklist({
  summary,
}: {
  summary: ElectionPlanClaimsSuperioritySummary;
}) {
  const [state, setState] = useState<ChecklistState>(emptyState);

  useEffect(() => {
    setState(loadChecklist());
  }, []);

  const patch = useCallback((index: 0 | 1 | 2, patch: Partial<{ line: string; status: SuperiorityLineStatus }>) => {
    setState((prev) => {
      const lines = [...prev.lines] as ChecklistState["lines"];
      const statuses = [...prev.statuses] as ChecklistState["statuses"];
      if (patch.line !== undefined) lines[index] = patch.line;
      if (patch.status !== undefined) statuses[index] = patch.status;
      const next = { lines, statuses };
      saveChecklist(next);
      return next;
    });
  }, []);

  const greenCount = state.statuses.filter((s) => s === "green").length;
  const redCount = state.statuses.filter((s) => s === "red").length;
  const { ledgerTotals, hubBuckets, superiorityCategories } = summary;

  return (
    <section className="ep-card border-2 border-amber-200 bg-amber-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-amber-900">Claims superiority checklist</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Ledger categories below are counts only — no claim text on this page. Mark each planned superiority line green
        (verified) or red (do not stage). Red line = drop the stat or research-frame with staff.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Ledger totals</p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--ep-navy-muted)]">
            <li>{ledgerTotals.totalClaims} total claims indexed</li>
            <li>{ledgerTotals.verifiedClaims} verified</li>
            <li className="font-semibold text-amber-900">{ledgerTotals.needsReviewClaims} need review</li>
            <li>{ledgerTotals.unsupportedClaims} unsupported</li>
          </ul>
        </article>
        <article className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Opposition hub buckets</p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--ep-navy-muted)]">
            <li className="text-emerald-800">{hubBuckets.supported} supported</li>
            <li>{hubBuckets.partial} partial</li>
            <li className="font-semibold text-amber-900">{hubBuckets.needsResearch} need research</li>
          </ul>
        </article>
        <article className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Full ledger module</p>
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
            Open claims ledger for staff-reviewed wording before any new stat hits rehearsal.
          </p>
          <Link
            href={epOppositionResearchModuleHref("claims-ledger")}
            className="mt-3 inline-block text-xs font-bold underline"
          >
            Open claims ledger →
          </Link>
        </article>
      </div>

      {superiorityCategories.length > 0 ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--ep-border)] text-[var(--ep-navy)]">
                <th className="py-2 pr-3 font-bold uppercase">Category</th>
                <th className="py-2 pr-3 font-bold uppercase">Total</th>
                <th className="py-2 pr-3 font-bold uppercase text-emerald-800">Stage-safe</th>
                <th className="py-2 font-bold uppercase text-amber-900">Needs review</th>
              </tr>
            </thead>
            <tbody className="text-[var(--ep-navy-muted)]">
              {superiorityCategories.map((row) => (
                <tr key={row.id} className="border-b border-[var(--ep-border)]/40">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3">{row.totalCount}</td>
                  <td className="py-2 pr-3 text-emerald-800">{row.stageSafeCount}</td>
                  <td className="py-2 font-semibold text-amber-900">{row.needsReviewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Three superiority lines for stage tonight</h3>
        {([0, 1, 2] as const).map((index) => (
          <article key={index} className="rounded-xl border border-[var(--ep-border)] bg-white p-4">
            <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Beat {index + 1}</p>
            <textarea
              value={state.lines[index]}
              onChange={(e) => patch(index, { line: e.target.value })}
              rows={2}
              placeholder="One superiority line you plan to say aloud — no bill numbers unless verified"
              className="mt-2 w-full rounded-lg border border-[var(--ep-border)] p-2 text-sm text-[var(--ep-navy)]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => patch(index, { status: "green" })}
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  state.statuses[index] === "green"
                    ? "border-emerald-600 bg-emerald-100 text-emerald-950"
                    : "border-emerald-200 bg-white text-emerald-900"
                }`}
              >
                Green · verified
              </button>
              <button
                type="button"
                onClick={() => patch(index, { status: "red" })}
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  state.statuses[index] === "red"
                    ? "border-rose-600 bg-rose-100 text-rose-950"
                    : "border-rose-200 bg-white text-rose-900"
                }`}
              >
                Red · do not stage
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-amber-950">
        {redCount > 0
          ? `${redCount} red line(s) — cross out on notecards and replace with research frame before rehearsal.`
          : greenCount >= 3
            ? "Claims gate met — three green superiority beats locked. Recite from memory under 60 seconds."
            : `${greenCount}/3 lines marked green — lock three verified beats before evening close.`}
      </p>
    </section>
  );
}
