"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FOLDER_TO_WEBSITE_LOCAL_MASTERS_HINT,
  FOLDER_TO_WEBSITE_MASTERS_REL,
  FOLDER_TO_WEBSITE_PHOTOS_REL,
  FOLDER_TO_WEBSITE_STEPS,
  type FolderToWebsiteProgress,
  type FolderToWebsiteStepId,
} from "@/lib/campaign-media/folder-to-website-workflow";
import { cn } from "@/lib/utils";

type Props = {
  progress: FolderToWebsiteProgress;
  softWatchOn: boolean;
  lastSoftScanLabel: string | null;
  softWatchToast: { stillsAdded: number; mastersAdded: number; atLabel: string } | null;
  pending: boolean;
  dropHover: boolean;
  statusMessage: string | null;
  onDropHover: (v: boolean) => void;
  onDropFiles: (files: FileList | File[]) => void;
  onBringAndIdentify: () => void;
  onBringOnly: () => void;
  onRescan: () => void;
  onToggleSoftWatch: () => void;
  onDismissToast: () => void;
  onDismissStatus: () => void;
  onScrollToMasters: () => void;
};

function CopyPathButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="rounded border border-[#8eb6dc] bg-white px-2 py-0.5 font-body text-[10px] font-semibold text-[#000066]"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function stepTone(
  stepId: FolderToWebsiteStepId,
  next: FolderToWebsiteStepId,
  detectPulse: boolean,
): "done" | "active" | "idle" {
  const order = FOLDER_TO_WEBSITE_STEPS.map((s) => s.id);
  const i = order.indexOf(stepId);
  const n = order.indexOf(next);
  if (stepId === "detect" && detectPulse) return "active";
  if (i < n) return "done";
  if (i === n) return "active";
  return "idle";
}

/**
 * Folder → Website hero — Drop first, one Do-this-next, paths on demand.
 * Detect ≠ Intake ≠ Save ≠ Approve ≠ Ship. Never silent Approve.
 */
