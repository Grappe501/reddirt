"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useMemo, useState } from "react";
import Link from "next/link";

import { filterInvitationsForViewer } from "@/lib/dashboard/invitation-privacy";
import { sendVolunteerOpsTeamInviteAction } from "@/lib/volunteer-ops/team-invite-actions";
import type { Team, TeamBuildInvitation, TeamInviteCoreRole, VolunteerRole } from "@/types/dashboard";

import { MissingRoleCard } from "./MissingRoleCard";
import { TeamInvitationList } from "./TeamInvitationList";
import { TeamInviteForm } from "./TeamInviteForm";

const DB_ROLE_OPTIONS: { value: VolunteerRole; label: string }[] = [
  { value: "events", label: "Events Coordinator" },
  { value: "social-media", label: "Social Media Coordinator" },
  { value: "power-of-5", label: "Power of 5 / Voter Registration Coordinator" },
  { value: "general", label: "General member (future)" },
];

function SubmitDbInviteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-kelly-navy px-4 py-2 font-body text-xs font-semibold text-white hover:bg-kelly-deep disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send private invite"}
    </button>
  );
}

function openCoreRoles(openRoles: VolunteerRole[]): TeamInviteCoreRole[] {
  return openRoles.filter((r): r is TeamInviteCoreRole => r === "events" || r === "social-media" || r === "power-of-5");
}

