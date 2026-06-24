import Link from "next/link";

import type { LeaderContactSpineSummary } from "@/lib/volunteers/contact-spine";

type Props = {
  summary: LeaderContactSpineSummary;
  className?: string;
};

function sourceLabel(source: "crm" | "intake" | "field"): string {
  if (source === "intake") return "Intake";
  if (source === "field") return "Field log";
  return "CRM";
}

export function LeaderContactSpinePanel({ summary, className }: Props) {
  if (!summary.dbAvailable) return null;

  return (
    <div
      className={`rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 text-xs shadow-sm ${className ?? ""}`}
    >
      <p className="font-bold uppercase tracking-wide text-[var(--ep-gold)]">Contact spine · Phase 1</p>
      <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">
        {summary.totalContacts} CRM contacts · {summary.intakePlacements} intake placements ·{" "}
        {summary.fieldLinked} field-linked
      </p>
      {summary.recent.length ? (
        <ul className="mt-3 space-y-2">
          {summary.recent.map((c) => (
            <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2">
              <Link href={c.adminHref} className="font-semibold text-[var(--ep-blue)] hover:underline">
                {c.displayName}
              </Link>
              <span className="rounded bg-[var(--ep-cream)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--ep-navy-muted)]">
                {sourceLabel(c.source)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[var(--ep-navy-muted)]">
          Log a conversation in field log or place a volunteer intake to start your CRM graph.
        </p>
      )}
      <Link
        href="/admin/relational-contacts"
        className="mt-3 inline-block font-semibold text-[var(--ep-blue)] hover:underline"
      >
        Full relational CRM →
      </Link>
    </div>
  );
}
