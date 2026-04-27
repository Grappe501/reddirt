"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** Plain-language definition (required). */
  definition: string;
  /** Optional “why it matters on this site” line. */
  hint?: string;
  className?: string;
};

/**
 * Hover or keyboard-focus the term to see a teaching tooltip. Keeps the page self-explanatory without walls of footnotes.
 */
export function DefineTerm({ children, definition, hint, className }: Props) {
  const rid = useId().replace(/:/g, "");
  const tipId = `teach-tip-${rid}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span className={cn("relative inline max-w-full align-baseline", className)}>
      <button
        type="button"
        className={cn(
          "mx-0 inline cursor-help border-0 bg-transparent p-0 text-left font-inherit text-inherit",
          "underline decoration-kelly-slate/55 decoration-dotted decoration-2 underline-offset-[0.22em]",
          "transition-colors hover:decoration-kelly-gold hover:text-kelly-navy dark:hover:text-kelly-gold-soft",
          "focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold",
        )}
        aria-describedby={tipId}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </button>
      <span
        id={tipId}
        role="tooltip"
        aria-hidden={!open}
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-[120] mt-2 w-[min(100vw-1.5rem,24rem)] -translate-x-1/2 rounded-xl border px-3.5 py-3 text-left shadow-elevated transition-[opacity,visibility] duration-150 ease-out",
          "border-kelly-text/12 bg-[var(--color-surface-elevated)] text-kelly-text",
          "dark:border-white/12 dark:bg-kelly-deep dark:text-kelly-fog dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <span className="sr-only">Definition: </span>
        <span className="text-sm font-medium leading-snug text-kelly-text dark:text-kelly-fog">{definition}</span>
        {hint ? (
          <span className="mt-2 block border-t border-kelly-text/10 pt-2 text-xs leading-snug text-kelly-text/75 dark:border-white/10 dark:text-kelly-fog/85">
            {hint}
          </span>
        ) : null}
      </span>
    </span>
  );
}
