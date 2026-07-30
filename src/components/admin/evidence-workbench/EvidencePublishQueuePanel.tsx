"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  batchPublishPhotosAction,
  getCountyCoverageHeatAction,
  getEvidencePublishQueueAction,
  getSpeechConfirmQueueAction,
  refreshEvidenceDensitySnapshotAction,
  runPublishQueueTurboAction,
} from "@/app/admin/evidence-workbench-actions";
import type { EvidencePublishQueue, PublishQueueBucketId, PublishQueueItem } from "@/lib/campaign-media/evidence-publish-queue";
import type { CountyCoverageHeat } from "@/lib/campaign-media/county-coverage-heat";
import type { SpeechConfirmQueue } from "@/lib/campaign-media/speech-confirm-queue";
import {
  parseQueueUrlFilter,
  queueFilterToBucketId,
} from "@/lib/campaign-media/evidence-workbench-deep-links";
import { EVIDENCE_FIELD_CLASS } from "@/components/admin/evidence-workbench/field-styles";

type Props = {
  initialQueue: EvidencePublishQueue;
  initialSpeechQueue?: SpeechConfirmQueue | null;
  initialCoverageHeat?: CountyCoverageHeat | null;
  /** URL ?filter= — highlights + scrolls to matching queue bucket. */
  initialUrlFilter?: string | null;
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

export function EvidencePublishQueuePanel({
  initialQueue,
  initialSpeechQueue = null,
  initialCoverageHeat = null,
  initialUrlFilter = null,
}: Props) {
  const [queue, setQueue] = useState(initialQueue);
  const [speechQueue, setSpeechQueue] = useState<SpeechConfirmQueue | null>(initialSpeechQueue);
  const [heat, setHeat] = useState<CountyCoverageHeat | null>(initialCoverageHeat);
  const [coverageFilter, setCoverageFilter] = useState<"all" | "thinOrZero">("all");
  const [countySlugFilter, setCountySlugFilter] = useState<string | null>(null);
  const [highlightBucket, setHighlightBucket] = useState<PublishQueueBucketId | null>(() =>
    queueFilterToBucketId(parseQueueUrlFilter(initialUrlFilter)),
  );
  const [message, setMessage] = useState("");
  const [publishedToday, setPublishedToday] = useState("");
  const [createdNotPublished, setCreatedNotPublished] = useState("");
  const [eveningNote, setEveningNote] = useState("");
  const [pending, start] = useTransition();

  function refreshQueue() {
    start(async () => {
      const [res, speech, heatRes] = await Promise.all([
        getEvidencePublishQueueAction(),
        getSpeechConfirmQueueAction(),
        getCountyCoverageHeatAction(),
      ]);
      if (res.queue) setQueue(res.queue);
      if (speech.queue) setSpeechQueue(speech.queue);
      if (heatRes.heat) setHeat(heatRes.heat);
      setMessage([res.message, speech.message, heatRes.message].filter(Boolean).join(" · "));
    });
  }

  useEffect(() => {
    setQueue(initialQueue);
  }, [initialQueue]);

  useEffect(() => {
    setSpeechQueue(initialSpeechQueue);
  }, [initialSpeechQueue]);

  useEffect(() => {
    const bucket = queueFilterToBucketId(parseQueueUrlFilter(initialUrlFilter));
    setHighlightBucket(bucket);
    if (!bucket) return;
    const t = window.setTimeout(() => {
      document.getElementById(`ew-queue-bucket-${bucket}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
    return () => window.clearTimeout(t);
  }, [initialUrlFilter]);

  useEffect(() => {
    if (initialCoverageHeat) {
      setHeat(initialCoverageHeat);
      return;
    }
    void getCountyCoverageHeatAction().then((res) => {
      if (res.heat) setHeat(res.heat);
    });
  }, [initialCoverageHeat]);

  const thinSlugSet = useMemo(
    () => new Set(heat?.thinOrZeroSlugs ?? []),
    [heat],
  );

  function itemMatchesCoverage(item: PublishQueueItem): boolean {
    if (coverageFilter === "all" && !countySlugFilter) return true;
    const slug =
      heat?.cells.find(
        (c) =>
          c.shortName.toLowerCase() === item.county.replace(/\s+county$/i, "").toLowerCase() ||
          c.displayName.toLowerCase() === item.county.toLowerCase(),
      )?.slug ?? null;
    if (countySlugFilter) return slug === countySlugFilter;
    if (coverageFilter === "thinOrZero") {
      if (!slug) return item.county === "Unknown" || !item.county;
      return thinSlugSet.has(slug);
    }
    return true;
  }

  function filterItems(items: PublishQueueItem[]): PublishQueueItem[] {
    return items.filter(itemMatchesCoverage);
  }

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
      {highlightBucket ? (
        <p className="rounded border-2 border-[#000066] bg-[#eef2fb] px-3 py-2 font-body text-xs font-semibold text-[#000066]">
          Deep-link focus: {BUCKET_META.find((b) => b.id === highlightBucket)?.label ?? highlightBucket}{" "}
          bucket
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setHighlightBucket(null)}
          >
            Clear
          </button>
        </p>
      ) : null}

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

      {heat ? (
        <div className="rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
                County coverage heat
              </p>
              <p className="mt-1 font-body text-[11px] text-[#364272]">
                Album-eligible stills · zero {heat.totals.zero} · thin (&lt;{heat.thinThreshold}){" "}
                {heat.totals.thin} · ok {heat.totals.ok}. Click a county to filter queue buckets.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setCoverageFilter("thinOrZero");
                  setCountySlugFilter(null);
                }}
                className={`rounded border-2 px-2.5 py-1 font-body text-xs font-bold disabled:opacity-50 ${
                  coverageFilter === "thinOrZero" && !countySlugFilter
                    ? "border-[#000066] bg-[#000066] text-white"
                    : "border-[#000066] bg-white text-[#000066]"
                }`}
              >
                Thin / zero filter
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setCoverageFilter("all");
                  setCountySlugFilter(null);
                }}
                className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
              >
                Clear coverage filter
              </button>
            </div>
          </div>
          {(coverageFilter !== "all" || countySlugFilter) && (
            <p className="mt-2 font-body text-[11px] text-[#12124a]">
              Active filter:{" "}
              {countySlugFilter
                ? heat.cells.find((c) => c.slug === countySlugFilter)?.shortName ?? countySlugFilter
                : "thin / zero counties (+ Unknown)"}
            </p>
          )}
          <div className="mt-3 grid max-h-56 grid-cols-3 gap-1 overflow-auto sm:grid-cols-5 lg:grid-cols-8">
            {heat.cells.map((c) => {
              const tone =
                c.band === "zero"
                  ? "border-[#9b1c1c]/40 bg-[#fde8e8] text-[#7f1d1d]"
                  : c.band === "thin"
                    ? "border-[#ca913d]/50 bg-white text-[#12124a]"
                    : "border-[#000066]/15 bg-[#f4f7fc] text-[#364272]";
              const active = countySlugFilter === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  title={`${c.displayName}: ${c.photoCount} album still(s)`}
                  onClick={() => {
                    setCountySlugFilter(c.slug);
                    setCoverageFilter("all");
                  }}
                  className={`rounded border px-1.5 py-1 text-left font-body text-[10px] ${tone} ${
                    active ? "ring-2 ring-[#000066]" : ""
                  }`}
                >
                  <span className="block truncate font-semibold">{c.shortName}</span>
                  <span className="font-mono">{c.photoCount}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

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
          href="/admin/evidence-workbench?tab=speeches"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a]"
        >
          Videos / speech confirm
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

      {speechQueue ? (
        <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-4">
          <p className="font-heading text-sm font-bold text-[#000066]">
            Speech confirm queue — Videos parity
          </p>
          <p className="mt-1 font-body text-xs text-[#364272]">
            Overlay apply now honors Approve / homepage / PUBLISHED. Batch ops live on the Videos tab.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {(
              [
                ["No county", speechQueue.totals.noCounty],
                ["Needs publish", speechQueue.totals.needsPublish],
                ["Published", speechQueue.totals.published],
                ["Overlays", speechQueue.totals.overlaysSaved],
                ["Prep ready", speechQueue.totals.prepReady],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] px-2 py-1.5">
                <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">{label}</p>
                <p className="font-body text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-xs text-[#364272]">
            {speechQueue.nextActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {(
              [
                ["noCounty", "No county", speechQueue.buckets.noCounty],
                ["needsPublish", "Needs publish", speechQueue.buckets.needsPublish],
              ] as const
            ).map(([id, label, items]) => (
              <div key={id} className="rounded border border-[#8eb6dc]/30 p-2">
                <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">
                  {label} · {items.length}
                </p>
                <ul className="mt-1 max-h-36 overflow-y-auto font-mono text-[10px] text-[#364272]">
                  {items.map((i) => (
                    <li key={i.id}>
                      <Link
                        href={`/admin/evidence-workbench?tab=speeches&id=${encodeURIComponent(i.id)}`}
                        className="underline"
                      >
                        {i.id}
                      </Link>
                    </li>
                  ))}
                  {!items.length ? <li>—</li> : null}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {BUCKET_META.map((b) => {
          const rawItems = queue.buckets[b.id];
          const items = filterItems(rawItems);
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
            <div
              key={b.id}
              id={`ew-queue-bucket-${b.id}`}
              className={`rounded-lg border-2 bg-white p-3 ${
                highlightBucket === b.id
                  ? "border-[#000066] ring-2 ring-[#000066]/25"
                  : "border-[#000066]/15"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
                  {b.label} · {totalKey}
                  {items.length !== rawItems.length ? ` · showing ${items.length}` : ""}
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
                <p className="mt-2 font-body text-[11px] text-[#364272]">
                  {rawItems.length ? "No items match coverage filter." : "Empty."}
                </p>
              )}
              {totalKey > rawItems.length ? (
                <p className="mt-1 font-body text-[10px] text-[#364272]">
                  Showing {rawItems.length} of {totalKey}
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
