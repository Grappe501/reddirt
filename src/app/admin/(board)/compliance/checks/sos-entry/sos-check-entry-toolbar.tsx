"use client";

import { useRef } from "react";
import type { AprilCheckSosWorkbook } from "@/lib/compliance/checks/april-check-sos-types";

type Props = {
  april26Dir: string;
  folderExists: boolean;
  checkImageCount: number;
  onImported: (workbook: AprilCheckSosWorkbook) => void;
};

export function SosCheckEntryToolbar({ april26Dir, folderExists, checkImageCount, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const importJson = async (file: File) => {
    const text = await file.text();
    const workbook = JSON.parse(text) as AprilCheckSosWorkbook;
    const res = await fetch("/api/admin/compliance/check-sos-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import_workbook", workbook }),
    });
    if (!res.ok) throw new Error("Import failed");
    const saved = (await res.json()) as AprilCheckSosWorkbook;
    onImported(saved);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-[#0f2744]">Files &amp; export</p>
      <p className="mt-1 text-xs text-slate-600">
        April26 folder: {folderExists ? "found" : "not found"} · {checkImageCount} check image(s) ·{" "}
        <span className="font-mono break-all">{april26Dir}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href="/api/admin/compliance/check-sos-entry/download?format=csv"
          className="rounded-full border border-[#0f2744] bg-[#0f2744] px-4 py-2 text-sm font-bold text-white"
        >
          Download CSV
        </a>
        <a
          href="/api/admin/compliance/check-sos-entry/download?format=json"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#0f2744]"
        >
          Download JSON
        </a>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-full border border-emerald-600 px-4 py-2 text-sm font-bold text-emerald-800"
        >
          Import JSON workbook
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importJson(file).catch(() => alert("Could not import JSON"));
            e.target.value = "";
          }}
        />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        <strong>Netlify:</strong> check images stay on your PC. Run extract locally, download JSON, then Import JSON on
        production for the same copy fields (images show only when April26 is on the server).
      </p>
    </div>
  );
}
