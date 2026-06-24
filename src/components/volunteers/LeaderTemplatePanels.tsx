import Link from "next/link";

import { SpecialKpiGoalCard } from "@/components/election-plan/SpecialKpiGoalCard";
import type { SpecialKpiGoal } from "@/lib/election-plan/load-special-kpi-goals";
import {
  coalitionWorkbenchHref,
  type LeaderWorkbenchTemplate,
} from "@/lib/volunteers/leader-workbench-templates";

type Props = {
  templates: LeaderWorkbenchTemplate[];
  specialKpis: SpecialKpiGoal[];
};

export function LeaderTemplatePanels({ templates, specialKpis }: Props) {
  if (!templates.length && !specialKpis.length) return null;

  return (
    <div className="space-y-8">
      {specialKpis.length ? (
        <div id="special-kpis">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Special KPIs</h3>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Leadership-tracked secondary goals for your geography — updated manually until live SOS returns feed in.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {specialKpis.map((goal) => (
              <SpecialKpiGoalCard key={goal.id} goal={goal} variant="panel" />
            ))}
          </div>
        </div>
      ) : null}

      {templates.map((tpl) => (
        <div key={tpl.id} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Lead template</p>
              <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{tpl.label}</h3>
              <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{tpl.description}</p>
              {tpl.locale === "es-US" ? (
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
                  Bilingual pathways — use natural Arkansas Spanish where you choose, not literal translation.
                </p>
              ) : null}
            </div>
            {tpl.coalitionSlug ? (
              <Link
                href={coalitionWorkbenchHref(tpl.coalitionSlug)}
                className="ep-btn ep-btn-primary ep-btn-sm shrink-0"
              >
                Open coalition workbench →
              </Link>
            ) : null}
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Template sections</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {tpl.sections.map((section) => (
                <li key={section.id} className="rounded-lg bg-[var(--ep-cream)]/60 px-3 py-2 text-xs">
                  <p className="font-semibold text-[var(--ep-navy)]">{section.label}</p>
                  <p className="mt-0.5 text-[var(--ep-navy-muted)]">{section.description}</p>
                </li>
              ))}
            </ul>
          </div>

          {tpl.pathways.length ? (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Volunteer pathways</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tpl.pathways.map((path) => (
                  <li
                    key={path.key}
                    className="rounded-full border border-[var(--ep-gold)]/40 bg-white px-3 py-1 text-xs font-semibold text-[var(--ep-navy)]"
                  >
                    {path.label}
                    {path.labelEs ? (
                      <span className="ml-1 font-normal text-[var(--ep-navy-muted)]">/ {path.labelEs}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
