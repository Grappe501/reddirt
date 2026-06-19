import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  epForumLabCapitalizeMoveHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  getCapitalizeMoveLesson,
  listCapitalizeMoveIds,
  listCapitalizeMoveLessons,
} from "@/lib/election-plan/forumLabCapitalizeMovesDrillDown";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listCapitalizeMoveIds().map((moveId) => ({ moveId }));
}

export async function generateMetadata({ params }: { params: Promise<{ moveId: string }> }) {
  const { moveId } = await params;
  const lesson = getCapitalizeMoveLesson(moveId);
  if (!lesson) return { title: "Capitalize move not found" };
  return {
    title: `Capitalize · ${lesson.trigger.slice(0, 48)} | Forum lab`,
    robots: { index: false, follow: false },
  };
}

export default async function ForumLabCapitalizeMovePage({
  params,
}: {
  params: Promise<{ moveId: string }>;
}) {
  const { moveId } = await params;
  const lesson = getCapitalizeMoveLesson(moveId);
  if (!lesson) notFound();

  const moves = listCapitalizeMoveLessons();
  const idx = moves.findIndex((m) => m.id === moveId);
  const prev = idx > 0 ? moves[idx - 1] : null;
  const next = idx >= 0 && idx < moves.length - 1 ? moves[idx + 1] : null;

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_LAB_CAPITALIZE_MOVES_HREF}
      backLabel="Capitalize moves hub"
      eyebrow="Forum lab · when X, say Y"
      title={lesson.trigger}
      description={lesson.whySummary}
    >
      <article className="ep-card border-2 border-emerald-300 bg-emerald-50/50 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-emerald-900">Default Kelly line (forum lab)</p>
        <p className="mt-3 font-heading text-lg font-bold italic text-[var(--ep-navy)]">
          &ldquo;{lesson.kellyLine}&rdquo;
        </p>
      </article>

      <article className="ep-card mt-6 border-violet-300 bg-violet-50/40 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-violet-950">Why this wins in viewers&apos; eyes</h2>
        <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{lesson.viewerImpact}</p>
      </article>

      <div className="mt-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Strategy</h2>
        <ElectionPlanDrillDownSections
          sections={lesson.strategy.map((s) => ({ title: s.heading, body: s.body }))}
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Psychology & presence</h2>
        <ElectionPlanDrillDownSections
          sections={lesson.psychology.map((s) => ({ title: s.heading, body: s.body }))}
        />
      </div>

      {lesson.optionalPhrasing.length > 0 ? (
        <section className="mt-6 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Optional phrasing</h2>
          {lesson.optionalPhrasing.map((phrase) => (
            <article key={phrase.label} className="ep-card p-5 text-sm">
              <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">{phrase.label}</p>
              <p className="mt-2 italic text-[var(--ep-navy)]">&ldquo;{phrase.line}&rdquo;</p>
              <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
                <span className="font-bold text-[var(--ep-navy)]">When:</span> {phrase.when}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      {lesson.phaseGuidance.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Debate phase guidance</h2>
          <div className="space-y-3">
            {lesson.phaseGuidance.map((phase) => (
              <article key={phase.phase} className="ep-card border-indigo-200 bg-indigo-50/30 p-4 text-sm">
                <p className="text-xs font-bold uppercase text-indigo-900">{phase.phase}</p>
                <p className="mt-2 text-[var(--ep-navy-muted)]">{phase.body}</p>
              </article>
            ))}
          </div>
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

      <ElectionPlanDrillDownSteps title="Tonight's rehearsal" steps={lesson.practiceSteps} />

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
          <Link href={epForumLabCapitalizeMoveHref(prev.id)} className="text-[var(--ep-navy)] underline">
            ← {prev.trigger.slice(0, 56)}
            {prev.trigger.length > 56 ? "…" : ""}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={epForumLabCapitalizeMoveHref(next.id)} className="text-[var(--ep-navy)] underline">
            {next.trigger.slice(0, 56)}
            {next.trigger.length > 56 ? "…" : ""} →
          </Link>
        ) : null}
      </nav>
    </ElectionPlanDrillDownShell>
  );
}
