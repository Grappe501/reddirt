import type { LeaderFieldLogContext } from "@/lib/volunteers/build-leader-field-log-context";

type Props = {
  fieldLog: LeaderFieldLogContext;
  lastLoggedAt: string | null;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "No logs yet";
  try {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "Recently";
  }
}

export function LeaderOperatorIdentityBar({ fieldLog, lastLoggedAt }: Props) {
  return (
    <div className="rounded-xl border border-[var(--ep-gold)]/40 bg-[var(--ep-cream)]/70 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-gold)]">Operator identity · synced</p>
          <p className="mt-1 text-sm text-[var(--ep-navy)]">
            <span className="font-mono font-bold text-[var(--ep-blue)]">{fieldLog.operatorInitials}</span>
            {" · "}
            {fieldLog.countyName} County
            {fieldLog.citySlug ? " (city scope)" : ""}
          </p>
        </div>
        <div className="text-right text-xs text-[var(--ep-navy-muted)]">
          <p className="font-semibold uppercase tracking-wide">Last field log</p>
          <p className="mt-0.5 tabular-nums">{formatWhen(lastLoggedAt)}</p>
        </div>
      </div>
    </div>
  );
}
