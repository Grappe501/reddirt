import { DashboardDisclosure } from "@/components/dashboard/vos/DashboardDisclosure";
import { VosUniversalTaskList } from "@/components/dashboard/vos/VosUniversalTaskList";
import { UNIVERSAL_WEEKLY_TASKS } from "@/lib/dashboard/mock-data";
import type { Team } from "@/types/dashboard";
import {
  inferVosMaturityFromTeam,
  VOS_MATURITY_LEVEL_TITLES,
  VOS_MATURITY_RUBRIC,
} from "@/lib/volunteer-ops/vos-team-maturity";
import { selectMaturityTaskBuckets, UNIVERSAL_WEEKLY_MATURITY_TASKS } from "@/lib/volunteer-ops/vos-maturity-tasks";

function TaskCol({
  eyebrow,
  items,
  emptyLabel,
}: {
  eyebrow: string;
  items: { id: string; title: string; description?: string }[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-xl border border-kelly-text/10 bg-kelly-page/80 p-4 md:p-5">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">{eyebrow}</p>
      <ul className="mt-3 space-y-3">
        {items.length === 0 ? (
          <li className="font-body text-sm text-kelly-text/60">{emptyLabel}</li>
        ) : (
          items.map((t) => (
            <li key={t.id} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2.5">
              <p className="font-body text-sm font-semibold text-kelly-deep">{t.title}</p>
              {t.description ? <p className="mt-1 font-body text-xs text-kelly-text/75">{t.description}</p> : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function VosMaturityTaskDeck({ team }: { team: Team }) {
  const level = inferVosMaturityFromTeam(team);
  const title = VOS_MATURITY_LEVEL_TITLES[level];
  const { neededNow, comingUp, nextAfter } = selectMaturityTaskBuckets(UNIVERSAL_WEEKLY_MATURITY_TASKS, level);

  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-5 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/60">Team maturity</p>
          <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">
            Level {level} · {title}
          </h3>
          <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/80">
            Only a few universal tasks show here so dashboards stay calm. When{" "}
            <span className="font-semibold text-kelly-deep">OPENAI_API_KEY</span> is set server-side, automation can re-rank and
            rephrase next actions — see{" "}
            <span className="font-mono text-[11px] text-kelly-text/70">docs/vos-ai-orchestration-plan.md</span>.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <TaskCol eyebrow="Needed now" items={neededNow} emptyLabel="Nothing queued — great job." />
        <TaskCol eyebrow="Coming up" items={comingUp} emptyLabel="You’re ahead on weekly rhythm." />
        <TaskCol
          eyebrow="Next after that"
          items={nextAfter}
          emptyLabel="No locked tasks — you may be ready to level up."
        />
      </div>

      <DashboardDisclosure summary={`Maturity rubric · what Level ${level} includes`} className="mt-6 border-kelly-text/15 bg-white/90 shadow-none">
        <p className="font-body text-xs text-kelly-text/75">
          Levels are a guide. Upstream staff may adjust based on geography and capacity.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 font-body text-sm text-kelly-text/85">
          {VOS_MATURITY_RUBRIC[level].map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </DashboardDisclosure>

      <DashboardDisclosure summary="All universal weekly tasks (full checklist)" className="mt-3 border-kelly-text/15 bg-white/90 shadow-none">
        <VosUniversalTaskList title="Universal weekly tasks" tasks={UNIVERSAL_WEEKLY_TASKS} cadenceLabel="Weekly · everyone" />
      </DashboardDisclosure>
    </section>
  );
}
