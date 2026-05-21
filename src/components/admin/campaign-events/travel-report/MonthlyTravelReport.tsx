"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WorkbenchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import {
  buildTravelLines,
  buildTravelReportSummary,
  filterTravelLines,
  travelLinesToCsv,
} from "@/lib/campaign-events/travel-report/travel-report-logic";
import type { TravelReportFilter } from "@/lib/campaign-events/travel-report/travel-report-types";
import { CountyWorkbenchLink } from "@/components/admin/CountyWorkbenchLink";
import { MonthlyTravelSummaryCard } from "@/components/admin/campaign-events/MonthlyTravelSummaryCard";
import { TravelReportSendScaffold } from "./TravelReportSendScaffold";
import { TravelCorrectionAssist } from "@/components/admin/campaign-events/travel-reimbursement/TravelCorrectionAssist";
import { eventEditHref, reviewHref, reimbursementHref, travelLogHref } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";

export function MonthlyTravelReport({
  initialRows,
  initialMonth,
}: {
  initialRows: WorkbenchEventRow[];
  initialMonth: string;
}) {
  const router = useRouter();
  const [month, setMonth] = useState(initialMonth);
  const [filter, setFilter] = useState<TravelReportFilter>("all");

  const allLines = useMemo(() => buildTravelLines(initialRows), [initialRows]);
  const filtered = useMemo(() => filterTravelLines(allLines, filter), [allLines, filter]);
  const summary = useMemo(() => buildTravelReportSummary(month, filtered), [month, filtered]);

  const downloadCsv = () => {
    const csv = travelLinesToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-travel-report-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyMonth = () => {
    router.push(`/admin/campaign-events/travel-report?month=${month}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <TravelCorrectionAssist month={month} />
      <section className="flex flex-wrap gap-2 font-body text-sm">
        <Link href={travelLogHref(month)} className="rounded-full border px-4 py-2 text-xs font-bold">
          Tentative travel log
        </Link>
        <Link href={reimbursementHref(month)} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white">
          Official reimbursement request
        </Link>
        <Link
          href={reviewHref({ month, mode: "travel_needs_approval", autostart: true })}
          className="rounded-full border px-4 py-2 text-xs font-bold"
        >
          Approve travel
        </Link>
      </section>

      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.05] p-5 font-body text-sm">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Deterministic report summary</p>
        <p className="mt-2 text-base leading-relaxed">{summary.narrative}</p>
        {summary.bullets.length ? (
          <ul className="mt-3 list-disc pl-5 text-sm text-kelly-text/70">
            {summary.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <MonthlyTravelSummaryCard
        month={month}
        monthLabel={summary.monthLabel}
        totals={summary.totals}
        reportHref={`/admin/campaign-events/travel-report?month=${month}`}
        compact
      />

      <TravelReportSendScaffold month={month} />

      <section className="flex flex-wrap items-end gap-3 rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <label className="grid gap-1 font-body text-sm">
          <span className="text-xs font-bold uppercase text-kelly-slate">Month</span>
          <input className="rounded-lg border px-3 py-2" value={month} onChange={(e) => setMonth(e.target.value)} pattern="\d{4}-\d{2}" />
        </label>
        <label className="grid gap-1 font-body text-sm">
          <span className="text-xs font-bold uppercase text-kelly-slate">Filter</span>
          <select className="rounded-lg border px-3 py-2" value={filter} onChange={(e) => setFilter(e.target.value as TravelReportFilter)}>
            <option value="all">All travel candidates</option>
            <option value="approved_only">Approved only</option>
            <option value="needs_travel_info">Needs travel info</option>
            <option value="reimbursable_only">Reimbursable only (has miles)</option>
          </select>
        </label>
        <button type="button" className="rounded-full bg-kelly-navy px-4 py-2 text-sm font-bold text-white" onClick={applyMonth}>
          Load month
        </button>
        <button type="button" className="rounded-full border border-kelly-navy/30 px-4 py-2 text-sm font-bold text-kelly-navy" onClick={downloadCsv}>
          Export CSV
        </button>
        <button type="button" disabled title="PDF not built" className="cursor-not-allowed rounded-full border px-4 py-2 text-sm font-bold text-kelly-text/40">
          Export PDF (soon)
        </button>
        <button type="button" disabled title="Email not built" className="cursor-not-allowed rounded-full border px-4 py-2 text-sm font-bold text-kelly-text/40">
          Send to Candidate (soon)
        </button>
        <button type="button" disabled title="Email not built" className="cursor-not-allowed rounded-full border px-4 py-2 text-sm font-bold text-kelly-text/40">
          Send to Campaign Manager (soon)
        </button>
        <button type="button" disabled title="Packet not built" className="cursor-not-allowed rounded-full border px-4 py-2 text-sm font-bold text-kelly-text/40">
          Attach to Reimbursement Packet (soon)
        </button>
      </section>

      <nav className="flex flex-wrap gap-2 font-body text-sm">
        <Link href="/admin/campaign-events/workbench" className="font-semibold text-kelly-navy underline">
          Workbench
        </Link>
        <Link href="/admin/campaign-events/review?month=2026-03" className="underline">
          Month review
        </Link>
        <Link href="/admin/candidate-dashboard" className="underline">
          Candidate dashboard
        </Link>
        <Link href="/admin/campaign-manager-dashboard" className="underline">
          Campaign manager dashboard
        </Link>
        <Link href="/admin/calendar-command-center/kelly" className="underline">
          Kelly cockpit
        </Link>
        <Link href="/admin/travel-ledger" className="underline">
          Travel ledger (JSON)
        </Link>
      </nav>

      <div className="overflow-x-auto rounded-2xl border border-kelly-text/10">
        <table className="w-full min-w-[1100px] border-collapse font-body text-xs">
          <thead>
            <tr className="bg-kelly-wash text-left uppercase tracking-wider text-kelly-slate">
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Event</th>
              <th className="p-2">City</th>
              <th className="p-2">County</th>
              <th className="p-2">Origin</th>
              <th className="p-2">Destination</th>
              <th className="p-2 text-right">Miles</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2 text-right">$</th>
              <th className="p-2">Review</th>
              <th className="p-2">Decision</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.recordId} className="border-t border-kelly-text/5 hover:bg-kelly-wash/60">
                <td className="whitespace-nowrap p-2">{l.dateYmd}</td>
                <td className="whitespace-nowrap p-2">{l.timeLabel}</td>
                <td className="max-w-[200px] p-2 font-semibold">
                  <Link href={`/admin/campaign-events/${l.recordId}`} className="text-kelly-navy underline">
                    {l.title}
                  </Link>
                </td>
                <td className="p-2">{l.city || "—"}</td>
                <td className="p-2">
                  <CountyWorkbenchLink countyLabel={l.county || undefined} />
                </td>
                <td className="max-w-[120px] p-2">{l.origin}</td>
                <td className="p-2">{l.destination}</td>
                <td className="p-2 text-right">{l.miles != null ? l.miles.toFixed(1) : "—"}</td>
                <td className="p-2 text-right">{l.rate.toFixed(2)}</td>
                <td className="p-2 text-right">{l.reimbursement != null ? l.reimbursement.toFixed(2) : "—"}</td>
                <td className="p-2">{l.reviewStatus}</td>
                <td className="p-2">{l.decisionLabel ?? "—"}</td>
                <td className="p-2">
                  <Link href={eventEditHref(l.recordId, month)} className="font-bold text-kelly-navy underline">
                    Edit / correct
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-kelly-navy/30 bg-kelly-navy/[0.06] font-bold">
              <td colSpan={7} className="p-3 text-right uppercase tracking-wider text-kelly-slate">
                Totals ({summary.totals.lineCount} events)
              </td>
              <td className="p-3 text-right">{summary.totals.totalMiles.toFixed(1)}</td>
              <td className="p-3 text-right">—</td>
              <td className="p-3 text-right">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(summary.totals.totalReimbursement)}
              </td>
              <td colSpan={2} className="p-3 text-xs font-normal text-kelly-text/65">
                Approved: {summary.totals.approvedMiles.toFixed(1)} mi ·{" "}
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(summary.totals.approvedReimbursement)} · Needs review:{" "}
                {summary.totals.needsReviewCount}
              </td>
            </tr>
          </tfoot>
        </table>
        {!filtered.length ? (
          <p className="p-6 text-center font-body text-sm text-kelly-text/55">No travel rows match this filter for {month}.</p>
        ) : null}
      </div>
    </div>
  );
}
