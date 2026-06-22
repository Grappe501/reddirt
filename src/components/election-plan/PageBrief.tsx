import Link from "next/link";

import type { PageBrief, PageBriefLink } from "@/lib/election-plan/load-page-briefs";
import { EpInsightPanel } from "@/components/election-plan/ui/EpInsightPanel";

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
      <EpInsightPanel label="What's on this page" variant="compact">
        <p className="text-[var(--ep-navy-muted)]">{brief.answers}</p>
      </EpInsightPanel>
    );
  }

  return (
    <aside className="ep-insight mb-8" aria-label="Page summary">
      <p className="ep-insight-label">What&apos;s on this page</p>
      <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{brief.title}</h2>
      <div className="ep-insight-body mt-4 grid gap-4 lg:grid-cols-2">
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
              <span key={m} className="ep-link-chip">
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
