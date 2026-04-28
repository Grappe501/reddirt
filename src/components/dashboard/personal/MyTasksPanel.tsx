import type { ConversationDemo, FollowUpTaskDemo } from "@/lib/power-of-5/personal-dashboard-demo";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { CountySourceBadge } from "@/components/county/dashboard/countyDashboardFormat";
import { cn } from "@/lib/utils";

function priorityPill(p: FollowUpTaskDemo["priority"]) {
  const map = {
    high: "border-rose-200 bg-rose-50 text-rose-950",
    medium: "border-amber-200 bg-amber-50 text-amber-950",
    low: "border-kelly-text/15 bg-kelly-page text-kelly-text/80",
  } as const;
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide", map[p])}>
      {p}
    </span>
  );
}

type Props = {
  followUps: FollowUpTaskDemo[];
  conversations: ConversationDemo[];
  className?: string;
};

/**
 * Follow-up queue plus recent conversations — core of the volunteer preview (demo).
 */
export function MyTasksPanel({ followUps, conversations, className }: Props) {
  const open = followUps.filter((t) => !t.done);

  return (
    <section className={className}>
      <CountySectionHeader
        overline="This week"
        title="Missions — follow-ups & conversations"
        description={
          <>
            Lightweight queue for relational missions — no voter data, no automated dialer.{" "}
            <CountySourceBadge source="demo" note="Tasks and log lines are static demo content" />
          </>
        }
      />

      <div className={cn(countyDashboardCardClass, "mt-4")}>
        <p className="font-heading text-base font-bold text-kelly-navy">Open follow-ups</p>
        <p className="mt-0.5 text-sm text-kelly-text/70">{open.length} items in demo queue</p>
        <ul className="mt-4 space-y-3">
          {open.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-kelly-text/10 bg-kelly-page/90 p-3 sm:flex sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {priorityPill(t.priority)}
                  <span className="text-[11px] font-semibold text-kelly-text/55">Due: {t.dueLabel}</span>
                </div>
                <p className="mt-2 font-medium text-kelly-navy">{t.title}</p>
                <p className="mt-0.5 text-sm text-kelly-text/70">With {t.relatedPerson}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={cn(countyDashboardCardClass, "mt-4")}>
        <p className="font-heading text-base font-bold text-kelly-navy">Recent conversations</p>
        <p className="mt-0.5 text-sm text-kelly-text/70">Latest listen-first touches (demo log)</p>
        <ul className="mt-4 space-y-3">
          {conversations.map((c) => (
            <li key={c.id} className="rounded-xl border border-kelly-navy/10 bg-kelly-navy/[0.02] p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-kelly-navy">{c.withPerson}</p>
                <span className="text-[11px] text-kelly-text/55">{c.whenLabel}</span>
              </div>
              <p className="mt-2 text-sm text-kelly-text/80">{c.summary}</p>
              <p className="mt-2 text-xs font-semibold text-kelly-slate">
                Outcome: <span className="font-normal text-kelly-text/75">{c.outcomeLabel}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
