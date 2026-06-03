import Link from "next/link";
import { DEBATE_WEEK_EXTENDED_NAV_ITEMS, DEBATE_WEEK_PRIMARY_NAV_ITEMS } from "@/lib/intelligence/debate-week-nav";

const card =
  "flex flex-col rounded-xl border-2 border-kelly-navy/15 bg-white p-4 shadow-sm transition hover:border-kelly-navy/40";

/**
 * Zero filesystem / orchestration — Netlify launch hub must render in under edge timeout.
 */
export function IntelligenceLaunchModePage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          Opposition Research Workbench
        </p>
        <h1 className="font-heading text-2xl font-bold">Tonight&apos;s overview</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Start here, then open debate prep for the full briefing. All content is internal draft — verify before any
          public use.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/admin/intelligence/kim-hammer/debate-prep"
            className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
          >
            Go to debate prep →
          </Link>
          <Link
            href="/admin/intelligence/debate-command"
            className="rounded-full border border-kelly-navy/30 px-4 py-2 text-xs font-bold text-kelly-navy"
          >
            Debate command
          </Link>
        </div>
      </header>

      <section className="mb-8">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Your path</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {DEBATE_WEEK_PRIMARY_NAV_ITEMS.map((item, index) => (
            <Link key={item.href} href={item.href} className={card}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-800">Step {index + 1}</span>
              <h2 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{item.label}</h2>
              <p className="mt-2 text-xs text-kelly-muted">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Staff tools</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {DEBATE_WEEK_EXTENDED_NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded border px-2 py-1 font-semibold text-kelly-navy">
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
