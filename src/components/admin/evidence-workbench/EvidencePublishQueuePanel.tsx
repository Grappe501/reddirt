"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  batchPublishPhotosAction,
  getEvidencePublishQueueAction,
  refreshEvidenceDensitySnapshotAction,
  runPublishQueueTurboAction,
} from "@/app/admin/evidence-workbench-actions";
import type { EvidencePublishQueue, PublishQueueBucketId } from "@/lib/campaign-media/evidence-publish-queue";
import { EVIDENCE_FIELD_CLASS } from "@/components/admin/evidence-workbench/field-styles";

type Props = {
  initialQueue: EvidencePublishQueue;
};

const BUCKET_META: Array<{
  id: PublishQueueBucketId;
  label: string;
  filter?: string;
  hint: string;
}> = [
  {
    id: "unknownCounty",
    label: "Unknown county",
    filter: "unknown",
    hint: "Turbo Identify → Apply → Save before Approve",
  },
  {
    id: "draftIngest",
    label: "Intake drafts",
    hint: "Label on Photos; graduate to registry is a later ship step",
  },
  {
    id: "turboPending",
    label: "Turbo pending",
    hint: "Open Photos → Turbo card → Apply identify",
  },
  {
    id: "needsApproval",
    label: "Needs approval",
    filter: "needsApproval",
    hint: "Geo confirmed — Batch Approve (Unknown skipped)",
  },
  {
    id: "consentHold",
    label: "Consent hold",
    hint: "Requires explicit consent before public Approve",
  },
  {
    id: "approvedPublic",
    label: "On albums / public",
    filter: "approved",
    hint: "Album-eligible (Approve or legacy FEATURE) — commit overlays to ship",
  },
];

