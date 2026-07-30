"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  buildEvidenceShipReportAction,
  writeRegistryGraduationStubAction,
} from "@/app/admin/evidence-workbench-actions";
import type { EvidenceShipReport } from "@/lib/campaign-media/evidence-ship-report";

type Props = {
  initialReport: EvidenceShipReport;
};

function formatBytes(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceShipPanel({ initialReport }: Props) {
  const [report, setReport] = useState(initialReport);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    setReport(initialReport);
  }, [initialReport]);

  function refresh(includeDerivatives = true) {
    start(async () => {
      const res = await buildEvidenceShipReportAction({
        persist: true,
        includeDerivativeScan: includeDerivatives,
      });
      setMessage(res.message);
      if (res.report) setReport(res.report);
    });
  }

  function writeStub() {
    start(async () => {
      const res = await writeRegistryGraduationStubAction({ onlyReady: true });
      setMessage(res.message);
      refresh(true);
    });
  }

  const t = report.totals;

  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold text-[#000066]">
          Ship Checklist — local confirm ≠ production
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Approve writes JSON on this machine. Netlify only sees what you{" "}
          <strong>commit and push</strong>. Derivatives under{" "}
          <code className="rounded bg-[#f4f7fc] px-1">campaign-derivatives/**</code> are gitignored.
        </p>
        <p className="mt-2 font-body text-[11px] text-[#364272]">
          Branch: {report.branch ?? "—"} · {report.gitNote}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Dirty paths", t.dirtyCount],
            ["Overlay JSON dirty", t.overlayJsonDirty],
            ["Photo binaries dirty", t.photoBinaryDirty],
            ["Derivatives local-only", t.derivativeLocalOnly],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className="rounded-lg border-2 border-[#000066]/15 bg-white px-3 py-2">
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
              {label}
            </p>
            <p className="font-body text-xl font-semibold">{n}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
            Checklist · {report.checklistReady ? "core gates OK" : "core gates incomplete"}
          </p>
          <p className="font-body text-[11px] text-[#364272]">
            Dirty size ~{formatBytes(t.dirtyBytes)}
          </p>
        </div>
        <ul className="mt-2 space-y-1.5">
          {report.checklist.map((c) => (
            <li
              key={c.id}
              className="rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] px-2 py-1.5 font-body text-[11px]"
            >
              <span className={c.ok ? "font-semibold text-[#000066]" : "font-semibold text-[#ca913d]"}>
                {c.ok ? "OK" : "CHECK"} · {c.label}
              </span>
              <p className="mt-0.5 text-[#364272]">{c.detail}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => refresh(true)}
          className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          Refresh ship report
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={writeStub}
          className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
        >
          Write registry graduation stub
        </button>
        <Link
          href="/admin/evidence-workbench?tab=queue"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a]"
        >
          Publish Queue
        </Link>
      </div>

      {report.warnings.length ? (
        <div className="rounded border border-[#ca913d]/50 bg-white p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">Warnings</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 font-body text-[11px] text-[#364272]">
            {report.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
          Next actions
        </p>
        <ul className="mt-1 list-disc space-y-1 pl-4 font-body text-[11px] text-[#364272]">
          {report.nextActions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
          Commit message template
        </p>
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2 font-mono text-[10px] text-[#12124a]">
          {report.commitMessageTemplate}
        </pre>
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
          Dirty / local-only paths
        </p>
        {report.dirtyPaths.length ? (
          <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
            {report.dirtyPaths.map((d) => (
              <li
                key={`${d.status}-${d.path}`}
                className="rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] px-2 py-1 font-mono text-[10px]"
              >
                <span className="font-semibold text-[#000066]">{d.status}</span> {d.path}
                <span className="text-[#364272]">
                  {" "}
                  · {d.kind} · {formatBytes(d.bytes)}
                </span>
                {d.note ? <p className="font-body text-[10px] text-[#364272]">{d.note}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 font-body text-[11px] text-[#364272]">No dirty watch paths.</p>
        )}
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
          Draft → registry candidates (stub only)
        </p>
        <p className="mt-1 font-body text-[11px] text-[#364272]">
          Never auto-mutates <code className="rounded bg-[#f4f7fc] px-1">campaign-photo-registry.ts</code>.
          Stub path:{" "}
          <code className="rounded bg-[#f4f7fc] px-1">data/campaign-media/registry-graduation-stub.md</code>
        </p>
        {report.graduationCandidates.length ? (
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {report.graduationCandidates.map((c) => (
              <li key={c.id} className="rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] px-2 py-1">
                <Link
                  href={`/admin/evidence-workbench?tab=photos&id=${encodeURIComponent(c.id)}`}
                  className="font-mono text-[10px] font-semibold text-[#000066] underline"
                >
                  {c.id}
                </Link>
                <p className="font-body text-[10px] text-[#364272]">
                  {c.county} · {c.city} · {c.reason}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 font-body text-[11px] text-[#364272]">
            No graduation candidates (need draft + overlay, preferably known county).
          </p>
        )}
      </div>

      {message ? (
        <p className="rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] px-3 py-2 font-body text-xs">
          {message}
        </p>
      ) : null}

      <p className="font-body text-[10px] text-[#364272]">
        Report {report.id} · {report.generatedAt}. Operator SOP:{" "}
        <code className="rounded bg-[#f4f7fc] px-1">docs/website/EVIDENCE_SHIP_CHECKLIST_PASS.md</code>
      </p>
    </div>
  );
}
