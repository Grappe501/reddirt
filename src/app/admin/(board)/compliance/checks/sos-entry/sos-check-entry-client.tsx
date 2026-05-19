"use client";

import { useCallback, useMemo, useState } from "react";
import { CHECK_SOS_FIELDS, type CheckSosFieldKey } from "@/lib/compliance/checks/check-sos-field-catalog";
import type { AprilCheckSosEntry, AprilCheckSosWorkbook } from "@/lib/compliance/checks/april-check-sos-workbook";

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

export function SosCheckEntryClient({ initialWorkbook }: { initialWorkbook: AprilCheckSosWorkbook }) {
  const [workbook, setWorkbook] = useState(initialWorkbook);
  const [selectedId, setSelectedId] = useState(initialWorkbook.entries[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selected = useMemo(() => workbook.entries.find((e) => e.id === selectedId) ?? null, [workbook, selectedId]);

  const saveEntry = useCallback(
    async (patch: { fields?: Partial<Record<CheckSosFieldKey, string>>; reviewed?: boolean }) => {
      if (!selected) return;
      const res = await fetch("/api/admin/compliance/check-sos-entry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          fields: patch.fields ?? selected.fields,
          reviewed: patch.reviewed ?? selected.reviewed,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { entry: AprilCheckSosEntry };
      setWorkbook((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === data.entry.id ? data.entry : e)),
      }));
      setMessage("Saved.");
    },
    [selected],
  );

  const runExtract = async (id: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/compliance/check-sos-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extract", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extract failed");
      setWorkbook((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === data.entry.id ? data.entry : e)),
      }));
      setMessage("Extraction complete — verify every field against the check image.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Extract failed");
    } finally {
      setBusy(false);
    }
  };

  const runExtractAll = async () => {
    if (!confirm("Run vision extract on all check images? Review each result before SOS entry.")) return;
    setBusy(true);
    setMessage("Extracting all checks (may take several minutes)…");
    try {
      const res = await fetch("/api/admin/compliance/check-sos-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extract_all" }),
      });
      const data = (await res.json()) as AprilCheckSosWorkbook;
      if (!res.ok) throw new Error("Extract all failed");
      setWorkbook(data);
      if (data.entries[0]) setSelectedId(data.entries[0].id);
      setMessage(`Extracted ${data.entries.length} check(s). Verify each before copying to SOS.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Extract all failed");
    } finally {
      setBusy(false);
    }
  };

  const reviewedCount = workbook.entries.filter((e) => e.reviewed).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-3">
        <p className="px-2 text-xs font-bold uppercase text-slate-500">
          Checks ({workbook.entries.length}) · Reviewed {reviewedCount}
        </p>
        <ul className="mt-2 max-h-[70vh] space-y-1 overflow-y-auto">
          {workbook.entries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setSelectedId(e.id)}
                className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                  e.id === selectedId ? "bg-[#0f2744] font-semibold text-white" : "hover:bg-slate-100"
                }`}
              >
                {e.imageFileName}
                {e.reviewed ? <span className="ml-1 text-xs">✓</span> : null}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-2 border-t pt-3">
          <button
            type="button"
            disabled={busy}
            onClick={runExtractAll}
            className="w-full rounded-full border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950"
          >
            Extract all (vision)
          </button>
        </div>
      </aside>

      {selected ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Check image</p>
              <img
                src={`/api/admin/compliance/april26-image?rel=${encodeURIComponent(selected.imageRelativePath)}`}
                alt={selected.imageFileName}
                className="mt-2 max-h-[420px] w-full rounded-lg object-contain bg-slate-100"
              />
              <p className="mt-2 break-all font-mono text-xs text-slate-500">{selected.imageRelativePath}</p>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runExtract(selected.id)}
                  className="rounded-full bg-[#0f2744] px-4 py-2 text-sm font-bold text-white"
                >
                  Extract from image
                </button>
                <button
                  type="button"
                  onClick={() => saveEntry({ reviewed: !selected.reviewed })}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold"
                >
                  {selected.reviewed ? "Mark not reviewed" : "Mark reviewed"}
                </button>
              </div>
              {selected.extraction ? (
                <p className="text-sm text-slate-600">
                  OCR confidence: <strong>{selected.extraction.confidence}</strong>
                  {selected.extraction.missingFields.length ? (
                    <> · Missing: {selected.extraction.missingFields.join(", ")}</>
                  ) : null}
                </p>
              ) : (
                <p className="text-sm text-amber-800">Not extracted yet — click Extract or enter fields manually.</p>
              )}
              {selected.extraction?.warnings?.length ? (
                <ul className="list-disc pl-5 text-xs text-amber-900">
                  {selected.extraction.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <p className="text-sm font-semibold text-[#0f2744]">Copy each value into the matching SOS field (one entry at a time)</p>
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
            onClick={() => saveEntry({ fields: selected.fields })}
            className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Save edits
          </button>
          {message ? <p className="text-sm text-slate-700">{message}</p> : null}
        </div>
      ) : (
        <p className="text-sm">No check images found under April26. Set COMPLIANCE_APRIL26_DIR if needed.</p>
      )}
    </div>
  );
}

