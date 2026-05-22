"use client";

import { useCallback, useMemo, useState } from "react";
import { CHECK_SOS_FIELDS, type CheckSosFieldKey } from "@/lib/compliance/checks/check-sos-field-catalog";
import type { AprilCheckSosEntry, AprilCheckSosWorkbook } from "@/lib/compliance/checks/april-check-sos-types";
import type { CheckReviewFilter } from "@/lib/compliance/checks/april-check-sos-types";
import {
  filterCheckEntries,
  getAprilCheckSosWorkbookStats,
  getEntryMissingRequired,
  getEntryReviewStatus,
} from "@/lib/compliance/checks/april-check-sos-workbook.shared";
import { entryDisplayLabel } from "@/lib/compliance/checks/april-check-sos-workbook.shared";
import { SosCheckReviewTable } from "./sos-check-review-table";
import { SosCheckSourceImages } from "./sos-check-source-images";

function CopyField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <button
          type="button"
          onClick={copy}
          disabled={!value}
          className="shrink-0 rounded-full border border-[#0f2744] px-3 py-1 text-xs font-bold text-[#0f2744] disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <input
        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="(empty — fill from check)"
      />
    </div>
  );
}

const FILTER_DEFS: { id: CheckReviewFilter; label: string }[] = [
  { id: "donation_only", label: "Donation checks" },
  { id: "all", label: "All images" },
  { id: "not_extracted", label: "Not extracted" },
  { id: "needs_review", label: "Needs review" },
  { id: "reviewed", label: "Reviewed" },
];

