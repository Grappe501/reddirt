"use client";

import { useMemo, useState } from "react";
import {
  filterKimHammerAuditTimeline,
  type KimHammerAuditEntryKind,
  type KimHammerAuditTimeline,
  type KimHammerUnifiedAuditEntry,
} from "@/lib/opposition/kimHammerAuditBrowser";

type KimHammerAuditLogBrowserProps = {
  timeline: KimHammerAuditTimeline;
};

const kindBadge: Record<KimHammerAuditEntryKind, string> = {
  CLAIM_REVIEW: "bg-indigo-100 text-indigo-900",
  RETRIEVAL_TASK: "bg-sky-100 text-sky-900",
  CITATION_MUTATION: "bg-violet-100 text-violet-900",
  AI_SUGGESTION: "bg-fuchsia-100 text-fuchsia-900",
  EXPORT_EVENT: "bg-teal-100 text-teal-900",
  MEDIA_INTAKE_REVIEW: "bg-orange-100 text-orange-900",
  MEDIA_INTAKE_RUN: "bg-cyan-100 text-cyan-900",
  MEDIA_FINDING_PROMOTION: "bg-teal-100 text-teal-900",
  LLM_DRAFT_CREATED: "bg-purple-100 text-purple-900",
  LLM_DRAFT_REVIEWED: "bg-purple-100 text-purple-900",
  LLM_DRAFT_PROMOTED: "bg-purple-100 text-purple-900",
  LLM_DRAFT_ARCHIVED: "bg-slate-100 text-slate-900",
};

