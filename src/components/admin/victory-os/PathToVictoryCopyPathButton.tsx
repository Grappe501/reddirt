"use client";

import { useCallback, useState } from "react";

export function PathToVictoryCopyPathButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [path]);

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-lg border border-kelly-navy/15 bg-kelly-page/50 px-3 py-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-navy/30 hover:bg-white"
    >
      {copied ? "Copied" : "Copy path"}
    </button>
  );
}
