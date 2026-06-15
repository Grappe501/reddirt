import Link from "next/link";

import { FieldOperationalCalendarPanel } from "@/components/election-plan/FieldOperationalCalendarPanel";
import { fieldCalendarHref } from "@/lib/election-plan/field-calendar-links";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "Operational Calendar | Field Calendar",
  description: "Day-to-day phone bank, postcard, canvassing, and prep tasks from event worksheets.",
  robots: { index: false, follow: false },
};

export default function FieldOperationalCalendarPage() {
  const data = loadElectionPlanSnapshot();

  return (
    <>
      <div className="ep-classification">Internal · Field calendar · Day-to-day operations</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Link href={fieldCalendarHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            ← Field calendar
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Day-to-day operational calendar</h1>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Aggregates opted-in activations and dated prep tasks from all event worksheets.
          </p>
          <FieldOperationalCalendarPanel entries={data.executiveCalendar.entries} />
        </div>
      </div>
    </>
  );
}
