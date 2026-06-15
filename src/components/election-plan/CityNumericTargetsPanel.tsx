import type { CityNumericTargets } from "@/lib/election-plan/load-city-numeric-targets";
import {
  formatHousePartyGoalLine,
  formatRegistrationGoalLine,
  formatVolunteerGoalLine,
} from "@/lib/election-plan/load-city-numeric-targets";
import { formatVotes } from "@/lib/election-plan/electionPlanData";

type Props = {
  targets: CityNumericTargets;
  countyName: string;
};

export function CityNumericTargetsPanel({ targets, countyName }: Props) {
  return (
    <div className="ep-card mb-8 border-l-4 border-emerald-600">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Locked numeric targets</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Lane budget · chapter-05 registration allocation · Power of 5 math
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-900">
          Locked
        </span>
      </div>

      <div className="mt-4 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(targets.votes.target)}</div>
          <div className="ep-stat-label">Vote target</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">+{formatVotes(targets.votes.gainNeeded)}</div>
          <div className="ep-stat-label">Gain needed</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{targets.registration.newRegistrations.toLocaleString()}</div>
          <div className="ep-stat-label">New registrations</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{targets.houseParties.hosts}</div>
          <div className="ep-stat-label">House party hosts</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{targets.volunteers.activeVolunteers}</div>
          <div className="ep-stat-label">Active volunteers</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{targets.volunteers.captains}</div>
          <div className="ep-stat-label">Captains</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{targets.houseParties.conversationsTarget.toLocaleString()}</div>
          <div className="ep-stat-label">Po5 conversations</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{targets.registration.countySharePct}%</div>
          <div className="ep-stat-label">Of county reg. goal</div>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
        <p>
          <span className="font-semibold text-[var(--ep-navy)]">Registration: </span>
          {formatRegistrationGoalLine(targets, countyName)}
        </p>
        <p>
          <span className="font-semibold text-[var(--ep-navy)]">House parties: </span>
          {formatHousePartyGoalLine(targets)}
        </p>
        <p>
          <span className="font-semibold text-[var(--ep-navy)]">Volunteers: </span>
          {formatVolunteerGoalLine(targets)}
        </p>
      </div>

      <p className="mt-3 text-[10px] text-[var(--ep-navy-muted)]">Source: {targets.source}</p>
    </div>
  );
}
