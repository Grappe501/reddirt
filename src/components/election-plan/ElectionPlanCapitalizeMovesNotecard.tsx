"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Day4NotecardLine } from "@/lib/election-plan/load-day4-forum-pipeline-surface";
import { EP_FORUM_TRANSCRIPT_LAB_HREF } from "@/lib/election-plan/debate-prep-links";

const STORAGE_KEY = "kelly-day4-capitalize-notecard-v1";

type NotecardSelection = Record<number, boolean>;

function loadSelection(): NotecardSelection {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NotecardSelection) : {};
  } catch {
    return {};
  }
}

function saveSelection(sel: NotecardSelection) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
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

export function ElectionPlanCapitalizeMovesNotecard({ lines }: { lines: Day4NotecardLine[] }) {
  const [selected, setSelected] = useState<NotecardSelection>({});
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(loadSelection());
  }, []);

  const toggle = useCallback((slot: number) => {
    setSelected((prev) => {
      const next = { ...prev, [slot]: !prev[slot] };
      saveSelection(next);
      return next;
    });
  }, []);

  const selectedCount = lines.filter((l) => selected[l.slotIndex]).length;

  function handlePrint() {
    window.print();
  }

  function handleCopy() {
    const text = lines
      .filter((l) => selected[l.slotIndex])
      .map((l) => `${l.trigger}\n→ ${l.kellyLine}`)
      .join("\n\n");
    if (text && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text);
    }
  }

  if (lines.length === 0) {
    return (
      <section className="ep-card mt-6 border-2 border-amber-200 bg-amber-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-amber-900">Capitalize notecard · claims-gated only</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          No green lines yet — complete forum lab ingest (artifact + v1 analysis) first.
        </p>
        <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-4 inline-block">
          Open forum lab →
        </Link>
      </section>
    );
  }

  return (
    <section className="ep-card mt-6 border-2 border-violet-300/50 p-5 text-sm print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <p className="text-xs font-bold uppercase text-violet-900">Capitalize notecard · green lines only</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Select up to five verified capitalize moves — no staff analysis clutter.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={selectedCount === 0}
            className="rounded-full border border-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-[var(--ep-navy)] disabled:opacity-40"
          >
            Copy selected
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white"
          >
            Print notecard
          </button>
        </div>
      </div>

      <p className="mt-2 hidden text-xs font-bold uppercase text-violet-900 print:block">Kelly capitalize notecard · Day 4</p>

      <div ref={printRef} className="mt-4 space-y-3">
        {lines.map((line) => (
          <article
            key={line.slotIndex}
            className={`rounded-lg border p-4 ${
              selected[line.slotIndex] ? "border-violet-400 bg-violet-50/40" : "border-[var(--ep-border)] bg-white"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3 print:cursor-default">
              <input
                type="checkbox"
                checked={Boolean(selected[line.slotIndex])}
                onChange={() => toggle(line.slotIndex)}
                className="mt-1 print:hidden"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                    Green · claims cleared
                  </span>
                  <span className="text-[10px] text-[var(--ep-navy-muted)]">
                    {line.sourceLabel} · {formatTs(line.timestamp)}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold uppercase text-[var(--ep-navy-muted)]">When</p>
                <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{line.trigger}</p>
                <p className="mt-3 text-xs font-bold uppercase text-emerald-900">Kelly</p>
                <p className="mt-1 text-base font-semibold leading-relaxed text-[var(--ep-navy)]">{line.kellyLine}</p>
                {line.lessonHref ? (
                  <Link href={line.lessonHref} className="mt-2 inline-block text-xs font-bold text-violet-800 print:hidden">
                    Deep drill →
                  </Link>
                ) : null}
              </div>
            </label>
          </article>
        ))}
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)] print:hidden">
        {selectedCount} of {lines.length} selected · target five for evening check
      </p>
    </section>
  );
}
