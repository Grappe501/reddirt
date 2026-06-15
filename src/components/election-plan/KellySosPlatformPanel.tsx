import Link from "next/link";

import {
  KELLY_SOS_PLATFORM,
  platformPlankHref,
} from "@/lib/election-plan/kelly-sos-platform";

type Props = { standalone?: boolean };

export function KellySosPlatformPanel({ standalone }: Props) {
  const p = KELLY_SOS_PLATFORM;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{p.title}</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{p.subtitle}</p>
        </div>
        {standalone ? (
          <Link
            href={p.doctrineHref}
            className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            ← Big Table Doctrine
          </Link>
        ) : null}
      </div>

      <div className="ep-card-glass mb-8">
        <p className="text-sm leading-relaxed text-[var(--ep-navy-muted)]">{p.intro}</p>
        <p className="mt-4 text-sm">
          <Link href={p.doctrineHref} className="font-semibold text-[var(--ep-gold)] hover:underline">
            Read the Big Table Democrat Doctrine →
          </Link>
        </p>
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">When Kelly wins — governing objectives</h2>
      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        {p.objectivesOnWin.map((o) => (
          <div key={o.title} className="ep-card">
            <h3 className="font-heading font-bold text-[var(--ep-navy)]">{o.title}</h3>
            <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{o.detail}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">Platform planks</h2>
      <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
        Each plank drills down to problem, approach, first 100 days actions, and tenure legacy.
      </p>
      <div className="mb-12 grid gap-3 sm:grid-cols-2">
        {p.planks.map((plank) => (
          <Link
            key={plank.slug}
            href={platformPlankHref(plank.slug)}
            className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
          >
            <h3 className="font-heading font-bold text-[var(--ep-navy)]">{plank.title}</h3>
            <p className="mt-1 text-xs font-medium text-[var(--ep-gold)]">{plank.tagline}</p>
            <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plank.summary}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
              Full plank →
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">{p.first100Days.headline}</h2>
      <p className="mb-6 text-sm text-[var(--ep-navy-muted)]">{p.first100Days.intro}</p>
      <div className="mb-12 space-y-4">
        {p.first100Days.phases.map((phase) => (
          <div key={phase.days} className="ep-card">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="rounded-full bg-[var(--ep-navy)] px-3 py-0.5 text-xs font-bold text-white">
                {phase.days}
              </span>
              <h3 className="font-heading font-bold">{phase.theme}</h3>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-[var(--ep-navy-muted)]">
              {phase.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">{p.tenureLegacy.headline}</h2>
      <p className="mb-6 text-sm text-[var(--ep-navy-muted)]">{p.tenureLegacy.intro}</p>
      <div className="space-y-4">
        {p.tenureLegacy.milestones.map((m) => (
          <div key={m.title} className="ep-card border-l-4 border-[var(--ep-gold)]">
            <h3 className="font-heading font-bold text-[var(--ep-navy)]">{m.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{m.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
