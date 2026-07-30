"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  attachVideoMasterAction,
  bringArrivalIntoSystemAction,
  clearVideoMasterOverrideAction,
  dropCampaignPhotosToDiskAction,
  dropVideoMastersToDiskAction,
  getTurboIngestDashboardAction,
  listPhotoIngestCandidatesAction,
  listVideoMasterArrivalAction,
  markVideoMasterUnmatchedAction,
  promotePhotoIngestAction,
  runTurboIngestAction,
} from "@/app/admin/evidence-workbench-actions";

type Candidate = {
  filename: string;
  relativePath?: string;
  src: string;
  id: string;
  alreadyInRegistry: boolean;
  alreadyInDrafts: boolean;
  nested?: boolean;
};

type IntakeStatus = {
  scannedOnDisk: number;
  newOnDisk: number;
  nestedNew: number;
  flatNew: number;
  queueCount: number;
  queueUnknownCounty: number;
  registryCount: number;
  liveUnknownCounty: number;
  nextStep: "drop" | "intake" | "label" | "approve" | "clear";
  nextStepLabel: string;
};

type VideoRow = {
  key: string;
  filename: string;
  root: "public-masters" | "local-masters";
  bytes: number;
  publicSrc: string | null;
  matchStatus: "auto" | "attached" | "unmatched" | "held";
  matchedSpeechId: string | null;
  matchedSpeechTitle: string | null;
  suggestions: Array<{ id: string; title: string }>;
};

type VideoSummary = {
  total: number;
  matched: number;
  unmatched: number;
  held: number;
  rows: VideoRow[];
};

type SpeechOption = { id: string; title: string; youtubeVideoId: string };

type TurboDash = {
  pending: number;
  lastRunAt?: string;
  lastRunMessage?: string;
  top: Array<{
    photoId: string;
    bestSurface: string | null;
    bestScore: number;
    identifySource: string;
    county: string;
  }>;
  inventory: {
    homepageGalleryLive: number;
    countyAlbumCount: number;
    acrossArkansasLive: number;
    thinCounties: string[];
    unknownCountyCount: number;
  };
};

