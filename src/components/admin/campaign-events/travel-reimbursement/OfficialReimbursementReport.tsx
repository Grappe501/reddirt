"use client";

import Link from "next/link";
import type { OfficialReimbursementReport as Report } from "@/lib/campaign-events/travel-reimbursement/reimbursement-report";
import {
  reimbursementReportToCsv,
  reimbursementReportToJson,
} from "@/lib/campaign-events/travel-reimbursement/reimbursement-report";
import {
  REIMBURSEMENT_STATUS_LABELS,
  type ReimbursementMonthStatusContext,
} from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status-shared";
import { eventEditHref, reviewHref } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";
import {
  REIMBURSEMENT_CAMPAIGN_NAME,
  REIMBURSEMENT_CANDIDATE_NAME,
} from "@/lib/campaign-events/constants";
import { ReimbursementMonthChecklist } from "./ReimbursementMonthChecklist";
import { ReimbursementStatusPanel } from "./ReimbursementStatusPanel";
import { TravelCorrectionAssist } from "./TravelCorrectionAssist";
import { useAgentObservation } from "@/components/agents/AgentObservationTracker";

function fmtUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const STATUS_STYLE: Record<string, string> = {
  draft: "border-amber-700/30 bg-amber-50 text-amber-950",
  needs_review: "border-orange-700/30 bg-orange-50 text-orange-950",
  ready: "border-emerald-700/30 bg-emerald-50 text-emerald-950",
  finalized: "border-kelly-navy/30 bg-kelly-navy/10 text-kelly-navy",
  empty: "border-kelly-text/20 bg-kelly-wash text-kelly-text/60",
};

const APPENDIX_GROUP_ORDER = [
  { key: "denied", label: "Denied" },
  { key: "personal", label: "Personal" },
  { key: "duplicate", label: "Duplicate" },
  { key: "hold", label: "On hold" },
  { key: "request_info", label: "Request info" },
  { key: "pending_approval", label: "Pending approval" },
  { key: "missing_data", label: "Missing data" },
] as const;

