"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkbenchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import {
  collectFilterOptions,
  DEFAULT_WORKBENCH_FILTERS,
  filterWorkbenchRows,
  sortWorkbenchRows,
  type WorkbenchFilters,
  type WorkbenchSortKey,
} from "@/lib/campaign-events/workbench-query";
import { EventReviewModal } from "./EventReviewModal";
import { ApprovalPackageScaffold } from "./ApprovalPackageScaffold";
import Link from "next/link";
import { CountyWorkbenchLink } from "@/components/admin/CountyWorkbenchLink";

function formatTs(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "amber" | "green" | "red" | "navy" }) {
  const cls =
    tone === "navy"
      ? "border-kelly-navy/25 bg-kelly-navy/10 text-kelly-navy"
      : tone === "amber"
        ? "border-amber-600/30 bg-amber-50 text-amber-950"
        : tone === "green"
          ? "border-emerald-700/25 bg-emerald-50 text-emerald-900"
          : tone === "red"
            ? "border-red-800/25 bg-red-50 text-red-900"
            : "border-kelly-text/10 bg-kelly-wash text-kelly-text/70";
  return <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide ${cls}`}>{children}</span>;
}

export function CampaignEventsWorkbench({
  initialRows,
  period,
}: {
  initialRows: WorkbenchEventRow[];
  period: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [filters, setFilters] = useState<WorkbenchFilters>(DEFAULT_WORKBENCH_FILTERS);
  const [sortKey, setSortKey] = useState<WorkbenchSortKey>("date_asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reviewRecordId, setReviewRecordId] = useState<string | null>(null);
  const [packagePreviewId, setPackagePreviewId] = useState<string | null>(null);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const options = useMemo(() => collectFilterOptions(rows), [rows]);

  const filtered = useMemo(() => sortWorkbenchRows(filterWorkbenchRows(rows, filters), sortKey), [rows, filters, sortKey]);

  const selectedRows = useMemo(() => filtered.filter((r) => selectedIds.has(r.recordId)), [filtered, selectedIds]);

  const packageRow = useMemo(() => {
    const id = packagePreviewId ?? selectedRows[0]?.recordId ?? filtered[0]?.recordId;
    return filtered.find((r) => r.recordId === id) ?? null;
  }, [packagePreviewId, selectedRows, filtered]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.recordId)));
    }
  };

  const patchFilter = <K extends keyof WorkbenchFilters>(key: K, value: WorkbenchFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Batch review queue</p>
            <p className="mt-1 font-body text-sm text-kelly-text/70">
              Period <strong>{period}</strong> · Showing {filtered.length} of {rows.length} events
            </p>
          </div>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{selectedIds.size} selected</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/admin/campaign-events/review?month=${period}&mode=chronological`}
            className="rounded-full bg-kelly-navy px-4 py-2 font-body text-xs font-bold text-white"
          >
            Start Month Review
          </Link>
          <button
            type="button"
            disabled
            title="Coming after approval email + batch rules"
            className="cursor-not-allowed rounded-full border border-kelly-text/15 px-4 py-2 font-body text-xs font-bold text-kelly-text/40"
          >
            Review selected (soon)
          </button>
          <button
            type="button"
            disabled
            title="Coming after email infrastructure"
            className="cursor-not-allowed rounded-full bg-kelly-navy/30 px-4 py-2 font-body text-xs font-bold text-white/80"
          >
            Generate approval package (soon)
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] px-4 py-3 font-body text-sm">
        <strong>Campaign calendar surfaces are live.</strong>{" "}
        <Link href="/admin/campaign-calendar/timeline" className="font-semibold text-kelly-navy underline">
          Open timeline → Election Day
        </Link>
        {" · "}
        <Link href="/admin/campaign-calendar/month" className="underline">
          Month
        </Link>
        {" · "}
        <Link href="/admin/campaign-calendar/agenda" className="underline">
          Agenda
        </Link>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Filters & sort</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1 font-body text-xs">
            Date from
            <input type="date" className="rounded-lg border border-kelly-text/15 px-2 py-1.5" value={filters.dateFrom} onChange={(e) => patchFilter("dateFrom", e.target.value)} />
          </label>
          <label className="grid gap-1 font-body text-xs">
            Date to
            <input type="date" className="rounded-lg border border-kelly-text/15 px-2 py-1.5" value={filters.dateTo} onChange={(e) => patchFilter("dateTo", e.target.value)} />
          </label>
          <FilterSelect label="Event type" value={filters.eventType} onChange={(v) => patchFilter("eventType", v)} options={options.eventTypes} />
          <FilterSelect label="Event status" value={filters.eventStatus} onChange={(v) => patchFilter("eventStatus", v)} options={options.eventStatuses} />
          <FilterSelect label="Review status" value={filters.reviewStatus} onChange={(v) => patchFilter("reviewStatus", v)} options={options.reviewStatuses} />
          <FilterSelect
            label="Decision"
            value={filters.decision}
            onChange={(v) => patchFilter("decision", v)}
            options={["", "none", ...options.decisions.filter((d) => d !== "none")]}
          />
          <FilterSelect label="City contains" value={filters.city} onChange={(v) => patchFilter("city", v)} options={options.cities} freeText />
          <FilterSelect label="County contains" value={filters.county} onChange={(v) => patchFilter("county", v)} options={options.counties} freeText />
          <label className="grid gap-1 font-body text-xs">
            Sort
            <select className="rounded-lg border border-kelly-text/15 px-2 py-1.5" value={sortKey} onChange={(e) => setSortKey(e.target.value as WorkbenchSortKey)}>
              <option value="date_asc">Date ascending</option>
              <option value="date_desc">Date descending</option>
              <option value="missing_desc">Missing fields (high → low)</option>
              <option value="event_type">Event type</option>
              <option value="city">City</option>
              <option value="review_status">Review status</option>
              <option value="reimbursement_desc">Reimbursement amount</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 font-body text-xs">
          <Toggle label="Work-hours warning" checked={filters.workHoursOnly} onChange={(v) => patchFilter("workHoursOnly", v)} />
          <Toggle label="Conflict warning" checked={filters.conflictOnly} onChange={(v) => patchFilter("conflictOnly", v)} />
          <Toggle label="Has missing fields" checked={filters.missingOnly} onChange={(v) => patchFilter("missingOnly", v)} />
          <Toggle label="Has mileage / reimbursable" checked={filters.reimbursableOnly} onChange={(v) => patchFilter("reimbursableOnly", v)} />
          <Toggle label="Website intake only" checked={filters.websiteIntakeOnly} onChange={(v) => patchFilter("websiteIntakeOnly", v)} />
          <Toggle label="Tentative only" checked={filters.tentativeOnly} onChange={(v) => patchFilter("tentativeOnly", v)} />
          <Toggle label="Needs intake review" checked={filters.needsIntakeReviewOnly} onChange={(v) => patchFilter("needsIntakeReviewOnly", v)} />
          <Toggle label="Duplicate risk" checked={filters.duplicateRiskOnly} onChange={(v) => patchFilter("duplicateRiskOnly", v)} />
          <Toggle label="Intake conflict" checked={filters.intakeConflictOnly} onChange={(v) => patchFilter("intakeConflictOnly", v)} />
          <button type="button" className="font-bold text-kelly-navy underline" onClick={() => setFilters(DEFAULT_WORKBENCH_FILTERS)}>
            Clear filters
          </button>
        </div>
      </section>

      <ApprovalPackageScaffold row={packageRow} />

      <div className="overflow-x-auto rounded-2xl border border-kelly-text/10 bg-kelly-page shadow-[var(--shadow-soft)]">
        <table className="min-w-[1200px] w-full text-left font-body text-sm">
          <thead className="border-b border-kelly-text/10 bg-kelly-wash text-xs uppercase tracking-wider text-kelly-text/50">
            <tr>
              <th className="px-2 py-3">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all visible"
                />
              </th>
              <th className="px-2 py-3">Date</th>
              <th className="px-2 py-3">Time</th>
              <th className="px-3 py-3">Title</th>
              <th className="px-2 py-3">City</th>
              <th className="px-2 py-3">County</th>
              <th className="px-2 py-3">Type</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3">Review</th>
              <th className="px-2 py-3">Decision</th>
              <th className="px-2 py-3">Flags</th>
              <th className="px-2 py-3">Travel</th>
              <th className="px-2 py-3">Mi</th>
              <th className="px-2 py-3">$</th>
              <th className="px-2 py-3">Gaps</th>
              <th className="px-2 py-3">Reviewed</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.recordId}
                className={`border-t border-kelly-text/5 hover:bg-kelly-wash/80 ${packagePreviewId === row.recordId ? "bg-kelly-navy/[0.06]" : ""}`}
              >
                <td className="px-2 py-2">
                  <input type="checkbox" checked={selectedIds.has(row.recordId)} onChange={() => toggleSelect(row.recordId)} />
                </td>
                <td className="whitespace-nowrap px-2 py-2">{row.dateYmd}</td>
                <td className="whitespace-nowrap px-2 py-2">{row.timeLabel}</td>
                <td className="max-w-[200px] px-3 py-2 font-semibold">{row.calendar.title}</td>
                <td className="px-2 py-2">{row.likelyCity ?? "—"}</td>
                <td className="px-2 py-2">
                  <CountyWorkbenchLink countyLabel={row.county} />
                </td>
                <td className="px-2 py-2 text-xs">{row.classificationLabel}</td>
                <td className="px-2 py-2 text-xs">{row.eventStatus}</td>
                <td className="px-2 py-2 text-xs">{row.reviewStatus}</td>
                <td className="px-2 py-2">
                  {row.decisionLabel ? (
                    <Badge
                      tone={
                        row.decisionLabel === "Denied" || row.decisionLabel === "Personal"
                          ? "red"
                          : row.decisionLabel === "Hold" || row.decisionLabel === "Request info"
                            ? "amber"
                            : "green"
                      }
                    >
                      {row.decisionLabel}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-2 py-2">
                  <div className="flex flex-col gap-0.5">
                    {row.isWebsiteIntake ? <Badge tone="navy">Website</Badge> : null}
                    {row.rawEventStatus === "TENTATIVE" ? <Badge tone="amber">Tentative</Badge> : null}
                    {row.intakeNeedsReview ? <Badge tone="amber">Needs review</Badge> : null}
                    {row.duplicateRisk ? <Badge tone="red">Dup risk</Badge> : null}
                    {row.hasWorkHoursWarning ? <Badge tone="amber">Work</Badge> : null}
                    {row.hasConflictWarning ? <Badge tone="red">Conflict</Badge> : null}
                  </div>
                </td>
                <td className="max-w-[140px] truncate px-2 py-2 text-xs" title={row.travelLine}>
                  {row.travelLine}
                </td>
                <td className="px-2 py-2">{row.roundTripMiles != null ? row.roundTripMiles.toFixed(1) : "—"}</td>
                <td className="px-2 py-2">{row.reimbursementDisplay ?? "—"}</td>
                <td className="px-2 py-2">{row.persistedMissingCount}</td>
                <td className="whitespace-nowrap px-2 py-2 text-xs text-kelly-text/55">{formatTs(row.lastReviewedAt)}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      className="rounded-full bg-kelly-navy px-3 py-1 font-body text-xs font-bold text-white"
                      onClick={() => {
                        setReviewRecordId(row.recordId);
                        setPackagePreviewId(row.recordId);
                      }}
                    >
                      Review
                    </button>
                    <Link href={`/admin/campaign-events/${row.recordId}`} className="text-center font-body text-[10px] font-bold text-kelly-navy underline">
                      Drilldown
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? (
          <p className="p-6 text-center font-body text-sm text-kelly-text/55">No events match filters.</p>
        ) : null}
      </div>

      {reviewRecordId ? (
        <EventReviewModal
          recordId={reviewRecordId}
          onClose={() => {
            setReviewRecordId(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  freeText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  freeText?: boolean;
}) {
  if (freeText) {
    return (
      <label className="grid gap-1 font-body text-xs">
        {label}
        <input
          className="rounded-lg border border-kelly-text/15 px-2 py-1.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Filter…"
          list={`${label}-list`}
        />
        <datalist id={`${label}-list`}>
          {options.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      </label>
    );
  }
  return (
    <label className="grid gap-1 font-body text-xs">
      {label}
      <select className="rounded-lg border border-kelly-text/15 px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
