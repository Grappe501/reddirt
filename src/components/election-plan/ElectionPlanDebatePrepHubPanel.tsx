import Link from "next/link";

import { DebateWeekIntensivePanel } from "@/components/admin/intelligence/DebateWeekIntensivePanel";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import {
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_EXECUTIVE_BOOK_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepDayHref, mapAdminDebateHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";
import { buildDebatePrepSystemV5Snapshot } from "@/lib/election-plan/debate-prep-system-v5";
import { ACCA_2026_SOS_FORUM_DROP_REL, ACCA_2026_SOS_FORUM_EVENT } from "@/lib/intelligence/v4/forumVideoDropPath";

const statusStyles = {
  ready: "border-emerald-300 bg-emerald-50/60 text-emerald-950",
  "in-progress": "border-amber-300 bg-amber-50/60 text-amber-950",
  "not-started": "border-[var(--ep-border)] bg-white text-[var(--ep-navy-muted)]",
} as const;

export function ElectionPlanDebatePrepHubPanel() {
  const referenceDate = process.env.DEBATE_WEEK_TODAY ?? "2026-06-19";
  const snapshot = buildDebatePrepSystemV5Snapshot(referenceDate);

  return (
    <>
      <ElectionPlanDebatePrepSubnav />

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">
          Debate prep · {snapshot.version}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{snapshot.headline}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">{snapshot.intro}</p>
      </header>

      <section className="ep-card mb-8 grid gap-6 border-2 border-[var(--ep-gold)]/30 bg-[var(--ep-cream)]/40 p-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Readiness</p>
          <p className="mt-2 font-heading text-5xl font-bold text-[var(--ep-navy)]">{snapshot.readinessPct}%</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ep-navy)]">{snapshot.readinessLabel}</p>
          <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
            Debate day: <span className="font-semibold text-[var(--ep-navy)]">{snapshot.debateDate}</span>
          </p>
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
            Intensive: {snapshot.intensiveDaysComplete}/{snapshot.intensiveDaysTotal} days ·{" "}
            {snapshot.intensiveV3Label}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--ep-border)]">
            <div
              className="h-full rounded-full bg-[var(--ep-navy)] transition-all"
              style={{ width: `${Math.min(100, snapshot.readinessPct)}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Tonight&apos;s focus</p>
          <p className="mt-2 text-sm font-semibold text-[var(--ep-navy)]">
            {snapshot.todayFocus ?? "Open command home for tonight's briefing."}
          </p>
          <p className="mt-4 text-[10px] font-bold uppercase text-amber-900">{snapshot.governance}</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.modules.map((mod) => (
            <Link
              key={mod.id}
              href={mod.href}
              className={`ep-card block p-5 transition hover:border-[var(--ep-gold)] ${statusStyles[mod.status]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide">{mod.label}</p>
                <span className="shrink-0 rounded-full border border-current px-2 py-0.5 text-[10px] font-bold uppercase">
                  {mod.status.replace("-", " ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{mod.tagline}</p>
              {mod.statusNote ? (
                <p className="mt-3 text-xs font-medium text-[var(--ep-navy)]">{mod.statusNote}</p>
              ) : null}
              {mod.lane === "staff" ? (
                <p className="mt-2 text-[10px] font-bold uppercase text-rose-700">Staff lane</p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="ep-card mb-8 border-2 border-[var(--ep-gold)]/40 bg-[var(--ep-cream)]/50 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">ACCA three-candidate forum · local drop</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {ACCA_2026_SOS_FORUM_EVENT.title} — {ACCA_2026_SOS_FORUM_EVENT.date} · {ACCA_2026_SOS_FORUM_EVENT.venue}
        </p>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          Candidates: {ACCA_2026_SOS_FORUM_EVENT.candidates.join(" · ")}
        </p>
        <div className="mt-4 rounded-lg border border-[var(--ep-border)] bg-white p-4">
          <p className="text-xs font-semibold text-[var(--ep-navy)]">Drop your MP4 here (7.5 GB OK on disk)</p>
          <code className="mt-2 block break-all text-[11px] text-[var(--ep-navy-muted)]">
            RedDirt/{ACCA_2026_SOS_FORUM_DROP_REL.replace(/\\/g, "/")}/
          </code>
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
            Large files: run{" "}
            <code className="rounded bg-[var(--ep-cream)] px-1">npm run forum:ingest-acca-drop</code> from{" "}
            <code className="rounded bg-[var(--ep-cream)] px-1">RedDirt/</code>. Browser upload in{" "}
            <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="font-semibold underline">
              Forum transcript lab
            </Link>{" "}
            is for smaller files only.
          </p>
        </div>
      </section>

      <h2 className="mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">7-day command course</h2>
      <DebateWeekIntensivePanel
        linkOverrides={{
          forumLab: EP_FORUM_TRANSCRIPT_LAB_HREF,
          lanes: EP_DEBATE_PREP_LANES_HREF,
          tutor: EP_DEBATE_PREP_TUTOR_HREF,
          dayHref: epDebatePrepDayHref,
          intensiveHub: EP_DEBATE_PREP_HREF,
          resolveHref: mapAdminDebateHrefToElectionPlan,
        }}
        initialDay={1}
        todayDate={referenceDate}
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href={EP_OPPOSITION_RESEARCH_HREF} className="ep-card block p-5 transition hover:border-[var(--ep-gold)]">
          <p className="text-xs font-bold uppercase text-rose-700">Staff lane</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">Opposition research</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Kim Hammer modules, dossiers, evidence command — claims-gated before any public line.
          </p>
        </Link>
        <Link href={EP_EXECUTIVE_BOOK_HREF} className="ep-card block p-5 transition hover:border-[var(--ep-gold)]">
          <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Leadership</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">Executive Book</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Narrative crosswalk — forum intelligence and debate lines tie back to leadership chapters.
          </p>
        </Link>
      </section>
    </>
  );
}