export function TeamBuildPanel({
  team,
  openRoles,
  viewerMemberId,
  viewerIsCampaignAdmin,
  viewerUserId,
  suggestions,
}: {
  team: Team;
  openRoles: VolunteerRole[];
  viewerMemberId: string | null;
  viewerIsCampaignAdmin: boolean;
  viewerUserId: string | null;
  suggestions: { id: string; displayLabel: string }[];
}) {
  const [localMockInvites, setLocalMockInvites] = useState<TeamBuildInvitation[]>([]);
  const [dbState, dbFormAction] = useFormState(sendVolunteerOpsTeamInviteAction, undefined);

  const coreOpen = openCoreRoles(openRoles);

  const visibleInvitations = useMemo(() => {
    if (team.isDatabaseBacked) {
      return team.invitations ?? [];
    }
    const merged = [...(team.invitations ?? []), ...localMockInvites];
    return filterInvitationsForViewer(merged, viewerMemberId, viewerIsCampaignAdmin);
  }, [team.isDatabaseBacked, team.invitations, localMockInvites, viewerMemberId, viewerIsCampaignAdmin]);

  const admins = team.adminMemberIds ?? [];
  const isDbAdmin = Boolean(viewerUserId && admins.includes(viewerUserId));
  const isOnTeam = Boolean(viewerMemberId && team.members.some((m) => m.volunteerId === viewerMemberId));
  const canMockInvite = !team.isDatabaseBacked && isOnTeam;

  return (
    <section className="rounded-2xl border border-kelly-gold/35 bg-kelly-gold/[0.06] p-6 shadow-[var(--shadow-soft)] md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-deep/70">Build your team</p>
      <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Private invitations · core triad</h3>
      <p className="mt-2 font-body text-sm text-kelly-text/80">
        Teams can launch with one volunteer. Invite the other two coordinators by email. Until someone accepts, only the
        inviter and campaign administrators see pending or declined rows — other triad members are not notified of those
        outcomes.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coreOpen.length ? (
          coreOpen.map((r) => <MissingRoleCard key={r} role={r} />)
        ) : (
          <div className="rounded-xl border border-kelly-success/35 bg-kelly-success/[0.08] px-4 py-3 sm:col-span-2 lg:col-span-3">
            <p className="font-body text-sm font-semibold text-kelly-deep">Core triad is full</p>
            <p className="mt-1 font-body text-xs text-kelly-text/75">
              Add general members or focus on downstream teams and Power of 5 scale-out.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-kelly-text/10 bg-white/90 px-4 py-3 font-body text-sm text-kelly-text/85">
        <p className="font-semibold text-kelly-deep">Open lanes (summary)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {coreOpen.length ? (
            coreOpen.map((r) => (
              <li key={r}>
                {r === "events"
                  ? "Events Coordinator"
                  : r === "social-media"
                    ? "Social Media Coordinator"
                    : "Power of 5 / Voter Registration Coordinator"}
              </li>
            ))
          ) : (
            <li>All three core lanes are filled.</li>
          )}
        </ul>
      </div>

      {team.isDatabaseBacked ? (
        <>
          {!viewerUserId ? (
            <p className="mt-4 font-body text-sm text-kelly-text/75">
              Complete volunteer signup in this browser (or open your invite acceptance link) to unlock admin tools — a
              secure session cookie is set automatically.
            </p>
          ) : !isDbAdmin ? (
            <p className="mt-4 font-body text-sm text-kelly-text/75">Only team administrators can send email invites.</p>
          ) : (
            <form action={dbFormAction} className="mt-6 space-y-4 rounded-xl border border-kelly-text/15 bg-white p-4">
              <input type="hidden" name="teamSlug" value={team.slug} />
              <div>
                <label htmlFor="vos-invite-email" className="block font-body text-xs font-bold text-kelly-deep">
                  Invite by email
                </label>
                <input
                  id="vos-invite-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-body text-sm"
                  placeholder="friend@example.com"
                />
              </div>
              <div>
                <label htmlFor="vos-invite-role" className="block font-body text-xs font-bold text-kelly-deep">
                  Role
                </label>
                <select
                  id="vos-invite-role"
                  name="role"
                  required
                  className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2 font-body text-sm"
                  defaultValue={openRoles[0] ?? "general"}
                >
                  {(openRoles.length
                    ? DB_ROLE_OPTIONS.filter((o) => openRoles.includes(o.value) || o.value === "general")
                    : DB_ROLE_OPTIONS
                  ).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {dbState?.ok === false ? <p className="font-body text-sm text-red-700">{dbState.error}</p> : null}
              {dbState?.ok === true ? (
                <div className="rounded-lg border border-kelly-success/40 bg-kelly-success/[0.12] p-3 font-body text-xs text-kelly-deep">
                  <p className="font-semibold">Invite created.</p>
                  <p className="mt-2">Email automation is stubbed — copy this private acceptance link:</p>
                  <p className="mt-2 break-all font-mono text-[11px]">{dbState.acceptPath}</p>
                </div>
              ) : null}
              <SubmitDbInviteButton />
            </form>
          )}
        </>
      ) : (
        <>
          {!canMockInvite ? (
            <p className="mt-4 font-body text-sm text-kelly-text/75">
              Demo: append <span className="font-mono text-xs">?as=vol-1</span> (or your member id) to preview invitation
              privacy. Use <span className="font-mono text-xs">?staff=1</span> to simulate campaign HQ visibility.
            </p>
          ) : (
            <TeamInviteForm
              team={team}
              openRoles={coreOpen.length ? coreOpen : ["events", "social-media", "power-of-5"]}
              inviterMemberId={viewerMemberId!}
              onInviteCreated={(inv) => setLocalMockInvites((prev) => [inv, ...prev])}
            />
          )}
        </>
      )}

      {suggestions.length > 0 && team.isDatabaseBacked && isDbAdmin ? (
        <div className="mt-6">
          <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-text/50">
            Suggested volunteers (recent signups)
          </p>
          <ul className="mt-2 space-y-2 font-body text-sm text-kelly-text/85">
            {suggestions.map((s) => (
              <li key={s.id} className="rounded-lg border border-kelly-text/10 bg-white/80 px-3 py-2">
                {s.displayLabel}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6">
        <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-text/50">
          Invitation status (visible to you)
        </p>
        <TeamInvitationList invitations={visibleInvitations} />
      </div>

      <p className="mt-6 font-body text-xs text-kelly-text/60">
        When someone in your Power of 5 network wants to volunteer officially, send them to{" "}
        <Link href="/volunteer" className="font-semibold text-kelly-blue underline">
          /volunteer
        </Link>
        .
      </p>
    </section>
  );
}