export function EvidenceFolderToWebsiteHero({
  progress,
  softWatchOn,
  lastSoftScanLabel,
  softWatchToast,
  pending,
  dropHover,
  statusMessage,
  onDropHover,
  onDropFiles,
  onBringAndIdentify,
  onBringOnly,
  onRescan,
  onToggleSoftWatch,
  onDismissToast,
  onDismissStatus,
  onScrollToMasters,
}: Props) {
  const [showPaths, setShowPaths] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const photosWinPath = `H:\\SOSWebsite\\RedDirt\\${FOLDER_TO_WEBSITE_PHOTOS_REL.replace(/\//g, "\\")}`;
  const mastersWinPath = `H:\\SOSWebsite\\RedDirt\\${FOLDER_TO_WEBSITE_MASTERS_REL.replace(/\//g, "\\")}`;

  const hasStills = progress.newOnDisk > 0;
  const mastersOnly = !hasStills && progress.unmatchedMasters > 0;
  const detectPulse = Boolean(softWatchToast);
  const planBits: string[] = [];
  if (progress.previewWillQueue > 0) planBits.push(`queue ${progress.previewWillQueue}`);
  if (progress.nestedNew > 0) planBits.push(`${progress.nestedNew} nested → flat`);
  if (progress.previewWarns > 0) planBits.push(`${progress.previewWarns} warning(s)`);

  const railNext = detectPulse && progress.nextStep === "bring" ? "bring" : progress.nextStep;

  return (
    <div className="space-y-3 text-[#12124a]">
      <div className="overflow-hidden rounded-xl border-2 border-[#000066] bg-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3 bg-[#000066] px-4 py-3.5 text-white sm:px-5">
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[#ca913d]">
              Folder → Website
            </p>
            <h2 className="mt-0.5 font-heading text-xl font-bold tracking-tight sm:text-2xl">
              Drop · Bring in · Ship
            </h2>
          </div>
          <p className="max-w-md font-body text-xs text-white/80">
            Prefer Unknown — never invent geography or auto-Approve.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-px border-b border-[#000066]/10 bg-[#000066]/10 sm:grid-cols-6">
          {FOLDER_TO_WEBSITE_STEPS.map((step) => {
            const tone = stepTone(step.id, railNext, detectPulse && step.id === "detect");
            return (
              <div
                key={step.id}
                className={cn(
                  "bg-white px-1.5 py-2 text-center transition-colors",
                  tone === "active" && "bg-[#fff8ef] ring-1 ring-inset ring-[#ca913d]/40",
                  tone === "done" && "bg-[#eef2fb]",
                  step.id === "detect" && detectPulse && "animate-pulse",
                )}
              >
                <p
                  className={cn(
                    "font-heading text-[10px] font-bold uppercase tracking-wide",
                    tone === "active" ? "text-[#000066]" : "text-[#364272]",
                  )}
                >
                  {step.n}. {step.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              onDropHover(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              onDropHover(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              onDropHover(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              onDropHover(false);
              if (e.dataTransfer.files?.length) onDropFiles(e.dataTransfer.files);
            }}
            className={cn(
              "rounded-xl border-2 border-dashed px-4 py-7 text-center transition",
              dropHover ? "border-[#000066] bg-[#eef2fb] scale-[1.01]" : "border-[#000066]/35 bg-[#fafbfd]",
            )}
          >
            <p className="font-heading text-base font-bold text-[#000066]">Drop images or videos here</p>
            <p className="mx-auto mt-1 max-w-lg font-body text-xs text-[#364272]">
              Images → stills · videos → masters. Same name skipped (no -2/-3). Soft-watch detects —
              never auto-intakes.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border-2 border-[#000066] bg-white px-4 py-2 font-body text-sm font-bold text-[#000066]">
                Choose files
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.mkv,.m4v"
                  multiple
                  className="hidden"
                  disabled={pending}
                  onChange={(e) => {
                    if (e.target.files?.length) onDropFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowPaths((v) => !v)}
                className="rounded-md border border-[#8eb6dc] bg-white px-3 py-2 font-body text-xs font-semibold text-[#000066]"
              >
                {showPaths ? "Hide folder paths" : "Explorer folder paths"}
              </button>
            </div>
          </div>

          {showPaths ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-[#000066]/15 bg-[#f4f7fc] px-3 py-2.5">
                <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">Stills</p>
                <p className="mt-0.5 font-mono text-[11px] text-[#12124a]">
                  {FOLDER_TO_WEBSITE_PHOTOS_REL}/
                </p>
                <p className="font-body text-[10px] text-[#364272]">Nested OK · originals kept</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <CopyPathButton label="stills" value={photosWinPath} />
                  <span className="truncate font-body text-[10px] text-[#364272]">{photosWinPath}</span>
                </div>
              </div>
              <div className="rounded-lg border border-[#000066]/15 bg-[#f4f7fc] px-3 py-2.5">
                <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">
                  Video masters
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-[#12124a]">
                  {FOLDER_TO_WEBSITE_MASTERS_REL}/
                </p>
                <p className="font-body text-[10px] text-[#364272]">
                  Flat · speech/YT id in name · encode: {FOLDER_TO_WEBSITE_LOCAL_MASTERS_HINT}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <CopyPathButton label="masters" value={mastersWinPath} />
                  <span className="truncate font-body text-[10px] text-[#364272]">{mastersWinPath}</span>
                </div>
              </div>
            </div>
          ) : null}

          {softWatchToast ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-[#000066] bg-[#eef2fb] px-3 py-2.5">
              <p className="font-body text-sm text-[#12124a]">
                <span className="font-bold">Detected</span>
                {softWatchToast.stillsAdded > 0
                  ? ` · ${softWatchToast.stillsAdded} still(s)`
                  : ""}
                {softWatchToast.mastersAdded > 0
                  ? ` · ${softWatchToast.mastersAdded} master(s)`
                  : ""}
                <span className="text-[#364272]"> · {softWatchToast.atLabel}</span>
              </p>
              <div className="flex gap-2">
                {softWatchToast.stillsAdded > 0 ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={onBringAndIdentify}
                    className="rounded-md bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
                  >
                    Bring in → Identify
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onScrollToMasters}
                    className="rounded-md bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
                  >
                    Attach masters ↓
                  </button>
                )}
                <button
                  type="button"
                  onClick={onDismissToast}
                  className="rounded-md border border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] px-3 py-3">
            <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">Do this next</p>
            <p className="mt-1 font-body text-sm font-semibold text-[#12124a]">{progress.nextLabel}</p>
            {planBits.length > 0 && hasStills ? (
              <p className="mt-1 font-body text-[11px] text-[#364272]">
                Plan: {planBits.join(" · ")}
                <button
                  type="button"
                  onClick={() => setShowPlan((v) => !v)}
                  className="ml-2 font-semibold text-[#000066] underline"
                >
                  {showPlan ? "Hide" : "Details"}
                </button>
              </p>
            ) : null}
            {showPlan && hasStills ? (
              <p className="mt-1 font-body text-[11px] text-[#364272]">
                Nested files copy flat (originals kept). Warnings appear in New stills below before
                you bring in.
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {hasStills ? (
                <>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={onBringAndIdentify}
                    className="rounded-md bg-[#000066] px-4 py-2.5 font-body text-sm font-bold text-white disabled:opacity-50"
                  >
                    Bring in → Identify ({progress.newOnDisk})
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={onBringOnly}
                    className="rounded-md border-2 border-[#000066] bg-white px-4 py-2.5 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
                  >
                    Bring in only
                  </button>
                </>
              ) : null}
              {mastersOnly ? (
                <button
                  type="button"
                  onClick={onScrollToMasters}
                  className="rounded-md bg-[#000066] px-4 py-2.5 font-body text-sm font-bold text-white"
                >
                  Attach masters ↓ ({progress.unmatchedMasters})
                </button>
              ) : null}
              {progress.nextStep !== "bring" && progress.nextStep !== "drop" ? (
                <Link
                  href={progress.nextHref}
                  className="rounded-md border-2 border-[#ca913d] bg-white px-4 py-2.5 font-body text-sm font-bold text-[#12124a]"
                >
                  Continue →
                </Link>
              ) : null}
            </div>
          </div>

          {statusMessage ? (
            <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-[#000066]/20 bg-[#f4f7fc] px-3 py-2">
              <p className="min-w-0 flex-1 font-body text-sm text-[#12124a]">{statusMessage}</p>
              <button
                type="button"
                onClick={onDismissStatus}
                className="shrink-0 font-body text-[11px] font-semibold text-[#000066] underline"
              >
                Clear
              </button>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 font-body text-[11px] font-semibold",
                progress.newOnDisk > 0
                  ? "border-[#ca913d] bg-[#fff8ef] text-[#12124a]"
                  : "border-[#000066]/20 bg-[#f4f7fc] text-[#12124a]",
              )}
            >
              New {progress.newOnDisk}
            </span>
            <span className="rounded-full border border-[#000066]/20 bg-[#f4f7fc] px-2.5 py-1 font-body text-[11px] font-semibold text-[#12124a]">
              Queue {progress.queueCount}
              {progress.queuedUnknown ? ` · ${progress.queuedUnknown} unknown` : ""}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 font-body text-[11px] font-semibold",
                progress.unmatchedMasters > 0
                  ? "border-[#ca913d] bg-[#fff8ef] text-[#12124a]"
                  : "border-[#000066]/20 bg-[#f4f7fc] text-[#12124a]",
              )}
            >
              Masters {progress.mastersTotal}
              {progress.unmatchedMasters ? ` · ${progress.unmatchedMasters} unmatched` : ""}
            </span>
            <Link
              href="/admin/evidence-workbench?tab=county"
              className="rounded-full border border-[#ca913d]/50 bg-[#fff8ef] px-2.5 py-1 font-body text-[11px] font-semibold text-[#12124a]"
            >
              Need approve {progress.needsApproval}
            </Link>
            <Link
              href="/admin/evidence-workbench?tab=publish#ew-ship-last-mile"
              className="rounded-full border border-[#000066]/20 bg-white px-2.5 py-1 font-body text-[11px] font-semibold text-[#000066]"
            >
              Approved {progress.approvedPublic} · Ship →
            </Link>
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={onRescan}
                className="rounded-md border border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold disabled:opacity-50"
              >
                Rescan
              </button>
              <button
                type="button"
                onClick={onToggleSoftWatch}
                className={cn(
                  "rounded-md border px-3 py-1.5 font-body text-xs font-semibold",
                  softWatchOn
                    ? "border-[#000066]/30 bg-[#eef2fb] text-[#000066]"
                    : "border-[#8eb6dc] bg-white",
                )}
              >
                Soft-watch {softWatchOn ? "on" : "off"}
                {softWatchOn && lastSoftScanLabel ? ` · ${lastSoftScanLabel}` : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
