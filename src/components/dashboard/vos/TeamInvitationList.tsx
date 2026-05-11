import type { TeamBuildInvitation, TeamBuildInviteStatus } from "@/types/dashboard";

function statusLabel(s: TeamBuildInviteStatus): string {
  const m: Record<TeamBuildInviteStatus, string> = {
    drafted: "Drafted",
    sent: "Sent",
    accepted: "Accepted",
    declined: "Declined",
    expired: "Expired",
    canceled: "Canceled",
  };
  return m[s];
}

function roleLabel(role: TeamBuildInvitation["intendedRole"]): string {
  switch (role) {
    case "events":
      return "Events";
    case "social-media":
      return "Social";
    case "power-of-5":
      return "P5 / VR";
    default:
      return role;
  }
}

export function TeamInvitationList({ invitations }: { invitations: TeamBuildInvitation[] }) {
  if (!invitations.length) {
    return (
      <p className="mt-2 font-body text-sm text-kelly-text/65">
        No invitations visible for your role — pending or declined rows stay between the inviter and campaign administrators.
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-2">
      {invitations.map((inv) => (
        <li
          key={inv.id}
          className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-kelly-text/10 bg-white/90 px-3 py-2 font-body text-sm"
        >
          <div>
            <span className="font-medium text-kelly-deep">{inv.email}</span>
            <span className="ml-2 text-xs text-kelly-text/55">· {roleLabel(inv.intendedRole)}</span>
            {inv.note ? <p className="mt-1 text-xs italic text-kelly-text/60">&ldquo;{inv.note}&rdquo;</p> : null}
          </div>
          <span className="font-body text-xs text-kelly-text/65">{statusLabel(inv.status)}</span>
        </li>
      ))}
    </ul>
  );
}
