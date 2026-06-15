import Link from "next/link";

import type { PlatformPlank } from "@/lib/election-plan/kelly-sos-platform";
import { platformHubHref } from "@/lib/election-plan/kelly-sos-platform";

type Props = { plank: PlatformPlank };

export function KellySosPlatformPlankPanel({ plank }: Props) {
  return (
    <section>
      <Link
        href={platformHubHref()}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← Full platform
      </Link>

      <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{plank.title}</h1>
      <p className="mt-1 text-sm font-medium text-[var(--ep-gold)]">{plank.tagline}</p>
      <p className="mt-4 text-base leading-relaxed text-[var(--ep-navy-muted)]">{plank.summary}</p>

      <div className="ep-card-glass mt-6 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
          Big Table Doctrine anchor
        </p>
        <p className="mt-2 text-[var(--ep-navy)]">{plank.doctrineAnchor}</p>
      </div>

      <div className="mt-8 ep-card">
        <h2 className="font-heading text-lg font-bold">The problem</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{plank.problem}</p>
      </div>

      <div className="mt-6 ep-card">
        <h2 className="font-heading text-lg font-bold">Kelly&apos;s approach</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[var(--ep-navy-muted)]">
          {plank.approach.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      {plank.deepDive.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h2 className="font-heading text-lg font-bold">Deep dive</h2>
          {plank.deepDive.map((s) => (
            <div key={s.heading} className="ep-card">
              <h3 className="font-heading font-bold text-[var(--ep-navy)]">{s.heading}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{s.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-8 ep-card">
        <h2 className="font-heading text-lg font-bold">First 100 days — this plank</h2>
        <dl className="mt-4 space-y-4">
          {plank.first100Days.map((row) => (
            <div key={row.action} className="border-b border-[var(--ep-border)] pb-4 last:border-0 last:pb-0">
              <dt className="font-semibold text-[var(--ep-navy)]">{row.action}</dt>
              <dd className="mt-1 text-sm text-[var(--ep-navy-muted)]">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 ep-card border-l-4 border-[var(--ep-gold)]">
        <h2 className="font-heading text-lg font-bold">What voters look back on</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[var(--ep-navy-muted)]">
          {plank.tenureLegacy.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={platformHubHref()} className="ep-chapter-link">
          ← Platform overview & all planks
        </Link>
        <Link href="/election-plan/big-table-doctrine" className="ep-chapter-link">
          Big Table Doctrine →
        </Link>
      </div>
    </section>
  );
}
