import Link from "next/link";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epForumLabDeepAnalysisLessonHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  DEEP_ANALYSIS_HUB_INTRO,
  DEEP_ANALYSIS_HUB_LINKS,
  getDeepProfessorLesson,
  listDeepProfessorProfiles,
  listDeepProfessorQuotes,
} from "@/lib/election-plan/forumLabDeepAnalysisDrillDown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Deep analysis v2 | Forum lab | Debate Prep",
  robots: { index: false, follow: false },
};

export default function ForumLabDeepAnalysisHubPage() {
  const executive = getDeepProfessorLesson("executive-brief");
  const profiles = listDeepProfessorProfiles();
  const quotes = listDeepProfessorQuotes();

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_FORUM_TRANSCRIPT_LAB_HREF}
      backLabel="Forum transcript lab"
      eyebrow="Forum lab · deep analysis v2"
      title={DEEP_ANALYSIS_HUB_INTRO.title}
      description={DEEP_ANALYSIS_HUB_INTRO.description}
    >
      <div className="space-y-4">
        {DEEP_ANALYSIS_HUB_INTRO.pillars.map((pillar) => (
          <article key={pillar.heading} className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
            <h2 className="text-xs font-bold uppercase text-violet-950">{pillar.heading}</h2>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{pillar.body}</p>
          </article>
        ))}
      </div>

      {executive ? (
        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Executive brief</h2>
          <Link
            href={epForumLabDeepAnalysisLessonHref(executive.id)}
            className="ep-card mt-4 block border-2 border-violet-300 bg-violet-950/5 p-5 text-sm transition hover:border-[var(--ep-gold)]"
          >
            <p className="font-heading text-lg font-bold text-[var(--ep-navy)]">{executive.title}</p>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{executive.summary}</p>
            <p className="mt-3 text-xs font-bold text-violet-900">Professor study →</p>
          </Link>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Speaker profiles</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={epForumLabDeepAnalysisLessonHref(profile.id)}
              className="ep-card block p-4 text-sm transition hover:border-[var(--ep-gold)]"
            >
              <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">{profile.title}</p>
              <p className="mt-2 text-[var(--ep-navy-muted)]">{profile.summary}</p>
              <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Open profile →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
          Verbatim quotes ({quotes.length}) — claims-gated
        </h2>
        <div className="mt-4 space-y-3">
          {quotes.map((q) => (
            <Link
              key={q.id}
              href={epForumLabDeepAnalysisLessonHref(q.id)}
              className="ep-card block border-amber-200 bg-amber-50/20 p-4 text-sm transition hover:border-amber-400"
            >
              <p className="text-xs font-bold uppercase text-amber-900">
                {q.quoteMeta?.speaker} · {q.quoteMeta?.claimsGateStatus}
              </p>
              <p className="mt-2 italic text-[var(--ep-navy)]">&ldquo;{q.quoteMeta?.quote}&rdquo;</p>
              <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Stage: {q.quoteMeta?.stageUse}</p>
              <p className="mt-2 text-xs font-bold text-[var(--ep-navy)]">Professor breakdown →</p>
            </Link>
          ))}
        </div>
      </section>

      <ElectionPlanDrillDownRelated links={DEEP_ANALYSIS_HUB_LINKS} />
    </ElectionPlanDrillDownShell>
  );
}
