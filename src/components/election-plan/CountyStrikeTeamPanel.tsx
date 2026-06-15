import Link from "next/link";

import type { CountyStrikeTeam } from "@/lib/election-plan/load-county-strike-team";
import {
  getStrikeRoleLabels,
  primaryStrikeRoles,
  strikeTeamAssignedCount,
} from "@/lib/election-plan/load-county-strike-team";
import { cn } from "@/lib/utils";

type Props = {
  team: CountyStrikeTeam;
  compact?: boolean;
};

function statusClass(status: string): string {
  if (status === "assigned") return "bg-emerald-100 text-emerald-900";
  if (status === "recruiting") return "bg-amber-100 text-amber-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

export function CountyStrikeTeamPanel({ team, compact = false }: Props) {
  const labels = getStrikeRoleLabels();
  const assigned = strikeTeamAssignedCount(team);
  const roles = compact ? primaryStrikeRoles() : Object.keys(team.roles);
  const captain = team.roles.countyCaptain;

  return (
    <div className="ep-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">County strike team</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            {assigned} role{assigned === 1 ? "" : "s"} assigned · edit in{" "}
            <code className="text-[10px]">county-strike-teams.json</code>
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold uppercase",
            statusClass(captain?.status ?? "vacant"),
          )}
        >
          Captain: {captain?.name.trim() || "Vacant"}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--ep-gold)]/40 bg-[var(--ep-cream)]/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-gold)]">
          {labels.countyCaptain ?? "County Captain"}
        </p>
        {captain?.name.trim() ? (
          <div className="mt-2 text-sm">
            <p className="font-semibold text-[var(--ep-navy)]">{captain.name}</p>
            {captain.email ? <p className="text-[var(--ep-navy-muted)]">{captain.email}</p> : null}
            {captain.phone ? <p className="text-[var(--ep-navy-muted)]">{captain.phone}</p> : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Vacant — assign county captain before field activations scale in {team.county} County.
          </p>
        )}
      </div>

      {!compact ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {roles
            .filter((key) => key !== "countyCaptain")
            .map((key) => {
              const role = team.roles[key];
              if (!role) return null;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-md border border-[var(--ep-border)] px-3 py-2 text-sm"
                >
                  <span className="text-[var(--ep-navy-muted)]">{labels[key] ?? key}</span>
                  <span className="text-right">
                    <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold uppercase", statusClass(role.status))}>
                      {role.status}
                    </span>
                    {role.name.trim() ? (
                      <span className="ml-2 font-medium text-[var(--ep-navy)]">{role.name}</span>
                    ) : null}
                  </span>
                </div>
              );
            })}
        </div>
      ) : null}
    </div>
  );
}
