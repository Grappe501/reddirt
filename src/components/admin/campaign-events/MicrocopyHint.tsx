"use client";

import { useState } from "react";
import { getMicrocopy, type MicrocopyTerm } from "@/lib/agents/ux-intelligence/microcopy-registry";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";

export function MicrocopyHint({
  term,
  role,
  label,
}: {
  term: MicrocopyTerm;
  role?: CampaignUserRole;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const entry = getMicrocopy(term, role);
  if (!entry) return null;

  return (
    <span className="inline-flex items-center gap-1 font-body text-xs">
      {label ?? entry.shortTooltip}
      <button
        type="button"
        className="rounded-full border border-kelly-text/20 px-1.5 py-0.5 text-[10px] font-bold text-kelly-navy"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title="Explain this term"
      >
        ?
      </button>
      {open ? (
        <span className="ml-1 block max-w-xs rounded-lg border border-kelly-navy/20 bg-kelly-page p-2 text-[11px] text-kelly-text/80 shadow-sm">
          {entry.expanded}
          {entry.relatedAction ? (
            <a href={entry.relatedAction.href} className="mt-1 block font-bold text-kelly-navy underline">
              {entry.relatedAction.label}
            </a>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
