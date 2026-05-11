import type { Team, VolunteerRole } from "@/types/dashboard";

const ROLE_LABELS: Record<VolunteerRole, string> = {
  events: "Events Coordinator",
  "social-media": "Social Media Coordinator",
  "power-of-5": "Power of 5 / VR Coordinator",
  general: "General member",
  "not-sure": "Coordinator (lane TBD)",
};

function emailBadge(status: "confirmed" | "pending" | undefined) {
  if (status === "pending") {
    return (
      <span className="rounded-md bg-amber-100 px-2 py-0.5 font-body text-[10px] font-bold uppercase text-amber-950">
        Email pending
      </span>
    );
  }
  return (
    <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-body text-[10px] font-bold uppercase text-emerald-950">
      Email confirmed
    </span>
  );
}

export function TeamRosterPanel({ team }: { team: Team }) {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Team roster</p>
      <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Triad & upstream</h3>
      <p className="mt-1 font-body text-sm text-kelly-text/70">Phase 1: all members share this dashboard via the same secure link (future: magic links per inbox).</p>

      <ul className="mt-6 space-y-4">
        {team.members.map((m) => (
          <li key={m.volunteerId} className="rounded-xl border border-kelly-text/10 bg-kelly-page/80 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-sm font-bold text-kelly-deep">{m.name}</span>
              {emailBadge(m.emailStatus)}
            </div>
            <p className="mt-1 font-body text-xs font-semibold text-kelly-navy">{ROLE_LABELS[m.role]}</p>
            {m.lastActivity ? <p className="mt-2 font-body text-xs text-kelly-text/70">Last activity: {m.lastActivity}</p> : null}
          </li>
        ))}
        <li className="rounded-xl border border-kelly-gold/40 bg-kelly-gold/10 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-kelly-gold/50 px-2 py-0.5 font-body text-[10px] font-bold uppercase text-kelly-deep">
              Upstream contact
            </span>
            <span className="font-heading text-sm font-bold text-kelly-deep">{team.upstreamContactName}</span>
          </div>
          {team.upstreamContactEmail ? (
            <p className="mt-1 font-body text-xs text-kelly-text/75">Routing: {team.upstreamContactEmail}</p>
          ) : (
            <p className="mt-1 font-body text-xs text-kelly-text/75">Campaign staff liaison for escalations and itinerary.</p>
          )}
        </li>
      </ul>
    </section>
  );
}
