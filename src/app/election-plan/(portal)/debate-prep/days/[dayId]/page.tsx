import Link from "next/link";
import { notFound } from "next/navigation";

import { DebateWeekDayDeepPanel } from "@/components/admin/intelligence/DebateWeekDayDeepPanel";
import { DebateWeekDayV3Panel } from "@/components/admin/intelligence/DebateWeekDayV3Panel";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import {
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_DEBATE_PREP_PROGRESS_API,
} from "@/lib/election-plan/debate-prep-links";
import {
  epDebatePrepLaneHref,
  mapAdminDebateHrefToElectionPlan,
} from "@/lib/election-plan/debate-prep-route-map";
import {
  DEBATE_WEEK_INTENSIVE_DAY_IDS,
  getDebateWeekIntensiveDay,
  type IntensiveDayId,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { loadForumTranscriptLab } from "@/lib/intelligence/v4/forumTranscriptLab";
import { loadKellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return DEBATE_WEEK_INTENSIVE_DAY_IDS.map((dayId) => ({ dayId }));
}

export const metadata = {
  title: "Command Course Day | Debate Prep | Election Plan",
  robots: { index: false, follow: false },
};

export default async function ElectionPlanDebatePrepDayPage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  if (!DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(dayId as IntensiveDayId)) notFound();

  const plan = getDebateWeekIntensiveDay(dayId as IntensiveDayId)!;
  const forumLab = loadForumTranscriptLab();
  const progress = loadKellyDebateIntensiveProgress();

  return (
    <>
      <div className="ep-classification">Internal · Command course day · Debate prep v5</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">
              Command Mode · {plan.weekdayLabel}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{plan.title}</h1>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
            <Link href={EP_DEBATE_PREP_HREF} className="mt-4 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
              ← Debate prep hub
            </Link>
          </header>

          <section className="ep-card mb-6 grid gap-4 sm:grid-cols-2 p-5 text-sm">
            <div>
              <p className="font-bold text-[var(--ep-navy)]">Command focus</p>
              <p className="mt-2 text-[var(--ep-navy-muted)]">{plan.commandModeFocus}</p>
            </div>
            <div>
              <p className="font-bold text-[var(--ep-navy)]">Psychology</p>
              <p className="mt-2 text-[var(--ep-navy-muted)]">{plan.psychologyPrinciple}</p>
            </div>
          </section>

          <section className="ep-card mb-6 p-5 text-sm">
            <p className="text-[var(--ep-navy-muted)]">
              <span className="font-bold text-[var(--ep-navy)]">Goal:</span> {plan.goalForKelly}
            </p>
            <p className="mt-2 text-emerald-900">
              <span className="font-bold">Success:</span> {plan.successCheck}
            </p>
            <p className="mt-2 text-indigo-900">
              <span className="font-bold">Newspaper:</span> {plan.newspaperAngle}
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Study blocks</h2>
            {plan.blocks.map((block, idx) => (
              <article key={block.id} className="ep-card p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-[var(--ep-navy)]">
                    {idx + 1}. {block.title}
                  </p>
                  <span className="font-mono text-xs text-[var(--ep-navy-muted)]">{block.minutes} min</span>
                </div>
                <p className="mt-2 text-[var(--ep-navy-muted)]">{block.activity}</p>
                <p className="mt-1 text-xs italic text-indigo-800">{block.why}</p>
                {block.href ? (
                  <Link
                    href={mapAdminDebateHrefToElectionPlan(block.href)}
                    className="mt-3 inline-block font-bold text-[var(--ep-navy)] underline"
                  >
                    Open →
                  </Link>
                ) : null}
              </article>
            ))}
          </section>

          {plan.opponentExamples.length > 0 ? (
            <section className="mb-8 space-y-4">
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Opponent examples</h2>
              {plan.opponentExamples.map((ex) => (
                <article key={ex.id} className="ep-card border-rose-200 bg-rose-50/40 p-4 text-sm">
                  <p className="font-bold text-rose-950">{ex.opponent}</p>
                  <p className="mt-2 text-[var(--ep-navy-muted)]">{ex.theirMove}</p>
                  <p className="mt-3 font-bold text-emerald-900">Kelly</p>
                  <p>{ex.kellyResponse}</p>
                  <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{ex.sourceNote}</p>
                </article>
              ))}
            </section>
          ) : null}

          {plan.rehearsalOutLoud.length ? (
            <section className="ep-card mb-6 border-emerald-200 bg-emerald-50/50 p-5 text-sm">
              <h2 className="text-xs font-bold uppercase text-emerald-900">Rehearse out loud</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
                {plan.rehearsalOutLoud.map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <DebateWeekDayDeepPanel
            dayId={dayId as IntensiveDayId}
            blocks={plan.blocks}
            forumCapitalizeMoves={forumLab.analysis?.capitalizeMoves}
            forumDeepAnalysis={forumLab.deepAnalysis}
            initialProgress={progress}
            progressApiBase={EP_DEBATE_PREP_PROGRESS_API}
          />

          <DebateWeekDayV3Panel
            dayId={dayId as IntensiveDayId}
            blocks={plan.blocks}
            initialProgress={progress}
            progressApiBase={EP_DEBATE_PREP_PROGRESS_API}
            laneHrefFn={epDebatePrepLaneHref}
            lanesHubHref={EP_DEBATE_PREP_LANES_HREF}
            resolveHref={mapAdminDebateHrefToElectionPlan}
          />
        </div>
      </div>
    </>
  );
}
