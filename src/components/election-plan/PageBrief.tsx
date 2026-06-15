import Link from "next/link";

import type { PageBrief, PageBriefLink } from "@/lib/election-plan/load-page-briefs";

type Props = {
  brief: PageBrief;
  compact?: boolean;
};

function BriefSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{label}</p>
      <div className="mt-1 text-sm text-[var(--ep-navy)]">{children}</div>
    </div>
  );
}

export function PageBrief({ brief, compact = false }: Props) {
  if (compact) {
    return (
      <div className="ep-card-glass border-l-4 border-[var(--ep-gold)] px-4 py-3 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">What&apos;s on this page</p>
        <p className="mt-1 text-[var(--ep-navy-muted)]">{brief.answers}</p>
      </div>
    );
  }

  return (
    <aside className="ep-card mb-8 border-l-4 border-[var(--ep-gold)]" aria-label="Page summary">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">What&apos;s on this page</p>
      <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{brief.title}</h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <BriefSection label="This page answers">{brief.answers}</BriefSection>
        <BriefSection label="Best for">
          <ul className="list-inside list-disc space-y-0.5 text-[var(--ep-navy-muted)]">
            {brief.bestFor.map((person) => (
              <li key={person}>{person}</li>
            ))}
          </ul>
        </BriefSection>
      </div>

      {brief.keyMetrics.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Key metrics shown</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {brief.keyMetrics.map((m) => (
              <span key={m} className="rounded-full bg-[var(--ep-cream)] px-3 py-1 text-xs font-semibold">
                {m}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {brief.relatedLinks.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--ep-border)] pt-4">
          {brief.relatedLinks.map((link: PageBriefLink) => (
            <Link key={link.href} href={link.href} className="text-xs font-semibold text-[var(--ep-navy)] hover:underline">
              {link.label} →
            </Link>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