type Props = {
  initialCandidates: Candidate[];
  initialStatus: IntakeStatus;
  initialVideoSummary: VideoSummary;
  initialSpeeches: SpeechOption[];
};

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceIngestPanel({
  initialCandidates,
  initialStatus,
  initialVideoSummary,
  initialSpeeches,
}: Props) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [status, setStatus] = useState(initialStatus);
  const [videoSummary, setVideoSummary] = useState(initialVideoSummary);
  const [speeches, setSpeeches] = useState(initialSpeeches);
  const [attachPick, setAttachPick] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [lastQueued, setLastQueued] = useState(0);
  const [ownedMediaMatch, setOwnedMediaMatch] = useState<{ linked: number; unlinked: number } | null>(
    null,
  );
  const [dropHover, setDropHover] = useState(false);
  const [showTurbo, setShowTurbo] = useState(false);
  const [turbo, setTurbo] = useState<TurboDash | null>(null);
  const [turboUseAi, setTurboUseAi] = useState(true);
  const [pending, start] = useTransition();

  useEffect(() => {
    setCandidates(initialCandidates);
    setStatus(initialStatus);
    setVideoSummary(initialVideoSummary);
    setSpeeches(initialSpeeches);
  }, [initialCandidates, initialStatus, initialVideoSummary, initialSpeeches]);

  useEffect(() => {
    void getTurboIngestDashboardAction().then((res) => {
      if (res.dashboard) setTurbo(res.dashboard as TurboDash);
    });
  }, []);

  const fresh = candidates.filter((c) => !c.alreadyInRegistry && !c.alreadyInDrafts);
  const readyForIdentify = status.queueCount;
  const identifyBadge =
    lastQueued > 0
      ? ` (+${lastQueued})`
      : status.queueUnknownCounty > 0
        ? ` (${status.queueUnknownCounty} need county)`
        : readyForIdentify > 0
          ? ` (${readyForIdentify})`
          : "";

  async function refreshAll() {
    const [photos, videos] = await Promise.all([
      listPhotoIngestCandidatesAction(),
      listVideoMasterArrivalAction(),
    ]);
    if (photos.candidates) setCandidates(photos.candidates);
    if (photos.status) setStatus(photos.status);
    if (videos.summary) setVideoSummary(videos.summary);
    if (videos.speeches) setSpeeches(videos.speeches);
    const dash = await getTurboIngestDashboardAction();
    if (dash.dashboard) setTurbo(dash.dashboard as TurboDash);
    return photos.message || videos.message;
  }

  function refresh() {
    start(async () => {
      const msg = await refreshAll();
      setMessage(msg);
    });
  }

  function bringIntoSystem() {
    start(async () => {
      const res = await bringArrivalIntoSystemAction();
      setMessage(res.message);
      setLastQueued(res.ids?.length ?? 0);
      if (typeof res.ownedMediaLinked === "number" && typeof res.ownedMediaUnlinked === "number") {
        setOwnedMediaMatch({ linked: res.ownedMediaLinked, unlinked: res.ownedMediaUnlinked });
      }
      if (res.photoStatus) setStatus(res.photoStatus);
      if (res.videoSummary) setVideoSummary(res.videoSummary);
      await refreshAll();
    });
  }

  function runTurbo(intakeFirst: boolean) {
    start(async () => {
      const res = await runTurboIngestAction({
        intakeFirst,
        useAi: turboUseAi,
        maxPhotos: 16,
      });
      setMessage(res.message);
      if (res.dashboard) setTurbo(res.dashboard as TurboDash);
      await refreshAll();
    });
  }

  function intakeOne(pathOrName: string) {
    start(async () => {
      const res = await promotePhotoIngestAction(pathOrName);
      setMessage(res.message);
      if (res.ok) {
        setLastQueued(1);
        await refreshAll();
      }
    });
  }

  function dropFiles(fileList: FileList | File[]) {
    const all = Array.from(fileList);
    const images = all.filter(
      (f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(f.name),
    );
    const videos = all.filter(
      (f) => f.type.startsWith("video/") || /\.(mp4|mov|webm|mkv|m4v)$/i.test(f.name),
    );
    if (!images.length && !videos.length) {
      setMessage("Drop image or video files (jpg/png/webp/gif · mp4/mov/webm/mkv).");
      return;
    }
    start(async () => {
      const notes: string[] = [];
      if (images.length) {
        const fd = new FormData();
        for (const f of images.slice(0, 40)) fd.append("files", f);
        const res = await dropCampaignPhotosToDiskAction(fd);
        notes.push(res.message);
      }
      if (videos.length) {
        const fd = new FormData();
        for (const f of videos.slice(0, 20)) fd.append("files", f);
        const res = await dropVideoMastersToDiskAction(fd);
        notes.push(res.message);
      }
      setMessage(notes.join(" · "));
      await refreshAll();
    });
  }

  function attachMaster(row: VideoRow) {
    const speechId = attachPick[row.key] || row.suggestions[0]?.id || "";
    if (!speechId) {
      setMessage("Pick a speech before attaching.");
      return;
    }
    start(async () => {
      const res = await attachVideoMasterAction({
        root: row.root,
        filename: row.filename,
        speechId,
      });
      setMessage(res.message);
      if (res.summary) setVideoSummary(res.summary);
    });
  }

  function holdMaster(row: VideoRow) {
    start(async () => {
      const res = await markVideoMasterUnmatchedAction({
        root: row.root,
        filename: row.filename,
      });
      setMessage(res.message);
      if (res.summary) setVideoSummary(res.summary);
    });
  }

  function clearOverride(row: VideoRow) {
    start(async () => {
      const res = await clearVideoMasterOverrideAction({
        root: row.root,
        filename: row.filename,
      });
      setMessage(res.message);
      if (res.summary) setVideoSummary(res.summary);
    });
  }

  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
          Arrival · stills + video masters
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 font-body text-sm text-[#364272]">
          <li>
            Drop stills into{" "}
            <code className="rounded bg-[#f4f7fc] px-1">campaign-photos/</code> and masters into{" "}
            <code className="rounded bg-[#f4f7fc] px-1">campaign-video-masters/</code> (or{" "}
            <code className="rounded bg-[#f4f7fc] px-1">.local/video-masters/</code>) — or use the drop
            zone.
          </li>
          <li>
            <strong className="text-[#12124a]">Rescan</strong> after Explorer drops (no auto-watch yet).
            Then <strong className="text-[#12124a]">Bring into system</strong> — intakes new stills;
            matched masters are already usable.
          </li>
          <li>
            Unmatched masters: attach to a speech or mark unmatched. Then{" "}
            <strong className="text-[#12124a]">Send to Identify</strong>.
          </li>
        </ol>
        <p className="mt-3 font-body text-xs text-[#364272]">
          Language: <strong className="text-[#12124a]">Intake</strong> = stills → Identify queue.{" "}
          <strong className="text-[#12124a]">Attach</strong> = master → speech for Prep/Pro Edit.{" "}
          <strong className="text-[#12124a]">Approve</strong> stays on County. Prefer Unknown.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] px-3 py-2">
          <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">New stills</p>
          <p className="font-body text-lg font-bold text-[#12124a]">{status.newOnDisk}</p>
          <p className="font-body text-[11px] text-[#364272]">
            {status.nestedNew} nested · {status.flatNew} flat
          </p>
        </div>
        <div className="rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] px-3 py-2">
          <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">Stills in queue</p>
          <p className="font-body text-lg font-bold text-[#12124a]">{status.queueCount}</p>
          <p className="font-body text-[11px] text-[#364272]">
            {status.queueUnknownCounty} need county
          </p>
        </div>
        <div className="rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] px-3 py-2">
          <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">Video masters</p>
          <p className="font-body text-lg font-bold text-[#12124a]">{videoSummary.total}</p>
          <p className="font-body text-[11px] text-[#364272]">
            {videoSummary.matched} matched · {videoSummary.unmatched} unmatched
            {videoSummary.held ? ` · ${videoSummary.held} held` : ""}
          </p>
        </div>
        <div className="rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] px-3 py-2">
          <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">
            Ready for Identify
          </p>
          <p className="font-body text-lg font-bold text-[#12124a]">{readyForIdentify}</p>
          <p className="font-body text-[11px] text-[#364272]">{status.nextStepLabel}</p>
        </div>
      </div>

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDropHover(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDropHover(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDropHover(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDropHover(false);
          if (e.dataTransfer.files?.length) dropFiles(e.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed p-4 text-center ${
          dropHover ? "border-[#000066] bg-[#eef2fb]" : "border-[#000066]/30 bg-white"
        }`}
      >
        <p className="font-heading text-xs font-bold uppercase text-[#000066]">Drop zone</p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Images → <code className="rounded bg-[#f4f7fc] px-1">campaign-photos/</code> · Videos →{" "}
          <code className="rounded bg-[#f4f7fc] px-1">campaign-video-masters/</code>. Not a background
          watcher — after Explorer drops, Rescan. Never auto-Approve.
        </p>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-xs font-bold text-[#000066]">
          Choose images / videos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.mkv,.m4v"
            multiple
            className="hidden"
            disabled={pending}
            onChange={(e) => {
              if (e.target.files?.length) dropFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || (status.newOnDisk === 0 && videoSummary.total === 0)}
          onClick={bringIntoSystem}
          className="rounded-md bg-[#000066] px-4 py-2.5 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          Bring into system
          {status.newOnDisk > 0 ? ` (${status.newOnDisk} stills)` : ""}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={refresh}
          className="rounded-md border-2 border-[#000066] bg-white px-4 py-2.5 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
        >
          Rescan folders
        </button>
        <Link
          href="/admin/evidence-workbench?tab=identify&filter=draft"
          className="rounded-md border-2 border-[#ca913d] bg-white px-4 py-2.5 font-body text-sm font-bold text-[#12124a]"
        >
          Send to Identify
          {identifyBadge}
        </Link>
        <button
          type="button"
          onClick={() => setShowTurbo((v) => !v)}
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-4 py-2.5 font-body text-sm font-semibold text-[#12124a]"
        >
          {showTurbo ? "Hide advanced" : "Advanced · Turbo"}
        </button>
      </div>

      {ownedMediaMatch ? (
        <p className="font-body text-xs text-[#364272]">
          Owned Media DAM after intake:{" "}
          <strong className="text-[#12124a]">{ownedMediaMatch.linked} linked</strong>
          {" · "}
          <strong className="text-[#12124a]">{ownedMediaMatch.unlinked} not linked</strong>
          {" "}(filename match)
        </p>
      ) : null}

      {message ? <p className="font-body text-sm text-[#364272]">{message}</p> : null}

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
            New stills on disk
          </p>
          <p className="font-body text-[11px] text-[#364272]">
            CLI: <code className="rounded bg-[#f4f7fc] px-1">npm run evidence:intake</code>
          </p>
        </div>
        {fresh.length === 0 ? (
          <p className="mt-2 font-body text-sm text-[#364272]">
            No new stills waiting ({status.scannedOnDisk} scanned). Drop images, Rescan if needed, then
            Bring into system.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[#8eb6dc]/40 rounded-lg border border-[#000066]/10">
            {fresh.map((c) => (
              <li key={c.relativePath ?? c.filename} className="flex flex-wrap items-center gap-4 px-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.src} alt="" className="h-16 w-20 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-[#364272]">{c.id}</p>
                  <p className="font-body text-sm">{c.relativePath ?? c.filename}</p>
                  {c.nested ? (
                    <p className="font-body text-xs text-[#ca913d]">
                      Nested — Intake will copy flat (source kept)
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => intakeOne(c.relativePath ?? c.filename)}
                  className="rounded-md bg-[#000066] px-3 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
                >
                  Add to queue
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-4">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
          Video masters
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Auto-match by speech id / YouTube id in the filename. Attach manually when the name does not
          match. Held = intentionally unmatched.
        </p>
        {videoSummary.rows.length === 0 ? (
          <p className="mt-2 font-body text-sm text-[#364272]">
            No masters on disk. Drop .mp4 into campaign-video-masters/ or .local/video-masters/.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[#8eb6dc]/40 rounded-lg border border-[#000066]/10">
            {videoSummary.rows.map((row) => (
              <li key={row.key} className="space-y-2 px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-[#12124a]">{row.filename}</p>
                    <p className="font-mono text-[10px] text-[#364272]">
                      {row.root} · {formatBytes(row.bytes)}
                      {row.publicSrc ? ` · ${row.publicSrc}` : " · local-only"}
                    </p>
                  </div>
                  <span
                    className={`rounded border px-2 py-0.5 font-body text-[10px] font-bold uppercase ${
                      row.matchStatus === "unmatched"
                        ? "border-[#ca913d] bg-[#fff8ef] text-[#12124a]"
                        : row.matchStatus === "held"
                          ? "border-[#8eb6dc] bg-[#f4f7fc] text-[#364272]"
                          : "border-[#000066]/30 bg-[#eef2fb] text-[#000066]"
                    }`}
                  >
                    {row.matchStatus}
                    {row.matchedSpeechTitle ? ` · ${row.matchedSpeechTitle}` : ""}
                  </span>
                </div>

                {row.matchStatus === "unmatched" || row.matchStatus === "held" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="max-w-xs rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2 py-1.5 font-body text-xs text-[#12124a]"
                      value={attachPick[row.key] ?? row.suggestions[0]?.id ?? ""}
                      onChange={(e) =>
                        setAttachPick((prev) => ({ ...prev, [row.key]: e.target.value }))
                      }
                    >
                      <option value="">Select speech…</option>
                      {(row.suggestions.length
                        ? [
                            ...row.suggestions,
                            ...speeches.filter((s) => !row.suggestions.some((x) => x.id === s.id)),
                          ]
                        : speeches
                      ).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.id})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => attachMaster(row)}
                      className="rounded-md bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
                    >
                      Attach
                    </button>
                    {row.matchStatus === "unmatched" ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => holdMaster(row)}
                        className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
                      >
                        Mark unmatched
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => clearOverride(row)}
                        className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
                      >
                        Clear hold
                      </button>
                    )}
                    {row.matchedSpeechId ? (
                      <Link
                        href={`/admin/evidence-workbench?tab=identify&id=${encodeURIComponent(row.matchedSpeechId)}`}
                        className="font-body text-xs font-semibold text-[#000066] underline"
                      >
                        Open in Identify
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {row.matchedSpeechId ? (
                      <Link
                        href={`/admin/evidence-workbench?tab=identify&id=${encodeURIComponent(row.matchedSpeechId)}`}
                        className="rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066]"
                      >
                        Open speech in Identify
                      </Link>
                    ) : null}
                    {row.matchStatus === "attached" ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => clearOverride(row)}
                        className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
                      >
                        Clear attach
                      </button>
                    ) : null}
                    <Link
                      href="/admin/evidence-workbench?tab=edit"
                      className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
                    >
                      Edit / Prep
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showTurbo ? (
        <div className="rounded-lg border-2 border-[#ca913d]/60 bg-[#fff8ef] p-4">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
            Advanced · Turbo ingest (stills only)
          </p>
          <p className="mt-1 font-body text-sm text-[#364272]">
            Proposals only: heuristic/AI geography + website-fit rankings. Operator confirms before
            Approve.
          </p>
          <label className="mt-2 inline-flex items-center gap-2 font-body text-xs text-[#12124a]">
            <input
              type="checkbox"
              checked={turboUseAi}
              onChange={(e) => setTurboUseAi(e.target.checked)}
            />
            Use OpenAI when configured (else heuristic-only)
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => runTurbo(true)}
              className="rounded-md bg-[#000066] px-4 py-2.5 font-body text-sm font-bold text-white disabled:opacity-50"
            >
              Turbo: Intake + Identify + Fit
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => runTurbo(false)}
              className="rounded-md border-2 border-[#000066] bg-white px-4 py-2.5 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
            >
              Turbo: Identify + Fit only
            </button>
          </div>
          {turbo ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded border border-[#ca913d]/40 bg-white px-2 py-1.5">
                <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">
                  Pending proposals
                </p>
                <p className="font-body text-lg font-bold">{turbo.pending}</p>
              </div>
              <div className="rounded border border-[#ca913d]/40 bg-white px-2 py-1.5">
                <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">
                  Live inventory
                </p>
                <p className="font-body text-[11px] text-[#364272]">
                  {turbo.inventory.homepageGalleryLive} homepage ·{" "}
                  {turbo.inventory.acrossArkansasLive} across AR · {turbo.inventory.countyAlbumCount}{" "}
                  albums
                </p>
              </div>
              <div className="rounded border border-[#ca913d]/40 bg-white px-2 py-1.5">
                <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">Last run</p>
                <p className="font-body text-[11px] text-[#364272]">
                  {turbo.lastRunMessage ?? "Not run yet"}
                </p>
              </div>
            </div>
          ) : null}
          {turbo?.top?.length ? (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
              {turbo.top.map((row) => (
                <li
                  key={row.photoId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#8eb6dc]/40 bg-white px-2 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] text-[#12124a]">{row.photoId}</p>
                    <p className="font-body text-[10px] text-[#364272]">
                      {row.county} · {row.identifySource} · best {row.bestSurface ?? "—"} (
                      {row.bestScore})
                    </p>
                  </div>
                  <Link
                    href={`/admin/evidence-workbench?tab=identify&id=${encodeURIComponent(row.photoId)}`}
                    className="shrink-0 font-body text-[11px] font-semibold text-[#000066] underline"
                  >
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <p className="font-body text-xs text-[#364272]">
        Owned Media / YouTube admin remain separate libraries — they do not replace this Arrival queue.
      </p>
    </div>
  );
}
