import Link from "next/link";

const STEPS = [
  { key: "log", label: "1. Tentative log", path: "travel-log" },
  { key: "review", label: "2. Approve travel", path: "review" },
  { key: "report", label: "3. Travel report", path: "travel-report" },
  { key: "official", label: "4. Official request", path: "reimbursement" },
] as const;

export function TravelReimbursementWorkflowNav({
  month,
  active,
}: {
  month: string;
  active: "travel-log" | "travel-report" | "reimbursement" | "review";
}) {
  return (
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-3 print:hidden" aria-label="Travel reimbursement steps">
      {STEPS.map((s) => {
        const href =
          s.path === "review"
            ? `/admin/campaign-events/review?month=${month}&mode=travel_needs_approval`
            : `/admin/campaign-events/${s.path}?month=${month}`;
        const isActive = s.path === active || (s.path === "review" && active === "review");
        return (
          <Link
            key={s.key}
            href={href}
            className={`rounded-full px-3 py-1.5 font-body text-xs font-bold ${
              isActive ? "bg-kelly-navy text-white" : "border border-kelly-text/15 bg-kelly-page text-kelly-text/70"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
      <Link
        href={`/admin/campaign-events/month-readiness?month=${month}`}
        className="ml-auto rounded-full border border-amber-700/30 bg-amber-50 px-3 py-1.5 font-body text-xs font-bold text-amber-950"
      >
        Month readiness
      </Link>
    </nav>
  );
}
