import Link from "next/link";

import {
  buildNorrisCoalitionDrillLinks,
  getNorrisCoalitionStatewideOneLiner,
} from "@/lib/election-plan/debate-prep-norris-coalition-drilldown";
import { NORRIS_KELLY_ALIGNMENT_FRAME } from "@/lib/election-plan/debate-prep-norris-coalition-copy";

function formatGopPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

type Props = {
  dayLabel: "Day 2" | "Day 3";
  accent?: "indigo" | "emerald";
};

export function ElectionPlanNorrisCoalitionDrillPanel({ dayLabel, accent = "indigo" }: Props) {
  const links = buildNorrisCoalitionDrillLinks(6);
  const border = accent === "emerald" ? "border-emerald-300" : "border-indigo-300";
  const chip = accent === "emerald" ? "bg-emerald-100 text-emerald-900" : "bg-indigo-100 text-indigo-900";

  if (!links.length) return null;

  return (
    <section className={`ep-card mb-6 border-2 ${border} p-5`}>
      <p className="text-[10px] font-bold uppercase text-[var(--ep-gold)]">
        {dayLabel} drill-down · Norris coalition map
      </p>
      <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">Where Hammer is weak — county numbers</h3>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{getNorrisCoalitionStatewideOneLiner()}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy)]">{NORRIS_KELLY_ALIGNMENT_FRAME}</p>

      <ol className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--ep-border)] p-3 text-sm transition hover:border-[var(--ep-gold)]"
            >
              <span>
                <span className="font-bold text-[var(--ep-navy)]">{link.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--ep-navy-muted)]">{link.teaser}</span>
              </span>
              <span className="flex items-center gap-2">
                {link.norrisRunoffPct != null ? (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${chip}`}>
                    Norris {formatGopPct(link.norrisRunoffPct)}
                  </span>
                ) : null}
                <span className="text-xs font-semibold text-[var(--ep-navy-muted)]">{link.minutes} min →</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <Link
        href="/election-plan?tab=countyPlaybooks"
        className="mt-3 inline-block text-xs font-semibold text-[var(--ep-navy)] hover:underline"
      >
        All 75 county playbooks with GOP primary + runoff cards →
      </Link>
    </section>
  );
}
