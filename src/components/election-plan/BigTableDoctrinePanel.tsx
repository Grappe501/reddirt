import Link from "next/link";

import { BIG_TABLE_DOCTRINE } from "@/lib/election-plan/big-table-doctrine-content";
import { platformHubHref } from "@/lib/election-plan/kelly-sos-platform";

type Props = {
  standalone?: boolean;
};

export function BigTableDoctrinePanel({ standalone }: Props) {
  const d = BIG_TABLE_DOCTRINE;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{d.title}</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{d.subtitle}</p>
        </div>
        {standalone ? (
          <Link
            href="/election-plan?tab=howWeWin"
            className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            ← How We Win
          </Link>
        ) : null}
      </div>

      <p className="mb-8 text-base leading-relaxed text-[var(--ep-navy-muted)]">{d.intro}</p>

      <div className="ep-card ep-priority-card mb-10 border-l-4 border-[var(--ep-gold)]">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">From doctrine to governing platform</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          The Big Table is not only how Kelly wins — it is how she will govern. The Secretary of State platform
          translates these beliefs into office planks, first 100 days actions, and what Arkansans should look back on
          after her tenure.
        </p>
        <Link
          href={platformHubHref()}
          className="mt-4 inline-block rounded-md bg-[var(--ep-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ep-navy-muted)]"
        >
          Open Kelly Grappe SOS Platform →
        </Link>
      </div>

      <h2 className="mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">We believe</h2>
      <div className="mb-10 space-y-4">
        {d.beliefs.map((b) => (
          <div key={b.heading} className="ep-card">
            <h3 className="font-heading font-bold text-[var(--ep-navy)]">{b.heading}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{b.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold text-[var(--ep-navy)]">Room at the table for</h2>
      <ul className="mb-8 grid gap-2 sm:grid-cols-2">
        {d.roomAtTable.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[var(--ep-navy-muted)]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ep-gold)]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
      <p className="mb-10 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{d.closing}</p>

      <div className="ep-card-glass mb-10">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">What we are asking</h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--ep-navy-muted)]">{d.ask}</p>
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold text-[var(--ep-navy)]">Where this doctrine applies</h2>
      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        {d.applications.map((a) => (
          <div key={a.label} className="ep-card text-sm">
            <h3 className="font-heading font-bold text-[var(--ep-navy)]">{a.label}</h3>
            <p className="mt-1 text-[var(--ep-navy-muted)]">{a.detail}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={platformHubHref()} className="ep-chapter-link">
          SOS Platform (8 planks) →
        </Link>
        <Link href="/election-plan/lanes-overview" className="ep-chapter-link">
          Four lanes overview →
        </Link>
        <Link href="/election-plan/executive-book/power-of-5" className="ep-chapter-link">
          Power of 5 chapter →
        </Link>
        <Link href="/election-plan/executive-book/message" className="ep-chapter-link">
          Kelly Grappe message →
        </Link>
      </div>
    </section>
  );
}
