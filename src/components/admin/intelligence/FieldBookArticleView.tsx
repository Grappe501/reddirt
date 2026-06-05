import Link from "next/link";
import type { FieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import {
  FIELD_BOOK_PHASES,
  getFieldBookArticle,
  getFieldBookArticlesForPhase,
  getFieldBookPhase,
} from "@/lib/intelligence/fieldBookRegistry";
import { FieldBookCrossLinkText } from "@/components/admin/intelligence/FieldBookCrossLinkText";

export function FieldBookArticleView({ article }: { article: FieldBookArticle }) {
  const phase = getFieldBookPhase(article.phaseId);

  return (
    <article className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
          {phase ? (
            <Link href={phase.href} className={`rounded-full border px-2 py-0.5 ${phase.borderClass}`}>
              {phase.shortLabel}
            </Link>
          ) : null}
          <span className="text-kelly-subtle">{article.category}</span>
        </div>

        <h1 className="mt-3 font-heading text-3xl font-bold text-kelly-navy">{article.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-kelly-muted">{article.summary}</p>

        <div className="prose-kelly mt-8 space-y-4 text-sm leading-relaxed text-kelly-text">
          {article.body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>
              <FieldBookCrossLinkText text={paragraph} />
            </p>
          ))}
        </div>

        {article.trivia?.length ? (
          <aside className="mt-8 rounded-xl border border-kelly-gold/40 bg-amber-50/50 p-4 text-xs">
            <p className="font-bold uppercase text-amber-950">Beyond the briefing</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-amber-950/90">
              {article.trivia.map((t) => (
                <li key={t.slice(0, 40)}>{t}</li>
              ))}
            </ul>
          </aside>
        ) : null}

        {article.relatedRoutes.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.relatedRoutes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-full border border-kelly-navy/25 px-3 py-1 text-xs font-bold text-kelly-navy"
              >
                {r.label} →
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-xl border-2 border-kelly-navy/15 bg-kelly-page/30 p-4 text-xs">
          <p className="font-bold uppercase tracking-wider text-kelly-navy">Quick facts</p>
          <dl className="mt-3 space-y-2">
            {article.sidebarFacts.map((f) => (
              <div key={f.label}>
                <dt className="text-[10px] font-bold uppercase text-kelly-subtle">{f.label}</dt>
                <dd className="mt-0.5 text-kelly-text">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {article.seeAlso.length ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 text-xs">
            <p className="font-bold uppercase text-violet-950">See also</p>
            <ul className="mt-2 space-y-2">
              {article.seeAlso.map((slug) => {
                const related = getFieldBookArticle(slug);
                return (
                  <li key={slug}>
                    <Link href={`/admin/intelligence/field-book/${slug}`} className="font-semibold text-violet-950 underline">
                      {related?.title ?? slug}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </aside>
    </article>
  );
}

export function FieldBookPhaseCardGrid({ phaseId }: { phaseId?: string }) {
  const phases = phaseId ? FIELD_BOOK_PHASES.filter((p) => p.id === phaseId) : FIELD_BOOK_PHASES;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {phases.map((phase) => {
        const articles = getFieldBookArticlesForPhase(phase.id);
        return (
          <Link
            key={phase.id}
            href={phase.href}
            className={`rounded-xl border-2 p-5 shadow-sm transition hover:shadow-md ${phase.borderClass}`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${phase.colorClass}`}>{phase.shortLabel}</p>
            <h2 className={`mt-2 font-heading text-xl font-bold ${phase.colorClass}`}>
              {phase.label.replace(/^Phase [A-D] — /, "")}
            </h2>
            <p className="mt-2 text-sm text-kelly-muted">{phase.tagline}</p>
            <p className="mt-3 text-xs font-bold text-kelly-navy">{articles.length} articles · Open section →</p>
          </Link>
        );
      })}
    </div>
  );
}
