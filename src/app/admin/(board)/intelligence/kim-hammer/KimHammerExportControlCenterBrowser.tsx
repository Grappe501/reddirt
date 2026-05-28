"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { recordKimHammerExportAction } from "./export-actions";
import {
  filterExportHistoryEntries,
  type KimHammerExportControlSummary,
} from "@/lib/opposition/kimHammerExportControl";
import type {
  KimHammerExportFormat,
  KimHammerExportHistoryFile,
  KimHammerExportLineage,
  KimHammerExportScope,
} from "@/lib/opposition/types/kimHammerExportControl";
import {
  KIM_HAMMER_EXPORT_FORMATS,
  KIM_HAMMER_EXPORT_SCOPES,
} from "@/lib/opposition/types/kimHammerExportControl";

type KimHammerExportControlCenterBrowserProps = {
  history: KimHammerExportHistoryFile;
  summary: KimHammerExportControlSummary;
  currentLineage: KimHammerExportLineage;
};

function HistoryEntryCard({
  entry,
}: {
  entry: KimHammerExportHistoryFile["entries"][number];
}) {
  return (
    <article className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-kelly-navy">{entry.exportId}</span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800">
          v{entry.packetVersion}
        </span>
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-900">
          {entry.format}
        </span>
        <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-900">
          {entry.scope.replaceAll("_", " ")}
        </span>
        <span className="text-[10px] text-kelly-subtle">{entry.exportedAt}</span>
      </div>
      <p className="mt-2 text-kelly-muted">
        <strong>Operator:</strong> {entry.operator}
        {entry.exportNotes ? ` · ${entry.exportNotes}` : null}
      </p>
      <p className="mt-1 text-[10px] text-kelly-subtle">
        {entry.claimCount} claim(s) · {entry.citationCount} citation(s) · checksum {entry.contentChecksum}
      </p>
      <p className="mt-1 text-[10px] text-kelly-muted">
        <strong>Claims:</strong> {entry.claimIds.join(", ")}
      </p>
      {entry.citationIds.length > 0 ? (
        <p className="mt-1 text-[10px] text-kelly-muted">
          <strong>Citations:</strong> {entry.citationIds.join(", ")}
        </p>
      ) : null}
      {entry.narrativeIds.length > 0 ? (
        <p className="mt-1 text-[10px] text-kelly-muted">
          <strong>Narratives:</strong> {entry.narrativeIds.join(", ")}
        </p>
      ) : null}
    </article>
  );
}

