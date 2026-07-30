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
  onDropHover: (v: boolean) => void;
  onDropFiles: (files: FileList | File[]) => void;
  onBringAndIdentify: () => void;
  onBringOnly: () => void;
  onRescan: () => void;
  onToggleSoftWatch: () => void;
  onDismissToast: () => void;
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
      {copied ? "Copied" : "Copy path"}
    </button>
  );
}

function stepTone(
  stepId: FolderToWebsiteStepId,
  next: FolderToWebsiteStepId,
  doneBefore: boolean,
): "done" | "active" | "idle" {
  const order = FOLDER_TO_WEBSITE_STEPS.map((s) => s.id);
  const i = order.indexOf(stepId);
  const n = order.indexOf(next);
  if (i < n || doneBefore) return "done";
  if (i === n) return "active";
  return "idle";
}

/**
 * Folder → Website hero — simple linear path for Arrival.
 * Detect ≠ Intake ≠ Save ≠ Approve ≠ Ship. Never silent Approve.
 */
export function EvidenceFolderToWebsiteHero({
  progress,
  softWatchOn,
  lastSoftScanLabel,
  softWatchToast,
  pending,
  dropHover,
  onDropHover,
  onDropFiles,
  onBringAndIdentify,
  onBringOnly,
  onRescan,
  onToggleSoftWatch,
  onDismissToast,
}: Props) {
  const photosWinPath = `H:\\SOSWebsite\\RedDirt\\${FOLDER_TO_WEBSITE_PHOTOS_REL.replace(/\//g, "\\")}`;
  const mastersWinPath = `H:\\SOSWebsite\\RedDirt\\${FOLDER_TO_WEBSITE_MASTERS_REL.replace(/\//g, "\\")}`;

  const hasWork =
    progress.newOnDisk > 0 ||
    progress.unmatchedMasters > 0 ||
    progress.queuedUnknown > 0 ||
    progress.needsApproval > 0;

  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="overflow-hidden rounded-xl border-2 border-[#000066] bg-white">
        <div className="bg-[#000066] px-4 py-4 text-white sm:px-5">
          <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[#ca913d]">
            Folder → Website
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold tracking-tight sm:text-2xl">
            Get tonight’s media onto the site
          </h2>
          <p className="mt-1 max-w-2xl font-body text-sm text-white/85">
            Drop files · Bring into system · Identify county · Approve albums · Ship to deploy.
            Prefer Unknown — we never invent geography or auto-Approve.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px border-b border-[#000066]/10 bg-[#000066]/10 sm:grid-cols-3 lg:grid-cols-6">
          {FOLDER_TO_WEBSITE_STEPS.map((step) => {
            const tone = stepTone(
              step.id,
              progress.nextStep,
              step.id === "ship" && progress.approvedPublic > 0 && progress.nextStep === "ship"
                ? false
                : FOLDER_TO_WEBSITE_STEPS.findIndex((s) => s.id === step.id) <
                    FOLDER_TO_WEBSITE_STEPS.findIndex((s) => s.id === progress.nextStep),
            );
            return (
              <div
                key={step.id}
                className={cn(
                  "bg-white px-2 py-2.5 text-center",
                  tone === "active" && "bg-[#fff8ef]",
                  tone === "done" && "bg-[#eef2fb]",
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
                <p className="mt-0.5 font-body text-[10px] text-[#364272]">{step.hint}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] px-3 py-3">
            <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">Do this next</p>
            <p className="mt-1 font-body text-sm font-semibold text-[#12124a]">{progress.nextLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(progress.newOnDisk > 0 || progress.unmatchedMasters > 0) && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={onBringAndIdentify}
                  className="rounded-md bg-[#000066] px-4 py-2.5 font-body text-sm font-bold text-white disabled:opacity-50"
                >
                  Bring in → Identify
                  {progress.newOnDisk > 0 ? ` (${progress.newOnDisk})` : ""}
                </button>
              )}
              {progress.newOnDisk > 0 ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={onBringOnly}
                  className="rounded-md border-2 border-[#000066] bg-white px-4 py-2.5 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
                >
                  Bring in only
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

          {softWatchToast ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-[#000066] bg-[#eef2fb] px-3 py-3">
              <p className="font-body text-sm text-[#12124a]">
                <span className="font-bold">New files detected</span>
                {softWatchToast.stillsAdded > 0
                  ? ` · ${softWatchToast.stillsAdded} still(s)`
                  : ""}
                {softWatchToast.mastersAdded > 0
                  ? ` · ${softWatchToast.mastersAdded} master(s)`
                  : ""}
                {" — not auto-intaken · "}
                <span className="text-[#364272]">{softWatchToast.atLabel}</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={onBringAndIdentify}
                  className="rounded-md bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
                >
                  Bring in → Identify
                </button>
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

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-[#000066]/15 bg-[#f4f7fc] p-3">
              <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">
                Stills folder
              </p>
              <p className="mt-1 font-mono text-[11px] leading-relaxed text-[#12124a]">
                {FOLDER_TO_WEBSITE_PHOTOS_REL}/
              </p>
              <p className="mt-0.5 font-body text-[10px] text-[#364272]">
                Nested subfolders OK · originals kept when flattened
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CopyPathButton label="stills" value={photosWinPath} />
                <span className="font-body text-[10px] text-[#364272]">{photosWinPath}</span>
              </div>
            </div>
            <div className="rounded-lg border border-[#000066]/15 bg-[#f4f7fc] p-3">
              <p className="font-heading text-[11px] font-bold uppercase text-[#000066]">
                Video masters folder
              </p>
              <p className="mt-1 font-mono text-[11px] leading-relaxed text-[#12124a]">
                {FOLDER_TO_WEBSITE_MASTERS_REL}/
              </p>
              <p className="mt-0.5 font-body text-[10px] text-[#364272]">
                Flat files only · name with speech id or YouTube id · encode-only:{" "}
                {FOLDER_TO_WEBSITE_LOCAL_MASTERS_HINT}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CopyPathButton label="masters" value={mastersWinPath} />
                <span className="font-body text-[10px] text-[#364272]">{mastersWinPath}</span>
              </div>
            </div>
          </div>

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
              "rounded-xl border-2 border-dashed px-4 py-8 text-center transition",
              dropHover ? "border-[#000066] bg-[#eef2fb]" : "border-[#000066]/35 bg-[#fafbfd]",
            )}
          >
            <p className="font-heading text-sm font-bold text-[#000066]">Drop images or videos here</p>
            <p className="mx-auto mt-1 max-w-md font-body text-xs text-[#364272]">
              Images → stills folder · Videos → masters folder. Same-name files are skipped (no
              silent -2/-3 renames). Soft-watch lists new files — never auto-intakes.
            </p>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border-2 border-[#000066] bg-white px-4 py-2 font-body text-sm font-bold text-[#000066]">
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
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#000066]/20 bg-[#f4f7fc] px-2.5 py-1 font-body text-[11px] font-semibold text-[#12124a]">
                New {progress.newOnDisk}
              </span>
              <span className="rounded-full border border-[#000066]/20 bg-[#f4f7fc] px-2.5 py-1 font-body text-[11px] font-semibold text-[#12124a]">
                Queue {progress.queueCount}
                {progress.queuedUnknown ? ` · ${progress.queuedUnknown} unknown` : ""}
              </span>
              <span className="rounded-full border border-[#000066]/20 bg-[#f4f7fc] px-2.5 py-1 font-body text-[11px] font-semibold text-[#12124a]">
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
            </div>
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
              </button>
            </div>
          </div>

          <p className="font-body text-[11px] text-[#364272]">
            {softWatchOn
              ? `Soft-watch every 5s while this desk is open${
                  lastSoftScanLabel ? ` · last scan ${lastSoftScanLabel}` : ""
                }.`
              : "Soft-watch off — use Rescan after Explorer drops."}
            {!hasWork ? " Queue is clear for Arrival." : ""}
            {progress.previewWarns > 0
              ? ` · ${progress.previewWarns} intake warning(s) below.`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
