"use client";

import type { ReactNode } from "react";

/** Native disclosure — keeps long coaching copy off the main dashboard surface. */
export function DashboardDisclosure({
  summary,
  children,
  defaultOpen = false,
  className = "",
}: {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details
      className={`group rounded-2xl border border-kelly-text/10 bg-white shadow-[var(--shadow-soft)] ${className}`}
      {...(defaultOpen ? { open: true } : {})}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-body text-sm font-semibold text-kelly-navy md:px-5 md:text-[15px] [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <span className="shrink-0 font-mono text-xs text-kelly-text/45 transition group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="border-t border-kelly-text/10 px-4 pb-4 pt-1 md:px-5">{children}</div>
    </details>
  );
}
