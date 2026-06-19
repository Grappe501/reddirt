import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_LAB_PREDICTED_SCRIPT_HREF,
  epForumLabPredictedScriptPhaseHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  getPredictedScriptLesson,
  listPredictedScriptLessons,
  listPredictedScriptPhaseIds,
} from "@/lib/election-plan/forumLabPredictedScriptDrillDown";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listPredictedScriptPhaseIds().map((phaseId) => ({ phaseId }));
}

export async function generateMetadata({ params }: { params: Promise<{ phaseId: string }> }) {
  const { phaseId } = await params;
  const lesson = getPredictedScriptLesson(phaseId);
  if (!lesson) return { title: "Script phase not found" };
  return {
    title: `${lesson.title} | Predicted debate script`,
    robots: { index: false, follow: false },
  };
}

export default async function ForumLabPredictedScriptPhasePage({
  params,
}: {
  params: Promise<{ phaseId: string }>;
}) {
  const { phaseId } = await params;
  const lesson = getPredictedScriptLesson(phaseId);
  if (!lesson) notFound();

  const ordered = listPredictedScriptLessons();
  const idx = ordered.findIndex((l) => l.id === phaseId);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  const beat = lesson.scriptBeat;

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_LAB_PREDICTED_SCRIPT_HREF}
      backLabel="Predicted script hub"
      eyebrow={`Forum lab · script · ${lesson.phase}`}
      title={lesson.title}
      description={lesson.summary}
    >
      <article className="ep-card border-2 border-violet-300 bg-violet-50/40 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-violet-950">Professor lead</h2>
        <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{lesson.professorLead}</p>
      </article>

      <article className="ep-card mt-6 border-indigo-200 bg-indigo-50/40 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-indigo-950">v2 script forecast</h2>
        {beat.moderatorQuestion ? (
          <p className="mt-3 text-[var(--ep-navy)]">
            <span className="font-bold">Moderator:</span> {beat.moderatorQuestion}
          </p>
        ) : (
          <p className="mt-3 text-[var(--ep-navy-muted)]">Closing statements — no moderator question.</p>
        )}
        <p className="mt-3 text-rose-900">
          <span className="font-bold">Hammer likely:</span> {beat.hammerLikely}
        </p>
        <p className="mt-2 text-amber-900">
          <span className="font-bold">Pakko likely:</span> {beat.pakkoLikely}
        </p>
        <p className="mt-3 font-bold text-emerald-900">
          <span className="font-bold">Kelly best:</span> {beat.kellyBest}
        </p>
        <p className="mt-2 text-xs text-rose-800">
          <span className="font-bold">Avoid:</span> {beat.kellyAvoid}
        </p>
      </article>

      <div className="mt-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Deep explanation</h2>
        <ElectionPlanDrillDownSections
          sections={lesson.sections.map((s) => ({ title: s.heading, body: s.body }))}
        />
      </div>

      {lesson.opponentForecast.length > 0 ? (
        <div className="mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
            Opponent forecast (ACCA-based)
          </h2>
          <ElectionPlanDrillDownSections
            sections={lesson.opponentForecast.map((s) => ({ title: s.heading, body: s.body }))}
          />
        </div>
      ) : null}

      {lesson.psychology.length > 0 ? (
        <div className="mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
            Psychology & viewer read
          </h2>
          <ElectionPlanDrillDownSections
            sections={lesson.psychology.map((s) => ({ title: s.heading, body: s.body }))}
          />
        </div>
      ) : null}

      {lesson.kellyStrategy.length > 0 ? (
        <div className="mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Kelly strategy</h2>
          <ElectionPlanDrillDownSections
            sections={lesson.kellyStrategy.map((s) => ({ title: s.heading, body: s.body }))}
          />
        </div>
      ) : null}

      {lesson.optionalPhrasing.length > 0 ? (
        <section className="mt-6 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
            Rehearsed answers (90s / short)
          </h2>
          {lesson.optionalPhrasing.map((phrase) => (
            <article key={phrase.label} className="ep-card border-emerald-200 bg-emerald-50/30 p-5 text-sm">
              <p className="text-xs font-bold uppercase text-emerald-900">{phrase.label}</p>
              <p className="mt-2 italic leading-relaxed text-[var(--ep-navy)]">&ldquo;{phrase.line}&rdquo;</p>
              <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
                <span className="font-bold text-[var(--ep-navy)]">When:</span> {phrase.when}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      {lesson.forumEvidence.length > 0 ? (
        <article className="ep-card mt-6 border-amber-200 bg-amber-50/40 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-amber-900">ACCA forum evidence</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-[var(--ep-navy-muted)]">
            {lesson.forumEvidence.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </article>
      ) : null}

      {lesson.doNotSay.length > 0 ? (
        <article className="ep-card mt-6 border-rose-200 bg-rose-50/40 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-rose-900">Do not say</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {lesson.doNotSay.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </article>
      ) : null}

      <ElectionPlanDrillDownSteps title="Tonight's mock-moderator drill" steps={lesson.practiceSteps} />

      {lesson.claimsGate.length > 0 ? (
        <article className="ep-card mt-6 border-rose-200 bg-rose-50/40 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-rose-900">Claims gate</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {lesson.claimsGate.map((item) => (
              <li key={item.slice(0, 48)}>{item}</li>
            ))}
          </ul>
        </article>
      ) : null}

      {lesson.relatedLinks.length > 0 ? (
        <ElectionPlanDrillDownRelated links={lesson.relatedLinks} />
      ) : null}

      <nav className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[var(--ep-border)] pt-6 text-xs font-bold">
        {prev ? (
          <Link href={epForumLabPredictedScriptPhaseHref(prev.id)} className="text-[var(--ep-navy)] underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={epForumLabPredictedScriptPhaseHref(next.id)} className="text-[var(--ep-navy)] underline">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </ElectionPlanDrillDownShell>
  );
}
