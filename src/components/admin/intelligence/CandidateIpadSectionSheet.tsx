"use client";

import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import type { CandidateCommandNavSection } from "@/lib/intelligence/v4/candidateCommandNav";

const SECTION_HEADER: Record<string, string> = {
  home: "border-indigo-200 bg-indigo-50 text-indigo-950",
  rehearse: "border-emerald-200 bg-emerald-50 text-emerald-950",
  philosophy: "border-violet-200 bg-violet-50 text-violet-950",
  opposition: "border-amber-200 bg-amber-50 text-amber-950",
  safety: "border-rose-200 bg-rose-50 text-rose-950",
};

export function CandidateIpadSectionSheet({
  section,
  onClose,
}: {
  section: CandidateCommandNavSection;
  onClose: () => void;
}) {
  const header = SECTION_HEADER[section.id] ?? SECTION_HEADER.home!;

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40"
      role="dialog"
      aria-label={`${section.label} section`}
      onClick={onClose}
    >
      <div
        className="max-h-[75dvh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`rounded-xl border p-3 ${header}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider">{section.label}</p>
          <p className="mt-1 text-xs">{section.summary}</p>
        </div>
        <ul className="mt-3 space-y-2">
          {section.links.map((link) => (
            <li key={link.href}>
              <IntelligenceNavLink
                href={link.href}
                variant="ipad"
                onClick={onClose}
                className="flex min-h-12 flex-col rounded-xl border border-kelly-text/10 px-4 py-3 text-sm active:bg-kelly-page"
              >
                <span className="font-bold text-kelly-navy">{link.label}</span>
                {link.description ? (
                  <span className="mt-0.5 text-[10px] font-normal text-kelly-muted">{link.description}</span>
                ) : null}
              </IntelligenceNavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
