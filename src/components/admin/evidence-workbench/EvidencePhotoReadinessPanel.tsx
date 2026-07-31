"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  getPhotoReadinessMatrixAction,
  promoteReadyPhotoAssembliesAction,
} from "@/app/admin/evidence-workbench-actions";
import type { PhotoReadinessMatrix, PhotoReadinessRow } from "@/lib/campaign-media/photo-readiness";

type Props = {
  initialMatrix: PhotoReadinessMatrix;
};

/** Photo readiness matrix — parity with speech confirm panel. */
export function EvidencePhotoReadinessPanel({ initialMatrix }: Props) {
  const [matrix, setMatrix] = useState(initialMatrix);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [expanded, setExpanded] = useState(
    () =>
      initialMatrix.needsPromote +
        initialMatrix.needsFocus +
        initialMatrix.needsProEdit +
        (initialMatrix.needsShip ?? 0) +
        (initialMatrix.blocked ?? 0) >
      0,
  );

  useEffect(() => {
    setMatrix(initialMatrix);
  }, [initialMatrix]);

  const selectedIds = useMemo(() => [...selected], [selected]);
  const needsPromoteIds = useMemo(
    () => matrix.rows.filter((r) => r.assemblyCount > 0 && !r.hasPublicOverride).map((r) => r.photoId),
    [matrix.rows],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function refresh() {
    start(async () => {
      const res = await getPhotoReadinessMatrixAction({ limit: 80 });
      setMessage(res.message);
      if (res.matrix) setMatrix(res.matrix);
    });
  }

  function promoteSelected() {
    const ids = selectedIds.length ? selectedIds : needsPromoteIds.slice(0, 24);
    if (!ids.length) {
      setMessage("Nothing ready to promote — Finish for web or Confirm render first.");
      return;
    }
    start(async () => {
      const res = await promoteReadyPhotoAssembliesAction({
        confirmPromote: true,
        photoIds: ids,
        limit: 24,
      });
      setMessage(res.message);
      refresh();
    });
  }

  return (
    <div className="mb-6 space-y-3 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <div>
            <p className="font-heading text-sm font-bold text-[#000066]">Photo readiness</p>
            <p className="mt-1 font-body text-xs text-[#364272]">
              Focus → Finish for web (Apply → Confirm → Promote → Ship). Prefer Unknown. Never silent.
              · block {matrix.blocked ?? 0} · ship {matrix.needsShip ?? 0} · promote{" "}
              {matrix.needsPromote} · focus {matrix.needsFocus}
            </p>
          </div>
          <span className="shrink-0 font-body text-[11px] font-semibold text-[#364272]">
            {expanded ? "Hide matrix" : "Show matrix"}
          </span>
        </button>
        {expanded ? (
          <>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {(
                [
                  ["Total scored", matrix.total],
                  ["Blocked", matrix.blocked ?? 0],
                  ["Needs focus", matrix.needsFocus],
                  ["Needs Pro Edit", matrix.needsProEdit],
                  ["Needs promote", matrix.needsPromote],
                  ["Needs ship", matrix.needsShip ?? 0],
                ] as const
              ).map(([label, n]) => (
                <div
                  key={label}
                  className={`rounded border px-2 py-1.5 ${
                    label === "Blocked" && n > 0
                      ? "border-red-400 bg-red-50"
                      : "border-[#8eb6dc]/40 bg-[#f4f7fc]"
                  }`}
                >
                  <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">{label}</p>
                  <p className="font-body text-lg font-semibold">{n}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={refresh}
                className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
              >
                Refresh matrix
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setSelected(new Set(needsPromoteIds))}
                className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
              >
                Select needs-promote ({needsPromoteIds.length})
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={promoteSelected}
                className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
              >
                Promote selected assemblies (confirm)
              </button>
            </div>
            {message ? <p className="mt-2 font-body text-xs text-[#364272]">{message}</p> : null}
          </>
        ) : null}
      </div>

      {expanded ? (
      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase text-[#000066]">Readiness matrix</p>
        <div className="mt-2 max-h-72 overflow-auto">
          <table className="w-full border-collapse font-body text-[11px]">
            <thead>
              <tr className="border-b border-[#8eb6dc]/40 text-left text-[#000066]">
                <th className="py-1 pr-2">Sel</th>
                <th className="py-1 pr-2">Id</th>
                <th className="py-1 pr-2">County</th>
                <th className="py-1 pr-2">Focus</th>
                <th className="py-1 pr-2">Asm</th>
                <th className="py-1 pr-2">Ship</th>
                <th className="py-1 pr-2">Score</th>
                <th className="py-1">Next</th>
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((r: PhotoReadinessRow) => (
                <tr
                  key={r.photoId}
                  className={`border-b border-[#8eb6dc]/20 align-top ${
                    r.attention === "block"
                      ? "bg-red-50"
                      : r.attention === "warn"
                        ? "bg-amber-50/60"
                        : ""
                  }`}
                >
                  <td className="py-1 pr-2">
                    <input
                      type="checkbox"
                      checked={selected.has(r.photoId)}
                      onChange={() => toggle(r.photoId)}
                      aria-label={`Select ${r.photoId}`}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Link
                      href={`/admin/evidence-workbench?tab=edit&id=${encodeURIComponent(r.photoId)}`}
                      className="font-mono text-[#000066] underline"
                    >
                      {r.photoId}
                    </Link>
                  </td>
                  <td className="py-1 pr-2">{r.confirmedCounty ? r.county : "Unknown"}</td>
                  <td className="py-1 pr-2">{r.hasFocus ? "yes" : "—"}</td>
                  <td
                    className={`py-1 pr-2 ${r.assemblyCount === 0 ? "font-bold text-red-700" : ""}`}
                  >
                    {r.assemblyCount}
                  </td>
                  <td className="py-1 pr-2">
                    {r.isShipped ? "shipped" : r.needsShip ? "need ship" : r.hasPublicOverride ? "override" : "—"}
                  </td>
                  <td className="py-1 pr-2">{r.readinessScore}</td>
                  <td className="py-1 text-[#364272]">{r.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!matrix.rows.length ? (
          <p className="mt-2 font-body text-xs text-[#364272]">No photos scored yet.</p>
        ) : null}
      </div>
      ) : null}
    </div>
  );
}
