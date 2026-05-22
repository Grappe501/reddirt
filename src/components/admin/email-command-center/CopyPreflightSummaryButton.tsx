"use client";

import { useState } from "react";

export function CopyPreflightSummaryButton({ text, label = "Copy preflight summary" }: { text: string; label?: string }) {
  const [hint, setHint] = useState<string | null>(null);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(text).then(
            () => {
              setHint("Copied to clipboard.");
              window.setTimeout(() => setHint(null), 2500);
            },
            () => setHint("Clipboard unavailable in this browser."),
          );
        }}
        className="rounded border border-kelly-navy/25 bg-white px-2 py-1 text-[10px] font-bold text-kelly-navy"
      >
        {label}
      </button>
      {hint ? <span className="font-body text-[9px] text-kelly-muted">{hint}</span> : null}
    </div>
  );
}
