"use client";

import Link from "next/link";

import {
  getDay8SectionDeepStudyLinks,
  type Day8DeepStudyLink,
} from "@/lib/election-plan/debate-prep-day8-deep-study-links";

export function ElectionPlanDay8DeepStudyStrip({
  sectionId,
  links,
  compact = false,
}: {
  sectionId?: string;
  links?: readonly Day8DeepStudyLink[];
  compact?: boolean;
}) {
  const resolved = links ?? (sectionId ? getDay8SectionDeepStudyLinks(sectionId) : []);
  if (resolved.length === 0) return null;

  return (
    <div
      className={
        compact
          ? "mb-4 rounded-lg border border-[var(--ep-border)] bg-white/80 px-3 py-2"
          : "mb-6 rounded-lg border border-emerald-200/80 bg-emerald-50/30 px-4 py-3"
      }
    >
      <p
        className={
          compact
            ? "text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]"
            : "text-xs font-bold uppercase text-emerald-900"
        }
      >
        Deep study · Modules 1–7
      </p>
      {!compact ? (
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          Reopen any module for the full block before you continue.
        </p>
      ) : null}
      <ul className="mt-2 flex flex-wrap gap-2">
        {resolved.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className={
                compact
                  ? "inline-block rounded border border-[var(--ep-border)] bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-900 hover:bg-emerald-50"
                  : "inline-block rounded-md border border-emerald-200 bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
              }
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