function AuditEntryCard({ entry }: { entry: KimHammerUnifiedAuditEntry }) {
  return (
    <article className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${kindBadge[entry.kind]}`}>
          {entry.kind === "CLAIM_REVIEW"
            ? "Claim review"
            : entry.kind === "RETRIEVAL_TASK"
              ? "Retrieval task"
              : entry.kind === "CITATION_MUTATION"
                ? "Citation mutation"
                : entry.kind === "AI_SUGGESTION"
                  ? "AI suggestion"
                  : entry.kind === "MEDIA_INTAKE_REVIEW"
                    ? "Media intake review"
                    : entry.kind === "MEDIA_INTAKE_RUN"
                      ? "Media intake run"
                      : entry.kind === "MEDIA_FINDING_PROMOTION"
                        ? "Media finding promotion"
                        : entry.kind === "LLM_DRAFT_CREATED"
                          ? "LLM draft created"
                          : entry.kind === "LLM_DRAFT_REVIEWED"
                            ? "LLM draft reviewed"
                            : entry.kind === "LLM_DRAFT_PROMOTED"
                              ? "LLM draft promoted"
                              : entry.kind === "LLM_DRAFT_ARCHIVED"
                                ? "LLM draft archived"
                                : "Export event"}
        </span>
        <span className="font-semibold text-kelly-navy">{entry.subjectId}</span>
        <span className="text-[10px] text-kelly-subtle">{entry.changedAt}</span>
      </div>

      <p className="mt-2 text-kelly-muted">
        <strong>Transition:</strong> {entry.previousStatus.replaceAll("_", " ")} →{" "}
        {entry.nextStatus.replaceAll("_", " ")}
      </p>
      <p className="mt-1 text-kelly-muted">
        <strong>Operator:</strong> {entry.operator}
      </p>
      {entry.notes ? (
        <p className="mt-1 text-kelly-muted">
          <strong>Notes:</strong> {entry.notes}
        </p>
      ) : null}

      {entry.kind === "RETRIEVAL_TASK" && (entry.previousOwner || entry.nextOwner) ? (
        <p className="mt-1 text-[10px] text-kelly-muted">
          Owner: {entry.previousOwner ?? "—"} → {entry.nextOwner ?? "—"}
          {entry.previousPriority || entry.nextPriority
            ? ` · Priority: ${entry.previousPriority ?? "—"} → ${entry.nextPriority ?? "—"}`
            : null}
        </p>
      ) : null}

      <details className="mt-2 text-[10px] text-kelly-subtle">
        <summary className="cursor-pointer font-semibold text-kelly-navy">Audit metadata</summary>
        <ul className="mt-1 list-inside list-disc">
          <li>Audit ID: {entry.auditId}</li>
          <li>Source: {entry.sourceFile}</li>
          <li>Route: {entry.changedByRoute}</li>
          <li>Backup: {entry.backupPath}</li>
        </ul>
      </details>
    </article>
  );
}

export function KimHammerAuditLogBrowser({ timeline }: KimHammerAuditLogBrowserProps) {
  const [kind, setKind] = useState<KimHammerAuditEntryKind | "ALL">("ALL");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [operatorQuery, setOperatorQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");

  const filtered = useMemo(
    () =>
      filterKimHammerAuditTimeline(timeline, {
        kind,
        subjectQuery,
        operatorQuery,
        statusQuery,
      }),
    [timeline, kind, subjectQuery, operatorQuery, statusQuery],
  );

  return (
    <div>
      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Total audit entries</p>
          <p className="mt-1 text-xl font-bold">{timeline.totalEntries}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Claim review events</p>
          <p className="mt-1 text-xl font-bold">{timeline.claimReviewCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Task execution events</p>
          <p className="mt-1 text-xl font-bold">{timeline.retrievalTaskCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Citation mutations</p>
          <p className="mt-1 text-xl font-bold">{timeline.citationMutationCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">AI suggestion events</p>
          <p className="mt-1 text-xl font-bold">{timeline.aiSuggestionCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Export events</p>
          <p className="mt-1 text-xl font-bold">{timeline.exportEventCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Media intake reviews</p>
          <p className="mt-1 text-xl font-bold">{timeline.mediaIntakeReviewCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Intake runs</p>
          <p className="mt-1 text-xl font-bold">{timeline.mediaIntakeRunCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Finding promotions</p>
          <p className="mt-1 text-xl font-bold">{timeline.mediaFindingPromotionCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Filtered results</p>
          <p className="mt-1 text-xl font-bold">{filtered.length}</p>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Filters</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-4">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Kind</span>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as KimHammerAuditEntryKind | "ALL")}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All events</option>
              <option value="CLAIM_REVIEW">Claim review</option>
              <option value="RETRIEVAL_TASK">Retrieval task</option>
              <option value="CITATION_MUTATION">Citation mutation</option>
              <option value="AI_SUGGESTION">AI suggestion</option>
              <option value="EXPORT_EVENT">Export event</option>
              <option value="MEDIA_INTAKE_REVIEW">Media intake review</option>
              <option value="MEDIA_INTAKE_RUN">Media intake run</option>
              <option value="MEDIA_FINDING_PROMOTION">Media finding promotion</option>
              <option value="LLM_DRAFT_CREATED">LLM draft created</option>
              <option value="LLM_DRAFT_REVIEWED">LLM draft reviewed</option>
              <option value="LLM_DRAFT_PROMOTED">LLM draft promoted</option>
              <option value="LLM_DRAFT_ARCHIVED">LLM draft archived</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
              Claim / task ID
            </span>
            <input
              type="search"
              value={subjectQuery}
              onChange={(event) => setSubjectQuery(event.target.value)}
              placeholder="pdeb-001 or kh3b-…"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
              Operator / reviewer
            </span>
            <input
              type="search"
              value={operatorQuery}
              onChange={(event) => setOperatorQuery(event.target.value)}
              placeholder="Name or role"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
              Status transition
            </span>
            <input
              type="search"
              value={statusQuery}
              onChange={(event) => setStatusQuery(event.target.value)}
              placeholder="NEEDS_REVIEW, IN_PROGRESS…"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-6 text-xs text-kelly-muted">
          {timeline.totalEntries === 0 ? (
            <p>
              No audit entries yet. Claim review (V2-A), retrieval task (V3-A), citation mutation (V3-C), AI
              suggestion disposition (V3-D), and export events (V3-E) appear here after the first operator save.
            </p>
          ) : (
            <p>No audit entries match the current filters.</p>
          )}
        </section>
      ) : (
        <section className="space-y-3">
          {filtered.map((entry) => (
            <AuditEntryCard key={entry.auditId} entry={entry} />
          ))}
        </section>
      )}
    </div>
  );
}
