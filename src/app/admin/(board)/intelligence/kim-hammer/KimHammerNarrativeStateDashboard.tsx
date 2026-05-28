"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterKimHammerNarrativeStates } from "@/lib/opposition/kimHammerClientFilters";
import type {
  KimHammerNarrativeReadinessBand,
  KimHammerNarrativeStateIndex,
  KimHammerNarrativeStateRecord,
} from "@/lib/opposition/types/kimHammerNarrativeState";

type KimHammerNarrativeStateDashboardProps = {
  index: KimHammerNarrativeStateIndex;
};

const bandBadge: Record<KimHammerNarrativeReadinessBand, string> = {
  STRONG: "bg-emerald-100 text-emerald-900",
  MODERATE: "bg-sky-100 text-sky-900",
  WEAK: "bg-amber-100 text-amber-900",
  BLOCKED: "bg-rose-100 text-rose-900",
};

const classBadge: Record<KimHammerNarrativeStateRecord["narrativeClass"], string> = {
  LEGISLATIVE_PACKAGE: "bg-indigo-50 text-indigo-900",
  COUNTY_BURDEN: "bg-teal-50 text-teal-900",
  CHRONOLOGY: "bg-violet-50 text-violet-900",
  DEBATE_FRAME: "bg-slate-100 text-slate-800",
  BILL_NARRATIVE: "bg-orange-50 text-orange-900",
};

function NarrativeStateCard({ record }: { record: KimHammerNarrativeStateRecord }) {
  return (
    <article className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-kelly-navy">{record.title}</h3>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${bandBadge[record.readinessBand]}`}>
          {record.readinessBand} · {(record.readinessScore * 100).toFixed(0)}%
        </span>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${classBadge[record.narrativeClass]}`}>
          {record.narrativeClass.replaceAll("_", " ")}
        </span>
      </div>

      <p className="mt-2 text-kelly-muted">{record.description}</p>
      <p className="mt-2 rounded border border-kelly-text/10 bg-kelly-page/50 p-2 font-medium text-kelly-navy">
        {record.signal}
      </p>

      {record.blockers.length > 0 ? (
        <ul className="mt-2 list-inside list-disc text-[10px] text-rose-800">
          {record.blockers.slice(0, 4).map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-3 text-[10px] text-kelly-muted">
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Citations</p>
          <p>
            {record.citationHealthSummary.healthy} healthy · {record.citationHealthSummary.needsAttention} need review
            · {record.citationHealthSummary.stale} stale
          </p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Claims</p>
          <p>
            {record.claimReviewSummary.exportReady} export-ready · {record.claimReviewSummary.needsReview} review ·{" "}
            {record.claimReviewSummary.blocked} blocked
          </p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Export usage</p>
          <p>
            {record.exportUsageCount} event(s)
            {record.lastExportAt ? ` · last ${record.lastExportScope ?? "unknown scope"}` : " · never exported"}
          </p>
        </div>
      </div>

      <details className="mt-3 text-[10px] text-kelly-subtle">
        <summary className="cursor-pointer font-semibold text-kelly-navy">Dependency chain</summary>
        <p className="mt-1">
          <strong>Claims:</strong> {record.linkedClaimIds.join(", ") || "—"}
        </p>
        <p className="mt-1">
          <strong>Citations:</strong> {record.linkedCitationIds.join(", ") || "—"}
        </p>
        <p className="mt-1">
          <strong>Tasks:</strong> {record.linkedTaskIds.join(", ") || "—"}
        </p>
        <p className="mt-1">
          <strong>AI suggestions:</strong> {record.linkedSuggestionIds.join(", ") || "—"} (
          {record.pendingSuggestionCount} pending)
        </p>
      </details>

      {record.adminHref ? (
        <p className="mt-2">
          <Link href={record.adminHref} className="font-semibold text-kelly-navy underline">
            Open narrative module
          </Link>
        </p>
      ) : null}
    </article>
  );
}

export function KimHammerNarrativeStateDashboard({ index }: KimHammerNarrativeStateDashboardProps) {
  const [bandFilter, setBandFilter] = useState<KimHammerNarrativeReadinessBand | "ALL">("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [subjectQuery, setSubjectQuery] = useState("");

  const filtered = useMemo(
    () =>
      filterKimHammerNarrativeStates(index, {
        band: bandFilter,
        narrativeClass: classFilter === "ALL" ? undefined : classFilter,
        subjectQuery,
      }),
    [index, bandFilter, classFilter, subjectQuery],
  );

  const narrativeClasses = [...new Set(index.narratives.map((row) => row.narrativeClass))];

  return (
    <div>
      <section className="mb-4 rounded-xl border border-indigo-200/50 bg-indigo-50/40 p-4 text-xs text-indigo-950">
        <p className="font-bold uppercase tracking-wider">NSI-1 · Read-only composition</p>
        <p className="mt-1">
          Narrative state is computed from governed claims, citations, tasks, exports, and AI suggestions. No
          mutations occur on this page — operators act in V2-A through V3-E workflows.
        </p>
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Narratives tracked</p>
          <p className="mt-1 text-xl font-bold">{index.narrativeCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Strong</p>
          <p className="mt-1 text-xl font-bold">{index.bandCounts.STRONG}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Blocked / weak</p>
          <p className="mt-1 text-xl font-bold">{index.bandCounts.BLOCKED + index.bandCounts.WEAK}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Moderate</p>
          <p className="mt-1 text-xl font-bold">{index.bandCounts.MODERATE}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Filtered</p>
          <p className="mt-1 text-xl font-bold">{filtered.length}</p>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Filters</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Readiness band</span>
            <select
              value={bandFilter}
              onChange={(event) => setBandFilter(event.target.value as KimHammerNarrativeReadinessBand | "ALL")}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All</option>
              <option value="STRONG">Strong</option>
              <option value="MODERATE">Moderate</option>
              <option value="WEAK">Weak</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Class</span>
            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All</option>
              {narrativeClasses.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Search</span>
            <input
              type="search"
              value={subjectQuery}
              onChange={(event) => setSubjectQuery(event.target.value)}
              placeholder="narrative, claim, citation, signal"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.map((record) => (
          <NarrativeStateCard key={record.narrativeId} record={record} />
        ))}
      </section>
    </div>
  );
}
