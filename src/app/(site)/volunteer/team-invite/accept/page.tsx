import Link from "next/link";

import { submitVolunteerOpsInviteDecisionAction } from "@/lib/volunteer-ops/team-invite-actions";

export const dynamic = "force-dynamic";

export default async function VolunteerTeamInviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token?.trim() ?? "";

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Team invite</h1>
        <p className="mt-3 font-body text-sm text-kelly-text/80">This link is missing a token. Request a new invite.</p>
        <p className="mt-6">
          <Link href="/volunteer" className="font-semibold text-kelly-blue underline">
            Back to volunteer signup
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Private team invite</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">Kelly field team</h1>
      <p className="mt-3 font-body text-sm text-kelly-text/80">
        Accept to join your triad workspace. Decline or dismiss if this was not meant for you — only you and team admins
        see that response.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <form action={submitVolunteerOpsInviteDecisionAction}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            name="decision"
            value="accept"
            className="w-full rounded-xl bg-kelly-navy py-3 font-body text-sm font-semibold text-white hover:bg-kelly-deep"
          >
            Accept invite
          </button>
        </form>
        <form action={submitVolunteerOpsInviteDecisionAction}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            name="decision"
            value="decline"
            className="w-full rounded-xl border border-kelly-text/20 py-3 font-body text-sm font-semibold text-kelly-navy hover:bg-kelly-fog"
          >
            Decline
          </button>
        </form>
        <form action={submitVolunteerOpsInviteDecisionAction}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            name="decision"
            value="ignore"
            className="w-full rounded-xl py-2 font-body text-xs font-semibold text-kelly-text/70 underline"
          >
            Dismiss (mark ignored — visible only to admins and your inviter)
          </button>
        </form>
      </div>
    </div>
  );
}
