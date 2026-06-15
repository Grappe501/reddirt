import Link from "next/link";

import { ExecutiveBookBudgetLeadershipPanel } from "@/components/election-plan/executive-book/ExecutiveBookBudgetLeadershipPanel";
import { executiveBookBudgetChapterHref } from "@/lib/election-plan/load-executive-book-budget-leadership";

export function ExecutiveBookBudgetDashboardPanel() {
  return (
    <section>
      <Link
        href={executiveBookBudgetChapterHref()}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← Executive Book · Budget chapter
      </Link>
      <div className="mt-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7A</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Budget Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Leadership fundraising model · category breakdown · Labor Day funding priorities
        </p>
      </div>
      <div className="mt-6">
        <ExecutiveBookBudgetLeadershipPanel variant="dashboard" />
      </div>
    </section>
  );
}
