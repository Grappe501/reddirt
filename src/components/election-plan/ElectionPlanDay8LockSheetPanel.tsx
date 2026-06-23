"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DAY8_DOMAIN_COVERAGE_CHECK } from "@/lib/election-plan/debate-prep-day8-crash-copy";
import { DAY8_DOMAIN_DEEP_STUDY_LINKS } from "@/lib/election-plan/debate-prep-day8-deep-study-links";
import type { Day8LockSheetDomainRow } from "@/lib/election-plan/load-day8-crash-course-surface";

const STORAGE_KEY = "kelly-day8-lock-sheet-v1";

type LockSheetState = {
  rows: Record<string, { lockedLine: string; opening: boolean; sos: boolean }>;
  quotableLine: string;
};

function defaultState(rows: readonly Day8LockSheetDomainRow[]): LockSheetState {
  return {
    rows: Object.fromEntries(
      rows.map((r) => [
        r.domainId,
        { lockedLine: r.lockedLine, opening: r.coveredInOpening, sos: r.coveredInSos },
      ]),
    ),
    quotableLine: "",
  };
}

function loadState(rows: readonly Day8LockSheetDomainRow[]): LockSheetState {
  if (typeof window === "undefined") return defaultState(rows);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState(rows), ...(JSON.parse(raw) as LockSheetState) } : defaultState(rows);
  } catch {
    return defaultState(rows);
  }
}

function saveState(state: LockSheetState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanDay8LockSheetPanel({ rows }: { rows: readonly Day8LockSheetDomainRow[] }) {
  const [state, setState] = useState<LockSheetState>(() => defaultState(rows));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setState(loadState(rows));
  }, [rows]);

  const updateLine = useCallback((domainId: string, lockedLine: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        rows: {
          ...prev.rows,
          [domainId]: { ...prev.rows[domainId]!, lockedLine },
        },
      };
      saveState(next);
      return next;
    });
  }, []);

  const toggleCheck = useCallback((domainId: string, field: "opening" | "sos") => {
    setState((prev) => {
      const row = prev.rows[domainId]!;
      const next = {
        ...prev,
        rows: {
          ...prev.rows,
          [domainId]: { ...row, [field]: !row[field] },
        },
      };
      saveState(next);
      return next;
    });
  }, []);

  const setQuotable = useCallback((quotableLine: string) => {
    setState((prev) => {
      const next = { ...prev, quotableLine };
      saveState(next);
      return next;
    });
  }, []);

  function buildExportText(): string {
    const lines = rows.map((r) => {
      const saved = state.rows[r.domainId];
      return `${r.domainLabel}: ${saved?.lockedLine ?? r.lockedLine}\n  Opening: ${saved?.opening ? "yes" : "no"} · SOS: ${saved?.sos ? "yes" : "no"}`;
    });
    return [
      "Day 8 lock sheet · claims-green only",
      "",
      ...lines,
      "",
      `Quotable: ${state.quotableLine || "(staff pick)"}`,
      "",
      "Coverage check:",
      ...DAY8_DOMAIN_COVERAGE_CHECK.map((c) => `• ${c}`),
    ].join("\n");
  }

  function handleCopy() {
    const text = buildExportText();
    if (text && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).then(() => setCopied(true));
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <section className="mb-6 space-y-4 print:space-y-2" id="day8-lock-sheet">
      <article className="ep-card border-amber-200 bg-amber-50/50 p-5 text-sm print:border-black print:bg-white">
        <p className="text-xs font-bold uppercase text-amber-950">Lock sheet · three domains + quotable</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Edit lines — copy or print for car/stage. No new stats.</p>

        <div className="mt-4 space-y-4">
          {rows.map((row) => {
            const saved = state.rows[row.domainId];
            return (
              <div key={row.domainId} className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-amber-900">{row.domainLabel}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {DAY8_DOMAIN_DEEP_STUDY_LINKS[row.domainId].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-[10px] font-semibold text-amber-900 underline hover:text-amber-950"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <textarea
                  value={saved?.lockedLine ?? row.lockedLine}
                  onChange={(e) => updateLine(row.domainId, e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded border border-[var(--ep-border)] p-2 text-sm text-[var(--ep-navy)]"
                />
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={saved?.opening ?? row.coveredInOpening}
                      onChange={() => toggleCheck(row.domainId, "opening")}
                    />
                    Covered in opening
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={saved?.sos ?? row.coveredInSos}
                      onChange={() => toggleCheck(row.domainId, "sos")}
                    />
                    Covered in SOS
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <label className="mt-4 block text-[10px] font-bold uppercase text-amber-900">Quotable line · staff cleared</label>
        <textarea
          value={state.quotableLine}
          onChange={(e) => setQuotable(e.target.value)}
          rows={2}
          placeholder="One clerk-centered line — newspaper-friendly"
          className="mt-2 w-full rounded border border-[var(--ep-border)] p-2 text-sm"
        />

        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[var(--ep-navy-muted)]">
          {DAY8_DOMAIN_COVERAGE_CHECK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white"
          >
            {copied ? "Copied ✓" : "Copy lock sheet"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-full border border-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-[var(--ep-navy)]"
          >
            Print
          </button>
        </div>
      </article>
    </section>
  );
}
