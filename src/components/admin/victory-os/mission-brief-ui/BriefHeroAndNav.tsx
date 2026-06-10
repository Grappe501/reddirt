"use client";

import Link from "next/link";
import { addWeeks } from "@/lib/calendar/weekly-time";
import type { MondayBriefViewModel } from "@/lib/victory-os/mission-brief/compose-monday-brief-view-model";
import { VictoryOsHero, VictoryOsMetric } from "../victory-os-ui/VictoryOsShell";
import { vos } from "../victory-os-ui/victory-os-tokens";

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
    <VictoryOsHero
      eyebrow="Victory OS · Monday Brief"
      title="What are the ten most important decisions this week to reach 50% + 1?"
      summary={brief.statewideVictory.summary}
      footer={
        <>
          <VictoryOsMetric label="Countdown" value={`${ec.daysRemaining}d`} highlight={ec.daysRemaining <= 14} />
          <VictoryOsMetric label="Pace" value={PACE_LABEL[pace] ?? pace} />
          <VictoryOsMetric label="Vote gap" value={brief.statewideVictory.statewideVoteGap.toLocaleString()} />
          <VictoryOsMetric label="CM approval" value={`${readiness.approvalPct}%`} highlight={readiness.pending > 0} />
          <VictoryOsMetric label="Week" value={vm.weekKey} />
          <span className={vos.draftBadgeOnDark}>INTERNAL_DRAFT</span>
        </>
      }
    >
      {vm.currentSeasonQuestion ? (
        <p className="mt-3 font-body text-xs text-kelly-gold-soft/90">
          {vm.currentSeasonLabel} — {vm.currentSeasonQuestion}
        </p>
      ) : null}
    </VictoryOsHero>
  );
}

export function BriefWeekDeltaBanner({ vm }: { vm: MondayBriefViewModel }) {
  const delta = vm.delta;
  if (!delta) return null;
  return (
    <section className={vos.glass}>
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-copper">Week-over-week</p>
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
    { id: "section-decisions", label: "Top 10" },
    { id: "section-kelly", label: "Kelly" },
    { id: "section-volunteer", label: "Volunteers" },
    { id: "section-fundraising", label: "Fundraising" },
    { id: "section-risk", label: "At risk" },
    { id: "section-opportunities", label: "Opportunities" },
    { id: "section-missions", label: "Missions" },
  ];
  return (
    <nav className={vos.navRail} aria-label="Brief sections">
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={vos.navPill}>
          {s.label}
        </a>
      ))}
      <Link
        href={`/api/admin/victory-os/brief/print?week=${weekKey}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${vos.navPill} ml-auto`}
      >
        Print ↗
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
    <div className={vos.glass}>
      <div className="flex items-center gap-4">
        <svg width="88" height="88" className="-rotate-90" aria-hidden>
          <circle cx="44" cy="44" r={r} fill="none" stroke="#e8ecf1" strokeWidth="8" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke="url(#approvalGrad)"
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="approvalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#b87333" />
            </linearGradient>
          </defs>
        </svg>
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-copper">CM review</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{readiness.approvalPct}%</p>
          <p className="font-body text-xs text-kelly-muted">{readiness.pendingLabel}</p>
          {readiness.cmReadyToExecute ? (
            <p className="mt-1 font-body text-xs font-semibold text-emerald-700">Ready to execute</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function BriefWeekNav({ weekKey }: { weekKey: string }) {
  const prev = addWeeks(weekKey, -1);
  const next = addWeeks(weekKey, 1);
  return (
    <div className="flex items-center gap-2 font-body text-sm">
      <Link href={`/admin/mission-brief?week=${prev}`} className={vos.btnSecondary}>
        ← Prev
      </Link>
      <span className="font-mono text-kelly-navy">{weekKey}</span>
      <Link href={`/admin/mission-brief?week=${next}`} className={vos.btnSecondary}>
        Next →
      </Link>
    </div>
  );
}