export function EvidencePublishQueuePanel({ initialQueue }: Props) {
  const [queue, setQueue] = useState(initialQueue);
  const [message, setMessage] = useState("");
  const [publishedToday, setPublishedToday] = useState("");
  const [createdNotPublished, setCreatedNotPublished] = useState("");
  const [eveningNote, setEveningNote] = useState("");
  const [pending, start] = useTransition();

  function refreshQueue() {
    start(async () => {
      const res = await getEvidencePublishQueueAction();
      if (res.queue) setQueue(res.queue);
      setMessage(res.message);
    });
  }

  useEffect(() => {
    setQueue(initialQueue);
  }, [initialQueue]);

  function runTurboBacklog() {
    start(async () => {
      const res = await runPublishQueueTurboAction({
        confirm: true,
        useAi: true,
        maxPhotos: 24,
      });
      setMessage(res.message);
      if (res.queue) setQueue(res.queue);
    });
  }

  function approveNeedsApproval() {
    const ids = queue.buckets.needsApproval.map((i) => i.id);
    if (!ids.length) {
      setMessage("No needs-approval stills in the current queue slice.");
      return;
    }
    if (
      !window.confirm(
        `Batch Approve ${ids.length} geo-confirmed still(s)? Unknown county and consent holds are still skipped.`,
      )
    ) {
      return;
    }
    start(async () => {
      const res = await batchPublishPhotosAction({ action: "approve", photoIds: ids });
      setMessage(res.message);
      const q = await getEvidencePublishQueueAction();
      if (q.queue) setQueue(q.queue);
    });
  }

  function refreshDensity() {
    start(async () => {
      const res = await refreshEvidenceDensitySnapshotAction({
        updateDensityDoc: true,
        evening:
          publishedToday.trim() || createdNotPublished.trim() || eveningNote.trim()
            ? {
                publishedToday: publishedToday.trim(),
                createdNotPublished: createdNotPublished.trim(),
                note: eveningNote.trim() || undefined,
              }
            : undefined,
      });
      setMessage(res.message);
      if (res.snapshot?.queue) setQueue(res.snapshot.queue);
    });
  }

  const t = queue.totals;

  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold text-[#000066]">
          Publish Queue — Unknown → Save → Approve
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Ops loop for proof density. Turbo never Approves. Unknown stays Unknown until you Save a
          confirmed county. Commit <code className="rounded bg-[#f4f7fc] px-1">data/campaign-media/</code>{" "}
          to ship overlays.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 font-body text-xs text-[#364272]">
          {queue.pathSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(
          [
            ["Unknown", t.unknownCounty],
            ["Drafts", t.draftIngest],
            ["Turbo pending", t.turboPending],
            ["Needs approval", t.needsApproval],
            ["On albums", t.approvedPublic],
            ["Overlays saved", t.overlaysSaved],
            ["Intake new", t.intakeNewOnDisk],
            ["Consent hold", t.consentHold],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className="rounded-lg border-2 border-[#000066]/15 bg-white px-3 py-2">
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
              {label}
            </p>
            <p className="font-body text-xl font-semibold text-[#12124a]">{n}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
          Confirmed counties (approved stills)
        </p>
        <p className="mt-1 font-body text-sm text-[#12124a]">
          {queue.confirmedCounties.length
            ? `${queue.confirmedCounties.length}: ${queue.confirmedCounties.join(", ")}`
            : "None yet — Approve geo-confirmed stills to move density."}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4 font-body text-[11px] text-[#364272]">
          {queue.nextActions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={runTurboBacklog}
          className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          Turbo Unknown / draft backlog
        </button>
        <button
          type="button"
          disabled={pending || !t.needsApproval}
          onClick={approveNeedsApproval}
          className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
        >
          Batch Approve needs-approval ({Math.min(t.needsApproval, 40)})
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={refreshDensity}
          className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
        >
          Refresh density snapshot
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={refreshQueue}
          className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
        >
          Refresh queue
        </button>
        <Link
          href="/admin/evidence-workbench?tab=photos&filter=unknown"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a]"
        >
          Open Unknown on Photos
        </Link>
        <Link
          href="/admin/evidence-workbench?tab=photos&filter=needsApproval"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a]"
        >
          Open needs approval
        </Link>
        <Link
          href="/admin/evidence-workbench?tab=ship"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a]"
        >
          Ship checklist
        </Link>
        <Link
          href="/admin/evidence-workbench?tab=ingest"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a]"
        >
          Intake
        </Link>
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
          Evening log (optional)
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="block font-body text-[11px] font-semibold">
            Published today
            <input
              className={`${EVIDENCE_FIELD_CLASS} mt-0.5`}
              value={publishedToday}
              onChange={(e) => setPublishedToday(e.target.value)}
              placeholder="e.g. 2 stills Faulkner"
            />
          </label>
          <label className="block font-body text-[11px] font-semibold">
            Created, not published
            <input
              className={`${EVIDENCE_FIELD_CLASS} mt-0.5`}
              value={createdNotPublished}
              onChange={(e) => setCreatedNotPublished(e.target.value)}
              placeholder="e.g. 5 drafts unlabeled"
            />
          </label>
        </div>
        <label className="mt-2 block font-body text-[11px] font-semibold">
          Note
          <input
            className={`${EVIDENCE_FIELD_CLASS} mt-0.5`}
            value={eveningNote}
            onChange={(e) => setEveningNote(e.target.value)}
          />
        </label>
        <p className="mt-1 font-body text-[10px] text-[#364272]">
          Saved into evidence-density-snapshot.json when you Refresh density snapshot.
        </p>
      </div>

      {message ? (
        <p className="rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] px-3 py-2 font-body text-xs text-[#12124a]">
          {message}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {BUCKET_META.map((b) => {
          const items = queue.buckets[b.id];
          const totalKey =
            b.id === "unknownCounty"
              ? t.unknownCounty
              : b.id === "draftIngest"
                ? t.draftIngest
                : b.id === "turboPending"
                  ? t.turboPending
                  : b.id === "needsApproval"
                    ? t.needsApproval
                    : b.id === "consentHold"
                      ? t.consentHold
                      : t.approvedPublic;
          return (
            <div key={b.id} className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
                  {b.label} · {totalKey}
                </p>
                {b.filter ? (
                  <Link
                    href={`/admin/evidence-workbench?tab=photos&filter=${b.filter}`}
                    className="font-body text-[11px] font-semibold text-[#000066] underline"
                  >
                    Open filter
                  </Link>
                ) : null}
              </div>
              <p className="mt-1 font-body text-[11px] text-[#364272]">{b.hint}</p>
              {items.length ? (
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/admin/evidence-workbench?tab=photos&id=${encodeURIComponent(item.id)}`}
                        className="block rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] px-2 py-1 hover:border-[#000066]/40"
                      >
                        <p className="truncate font-mono text-[10px] text-[#000066]">{item.id}</p>
                        <p className="truncate font-body text-[10px] text-[#364272]">
                          {item.county}
                          {item.city !== "Unknown" ? ` · ${item.city}` : ""}
                          {item.turboPending ? " · turbo" : ""}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 font-body text-[11px] text-[#364272]">Empty.</p>
              )}
              {totalKey > items.length ? (
                <p className="mt-1 font-body text-[10px] text-[#364272]">
                  Showing {items.length} of {totalKey}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="font-body text-[10px] text-[#364272]">
        Generated {queue.generatedAt}. Live photos {t.livePhotos}.
      </p>
    </div>
  );
}
