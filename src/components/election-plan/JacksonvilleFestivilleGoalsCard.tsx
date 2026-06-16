import Link from "next/link";

import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { getCityNumericTargets } from "@/lib/election-plan/load-city-numeric-targets";

type Props = {
  variant?: "panel" | "compact";
};

export function JacksonvilleFestivilleGoalsCard({ variant = "panel" }: Props) {
  const targets = getCityNumericTargets("jacksonville");
  if (!targets) return null;

  const sosGoal = targets.secondaryGoals?.[0];
  const isPanel = variant === "panel";

  return (
    <div className={isPanel ? undefined : "ep-card h-full"}>
      {isPanel ? (
        <h3 className="mb-3 font-heading font-bold">Jacksonville Festiville</h3>
      ) : (
        <h3 className="font-heading font-bold">Jacksonville Festiville</h3>
      )}

      {isPanel ? (
        <div className="ep-warning mb-4">
          <p className="text-lg font-semibold">
            {formatVotes(targets.votes.target)}-vote city target · Sept 20
          </p>
          <p className="mt-2 text-sm">
            LRAFB corridor · Pulaski County suburban anchor · community event visibility
          </p>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Pulaski County suburban anchor · NAACP relationship
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm">
          Sept 20 · {formatVotes(targets.votes.target)} vote target · LRAFB corridor · Pulaski
        </p>
      )}

      <div className={`grid gap-3 sm:grid-cols-2 ${isPanel ? "lg:grid-cols-2" : ""}`}>
        <div className={isPanel ? "ep-card" : "mt-3 rounded-md border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-3"}>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Vote target</div>
          <div className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">
            {formatVotes(targets.votes.target)}
          </div>
        </div>
        <div className={isPanel ? "ep-card" : "rounded-md border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-3"}>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Gain needed</div>
          <div className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">
            +{formatVotes(targets.votes.gainNeeded)}
          </div>
        </div>
        <div className={isPanel ? "ep-card" : "rounded-md border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-3"}>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            New registrations
          </div>
          <div className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">
            {targets.registration.newRegistrations.toLocaleString()}
          </div>
        </div>
        <div className={isPanel ? "ep-card" : "rounded-md border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-3"}>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            Active volunteers
          </div>
          <div className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">
            {targets.volunteers.activeVolunteers}
          </div>
        </div>
      </div>

      {sosGoal ? (
        <p className="mt-3 text-xs font-semibold text-[var(--ep-gold)]">
          Secondary goal tracked: {sosGoal.label} — see Special KPI goals on War Room
        </p>
      ) : null}

      <Link
        href="/election-plan/cities/jacksonville"
        className={`inline-block text-sm font-semibold text-[var(--ep-navy)] underline ${isPanel ? "mt-4" : "mt-4"}`}
      >
        Jacksonville location brief →
      </Link>
    </div>
  );
}
