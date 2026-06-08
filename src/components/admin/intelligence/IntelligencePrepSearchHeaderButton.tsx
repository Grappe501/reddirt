"use client";

import { openIntelPrepSearch } from "@/lib/intelligence/intelligencePrepSearchOpen";

/** Opens the intelligence prep search panel (listens in IntelligencePrepSearchBar). */
export function IntelligencePrepSearchHeaderButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => openIntelPrepSearch()}
      className={
        className ||
        "min-h-11 rounded-lg border border-indigo-400 bg-indigo-600 px-3 text-[10px] font-bold text-white shadow-sm active:bg-indigo-800"
      }
      aria-label="Open debate prep search (Ctrl+K)"
      title="Search debate prep — Ctrl+K"
    >
      Search
    </button>
  );
}
