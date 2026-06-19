import Link from "next/link";

import { ElectionPlanDrillDownShell } from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  DEBATE_QUESTION_REFERENCE_HUB,
} from "@/lib/election-plan/debateQuestionReferenceDrillDown";
import { EP_DEBATE_PREP_HREF, epDebateQuestionHref } from "@/lib/election-plan/debate-prep-links";
import { listSosDebateQuestionsByCategory } from "@/lib/intelligence/v4/sosDebateQuestionBank";

export const dynamic = "force-dynamic";

const probStyle = {
  HIGH: "bg-rose-100 text-rose-900",
  MEDIUM: "bg-amber-100 text-amber-900",
  LOW: "bg-slate-100 text-slate-800",
} as const;

export default function ElectionPlanDebateQuestionsHubPage() {
  const byCategory = listSosDebateQuestionsByCategory();
  const total = byCategory.reduce((n, c) => n + c.questions.length, 0);
  const highCount = byCategory.flatMap((c) => c.questions).filter((q) => q.probability === "HIGH").length;
  const { hammer, pakko } = DEBATE_QUESTION_REFERENCE_HUB.opponentSummaries;

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_DEBATE_PREP_HREF}
      backLabel="Debate prep hub"
      eyebrow="Reference · expected questions"
      title={DEBATE_QUESTION_REFERENCE_HUB.title}
      description={DEBATE_QUESTION_REFERENCE_HUB.description}
    >
      <article className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-violet-950">How to use this bank</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {DEBATE_QUESTION_REFERENCE_HUB.howToUse.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs font-semibold text-violet-950">
          {highCount} HIGH-probability · {total} total questions · speak-order scripts on every drill-down
        </p>
      </article>

      <article className="ep-card mt-6 border-[var(--ep-gold)]/40 bg-[var(--ep-cream)]/50 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-[var(--ep-gold)]">Speak-order rule</h2>
        <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{DEBATE_QUESTION_REFERENCE_HUB.speakOrderRule}</p>
      </article>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="ep-card border-rose-200 bg-rose-50/30 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-rose-950">{hammer.title}</h2>
          <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{hammer.narrative}</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-rose-950/90">
            {hammer.bullets.map((b) => (
              <li key={b.slice(0, 48)}>{b}</li>
            ))}
          </ul>
        </article>
        <article className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-violet-950">{pakko.title}</h2>
          <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{pakko.narrative}</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-violet-950/90">
            {pakko.bullets.map((b) => (
              <li key={b.slice(0, 48)}>{b}</li>
            ))}
          </ul>
        </article>
      </section>

      {byCategory.map((cat) => (
        <section key={cat.category} className="mt-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--ep-navy)]">{cat.categoryLabel}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {cat.questions.map((q) => (
              <Link
                key={q.questionId}
                href={epDebateQuestionHref(q.questionId)}
                className="ep-card flex min-h-[120px] flex-col p-4 transition hover:border-[var(--ep-navy)]/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-violet-800">Q{q.questionNumber}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${probStyle[q.probability]}`}>
                    {q.probability}
                  </span>
                </div>
                <h3 className="mt-2 font-heading text-base font-bold text-[var(--ep-navy)]">{q.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-xs text-[var(--ep-navy-muted)]">{q.oneLinePrep}</p>
                <p className="mt-3 text-xs font-bold text-[var(--ep-gold)]">Full drill-down →</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </ElectionPlanDrillDownShell>
  );
}
