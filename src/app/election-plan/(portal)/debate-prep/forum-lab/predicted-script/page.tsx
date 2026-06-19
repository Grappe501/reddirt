import Link from "next/link";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epForumLabPredictedScriptPhaseHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  listPredictedScriptLessons,
  PREDICTED_SCRIPT_HUB_INTRO,
  PREDICTED_SCRIPT_HUB_LINKS,
} from "@/lib/election-plan/forumLabPredictedScriptDrillDown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Predicted debate script | Forum lab | Debate Prep",
  robots: { index: false, follow: false },
};

export default function ForumLabPredictedScriptHubPage() {
  const phases = listPredictedScriptLessons();

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_TRANSCRIPT_LAB_HREF}
      backLabel="Forum transcript lab"
      eyebrow="Forum lab · predicted script"
      title={PREDICTED_SCRIPT_HUB_INTRO.title}
      description={PREDICTED_SCRIPT_HUB_INTRO.description}
    >
      <div className="space-y-4">
        {PREDICTED_SCRIPT_HUB_INTRO.pillars.map((pillar) => (
          <article key={pillar.heading} className="ep-card border-indigo-200 bg-indigo-50/30 p-5 text-sm">
            <h2 className="text-xs font-bold uppercase text-indigo-950">{pillar.heading}</h2>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{pillar.body}</p>
          </article>
        ))}
      </div>

      <section className="mt-8 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
          Five debate beats
        </h2>
        {phases.map((phase) => (
          <Link
            key={phase.id}
            href={epForumLabPredictedScriptPhaseHref(phase.id)}
            className="ep-card block border-indigo-200 bg-indigo-50/20 p-5 text-sm transition hover:border-[var(--ep-gold)]"
          >
            <p className="text-xs font-bold uppercase text-indigo-900">{phase.phase}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{phase.title}</h2>
            {phase.scriptBeat.moderatorQuestion ? (
              <p className="mt-2 text-[var(--ep-navy-muted)]">Q: {phase.scriptBeat.moderatorQuestion}</p>
            ) : null}
            <p className="mt-2 text-xs text-emerald-900">
              <span className="font-bold">Kelly best:</span> {phase.scriptBeat.kellyBest}
            </p>
            <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Professor rehearsal →</p>
          </Link>
        ))}
      </section>

      <ElectionPlanDrillDownRelated links={PREDICTED_SCRIPT_HUB_LINKS} />
    </ElectionPlanDrillDownShell>
  );
}
