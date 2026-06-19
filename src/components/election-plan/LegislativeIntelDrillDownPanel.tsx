import Link from "next/link";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import type { LegislativeIntelPage } from "@/lib/election-plan/legislative-intel-drill-down";

type Props = {
  page: LegislativeIntelPage;
};

export function LegislativeIntelDrillDownPanel({ page }: Props) {
  return (
    <>
      <KellyPageSummary summary={page.pageSummary} />

      <article className="ep-card mb-6 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Plain English</p>
        <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{page.plainEnglish}</p>
      </article>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <article className="ep-card border-rose-200 bg-rose-50/40 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-rose-900">Hammer will likely say</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{page.hammerLikelySays}</p>
        </article>
        <article className="ep-card border-emerald-200 bg-emerald-50/40 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-emerald-900">Your pivot</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{page.kellyPivot}</p>
        </article>
      </div>

      <article className="ep-card mb-6 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Bill-by-bill (verify on Arkleg before citing)</p>
        <div className="mt-4 space-y-3">
          {page.bills.map((bill) => (
            <div key={bill.billNumber} className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/30 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-sm font-bold text-[var(--ep-navy)]">
                  {bill.billNumber} → Act {bill.actNumber}
                </p>
                {bill.arklegUrl ? (
                  <a
                    href={bill.arklegUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[var(--ep-navy)] underline"
                  >
                    Arkleg ↗
                  </a>
                ) : null}
              </div>
              <p className="mt-2 font-semibold text-[var(--ep-navy)]">{bill.theme}</p>
              <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{bill.clerkImpact}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="ep-card mb-6 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Pattern to remember</p>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-[var(--ep-navy-muted)]">
          {page.narrativePoints.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </article>

      <article className="ep-card mb-6 border-emerald-200 bg-emerald-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-emerald-900">Practice lines — say aloud</p>
        <ul className="mt-3 space-y-3">
          {page.practiceLines.map((line) => (
            <li key={line.slice(0, 48)} className="italic text-[var(--ep-navy-muted)]">
              &ldquo;{line}&rdquo;
            </li>
          ))}
        </ul>
      </article>

      <article className="ep-card mb-6 border-[var(--ep-gold)]/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">If the moderator asks</p>
        <p className="mt-2 font-medium text-[var(--ep-navy)]">{page.debateQuestion}</p>
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">Best used when: {page.whenToUse}</p>
      </article>

      {page.doNotSay.length > 0 ? (
        <article className="ep-card mb-6 border-amber-200 bg-amber-50/40 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-amber-900">Avoid on stage</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {page.doNotSay.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </article>
      ) : null}

      <nav className="flex flex-wrap gap-2 text-xs font-bold">
        {page.relatedHrefs.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            {link.label} →
          </Link>
        ))}
      </nav>
    </>
  );
}
