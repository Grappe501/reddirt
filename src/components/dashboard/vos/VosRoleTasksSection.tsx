import Link from "next/link";

import type { VolunteerRole } from "@/types/dashboard";
import { EVENTS_ROLE_TASKS_PLACEHOLDER, POWER_OF_FIVE_VR_ROLE_TASKS_PLACEHOLDER } from "@/lib/dashboard/role-task-placeholders";
import {
  SOCIAL_MEDIA_MONTHLY_GOALS,
  SOCIAL_MEDIA_WEEKLY_TASKS,
  SOCIAL_MEDIA_KPIS,
} from "@/lib/dashboard/mock-data";
import { VosKpiMiniGrid } from "@/components/dashboard/vos/VosKpiSummary";

type Props = {
  role: VolunteerRole;
};

export function VosRoleTasksSection({ role }: Props) {
  if (role === "social-media") {
    return (
      <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/60">Your role · social media</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Weekly required tasks</h3>
        <ol className="mt-4 list-decimal space-y-3 pl-6 font-body text-sm leading-relaxed text-kelly-text/85">
          {SOCIAL_MEDIA_WEEKLY_TASKS.map((t, i) => (
            <li key={t.id} className="pl-1">
              <strong className="text-kelly-deep">{i + 1}. {t.title}</strong>
              {t.description ? <span className="mt-1 block text-kelly-text/75">{t.description}</span> : null}
            </li>
          ))}
        </ol>
        <h4 className="mt-8 font-heading text-base font-bold text-kelly-navy">Monthly goals</h4>
        <ul className="mt-3 space-y-2 font-body text-sm text-kelly-text/85">
          {SOCIAL_MEDIA_MONTHLY_GOALS.map((t) => (
            <li key={t.id} className="flex gap-2">
              <span aria-hidden>·</span>
              <span>
                {t.title}
                {t.description ? <span className="block text-xs text-kelly-text/70">{t.description}</span> : null}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-text/50">Social KPIs (demo)</p>
          <VosKpiMiniGrid kpis={SOCIAL_MEDIA_KPIS} />
        </div>
        <p className="mt-6 font-body text-xs text-kelly-text/65">
          Local post ideas:{" "}
          <Link href="/volunteer/resources" className="font-semibold text-kelly-navy underline">
            Volunteer resource library
          </Link>{" "}
          (team dashboard Resources tab in Phase 1).
        </p>
      </section>
    );
  }

  if (role === "not-sure" || role === "general") {
    return (
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-fog/50 p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Your role</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">
          {role === "general" ? "General member" : "Lane not assigned yet"}
        </h3>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          When you pick Events, Social, or Power of 5 / VR, this panel will show your weekly and monthly checklist. Use{" "}
          <Link href="/volunteer#pick-your-lane" className="font-semibold text-kelly-navy underline">
            onboarding
          </Link>{" "}
          or ask your upstream contact.
        </p>
      </section>
    );
  }

  if (role === "events") {
    return (
      <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Your role · events</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Framework (next round)</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          Daily, weekly, monthly tasks and KPIs for Events coordinators will ship in the next iteration. Placeholder:{" "}
          <code className="rounded bg-white/80 px-1 text-[11px]">role-task-placeholders.ts</code>
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-kelly-deep/90 p-3 font-mono text-[10px] text-white/90">
          {JSON.stringify(EVENTS_ROLE_TASKS_PLACEHOLDER, null, 2)}
        </pre>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-6 md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Your role · Power of 5 / VR</p>
      <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Framework (next round)</h3>
      <p className="mt-2 font-body text-sm text-kelly-text/75">
        Daily, weekly, monthly relational and registration tasks will ship next. Placeholder:{" "}
        <code className="rounded bg-white/80 px-1 text-[11px]">role-task-placeholders.ts</code>
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-kelly-deep/90 p-3 font-mono text-[10px] text-white/90">
        {JSON.stringify(POWER_OF_FIVE_VR_ROLE_TASKS_PLACEHOLDER, null, 2)}
      </pre>
    </section>
  );
}
