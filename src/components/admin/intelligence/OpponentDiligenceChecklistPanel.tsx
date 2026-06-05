"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  DiligenceSearchEntry,
  DiligenceSearchResult,
  OpponentDiligenceLogFile,
} from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";

const RESULT_STYLE: Record<DiligenceSearchResult, string> = {
  CLEAN: "text-emerald-700",
  HIT_REQUIRES_COUNSEL: "text-rose-700",
  NOT_SEARCHED: "text-rose-700",
  IN_PROGRESS: "text-amber-700",
};

type Props = {
  log: OpponentDiligenceLogFile;
};

function EntryRow({ log, entry }: { log: OpponentDiligenceLogFile; entry: DiligenceSearchEntry }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(entry.result);
  const [initials, setInitials] = useState(entry.staffInitials ?? "");
  const [counselReviewed, setCounselReviewed] = useState(entry.counselReviewed);
  const [notes, setNotes] = useState(entry.notes);
  const [debateStageLine, setDebateStageLine] = useState(entry.debateStageLine ?? "");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/intelligence/diligence-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: log.subjectId,
          entryId: entry.id,
          result,
          staffInitials: initials.trim() || null,
          counselReviewed,
          notes,
          debateStageLine: debateStageLine.trim() || null,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-kelly-text/5 align-top">
      <td className="py-3 pr-3 font-semibold text-kelly-navy">{entry.source}</td>
      <td className="py-3 pr-3 text-kelly-muted">{entry.searchQuery}</td>
      <td className="py-3 pr-3">
        <select
          value={result}
          onChange={(e) => setResult(e.target.value as DiligenceSearchResult)}
          className="w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-xs"
        >
          <option value="NOT_SEARCHED">NOT SEARCHED</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="CLEAN">CLEAN</option>
          <option value="HIT_REQUIRES_COUNSEL">HIT — COUNSEL</option>
        </select>
        <p className={`mt-1 text-[10px] font-bold ${RESULT_STYLE[result]}`}>{result.replace(/_/g, " ")}</p>
        {entry.dateSearched ? (
          <p className="mt-1 text-[10px] text-kelly-subtle">Searched: {entry.dateSearched}</p>
        ) : null}
      </td>
      <td className="py-3 pr-3">
        <input
          value={initials}
          onChange={(e) => setInitials(e.target.value)}
          placeholder="Initials"
          maxLength={8}
          className="mb-2 w-16 rounded border border-kelly-text/15 px-2 py-1 text-xs"
        />
        <label className="flex items-center gap-2 text-[10px]">
          <input
            type="checkbox"
            checked={counselReviewed}
            onChange={(e) => setCounselReviewed(e.target.checked)}
          />
          Counsel reviewed
        </label>
      </td>
      <td className="py-3 pr-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full min-w-[160px] rounded border border-kelly-text/15 px-2 py-1 text-xs"
        />
        <textarea
          value={debateStageLine}
          onChange={(e) => setDebateStageLine(e.target.value)}
          placeholder="Counsel-approved stage line (if any)"
          rows={2}
          className="mt-2 w-full rounded border border-kelly-text/15 px-2 py-1 text-xs"
        />
      </td>
      <td className="py-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded-full bg-kelly-navy px-3 py-1 text-[10px] font-bold text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Log search"}
        </button>
        {error ? <p className="mt-1 text-[10px] text-rose-700">{error}</p> : null}
      </td>
    </tr>
  );
}

export function OpponentDiligenceChecklistPanel({ log }: Props) {
  const searched = log.entries.filter(
    (e) => e.result === "CLEAN" || e.result === "HIT_REQUIRES_COUNSEL",
  ).length;
  const pct = Math.round((searched / Math.max(1, log.entries.length)) * 100);

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase text-amber-950">
            Five-search diligence checklist ({pct}% complete)
          </h2>
          <p className="mt-2 text-kelly-muted">{log.governance.note}</p>
        </div>
        <span className="rounded-full border border-amber-300 bg-white px-3 py-1 text-[10px] font-bold uppercase text-amber-950">
          {log.governance.classification}
        </span>
      </div>

      <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-rose-950">
        <span className="font-bold">Counsel gate:</span> {log.researchProtocol.counselGate}
      </p>
      <p className="mt-2 text-kelly-muted">
        <span className="font-bold">Incomplete frame:</span> {log.researchProtocol.incompleteFrame}
      </p>
      {log.researchProtocol.pacerOptional ? (
        <p className="mt-2 text-[10px] text-violet-900">
          <span className="font-bold">PACER (optional):</span> {log.researchProtocol.pacerNote}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-kelly-text/10 text-[10px] uppercase text-kelly-subtle">
              <th className="py-2 pr-3">Source</th>
              <th className="py-2 pr-3">Search query</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Staff / counsel</th>
              <th className="py-2 pr-3">Notes & stage line</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {log.entries.map((entry) => (
              <EntryRow key={entry.id} log={log} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-medium text-kelly-text">{log.counselFrame}</p>
    </section>
  );
}