export function KimHammerExportControlCenterBrowser({
  history,
  summary,
  currentLineage,
}: KimHammerExportControlCenterBrowserProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [operator, setOperator] = useState("");
  const [format, setFormat] = useState<KimHammerExportFormat>("MARKDOWN");
  const [scope, setScope] = useState<KimHammerExportScope>("STATEWIDE");
  const [countyId, setCountyId] = useState("");
  const [exportNotes, setExportNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scopeQuery, setScopeQuery] = useState("");
  const [claimQuery, setClaimQuery] = useState("");
  const [operatorQuery, setOperatorQuery] = useState("");

  const filteredHistory = useMemo(
    () =>
      filterExportHistoryEntries(history, {
        scopeQuery,
        claimQuery,
        operatorQuery,
      }),
    [history, scopeQuery, claimQuery, operatorQuery],
  );

  function handleRecordExport(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await recordKimHammerExportAction({
        operator,
        format,
        scope,
        countyId: scope === "COUNTY" ? countyId : undefined,
        exportNotes,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(
        `Export recorded: ${result.exportId} (v${result.packetVersion}). ${result.claimCount} claims, ${result.citationCount} citations. Audit ${result.auditId}.`,
      );
      router.refresh();
    });
  }

  return (
    <div>
      <section className="mb-4 rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-xs text-amber-950">
        <p className="font-bold uppercase tracking-wider">Publication governance</p>
        <p className="mt-1">
          Recording an export creates lineage memory (claims → citations → narratives) without bypassing review
          gates. Download packets from{" "}
          <Link href="/admin/intelligence/kim-hammer/debate-packet-export" className="font-semibold underline">
            Debate packet export
          </Link>
          , then log the event here for traceability.
        </p>
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Export history entries</p>
          <p className="mt-1 text-xl font-bold">{summary.totalExports}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Export-ready now</p>
          <p className="mt-1 text-xl font-bold">{summary.exportReadyClaimCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Latest packet version</p>
          <p className="mt-1 text-xl font-bold">{summary.latestPacketVersion ?? "—"}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Filtered history</p>
          <p className="mt-1 text-xl font-bold">{filteredHistory.length}</p>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">
          Current packet lineage (export-ready snapshot)
        </h2>
        <p className="mt-1 text-kelly-muted">
          Next version if recorded now: <strong>v{currentLineage.packetVersion}</strong>
        </p>
        <p className="mt-2 text-[10px] text-kelly-muted">
          <strong>Claims:</strong> {currentLineage.claimIds.join(", ") || "none"}
        </p>
        {currentLineage.citations.length > 0 ? (
          <ul className="mt-2 space-y-1 text-[10px] text-kelly-muted">
            {currentLineage.citations.map((citation) => (
              <li key={citation.citationId} className="rounded border border-kelly-text/10 bg-kelly-page/40 p-2">
                {citation.citationId} · {citation.reviewStatus} · {citation.sourceHealth} — {citation.summary}
              </li>
            ))}
          </ul>
        ) : null}
        {currentLineage.narrativeHealthSignals.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {currentLineage.narrativeHealthSignals.map((row) => (
              <li key={row.narrativeId} className="rounded border border-amber-200/60 bg-amber-50/50 p-2 text-[10px]">
                <strong>{row.narrativeId}:</strong> {row.signal}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Record export event</h2>
        <form onSubmit={handleRecordExport} className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Operator</span>
            <input
              type="text"
              value={operator}
              onChange={(event) => setOperator(event.target.value)}
              required
              disabled={isPending || summary.exportReadyClaimCount === 0}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Format</span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as KimHammerExportFormat)}
              disabled={isPending}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              {KIM_HAMMER_EXPORT_FORMATS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Scope</span>
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as KimHammerExportScope)}
              disabled={isPending}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              {KIM_HAMMER_EXPORT_SCOPES.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          {scope === "COUNTY" ? (
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">County ID</span>
              <input
                type="text"
                value={countyId}
                onChange={(event) => setCountyId(event.target.value)}
                required
                disabled={isPending}
                placeholder="e.g. pulaski"
                className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
              />
            </label>
          ) : null}
          <label className="block lg:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Export notes</span>
            <textarea
              value={exportNotes}
              onChange={(event) => setExportNotes(event.target.value)}
              disabled={isPending}
              rows={2}
              placeholder="Debate prep dry run, counsel review packet, etc."
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          {error ? (
            <p className="lg:col-span-2 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] text-rose-800">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="lg:col-span-2 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-900">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isPending || !operator.trim() || summary.exportReadyClaimCount === 0}
            className="rounded bg-kelly-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-50 lg:col-span-2 lg:w-fit"
          >
            Record governed export
          </button>
        </form>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">History filters</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Scope</span>
            <input
              type="search"
              value={scopeQuery}
              onChange={(event) => setScopeQuery(event.target.value)}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Claim / citation</span>
            <input
              type="search"
              value={claimQuery}
              onChange={(event) => setClaimQuery(event.target.value)}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Operator</span>
            <input
              type="search"
              value={operatorQuery}
              onChange={(event) => setOperatorQuery(event.target.value)}
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        {filteredHistory.length === 0 ? (
          <p className="rounded-xl border border-kelly-text/10 bg-white p-6 text-xs text-kelly-muted">
            No export history matches filters.
          </p>
        ) : (
          filteredHistory.map((entry) => <HistoryEntryCard key={entry.exportId} entry={entry} />)
        )}
      </section>
    </div>
  );
}
