"use client";

import { useMemo, useState } from "react";

export type EvidenceCommandClaimRow = {
  id: string;
  indexSource: string;
  title: string;
  text: string;
  reviewStatus: string;
  publicationTier: string;
  legalRisk: string;
  externalUseStatus: string;
  exportReady: boolean;
  blocked: boolean;
  reviewNeeded: boolean;
  safetyBlockers: string[];
};

export type EvidenceCommandTaskRow = {
  id: string;
  rank: number | null;
  title: string;
  taskStatus: string;
  owner: string;
  priority: string;
  confidenceNeed: string;
  externalReadiness: string;
};

type EvidenceCommandFiltersProps = {
  claims: EvidenceCommandClaimRow[];
  tasks: EvidenceCommandTaskRow[];
};

const ALL = "ALL";

function claimDispositionBadge(claim: EvidenceCommandClaimRow): { label: string; className: string } {
  if (claim.exportReady) {
    return { label: "Export-ready", className: "bg-emerald-100 text-emerald-800" };
  }
  if (claim.blocked) {
    return { label: "Blocked", className: "bg-rose-100 text-rose-800" };
  }
  if (claim.reviewNeeded) {
    return { label: "Needs review", className: "bg-amber-100 text-amber-800" };
  }
  return { label: "Internal / caution", className: "bg-slate-100 text-slate-800" };
}

