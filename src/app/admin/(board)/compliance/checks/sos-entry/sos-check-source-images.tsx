"use client";

import type { AprilCheckSourceImage, AprilCheckSosWorkbook } from "@/lib/compliance/checks/april-check-sos-types";
import { groupEntriesByImage } from "@/lib/compliance/checks/april-check-sos-workbook.shared";

export function SosCheckSourceImages({
  sourceImages,
  entries,
  imagesAvailable,
  busy,
  openAiConfigured,
  selectedImagePath,
  onSelectImage,
  onExtractImage,
  onAddManualCheck,
}: {
  sourceImages: AprilCheckSourceImage[];
  entries: AprilCheckSosWorkbook["entries"];
  imagesAvailable: boolean;
  busy: boolean;
  openAiConfigured: boolean;
  selectedImagePath: string | null;
  onSelectImage: (relativePath: string) => void;
  onExtractImage: (relativePath: string) => void;
  onAddManualCheck: (relativePath: string) => void;
}) {
  const byImage = groupEntriesByImage(entries);

  if (!sourceImages.length) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        No photos found under <strong>Checks donations</strong>. Confirm HEIC/JPEG files are in{" "}
        <code className="rounded bg-white px-1">Compliance\April26\Checks donations …</code>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
          Source photos ({sourceImages.length})
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Each photo may show <strong>multiple physical checks</strong>. Use <strong>Extract all checks on photo</strong>{" "}
          to create one SOS row per check.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sourceImages.map((img) => {
          const checks = byImage.get(img.relativePath) ?? [];
          const selected = selectedImagePath === img.relativePath;
          return (
            <article
              key={img.relativePath}
              className={`flex flex-col rounded-xl border bg-white p-3 ${
                selected ? "border-[#0f2744] ring-2 ring-[#0f2744]/25" : "border-slate-200"
              }`}
            >
              {imagesAvailable ? (
                <button type="button" className="text-left" onClick={() => onSelectImage(img.relativePath)}>
                  <img
                    src={`/api/admin/compliance/april26-image?rel=${encodeURIComponent(img.relativePath)}`}
                    alt={img.fileName}
                    className="h-32 w-full rounded-lg border border-slate-200 object-cover bg-slate-100"
                  />
                </button>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                  Image on local PC only
                </div>
              )}
              <p className="mt-2 font-mono text-xs font-semibold text-[#0f2744]">{img.fileName}</p>
              <p className="text-xs text-slate-500">
                {img.checkCount != null
                  ? `${img.checkCount} check(s) on this photo`
                  : checks.length
                    ? `${checks.length} check row(s)`
                    : "Not extracted yet"}
              </p>
              {img.imageWarnings?.length ? (
                <p className="mt-1 text-xs text-amber-800">{img.imageWarnings[0]}</p>
              ) : null}
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={busy || !openAiConfigured}
                  onClick={() => onExtractImage(img.relativePath)}
                  className="rounded-full bg-[#0f2744] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  Extract all checks on photo
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onAddManualCheck(img.relativePath)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold"
                >
                  + Add blank check row
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
