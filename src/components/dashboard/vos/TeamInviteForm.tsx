"use client";

import { useState } from "react";

import { computeInvitationVisibility } from "@/lib/dashboard/invitation-privacy";
import type { Team, TeamBuildInvitation, TeamInviteCoreRole } from "@/types/dashboard";

const ROLE_OPTIONS: { value: TeamInviteCoreRole; label: string }[] = [
  { value: "events", label: "Events Coordinator" },
  { value: "social-media", label: "Social Media Coordinator" },
  { value: "power-of-5", label: "Power of 5 / Voter Registration Coordinator" },
];

/** Mock-only invite creator (no email). See `TeamBuildPanel` for database-backed invites. */
export function TeamInviteForm({
  team,
  openRoles,
  inviterMemberId,
  onInviteCreated,
}: {
  team: Team;
  openRoles: TeamInviteCoreRole[];
  inviterMemberId: string;
  onInviteCreated: (inv: TeamBuildInvitation) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamInviteCoreRole>(openRoles[0] ?? "events");
  const [note, setNote] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const defaultRole = openRoles[0] ?? "events";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setStatusMsg("Add an email.");
      return;
    }
    const memberIds = team.members.map((m) => m.volunteerId);
    const effectiveRole = openRoles.includes(role) ? role : defaultRole;
    const inv: TeamBuildInvitation = {
      id: `mock-inv-${Date.now()}`,
      teamId: team.id,
      email: trimmed,
      intendedRole: effectiveRole,
      invitedByMemberId: inviterMemberId,
      status: "sent",
      note: note.trim() || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
      visibleToMemberIds: computeInvitationVisibility(
        { status: "sent", invitedByMemberId: inviterMemberId },
        memberIds,
      ),
    };
    onInviteCreated(inv);
    setEmail("");
    setNote("");
    setStatusMsg("Invite recorded (demo — no email sent).");
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-kelly-text/15 bg-white p-4">
      <div>
        <label htmlFor="vos-mock-invite-email" className="block font-body text-xs font-bold text-kelly-deep">
          Invite by email
        </label>
        <input
          id="vos-mock-invite-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-body text-sm"
          placeholder="friend@example.com"
        />
      </div>
      <div>
        <label htmlFor="vos-mock-invite-role" className="block font-body text-xs font-bold text-kelly-deep">
          Intended role
        </label>
        <select
          id="vos-mock-invite-role"
          value={openRoles.includes(role) ? role : defaultRole}
          onChange={(ev) => setRole(ev.target.value as TeamInviteCoreRole)}
          className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-body text-sm"
        >
          {(openRoles.length ? ROLE_OPTIONS.filter((o) => openRoles.includes(o.value)) : ROLE_OPTIONS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="vos-mock-invite-note" className="block font-body text-xs font-bold text-kelly-deep">
          Optional personal note
        </label>
        <textarea
          id="vos-mock-invite-note"
          value={note}
          onChange={(ev) => setNote(ev.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-body text-sm"
          placeholder="Private to inviter + HQ until accepted."
        />
      </div>
      {statusMsg ? <p className="font-body text-xs text-kelly-deep">{statusMsg}</p> : null}
      <button
        type="submit"
        className="rounded-lg bg-kelly-navy px-4 py-2 font-body text-xs font-semibold text-white hover:bg-kelly-deep"
      >
        Record invite (demo)
      </button>
    </form>
  );
}
