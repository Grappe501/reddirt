import Link from "next/link";
import type { WorkbenchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import { TRUTH_STATUS_TONE } from "@/lib/campaign-events/calendar-sync/calendar-sync-truth-types";

function toneClass(tone: WorkbenchEventRow["calendarTruthTone"]): string {
  switch (tone) {
    case "navy":
      return "border-kelly-navy/25 bg-kelly-navy/10 text-kelly-navy";
    case "amber":
      return "border-amber-600/30 bg-amber-50 text-amber-950";
    case "green":
      return "border-emerald-700/25 bg-emerald-50 text-emerald-900";
    case "red":
      return "border-red-800/25 bg-red-50 text-red-900";
    case "slate":
      return "border-kelly-text/15 bg-kelly-wash text-kelly-text/70";
    default:
      return "border-kelly-text/10 bg-kelly-page text-kelly-text/65";
  }
}

export function CalendarSyncTruthPanel({ row }: { row: WorkbenchEventRow }) {
  const sync = row.calendarSync;
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-wash p-4 font-body text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${toneClass(row.calendarTruthTone)}`}>
          {row.calendarTruthLabel}
        </span>
        {row.calendarWriteDisabled ? (
          <span className="rounded-full border border-kelly-text/15 px-2 py-0.5 text-[10px] font-bold uppercase text-kelly-text/50">
            Write disabled
          </span>
        ) : null}
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-kelly-text/50">Matched by</dt>
          <dd className="font-mono">{sync.matchedBy}</dd>
        </div>
        <div>
          <dt className="text-kelly-text/50">Prisma googleSyncStatus</dt>
          <dd>{sync.prismaGoogleSyncStatus ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-kelly-text/50">Google event id</dt>
          <dd className="break-all font-mono">{sync.googleEventId ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-kelly-text/50">Last Google seen</dt>
          <dd>{sync.lastGoogleSeenAt ? new Date(sync.lastGoogleSeenAt).toLocaleString() : "—"}</dd>
        </div>
        <div>
          <dt className="text-kelly-text/50">Normalized JSON file</dt>
          <dd>{sync.normalizedJsonSourceAt ? new Date(sync.normalizedJsonSourceAt).toLocaleString() : "—"}</dd>
        </div>
        <div>
          <dt className="text-kelly-text/50">Ledger updated</dt>
          <dd>{new Date(sync.lastLedgerUpdatedAt).toLocaleString()}</dd>
        </div>
      </dl>
      {sync.syncWarning ? <p className="mt-2 text-xs text-amber-900">{sync.syncWarning}</p> : null}
      {sync.syncError ? <p className="mt-2 text-xs text-red-900">{sync.syncError}</p> : null}
      <p className="mt-3 text-[10px] text-kelly-text/50">
        Truth is computed at load time (read-only).{" "}
        <Link href="/admin/campaign-events/calendar-sync" className="font-semibold text-kelly-navy underline">
          Calendar sync dashboard →
        </Link>
      </p>
    </section>
  );
}
