"use client";

import Link from "next/link";

export function CanvassingClipboardPrintActions({ downloadFilename }: { downloadFilename: string }) {
  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-gradient-to-b from-kelly-gold to-[#b8872f] px-5 py-3 text-sm font-semibold text-kelly-navy shadow-[var(--shadow-gold-cta)] ring-1 ring-kelly-gold/40"
        >
          Print or save PDF
        </button>
        <Link
          href="/volunteer/resources/canvassing/clipboard-sheet?print=1"
          className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/25 px-5 py-3 text-sm font-semibold text-kelly-text hover:bg-kelly-navy/[0.06]"
        >
          Open print view
        </Link>
      </div>
      <p className="mt-4 font-body text-xs text-kelly-slate/70">File name suggestion: {downloadFilename}.pdf</p>
    </>
  );
}
