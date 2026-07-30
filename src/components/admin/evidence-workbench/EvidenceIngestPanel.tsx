"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  attachVideoMasterAction,
  bringArrivalIntoSystemAction,
  clearVideoMasterOverrideAction,
  copyReadyGraduationBlocksAction,
  dropCampaignPhotosToDiskAction,
  dropVideoMastersToDiskAction,
  getGraduationAssistMatrixAction,
  getTurboIngestDashboardAction,
  importOwnedMediaToEvidenceDraftAction,
  listArrivalSoftWatchAction,
  listOwnedMediaEvidenceBridgeAction,
  listPhotoIngestCandidatesAction,
  listVideoMasterArrivalAction,
  markVideoMasterUnmatchedAction,
  promotePhotoIngestAction,
  runTurboIngestAction,
} from "@/app/admin/evidence-workbench-actions";
import { EvidenceFolderToWebsiteHero } from "@/components/admin/evidence-workbench/EvidenceFolderToWebsiteHero";
import { buildFolderToWebsiteProgress } from "@/lib/campaign-media/folder-to-website-workflow";

/** Soft-watch poll while Arrival is open — detect only, never auto-Intake/Approve. */
const SOFT_WATCH_INTERVAL_MS = 5000;

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
  matchConfidence: "youtube-id" | "speech-id" | "attached" | "fuzzy" | null;
  matchedSpeechId: string | null;
  matchedSpeechTitle: string | null;
  suggestions: Array<{ id: string; title: string; reason?: string }>;
};

type VideoSummary = {
  total: number;
  matched: number;
  unmatched: number;
  held: number;
  rows: VideoRow[];
};

type SpeechOption = { id: string; title: string; youtubeVideoId: string };

type IntakePreviewRow = {
  relativePath: string;
  nested: boolean;
  flatTarget: string;
  plan:
    | "queue"
    | "copy_then_queue"
    | "reuse_flat_then_queue"
    | "skip_registry"
    | "skip_drafts"
    | "skip_basename_collision";
  warning: string | null;
};

type IntakePreview = {
  willQueue: number;
  willCopyNested: number;
  willSkip: number;
  warnCount: number;
  rows: IntakePreviewRow[];
};

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
  initialPreview: IntakePreview;
  needsApproval?: number;
  approvedPublic?: number;
};

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function stillIdsFromCandidates(list: Candidate[]): string[] {
  return list
    .filter((c) => !c.alreadyInRegistry && !c.alreadyInDrafts)
    .map((c) => c.relativePath ?? c.filename)
    .sort();
}

function masterKeysFromSummary(summary: VideoSummary): string[] {
  return summary.rows.map((r) => r.key).sort();
}

type SoftWatchToast = {
  stillsAdded: number;
  mastersAdded: number;
  atLabel: string;
};

function planLabel(plan: IntakePreviewRow["plan"]): string {
  switch (plan) {
    case "queue":
      return "Queue flat";
    case "copy_then_queue":
      return "Copy nested → flat, then queue";
    case "reuse_flat_then_queue":
      return "Reuse flat on disk, then queue";
    case "skip_registry":
      return "Skip · registry";
    case "skip_drafts":
      return "Skip · already queued";
    case "skip_basename_collision":
      return "Skip · basename collision";
    default:
      return plan;
  }
}