export function EvidenceCommandFilters({ claims, tasks }: EvidenceCommandFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewStatus, setReviewStatus] = useState(ALL);
  const [publicationTier, setPublicationTier] = useState(ALL);
  const [legalRisk, setLegalRisk] = useState(ALL);
  const [taskStatus, setTaskStatus] = useState(ALL);
  const [exportReadyOnly, setExportReadyOnly] = useState(false);

  const reviewStatusOptions = useMemo(
    () => [ALL, ...new Set(claims.map((claim) => claim.reviewStatus))].sort(),
    [claims],
  );
  const publicationTierOptions = useMemo(
    () => [ALL, ...new Set(claims.map((claim) => claim.publicationTier))].sort(),
    [claims],
  );
  const legalRiskOptions = useMemo(
    () => [ALL, ...new Set(claims.map((claim) => claim.legalRisk))].sort(),
    [claims],
  );
  const taskStatusOptions = useMemo(
    () => [ALL, ...new Set(tasks.map((task) => task.taskStatus))].sort(),
    [tasks],
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (exportReadyOnly && !claim.exportReady) return false;
      if (reviewStatus !== ALL && claim.reviewStatus !== reviewStatus) return false;
      if (publicationTier !== ALL && claim.publicationTier !== publicationTier) return false;
      if (legalRisk !== ALL && claim.legalRisk !== legalRisk) return false;

      if (!normalizedSearch) return true;

      const haystack = [
        claim.title,
        claim.text,
        claim.reviewStatus,
        claim.publicationTier,
        claim.legalRisk,
        claim.externalUseStatus,
        claim.indexSource,
        claim.exportReady ? "export-ready" : "not-export-ready",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [claims, exportReadyOnly, reviewStatus, publicationTier, legalRisk, normalizedSearch]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (taskStatus !== ALL && task.taskStatus !== taskStatus) return false;

      if (!normalizedSearch) return true;

      const haystack = [
        task.title,
        task.taskStatus,
        task.owner,
        task.priority,
        task.confidenceNeed,
        task.externalReadiness,
        task.rank?.toString() ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [tasks, taskStatus, normalizedSearch]);

  function clearFilters() {
    setSearchQuery("");
    setReviewStatus(ALL);
    setPublicationTier(ALL);
    setLegalRisk(ALL);
    setTaskStatus(ALL);
    setExportReadyOnly(false);
  }

  const hasActiveFilters =
    normalizedSearch.length > 0 ||
    reviewStatus !== ALL ||
    publicationTier !== ALL ||
    legalRisk !== ALL ||
    taskStatus !== ALL ||
    exportReadyOnly;

  return (
    <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
      <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Search and filter</h2>
      <p className="mt-1 text-kelly-muted">
        Read-only client-side filtering across governed claims and KH-3B retrieval tasks.
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Search</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Claim text, task title, owner, external readiness…"
            className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-3 py-2 text-xs text-kelly-text"
          />
        </label>

        <label className="flex items-end gap-2">
          <input
            id="export-ready-only"
            type="checkbox"
            checked={exportReadyOnly}
            onChange={(event) => setExportReadyOnly(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="pb-2 text-kelly-muted">Export-ready claims only</span>
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Review status</span>
          <select
            value={reviewStatus}
            onChange={(event) => setReviewStatus(event.target.value)}
            className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
          >
            {reviewStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option === ALL ? "All review statuses" : option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Publication tier</span>
          <select
            value={publicationTier}
            onChange={(event) => setPublicationTier(event.target.value)}
            className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
          >
            {publicationTierOptions.map((option) => (
              <option key={option} value={option}>
                {option === ALL ? "All tiers" : option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Legal risk</span>
          <select
            value={legalRisk}
            onChange={(event) => setLegalRisk(event.target.value)}
            className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
          >
            {legalRiskOptions.map((option) => (
              <option key={option} value={option}>
                {option === ALL ? "All legal risk levels" : option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Task status</span>
          <select
            value={taskStatus}
            onChange={(event) => setTaskStatus(event.target.value)}
            className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
          >
            {taskStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option === ALL ? "All task statuses" : option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="rounded border border-kelly-navy/20 bg-white px-3 py-1.5 font-semibold text-kelly-navy disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear filters
        </button>
        <p className="text-kelly-muted">
          Showing {filteredClaims.length} of {claims.length} claims · {filteredTasks.length} of {tasks.length} tasks
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="font-bold uppercase tracking-wider text-kelly-navy">Filtered claims</h3>
          {filteredClaims.length === 0 ? (
            <p className="mt-2 text-kelly-muted">No claims match the current filters.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-kelly-muted">
              {filteredClaims.map((claim) => {
                const disposition = claimDispositionBadge(claim);
                return (
                <li key={claim.id} className="rounded border border-kelly-text/10 bg-kelly-page p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-kelly-navy">
                      {claim.title}{" "}
                      <span className="font-normal text-[10px] text-kelly-subtle">({claim.indexSource})</span>
                    </p>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${disposition.className}`}>
                      {disposition.label}
                    </span>
                  </div>
                  <p className="mt-1">{claim.text}</p>
                  <p className="mt-1 text-[10px]">
                    {claim.publicationTier}
                    {" · "}
                    {claim.externalUseStatus}
                    {" · "}
                    Legal risk: {claim.legalRisk}
                    {" · "}
                    Review: {claim.reviewStatus.replaceAll("_", " ")}
                  </p>
                  {claim.safetyBlockers.length > 0 ? (
                    <p className="mt-1 text-[10px]">Safety blockers: {claim.safetyBlockers.join(", ")}</p>
                  ) : null}
                </li>
              );
              })}
            </ul>
          )}
        </div>

        <div>
          <h3 className="font-bold uppercase tracking-wider text-kelly-navy">Filtered retrieval tasks</h3>
          {filteredTasks.length === 0 ? (
            <p className="mt-2 text-kelly-muted">No retrieval tasks match the current filters.</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-kelly-text/10 text-kelly-muted">
                    <th className="py-1.5 pr-3 font-semibold">Rank</th>
                    <th className="py-1.5 pr-3 font-semibold">Task</th>
                    <th className="py-1.5 pr-3 font-semibold">Status</th>
                    <th className="py-1.5 pr-3 font-semibold">Owner</th>
                    <th className="py-1.5 pr-3 font-semibold">Priority</th>
                    <th className="py-1.5 font-semibold">Confidence / external</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-kelly-text/5 align-top">
                      <td className="py-1.5 pr-3">{task.rank ?? "—"}</td>
                      <td className="py-1.5 pr-3">{task.title}</td>
                      <td className="py-1.5 pr-3">{task.taskStatus.replaceAll("_", " ")}</td>
                      <td className="py-1.5 pr-3">{task.owner}</td>
                      <td className="py-1.5 pr-3">{task.priority}</td>
                      <td className="py-1.5">
                        {task.confidenceNeed} · {task.externalReadiness}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
