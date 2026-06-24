import Link from "next/link";

import { createTaskFromSignalAction, runFeedbackLoopsAction } from "@/app/election-plan/operators/ops-work-actions";
import {
  OPERATIONS_COMMAND_STACK,
  type OperationsCommandTierId,
} from "@/lib/volunteers/operations-command-ladder";
import type { OperationsFeedbackRollup } from "@/lib/volunteers/load-operations-feedback-rollup";

function severityDot(severity: "ok" | "watch" | "action"): string {
  if (severity === "action") return "bg-red-500";
  if (severity === "watch") return "bg-amber-400";
  return "bg-emerald-500";
}

type Props = {
  rollup: OperationsFeedbackRollup;
  activeTierId?: OperationsCommandTierId;
  showCandidateLink?: boolean;
  surface?: "election-plan" | "admin";
  returnTo?: string;
};

function surfaceStyles(surface: "election-plan" | "admin") {
  if (surface === "admin") {
    return {
      border: "border-kelly-navy/15",
      title: "text-kelly-navy",
      muted: "text-kelly-muted",
      gold: "text-kelly-slate",
      cream: "bg-kelly-fog/40",
      activeRing: "ring-kelly-gold/40",
      chip: "bg-kelly-navy text-white",
      link: "text-kelly-navy",
    };
  }
  return {
    border: "border-[var(--ep-navy)]/15",
    title: "text-[var(--ep-navy)]",
    muted: "text-[var(--ep-navy-muted)]",
    gold: "text-[var(--ep-gold)]",
    cream: "bg-[var(--ep-cream)]/60",
    activeRing: "ring-[var(--ep-gold)]/40",
    chip: "bg-[var(--ep-navy)] text-white",
    link: "text-[var(--ep-blue)]",
  };
}

export function OperationsCommandLadderPanel({
  rollup,
  activeTierId,
  showCandidateLink = true,
  surface = "election-plan",
  returnTo = "/election-plan/operators/my-work",
}: Props) {
  const s = surfaceStyles(surface);
  const signalsByTier = new Map<string, typeof rollup.signals>();
  for (const signal of rollup.signals) {
    const list = signalsByTier.get(signal.tierId) ?? [];
    list.push(signal);
    signalsByTier.set(signal.tierId, list);
  }

  return (
    <section className={`rounded-xl border ${s.border} bg-white shadow-sm`}>
      <div className={`border-b ${s.border} px-5 py-4`}>
        <p className={`text-xs font-bold uppercase tracking-wide ${s.gold}`}>Operations command ladder</p>
        <h2 className={`mt-1 font-heading text-lg font-bold ${s.title}`}>
          Campaign manager → volunteer · feedback loops up
        </h2>
        <p className={`mt-2 max-w-3xl text-sm ${s.muted}`}>
          Management starts at the campaign manager board. Commands flow down through operators and leader
          workbenches; field log, intake, and roster signals bubble back up every tier.
        </p>
        {!rollup.dbAvailable ? (
          <p className="mt-2 text-xs text-amber-800">
            Database not configured — live feedback counts need <code className="text-[10px]">DATABASE_URL</code>.
          </p>
        ) : (
          <form action={runFeedbackLoopsAction} className="mt-3">
            <input type="hidden" name="returnTo" value={returnTo} />
            <button
              type="submit"
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${surface === "admin" ? "bg-kelly-navy text-white hover:opacity-90" : "bg-[var(--ep-gold)] text-[var(--ep-navy)] hover:opacity-90"}`}
            >
              Run feedback loops
            </button>
            <span className={`ml-2 text-xs ${s.muted}`}>
              Auto-escalate overdue tasks, 14-day quiet leaders, stale intake, and action-tier signals.
            </span>
          </form>
        )}
        {showCandidateLink ? (
          <p className={`mt-2 text-xs ${s.muted}`}>
            Kelly&apos;s calm home:{" "}
            <Link href="/admin/candidate-dashboard" className={`font-semibold ${s.link} hover:underline`}>
              Candidate dashboard
            </Link>{" "}
            — decisions only; Steve runs full ops on the CM board.
          </p>
        ) : null}
      </div>

      <div className="divide-y divide-[var(--ep-navy)]/10">
        {OPERATIONS_COMMAND_STACK.map((tier, index) => {
          const isActive = tier.id === activeTierId;
          const tierSignals = signalsByTier.get(tier.id) ?? [];
          const isLast = index === OPERATIONS_COMMAND_STACK.length - 1;

          return (
            <div
              key={tier.id}
              className={`px-5 py-4 ${isActive ? `${s.cream} ring-1 ring-inset ${s.activeRing}` : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full ${s.chip} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide`}>
                      {tier.roleLabel}
                    </span>
                    {isActive ? (
                      <span className="rounded-full bg-[var(--ep-gold)]/25 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ep-navy)]">
                        You are here
                      </span>
                    ) : null}
                  </div>
                  <h3 className={`mt-2 font-heading text-base font-bold ${s.title}`}>
                    <Link href={tier.dashboardHref} className="hover:underline">
                      {tier.label} →
                    </Link>
                  </h3>
                  <p className={`mt-1 text-sm ${s.muted}`}>{tier.description}</p>
                </div>
                {!isLast ? (
                  <div className="hidden shrink-0 text-center sm:block" aria-hidden>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-gold)]">↑ feedback</p>
                    <p className="text-lg leading-none text-[var(--ep-navy-muted)]">↥</p>
                  </div>
                ) : null}
              </div>

              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-lg bg-[var(--ep-cream)]/50 px-3 py-2">
                  <dt className="font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Receives ↑</dt>
                  <dd className="mt-1 text-[var(--ep-navy)]">{tier.feedbackReceives}</dd>
                </div>
                <div className="rounded-lg bg-[var(--ep-cream)]/30 px-3 py-2">
                  <dt className="font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Commands ↓</dt>
                  <dd className="mt-1 text-[var(--ep-navy)]">{tier.commandsDown}</dd>
                </div>
              </dl>

              {tierSignals.length ? (
                <ul className="mt-3 flex flex-col gap-2">
                  {tierSignals.map((signal) => (
                    <li
                      key={signal.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--ep-navy)]/8 bg-white px-3 py-2"
                    >
                      <Link
                        href={signal.href}
                        className="inline-flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-[var(--ep-navy)] hover:underline"
                        title={signal.description}
                      >
                        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${severityDot(signal.severity)}`} />
                        {signal.label}: {signal.count}
                      </Link>
                      {signal.openOpsTask ? (
                        <Link
                          href={returnTo}
                          className="shrink-0 rounded-full border border-emerald-600/30 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-900"
                          title={signal.openOpsTask.title}
                        >
                          Task open
                        </Link>
                      ) : signal.taskAssignable ? (
                        <form action={createTaskFromSignalAction} className="shrink-0">
                          <input type="hidden" name="signalId" value={signal.id} />
                          <input type="hidden" name="count" value={String(signal.count)} />
                          <input type="hidden" name="tierId" value={signal.tierId} />
                          <input type="hidden" name="severity" value={signal.severity} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <button
                            type="submit"
                            className="rounded-full bg-[var(--ep-gold)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy)] hover:opacity-90"
                          >
                            Assign task
                          </button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {tier.childLinks?.length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tier.childLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded-full border border-dashed border-[var(--ep-navy)]/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)] hover:border-[var(--ep-gold)] hover:text-[var(--ep-navy)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
