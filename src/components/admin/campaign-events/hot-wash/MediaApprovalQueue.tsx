"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveHotWashMediaAction,
  needsReviewHotWashMediaAction,
  rejectHotWashMediaAction,
} from "@/app/admin/(board)/campaign-events/media-actions";
import type { HotWashMediaRecord } from "@/lib/campaign-events/media/hot-wash-media-types";

function MediaPreview({ item }: { item: HotWashMediaRecord }) {
  const src = `/api/admin/campaign-events/media/${item.id}`;
  if (item.mediaType === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-20 w-20 rounded-xl border object-cover" />
    );
  }
  return (
    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border bg-kelly-wash p-2 text-center font-mono text-[9px] uppercase">
      {item.mediaType}
    </div>
  );
}

export function MediaApprovalQueue({ items }: { items: HotWashMediaRecord[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const act = (fn: () => Promise<unknown>) => {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  };

  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-kelly-text/20 p-8 text-center font-body text-sm text-kelly-muted">
        No pending uploads. Hot Wash uploads from event drilldown appear here until approved or rejected.
      </p>
    );
  }

  return (
    <ul className="grid gap-4">
      {items.map((item) => (
        <li key={item.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
          <div className="flex flex-wrap gap-4">
            <MediaPreview item={item} />
            <div className="min-w-0 flex-1 font-body text-sm">
              <p className="font-heading font-bold">{item.originalFilename}</p>
              <p className="mt-1 text-kelly-muted">
                <Link href={`/admin/campaign-events/${item.eventRecordId}`} className="font-semibold text-kelly-navy underline">
                  {item.eventTitle}
                </Link>
                {" · "}
                {item.eventDate}
                {item.county ? ` · ${item.county}` : " · (county unknown)"}
              </p>
              <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                <div>
                  <dt className="font-bold text-kelly-slate">Uploader</dt>
                  <dd>
                    {item.uploaderName} ({item.uploaderEmail})
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-slate">Type / source</dt>
                  <dd>
                    {item.mediaType} · {item.uploadSource}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold text-kelly-slate">Pending path</dt>
                  <dd className="font-mono text-[10px] break-all">{item.storedPath}</dd>
                </div>
                {item.approvedArchivePath ? (
                  <div className="sm:col-span-2">
                    <dt className="font-bold text-kelly-slate">Planned approved path</dt>
                    <dd className="font-mono text-[10px] break-all">{item.approvedArchivePath}</dd>
                  </div>
                ) : null}
              </dl>
              {item.caption ? <p className="mt-2 text-xs italic text-kelly-muted">Caption: {item.caption}</p> : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
              onClick={() => act(() => approveHotWashMediaAction(item.id))}
            >
              Approve → county archive
            </button>
            <button
              type="button"
              disabled={pending}
              className="rounded-full border border-amber-700/40 px-4 py-2 text-xs font-bold text-amber-950"
              onClick={() => act(() => needsReviewHotWashMediaAction(item.id))}
            >
              Needs review
            </button>
            <button
              type="button"
              disabled={pending}
              className="rounded-full border border-red-700/30 px-4 py-2 text-xs font-bold text-red-900"
              onClick={() => setRejectId(item.id)}
            >
              Reject
            </button>
          </div>
          {rejectId === item.id ? (
            <div className="mt-3 rounded-xl border border-red-700/20 bg-red-50/50 p-3">
              <label className="grid gap-1 text-xs">
                <span className="font-bold">Rejection reason (optional)</span>
                <input className="rounded-lg border px-2 py-1" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="rounded-full bg-red-800 px-3 py-1 text-xs font-bold text-white"
                  disabled={pending}
                  onClick={() =>
                    act(async () => {
                      await rejectHotWashMediaAction(item.id, rejectReason);
                      setRejectId(null);
                      setRejectReason("");
                    })
                  }
                >
                  Confirm reject (file kept)
                </button>
                <button type="button" className="text-xs underline" onClick={() => setRejectId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
