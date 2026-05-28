"use client";

import { useState } from "react";

const DEBATE_EXPORT_JSON_URL = "/api/opposition/kim-hammer/debate-export?format=json";
const DEBATE_EXPORT_MARKDOWN_URL = "/api/opposition/kim-hammer/debate-export?format=markdown";

function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function fetchExportText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Export request failed (${response.status})`);
  }
  return response.text();
}

type DebatePacketExportActionsProps = {
  exportCount: number;
};

export function DebatePacketExportActions({ exportCount }: DebatePacketExportActionsProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const disabled = exportCount === 0 || busy;

  async function runExport(action: () => Promise<void>, successMessage: string) {
    setBusy(true);
    setStatus(null);
    try {
      await action();
      setStatus(successMessage);
    } catch {
      setStatus("Export failed. Confirm the debate export API is available.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
      <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Download actions</h2>
      <p className="mt-1 text-kelly-muted">
        Fetches export-ready claims from the Step 6 API only. Blocked, uncited, and non-Tier-1 claims are
        excluded server-side.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          className="rounded border border-kelly-text/20 bg-kelly-page px-3 py-1.5 font-semibold text-kelly-navy disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() =>
            runExport(async () => {
              const text = await fetchExportText(DEBATE_EXPORT_JSON_URL);
              downloadBlob("kim-hammer-debate-packet.json", text, "application/json");
            }, "JSON debate packet downloaded.")
          }
        >
          Download JSON
        </button>
        <button
          type="button"
          disabled={disabled}
          className="rounded border border-kelly-text/20 bg-kelly-page px-3 py-1.5 font-semibold text-kelly-navy disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() =>
            runExport(async () => {
              const text = await fetchExportText(DEBATE_EXPORT_MARKDOWN_URL);
              downloadBlob("kim-hammer-debate-packet.md", text, "text/markdown");
            }, "Markdown debate packet downloaded.")
          }
        >
          Download Markdown
        </button>
        <button
          type="button"
          disabled={disabled}
          className="rounded border border-kelly-navy/20 bg-white px-3 py-1.5 font-semibold text-kelly-navy disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() =>
            runExport(async () => {
              const text = await fetchExportText(DEBATE_EXPORT_MARKDOWN_URL);
              await navigator.clipboard.writeText(text);
            }, "Markdown packet copied to clipboard.")
          }
        >
          Copy Packet Text
        </button>
      </div>
      {exportCount === 0 ? (
        <p className="mt-2 text-kelly-muted">No export-ready claims available for download.</p>
      ) : (
        <p className="mt-2 text-kelly-muted">{exportCount} export-ready claim(s) available via API.</p>
      )}
      {status ? <p className="mt-2 font-semibold text-kelly-navy">{status}</p> : null}
    </div>
  );
}
