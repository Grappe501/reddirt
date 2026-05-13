"use client";

import { useCallback, useState } from "react";

export function FieldPlaybookReaderToolbar() {
  const [copied, setCopied] = useState(false);

  const copyPageUrl = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this URL:", url);
    }
  }, []);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={copyPageUrl}
        title="Includes #section if you scrolled to a heading"
        className="rounded-lg border border-kelly-text/15 bg-white px-3 py-1.5 font-body text-xs font-semibold text-kelly-deep shadow-sm transition hover:border-kelly-gold/50 hover:bg-kelly-fog/50"
      >
        {copied ? "Link copied" : "Copy page link"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-kelly-text/15 bg-white px-3 py-1.5 font-body text-xs font-semibold text-kelly-deep shadow-sm transition hover:border-kelly-gold/50 hover:bg-kelly-fog/50"
      >
        Print / Save PDF
      </button>
      <span className="font-body text-[11px] text-kelly-slate/80">
        Share volunteer-facing links only with people cleared by HQ.
      </span>
    </div>
  );
}
