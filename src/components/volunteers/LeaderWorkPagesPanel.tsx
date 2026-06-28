import Link from "next/link";

import {
  leaderWorkPageCategoryLabel,
  LEADER_WORK_PAGE_CATEGORY_ORDER,
  type LeaderWorkPagesPayload,
} from "@/lib/volunteers/resolve-leader-work-pages";

type Props = {
  payload: LeaderWorkPagesPayload;
  leaderDisplayName: string;
};

export function LeaderWorkPagesPanel({ payload, leaderDisplayName }: Props) {
  const total = payload.pages.length;

  return (
    <div className="space-y-8">
      <p className="text-sm text-[var(--ep-navy-muted)]">
        {total} operator pages wired for {leaderDisplayName} — lane drill-downs, geography, Power of 5, projects, and
        command surfaces. Each link opens a live Election Plan tool.
      </p>

      {LEADER_WORK_PAGE_CATEGORY_ORDER.map((category) => {
        const items = payload.byCategory[category];
        if (!items.length) return null;
        return (
          <div key={category}>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">
              {leaderWorkPageCategoryLabel(category)} ({items.length})
            </h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {items.map((page) => (
                <li key={page.id}>
                  <Link
                    href={page.href}
                    className={`block h-full rounded-xl border bg-white p-4 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md ${
                      page.priority === "high"
                        ? "border-[var(--ep-gold)]/45"
                        : "border-[var(--ep-navy)]/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-[var(--ep-navy)]">{page.title}</p>
                      {page.priority === "high" ? (
                        <span className="shrink-0 rounded bg-[var(--ep-gold)]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--ep-navy)]">
                          Core
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{page.description}</p>
                    <p className="mt-2 text-xs font-semibold text-[var(--ep-blue)]">Open work page →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
