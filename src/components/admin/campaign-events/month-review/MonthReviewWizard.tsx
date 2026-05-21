"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { WorkbenchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import { computeMonthReviewStats } from "@/lib/campaign-events/month-review/month-review-stats";
import { buildMonthReviewQueue, regionReviewAvailable } from "@/lib/campaign-events/month-review/month-review-queue";
import {
  MONTH_REVIEW_MODES,
  MONTH_REVIEW_MODE_LABELS,
  parseReviewDateRange,
  type MonthReviewMode,
} from "@/lib/campaign-events/month-review/month-review-types";
import { reimbursementHref, travelLogHref } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";
import {
  MONTH_REVIEW_FOCUS_LABELS,
  type MonthReviewFocus,
} from "@/lib/campaign-events/month-readiness/month-readiness-types";
import { loadMonthReviewRowsAction } from "@/app/admin/(board)/campaign-events/month-review-actions";
import { MonthReviewEventWorkbench } from "./MonthReviewEventWorkbench";
import { useAgentObservation } from "@/components/agents/AgentObservationTracker";

const AUTO_ADVANCE_KEY = "campaign-month-review-auto-advance";
const SPEED_MODE_KEY = "campaign-month-review-speed-mode";

export function MonthReviewWizard({
  initialRows,
  initialPeriod,
  initialMonth,
  initialMode,
  initialFocus,
  initialAutostart,
  initialStart,
  initialEnd,
  travelReimbursement,
}: {
  initialRows: WorkbenchEventRow[];
  initialPeriod: string;
  initialMonth: string;
  initialMode: MonthReviewMode;
  initialFocus?: MonthReviewFocus | null;
  initialAutostart?: boolean;
  initialStart?: string | null;
  initialEnd?: string | null;
  travelReimbursement?: boolean;
}) {
  const router = useRouter();
  const { track } = useAgentObservation();
  const [pending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"setup" | "review">("setup");
  const [rows, setRows] = useState(initialRows);
  const [month, setMonth] = useState(initialMonth);
  const [mode, setMode] = useState<MonthReviewMode>(initialMode);
  const [focus, setFocus] = useState<MonthReviewFocus | null>(initialFocus ?? null);
  const dateRange = parseReviewDateRange(initialStart, initialEnd);
  const [index, setIndex] = useState(0);
  const [decisionNote, setDecisionNote] = useState("");
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [speedMode, setSpeedMode] = useState(false);

  useEffect(() => {
    try {
      setAutoAdvance(localStorage.getItem(AUTO_ADVANCE_KEY) !== "0");
      setSpeedMode(localStorage.getItem(SPEED_MODE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (initialAutostart && initialRows.length > 0) {
      setPhase("review");
      setIndex(0);
      track("review_queue_started", { mode, month: initialMonth, queueSize: initialRows.length });
    }
  }, [initialAutostart, initialRows.length, track, mode, initialMonth]);

  const stats = useMemo(() => computeMonthReviewStats(rows), [rows]);
  const queue = useMemo(
    () => buildMonthReviewQueue(rows, mode, focus, dateRange),
    [rows, mode, focus, dateRange.start, dateRange.end],
  );
  const current = queue[index] ?? null;

  const refreshRows = (period: string) => {
    startTransition(async () => {
      const data = await loadMonthReviewRowsAction(period);
      setRows(data.rows);
    });
  };

  const syncUrl = (m: string, md: MonthReviewMode, fc?: MonthReviewFocus | null) => {
    const params = new URLSearchParams({ month: m, mode: md });
    if (fc) params.set("focus", fc);
    if (dateRange.start) params.set("start", dateRange.start);
    if (dateRange.end) params.set("end", dateRange.end);
    router.replace(`/admin/campaign-events/review?${params.toString()}`);
  };

  const beginReview = () => {
    setIndex(0);
    setPhase("review");
    syncUrl(month, mode, focus);
  };

  const goSetup = () => {
    setPhase("setup");
    refreshRows(month);
  };

  const afterDecision = () => {
    startTransition(async () => {
      const data = await loadMonthReviewRowsAction(month);
      setRows(data.rows);
      const newQueue = buildMonthReviewQueue(data.rows, mode, focus, dateRange);
      if (newQueue.length === 0) {
        setPhase("setup");
        setIndex(0);
      } else {
        const nextIndex = index >= newQueue.length ? newQueue.length - 1 : index;
        setIndex(nextIndex);
        try {
          const aa = localStorage.getItem(AUTO_ADVANCE_KEY);
          const shouldAdvance = aa === null ? autoAdvance : aa === "1";
          if (shouldAdvance && nextIndex < newQueue.length - 1) {
            setIndex(nextIndex + 1);
          }
        } catch {
          if (autoAdvance && nextIndex < newQueue.length - 1) {
            setIndex(nextIndex + 1);
          }
        }
      }
      setDecisionNote("");
    });
  };

  const toggleAutoAdvance = (v: boolean) => {
    setAutoAdvance(v);
    try {
      localStorage.setItem(AUTO_ADVANCE_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const toggleSpeedMode = (v: boolean) => {
    setSpeedMode(v);
    try {
      localStorage.setItem(SPEED_MODE_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  if (phase === "setup") {
    return (
      <section className="rounded-3xl border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-xl font-bold">{travelReimbursement ? "Travel approval setup" : "Review setup"}</h2>
        <p className="mt-2 font-body text-sm text-kelly-text/70">
          Choose month and queue order. Period loaded: <strong>{initialPeriod}</strong> ({rows.length} events).
          {dateRange.start || dateRange.end ? (
            <>
              {" "}
              Date range: <strong>{dateRange.start ?? "…"}</strong> – <strong>{dateRange.end ?? "…"}</strong>
            </>
          ) : null}
        </p>
        {travelReimbursement ? (
          <p className="mt-2 flex flex-wrap gap-2 font-body text-xs">
            <Link href={travelLogHref(month)} className="underline">
              Tentative travel log
            </Link>
            <Link href={reimbursementHref(month)} className="underline">
              Official reimbursement
            </Link>
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 font-body text-sm">
            <span className="text-xs font-bold uppercase text-kelly-slate">Month (YYYY-MM)</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              pattern="\d{4}-\d{2}"
            />
          </label>
          <label className="grid gap-1 font-body text-sm">
            <span className="text-xs font-bold uppercase text-kelly-slate">Review order</span>
            <select className="rounded-lg border px-3 py-2" value={mode} onChange={(e) => setMode(e.target.value as MonthReviewMode)}>
              {MONTH_REVIEW_MODES.map((m) => (
                <option key={m} value={m} disabled={m === "region" && !regionReviewAvailable()}>
                  {MONTH_REVIEW_MODE_LABELS[m]}
                  {m === "region" && !regionReviewAvailable() ? " (unavailable)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 font-body text-sm">
          <Stat label="Total" value={stats.total} />
          <Stat label="Unreviewed" value={stats.unreviewed} />
          <Stat label="Approved" value={stats.approved} />
          <Stat label="Denied" value={stats.denied} />
          <Stat label="Hold" value={stats.hold} />
          <Stat label="Needs info" value={stats.needsInfo} />
          <Stat label="Missing city" value={stats.missingCity} />
          <Stat label="Missing county" value={stats.missingCounty} />
          <Stat label="Missing ZIP" value={stats.missingZip} />
          <Stat label="Missing mileage" value={stats.missingMileage} />
          <Stat label="Conflicts" value={stats.conflicts} />
          <Stat label="Work hours" value={stats.workHours} />
        </div>

        {focus ? (
          <p className="mt-3 rounded-lg border border-kelly-navy/20 bg-kelly-navy/[0.06] px-3 py-2 font-body text-sm">
            Focus filter: <strong>{MONTH_REVIEW_FOCUS_LABELS[focus]}</strong>
          </p>
        ) : null}

        <p className="mt-4 font-body text-xs text-kelly-text/55">
          Queue preview: <strong>{buildMonthReviewQueue(rows, mode, focus, dateRange).length}</strong> events in {MONTH_REVIEW_MODE_LABELS[mode]}
          {focus ? ` · ${MONTH_REVIEW_FOCUS_LABELS[focus]}` : ""} order.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 font-body text-sm">
          <Link href={`/admin/campaign-events/month-readiness?month=${month}`} className="font-semibold text-kelly-navy underline">
            Month readiness checklist
          </Link>
        </div>

        <label className="mt-4 flex items-center gap-2 font-body text-sm">
          <input type="checkbox" checked={speedMode} onChange={(e) => toggleSpeedMode(e.target.checked)} />
          Speed mode (tighter UI, sticky actions, keyboard A/H/D/S)
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-kelly-navy px-6 py-3 font-body text-sm font-bold text-white"
            disabled={queue.length === 0 || pending}
            onClick={() => {
              refreshRows(month);
              beginReview();
            }}
          >
            Begin Review
          </button>
          <Link href="/admin/campaign-events/workbench" className="rounded-full border px-4 py-3 text-sm font-bold">
            Back to workbench
          </Link>
        </div>
        {!rows.length ? (
          <p className="mt-4 text-sm text-amber-900">
            No events for this month yet. Run <code className="text-xs">npm run campaign-events:seed-month -- {month}</code> then reload.
          </p>
        ) : null}
      </section>
    );
  }

  if (!current) {
    return (
      <section className="rounded-2xl border p-8 text-center font-body">
        <p className="font-bold">No events in this queue.</p>
        <button type="button" className="mt-4 underline" onClick={goSetup}>
          Return to setup
        </button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-wash px-4 py-3 font-body text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-kelly-navy">
            Event {index + 1} of {queue.length}
          </span>
          <span className="text-kelly-text/50">· {MONTH_REVIEW_MODE_LABELS[mode]}</span>
          <span className="text-kelly-text/50">· {month}</span>
          {focus ? <span className="text-kelly-text/50">· {MONTH_REVIEW_FOCUS_LABELS[focus]}</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={autoAdvance} onChange={(e) => toggleAutoAdvance(e.target.checked)} />
            Auto-advance
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={speedMode} onChange={(e) => toggleSpeedMode(e.target.checked)} />
            Speed mode
          </label>
          <button type="button" className="rounded-full border px-3 py-1 text-xs font-bold" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            ← Previous
          </button>
          <button
            type="button"
            className="rounded-full border px-3 py-1 text-xs font-bold"
            disabled={index >= queue.length - 1}
            onClick={() => setIndex((i) => i + 1)}
          >
            Skip / Next →
          </button>
          <button type="button" className="rounded-full border px-3 py-1 text-xs font-bold" onClick={goSetup}>
            Setup
          </button>
        </div>
      </nav>

      <MonthReviewEventWorkbench
        key={current.recordId}
        row={current}
        positionLabel={`Event ${index + 1} of ${queue.length}`}
        decisionNote={decisionNote}
        onDecisionNoteChange={setDecisionNote}
        onDecisionComplete={afterDecision}
        reviewFocus={focus}
        speedMode={speedMode}
        period={month}
        allRows={rows}
        travelReimbursement={travelReimbursement}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash px-3 py-2">
      <p className="text-[10px] font-bold uppercase text-kelly-slate">{label}</p>
      <p className="font-heading text-lg font-bold">{value}</p>
    </div>
  );
}
