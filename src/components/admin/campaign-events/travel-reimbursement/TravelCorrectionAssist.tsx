import Link from "next/link";
import { eventEditHref, reviewHref } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";

export function TravelCorrectionAssist({
  month,
  recordId,
  compact,
}: {
  month: string;
  recordId?: string;
  compact?: boolean;
}) {
  const wrap = compact ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2 rounded-xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-4";
  return (
    <div className={wrap}>
      <span className="w-full font-body text-xs font-bold uppercase text-kelly-slate print:hidden">
        Correct travel data
      </span>
      {recordId ? (
        <Link
          href={eventEditHref(recordId, month)}
          className="rounded-full border border-kelly-navy/30 bg-white px-3 py-1.5 text-xs font-bold text-kelly-navy print:hidden"
        >
          Edit travel details
        </Link>
      ) : null}
      <Link
        href={reviewHref({ month, focus: "missing_mileage", autostart: true })}
        className="rounded-full border px-3 py-1.5 text-xs font-bold print:hidden"
      >
        Correct with AI (month review)
      </Link>
      <Link
        href={reviewHref({ month, mode: "travel_needs_approval", autostart: true })}
        className="rounded-full border px-3 py-1.5 text-xs font-bold print:hidden"
      >
        Recalculate mileage queue
      </Link>
      <p className="w-full font-body text-[11px] text-kelly-text/55 print:hidden">
        Saves update the internal campaign ledger only. Google Calendar write-back is not enabled yet.
      </p>
    </div>
  );
}
