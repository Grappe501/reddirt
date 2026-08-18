"use client";

import { useEffect } from "react";
import { CANVASSING_CLIPBOARD, CANVASSING_ISSUES } from "@/content/volunteer/canvassing";

type Props = {
  autoPrint?: boolean;
};

/**
 * Branded half-page clipboard tally — print or Save as PDF from the browser.
 */
export function CanvassingClipboardSheet({ autoPrint }: Props) {
  useEffect(() => {
    if (autoPrint && typeof window !== "undefined") {
      const t = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <div className="canvassing-clipboard-root mx-auto max-w-lg bg-white text-kelly-ink print:max-w-none print:shadow-none">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .canvassing-clipboard-root,
          .canvassing-clipboard-root * {
            visibility: visible;
          }
          .canvassing-clipboard-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0.5in;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="overflow-hidden rounded-xl border-2 border-kelly-navy/20 shadow-[var(--shadow-soft)] print:rounded-none print:border-kelly-navy print:shadow-none">
        <header className="bg-kelly-navy px-6 py-5 text-center print:py-4">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-gold">
            Kelly Grappe for Arkansas Secretary of State
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-white">Canvassing clipboard sheet</p>
          <p className="mt-1 font-body text-xs text-kelly-mist/90">Regnat Populus · The People Rule</p>
        </header>

        <div className="px-6 py-8 print:py-6">
          <p className="text-center font-heading text-xl font-bold leading-snug text-kelly-navy md:text-2xl">
            {CANVASSING_CLIPBOARD.question}
          </p>

          <ol className="mt-8 space-y-5">
            {CANVASSING_ISSUES.map((issue) => (
              <li key={issue.slug} className="flex items-start gap-4">
                <span
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border-2 border-kelly-navy/35 font-heading text-sm font-bold text-kelly-navy"
                  aria-hidden
                />
                <span className="pt-0.5 font-heading text-lg font-semibold text-kelly-ink">
                  {issue.number}. {issue.clipboardLabel}
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-10 border-t border-kelly-navy/15 pt-6 text-center font-body text-sm leading-relaxed text-kelly-slate">
            {CANVASSING_CLIPBOARD.footer}
          </p>

          <p className="mt-6 text-center font-body text-[11px] text-kelly-slate/70">
            Volunteer use only · kellygrappe.com/volunteer/resources/canvassing
          </p>
        </div>
      </div>
    </div>
  );
}
