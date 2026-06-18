import Link from "next/link";

import {
  CH4_READING_GUIDE,
  CH5_READING_GUIDE,
  COUNTY_TIER_GUIDANCE,
  COUNTY_WEEKLY_OPERATOR_FLOW,
  MOBILIZE_COUNTY_PLAYBOOK_STEPS,
} from "@/lib/election-plan/county-playbook-operator-guide";
import {
  countyDropOffHref,
  countyRegistrationDashboardHref,
} from "@/lib/election-plan/load-county-electoral-math-markdown";

type Props = {
  countySlug: string;
  countyName: string;
  tier: string;
};

export function CountyPlaybookOperatorGuidePanel({ countySlug, countyName, tier }: Props) {
  const tierHint = COUNTY_TIER_GUIDANCE[tier] ?? COUNTY_TIER_GUIDANCE.D;

  return (
    <section className="mb-8 ep-card border-2 border-[var(--ep-gold)]/25 bg-[var(--ep-cream)]/40 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Operator guide · {countyName} County</p>
      <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">How to work this county page</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{tierHint}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Read in this order</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-[var(--ep-navy-muted)]">
            <li>Overview stats &amp; victory target</li>
            <li>
              <Link href="#playbook" className="font-semibold underline">
                Chapter 9 playbook prose
              </Link>
            </li>
            <li>
              <Link href={countyDropOffHref(countySlug)} className="font-semibold underline">
                Chapter 4 drop-off
              </Link>{" "}
              — Lane 2 recovery
            </li>
            <li>
              <Link href={countyRegistrationDashboardHref(countySlug)} className="font-semibold underline">
                Chapter 5 registration dashboard
              </Link>{" "}
              — Lane 3 pace
            </li>
            <li>
              <Link href="#field" className="font-semibold underline">
                Field &amp; Mobilize
              </Link>{" "}
              — log activity and calendar
            </li>
            <li>
              <Link href="#leadership" className="font-semibold underline">
                Leadership &amp; party intel
              </Link>
            </li>
          </ol>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">This week (5-step flow)</p>
          <ul className="mt-2 space-y-2 text-sm text-[var(--ep-navy-muted)]">
            {COUNTY_WEEKLY_OPERATOR_FLOW.map((f) => (
              <li key={f.step}>
                <span className="font-semibold text-[var(--ep-navy)]">{f.step}. {f.title}</span>
                {" — "}
                {f.detail}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <details className="mt-4 rounded-lg border border-[var(--ep-border)] bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-[var(--ep-navy)]">Mobilize county playbook (6 steps)</summary>
        <ol className="mt-3 list-inside list-decimal space-y-1 text-[var(--ep-navy-muted)]">
          {MOBILIZE_COUNTY_PLAYBOOK_STEPS.map((s) => (
            <li key={s.slice(0, 48)}>{s}</li>
          ))}
        </ol>
      </details>

      <details className="mt-3 rounded-lg border border-[var(--ep-border)] bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-[var(--ep-navy)]">How to read Ch. 4 &amp; Ch. 5</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase text-rose-800">Chapter 4 · Drop-off</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
              {CH4_READING_GUIDE.map((line) => (
                <li key={line.slice(0, 40)}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-indigo-800">Chapter 5 · Registration</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
              {CH5_READING_GUIDE.map((line) => (
                <li key={line.slice(0, 40)}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </section>
  );
}
