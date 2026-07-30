"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  buildEvidenceShipReportAction,
  copyReadyGraduationBlocksAction,
  getGraduationAssistMatrixAction,
  shipPromotedDerivativesAction,
  writeRegistryGraduationStubAction,
} from "@/app/admin/evidence-workbench-actions";
import type { EvidenceShipReport } from "@/lib/campaign-media/evidence-ship-report";
import type { GraduationAssistMatrix } from "@/lib/campaign-media/registry-graduation-clipboard";

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
  const [prBody, setPrBody] = useState(initialReport.graduationPrBody ?? "");
  const [gradMatrix, setGradMatrix] = useState<GraduationAssistMatrix | null>(null);
  const [gradSelected, setGradSelected] = useState<Set<string>>(() => new Set());
  const [showDetails, setShowDetails] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    setReport(initialReport);
    setPrBody(initialReport.graduationPrBody ?? "");
  }, [initialReport]);

  useEffect(() => {
    void getGraduationAssistMatrixAction().then((res) => {
      if (res.matrix) setGradMatrix(res.matrix);
    });
  }, []);

  function refresh(includeDerivatives = true) {
    start(async () => {
      const res = await buildEvidenceShipReportAction({
        persist: true,
        includeDerivativeScan: includeDerivatives,
      });
      setMessage(res.message);
      if (res.report) {
        setReport(res.report);
        setPrBody(res.report.graduationPrBody ?? "");
      }
    });
  }

  function writeStub() {
    start(async () => {
      const res = await writeRegistryGraduationStubAction({ onlyReady: true });
      setMessage(res.message);
      if (res.prBody) setPrBody(res.prBody);
      refresh(true);
    });
  }

  function shipPromoted() {
    if (
      !window.confirm(
        "Copy promoted derivatives into public/media/campaign-shipped/ (trackable) and rewrite overlays? Then commit those files.",
      )
    ) {
      return;
    }
    start(async () => {
      const res = await shipPromotedDerivativesAction({ confirmShip: true, limit: 40 });
      setMessage(res.message);
      refresh(true);
    });
  }

  function copyPrBody() {
    const text = prBody || report.graduationPrBody || "";
    if (!text) {
      setMessage("No graduation PR body yet — write stub first.");
      return;
    }
    start(async () => {
      try {
        await navigator.clipboard.writeText(text);
        setMessage("Copied graduation PR body to clipboard.");
      } catch {
        setMessage("Clipboard blocked — select the PR body text manually.");
      }
    });
  }

  function refreshGrad() {
    start(async () => {
      const res = await getGraduationAssistMatrixAction();
      setMessage(res.message);
      if (res.matrix) setGradMatrix(res.matrix);
    });
  }

  function toggleGrad(id: string) {
    setGradSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function copyReadyTsBlocks() {
    const ids = [...gradSelected];
    start(async () => {
      const res = await copyReadyGraduationBlocksAction(
        ids.length ? { ids, onlyReady: false } : { onlyReady: true },
      );
      setMessage(res.message);
      if (res.ok && res.tsBlocks) {
        try {
          await navigator.clipboard.writeText(res.tsBlocks);
          setMessage(`${res.message} (clipboard)`);
        } catch {
          setMessage(`${res.message} — clipboard blocked; blocks in response only.`);
        }
      }
    });
  }

  const t = report.totals;
  const lastMile = [
    {
      id: "overlays",
      label: "1 · Overlays",
      ok: t.overlayJsonDirty === 0,
      detail:
        t.overlayJsonDirty > 0
          ? `${t.overlayJsonDirty} overlay JSON path(s) dirty — commit data/campaign-media/`
          : "Overlay JSON watch clean (or no dirty overlays).",
      action: null as null | "refresh",
    },
    {
      id: "shipped",
      label: "2 · Campaign-shipped",
      ok: t.promotedOverrideGitignored === 0 && t.promotedOverrideMissing === 0,
      detail:
        t.promotedOverrideMissing > 0
          ? `${t.promotedOverrideMissing} promoted file(s) missing on disk`
          : t.promotedOverrideGitignored > 0
            ? `${t.promotedOverrideGitignored} override(s) still on gitignored derivatives — Ship binaries`
            : "Promoted binaries trackable or none pending.",
      action: "ship" as const,
    },
    {
      id: "graduation",
      label: "3 · Graduation ready",
      ok: gradMatrix
        ? gradMatrix.readyCount === 0
        : report.graduationCandidates.filter((c) => c.county !== "Unknown").length === 0,
      detail: gradMatrix
        ? `${gradMatrix.readyCount} ready / ${gradMatrix.total} candidates (stub/clipboard only — never auto-registry)`
        : `${report.graduationCandidates.length} graduation candidate(s) — write stub / copy TS`,
      action: "grad" as const,
    },
    {
      id: "commit",
      label: "4 · Commit",
      ok: t.dirtyCount === 0,
      detail:
        t.dirtyCount > 0
          ? `${t.dirtyCount} dirty path(s) · copy commit template below`
          : "No dirty watch paths — push when branch is ahead.",
      action: "commit" as const,
    },
  ];

  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold text-[#000066]">
          Ship last mile — overlays → shipped → graduation → commit
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Approve writes JSON on this machine. Netlify only sees what you{" "}
          <strong>commit and push</strong>. Prefer Unknown. Never silent Ship.
        </p>
        <p className="mt-2 font-body text-[11px] text-[#364272]">
          Branch: {report.branch ?? "—"} · {report.gitNote}
        </p>
      </div>

      <div className="space-y-2">
        {lastMile.map((step) => (
          <div
            key={step.id}
            className={`rounded-lg border-2 bg-white p-3 ${
              step.ok ? "border-[#000066]/15" : "border-[#ca913d]/50"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-heading text-xs font-bold text-[#000066]">
                  <span className={step.ok ? "text-[#000066]" : "text-[#ca913d]"}>
                    {step.ok ? "OK" : "CHECK"}
                  </span>{" "}
                  · {step.label}
                </p>
                <p className="mt-1 font-body text-[11px] text-[#364272]">{step.detail}</p>
              </div>
              {step.action === "ship" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={shipPromoted}
                  className="rounded border-2 border-[#ca913d] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
                >
                  Ship binaries ({t.promotedOverrideGitignored})
                </button>
              ) : null}
              {step.action === "grad" ? (
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={writeStub}
                    className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
                  >
                    Write stub
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={copyReadyTsBlocks}
                    className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
                  >
                    Copy TS blocks
                  </button>
                </div>
              ) : null}
              {step.action === "commit" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      try {
                        await navigator.clipboard.writeText(report.commitMessageTemplate);
                        setMessage("Copied commit template.");
                      } catch {
                        setMessage("Clipboard blocked — select template below.");
                        setShowDetails(true);
                      }
                    });
                  }}
                  className="rounded border-2 border-[#000066] bg-white px-2.5 py-1 font-body text-xs font-bold text-[#000066] disabled:opacity-50"
                >
                  Copy commit template
                </button>
              ) : null}
            </div>
          </div>
        ))}
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
          onClick={() => setShowDetails((v) => !v)}
          className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
        >
          {showDetails ? "Hide secondary details" : "Show secondary details"}
        </button>
        <Link
          href="/admin/evidence-workbench?tab=publish"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a]"
        >
          Public Surface Desk
        </Link>
        <Link
          href="/admin/evidence-workbench?tab=county"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a]"
        >
          County desk
        </Link>
      </div>

      {message ? <p className="font-body text-xs text-[#364272]">{message}</p> : null}

      {showDetails ? (
        <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Dirty paths", t.dirtyCount],
            ["Overlay JSON dirty", t.overlayJsonDirty],
            ["Promoted overrides", t.promotedOverrideCount],
            ["Promoted missing", t.promotedOverrideMissing],
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
            Full checklist · {report.checklistReady ? "core gates OK" : "core gates incomplete"}
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
          onClick={shipPromoted}
          className="rounded border-2 border-[#ca913d] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          Ship promoted binaries ({t.promotedOverrideGitignored})
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={writeStub}
          className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
        >
          Write registry graduation stub
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={copyPrBody}
          className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
        >
          Copy graduation PR body
        </button>
      </div>

      {prBody ? (
        <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
            Graduation PR body (stub-only — never auto-applies)
          </p>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2 font-mono text-[10px] text-[#12124a]">
            {prBody}
          </pre>
        </div>
      ) : null}

      {report.promotedOverrides?.length ? (
        <div className="rounded-lg border-2 border-[#ca913d]/40 bg-white p-3">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
            Promoted publicSrcOverride paths
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-[10px] text-[#364272]">
            {report.promotedOverrides.map((p) => (
              <li key={`${p.photoId}-${p.publicSrc}`}>
                {p.fileExists ? "OK" : "MISSING"} · {p.gitignoredDerivative ? "gitignored · " : ""}
                {p.photoId} → {p.publicSrc}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
          Draft → registry graduation assist (stub / clipboard only)
        </p>
        <p className="mt-1 font-body text-[11px] text-[#364272]">
          Never auto-mutates <code className="rounded bg-[#f4f7fc] px-1">campaign-photo-registry.ts</code>.
          Ready = known county + overlay + binary on disk. Copy TS blocks after Steve review.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={refreshGrad}
            className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Refresh assist
            {gradMatrix ? ` (${gradMatrix.readyCount}/${gradMatrix.total})` : ""}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              const ready = (gradMatrix?.rows ?? []).filter((r) => r.ready).map((r) => r.id);
              setGradSelected(new Set(ready));
            }}
            className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Select ready
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={copyReadyTsBlocks}
            className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
          >
            Copy N TS blocks
            {gradSelected.size ? ` (${gradSelected.size})` : " (ready)"}
          </button>
        </div>
        {(gradMatrix?.rows.length ? gradMatrix.rows : report.graduationCandidates).length ? (
          <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
            {(gradMatrix?.rows ?? []).map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-start gap-2 rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] px-2 py-1"
              >
                <input
                  type="checkbox"
                  checked={gradSelected.has(c.id)}
                  onChange={() => toggleGrad(c.id)}
                  aria-label={`Select ${c.id}`}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/evidence-workbench?tab=edit&id=${encodeURIComponent(c.id)}`}
                      className="font-mono text-[10px] font-semibold text-[#000066] underline"
                    >
                      {c.id}
                    </Link>
                    <span
                      className={`rounded px-1.5 py-0.5 font-body text-[9px] font-bold uppercase ${
                        c.ready
                          ? "bg-[#000066] text-white"
                          : "bg-white text-[#364272] border border-[#8eb6dc]/50"
                      }`}
                    >
                      {c.ready ? "Ready" : "Not ready"}
                    </span>
                  </div>
                  <p className="font-body text-[10px] text-[#364272]">
                    {c.county} · {c.city} · bin={c.binaryExists ? "yes" : "no"} · overlay=
                    {c.hasOverlay ? "yes" : "no"}
                  </p>
                  <p className="font-body text-[10px] text-[#364272]">{c.caption}</p>
                  <p className="font-body text-[10px] text-[#364272]">{c.reason}</p>
                </div>
              </li>
            ))}
            {!gradMatrix
              ? report.graduationCandidates.map((c) => (
                  <li key={c.id} className="rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] px-2 py-1">
                    <Link
                      href={`/admin/evidence-workbench?tab=edit&id=${encodeURIComponent(c.id)}`}
                      className="font-mono text-[10px] font-semibold text-[#000066] underline"
                    >
                      {c.id}
                    </Link>
                    <p className="font-body text-[10px] text-[#364272]">
                      {c.county} · {c.city} · {c.reason}
                    </p>
                  </li>
                ))
              : null}
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
        </>
      ) : null}

      <p className="font-body text-[10px] text-[#364272]">
        Report {report.id} · {report.generatedAt}. Operator SOP:{" "}
        <code className="rounded bg-[#f4f7fc] px-1">docs/website/EVIDENCE_SHIP_CHECKLIST_PASS.md</code>
      </p>
    </div>
  );
}
