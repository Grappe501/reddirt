import Link from "next/link";
import "server-only";

import { AccaForumYoutubeEmbed } from "@/components/election-plan/AccaForumYoutubeEmbed";
import { DebateWeekIntensivePanel } from "@/components/admin/intelligence/DebateWeekIntensivePanel";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import {
  EP_DEBATE_QUESTIONS_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_LEGISLATIVE_INTEL_HREF,
  EP_OPPONENT_BIOS_HREF,
  epLegislativeIntel2021Href,
  epLegislativeIntel2025Href,
} from "@/lib/election-plan/debate-prep-links";
import { buildDebatePrepSystemV8Snapshot } from "@/lib/election-plan/debate-prep-system-v8";
import { DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-links";
import { DebatePrepTonightPackageClient } from "@/components/election-plan/DebatePrepTonightPackageClient";
import { EP_DEBATE_PREP_WAR_ROOM_HREF } from "@/lib/election-plan/debate-prep-links";
import { ForumTranscriptIntelHubPanel } from "@/components/election-plan/ForumTranscriptIntelHubPanel";
import { ACCA_2026_SOS_FORUM_EVENT } from "@/lib/intelligence/v4/forumVideoDropPath";
import { showPlatformMeta } from "@/lib/election-plan/kelly-facing-ui";

export function ElectionPlanDebatePrepHubPanel() {
  const referenceDate = process.env.DEBATE_WEEK_TODAY ?? "2026-06-19";
  let snapshot;
  try {
    snapshot = buildDebatePrepSystemV8Snapshot(referenceDate);
  } catch (error) {
    console.error("[debate-prep-hub] snapshot failed", error);
    return (
      <section className="ep-card mx-auto max-w-3xl p-6 text-sm text-[var(--ep-navy)]">
        <p className="font-semibold">Debate prep hub is temporarily unavailable.</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          Try{" "}
          <Link href={EP_DEBATE_PREP_WAR_ROOM_HREF} className="font-bold underline">
            war room
          </Link>{" "}
          or{" "}
          <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="font-bold underline">
            forum lab
          </Link>
          . If this persists after deploy, contact staff.
        </p>
      </section>
    );
  }

  return (
    <>
      <ElectionPlanDebatePrepSubnav />

      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[var(--ep-navy)]">Debate prep</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">{snapshot.intro}</p>
      </header>

      <KellyPageSummary summary="Tonight: rehearse your opening, know Hammer's 2021 and 2025 election bills, and practice one agree-and-add pivot on county clerks. Everything else is reference — open only what you need." />

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href={epLegislativeIntel2021Href()} className="ep-card block border-violet-200 bg-violet-50/40 p-5 transition hover:border-violet-400">
          <p className="text-xs font-bold uppercase text-violet-950">Must read</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">2021 integrity bills</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">Six bills Hammer sponsored — your continuity trap anchor.</p>
        </Link>
        <Link href={epLegislativeIntel2025Href()} className="ep-card block border-amber-200 bg-amber-50/40 p-5 transition hover:border-amber-400">
          <p className="text-xs font-bold uppercase text-amber-950">Must read</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">2025 direct democracy bills</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">Petition restrictions — honor Arkansas ballot measures.</p>
        </Link>
      </section>

      <section className="ep-card mb-8 grid gap-6 border-2 border-[var(--ep-gold)]/30 bg-[var(--ep-cream)]/40 p-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Readiness</p>
          <p className="mt-2 font-heading text-5xl font-bold text-[var(--ep-navy)]">{snapshot.readinessPct}%</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ep-navy)]">{snapshot.readinessLabel}</p>
          <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
            Debate: <span className="font-semibold text-[var(--ep-navy)]">{snapshot.debateDate}</span>
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
            {snapshot.todayFocus ?? "Open the 7-day course below and start tonight's day."}
          </p>
          {showPlatformMeta() ? (
            <p className="mt-4 text-[10px] font-bold uppercase text-amber-900">{snapshot.governance}</p>
          ) : null}
        </div>
      </section>

      <DebatePrepTonightPackageClient
        tonightPackage={snapshot.tonightPackage}
        packageCompletenessPct={snapshot.packageCompletenessPct}
        packageLabel={DEBATE_PREP_PACKAGE_LABEL}
      />

      <section className="ep-card mb-8 border-2 border-rose-300/50 p-5">
        <p className="text-xs font-bold uppercase text-rose-900">Opponent biographies</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Full Hammer & Pakko bios — priorities, psychology, debate tells, command mode, and memory lines. Read at end of Day 2, re-read after Day 4 forum lab, lock in again on Day 6 before simulation.
        </p>
        <Link
          href={EP_OPPONENT_BIOS_HREF}
          className="mt-4 inline-block rounded-full bg-rose-900 px-4 py-2 text-xs font-bold text-white"
        >
          Open opponent bios →
        </Link>
      </section>

      <section className="ep-card mb-8 border-2 border-violet-300/50 p-5">
        <p className="text-xs font-bold uppercase text-violet-900">40 expected questions</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Hammer & Pakko forecasts, speak-order scripts (first / second / third), rebuttals, and cross-exchange handling for every likely moderator question.
        </p>
        <Link
          href={EP_DEBATE_QUESTIONS_HREF}
          className="mt-4 inline-block rounded-full bg-violet-900 px-4 py-2 text-xs font-bold text-white"
        >
          Open question bank →
        </Link>
      </section>

      <section className="ep-card mb-8 border-2 border-[var(--ep-gold)]/40 p-5">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">War room</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Readiness radar, dress-rehearsal cards, and trap-lane practice.
        </p>
        <Link
          href={EP_DEBATE_PREP_WAR_ROOM_HREF}
          className="mt-4 inline-block rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white"
        >
          Open war room →
        </Link>
      </section>

      <ForumTranscriptIntelHubPanel intel={snapshot.forumIntel} />

      <section className="ep-card mb-8 p-5">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">ACCA forum recording</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {ACCA_2026_SOS_FORUM_EVENT.title} — {ACCA_2026_SOS_FORUM_EVENT.date}
        </p>
        <AccaForumYoutubeEmbed compact />
        <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="mt-4 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
          Forum lab →
        </Link>
      </section>

      <h2 className="mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">7-day prep course</h2>
      <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
        Work one day at a time. After you open a study block, you will only see the next step — not this full list again.
      </p>
      <DebateWeekIntensivePanel surface="election-plan" initialDay={1} todayDate={referenceDate} />

      <section className="mt-10">
        <Link href={EP_LEGISLATIVE_INTEL_HREF} className="ep-card block p-5 transition hover:border-[var(--ep-gold)]">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">All legislative intelligence</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">2021 integrity + 2025 petition bills with practice lines.</p>
        </Link>
      </section>
    </>
  );
}
