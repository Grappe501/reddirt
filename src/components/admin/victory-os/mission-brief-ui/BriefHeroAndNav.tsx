"use client";

import Link from "next/link";
import { addWeeks } from "@/lib/calendar/weekly-time";
import type { MondayBriefViewModel } from "@/lib/victory-os/mission-brief/compose-monday-brief-view-model";

const PACE_LABEL: Record<string, string> = {
  ahead: "Ahead of pace",
  on_pace: "On pace",
  behind: "Behind pace",
  unknown: "Pace unknown",
};

export function BriefStatewideHero({ vm }: { vm: MondayBriefViewModel }) {
  const { brief, readiness, electionCountdown: ec } = vm;
  const pace = brief.statewideVictory.pace;

  return (
    <section
      id="section-statewide"
      className="relative overflow-hidden rounded-3xl border-2 border-kelly-navy/30 bg-gradient-to-br from-kelly-navy via-kelly-navy to-kelly-slate p-6 text-white shadow-xl md:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.32em] text-white/70">
            Victory OS · Monday Brief
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold leading-tight md:text-4xl">
            What are the ten most important decisions this week to reach 50% + 1?
          </h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-white/85">{brief.statewideVictory.summary}</p>
          {vm.currentSeasonQuestion ? (
            <p className="mt-2 font-body text-xs text-amber-200/90">
              {vm.currentSeasonLabel} — {vm.currentSeasonQuestion}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-center backdrop-blur-sm">
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-white/70">Countdown</p>
            <p className="font-heading text-3xl font-bold">{ec.daysRemaining}</p>
            <p className="font-body text-xs text-white/80">{ec.label}</p>
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-white/70">Victory pace</p>
            <p className={`font-heading text-lg font-bold text-white/95`}>
              {PACE_LABEL[pace] ?? pace}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-2">
        <MetricPill label="Vote gap" value={brief.statewideVictory.statewideVoteGap.toLocaleString()} />
        <MetricPill label="Cushion target" value={brief.statewideVictory.workingTargetWithCushion.toLocaleString()} />
        <MetricPill label="CM approval" value={`${readiness.approvalPct}%`} highlight={readiness.pending > 0} />
        <MetricPill label="Week" value={vm.weekKey} mono />
        <span className="rounded-full border border-amber-300/50 bg-amber-500/20 px-3 py-1 font-body text-xs font-semibold text-amber-100">
          INTERNAL_DRAFT
        </span>
      </div>
    </section>
  );
}

function MetricPill({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 font-body text-xs ${
        highlight ? "border-amber-300/60 bg-amber-500/25 text-amber-50" : "border-white/20 bg-white/10 text-white/90"
      }`}
    >
      <span className="text-white/60">{label}: </span>
      <span className={mono ? "font-mono font-semibold" : "font-semibold"}>{value}</span>
    </span>
  );
}

export function BriefWeekDeltaBanner({ vm }: { vm: MondayBriefViewModel }) {
  const delta = vm.delta;
  if (!delta) return null;
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-white/80 p-4">
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">Week-over-week</p>
      <ul className="mt-2 space-y-1 font-body text-sm text-kelly-text">
        {delta.summaryLines.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
      {delta.hasPrevious && delta.prevWeekKey ? (
        <p className="mt-2 font-body text-xs text-kelly-muted">
          Compared to{" "}
          <Link href={`/admin/mission-brief?week=${delta.prevWeekKey}`} className="font-mono underline">
            {delta.prevWeekKey}
          </Link>
        </p>
      ) : null}
    </section>
  );
}

export function BriefStickySectionNav({ weekKey }: { weekKey: string }) {
  const sections = [
    { id: "section-statewide", label: "Status" },
    { id: "section-decisions", label: "Top 10" },
    { id: "section-kelly", label: "Kelly" },
    { id: "section-volunteer", label: "Volunteers" },
    { id: "section-fundraising", label: "Fundraising" },
    { id: "section-risk", label: "At risk" },
    { id: "section-opportunities", label: "Opportunities" },
    { id: "section-missions", label: "Missions" },
  ];
  return (
    <nav
      className="sticky top-0 z-20 -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-kelly-text/10 bg-white/95 px-2 py-2 shadow-sm backdrop-blur-md"
      aria-label="Brief sections"
    >
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="shrink-0 rounded-lg px-3 py-1.5 font-body text-xs font-semibold text-kelly-muted hover:bg-kelly-page hover:text-kelly-navy"
        >
          {s.label}
        </a>
      ))}
      <Link
        href={`/api/admin/victory-os/brief/print?week=${weekKey}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto shrink-0 rounded-lg border border-kelly-text/15 px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-page"
      >
        Print brief ↗
      </Link>
    </nav>
  );
}

export function BriefApprovalRing({ vm }: { vm: MondayBriefViewModel }) {
  const { readiness } = vm;
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (readiness.approvalPct / 100) * c;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-kelly-text/10 bg-white p-4">
      <svg width="88" height="88" className="-rotate-90" aria-hidden>
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div>
        <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">CM review progress</p>
        <p className="font-heading text-2xl font-bold text-kelly-navy">{readiness.approvalPct}%</p>
        <p className="font-body text-xs text-kelly-muted">{readiness.pendingLabel}</p>
        {readiness.cmReadyToExecute ? (
          <p className="mt-1 font-body text-xs font-semibold text-emerald-700">Ready to execute</p>
        ) : null}
      </div>
    </div>
  );
}

export function BriefWeekNav({ weekKey }: { weekKey: string }) {
  const prev = addWeeks(weekKey, -1);
  const next = addWeeks(weekKey, 1);
  return (
    <div className="flex items-center gap-2 font-body text-sm">
      <Link href={`/admin/mission-brief?week=${prev}`} className="rounded-lg border border-kelly-text/15 bg-white px-3 py-1.5 font-semibold hover:bg-kelly-page">
        ← Prev
      </Link>
      <span className="font-mono text-kelly-navy">{weekKey}</span>
      <Link href={`/admin/mission-brief?week=${next}`} className="rounded-lg border border-kelly-text/15 bg-white px-3 py-1.5 font-semibold hover:bg-kelly-page">
        Next →
      </Link>
    </div>
  );
}
