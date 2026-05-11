import type { TeamPowerOfFiveMemberNetwork, VolunteerRole } from "@/types/dashboard";

import { TeamReachContactTable } from "./TeamReachContactTable";

function roleTitle(role: VolunteerRole): string {
  switch (role) {
    case "events":
      return "Events Coordinator";
    case "social-media":
      return "Social Media Coordinator";
    case "power-of-5":
      return "Power of 5 / VR Coordinator";
    default:
      return role;
  }
}

function ProgressRow({ label, current, target }: { label: string; current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / Math.max(target, 1)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-body text-[10px] font-bold uppercase text-kelly-text/55">
        <span>{label}</span>
        <span className="tabular-nums text-kelly-deep">
          {current}/{target}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-kelly-text/10">
        <div className="h-full rounded-full bg-kelly-navy/75 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function TeamPowerOfFiveMemberCard({
  network,
}: {
  network: TeamPowerOfFiveMemberNetwork;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-kelly-text/12 bg-white p-4 shadow-[var(--shadow-soft)] md:p-5">
      <header className="border-b border-kelly-text/10 pb-3">
        <p className="font-body text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">{roleTitle(network.role)}</p>
        <h4 className="mt-1 font-heading text-base font-bold text-kelly-navy">{network.memberName}</h4>
        <dl className="mt-3 grid grid-cols-2 gap-2 font-body text-[11px] text-kelly-text/80">
          <div>
            <dt className="text-kelly-text/55">P5 contacts</dt>
            <dd className="font-mono font-semibold text-kelly-deep">{network.contacts.length}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Touches</dt>
            <dd className="font-mono font-semibold text-kelly-deep">{network.touchesCompleted}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Registrations</dt>
            <dd className="font-mono font-semibold text-kelly-deep">{network.registrationsCompleted}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Vol. referrals</dt>
            <dd className="font-mono font-semibold text-kelly-deep">{network.volunteerReferrals}</dd>
          </div>
        </dl>
      </header>
      <div className="mt-4 space-y-3">
        <ProgressRow label="Progress · 5 contacts" current={network.contacts.length} target={network.contactsTarget} />
        <ProgressRow
          label="Progress · 10 registrations"
          current={network.registrationsCompleted}
          target={network.registrationsTarget}
        />
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">Their Power of 5</p>
        <div className="mt-2 max-h-[280px] overflow-y-auto">
          <TeamReachContactTable contacts={network.contacts} variant="compact" />
        </div>
      </div>
    </article>
  );
}
