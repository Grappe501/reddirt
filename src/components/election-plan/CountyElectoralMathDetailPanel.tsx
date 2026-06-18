import Link from "next/link";

import { ExecutiveBookMarkdown } from "@/components/election-plan/executive-book/ExecutiveBookMarkdown";
import {
  COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS,
  countyDropOffHref,
  countyRegistrationDashboardHref,
} from "@/lib/election-plan/load-county-electoral-math-markdown";

type Props = {
  countySlug: string;
  countyName: string;
  kind: "drop-off" | "registration-dashboard";
  markdown: string;
};

const KIND_META = {
  "drop-off": {
    eyebrow: "Executive Book crosswalk · Part II · Chapter 4",
    title: "Democratic drop-off analysis",
    executiveHint: "Statewide electoral math and Lane 2 recovery doctrine",
    executiveHref: COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.pathToVictory,
    executiveLabel: "Executive Book · Path to Victory",
    secondaryHref: COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.countyVictoryTargets,
    secondaryLabel: "Executive Book · County victory targets",
    siblingHref: (slug: string) => countyRegistrationDashboardHref(slug),
    siblingLabel: "Chapter 5 · Registration dashboard",
  },
  "registration-dashboard": {
    eyebrow: "Executive Book crosswalk · Part II · Chapter 5",
    title: "Registration opportunity dashboard",
    executiveHint: "Lane 3 expansion and Help 10 Participate doctrine",
    executiveHref: COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.voterEngagement,
    executiveLabel: "Executive Book · Voter Engagement",
    secondaryHref: COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.registrationGoalsOs,
    secondaryLabel: "Registration goals · Election Plan OS",
    siblingHref: (slug: string) => countyDropOffHref(slug),
    siblingLabel: "Chapter 4 · Drop-off analysis",
  },
} as const;

export function CountyElectoralMathDetailPanel({ countySlug, countyName, kind, markdown }: Props) {
  const meta = KIND_META[kind];

  return (
    <section>
      <Link
        href={`/election-plan/counties/${countySlug}`}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← {countyName} County playbook
      </Link>

      <header className="mt-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">{meta.eyebrow}</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">
          {countyName} County — {meta.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{meta.executiveHint}</p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Executive Book and related chapters">
        <Link href={meta.executiveHref} className="ep-card px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]">
          {meta.executiveLabel} →
        </Link>
        <Link href={meta.secondaryHref} className="ep-card px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]">
          {meta.secondaryLabel} →
        </Link>
        <Link href={meta.siblingHref(countySlug)} className="ep-card px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]">
          {meta.siblingLabel} →
        </Link>
        <Link
          href={COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.countyStrategy}
          className="ep-card px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
        >
          Executive Book · County strategy →
        </Link>
      </nav>

      <div className="ep-card ep-chapter-article">
        <ExecutiveBookMarkdown markdown={markdown} />
      </div>
    </section>
  );
}

export function CountyPlaybookExecutiveJumpPanel({ countySlug, countyName }: { countySlug: string; countyName: string }) {
  return (
    <nav
      className="mb-6 rounded-xl border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-4"
      aria-label="Executive Book and electoral math"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">Executive Book &amp; electoral math</p>
      <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
        County playbook detail links — integrated with Election Plan and shareable Executive Book chapters.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={countyDropOffHref(countySlug)} className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]">
          Ch. 4 · Drop-off · {countyName}
        </Link>
        <Link
          href={countyRegistrationDashboardHref(countySlug)}
          className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
        >
          Ch. 5 · Registration dashboard · {countyName}
        </Link>
        <Link href={COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.pathToVictory} className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]">
          Executive Book · Path to Victory
        </Link>
        <Link href={COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.voterEngagement} className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]">
          Executive Book · Voter Engagement
        </Link>
      </div>
    </nav>
  );
}
