import Link from "next/link";
import type { ReactNode } from "react";

import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import type { DrillDownLink } from "@/lib/election-plan/debatePrepDayDrillDown";

export function ElectionPlanDrillDownShell({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  children,
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="ep-classification">Internal · {eyebrow}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />
          <header className="mb-8">
            <Link href={backHref} className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
              ← {backLabel}
            </Link>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">{eyebrow}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{title}</h1>
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">{description}</p>
            ) : null}
          </header>
          {children}
        </div>
      </div>
    </>
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
          <h2 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{section.title}</h2>
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
    <article className="ep-card mt-6 border-emerald-200 bg-emerald-50/40 p-5 text-sm">
      <h2 className="text-xs font-bold uppercase text-emerald-900">{title}</h2>
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
      <h2 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Go deeper</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-block rounded-full border border-[var(--ep-navy)] px-3 py-1 text-xs font-bold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
            >
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
    <Link href={href} className="mt-2 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
      {children}
    </Link>
  );
}
