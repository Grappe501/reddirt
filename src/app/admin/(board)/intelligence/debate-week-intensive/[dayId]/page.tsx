import Link from "next/link";
import { notFound } from "next/navigation";
import { DebateWeekDayDeepPanel } from "@/components/admin/intelligence/DebateWeekDayDeepPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  DEBATE_WEEK_INTENSIVE_DAY_IDS,
  DEBATE_WEEK_INTENSIVE_HUB_HREF,
  getDebateWeekIntensiveDay,
  type IntensiveDayId,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { loadForumTranscriptLab } from "@/lib/intelligence/v4/forumTranscriptLab";
import { loadKellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return DEBATE_WEEK_INTENSIVE_DAY_IDS.map((dayId) => ({ dayId }));
}

export default async function DebateWeekIntensiveDayPage({
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
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Command Mode · ${plan.weekdayLabel}`}
        title={plan.title}
        description={plan.subtitle}
      >
        <V4BackLinks />
        <Link
          href={DEBATE_WEEK_INTENSIVE_HUB_HREF}
          className="rounded-full border border-kelly-gold/50 bg-kelly-gold/10 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Intensive hub
        </Link>
      </V4PageHeader>

      <section className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-kelly-gold/30 bg-kelly-gold/5 p-4 text-sm">
          <p className="font-bold text-kelly-navy">Command focus</p>
          <p className="mt-2 text-kelly-muted">{plan.commandModeFocus}</p>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-sm">
          <p className="font-bold text-indigo-950">Psychology</p>
          <p className="mt-2 text-kelly-muted">{plan.psychologyPrinciple}</p>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <p className="text-kelly-muted">
          <span className="font-bold text-kelly-navy">Goal:</span> {plan.goalForKelly}
        </p>
        <p className="mt-2 text-emerald-900">
          <span className="font-bold">Success:</span> {plan.successCheck}
        </p>
        <p className="mt-2 text-indigo-900">
          <span className="font-bold">Newspaper:</span> {plan.newspaperAngle}
        </p>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Study blocks</h2>
        {plan.blocks.map((block, idx) => (
          <article key={block.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-kelly-navy">
                {idx + 1}. {block.title}
              </p>
              <span className="font-mono text-xs text-kelly-subtle">{block.minutes} min</span>
            </div>
            <p className="mt-2 text-kelly-muted">{block.activity}</p>
            <p className="mt-1 text-xs italic text-indigo-800">{block.why}</p>
            {block.href ? (
              <Link href={block.href} className="mt-3 inline-block font-bold text-kelly-navy underline">
                Open →
              </Link>
            ) : null}
          </article>
        ))}
      </section>

      {plan.opponentExamples.length > 0 ? (
        <section className="mb-8 space-y-4">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Opponent examples</h2>
          {plan.opponentExamples.map((ex) => (
            <article key={ex.id} className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 text-sm">
              <p className="font-bold text-rose-950">{ex.opponent}</p>
              <p className="mt-2 text-kelly-muted">{ex.theirMove}</p>
              <p className="mt-3 font-bold text-emerald-900">Kelly</p>
              <p>{ex.kellyResponse}</p>
              <p className="mt-2 text-xs text-kelly-subtle">{ex.sourceNote}</p>
            </article>
          ))}
        </section>
      ) : null}

      {plan.rehearsalOutLoud.length ? (
        <section className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Rehearse out loud</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-kelly-muted">
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
      />
    </div>
  );
}