export function OfficialReimbursementReportView({
  report,
  statusContext,
}: {
  report: Report;
  statusContext: ReimbursementMonthStatusContext;
}) {
  const { track } = useAgentObservation();
  const print = () => {
    track("print_clicked", { month: report.month, reimbursementStatus: statusContext.effectiveStatus });
    window.print();
  };
  const effectiveStatus = statusContext.effectiveStatus;

  const downloadCsv = () => {
    track("download_clicked", { format: "csv", month: report.month });
    const blob = new Blob([reimbursementReportToCsv(report)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `official-travel-reimbursement-${report.month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    track("download_clicked", { format: "json", month: report.month });
    const blob = new Blob([reimbursementReportToJson(report)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `official-travel-reimbursement-${report.month}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (report.derivedStatus === "empty") {
    return (
      <section className="rounded-2xl border border-dashed p-8 text-center font-body text-sm">
        <p className="font-heading text-lg font-bold">No travel data for {report.monthLabel}</p>
        <p className="mt-2 text-kelly-text/65">{report.statusNote}</p>
      </section>
    );
  }

  const appendixGroups = APPENDIX_GROUP_ORDER.map((g) => ({
    ...g,
    lines: report.excludedLines.filter((x) => x.category === g.key),
  })).filter((g) => g.lines.length > 0);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .reimbursement-print-root, .reimbursement-print-root * { visibility: visible; }
          .reimbursement-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0.5in;
            font-size: 10pt;
          }
          .print\\:hidden { display: none !important; }
          .reimbursement-print-table { font-size: 9pt; line-height: 1.35; }
          .reimbursement-print-table th, .reimbursement-print-table td { padding: 4px 6px; vertical-align: top; }
          .reimbursement-print-purpose { max-width: 2.4in; word-break: break-word; }
          .break-before-page { break-before: page; page-break-before: always; }
        }
      `}</style>

      <div className="flex flex-col gap-6">
        <ReimbursementStatusPanel ctx={statusContext} />
        <ReimbursementMonthChecklist ctx={statusContext} />
        <TravelCorrectionAssist month={report.month} />

        <section className="flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={print} className="rounded-full bg-kelly-navy px-4 py-2 text-sm font-bold text-white">
            Print official request
          </button>
          <button type="button" onClick={downloadCsv} className="rounded-full border px-4 py-2 text-sm font-bold">
            Download CSV
          </button>
          <button type="button" onClick={downloadJson} className="rounded-full border px-4 py-2 text-sm font-bold">
            Download audit JSON
          </button>
          <span
            className="cursor-not-allowed rounded-full border px-4 py-2 text-sm font-bold text-kelly-text/45"
            title="Server PDF not built — use Print official request"
          >
            PDF export coming next
          </span>
          {effectiveStatus === "needs_review" || effectiveStatus === "draft" ? (
            <Link
              href={reviewHref({ month: report.month, mode: "travel_needs_approval", autostart: true })}
              className="rounded-full border border-amber-700/40 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-950"
            >
              Finish approvals →
            </Link>
          ) : null}
        </section>

        <div className="reimbursement-print-root flex flex-col gap-6">
          <header className="rounded-2xl border-2 border-kelly-navy/30 bg-white p-6 print:rounded-none print:border-2">
            <p className="font-body text-xs font-bold uppercase tracking-widest text-kelly-slate">
              Official travel reimbursement request
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold print:text-xl">{REIMBURSEMENT_CAMPAIGN_NAME}</h1>
            <p className="mt-1 font-body text-lg print:text-base">Candidate: {REIMBURSEMENT_CANDIDATE_NAME}</p>
            <dl className="mt-4 grid gap-2 font-body text-sm sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
              <div>
                <dt className="text-xs font-bold text-kelly-slate">Month</dt>
                <dd className="font-semibold">{report.monthLabel}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-kelly-slate">Prepared date</dt>
                <dd>{report.preparedDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-kelly-slate">Mileage rate</dt>
                <dd>${report.rate.toFixed(2)} / mile</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-kelly-slate">Reimbursement status</dt>
                <dd>
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLE[effectiveStatus] ?? STATUS_STYLE.draft}`}
                  >
                    {REIMBURSEMENT_STATUS_LABELS[effectiveStatus]}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-kelly-slate">Prepared by</dt>
                <dd>Campaign operations</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-kelly-slate">Reviewed by</dt>
                <dd>{statusContext.stored?.reviewedBy ?? "—"}</dd>
              </div>
            </dl>
            <p className="mt-3 font-body text-xs text-kelly-text/70">{report.statusNote}</p>
            <p className="mt-2 font-body text-[10px] text-kelly-text/50 print:block">
              Paid for by Kelly Grappe for Secretary of State. Internal campaign ledger — not a FIN-1 filing packet.
            </p>
          </header>

          <section className="rounded-xl border border-kelly-text/15 bg-kelly-wash/30 p-4 font-body text-sm print:border print:bg-white">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Totals</h2>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs text-kelly-text/55">Approved reimbursable events</dt>
                <dd className="font-bold">{report.totals.approvedEventCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-kelly-text/55">Total miles</dt>
                <dd className="font-bold">{report.totals.totalMiles.toFixed(1)}</dd>
              </div>
              <div>
                <dt className="text-xs text-kelly-text/55">Total reimbursement</dt>
                <dd className="font-bold text-lg">{fmtUsd(report.totals.totalReimbursement)}</dd>
              </div>
              <div>
                <dt className="text-xs text-kelly-text/55">Excluded / needs review</dt>
                <dd className="font-bold">
                  {report.totals.excludedCount} excluded · {report.totals.needsReviewCount} need attention
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold">Approved reimbursable travel</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-kelly-text/15">
              <table className="reimbursement-print-table w-full border-collapse font-body text-xs">
                <thead>
                  <tr className="bg-kelly-wash text-left uppercase text-kelly-slate">
                    <th className="p-2">Date</th>
                    <th className="p-2">Event / purpose</th>
                    <th className="p-2">City</th>
                    <th className="p-2">County</th>
                    <th className="p-2">Origin</th>
                    <th className="p-2">Destination</th>
                    <th className="p-2 text-right">Miles</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2">Notes</th>
                    <th className="p-2 print:hidden">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {report.approvedLines.map((l) => (
                    <tr key={l.recordId} className="border-t border-kelly-text/10">
                      <td className="p-2 whitespace-nowrap">{l.dateYmd}</td>
                      <td className="reimbursement-print-purpose p-2 font-semibold">{l.purpose}</td>
                      <td className="p-2">{l.city}</td>
                      <td className="p-2">{l.county}</td>
                      <td className="p-2">{l.origin}</td>
                      <td className="p-2">{l.destination}</td>
                      <td className="p-2 text-right">{l.miles?.toFixed(1)}</td>
                      <td className="p-2 text-right">${l.rate.toFixed(2)}</td>
                      <td className="p-2 text-right font-semibold">{l.reimbursement != null ? fmtUsd(l.reimbursement) : "—"}</td>
                      <td className="p-2 max-w-[120px] text-kelly-text/60">{l.notes || "—"}</td>
                      <td className="p-2 print:hidden">
                        <Link href={eventEditHref(l.recordId, report.month)} className="font-bold text-kelly-navy underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-kelly-navy/30 bg-kelly-navy/[0.06] font-bold">
                    <td colSpan={6} className="p-3 text-right uppercase text-xs tracking-wider">
                      Totals ({report.totals.approvedEventCount} events)
                    </td>
                    <td className="p-3 text-right">{report.totals.totalMiles.toFixed(1)}</td>
                    <td className="p-3" />
                    <td className="p-3 text-right text-base">{fmtUsd(report.totals.totalReimbursement)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {appendixGroups.length > 0 ? (
            <section className="break-before-page">
              <h2 className="font-heading text-lg font-bold">Appendix — excluded from reimbursement total</h2>
              <p className="mt-1 font-body text-xs text-kelly-text/55">
                Retained for audit. Personal, duplicate, denied, and pending rows are not included in the total above.
              </p>
              {appendixGroups.map((group) => (
                <div key={group.key} className="mt-4">
                  <h3 className="font-heading text-sm font-bold text-kelly-slate">
                    {group.label} ({group.lines.length})
                  </h3>
                  <table className="mt-2 w-full border-collapse font-body text-xs">
                    <thead>
                      <tr className="text-left uppercase text-kelly-slate">
                        <th className="p-2">Date</th>
                        <th className="p-2">Event</th>
                        <th className="p-2">City</th>
                        <th className="p-2">County</th>
                        <th className="p-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.lines.map((x) => (
                        <tr key={x.recordId} className="border-t border-kelly-text/10">
                          <td className="p-2">{x.dateYmd}</td>
                          <td className="p-2">{x.title}</td>
                          <td className="p-2">{x.city}</td>
                          <td className="p-2">{x.county}</td>
                          <td className="p-2">{x.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </section>
          ) : null}

          <section className="mt-8 grid gap-8 border-t border-kelly-text/20 pt-8 sm:grid-cols-2 print:mt-12">
            <div>
              <p className="font-body text-xs font-bold uppercase text-kelly-slate">Candidate signature</p>
              <div className="mt-10 border-b-2 border-kelly-text/50" />
              <p className="mt-2 font-body text-sm">{REIMBURSEMENT_CANDIDATE_NAME}</p>
              <p className="font-body text-xs text-kelly-text/55">Date: _______________</p>
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase text-kelly-slate">Campaign manager / treasurer review</p>
              <div className="mt-10 border-b-2 border-kelly-text/50" />
              <p className="mt-2 font-body text-sm">Reviewed by: _______________</p>
              <p className="font-body text-xs text-kelly-text/55">Date: _______________</p>
            </div>
          </section>

          <footer className="border-t border-kelly-text/15 pt-4 font-body text-[10px] text-kelly-text/45">
            Paid for by Kelly Grappe for Secretary of State · Generated from Campaign Event Ledger · {report.month} ·
            Print date {new Date().toISOString().slice(0, 10)}
          </footer>
        </div>
      </div>
    </>
  );
}
