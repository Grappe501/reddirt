import Link from "next/link";

import { FIELD_ENTRY_CATEGORIES, type FieldEntryRow } from "@/lib/election-plan/field-entry/types";

type Props = {
  entries: FieldEntryRow[];
  title?: string;
};

function categoryLabel(value: string): string {
  return FIELD_ENTRY_CATEGORIES.find((c) => c.value === value)?.label ?? value.replace("_", " ");
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function LeaderRecentActivityPanel({ entries }: Props) {
  if (!entries.length) {
    return (
      <p className="text-sm text-[var(--ep-navy-muted)]">
        No field logs tagged to you yet — use the field log section below to record your first result.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-[var(--ep-navy)]/10 bg-white">
      {entries.slice(0, 8).map((entry) => (
        <li key={entry.id} className="px-4 py-3 text-sm">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-medium text-[var(--ep-navy)]">{entry.label}</span>
            {entry.quantity > 1 ? (
              <span className="text-xs text-[var(--ep-navy-muted)]">×{entry.quantity}</span>
            ) : null}
            <span className="rounded bg-[var(--ep-cream)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--ep-navy-muted)]">
              {categoryLabel(entry.category)}
            </span>
          </div>
          {entry.description ? (
            <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">{entry.description}</p>
          ) : null}
          <p className="mt-0.5 text-[10px] text-[var(--ep-navy-muted)]">{formatWhen(entry.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
}

export function LeaderOpenSlotsPanel({
  slots,
}: {
  slots: Array<{ roleLabel: string; workbenchName: string; href: string }>;
}) {
  if (!slots.length) {
    return (
      <p className="text-sm text-[var(--ep-navy-muted)]">
        All leadership slots in your connected workbenches have names assigned.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-amber-200/80 bg-amber-50/40">
      {slots.map((slot) => (
        <li key={`${slot.href}-${slot.roleLabel}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
          <div>
            <p className="font-semibold text-[var(--ep-navy)]">{slot.roleLabel}</p>
            <p className="text-xs text-[var(--ep-navy-muted)]">{slot.workbenchName} · needs a name</p>
          </div>
          <Link href={slot.href} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
            Assign →
          </Link>
        </li>
      ))}
    </ul>
  );
}
