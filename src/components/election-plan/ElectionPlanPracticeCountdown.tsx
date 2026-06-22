"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function ElectionPlanPracticeCountdown({
  seconds,
  label,
  onComplete,
}: {
  seconds: number;
  label?: string;
  onComplete?: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setRemaining(seconds);
  }, [seconds, stop]);

  useEffect(() => {
    reset();
  }, [seconds, reset]);

  useEffect(() => () => stop(), [stop]);

  function start() {
    stop();
    setRemaining(seconds);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          stop();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const pct = seconds > 0 ? Math.round(((seconds - remaining) / seconds) * 100) : 0;

  return (
    <div className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
      {label ? <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">{label}</p> : null}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span
          className={`font-mono text-2xl font-bold tabular-nums ${
            remaining <= 10 && running ? "text-rose-700" : "text-[var(--ep-navy)]"
          }`}
        >
          {remaining}s
        </span>
        <div className="ep-progress h-2 min-w-[6rem] flex-1">
          <div className="ep-progress-bar bg-emerald-700 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2">
          {!running ? (
            <button
              type="button"
              onClick={start}
              className="rounded-full bg-[var(--ep-navy)] px-3 py-1.5 text-xs font-bold text-white"
            >
              Start {seconds}s
            </button>
          ) : (
            <button
              type="button"
              onClick={stop}
              className="rounded-full border border-[var(--ep-navy)] px-3 py-1.5 text-xs font-bold text-[var(--ep-navy)]"
            >
              Pause
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-[var(--ep-border)] px-3 py-1.5 text-xs font-bold text-[var(--ep-navy-muted)]"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
