"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  dropCampaignPhotosToDiskAction,
  getTurboIngestDashboardAction,
  listPhotoIngestCandidatesAction,
  promoteAllPhotoIngestAction,
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
};

export function EvidenceIngestPanel({ initialCandidates, initialStatus }: Props) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [lastQueued, setLastQueued] = useState(0);
  const [ownedMediaMatch, setOwnedMediaMatch] = useState<{ linked: number; unlinked: number } | null>(
    null,
  );
  const [dropHover, setDropHover] = useState(false);
  const [turbo, setTurbo] = useState<TurboDash | null>(null);
  const [turboUseAi, setTurboUseAi] = useState(true);
  const [pending, start] = useTransition();

  useEffect(() => {
    setCandidates(initialCandidates);
    setStatus(initialStatus);
  }, [initialCandidates, initialStatus]);

  useEffect(() => {
    void getTurboIngestDashboardAction().then((res) => {
      if (res.dashboard) setTurbo(res.dashboard as TurboDash);
    });
  }, []);

  const fresh = candidates.filter((c) => !c.alreadyInRegistry && !c.alreadyInDrafts);

  function refresh() {
    start(async () => {
      const res = await listPhotoIngestCandidatesAction();
      setMessage(res.message);
      if (res.candidates) setCandidates(res.candidates);
      if (res.status) setStatus(res.status);
      const dash = await getTurboIngestDashboardAction();
      if (dash.dashboard) setTurbo(dash.dashboard as TurboDash);
    });
  }

  function intakeAll() {
    start(async () => {
      const res = await promoteAllPhotoIngestAction();
      setMessage(res.message);
      setLastQueued(res.ids?.length ?? 0);
      if (typeof res.ownedMediaLinked === "number" && typeof res.ownedMediaUnlinked === "number") {
        setOwnedMediaMatch({ linked: res.ownedMediaLinked, unlinked: res.ownedMediaUnlinked });
      }
      const again = await listPhotoIngestCandidatesAction();
      if (again.candidates) setCandidates(again.candidates);
      if (again.status) setStatus(again.status);
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
      const again = await listPhotoIngestCandidatesAction();
      if (again.candidates) setCandidates(again.candidates);
      if (again.status) setStatus(again.status);
    });
  }

  function intakeOne(pathOrName: string) {
    start(async () => {
      const res = await promotePhotoIngestAction(pathOrName);
      setMessage(res.message);
      if (res.ok) {
        setLastQueued(1);
        const again = await listPhotoIngestCandidatesAction();
        if (again.candidates) setCandidates(again.candidates);
        if (again.status) setStatus(again.status);
      }
    });
  }

  function dropFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(f.name));
    if (!files.length) {
      setMessage("Drop image files only (jpg/png/webp/gif).");
      return;
    }
    start(async () => {
      const fd = new FormData();
      for (const f of files.slice(0, 40)) fd.append("files", f);
      const res = await dropCampaignPhotosToDiskAction(fd);
      setMessage(res.message);
      const again = await listPhotoIngestCandidatesAction();
      if (again.candidates) setCandidates(again.candidates);
      if (again.status) setStatus(again.status);
    });
  }

  const readyForIdentify = status.queueCount;
  const identifyBadge =
    lastQueued > 0
      ? ` (+${lastQueued})`
      : status.queueUnknownCounty > 0
        ? ` (${status.queueUnknownCounty} need county)`
        : readyForIdentify > 0
          ? ` (${readyForIdentify})`
          : "";

  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
          Intake · stills only
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 font-body text-sm text-[#364272]">
          <li>
            Drop stills into{" "}
            <code className="rounded bg-[#f4f7fc] px-1">public/media/campaign-photos/</code>{" "}
            (subfolders OK) or use the drop zone below.
          </li>
          <li>
            Click <strong className="text-[#12124a]">Rescan folder</strong> if you dropped files outside
            this browser (no auto-watch yet). Then{" "}
            <strong className="text-[#12124a]">Intake all new</strong> — flattens nested copies into the
            queue. Originals are never deleted.
          </li>
          <li>
            Open <strong className="text-[#12124a]">Identify</strong> → set county → Save → Route. Approve
            happens on the County desk — never here.
          </li>
        </ol>
        <p className="mt-3 font-body text-xs text-[#364272]">
          Language: <strong className="text-[#12124a]">Intake</strong> = add to Identify queue.{" "}
          <strong className="text-[#12124a]">Save</strong> = write geography.{" "}
          <strong className="text-[#12124a]">Approve</strong> = public albums (County). Derivative Promote
          on Edit is a separate src-override step.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] px-3 py-2">
          <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">New on disk</p>
          <p className="font-body text-lg font-bold text-[#12124a]">{status.newOnDisk}</p>
          <p className="font-body text-[11px] text-[#364272]">
            {status.nestedNew} nested · {status.flatNew} flat · not yet intaken
          </p>
        </div>
        <div className="rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] px-3 py-2">
          <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">In queue</p>
          <p className="font-body text-lg font-bold text-[#12124a]">{status.queueCount}</p>
          <p className="font-body text-[11px] text-[#364272]">
            {status.queueUnknownCounty} still need county · drafts in system
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
          dropHover
            ? "border-[#000066] bg-[#eef2fb]"
            : "border-[#000066]/30 bg-white"
        }`}
      >
        <p className="font-heading text-xs font-bold uppercase text-[#000066]">Drop zone</p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Drop stills here to write into{" "}
          <code className="rounded bg-[#f4f7fc] px-1">public/media/campaign-photos/</code>. This is not
          a background watcher — after Explorer drops, click <strong className="text-[#12124a]">Rescan
          folder</strong>, then Intake. Never auto-Approve.
        </p>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-xs font-bold text-[#000066]">
          Choose images
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
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
          disabled={pending || status.newOnDisk === 0}
          onClick={intakeAll}
          className="rounded-md bg-[#000066] px-4 py-2.5 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          Intake all new ({status.newOnDisk})
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={refresh}
          className="rounded-md border-2 border-[#000066] bg-white px-4 py-2.5 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
        >
          Rescan folder
        </button>
        <Link
          href="/admin/evidence-workbench?tab=identify&filter=draft"
          className="rounded-md border-2 border-[#ca913d] bg-white px-4 py-2.5 font-body text-sm font-bold text-[#12124a]"
        >
          Send to Identify
          {identifyBadge}
        </Link>
      </div>

      {ownedMediaMatch ? (
        <p className="font-body text-xs text-[#364272]">
          Owned Media DAM after intake:{" "}
          <strong className="text-[#12124a]">{ownedMediaMatch.linked} linked</strong>
          {" · "}
          <strong className="text-[#12124a]">{ownedMediaMatch.unlinked} not linked</strong>
          {" "}(filename match — open Identify for Linked / Not linked chip)
        </p>
      ) : null}

      <div className="rounded-lg border-2 border-[#ca913d]/60 bg-[#fff8ef] p-4">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
          Turbo ingest — identify + website fit
        </p>
        <p className="mt-1 font-body text-sm text-[#364272]">
          Automates proposals: heuristic/AI geography guesses + ranked website surfaces (homepage, journey,
          county albums, From the Road). Operator still confirms before Approve.
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
              <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">Pending proposals</p>
              <p className="font-body text-lg font-bold">{turbo.pending}</p>
            </div>
            <div className="rounded border border-[#ca913d]/40 bg-white px-2 py-1.5">
              <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">Live inventory</p>
              <p className="font-body text-[11px] text-[#364272]">
                {turbo.inventory.homepageGalleryLive} homepage · {turbo.inventory.acrossArkansasLive} across AR ·{" "}
                {turbo.inventory.countyAlbumCount} albums
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
                    {row.county} · {row.identifySource} · best {row.bestSurface ?? "—"} ({row.bestScore})
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
        {turbo?.inventory.thinCounties?.length ? (
          <p className="mt-2 font-body text-[10px] text-[#364272]">
            Thin county albums (boost fit): {turbo.inventory.thinCounties.slice(0, 8).join(", ")}
            {turbo.inventory.thinCounties.length > 8 ? "…" : ""}
          </p>
        ) : null}
      </div>

      {message ? <p className="font-body text-sm text-[#364272]">{message}</p> : null}

      <p className="font-body text-xs text-[#364272]">
        Owned Media / YouTube are separate libraries — they do not feed this stills queue. CLI equivalent:{" "}
        <code className="rounded bg-[#f4f7fc] px-1">npm run evidence:intake</code>
      </p>

      {fresh.length === 0 ? (
        <p className="font-body text-sm text-[#364272]">
          No new files waiting ({status.scannedOnDisk} scanned). Drop into campaign-photos, click Rescan
          folder if needed, then Intake all new.
        </p>
      ) : (
        <ul className="divide-y divide-[#8eb6dc]/40 rounded-lg border-2 border-[#000066]/15 bg-white">
          {fresh.map((c) => (
            <li key={c.relativePath ?? c.filename} className="flex flex-wrap items-center gap-4 px-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.src} alt="" className="h-16 w-20 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-[#364272]">{c.id}</p>
                <p className="font-body text-sm">{c.relativePath ?? c.filename}</p>
                {c.nested ? (
                  <p className="font-body text-xs text-[#ca913d]">Nested — Intake will copy flat (source kept)</p>
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
  );
}
