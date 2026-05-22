import Link from "next/link";
import type { CalendarSyncDashboardSnapshot } from "@/lib/campaign-events/calendar-sync/load-calendar-sync-dashboard";
import {
  LEDGER_CALENDAR_TRUTH_STATUSES,
  TRUTH_STATUS_LABELS,
  TRUTH_STATUS_TONE,
} from "@/lib/campaign-events/calendar-sync/calendar-sync-truth-types";

function toneBorder(tone: (typeof TRUTH_STATUS_TONE)[keyof typeof TRUTH_STATUS_TONE]): string {
  switch (tone) {
    case "navy":
      return "border-kelly-navy/25";
    case "amber":
      return "border-amber-600/30";
    case "green":
      return "border-emerald-700/25";
    case "red":
      return "border-red-800/25";
    default:
      return "border-kelly-text/10";
  }
}

export function CalendarSyncDashboard({ snapshot }: { snapshot: CalendarSyncDashboardSnapshot }) {
  const { period, jsonFreshness, countsByTruth } = snapshot;

  return (
    <div className="flex flex-col gap-6 font-body text-sm">
      <section className="rounded-2xl border border-amber-700/25 bg-amber-50 px-4 py-3 text-amber-950">
        <strong>Read-only sprint.</strong> {snapshot.writeDisabledNotice}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Google connection</h2>
          <p className="mt-2">
            OAuth configured: <strong>{snapshot.googleConfigured ? "Yes" : "No"}</strong>
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Client ID: {snapshot.googleEnv.hasClientId ? "set" : "missing"}</li>
            <li>Client secret: {snapshot.googleEnv.hasClientSecret ? "set" : "missing"}</li>
            <li>Redirect URI: {snapshot.googleEnv.hasRedirectUri ? "set" : "missing"}</li>
          </ul>
          <Link href="/admin/calendar-command-center/google-setup" className="mt-3 inline-block text-xs font-bold text-kelly-navy underline">
            Google setup page →
          </Link>
        </div>

        <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Normalized JSON</h2>
          <p className="mt-2">
            File: <code className="text-xs">{jsonFreshness.path}</code>
          </p>
          <p className="mt-1">
            Last modified: {jsonFreshness.lastModifiedAt ? new Date(jsonFreshness.lastModifiedAt).toLocaleString() : "—"}
          </p>
          <p className="mt-1">
            Rows: <strong>{jsonFreshness.totalRows}</strong> · Months: {jsonFreshness.monthsCovered.join(", ") || "—"}
          </p>
          {jsonFreshness.isStale ? (
            <p className="mt-2 text-xs font-semibold text-amber-900">{jsonFreshness.staleReason}</p>
          ) : (
            <p className="mt-2 text-xs text-emerald-800">File present and within freshness window.</p>
          )}
          {jsonFreshness.currentMonthMissing ? (
            <p className="mt-1 text-xs text-red-900">Warning: period {period} has no rows in normalized JSON.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Kelly Google lanes</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <LaneCard label="Tentative" lane={snapshot.kellyLanes.tentative} />
          <LaneCard label="Confirmed" lane={snapshot.kellyLanes.confirmed} />
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">
          Ledger rows by sync truth ({period})
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEDGER_CALENDAR_TRUTH_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/admin/campaign-events/workbench?month=${period}&sync=${status}`}
              className={`rounded-full border px-3 py-1 text-xs font-bold ${toneBorder(TRUTH_STATUS_TONE[status])}`}
            >
              {TRUTH_STATUS_LABELS[status]}: {countsByTruth[status]}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Link href={`/admin/campaign-events/workbench?month=${period}`} className="font-bold text-kelly-navy underline">
            Open workbench
          </Link>
          <Link href={`/admin/campaign-events/review?month=${period}&mode=chronological`} className="underline">
            Month review
          </Link>
          <Link href="/admin/campaign-calendar/timeline" className="underline">
            Campaign calendar
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Read-only refresh commands</h2>
        <p className="mt-1 text-xs text-kelly-muted">Run from <code>RedDirt/</code> on an operator machine with DB + Google OAuth configured.</p>
        <ul className="mt-3 space-y-3">
          {snapshot.readOnlyCommands.map((c) => (
            <li key={c.command} className="rounded-lg border border-kelly-text/10 bg-kelly-wash px-3 py-2">
              <p className="font-semibold text-kelly-navy">{c.label}</p>
              <code className="mt-1 block text-xs">{c.command}</code>
              <p className="mt-1 text-xs text-kelly-muted">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <WarningTable title="Stale rows" rows={snapshot.staleRows} period={period} />
      <WarningTable title="Conflict rows" rows={snapshot.conflictRows} period={period} />
    </div>
  );
}

function LaneCard({
  label,
  lane,
}: {
  label: string;
  lane: {
    id: string;
    name: string;
    externalCalendarId: string;
    syncEnabled: boolean;
    hasRefreshToken: boolean;
  } | null;
}) {
  if (!lane) {
    return (
      <div className="rounded-lg border border-dashed border-kelly-text/20 p-3 text-xs text-kelly-muted">
        {label}: not configured — run <code>npm run calendar:google:ensure</code>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash p-3 text-xs">
      <p className="font-bold text-kelly-navy">{lane.name}</p>
      <p className="mt-1 font-mono text-[10px]">{lane.externalCalendarId}</p>
      <p className="mt-1">
        Sync enabled: {lane.syncEnabled ? "yes" : "no"} · OAuth refresh: {lane.hasRefreshToken ? "yes" : "no"}
      </p>
    </div>
  );
}

function WarningTable({
  title,
  rows,
  period,
}: {
  title: string;
  rows: { recordId: string; calendar: { title: string }; dateYmd: string; calendarSync: { syncWarning: string | null } }[];
  period: string;
}) {
  if (!rows.length) return null;
  return (
    <section className="rounded-2xl border border-red-800/20 bg-red-50/50 p-4">
      <h2 className="font-heading text-sm font-bold uppercase text-red-900">{title} ({rows.length})</h2>
      <ul className="mt-2 max-h-48 overflow-y-auto text-xs">
        {rows.slice(0, 12).map((r) => (
          <li key={r.recordId} className="border-t border-red-900/10 py-1">
            <Link href={`/admin/campaign-events/${r.recordId}?month=${period}`} className="font-semibold underline">
              {r.dateYmd} · {r.calendar.title}
            </Link>
            {r.calendarSync.syncWarning ? <span className="text-red-900/80"> — {r.calendarSync.syncWarning}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
