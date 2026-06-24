import Link from "next/link";
import type { Metadata } from "next";

import { EpButton } from "@/components/election-plan/ui/EpButton";
import {
  volunteerBoardAcceptInviteAction,
  volunteerBoardSignInAction,
} from "@/lib/volunteers/board/volunteer-board-actions";
import { getVolunteerBoardSecret } from "@/lib/volunteers/board/session";

export const metadata: Metadata = {
  title: "Volunteer board sign-in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { searchParams: Promise<{ error?: string; token?: string }> };

export default async function VolunteerBoardSignInPage({ searchParams }: Props) {
  const sp = await searchParams;
  const configured = Boolean(getVolunteerBoardSecret());
  const inviteToken = sp.token?.trim();

  return (
    <>
      <div className="ep-classification">Volunteer board · We Win 26</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-md">
          <Link href="/" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Campaign home
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Your volunteer board</h1>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Sign in with the email on your volunteer roster and the campaign access password. First visit walks through
            a short onboarding to personalize your board.
          </p>

          {sp.error === "config" ? (
            <p className="ep-warning mt-4 text-sm">
              Set <code className="rounded bg-white/60 px-1">VOLUNTEER_HUB_PASSWORD</code> in Netlify, redeploy, return
              here.
            </p>
          ) : null}
          {sp.error === "auth" ? <p className="ep-warning mt-4 text-sm">Password did not match.</p> : null}
          {sp.error === "email" ? <p className="ep-warning mt-4 text-sm">Enter the email on your roster.</p> : null}
          {sp.error === "unknown" ? (
            <p className="ep-warning mt-4 text-sm">
              No volunteer board found for that email yet. Ask your organizer to add you to the roster.
            </p>
          ) : null}
          {sp.error === "invite" ? (
            <p className="ep-warning mt-4 text-sm">Invite link expired or invalid — sign in with email instead.</p>
          ) : null}

          {inviteToken && configured ? (
            <form action={volunteerBoardAcceptInviteAction} className="mt-6">
              <input type="hidden" name="token" value={inviteToken} />
              <EpButton type="submit" fullWidth size="lg">
                Accept invite &amp; open board
              </EpButton>
            </form>
          ) : null}

          {configured ? (
            <form action={volunteerBoardSignInAction} className="mt-6 space-y-4">
              <label className="block">
                <span className="ep-input-label">Email</span>
                <input type="email" name="email" required autoComplete="email" className="ep-input" />
              </label>
              <label className="block">
                <span className="ep-input-label">Access password</span>
                <input type="password" name="password" required autoComplete="current-password" className="ep-input" />
              </label>
              <EpButton type="submit" fullWidth size="lg">
                Open my board
              </EpButton>
            </form>
          ) : (
            <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">Volunteer board sign-in is not configured yet.</p>
          )}

          <p className="mt-8 text-center text-xs text-[var(--ep-navy-muted)]">
            Field leader with a 3-letter code?{" "}
            <Link href="/election-plan/operators/leaders/sign-in" className="underline">
              Leader workbench
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
