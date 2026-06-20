import Link from "next/link";

import type { CityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import { cityPathToVictoryHref } from "@/lib/election-plan/path-to-victory-links";
import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";

type Props = {
  brief: CityLocationBrief;
};

export function CityStrategicPlanPanel({ brief }: Props) {
  return (
    <section id="strategic-plan" className="mb-8 scroll-mt-24">
      <div className="ep-card border-l-4 border-[var(--ep-navy)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">
          City strategic plan · localized execution
        </p>
        <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">What we are trying to accomplish</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{brief.accomplishment}</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-4">
            <h3 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">How we penetrate</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{brief.penetration}</p>
          </div>
          <div className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-4">
            <h3 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Messaging frame</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{brief.messaging}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href={cityPathToVictoryHref(brief.slug)} className="ep-chapter-link font-semibold">
            Path to victory drill-down →
          </Link>
          <Link href={communityWorkbenchHref(brief.slug)} className="ep-chapter-link font-semibold">
            Community workbench →
          </Link>
        </div>
      </div>
    </section>
  );
}
