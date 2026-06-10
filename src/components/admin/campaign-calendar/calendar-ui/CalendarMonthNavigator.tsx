"use client";

import { format } from "date-fns";
import { cal } from "./calendar-design-tokens";

export function CalendarMonthNavigator({
  label,
  onPrev,
  onNext,
  subtitle,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button type="button" className={cal.btnNav} onClick={onPrev} aria-label="Previous">
          ←
        </button>
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-kelly-navy md:text-2xl">{label}</h2>
          {subtitle ? <p className="font-body text-xs text-kelly-muted">{subtitle}</p> : null}
        </div>
        <button type="button" className={cal.btnNav} onClick={onNext} aria-label="Next">
          →
        </button>
      </div>
    </div>
  );
}
