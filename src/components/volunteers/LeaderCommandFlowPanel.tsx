import Link from "next/link";

import type { LeaderWorkPagesPayload } from "@/lib/volunteers/resolve-leader-work-pages";

type Props = {
  workPages: LeaderWorkPagesPayload;
  leaderInitials: string;
  fieldEntryCount?: number;
};

/** Upstream command in + downstream feedback out — on every leader workbench v4. */
export function LeaderCommandFlowPanel({ workPages, leaderInitials, fieldEntryCount = 0 }: Props) {
  const { commandUp, commandDown } = workPages;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Direction from above ↑</p>
        {commandUp ? (
          <>
            <p className="mt-2 text-sm font-semibold text-[var(--ep-navy)]">
              <Link href={commandUp.href} className="text-[var(--ep-blue)] hover:underline">
                {commandUp.label}
              </Link>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{commandUp.receives}</p>
          </>
        ) : (
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Connect with operators hub for statewide priorities.</p>
        )}
        <ul className="mt-3 space-y-1 text-xs">
          {workPages.byCategory.command.slice(0, 4).map((p) => (
            <li key={p.id}>
              <Link href={p.href} className="font-semibold text-[var(--ep-blue)] hover:underline">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-blue)]">Your team & feedback ↓</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">
          Field log entries tagged <span className="font-mono font-bold">{leaderInitials}</span>:{" "}
          <strong>{fieldEntryCount}</strong>. My Five and team roster updates roll up to leader command and operators.
        </p>
        {commandDown ? (
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{commandDown.sends}</p>
        ) : null}
        <ul className="mt-3 space-y-1 text-xs">
          <li>
            <Link href="#power-of-5" className="font-semibold text-[var(--ep-blue)] hover:underline">
              Power of 5 roster
            </Link>
          </li>
          <li>
            <Link href="#field-log" className="font-semibold text-[var(--ep-blue)] hover:underline">
              Field log
            </Link>
          </li>
          <li>
            <Link href="/election-plan/operators/projects" className="font-semibold text-[var(--ep-blue)] hover:underline">
              Campaign projects
            </Link>
          </li>
          {commandDown ? (
            <li>
              <Link href={commandDown.href} className="font-semibold text-[var(--ep-blue)] hover:underline">
                {commandDown.label}
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
