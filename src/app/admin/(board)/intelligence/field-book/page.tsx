import Link from "next/link";
import { FieldBookPhaseCardGrid } from "@/components/admin/intelligence/FieldBookArticleView";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  FIELD_BOOK_ARTICLES,
  FIELD_BOOK_TAGLINE,
  FIELD_BOOK_TITLE,
  getFieldBookArticlesForPhase,
  FIELD_BOOK_PHASES,
} from "@/lib/intelligence/fieldBookRegistry";

export const dynamic = "force-dynamic";

export default function FieldBookHubPage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Campaign canon · encyclopedia"
        title={FIELD_BOOK_TITLE}
        description={FIELD_BOOK_TAGLINE}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/diligence"
          className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Phase A diligence
        </Link>
        <Link
          href="/admin/intelligence/build-progress"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Build progress
        </Link>
        <Link
          href="/admin/intelligence/field-book/canon"
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          Canon loop hub
        </Link>
        <Link
          href="/admin/intelligence/field-book/glossary"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Debate glossary
        </Link>
      </V4PageHeader>

      <article className="mb-8 rounded-xl border-2 border-kelly-gold/40 bg-gradient-to-br from-amber-50/60 to-white p-5 text-sm">
        <p className="font-bold uppercase text-amber-950">How The Field Book grows</p>
        <p className="mt-2 text-kelly-muted">
          Four upgrade phases (A–D) each own a section. Every intelligence deploy deepens cross-linked articles —
          philosophy, strategy, opposition, trivia. After intelligence hits ~98%, strategy manuals migrate here from
          the repo into connected canon.
        </p>
      </article>

      <FieldBookPhaseCardGrid />

      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900">Phase D — organization (live)</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {getFieldBookArticlesForPhase("phase-d").map((a) => (
            <li key={a.slug}>
              <Link
                href={`/admin/intelligence/field-book/${a.slug}`}
                className="block rounded-lg border border-emerald-300/60 bg-emerald-50/30 p-4 hover:border-emerald-600/40"
              >
                <p className="font-bold text-emerald-950">{a.title}</p>
                <p className="mt-1 text-xs text-kelly-muted">{a.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Phase A — live now</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {getFieldBookArticlesForPhase("phase-a").map((a) => (
            <li key={a.slug}>
              <Link
                href={`/admin/intelligence/field-book/${a.slug}`}
                className="block rounded-lg border border-kelly-text/10 bg-white p-4 hover:border-kelly-navy/30"
              >
                <p className="font-bold text-kelly-navy">{a.title}</p>
                <p className="mt-1 text-xs text-kelly-muted">{a.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-xs text-kelly-subtle">
        {FIELD_BOOK_ARTICLES.length} articles across {FIELD_BOOK_PHASES.length} phases · Wikipedia-style cross-links
        on every page
      </p>
    </div>
  );
}
