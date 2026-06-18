import Link from "next/link";
import type { CandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import type { CceClosureSummary } from "@/lib/intelligence/v4/phase15P9Closure";
import type { SreClosureSummary } from "@/lib/intelligence/v4/phase16P9Closure";
import { CandidateTopTierStrip } from "@/components/admin/intelligence/CandidateTopTierStrip";
import { CandidateSreClosureStrip } from "@/components/admin/intelligence/CandidateSreClosureStrip";
import { CandidateRehearsalLauncherStrip } from "@/components/admin/intelligence/CandidateRehearsalLauncherStrip";
import { CandidateRunOfShowStrip } from "@/components/admin/intelligence/CandidateRunOfShowStrip";
import { CandidateEncounterScenariosStrip } from "@/components/admin/intelligence/CandidateEncounterScenariosStrip";
import { CandidateDrillQueueStrip } from "@/components/admin/intelligence/CandidateDrillQueueStrip";
import { CandidateSessionDebriefStrip } from "@/components/admin/intelligence/CandidateSessionDebriefStrip";
import { CandidateIpadDrillPlayerStrip } from "@/components/admin/intelligence/CandidateIpadDrillPlayerStrip";
import { CandidateSessionMemoryStrip } from "@/components/admin/intelligence/CandidateSessionMemoryStrip";
import { CandidateStaffCoachStrip } from "@/components/admin/intelligence/CandidateStaffCoachStrip";
import { CandidateLiveEventStrip } from "@/components/admin/intelligence/CandidateLiveEventStrip";
import { CandidateEvidenceHonestyStrip } from "@/components/admin/intelligence/CandidateEvidenceHonestyStrip";
import { CandidateDemoModeStrip } from "@/components/admin/intelligence/CandidateDemoModeStrip";
import { CandidateIpadPolishStrip } from "@/components/admin/intelligence/CandidateIpadPolishStrip";
import { CandidateStaffBackstageStrip } from "@/components/admin/intelligence/CandidateStaffBackstageStrip";
import { CandidateCceClosureStrip } from "@/components/admin/intelligence/CandidateCceClosureStrip";

export function CandidateCommandHomePanel({
  feed,
  cceClosure,
  sreClosure,
  resolveHref = (href: string) => href,
}: {
  feed: CandidateCommandHomeFeed;
  cceClosure?: CceClosureSummary;
  sreClosure?: SreClosureSummary;
  resolveHref?: (href: string) => string;
}) {
  return (
    <section className="mb-6 rounded-xl border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-50/60 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-950">Phase 15 · Command home</p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">Tonight&apos;s command briefing</h2>
          <p className="mt-2 text-sm text-kelly-muted">
            One screen — readiness, safe lines, blocked lines, and today&apos;s focus. Supreme workbench depth stays on
            staff profile.
          </p>
        </div>
        <div className="text-right">
          <p className="font-heading text-4xl font-bold text-indigo-950">{feed.readinessPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">{feed.readinessLabel}</p>
          <p className="mt-1 text-[10px] text-kelly-muted">
            {feed.claimsSummary.verified} verified · {feed.claimsSummary.needsReview} need review
          </p>
        </div>
      </div>

      <CandidateTopTierStrip
        items={feed.topTierTonight}
        hubHref={feed.topTierHubHref}
        minutesTotal={feed.topTierMinutesTotal}
        compact
      />

      <div className="mt-4">
        <CandidateRehearsalLauncherStrip summary={feed.rehearsalLauncher} />
      </div>

      <div className="mt-4">
        <CandidateRunOfShowStrip summary={feed.runOfShow} />
      </div>

      <div className="mt-4">
        <CandidateEncounterScenariosStrip summary={feed.encounterScenarios} />
      </div>

      <div className="mt-4">
        <CandidateDrillQueueStrip summary={feed.drillQueue} />
      </div>

      <div className="mt-4">
        <CandidateSessionDebriefStrip summary={feed.sessionDebrief} />
      </div>

      <div className="mt-4">
        <CandidateIpadDrillPlayerStrip summary={feed.ipadDrillPlayer} />
      </div>

      <div className="mt-4">
        <CandidateSessionMemoryStrip summary={feed.sessionMemory} />
      </div>

      <div className="mt-4">
        <CandidateStaffCoachStrip summary={feed.staffCoach} />
      </div>

      <div className="mt-4">
        <CandidateLiveEventStrip summary={feed.liveEvent} />
      </div>

      <CandidateEvidenceHonestyStrip summary={feed.evidenceHonesty} />

      <div className="mt-4">
        <CandidateDemoModeStrip summary={feed.demoMode} />
      </div>

      <div className="mt-4">
        <CandidateIpadPolishStrip summary={feed.ipadPolish} />
      </div>

      <div className="mt-4">
        <CandidateStaffBackstageStrip summary={feed.staffBackstage} />
      </div>

      {cceClosure ? (
        <div className="mt-4">
          <CandidateCceClosureStrip summary={cceClosure} />
        </div>
      ) : null}

      {sreClosure ? (
        <div className="mt-4">
          <CandidateSreClosureStrip summary={sreClosure} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <h3 className="text-xs font-bold uppercase text-emerald-900">Safe tonight ({feed.safeTonight.length})</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {feed.safeTonight.map((line) => (
              <li key={line.id} className="rounded border border-emerald-100 bg-white p-2">
                <Link href={resolveHref(line.href)} className="font-semibold text-kelly-navy underline">
                  {line.claimText.slice(0, 120)}
                  {line.claimText.length > 120 ? "…" : ""}
                </Link>
                <p className="mt-1 text-[10px] text-emerald-800">{line.reason}</p>
              </li>
            ))}
            {feed.safeTonight.length === 0 ? (
              <li className="text-xs text-kelly-muted">No verified stage lines yet — staff must clear claims first.</li>
            ) : null}
          </ul>
        </article>

        <article className="rounded-lg border border-rose-200 bg-rose-50/50 p-4">
          <h3 className="text-xs font-bold uppercase text-rose-900">Blocked tonight ({feed.blockedTonight.length})</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {feed.blockedTonight.map((line) => (
              <li key={line.id} className="rounded border border-rose-100 bg-white p-2">
                <Link href={resolveHref(line.href)} className="font-semibold text-rose-900 underline">
                  {line.claimText.slice(0, 120)}
                  {line.claimText.length > 120 ? "…" : ""}
                </Link>
                <p className="mt-1 text-[10px] text-rose-800">{line.reason}</p>
              </li>
            ))}
            {feed.blockedTonight.length === 0 ? (
              <li className="text-xs text-kelly-muted">No blocked lines flagged — still verify before any new adaptation.</li>
            ) : null}
          </ul>
        </article>
      </div>

      <div className="mt-4 rounded-lg border border-indigo-100 bg-white p-4">
        <h3 className="text-xs font-bold uppercase text-indigo-900">Today&apos;s focus</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-kelly-muted">
          {feed.todayFocus.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={resolveHref("/admin/intelligence/demo-mode")}
            className="rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-[10px] font-bold text-teal-950"
          >
            Demo script
          </Link>
          <Link
            href={resolveHref("/admin/intelligence/kelly-prep-week")}
            className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-950"
          >
            Kelly prep week
          </Link>
          <Link
            href={resolveHref("/admin/intelligence/top-tier-prep")}
            className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-[10px] font-bold text-violet-950"
          >
            Top-tier prep
          </Link>
          <Link
            href={resolveHref("/admin/intelligence/debate-command")}
            className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-950"
          >
            Debate command
          </Link>
          <Link
            href={resolveHref("/admin/intelligence/trap-lanes")}
            className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-950"
          >
            Rehearse trap lanes
          </Link>
          <Link
            href={resolveHref("/admin/intelligence/claims")}
            className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-950"
          >
            Claims ledger
          </Link>
        </div>
      </div>
    </section>
  );
}
