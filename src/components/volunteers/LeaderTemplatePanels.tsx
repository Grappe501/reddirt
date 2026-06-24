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
  interimVolunteerManager?: boolean;
  leaderDisplayName?: string;
  leaderSlug?: string;
  isSelf?: boolean;
};

function resolveTemplateHref(href: string, leaderSlug: string, isSelf?: boolean): string {
  if (isSelf || !href.includes("/leaders/me/")) return href;
  return href.replace("/election-plan/operators/leaders/me/", `/election-plan/operators/leaders/${leaderSlug}/`);
}

export function LeaderTemplatePanels({
  templates,
  specialKpis,
  interimVolunteerManager,
  leaderDisplayName,
  leaderSlug = "",
  isSelf,
}: Props) {
  if (!templates.length && !specialKpis.length && !interimVolunteerManager) return null;

  return (
    <div className="space-y-8">
      {interimVolunteerManager ? (
        <div
          className="rounded-xl border-2 border-amber-400/80 bg-amber-50 p-5 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Interim Volunteer Manager</p>
          <p className="mt-2 text-sm font-semibold text-amber-950">
            {leaderDisplayName ?? "You"} are serving as <strong>interim Volunteer Manager</strong> — temporary until we
            name a permanent replacement.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
            This workbench shows full volunteer-management functionality: field operators, leader command roster, open
            leadership slots, and intake pipeline hooks for the transition period.
          </p>
        </div>
      ) : null}
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
        <div
          key={tpl.id}
          className={`rounded-xl border bg-white p-5 shadow-sm ${
            tpl.id === "volunteer_manager"
              ? "border-[var(--ep-gold)] ring-1 ring-[var(--ep-gold)]/30"
              : tpl.id === "county_candidate_coordinator"
                ? "border-[var(--ep-navy)]/25 ring-1 ring-[var(--ep-navy)]/15"
                : tpl.id === "cluster_leader"
                  ? "border-indigo-500/30 ring-1 ring-indigo-500/20"
                  : tpl.id === "city_leader"
                    ? "border-[var(--ep-gold)]/50 ring-1 ring-[var(--ep-gold)]/35"
                    : tpl.id === "county_leader"
                      ? "border-[var(--ep-navy)]/30 ring-1 ring-[var(--ep-navy)]/20"
                      : tpl.id === "events_lead"
                      ? "border-sky-500/35 ring-1 ring-sky-500/25"
                      : tpl.id === "muslim_community_lead"
                        ? "border-teal-600/35 ring-1 ring-teal-600/25"
                        : tpl.id === "interfaith_comms_liaison"
                          ? "border-violet-500/35 ring-1 ring-violet-500/25"
                          : tpl.id === "progressives_liaison"
                            ? "border-rose-500/35 ring-1 ring-rose-500/25"
                            : tpl.id === "finance_inner_circle"
                            ? "border-amber-500/40 ring-1 ring-amber-500/30"
                            : tpl.id === "fundraising_lead"
                              ? "border-emerald-600/45 ring-1 ring-emerald-600/30"
                              : tpl.id === "fundraising_field_leader"
                ? "border-emerald-600/50 ring-1 ring-emerald-600/30"
                : tpl.id === "volunteer_leadership_team"
                  ? "border-[var(--ep-gold)]/60 ring-1 ring-[var(--ep-gold)]/25"
                  : tpl.id === "event_planner"
                    ? "border-[var(--ep-blue)] ring-1 ring-[var(--ep-blue)]/30"
                    : tpl.id === "fundraising_workbench"
                      ? "border-emerald-600/40 ring-1 ring-emerald-600/20"
                      : "border-[var(--ep-navy)]/10"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">
                {tpl.id === "volunteer_manager"
                  ? "Vol HQ template"
                  : tpl.id === "county_candidate_coordinator"
                    ? "County coordinator template"
                    : tpl.id === "cluster_leader"
                      ? "Cluster leader template"
                      : tpl.id === "city_leader"
                        ? "City leader template"
                        : tpl.id === "county_leader"
                          ? "County leader template"
                          : tpl.id === "events_lead"
                          ? "Events lead template"
                          : tpl.id === "muslim_community_lead"
                            ? "Muslim Community Lead template"
                            : tpl.id === "interfaith_comms_liaison"
                              ? "Interfaith liaison template"
                              : tpl.id === "progressives_liaison"
                                ? "Progressives liaison template"
                                : tpl.id === "finance_inner_circle"
                                ? "Finance inner circle template"
                                : tpl.id === "fundraising_lead"
                                  ? "Fundraising Lead template"
                                  : tpl.id === "fundraising_field_leader"
                    ? "Fundraising field leader template"
                    : tpl.id === "volunteer_leadership_team"
                      ? "Volunteer leadership team"
                      : tpl.id === "event_planner"
                        ? "Event planner template"
                        : tpl.id === "fundraising_workbench"
                          ? "Fundraising template"
                          : "Lead template"}
              </p>
              <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{tpl.label}</h3>
              <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{tpl.description}</p>
              {tpl.interimNotice && interimVolunteerManager ? (
                <p className="mt-2 text-xs font-medium text-amber-900">{tpl.interimNotice}</p>
              ) : null}
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

          {tpl.toolLinks?.length ? (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Vol management tools</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {tpl.toolLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={resolveTemplateHref(link.href, leaderSlug, isSelf)}
                      className="block h-full rounded-lg border border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/40 p-3 transition hover:border-[var(--ep-gold)]"
                    >
                      <p className="text-sm font-semibold text-[var(--ep-navy)]">{link.label} →</p>
                      <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{link.description}</p>
                    </Link>
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
