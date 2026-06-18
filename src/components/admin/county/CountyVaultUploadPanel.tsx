"use client";

import { useCallback, useState } from "react";

type Props = {
  countySlug: string;
  countyDisplayName: string;
  uploadEndpoint: string;
  showCityField?: boolean;
};

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "done"; result: UploadResult }
  | { phase: "error"; message: string };

type UploadResult = {
  batchId: string;
  imported: number;
  skipped: number;
  assetIds: string[];
  analysisQueued: number;
  errors: string[];
};

export function CountyVaultUploadPanel({
  countySlug,
  countyDisplayName,
  uploadEndpoint,
  showCityField = true,
}: Props) {
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const [city, setCity] = useState("");

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = form.elements.namedItem("files") as HTMLInputElement | null;
      if (!input?.files?.length) {
        setState({ phase: "error", message: "Choose at least one file (or a .zip)." });
        return;
      }

      setState({ phase: "uploading" });
      const fd = new FormData();
      fd.set("countySlug", countySlug);
      if (showCityField && city.trim()) fd.set("city", city.trim());
      for (const f of Array.from(input.files)) {
        fd.append("files", f);
      }
      fd.set("runAnalysis", "true");

      try {
        const res = await fetch(uploadEndpoint, { method: "POST", body: fd });
        const data = (await res.json()) as UploadResult & { ok?: boolean; error?: string };
        if (!res.ok || data.ok === false) {
          setState({ phase: "error", message: data.error ?? `Upload failed (${res.status})` });
          return;
        }
        setState({ phase: "done", result: data });
        input.value = "";
      } catch (err) {
        setState({ phase: "error", message: err instanceof Error ? err.message : "Upload failed" });
      }
    },
    [city, countySlug, showCityField, uploadEndpoint],
  );

  return (
    <section className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-white to-kelly-gold/5 p-6 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-800/80">County media vault</p>
      <h2 className="font-heading mt-2 text-xl font-bold text-kelly-navy">{countyDisplayName} — upload &amp; analyze</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-kelly-text/75">
        Upload photos, videos, PDFs, or a <strong>.zip</strong> archive. Files land in the campaign library, get AI
        transcription (video/audio), deep analysis, and SEO metadata. On Netlify, keep each request under ~6&nbsp;MB and
        set <code className="text-xs">SUPABASE_URL</code> + <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
        for durable storage.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {showCityField ? (
          <label className="block text-sm">
            <span className="font-medium text-kelly-text">City (optional)</span>
            <input
              className="mt-1 w-full max-w-md rounded-lg border border-kelly-text/15 px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Conway, Russellville"
            />
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="font-medium text-kelly-text">Files</span>
          <input
            name="files"
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.zip,application/zip"
            className="mt-2 block w-full max-w-xl text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-kelly-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-110"
          />
          <span className="mt-1 block text-xs text-kelly-muted">
            Single files or .zip containing multiple media. Netlify: ~6 MB per request; local/dev up to 4 GB.
          </span>
        </label>

        <button
          type="submit"
          disabled={state.phase === "uploading"}
          className="rounded-lg bg-kelly-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
        >
          {state.phase === "uploading" ? "Uploading & analyzing…" : "Upload to vault"}
        </button>
      </form>

      {state.phase === "done" ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-950">
          <p className="font-semibold">Import complete</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>{state.result.imported} asset(s) imported</li>
            <li>{state.result.analysisQueued} analyzed with AI</li>
            {state.result.skipped > 0 ? <li>{state.result.skipped} zip entries skipped (non-media)</li> : null}
            <li>
              Batch{" "}
              <a className="font-mono underline" href={`/admin/owned-media/batches/${state.result.batchId}`}>
                {state.result.batchId.slice(0, 12)}…
              </a>
            </li>
          </ul>
          {state.result.errors.length > 0 ? (
            <pre className="mt-2 max-h-32 overflow-auto rounded bg-white/60 p-2 text-xs">{state.result.errors.join("\n")}</pre>
          ) : null}
        </div>
      ) : null}

      {state.phase === "error" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{state.message}</p>
      ) : null}
    </section>
  );
}
