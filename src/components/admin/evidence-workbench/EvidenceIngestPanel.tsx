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
  const [dropHover, setDropHover] = useState(false);
  const [showTurbo, setShowTurbo] = useState(false);
  const [showBridges, setShowBridges] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showStills, setShowStills] = useState(false);
  const [showMasters, setShowMasters] = useState(false);
  const [showMatchedMasters, setShowMatchedMasters] = useState(false);
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
  const unmatchedMasterRows = videoSummary.rows.filter(
    (r) => r.matchStatus === "unmatched" || r.matchStatus === "held",
  );
  const matchedMasterRows = videoSummary.rows.filter(
    (r) => r.matchStatus === "auto" || r.matchStatus === "attached",
  );
  const stillsExpanded = showStills;
  const mastersExpanded = showMasters;

  useEffect(() => {
    if (preview.warnCount > 0 || (fresh.length > 0 && fresh.length <= 3)) setShowStills(true);
  }, [preview.warnCount, fresh.length]);

  useEffect(() => {
    if (unmatchedMasterRows.length > 0) setShowMasters(true);
  }, [unmatchedMasterRows.length]);

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

  function openAdvanced() {
    const next = !showAdvanced;
    setShowAdvanced(next);
    if (next && !showBridges) {
      setShowBridges(true);
      loadBridges();
    }
  }

  function scrollToMasters() {
    setShowMasters(true);
    document.getElementById("ew-arrival-masters")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      setLastQueued(res.ids?.length ?? 0);
      setSoftWatchToast(null);
      const ownedNote =
        typeof res.ownedMediaLinked === "number" && typeof res.ownedMediaUnlinked === "number"
          ? `Owned Media: ${res.ownedMediaLinked} linked · ${res.ownedMediaUnlinked} not linked`
          : null;
      setMessage([res.message, ownedNote].filter(Boolean).join(" · "));
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

  function renderMasterRow(row: VideoRow) {
    return (
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
          </div>
        )}
      </li>
    );
  }

  return (
    <div className="space-y-3 text-[#12124a]">
      <EvidenceFolderToWebsiteHero
        progress={workflowProgress}
        softWatchOn={softWatchOn}
        lastSoftScanLabel={lastSoftScanLabel}
        softWatchToast={softWatchToast}
        pending={pending}
        dropHover={dropHover}
        statusMessage={message || null}
        onDropHover={setDropHover}
        onDropFiles={dropFiles}
        onBringAndIdentify={() => bringIntoSystem({ goIdentify: true })}
        onBringOnly={() => bringIntoSystem()}
        onRescan={refresh}
        onToggleSoftWatch={() => setSoftWatchOn((v) => !v)}
        onDismissToast={() => setSoftWatchToast(null)}
        onDismissStatus={() => setMessage("")}
        onScrollToMasters={scrollToMasters}
      />

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white">
        <button
          type="button"
          onClick={() => setShowStills((v) => !v)}
          className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
            New stills
            <span className="ml-2 font-body text-xs font-semibold normal-case text-[#364272]">
              {fresh.length} waiting
              {preview.warnCount ? ` · ${preview.warnCount} warning(s)` : ""}
            </span>
          </p>
          <span className="font-body text-xs font-semibold text-[#000066]">
            {stillsExpanded ? "Hide" : "Review"}
          </span>
        </button>
        {stillsExpanded ? (
          <div className="border-t border-[#000066]/10 px-4 pb-4">
            {fresh.length === 0 ? (
              <p className="mt-3 font-body text-sm text-[#364272]">
                No new stills ({status.scannedOnDisk} scanned). Drop files above, then Bring in.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[#8eb6dc]/40 rounded-lg border border-[#000066]/10">
                {fresh.map((c) => {
                  const pathKey = c.relativePath ?? c.filename;
                  const previewRow = preview.rows.find((r) => r.relativePath === pathKey);
                  return (
                    <li key={pathKey} className="flex flex-wrap items-center gap-4 px-3 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.src} alt="" className="h-14 w-20 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-[#364272]">{c.id}</p>
                        <p className="font-body text-sm">{pathKey}</p>
                        {c.nested ? (
                          <p className="font-body text-xs text-[#ca913d]">
                            Nested — will copy flat
                            {previewRow ? ` → ${previewRow.flatTarget}` : ""}
                          </p>
                        ) : null}
                        {previewRow?.warning ? (
                          <p className="font-body text-xs text-[#364272]">{previewRow.warning}</p>
                        ) : null}
                        {previewRow ? (
                          <p className="font-body text-[10px] text-[#364272]">
                            {planLabel(previewRow.plan)}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => intakeOne(pathKey)}
                        className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-xs font-bold text-[#000066] disabled:opacity-50"
                      >
                        Add one
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div id="ew-arrival-masters" className="rounded-lg border-2 border-[#000066]/15 bg-white">
        <button
          type="button"
          onClick={() => setShowMasters((v) => !v)}
          className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
            Video masters
            <span className="ml-2 font-body text-xs font-semibold normal-case text-[#364272]">
              {videoSummary.rows.length} on disk
              {unmatchedMasterRows.length
                ? ` · ${unmatchedMasterRows.length} need attach`
                : matchedMasterRows.length
                  ? " · all matched"
                  : ""}
            </span>
          </p>
          <span className="font-body text-xs font-semibold text-[#000066]">
            {mastersExpanded ? "Hide" : "Review"}
          </span>
        </button>
        {mastersExpanded ? (
          <div className="border-t border-[#000066]/10 px-4 pb-4">
            <p className="mt-3 font-body text-xs text-[#364272]">
              Auto-match by speech id / YouTube id in the filename. Attach manually when unmatched —
              Prefer Unknown, no invented matches.
            </p>
            {videoSummary.rows.length === 0 ? (
              <p className="mt-2 font-body text-sm text-[#364272]">
                No masters yet. Drop .mp4 into campaign-video-masters/ or use Explorer paths above.
              </p>
            ) : (
              <>
                {unmatchedMasterRows.length > 0 ? (
                  <ul className="mt-3 divide-y divide-[#8eb6dc]/40 rounded-lg border border-[#000066]/10">
                    {unmatchedMasterRows.map((row) => renderMasterRow(row))}
                  </ul>
                ) : (
                  <p className="mt-2 font-body text-sm text-[#364272]">No unmatched masters.</p>
                )}
                {matchedMasterRows.length > 0 ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowMatchedMasters((v) => !v)}
                      className="font-body text-[11px] font-semibold text-[#000066] underline"
                    >
                      {showMatchedMasters
                        ? "Hide matched masters"
                        : `Show ${matchedMasterRows.length} matched master(s)`}
                    </button>
                    {showMatchedMasters ? (
                      <ul className="mt-2 divide-y divide-[#8eb6dc]/40 rounded-lg border border-[#000066]/10">
                        {matchedMasterRows.map((row) => renderMasterRow(row))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-[#000066]/15 bg-[#fafbfd]">
        <button
          type="button"
          onClick={openAdvanced}
          className="flex w-full items-center justify-between px-4 py-2.5 text-left"
        >
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#364272]">
            Advanced · Bridges & Turbo
          </p>
          <span className="font-body text-[11px] font-semibold text-[#000066]">
            {showAdvanced ? "Hide" : "Show"}
          </span>
        </button>
        {showAdvanced ? (
          <div className="space-y-4 border-t border-[#000066]/10 px-4 pb-4 pt-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowBridges(true);
                  loadBridges();
                }}
                className="rounded-md border border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold"
              >
                Refresh bridges
              </button>
              <button
                type="button"
                onClick={() => setShowTurbo((v) => !v)}
                className="rounded-md border border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold"
              >
                {showTurbo ? "Hide Turbo" : "Show Turbo"}
              </button>
              {status.queueCount > 0 ? (
                <Link
                  href="/admin/evidence-workbench?tab=identify&filter=draft"
                  className="rounded-md border border-[#ca913d] bg-white px-3 py-1.5 font-body text-xs font-semibold"
                >
                  Identify queue ({status.queueCount}
                  {lastQueued > 0 ? ` · +${lastQueued}` : ""})
                </Link>
              ) : null}
            </div>

            {showBridges ? (
              <div className="space-y-3 rounded-lg border border-[#000066]/15 bg-white p-3">
                <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                  Bridges · confirm only
                </p>
                <div className="rounded border border-[#8eb6dc]/50 bg-[#f4f7fc] p-3">
                  <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                    Owned Media → Evidence draft
                  </p>
                  <p className="mt-1 font-body text-[11px] text-[#364272]">
                    {ownedBridgeMessage || "Loading…"} LOCAL_DISK images only.
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
                            <p className="font-body text-xs font-semibold text-[#12124a]">
                              {row.title}
                            </p>
                            <p className="font-mono text-[10px] text-[#364272]">
                              {row.fileName} · {row.reviewStatus} → {row.suggestedPhotoId}
                            </p>
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

                <div className="rounded border border-[#ca913d]/40 bg-[#fff8ef] p-3">
                  <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                    Draft → registry graduation
                  </p>
                  <p className="mt-1 font-body text-[11px] text-[#364272]">
                    {gradReadyCount != null
                      ? `${gradReadyCount} ready / ${gradTotal ?? 0} — clipboard TS only.`
                      : "Refresh bridges for counts."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pending || !gradReadyCount}
                      onClick={copyGraduation}
                      className="rounded-md bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
                    >
                      Copy ready TS blocks
                    </button>
                    <Link
                      href="/admin/evidence-workbench?tab=publish#ew-ship-last-mile"
                      className="rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066]"
                    >
                      Open Ship →
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {showTurbo ? (
              <div className="rounded-lg border border-[#ca913d]/50 bg-[#fff8ef] p-3">
                <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                  Turbo ingest (stills · proposals only)
                </p>
                <label className="mt-2 inline-flex items-center gap-2 font-body text-xs">
                  <input
                    type="checkbox"
                    checked={turboUseAi}
                    onChange={(e) => setTurboUseAi(e.target.checked)}
                  />
                  Use OpenAI when configured
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runTurbo(true)}
                    className="rounded-md bg-[#000066] px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
                  >
                    Turbo: Intake + Identify + Fit
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runTurbo(false)}
                    className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-xs font-bold text-[#000066] disabled:opacity-50"
                  >
                    Turbo: Identify + Fit only
                  </button>
                </div>
                {turbo ? (
                  <p className="mt-2 font-body text-[11px] text-[#364272]">
                    Pending {turbo.pending} · {turbo.lastRunMessage ?? "Not run yet"}
                  </p>
                ) : null}
                {turbo?.top?.length ? (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                    {turbo.top.map((row) => (
                      <li
                        key={row.photoId}
                        className="flex justify-between gap-2 rounded border border-[#8eb6dc]/40 bg-white px-2 py-1.5"
                      >
                        <span className="font-mono text-[11px]">{row.photoId}</span>
                        <Link
                          href={`/admin/evidence-workbench?tab=identify&id=${encodeURIComponent(row.photoId)}`}
                          className="font-body text-[11px] font-semibold text-[#000066] underline"
                        >
                          Review
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
