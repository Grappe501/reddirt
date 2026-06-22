import Link from "next/link";
import type { ReactNode } from "react";

import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import type { DrillDownLink } from "@/lib/election-plan/debatePrepDayDrillDown";

export function ElectionPlanDrillDownShell({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  pageSummary,
  children,
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description?: string;
  pageSummary?: string;
  children: ReactNode;
}) {
  return (
    <div className="ep-chapter-body py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <ElectionPlanDebatePrepSubnav compact />
        <header className="ep-page-header">
          <Link href={backHref} className="ep-page-back">
            ← {backLabel}
          </Link>
          <p className="ep-page-eyebrow">{eyebrow}</p>
          <h1 className="ep-page-title">{title}</h1>
          {description ? <p className="ep-page-description">{description}</p> : null}
        </header>
        {pageSummary ? <KellyPageSummary summary={pageSummary} /> : null}
        {children}
      </div>
    </div>
  );
}

export function ElectionPlanDrillDownSections({
  sections,
}: {
  sections: Array<{ title: string; body: string }>;
}) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <article key={section.title} className="ep-card p-5 text-sm">
          <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">{section.title}</h2>
          <p className="mt-3 leading-relaxed text-[var(--ep-navy-muted)]">{section.body}</p>
        </article>
      ))}
    </div>
  );
}

export function ElectionPlanDrillDownSteps({
  title,
  steps,
}: {
  title: string;
  steps: string[];
}) {
  if (!steps.length) return null;
  return (
    <article className="ep-card ep-study-practice mt-6 p-5 text-sm">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-success)]">{title}</h2>
      <ol className="mt-3 list-inside list-decimal space-y-2 text-[var(--ep-navy-muted)]">
        {steps.map((step) => (
          <li key={step.slice(0, 48)}>{step}</li>
        ))}
      </ol>
    </article>
  );
}

export function ElectionPlanDrillDownRelated({ links }: { links: DrillDownLink[] }) {
  if (!links.length) return null;
  return (
    <section className="ep-card mt-6 p-5 text-sm">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Go deeper</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="ep-link-chip">
              {link.label} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ElectionPlanDrillDownLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="mt-2 inline-block text-xs font-bold text-[var(--ep-blue)] hover:underline">
      {children}
    </Link>
  );
}
