import Link from "next/link";

import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";

type Props = {
  data: ElectionPlanWorkbenchSnapshot;
};

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{subtitle}</p> : null}
    </div>
  );
}

export function ExecutiveBookHubPanel({ data }: Props) {
  const hub = data.executiveBookHub;

  return (
    <section>
      <SectionTitle
        title="Executive Book"
        subtitle="Leadership briefing · shareable chapters · board-ready narrative"
      />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">
          Version {hub.version} · {hub.status.replace(/_/g, " ")} · Labor Day gate {hub.laborDayDeadline}
        </p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          For Kelly, Ernie, donors, validators, and coalition partners. Each chapter has a shareable URL. Operators
          continue in War Room, Field Calendar, and Coverage Reality tabs.
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{hub.chapters.length}</div>
          <div className="ep-stat-label">Chapters</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{hub.completenessEstimate}</div>
          <div className="ep-stat-label">Completeness</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">V{hub.version}</div>
          <div className="ep-stat-label">Edition</div>
        </div>
      </div>

      {hub.chapters.length === 0 ? (
        <div className="ep-card-glass text-sm text-[var(--ep-navy-muted)]">
          Executive Book not built. Run{" "}
          <code className="text-xs">npm run campaign-brain:executive-book:completion</code> then{" "}
          <code className="text-xs">npm run election-plan:build</code>.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hub.chapters.map((chapter) => (
            <article key={chapter.slug} className="ep-card ep-chapter-card flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-gold)]">
                    Chapter {chapter.number}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{chapter.title}</h3>
                  <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{chapter.subtitle}</p>
                </div>
              </div>

              {chapter.metrics.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {chapter.metrics.map((m) => (
                    <span
                      key={m.label}
                      className="rounded-full bg-[var(--ep-cream)] px-2.5 py-1 text-xs font-medium text-[var(--ep-navy)]"
                    >
                      {m.label}: <strong>{m.value}</strong>
                    </span>
                  ))}
                </div>
              ) : null}

              {chapter.statusLines.length > 0 ? (
                <ul className="mt-4 space-y-1 text-sm text-[var(--ep-navy-muted)]">
                  {chapter.statusLines.map((line) => (
                    <li key={line} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ep-gold)]" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-auto pt-5">
                <Link href={chapter.href} className="ep-chapter-link">
                  Open Chapter →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
