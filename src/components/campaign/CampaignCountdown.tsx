import { differenceInCalendarDays, parseISO } from "date-fns";

import {
  ELECTION_DAY_2026,
  VOTER_REGISTRATION_DEADLINE_2026,
  VOTER_REGISTRATION_DEADLINE_STATUS,
} from "@/lib/campaign-dates";
import { cn } from "@/lib/utils";

function fmtLong(iso: string) {
  try {
    return parseISO(iso).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Chicago",
    });
  } catch {
    return iso;
  }
}

function daysLabel(n: number, pastLabel: string) {
  if (n < 0) return pastLabel;
  if (n === 0) return "Today";
  if (n === 1) return "1 day";
  return `${n} days`;
}

export function CampaignCountdown({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  const today = new Date();
  const electionDay = parseISO(ELECTION_DAY_2026);
  const regDeadline = parseISO(VOTER_REGISTRATION_DEADLINE_2026);
  const daysToElection = differenceInCalendarDays(electionDay, today);
  const daysToReg = differenceInCalendarDays(regDeadline, today);

  const isCompact = variant === "compact";

  return (
    <aside
      className={cn(
        "rounded-2xl border border-kelly-navy/12 bg-gradient-to-br from-white via-kelly-page to-kelly-blue/[0.04] p-4 shadow-[var(--shadow-soft)] ring-1 ring-kelly-navy/[0.06]",
        isCompact && "p-3 sm:p-4",
        className,
      )}
      aria-label="Campaign timeline"
    >
      <div
        className={cn(
          "grid gap-3",
          !isCompact && "sm:grid-cols-2 sm:gap-4",
          isCompact && "sm:grid-cols-2 sm:items-start sm:gap-4",
        )}
      >
        <div className="min-w-0 space-y-1">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-text/50">Election</p>
          <p className="font-heading text-base font-bold text-kelly-navy">Election Day is November 3, 2026.</p>
          <p className="font-body text-sm text-kelly-text/80">
            <span className="font-semibold text-kelly-deep">{daysLabel(daysToElection, "Election date has passed")}</span>
            {daysToElection >= 0 ? " until Election Day" : ""}
            <span className="text-kelly-text/55"> · {fmtLong(ELECTION_DAY_2026)}</span>
          </p>
        </div>
        <div className="min-w-0 space-y-1 border-t border-kelly-text/10 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-text/50">Registration</p>
          <p className="font-heading text-base font-bold text-kelly-navy">Voter registration deadline: pending confirmation.</p>
          <p className="font-body text-sm text-kelly-text/80">
            <span className="font-semibold text-kelly-deep">{daysLabel(daysToReg, "Stated deadline has passed")}</span>
            {daysToReg >= 0 ? " to the working deadline in code" : ""}
            <span className="text-kelly-text/55"> · {fmtLong(VOTER_REGISTRATION_DEADLINE_2026)}</span>
          </p>
          <p className="font-body text-xs leading-snug text-kelly-text/60">
            Status: <span className="font-semibold text-kelly-deep/90">{VOTER_REGISTRATION_DEADLINE_STATUS}</span>. Confirm with
            Arkansas Secretary of State calendar and campaign counsel before public launch.
          </p>
        </div>
      </div>
    </aside>
  );
}
