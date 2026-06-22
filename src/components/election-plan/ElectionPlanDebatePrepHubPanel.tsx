import Link from "next/link";
import "server-only";

import { AccaForumYoutubeEmbed } from "@/components/election-plan/AccaForumYoutubeEmbed";
import { ElectionPlanDay1PathwayHubCard } from "@/components/election-plan/ElectionPlanDay1PathwayHubCard";
import { ElectionPlanDay1StartCard } from "@/components/election-plan/ElectionPlanDay1PathwayPanel";
import { ElectionPlanDay2StartCard, ElectionPlanDay2PathwayHubCard } from "@/components/election-plan/ElectionPlanDay2PathwayPanel";
import {
  ElectionPlanDay3StartCard,
  ElectionPlanDay3PathwayHubCard,
} from "@/components/election-plan/ElectionPlanDay3PathwayPanel";
import {
  ElectionPlanDay4StartCard,
  ElectionPlanDay4PathwayHubCard,
} from "@/components/election-plan/ElectionPlanDay4PathwayPanel";
import {
  ElectionPlanDay5StartCard,
  ElectionPlanDay5PathwayHubCard,
} from "@/components/election-plan/ElectionPlanDay5PathwayPanel";
import {
  ElectionPlanDay6StartCard,
  ElectionPlanDay6PathwayHubCard,
} from "@/components/election-plan/ElectionPlanDay6PathwayPanel";
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
  epLegislativeIntel2021Href,
  epLegislativeIntel2025Href,
} from "@/lib/election-plan/debate-prep-links";
import {
  debatePrepHubPrimaryDayId,
  resolveDebateWeekReferenceDate,
} from "@/lib/election-plan/debate-prep-hub-tonight";
import { buildDebatePrepSystemV8Snapshot } from "@/lib/election-plan/debate-prep-system-v8";
import { DAY2_ID, DAY3_ID, DAY4_ID, DAY5_ID, DAY6_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { DAY5_HUB_TONIGHT_SUMMARY } from "@/lib/election-plan/debate-prep-day5-anticipate-copy";
import { DAY6_HUB_TONIGHT_SUMMARY } from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import { ACCA_2026_SOS_FORUM_EVENT } from "@/lib/election-plan/acca-forum-event";

export function ElectionPlanDebatePrepHubPanel() {
  const referenceDate = resolveDebateWeekReferenceDate();
  const primaryDayId = debatePrepHubPrimaryDayId(referenceDate);
  const focusDay6 = primaryDayId === DAY6_ID;
  const focusDay5 = primaryDayId === DAY5_ID;
  const focusDay4 = primaryDayId === DAY4_ID;
  const focusDay3 = primaryDayId === DAY3_ID;
  const focusDay2 = primaryDayId === DAY2_ID;
  const pathwayDayLabel = focusDay6 ? "6" : focusDay5 ? "5" : focusDay4 ? "4" : focusDay3 ? "3" : focusDay2 ? "2" : "1";

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

  const hubSummary = focusDay6
    ? DAY6_HUB_TONIGHT_SUMMARY
    : focusDay5
    ? DAY5_HUB_TONIGHT_SUMMARY
    : focusDay4
    ? "Day 4 tonight: forum lab ingest → claims-gated notecard → one 60s counter — transcript stays internal tactical intelligence until verified."
    : focusDay3
    ? "Day 3 tonight: superiority stack with ACCA Kelly/Hammer clips, notecard worksheet, and claims gate — or catch up Day 2 film clips first if you skipped the weekend."
    : focusDay2
      ? "Day 2 tonight: five ACCA study clips cut to Hammer/Pakko tells, then trap lanes 1–2 until boring — one pathway, tap Continue on each page."
      : "Day 1 tonight: body, breath, author-vs-administrator, then your 90-second opening. One pathway — tap Continue on each page. Film and trap lanes are Day 2.";

  return (
    <>
      <ElectionPlanDebatePrepSubnav />

      <header className="ep-page-header">
        <p className="ep-page-eyebrow">Debate prep command course</p>
        <h1 className="ep-page-title">Debate prep</h1>
        <p className="ep-page-description">{snapshot.intro}</p>
      </header>

      <KellyPageSummary summary={hubSummary} />

      {focusDay6 ? (
        <>
          <ElectionPlanDay6StartCard />
          <ElectionPlanDay6PathwayHubCard />

          <details className="ep-card mb-8 p-5 text-sm">
            <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
              Day 5 complete? Review Day 5 anticipate & capitalize pathway
            </summary>
            <div className="mt-4 space-y-0">
              <ElectionPlanDay5StartCard />
              <ElectionPlanDay5PathwayHubCard />
            </div>
          </details>

          <details className="ep-card mb-8 p-5 text-sm">
            <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
              Day 4 complete? Review Day 4 forum intel pathway
            </summary>
            <div className="mt-4 space-y-0">
              <ElectionPlanDay4StartCard />
              <ElectionPlanDay4PathwayHubCard />
            </div>
          </details>
        </>
      ) : focusDay5 ? (
        <>
          <ElectionPlanDay5StartCard />
          <ElectionPlanDay5PathwayHubCard />

          <details className="ep-card mb-8 p-5 text-sm">
            <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
              Day 4 complete? Review Day 4 forum intel pathway
            </summary>
            <div className="mt-4 space-y-0">
              <ElectionPlanDay4StartCard />
              <ElectionPlanDay4PathwayHubCard />
            </div>
          </details>

          <details className="ep-card mb-8 p-5 text-sm">
            <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
              Day 3 complete? Review Day 3 pathway
            </summary>
            <div className="mt-4 space-y-0">
              <ElectionPlanDay3StartCard />
              <ElectionPlanDay3PathwayHubCard />
            </div>
          </details>
        </>
      ) : focusDay4 ? (
        <>
          <ElectionPlanDay4StartCard />
          <ElectionPlanDay4PathwayHubCard />

          <details className="ep-card mb-8 p-5 text-sm">
            <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
              Day 3 complete? Review Day 3 pathway
            </summary>
            <div className="mt-4 space-y-0">
              <ElectionPlanDay3StartCard />
              <ElectionPlanDay3PathwayHubCard />
            </div>
          </details>

          <details className="ep-card mb-8 p-5 text-sm">
            <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
              Day 2 complete? Review Day 2 pathway
            </summary>
            <div className="mt-4 space-y-0">
              <ElectionPlanDay2StartCard />
              <ElectionPlanDay2PathwayHubCard />
            </div>
          </details>
        </>
      ) : focusDay3 ? (
        <>
          <ElectionPlanDay3StartCard />
          <ElectionPlanDay3PathwayHubCard />

          <details className="ep-card mb-8 p-5 text-sm">
            <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
              Day 2 complete? Review Day 2 pathway
            </summary>
            <div className="mt-4 space-y-0">
              <ElectionPlanDay2StartCard />
              <ElectionPlanDay2PathwayHubCard />
            </div>
          </details>

          <details className="ep-card mb-8 p-5 text-sm">
            <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
              Day 1 complete? Review Day 1 pathway
            </summary>
            <div className="mt-4 space-y-0">
              <ElectionPlanDay1StartCard />
              <ElectionPlanDay1PathwayHubCard />
            </div>
          </details>
        </>
      ) : focusDay2 ? (
        <>
          <ElectionPlanDay2StartCard />
          <ElectionPlanDay2PathwayHubCard />

          <details className="ep-card mb-8 p-5 text-sm">
            <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
              Day 1 complete? Review Day 1 pathway
            </summary>
            <div className="mt-4 space-y-0">
              <ElectionPlanDay1StartCard />
              <ElectionPlanDay1PathwayHubCard />
            </div>
          </details>
        </>
      ) : (
        <>
          <ElectionPlanDay1StartCard />
          <ElectionPlanDay1PathwayHubCard />
          <ElectionPlanDay2StartCard />
          <ElectionPlanDay2PathwayHubCard />
        </>
      )}

      <section className="ep-card mb-8 grid gap-4 border-[var(--ep-border)] bg-white/60 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Full debate week</p>
          <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{snapshot.readinessPct}%</p>
          <p className="text-xs text-[var(--ep-navy-muted)]">
            Staff composite (forum intel + 7-day course) — not your Day {pathwayDayLabel} bar above.
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
          Staff tonight package checklist (optional — Day {pathwayDayLabel} pathway is primary)
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
          Reference tonight (optional — after Day {pathwayDayLabel} blocks)
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link href={EP_VOTER_AUDIENCES_HREF} className="rounded-lg border border-violet-200 bg-violet-50/40 p-4 hover:border-violet-400">
            <p className="text-xs font-bold uppercase text-violet-950">Audiences</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Who is in the room when you speak</p>
          </Link>
          <Link href={epLegislativeIntel2021Href()} className="rounded-lg border border-violet-200 p-4 hover:border-violet-400">
            <p className="text-xs font-bold uppercase text-violet-950">2021 bills</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
              {focusDay2 || focusDay3 ? "Trap lane context — clerk frame only" : "For Day 2+ — not required tonight"}
            </p>
          </Link>
          <Link href={epLegislativeIntel2025Href()} className="rounded-lg border border-amber-200 p-4 hover:border-amber-400">
            <p className="text-xs font-bold uppercase text-amber-950">2025 petitions</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
              {focusDay2 || focusDay3 ? "Contrast without act-number debates" : "For Day 2+ — not required tonight"}
            </p>
          </Link>
          <Link href={EP_DEBATE_QUESTIONS_HREF} className="rounded-lg border border-violet-200 p-4 hover:border-violet-400">
            <p className="text-xs font-bold uppercase text-violet-900">40 questions</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Bank for later this week</p>
          </Link>
          <Link href={EP_OPPONENT_BIOS_HREF} className="rounded-lg border border-rose-200 p-4 hover:border-rose-400">
            <p className="text-xs font-bold uppercase text-rose-900">Opponent bios</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
              {focusDay6
                ? "Hammer + Pakko memory lines — speak twice before sim"
                : focusDay5
                ? "Hammer + Pakko — forum lines feed timed pairs for APA broadcast"
                : focusDay4
                ? "Hammer + Pakko after forum lab"
                : focusDay2
                  ? "Hammer + Pakko after tell briefs"
                  : focusDay3
                    ? "Re-read after qualification stack"
                    : "Best after Day 2 forum briefs"}
            </p>
          </Link>
          <Link href={EP_DEBATE_PREP_WAR_ROOM_HREF} className="rounded-lg border border-[var(--ep-gold)]/40 p-4 hover:border-[var(--ep-gold)]">
            <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">War room</p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
              {focusDay6
                ? "Full sim block — traps + SOS at moderator pace"
                : focusDay5
                ? "Trap lanes 3–6 sprint — open from Day 5 pathway blocks"
                : focusDay4
                ? "Trap lanes after SOS map — open from pathway blocks"
                : focusDay2
                  ? "Trap lanes 1–2 — open from pathway blocks"
                  : focusDay3
                    ? "Offense lanes — after claims gate"
                    : "Trap lanes — Day 2 onward"}
            </p>
          </Link>
        </div>
      </details>

      <ForumTranscriptIntelHubPanel intel={snapshot.forumIntel} />

      <section className="ep-card mb-8 p-5">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">ACCA forum transcript</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {ACCA_2026_SOS_FORUM_EVENT.title} — {ACCA_2026_SOS_FORUM_EVENT.date}
        </p>
        <AccaForumYoutubeEmbed compact />
        <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="mt-4 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
          Forum lab →
        </Link>
      </section>

      <Link href={EP_LEGISLATIVE_INTEL_HREF} className="ep-card block p-5 transition hover:border-[var(--ep-gold)]">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">All legislative intelligence</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">2021 integrity + 2025 petition bills with practice lines.</p>
      </Link>
    </>
  );
}
