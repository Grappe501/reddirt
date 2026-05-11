"use client";

import { useState } from "react";

import Link from "next/link";

import type { Task } from "@/types/dashboard";
import { MOCK_TODAYS_CAMPAIGN_POST_URL } from "@/lib/dashboard/mock-data";

type Props = {
  task: Task;
  /** Optional drill-down (e.g. team training modules). */
  moreHref?: string;
  moreLabel?: string;
};

export function VosDailyUniversalTaskCard({ task, moreHref, moreLabel = "Training modules →" }: Props) {
  const [done, setDone] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-kelly-gold/40 bg-gradient-to-br from-kelly-gold/15 via-kelly-page to-kelly-fog/80 p-6 shadow-[var(--shadow-soft)] md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/70">Daily · everyone</p>
      <h2 className="mt-3 font-heading text-xl font-bold text-kelly-navy md:text-2xl">{task.title}</h2>
      {task.description ? (
        <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/85 md:text-base">{task.description}</p>
      ) : null}
      {MOCK_TODAYS_CAMPAIGN_POST_URL ? (
        <p className="mt-4 font-body text-sm">
          <span className="font-semibold text-kelly-navy">Today&apos;s post:</span>{" "}
          <a
            href={MOCK_TODAYS_CAMPAIGN_POST_URL}
            className="text-kelly-blue underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open link
          </a>
        </p>
      ) : (
        <p className="mt-4 rounded-lg border border-kelly-text/10 bg-white/70 px-3 py-2 font-body text-xs text-kelly-text/70">
          <strong className="text-kelly-deep">Future:</strong> campaign social lead can push a &quot;Today&apos;s post&quot; link
          here for one-tap engagement.
        </p>
      )}
      {moreHref ? (
        <p className="mt-4 font-body text-sm">
          <Link href={moreHref} className="font-semibold text-kelly-blue underline hover:text-kelly-navy">
            {moreLabel}
          </Link>
        </p>
      ) : null}

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-kelly-navy/15 bg-white/90 px-4 py-3">
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => setDone(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-kelly-navy/30 text-kelly-navy"
        />
        <span className="font-body text-sm font-medium text-kelly-deep">Completed today</span>
      </label>
      <div className="mt-4 flex flex-wrap gap-4 font-body text-xs text-kelly-text/70">
        <span>
          <strong className="text-kelly-text">Streak:</strong> prototype toggle only — persistence comes with auth.
        </span>
      </div>
    </div>
  );
}
