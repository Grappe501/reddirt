import Link from "next/link";
import "server-only";

import { AccaForumYoutubeEmbed } from "@/components/election-plan/AccaForumYoutubeEmbed";
import { ElectionPlanDay1PathwayHubCard } from "@/components/election-plan/ElectionPlanDay1PathwayHubCard";
import { ElectionPlanDay1StartCard } from "@/components/election-plan/ElectionPlanDay1PathwayPanel";
import { DebatePrepTonightPackageClient } from "@/components/election-plan/DebatePrepTonightPackageClient";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { ForumTranscriptIntelHubPanel } from "@/components/election-plan/ForumTranscriptIntelHubPanel";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  DEBATE_PREP_PACKAGE_LABEL,
  EP_DEBATE_PREP_WAR_ROOM_HREF,
  EP_DEBATE_QUESTIONS_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_LEGISLATIVE_INTEL_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_VOTER_AUDIENCES_HREF,
  epDebatePrepDayHref,
  epLegislativeIntel2021Href,
  epLegislativeIntel2025Href,
} from "@/lib/election-plan/debate-prep-links";
import { buildDebatePrepSystemV8Snapshot } from "@/lib/election-plan/debate-prep-system-v8";
import { DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { ACCA_2026_SOS_FORUM_EVENT } from "@/lib/intelligence/v4/forumVideoDropPath";

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

      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-[var(--ep-navy)]">Debate prep</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">{snapshot.intro}</p>
      </header>

      <KellyPageSummary summary="Day 1 tonight: body, breath, author-vs-administrator, then your 90-second opening. One pathway — tap Continue on each page. Bills and trap lanes come on Day 2." />

      <ElectionPlanDay1StartCard />

      <ElectionPlanDay1PathwayHubCard />

      <section className="ep-card mb-8 grid gap-4 border-[var(--ep-border)] bg-white/60 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Full debate week</p>
          <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{snapshot.readinessPct}%</p>
          <p className="text-xs text-[var(--ep-navy-muted)]">
            Staff composite (forum intel + 7-day course) — not your Day 1 bar above.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Tonight focus</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ep-navy)]">
            {snapshot.todayFocus ?? "Command Mode foundation — start Day 1 pathway above."}
          </p>
        </div>
      </section>

      <details className="ep-card mb-8 p-5 text-sm">
        <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
          Staff tonight package checklist (optional — Day 1 pathway is primary)
        </summary>
        <div className="mt-4">
          <DebatePrepTonightPackageClient
            tonightPackage={snapshot.tonightPackage}
            packageCompletenessPct={snapshot.packageCompletenessPct}
            packageLabel={DEBATE_PREP_PACKAGE_LABEL}
          />
        </div>
      </details>

      <details className="ep-card mb-8 p-5 text-sm">
        <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
          Reference tonight (optional — after Day 1 blocks)
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link href={EP_VOTER_AUDIENCES_HREF} className="rounded-lg border border-violet-200 bg-violet-50/40 p-4 hover:border-violet-400">
            <p className="text-xs font-bold uppercase text-violet-950">Audiences</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Who is in the room when you speak</p>
          </Link>
          <Link href={epLegislativeIntel2021Href()} className="rounded-lg border border-violet-200 p-4 hover:border-violet-400">
            <p className="text-xs font-bold uppercase text-violet-950">2021 bills</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">For Day 2+ — not required tonight</p>
          </Link>
          <Link href={epLegislativeIntel2025Href()} className="rounded-lg border border-amber-200 p-4 hover:border-amber-400">
            <p className="text-xs font-bold uppercase text-amber-950">2025 petitions</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">For Day 2+ — not required tonight</p>
          </Link>
          <Link href={EP_DEBATE_QUESTIONS_HREF} className="rounded-lg border border-violet-200 p-4 hover:border-violet-400">
            <p className="text-xs font-bold uppercase text-violet-900">40 questions</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Bank for later this week</p>
          </Link>
          <Link href={EP_OPPONENT_BIOS_HREF} className="rounded-lg border border-rose-200 p-4 hover:border-rose-400">
            <p className="text-xs font-bold uppercase text-rose-900">Opponent bios</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Best after Day 2 film room</p>
          </Link>
          <Link href={EP_DEBATE_PREP_WAR_ROOM_HREF} className="rounded-lg border border-[var(--ep-gold)]/40 p-4 hover:border-[var(--ep-gold)]">
            <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">War room</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Trap lanes — Day 2 onward</p>
          </Link>
        </div>
      </details>

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

      <Link
        href={epDebatePrepDayHref("day-2-read-the-table")}
        className="ep-card mb-8 block border-indigo-200 bg-indigo-50/30 p-5 transition hover:border-indigo-400"
      >
        <p className="text-xs font-bold uppercase text-indigo-900">After Day 1</p>
        <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">Day 2 · Read the table</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Film room, Hammer tells, trap lanes 1–2. Finish Day 1 first — you will be ready.
        </p>
      </Link>

      <Link href={EP_LEGISLATIVE_INTEL_HREF} className="ep-card block p-5 transition hover:border-[var(--ep-gold)]">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">All legislative intelligence</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">2021 integrity + 2025 petition bills with practice lines.</p>
      </Link>
    </>
  );
}