export function SosCheckEntryClient({
  initialWorkbook,
  imagesAvailable = true,
  openAiConfigured = false,
}: {
  initialWorkbook: AprilCheckSosWorkbook;
  imagesAvailable?: boolean;
  openAiConfigured?: boolean;
}) {
  const [workbook, setWorkbook] = useState(initialWorkbook);
  const [filter, setFilter] = useState<CheckReviewFilter>("donation_only");
  const [selectedId, setSelectedId] = useState(initialWorkbook.entries[0]?.id ?? "");
  const [selectedImagePath, setSelectedImagePath] = useState<string | null>(
    initialWorkbook.sourceImages[0]?.relativePath ?? null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [extractProgress, setExtractProgress] = useState<string | null>(null);

  const filteredEntries = useMemo(
    () => filterCheckEntries(workbook.entries, filter),
    [workbook.entries, filter],
  );

  const selected = useMemo(
    () => workbook.entries.find((e) => e.id === selectedId) ?? null,
    [workbook, selectedId],
  );

  const selectedIndex = useMemo(
    () => (selected ? filteredEntries.findIndex((e) => e.id === selected.id) : -1),
    [filteredEntries, selected],
  );

  const stats = useMemo(() => getAprilCheckSosWorkbookStats(workbook), [workbook]);

  const applyWorkbook = useCallback((next: AprilCheckSosWorkbook) => {
    setWorkbook(next);
    setSelectedId((prev) => {
      if (next.entries.some((e) => e.id === prev)) return prev;
      return next.entries[0]?.id ?? "";
    });
  }, []);

  const patchEntry = useCallback((entry: AprilCheckSosEntry) => {
    setWorkbook((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === entry.id ? entry : e)),
    }));
  }, []);

  const saveEntry = useCallback(
    async (patch: { fields?: Partial<Record<CheckSosFieldKey, string>>; reviewed?: boolean; operatorNotes?: string }) => {
      if (!selected) return;
      const res = await fetch("/api/admin/compliance/check-sos-entry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          fields: patch.fields ?? selected.fields,
          reviewed: patch.reviewed ?? selected.reviewed,
          operatorNotes: patch.operatorNotes ?? selected.operatorNotes,
        }),
      });
      if (!res.ok) {
        setMessage("Save failed.");
        return;
      }
      const data = (await res.json()) as { entry: AprilCheckSosEntry };
      patchEntry(data.entry);
      setMessage("Saved.");
    },
    [selected, patchEntry],
  );

  const runExtractImage = async (imageRelativePath: string) => {
    setBusy(true);
    setMessage(null);
    setSelectedImagePath(imageRelativePath);
    try {
      const res = await fetch("/api/admin/compliance/check-sos-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extract_image", imageRelativePath }),
      });
      const data = (await res.json()) as {
        workbook?: AprilCheckSosWorkbook;
        checkCount?: number;
        error?: string;
      };
      if (!res.ok || !data.workbook) throw new Error(data.error ?? "Extract failed");
      applyWorkbook(data.workbook);
      setMessage(
        `Photo processed: ${data.checkCount ?? 0} physical check(s) listed below. Verify each against the image.`,
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Extract failed");
    } finally {
      setBusy(false);
      setExtractProgress(null);
    }
  };

  const runExtractAllPhotos = async () => {
    const photos = workbook.sourceImages;
    if (!photos.length) {
      setMessage("No donation photos found. Click Rescan folder.");
      return;
    }
    if (!confirm(`Extract all checks from ${photos.length} donation photo(s)? This may take several minutes.`)) return;
    setBusy(true);
    setMessage(null);
    let totalChecks = 0;
    for (let i = 0; i < photos.length; i += 1) {
      const img = photos[i];
      setExtractProgress(`Photo ${i + 1} of ${photos.length}: ${img.fileName}`);
      try {
        const res = await fetch("/api/admin/compliance/check-sos-entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "extract_image", imageRelativePath: img.relativePath }),
        });
        const data = (await res.json()) as { workbook?: AprilCheckSosWorkbook; checkCount?: number; error?: string };
        if (!res.ok || !data.workbook) throw new Error(data.error ?? "Extract failed");
        applyWorkbook(data.workbook);
        totalChecks += data.checkCount ?? 0;
      } catch (e) {
        setMessage(e instanceof Error ? e.message : `Failed on ${img.fileName}`);
        break;
      }
    }
    if (totalChecks > 0) {
      setMessage(`Done. ${totalChecks} check row(s) across ${photos.length} photo(s). Review each before SOS filing.`);
    }
    setBusy(false);
    setExtractProgress(null);
  };

  const runAddManualCheck = async (imageRelativePath: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/compliance/check-sos-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_check", imageRelativePath }),
      });
      const data = (await res.json()) as { entry?: AprilCheckSosEntry };
      if (!res.ok || !data.entry) throw new Error("Could not add row");
      setWorkbook((prev) => ({ ...prev, entries: [...prev.entries, data.entry!] }));
      setSelectedId(data.entry.id);
      setMessage("Blank check row added — fill from the photo if vision missed a check.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Add failed");
    } finally {
      setBusy(false);
    }
  };

  const goToOffset = (offset: number) => {
    if (selectedIndex < 0 || !filteredEntries.length) return;
    const next = (selectedIndex + offset + filteredEntries.length) % filteredEntries.length;
    setSelectedId(filteredEntries[next].id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[#0f2744]/20 bg-gradient-to-br from-white to-slate-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-[#0f2744]">April check workbench</p>
            <p className="mt-1 text-sm text-slate-600">
              {stats.donationFolderImages} source photo(s) · {stats.totalChecks} physical check row(s) · {stats.extracted}{" "}
              extracted · {stats.reviewed} reviewed
            </p>
          </div>
          <ol className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
            <li className="rounded-full bg-[#0f2744] px-3 py-1 text-white">1. Scan</li>
            <li className="rounded-full bg-slate-200 px-3 py-1">2. Extract</li>
            <li className="rounded-full bg-slate-200 px-3 py-1">3. Verify</li>
            <li className="rounded-full bg-slate-200 px-3 py-1">4. File in SOS</li>
          </ol>
        </div>

        {stats.totalChecks === 0 ? (
          <p className="mt-3 text-sm text-amber-900">
            Seven photos live in <strong>Checks donations</strong> — each may contain multiple checks. Use{" "}
            <strong>Extract all checks on photo</strong> (per card below) or <strong>Extract all photos</strong>.
          </p>
        ) : null}
        {!openAiConfigured ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            Add <code className="rounded bg-white px-1">OPENAI_API_KEY</code> to <code className="rounded bg-white px-1">.env.local</code>{" "}
            and restart <code className="rounded bg-white px-1">npm run dev</code> to enable vision extract.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !openAiConfigured}
            onClick={runExtractAllPhotos}
            className="rounded-full bg-[#0f2744] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Extract all photos
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const res = await fetch("/api/admin/compliance/check-sos-entry", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "rebuild" }),
                });
                const data = (await res.json()) as AprilCheckSosWorkbook;
                if (res.ok) {
                  applyWorkbook(data);
                  setMessage(`Rescanned: ${data.sourceImages.length} photo(s), ${data.entries.length} existing check row(s).`);
                }
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold"
          >
            Rescan folder
          </button>
        </div>
        {extractProgress ? <p className="mt-2 text-sm font-medium text-[#0f2744]">{extractProgress}</p> : null}
        {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
      </div>

      <SosCheckSourceImages
        sourceImages={workbook.sourceImages}
        entries={workbook.entries}
        imagesAvailable={imagesAvailable}
        busy={busy}
        openAiConfigured={openAiConfigured}
        selectedImagePath={selectedImagePath}
        onSelectImage={(path) => {
          setSelectedImagePath(path);
          const first = workbook.entries.find((e) => e.imageRelativePath === path);
          if (first) setSelectedId(first.id);
        }}
        onExtractImage={runExtractImage}
        onAddManualCheck={runAddManualCheck}
      />

      <div className="flex flex-wrap gap-2">
        {FILTER_DEFS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              filter === f.id ? "bg-[#0f2744] text-white" : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            {f.label} ({filterCheckEntries(workbook.entries, f.id).length})
          </button>
        ))}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">Physical checks (one SOS entry each)</h2>
        <p className="mb-3 text-xs text-slate-500">Rows appear after you extract a photo. Multiple checks on one image = multiple rows.</p>
      <SosCheckReviewTable
        entries={filteredEntries}
        selectedId={selectedId}
        imagesAvailable={imagesAvailable}
        onSelect={setSelectedId}
      />
      </section>

      {selected ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#0f2744]">{entryDisplayLabel(selected)}</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={filteredEntries.length < 2}
                onClick={() => goToOffset(-1)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-bold"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={filteredEntries.length < 2}
                onClick={() => goToOffset(1)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-bold"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Check image</p>
              {imagesAvailable ? (
                <img
                  src={`/api/admin/compliance/april26-image?rel=${encodeURIComponent(selected.imageRelativePath)}`}
                  alt={selected.imageFileName}
                  className="mt-2 max-h-[480px] w-full rounded-lg border border-slate-200 object-contain bg-slate-100"
                />
              ) : (
                <p className="mt-2 rounded-lg bg-slate-100 p-4 text-sm text-slate-600">Image not available on this host.</p>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || !openAiConfigured}
                  onClick={() => runExtractImage(selected.imageRelativePath)}
                  className="rounded-full bg-[#0f2744] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Re-extract photo
                </button>
                <button
                  type="button"
                  onClick={() => saveEntry({ reviewed: !selected.reviewed })}
                  className="rounded-full border border-emerald-600 px-4 py-2 text-sm font-bold text-emerald-800"
                >
                  {selected.reviewed ? "Unmark reviewed" : "Mark reviewed ✓"}
                </button>
              </div>
              {selected.extraction ? (
                <p className="text-sm text-slate-600">
                  Vision confidence: <strong>{selected.extraction.confidence}</strong>
                  {selected.extraction.missingFields.length ? (
                    <> · Not on check: {selected.extraction.missingFields.join(", ")}</>
                  ) : null}
                </p>
              ) : (
                <p className="text-sm text-amber-800">Not extracted yet.</p>
              )}
              {getEntryMissingRequired(selected).length ? (
                <p className="text-sm text-amber-900">Still need for SOS: {getEntryMissingRequired(selected).join(", ")}</p>
              ) : getEntryReviewStatus(selected) !== "reviewed" ? (
                <p className="text-sm text-emerald-800">All required SOS fields filled — mark reviewed when verified on paper.</p>
              ) : null}
              <label className="block text-sm">
                <span className="text-xs font-bold uppercase text-slate-500">Operator notes</span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  rows={2}
                  value={selected.operatorNotes ?? ""}
                  onChange={(e) => {
                    const notes = e.target.value;
                    setWorkbook((prev) => ({
                      ...prev,
                      entries: prev.entries.map((en) => (en.id === selected.id ? { ...en, operatorNotes: notes } : en)),
                    }));
                  }}
                  onBlur={(e) => saveEntry({ operatorNotes: e.target.value })}
                />
              </label>
            </div>
          </div>

          <p className="text-sm font-semibold text-[#0f2744]">SOS copy fields</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHECK_SOS_FIELDS.map((def) => (
              <CopyField
                key={def.key}
                label={def.label}
                hint={def.sosHint}
                value={selected.fields[def.key] ?? ""}
                onChange={(v) => {
                  const fields = { ...selected.fields, [def.key]: v };
                  setWorkbook((prev) => ({
                    ...prev,
                    entries: prev.entries.map((e) => (e.id === selected.id ? { ...e, fields } : e)),
                  }));
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => saveEntry({ fields: selected.fields, operatorNotes: selected.operatorNotes })}
            className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Save all fields
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-600">Select a check from the list above.</p>
      )}
    </div>
  );
}
