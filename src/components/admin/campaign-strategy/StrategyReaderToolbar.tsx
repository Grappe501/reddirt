"use client";

import { useCallback, useState } from "react";

type Props = { pathKey: string };

export function StrategyReaderToolbar({ pathKey: _pathKey }: Props) {
  const [copied, setCopied] = useState<"page" | "external" | null>(null);

  const copyPageUrl = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied("page");
      window.setTimeout(() => setCopied((c) => (c === "page" ? null : c)), 2000);
    } catch {
      window.prompt("Copy this URL:", url);
    }
  }, []);

  const copyExternalSafeUrl = useCallback(async () => {
    const u = new URL(window.location.href);
    u.searchParams.set("share", "external");
    const url = u.toString();
    try {
      await navigator.clipboard.writeText(url);
      setCopied("external");
      window.setTimeout(() => setCopied((c) => (c === "external" ? null : c)), 2000);
    } catch {
      window.prompt("Copy external-safe URL:", url);
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
        {copied === "page" ? "Link copied" : "Copy page link"}
      </button>
      <button
        type="button"
        onClick={copyExternalSafeUrl}
        title="Adds share=external — hides LANE body when shared chapter is LANE"
        className="rounded-lg border border-kelly-text/15 bg-white px-3 py-1.5 font-body text-xs font-semibold text-kelly-deep shadow-sm transition hover:border-kelly-gold/50 hover:bg-kelly-fog/50"
      >
        {copied === "external" ? "Safe link copied" : "Copy external-safe link"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-kelly-text/15 bg-white px-3 py-1.5 font-body text-xs font-semibold text-kelly-deep shadow-sm transition hover:border-kelly-gold/50 hover:bg-kelly-fog/50"
      >
        Print / Save PDF
      </button>
      <span className="font-body text-[11px] text-kelly-slate/80">
        Share protocol is summarized above. Do not forward LANE dollars externally without redaction.
      </span>
    </div>
  );
}
