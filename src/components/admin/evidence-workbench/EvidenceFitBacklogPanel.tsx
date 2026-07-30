"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  getFitRankedBacklogAction,
  runVisionIdentifyBatchAction,
} from "@/app/admin/evidence-workbench-actions";
import type { FitRankedBacklog } from "@/lib/campaign-media/evidence-fit-backlog";

type Props = {
  initialBacklog: FitRankedBacklog;
};

/** Fit-ranked Unknown/needs-approval backlog — AI/heuristic proposes; you confirm. */
export function EvidenceFitBacklogPanel({ initialBacklog }: Props) {
  const [backlog, setBacklog] = useState(initialBacklog);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    setBacklog(initialBacklog);
  }, [initialBacklog]);

  function refresh() {
    start(async () => {
      const res = await getFitRankedBacklogAction({ limit: 24 });
      setMessage(res.message);
      if (res.backlog) setBacklog(res.backlog);
    });
  }

  function visionIdentifyTop() {
    const ids = backlog.rows.filter((r) => r.unknown).map((r) => r.photoId).slice(0, 16);
    start(async () => {
      const res = await runVisionIdentifyBatchAction({
        confirm: true,
        useAi: true,
        maxPhotos: 16,
        photoIds: ids.length ? ids : undefined,
      });
      setMessage(res.message);
      refresh();
    });
  }

  return (
    <div className="mb-6 rounded-lg border-2 border-[#000066]/15 bg-white p-3 text-[#12124a]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-heading text-xs font-bold uppercase text-[#000066]">
            Fit-ranked backlog
          </p>
          <p className="mt-1 font-body text-[11px] text-[#364272]">
            Website-fit scores for Unknown / draft / needs-approval. Vision Identify proposes only
            (Prefer Unknown clamp) — Apply/Save/Approve stay manual.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={visionIdentifyTop}
            className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
          >
            Vision Identify Unknown
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={refresh}
            className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Refresh fit ranks
          </button>
        </div>
      </div>
      {message ? <p className="mt-2 font-body text-xs text-[#364272]">{message}</p> : null}
      <div className="mt-2 max-h-64 overflow-auto">
        <table className="w-full border-collapse font-body text-[11px]">
          <thead>
            <tr className="border-b border-[#8eb6dc]/40 text-left text-[#000066]">
              <th className="py-1 pr-2">Photo</th>
              <th className="py-1 pr-2">County</th>
              <th className="py-1 pr-2">Best surface</th>
              <th className="py-1 pr-2">Score</th>
              <th className="py-1">Flags</th>
            </tr>
          </thead>
          <tbody>
            {backlog.rows.map((r) => (
              <tr key={r.photoId} className="border-b border-[#8eb6dc]/20 align-top">
                <td className="py-1 pr-2">
                  <Link href={r.href} className="font-mono text-[#000066] underline">
                    {r.photoId}
                  </Link>
                </td>
                <td className="py-1 pr-2">{r.county}</td>
                <td className="py-1 pr-2">{r.bestSurface ?? "—"}</td>
                <td className="py-1 pr-2">{r.bestScore}</td>
                <td className="py-1 text-[#364272]">
                  {r.unknown ? "Unknown · " : ""}
                  {r.needsApproval ? "needs approval" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!backlog.rows.length ? (
        <p className="mt-2 font-body text-xs text-[#364272]">Backlog empty — queues look calm.</p>
      ) : null}
    </div>
  );
}
