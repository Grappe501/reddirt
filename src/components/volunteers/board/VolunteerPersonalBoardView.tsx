import Link from "next/link";

import { EpButton } from "@/components/election-plan/ui/EpButton";
import { VOLUNTEER_BOARD_ACTIVITY_OPTIONS } from "@/lib/volunteers/board/constants";
import type { VolunteerBoardSnapshot } from "@/lib/volunteers/board/load-volunteer-board";
import { volunteerBoardLogoutAction } from "@/lib/volunteers/board/volunteer-board-actions";

type Props = {
  snapshot: VolunteerBoardSnapshot;
};

const BOARD_TILES = [
  {
    id: "my_five",
    title: "My Five",
    body: "Five trusted contacts — the foundation for relational organizing.",
    href: "/onboarding/power-of-5",
    status: "Start here",
  },
  {
    id: "voter_reg",
    title: "Voter registration",
    body: "Help neighbors check registration, request ballots, and get to the polls.",
    href: "/volunteer/resources",
    status: "Resources",
  },
  {
    id: "field_log",
    title: "Field log",
    body: "Log conversations and follow-ups — your leader sees team progress.",
    href: "/election-plan/operators/leaders/me#field-log",
    status: "Leaders only",
  },
  {
    id: "events",
    title: "Events & shifts",
    body: "Tabling, phone banks, and community events near you.",
    href: "/events",
    status: "Calendar",
  },
  {
    id: "training",
    title: "Training",
    body: "Power of 5 walkthrough and campaign tools.",
    href: "/onboarding/power-of-5",
    status: "Onboarding",
  },
  {
    id: "messages",
    title: "What to say",
    body: "Message templates for conversations with friends and neighbors.",
    href: "/organizing-intelligence",
    status: "Message engine",
  },
] as const;

function activityLabels(ids: VolunteerBoardSnapshot["interests"]): string {
  if (ids.length === 0) return "Not set yet";
  const map = new Map(VOLUNTEER_BOARD_ACTIVITY_OPTIONS.map((o) => [o.id, o.label]));
  return ids.map((id) => map.get(id) ?? id).join(" · ");
}

export function VolunteerPersonalBoardView({ snapshot }: Props) {
  const location = [snapshot.county, snapshot.zip].filter(Boolean).join(" · ") || "Add your location";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ep-navy-muted)]">
            Volunteer board
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-[var(--ep-navy)]">
            {snapshot.displayName}&apos;s board
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ep-navy-muted)]">
            Your personal voter-volunteer home base. Tiles below match what every volunteer starts with — we&apos;ll
            personalize more as you go.
          </p>
        </div>
        <form action={volunteerBoardLogoutAction}>
          <EpButton type="submit" variant="secondary" size="sm">
            Sign out
          </EpButton>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="ep-card rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Contact</p>
          <p className="mt-1 text-sm font-medium text-[var(--ep-navy)]">{snapshot.email}</p>
          <p className="text-sm text-[var(--ep-navy-muted)]">{snapshot.phone ?? "Add mobile in settings"}</p>
        </div>
        <div className="ep-card rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Location</p>
          <p className="mt-1 text-sm font-medium text-[var(--ep-navy)]">{location}</p>
        </div>
        <div className="ep-card rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">How you help</p>
          <p className="mt-1 text-sm font-medium text-[var(--ep-navy)]">{activityLabels(snapshot.interests)}</p>
          {snapshot.placementLeaderName ? (
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Leader: {snapshot.placementLeaderName}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Your tiles</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOARD_TILES.map((tile) => (
            <Link
              key={tile.id}
              href={tile.href}
              className="ep-card group block rounded-xl p-5 transition hover:border-[var(--ep-gold)]/60"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading text-lg font-semibold text-[var(--ep-navy)]">{tile.title}</h3>
                <span className="rounded-full bg-[var(--ep-cream)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  {tile.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{tile.body}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-[var(--ep-navy)]/10 bg-white/60 p-5">
        <h2 className="font-heading text-lg font-semibold text-[var(--ep-navy)]">Field leader?</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          County and lane leaders use the operator workbench for field log, team roster, and command tools.
        </p>
        <Link href="/election-plan/operators/leaders/sign-in" className="ep-btn ep-btn-secondary ep-btn-sm mt-4 inline-flex">
          Open leader workbench
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-[var(--ep-navy-muted)]">
        <Link href="/volunteers/me?onboarding=1" className="underline">
          Update preferences
        </Link>
      </p>
    </div>
  );
}
