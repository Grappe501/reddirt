"use client";

import Link from "next/link";

import { ElectionPlanDay1PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay1PathwayProgressBar";
import { getFirstDay1PathwayStep } from "@/lib/election-plan/day1-learning-pathway";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export function ElectionPlanDay1PathwayHubCard() {
  const first = getFirstDay1PathwayStep();

  return (
    <section className="ep-card mb-8 border-2 border-[var(--ep-gold)] bg-white p-6">
      <ElectionPlanDay1PathwayProgressBar compact />

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={first.href}
          className="inline-block rounded-full bg-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-white"
        >
          {first.label} →
        </Link>
        <Link
          href={epDebatePrepDayHref(DAY1_ID)}
          className="inline-block rounded-full border border-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-[var(--ep-navy)]"
        >
          Day 1 overview
        </Link>
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        The percentage above is <strong>only Day 1</strong> — not the full debate week. Optional Hammer example does not
        block completion.
      </p>
    </section>
  );
}
