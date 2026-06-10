import Link from "next/link";
import type { CountyMissionStack } from "@/lib/victory-os/types";

/** Read-only county mission stack for admin county page (Sprint 2). */
export function CountyVictoryMissionWidget({ stack }: { stack: CountyMissionStack | null }) {
  if (!stack) {
    return (
      <section className="mt-10 rounded-2xl border border-kelly-text/10 bg-kelly-page/40 p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Victory OS missions</h2>
        <p className="mt-2 font-body text-sm text-kelly-muted">
          No mission stack synced yet.{" "}
          <Link href="/admin/mission-brief?view=missions" className="font-semibold text-kelly-navy underline">
            Sync from Path to Victory
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Victory OS mission stack</h2>
        <Link href="/admin/mission-brief?view=missions" className="font-body text-xs font-semibold text-kelly-navy underline">
          Open Path to Victory →
        </Link>
      </div>
      <dl className="mt-4 space-y-3 font-body text-sm">
        {stack.longTerm ? (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-kelly-muted">Long-term</dt>
            <dd className="mt-0.5 text-kelly-text">{stack.longTerm.title}</dd>
          </div>
        ) : null}
        {stack.monthly ? (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-kelly-muted">Monthly</dt>
            <dd className="mt-0.5 text-kelly-text">{stack.monthly.title}</dd>
          </div>
        ) : null}
        {stack.weekly ? (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-kelly-muted">This week</dt>
            <dd className="mt-0.5 font-semibold text-kelly-navy">{stack.weekly.title}</dd>
          </div>
        ) : null}
      </dl>
      {stack.dailyTasks.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t border-kelly-text/10 pt-3 font-body text-xs text-kelly-text/85">
          {stack.dailyTasks.slice(0, 5).map((t) => (
            <li key={t.id}>
              {t.periodKey} · {t.title}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