export function EvidenceIngestPanel({
  initialCandidates,
  initialStatus,
  initialVideoSummary,
  initialSpeeches,
  initialPreview,
  needsApproval = 0,
  approvedPublic = 0,
}: Props) {
  const router = useRouter();
  const [candidates, setCandidates] = useState(initialCandidates);
  const [status, setStatus] = useState(initialStatus);
  const [videoSummary, setVideoSummary] = useState(initialVideoSummary);
  const [speeches, setSpeeches] = useState(initialSpeeches);
  const [preview, setPreview] = useState(initialPreview);
  const [attachPick, setAttachPick] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [lastQueued, setLastQueued] = useState(0);
  const [ownedMediaMatch, setOwnedMediaMatch] = useState<{ linked: number; unlinked: number } | null>(
    null,
  );
  const [dropHover, setDropHover] = useState(false);
  const [showTurbo, setShowTurbo] = useState(false);
  const [showBridges, setShowBridges] = useState(false);
  const [showPreviewDetails, setShowPreviewDetails] = useState(false);
  const [turbo, setTurbo] = useState<TurboDash | null>(null);
  const [turboUseAi, setTurboUseAi] = useState(true);
  const [softWatchOn, setSoftWatchOn] = useState(true);
  const [softWatchToast, setSoftWatchToast] = useState<SoftWatchToast | null>(null);
  const [lastSoftScanLabel, setLastSoftScanLabel] = useState<string | null>(null);
  const [ownedBridgeRows, setOwnedBridgeRows] = useState<
    Array<{
      ownedMediaId: string;
      fileName: string;
      title: string;
      reviewStatus: string;
      canImport: boolean;
      reason: string;
      suggestedPhotoId: string;
    }>
  >([]);
  const [ownedBridgeMessage, setOwnedBridgeMessage] = useState("");
  const [gradReadyCount, setGradReadyCount] = useState<number | null>(null);
  const [gradTotal, setGradTotal] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const pendingRef = useRef(pending);
  const softBaselineRef = useRef<{ stillIds: string[]; masterKeys: string[] } | null>(null);

  pendingRef.current = pending;

  function rememberSoftBaseline(nextCandidates: Candidate[], nextVideo: VideoSummary) {
    softBaselineRef.current = {
      stillIds: stillIdsFromCandidates(nextCandidates),
      masterKeys: masterKeysFromSummary(nextVideo),
    };
  }

  useEffect(() => {
    setCandidates(initialCandidates);
    setStatus(initialStatus);
    setVideoSummary(initialVideoSummary);
    setSpeeches(initialSpeeches);
    setPreview(initialPreview);
    rememberSoftBaseline(initialCandidates, initialVideoSummary);
  }, [initialCandidates, initialStatus, initialVideoSummary, initialSpeeches, initialPreview]);

  useEffect(() => {
    void getTurboIngestDashboardAction().then((res) => {
      if (res.dashboard) setTurbo(res.dashboard as TurboDash);
    });
  }, []);

  useEffect(() => {
    if (!softWatchOn) return;
    let cancelled = false;

    async function poll() {
      if (cancelled || pendingRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      const res = await listArrivalSoftWatchAction();
      if (cancelled || !res.ok) return;

      const nextCandidates = res.candidates ?? [];
      const nextStatus = res.status;
      const nextVideo = res.summary;
      if (nextStatus) setStatus(nextStatus);
      if (nextVideo) setVideoSummary(nextVideo);
      if (res.preview) setPreview(res.preview);
      setCandidates(nextCandidates);

      const stillIds = stillIdsFromCandidates(nextCandidates);
      const masterKeys = nextVideo ? masterKeysFromSummary(nextVideo) : [];
      const baseline = softBaselineRef.current;

      if (!baseline) {
        softBaselineRef.current = { stillIds, masterKeys };
      } else {
        const stillsAdded = stillIds.filter((id) => !baseline.stillIds.includes(id)).length;
        const mastersAdded = masterKeys.filter((k) => !baseline.masterKeys.includes(k)).length;
        softBaselineRef.current = { stillIds, masterKeys };
        if (stillsAdded > 0 || mastersAdded > 0) {
          setSoftWatchToast({
            stillsAdded,
            mastersAdded,
            atLabel: new Date().toLocaleTimeString(),
          });
        }
      }

      if (res.polledAt) {
        setLastSoftScanLabel(new Date(res.polledAt).toLocaleTimeString());
      }
    }

    void poll();
    const timer = setInterval(() => {
      void poll();
    }, SOFT_WATCH_INTERVAL_MS);

    function onVisibility() {
      if (document.visibilityState === "visible") void poll();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [softWatchOn]);

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
  const nestedPreviewRows = preview.rows.filter((r) => r.nested);
  const warningRows = preview.rows.filter((r) => r.warning);

  function loadBridges() {
    start(async () => {
      const [owned, grad] = await Promise.all([
        listOwnedMediaEvidenceBridgeAction(),
        getGraduationAssistMatrixAction(),
      ]);
      setOwnedBridgeMessage(owned.message);
      setOwnedBridgeRows(owned.rows ?? []);
      if (grad.matrix) {
        setGradReadyCount(grad.matrix.readyCount);
        setGradTotal(grad.matrix.total);
      }
    });
  }

  function openBridges() {
    const next = !showBridges;
    setShowBridges(next);
    if (next) loadBridges();
  }

  function importOwned(ownedMediaId: string) {
    start(async () => {
      const res = await importOwnedMediaToEvidenceDraftAction(ownedMediaId);
      setMessage(res.message);
      if (res.ok) {
        await refreshAll();
        loadBridges();
      }
    });
  }

  function copyGraduation() {
    start(async () => {
      const res = await copyReadyGraduationBlocksAction({ onlyReady: true });
      setMessage(res.message);
      if (res.ok && res.tsBlocks && typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(res.tsBlocks);
          setMessage(`${res.message} (clipboard)`);
        } catch {
          setMessage(`${res.message} — clipboard blocked; open Publish Ship to copy.`);
        }
      }
    });
  }

  async function refreshAll() {
    const [photos, videos] = await Promise.all([
      listPhotoIngestCandidatesAction(),
      listVideoMasterArrivalAction(),
    ]);
    const nextCandidates = photos.candidates ?? candidates;
    const nextVideo = videos.summary ?? videoSummary;
    if (photos.candidates) setCandidates(photos.candidates);
    if (photos.status) setStatus(photos.status);
    if (photos.preview) setPreview(photos.preview);
    if (videos.summary) setVideoSummary(videos.summary);
    if (videos.speeches) setSpeeches(videos.speeches);
    rememberSoftBaseline(nextCandidates, nextVideo);
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

  function bringIntoSystem(options?: { goIdentify?: boolean }) {
    start(async () => {
      const res = await bringArrivalIntoSystemAction();
      setMessage(res.message);
      setLastQueued(res.ids?.length ?? 0);
      setSoftWatchToast(null);
      if (typeof res.ownedMediaLinked === "number" && typeof res.ownedMediaUnlinked === "number") {
        setOwnedMediaMatch({ linked: res.ownedMediaLinked, unlinked: res.ownedMediaUnlinked });
      }
      if (res.photoStatus) setStatus(res.photoStatus);
      if (res.videoSummary) setVideoSummary(res.videoSummary);
      await refreshAll();
      if (options?.goIdentify) {
        router.push("/admin/evidence-workbench?tab=identify&filter=draft");
      }
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

  const workflowProgress = buildFolderToWebsiteProgress({
    status,
    video: videoSummary,
    preview,
    needsApproval,
    approvedPublic,
  });

  return (
    <div className="space-y-4 text-[#12124a]">
      <EvidenceFolderToWebsiteHero
        progress={workflowProgress}
        softWatchOn={softWatchOn}
        lastSoftScanLabel={lastSoftScanLabel}
        softWatchToast={softWatchToast}
        pending={pending}
        dropHover={dropHover}
        onDropHover={setDropHover}
        onDropFiles={dropFiles}
        onBringAndIdentify={() => bringIntoSystem({ goIdentify: true })}
        onBringOnly={() => bringIntoSystem()}
        onRescan={refresh}
        onToggleSoftWatch={() => setSoftWatchOn((v) => !v)}
        onDismissToast={() => setSoftWatchToast(null)}
      />

      {(preview.willCopyNested > 0 || preview.warnCount > 0 || preview.willSkip > 0) &&
      preview.rows.length > 0 ? (
        <div className="rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
              Before you bring in
            </p>
            <p className="font-body text-[11px] text-[#364272]">
              Queue {preview.willQueue} · copy nested {preview.willCopyNested} · skip {preview.willSkip}
              {preview.warnCount ? ` · ${preview.warnCount} warning(s)` : ""}
            </p>
          </div>
          {warningRows.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {warningRows.slice(0, 6).map((row) => (
                <li key={`warn-${row.relativePath}`} className="font-body text-xs text-[#12124a]">
                  <span className="font-semibold text-[#ca913d]">{planLabel(row.plan)}</span>
                  {" · "}
                  <span className="font-mono text-[10px] text-[#364272]">{row.relativePath}</span>
                  {row.warning ? ` — ${row.warning}` : null}
                </li>
              ))}
              {warningRows.length > 6 ? (
                <li className="font-body text-[11px] text-[#364272]">
                  +{warningRows.length - 6} more warning(s)
                </li>
              ) : null}
            </ul>
          ) : nestedPreviewRows.length > 0 ? (
            <p className="mt-2 font-body text-xs text-[#364272]">
              {nestedPreviewRows.length} nested file(s) will copy flat (originals kept).
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setShowPreviewDetails((v) => !v)}
            className="mt-2 font-body text-[11px] font-semibold text-[#000066] underline"
          >
            {showPreviewDetails ? "Hide full plan" : "Show full nested → flat plan"}
          </button>
          {showPreviewDetails ? (
            <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded border border-[#8eb6dc]/40 bg-white p-2">
              {preview.rows.map((row) => (
                <li key={row.relativePath} className="font-body text-[11px] text-[#12124a]">
                  <span className="font-semibold">{planLabel(row.plan)}</span>
                  {row.nested ? (
                    <>
                      {" "}
                      <span className="font-mono text-[10px] text-[#364272]">{row.relativePath}</span>
                      {" → "}
                      <span className="font-mono text-[10px]">{row.flatTarget}</span>
                    </>
                  ) : (
                    <>
                      {" "}
                      <span className="font-mono text-[10px]">{row.flatTarget}</span>
                    </>
                  )}
                  {row.warning ? <span className="block text-[#364272]">{row.warning}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/evidence-workbench?tab=identify&filter=draft"
          className="rounded-md border-2 border-[#ca913d] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#12124a]"
        >
          Identify queue{identifyBadge}
        </Link>
        <button
          type="button"
          onClick={openBridges}
          className="rounded-md border border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
        >
          {showBridges ? "Hide bridges" : "Bridges"}
        </button>
        <button
          type="button"
          onClick={() => setShowTurbo((v) => !v)}
          className="rounded-md border border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
        >
          {showTurbo ? "Hide Turbo" : "Turbo"}
        </button>
      </div>

      {ownedMediaMatch ? (
        <p className="font-body text-xs text-[#364272]">
          Owned Media after intake:{" "}
          <strong className="text-[#12124a]">{ownedMediaMatch.linked} linked</strong>
          {" · "}
          <strong className="text-[#12124a]">{ownedMediaMatch.unlinked} not linked</strong>
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
          {fresh.map((c) => {
              const pathKey = c.relativePath ?? c.filename;
              const previewRow = preview.rows.find((r) => r.relativePath === pathKey);
              return (
            <li key={pathKey} className="flex flex-wrap items-center gap-4 px-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.src} alt="" className="h-16 w-20 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-[#364272]">{c.id}</p>
                <p className="font-body text-sm">{pathKey}</p>
                {c.nested ? (
                  <p className="font-body text-xs text-[#ca913d]">
                    Nested — will copy flat
                    {previewRow ? ` → ${previewRow.flatTarget}` : " (source kept)"}
                  </p>
                ) : null}
                {previewRow?.warning ? (
                  <p className="font-body text-xs text-[#364272]">{previewRow.warning}</p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => intakeOne(pathKey)}
                className="rounded-md bg-[#000066] px-3 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
              >
                Add to queue
              </button>
            </li>
              );
            })}
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
                    {row.matchConfidence ? ` · ${row.matchConfidence}` : ""}
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
                          {"reason" in s && s.reason ? `[${s.reason}] ` : ""}
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

      {showBridges ? (
        <div className="space-y-4 rounded-lg border-2 border-[#000066]/20 bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
              Bridges · Phase 4
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={loadBridges}
              className="font-body text-[11px] font-semibold text-[#000066] underline disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          <p className="font-body text-xs text-[#364272]">
            Confirm-only bridges. Prefer Unknown. Never silent Approve or registry rewrite.
          </p>

          <div className="rounded-lg border border-[#8eb6dc]/50 bg-[#f4f7fc] p-3">
            <p className="font-heading text-xs font-bold uppercase text-[#000066]">
              Owned Media → Evidence draft
            </p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">
              {ownedBridgeMessage || "Open to load candidates."} LOCAL_DISK images only — copies into
              campaign-photos + draft queue.
            </p>
            {ownedBridgeRows.length === 0 ? (
              <p className="mt-2 font-body text-xs text-[#364272]">No unbridged candidates.</p>
            ) : (
              <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto">
                {ownedBridgeRows.map((row) => (
                  <li
                    key={row.ownedMediaId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#8eb6dc]/40 bg-white px-2 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-body text-xs font-semibold text-[#12124a]">{row.title}</p>
                      <p className="font-mono text-[10px] text-[#364272]">
                        {row.fileName} · {row.reviewStatus} → {row.suggestedPhotoId}
                      </p>
                      <p className="font-body text-[10px] text-[#364272]">{row.reason}</p>
                    </div>
                    <button
                      type="button"
                      disabled={pending || !row.canImport}
                      onClick={() => importOwned(row.ownedMediaId)}
                      className="rounded-md bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
                    >
                      Import draft
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/owned-media"
              className="mt-2 inline-block font-body text-[11px] font-semibold text-[#000066] underline"
            >
              Open Owned Media →
            </Link>
          </div>

          <div className="rounded-lg border border-[#ca913d]/40 bg-[#fff8ef] p-3">
            <p className="font-heading text-xs font-bold uppercase text-[#000066]">
              Draft → registry graduation
            </p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">
              {gradReadyCount != null
                ? `${gradReadyCount} ready / ${gradTotal ?? 0} candidates — clipboard TS only; paste after review.`
                : "Load bridges to see graduation counts."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending || !gradReadyCount}
                onClick={copyGraduation}
                className="rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
              >
                Copy ready TS blocks
              </button>
              <Link
                href="/admin/evidence-workbench?tab=publish#ew-ship-last-mile"
                className="rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066]"
              >
                Open Ship graduation →
              </Link>
            </div>
          </div>
        </div>
      ) : null}

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
