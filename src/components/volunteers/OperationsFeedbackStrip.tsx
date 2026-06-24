import Link from "next/link";

type Props = {
  leaderInitials: string;
  fieldEntryCount?: number;
  className?: string;
};

/** Volunteer-tier feedback loop — shows how field work rolls up to command. */
export function OperationsFeedbackStrip({ leaderInitials, fieldEntryCount = 0, className }: Props) {
  return (
    <div
      className={`rounded-xl border border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/40 p-4 text-xs ${className ?? ""}`}
    >
      <p className="font-bold uppercase tracking-wide text-[var(--ep-gold)]">Feedback loop ↑</p>
      <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">
        Your field log ({fieldEntryCount} entries tagged <span className="font-mono font-bold">{leaderInitials}</span>)
        rolls up to leader command, operators, and the campaign manager board.
      </p>
      <ol className="mt-3 space-y-1.5 text-[var(--ep-navy)]">
        <li>
          1. Log here →{" "}
          <Link href="#field-log" className="font-semibold text-[var(--ep-blue)] hover:underline">
            Field log
          </Link>
        </li>
        <li>
          2. Leader dashboard →{" "}
          <Link
            href="/election-plan/operators/leader-dashboard"
            className="font-semibold text-[var(--ep-blue)] hover:underline"
          >
            My Five & follow-ups
          </Link>
        </li>
        <li>
          3. Command heatmap →{" "}
          <Link
            href="/election-plan/operators/leaders/command"
            className="font-semibold text-[var(--ep-blue)] hover:underline"
          >
            Leader command
          </Link>
        </li>
        <li>
          4. CM board →{" "}
          <Link href="/admin/campaign-manager-dashboard" className="font-semibold text-[var(--ep-blue)] hover:underline">
            Campaign manager
          </Link>
        </li>
      </ol>
    </div>
  );
}
