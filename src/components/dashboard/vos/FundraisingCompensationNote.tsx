import { FUNDRAISER_COMPENSATION_COMPLIANCE } from "@/lib/volunteer-ops/fundraising-compliance";

export function FundraisingCompensationNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-lg border border-amber-300/50 bg-amber-50/90 px-3 py-2 font-body text-xs leading-relaxed text-amber-950 ${className}`}
    >
      <strong className="font-bold">Compliance:</strong> {FUNDRAISER_COMPENSATION_COMPLIANCE} Any draft incentive model stays
      internal until counsel and treasurer sign off.
    </p>
  );
}
