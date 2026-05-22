"use client";

import { useState } from "react";
import { CHECK_SOS_FIELDS } from "@/lib/compliance/checks/check-sos-field-catalog";
import type { AprilCheckSosEntry } from "@/lib/compliance/checks/april-check-sos-types";
import {
  entryDisplayLabel,
  entryStatusLabel,
  getEntryMissingRequired,
  getEntryReviewStatus,
} from "@/lib/compliance/checks/april-check-sos-workbook.shared";

function categoryLabel(entry: AprilCheckSosEntry): string {
  if (entry.imageCategory === "donation_folder") return "Donation photo";
  if (entry.imageCategory === "attachment") return "Email attachment";
  return "Other";
}

function cell(value: string): string {
  const v = value?.trim();
  return v || "—";
}

export function SosCheckReviewTable({
  entries,
  selectedId,
  imagesAvailable,
  onSelect,
}: {
  entries: AprilCheckSosEntry[];
  selectedId: string;
  imagesAvailable: boolean;
  onSelect: (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!entries.length) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        No checks match this filter. Try &quot;All images&quot; or rescan the April26 folder.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((e, index) => {
        const f = e.fields;
        const status = getEntryReviewStatus(e);
        const badge = entryStatusLabel(status);
        const missing = getEntryMissingRequired(e);
        const selected = e.id === selectedId;
        const expanded = expandedId === e.id;

        return (
          <article
            key={e.id}
            className={`rounded-xl border bg-white transition ${
              selected ? "border-[#0f2744] ring-2 ring-[#0f2744]/20" : "border-slate-200"
            }`}
          >
            <div
              className="flex cursor-pointer flex-wrap items-center gap-3 p-3"
              onClick={() => onSelect(e.id)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") onSelect(e.id);
              }}
              role="button"
              tabIndex={0}
            >
              <span className="w-6 font-mono text-xs text-slate-400">{index + 1}</span>
              {imagesAvailable ? (
                <img
                  src={`/api/admin/compliance/april26-image?rel=${encodeURIComponent(e.imageRelativePath)}`}
                  alt=""
                  className="h-16 w-24 shrink-0 rounded border border-slate-200 object-cover bg-slate-100"
                />
              ) : null}
              <div className="min-w-[140px] flex-1">
                <p className="font-mono text-sm font-semibold text-[#0f2744]">{entryDisplayLabel(e)}</p>
                <p className="text-xs text-slate-500">{categoryLabel(e)} · {e.imageFileName}</p>
              </div>
              <div className="grid min-w-[200px] flex-1 gap-1 text-sm sm:grid-cols-3">
                <p>
                  <span className="text-xs text-slate-500">Name </span>
                  <span className="font-medium">{cell(f.contributorFullName)}</span>
                </p>
                <p>
                  <span className="text-xs text-slate-500">Amount </span>
                  <span className="font-mono font-medium">{cell(f.amount)}</span>
                </p>
                <p>
                  <span className="text-xs text-slate-500">Date </span>
                  {cell(f.checkDate)}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}>{badge.text}</span>
              <button
                type="button"
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setExpandedId(expanded ? null : e.id);
                }}
              >
                {expanded ? "Hide fields" : "Show all fields"}
              </button>
            </div>
            {missing.length > 0 && status !== "reviewed" ? (
              <p className="border-t border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                Missing for SOS: {missing.join(" · ")}
              </p>
            ) : null}
            {expanded ? (
              <div className="border-t border-slate-100 px-3 py-3">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {CHECK_SOS_FIELDS.map((def) => (
                    <div key={def.key} className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <p className="text-[10px] font-bold uppercase text-slate-500">{def.label}</p>
                      <p className="font-mono text-sm">{cell(f[def.key])}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
