"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkbenchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import {
  buildTravelLogLines,
  filterTravelLogLines,
  travelLogLinesToCsv,
  type TravelLogFilter,
} from "@/lib/campaign-events/travel-reimbursement/travel-log-logic";
import { reviewHref } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";
import { TravelCorrectionAssist } from "@/components/admin/campaign-events/travel-reimbursement/TravelCorrectionAssist";
import { computeTravelTotals, buildTravelLines } from "@/lib/campaign-events/travel-report/travel-report-logic";

const FILTERS: Array<{ id: TravelLogFilter; label: string }> = [
  { id: "all", label: "All travel candidates" },
  { id: "needs_approval", label: "Needs approval" },
  { id: "needs_city_county", label: "Needs city/county" },
  { id: "needs_mileage", label: "Needs mileage" },
  { id: "unreviewed", label: "Unreviewed" },
  { id: "approved", label: "Approved" },
  { id: "denied", label: "Denied" },
  { id: "hold", label: "Hold / needs info" },
  { id: "reimbursable_only", label: "Reimbursable only" },
];

function fmtUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function TentativeTravelLog({
  initialRows,
  initialMonth,
  initialFilter,
}: {
  initialRows: WorkbenchEventRow[];
  initialMonth: string;
  initialFilter: string;
}) {
  const router = useRouter();
  const [month, setMonth] = useState(initialMonth);
  const [filter, setFilter] = useState<TravelLogFilter>((initialFilter as TravelLogFilter) || "all");

  const lines = useMemo(() => {
    const all = buildTravelLogLines(initialRows, month);
    return filterTravelLogLines(all, filter);
  }, [initialRows, month, filter]);

  const totals = useMemo(() => computeTravelTotals(buildTravelLines(initialRows)), [initialRows]);

  const downloadCsv = () => {
    const csv = travelLogLinesToCsv(lines);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tentative-travel-log-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyMonth = () => router.push(`/admin/campaign-events/travel-log?month=${month}&filter=${filter}`);

  if (!initialRows.length) {
    return (
      <section className="rounded-2xl border border-dashed border-amber-700/30 bg-amber-50/50 p-8 text-center font-body text-sm">
        <p className="font-heading text-lg font-bold text-amber-950">No calendar rows found for this month</p>
        <p className="mt-2 text-kelly-muted">
          If May (or another month) has no rows in <code className="text-xs">calendar-items.normalized.json</code>, the log stays
          empty — we do not fabricate events. Run{" "}
          <code className="text-xs">npm run campaign-events:seed-month -- {month}</code> after JSON is updated.
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TravelCorrectionAssist month={month} />
      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-4 font-body text-sm print:hidden">
        <p>
          <strong>Tentative travel log</strong> — every travel-related event before final reimbursement. Approve or deny in the
          review wizard; approved rows flow to the{" "}
          <Link href={`/admin/campaign-events/reimbursement?month=${month}`} className="font-semibold text-kelly-navy underline">
            official reimbursement request
          </Link>
          .
        </p>
        <p className="mt-2 text-xs text-kelly-muted">
          {totals.lineCount} travel candidates · {totals.needsReviewCount} need approval · {fmtUsd(totals.totalReimbursement)} estimated
        </p>
      </section>

      <section className="flex flex-wrap items-end gap-3 rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 print:hidden">
        <label className="grid gap-1 text-sm">
          <span className="text-xs font-bold uppercase text-kelly-slate">Month</span>
          <input className="rounded-lg border px-3 py-2" value={month} onChange={(e) => setMonth(e.target.value)} pattern="\d{4}-\d{2}" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-xs font-bold uppercase text-kelly-slate">Filter</span>
          <select className="rounded-lg border px-3 py-2" value={filter} onChange={(e) => setFilter(e.target.value as TravelLogFilter)}>
            {FILTERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="rounded-full bg-kelly-navy px-4 py-2 text-sm font-bold text-white" onClick={applyMonth}>
          Apply
        </button>
        <button type="button" className="rounded-full border px-4 py-2 text-sm font-bold" onClick={downloadCsv}>
          Export CSV
        </button>
      </section>

      <section className="flex flex-wrap gap-2 print:hidden">
        <Link
          href={reviewHref({ month, mode: "travel_needs_approval", autostart: true })}
          className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
        >
          Review travel needing approval
        </Link>
        <Link
          href={reviewHref({ month, focus: "missing_mileage", autostart: true })}
          className="rounded-full border px-4 py-2 text-xs font-bold"
        >
          Review missing mileage
        </Link>
        <Link href={reviewHref({ month, mode: "chronological" })} className="rounded-full border px-4 py-2 text-xs font-bold">
          Review full month
        </Link>
        <Link
          href={`/admin/campaign-events/review?month=${month}&mode=conflicts&autostart=1`}
          className="rounded-full border px-4 py-2 text-xs font-bold"
        >
          Review conflicts
        </Link>
      </section>

      <div className="overflow-x-auto rounded-2xl border border-kelly-text/10 bg-kelly-page">
        <table className="w-full min-w-[1200px] border-collapse font-body text-xs">
          <thead>
            <tr className="bg-kelly-wash text-left uppercase tracking-wider text-kelly-slate">
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Event</th>
              <th className="p-2">City</th>
              <th className="p-2">County</th>
              <th className="p-2">ZIP</th>
              <th className="p-2">Origin → Dest</th>
              <th className="p-2">Miles</th>
              <th className="p-2">Reimb.</th>
              <th className="p-2">Travel status</th>
              <th className="p-2">Missing</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.recordId} className="border-t border-kelly-text/5 align-top hover:bg-kelly-wash/40">
                <td className="p-2 whitespace-nowrap">
                  {l.dateYmd}
                  <br />
                  <span className="text-kelly-subtle">{l.dayOfWeek}</span>
                </td>
                <td className="p-2">{l.timeLabel}</td>
                <td className="p-2 font-semibold max-w-[200px]">{l.title}</td>
                <td className="p-2">{l.city || "—"}</td>
                <td className="p-2">{l.county || "—"}</td>
                <td className="p-2">{l.zip || "—"}</td>
                <td className="p-2 text-kelly-muted">
                  {l.origin} → {l.destination}
                </td>
                <td className="p-2">{l.miles ?? "—"}</td>
                <td className="p-2">{l.reimbursement != null ? fmtUsd(l.reimbursement) : "—"}</td>
                <td className="p-2">
                  <span
                    className={`rounded-full px-2 py-0.5 font-bold ${
                      l.rawDecision === "approved"
                        ? "bg-emerald-50 text-emerald-900"
                        : l.rawDecision === "denied"
                          ? "bg-red-50 text-red-900"
                          : "bg-amber-50 text-amber-950"
                    }`}
                  >
                    {l.travelStatus}
                  </span>
                </td>
                <td className="p-2 text-kelly-muted">{l.missingFields.join(", ") || "—"}</td>
                <td className="p-2 print:hidden">
                  <Link href={l.editHref} className="font-bold text-kelly-navy underline">
                    Edit / correct
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-kelly-text/10 px-4 py-2 text-xs text-kelly-subtle">{lines.length} rows shown</p>
      </div>
    </div>
  );
}
