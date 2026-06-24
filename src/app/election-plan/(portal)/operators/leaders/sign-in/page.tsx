import Link from "next/link";
import type { Metadata } from "next";

import { LeaderSignInInitialsPicker } from "@/components/volunteers/LeaderSignInInitialsPicker";
import { EpButton } from "@/components/election-plan/ui/EpButton";
import { volunteerHubLoginAction } from "@/lib/volunteers/auth/volunteer-auth-actions";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import { getVolunteerHubPassword } from "@/lib/volunteers/auth/session";

export const metadata: Metadata = {
  title: "Leader sign-in | Operators",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LeaderWorkbenchSignInPage({ searchParams }: Props) {
  const sp = await searchParams;
  const configured = Boolean(getVolunteerHubPassword());
  const roster = getVolunteerLeaderRoster();
  const nextPath = sp.next?.trim();
  const redirectTo =
    nextPath &&
    nextPath.startsWith("/election-plan/operators/leaders") &&
    !nextPath.startsWith("//") &&
    !nextPath.includes("\n") &&
    !nextPath.startsWith("/election-plan/operators/leaders/sign-in")
      ? nextPath
      : "/election-plan/operators/leaders/me";

  return (
    <>
      <div className="ep-classification">Leader access · We Win 26</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-md">
          <Link
            href="/election-plan/operators/leaders"
            className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline"
          >
            ← Leader workbenches
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Sign in to your workbench</h1>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            3-letter leader code + shared password. Couples share one login.
          </p>

          {sp.error === "config" ? (
            <p className="ep-warning mt-4 text-sm">
              Set <code className="rounded bg-white/60 px-1">VOLUNTEER_HUB_PASSWORD</code> in Netlify, redeploy, return
              here.
            </p>
          ) : null}
          {sp.error === "auth" ? <p className="ep-warning mt-4 text-sm">Password did not match.</p> : null}
          {sp.error === "initials" ? <p className="ep-warning mt-4 text-sm">Enter exactly 3 letters.</p> : null}
          {sp.error === "unknown" ? <p className="ep-warning mt-4 text-sm">Leader code not on roster yet.</p> : null}

          {configured ? (
            <form action={volunteerHubLoginAction} className="mt-6 space-y-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <LeaderSignInInitialsPicker leaders={roster} />
              <label className="block">
                <span className="ep-input-label">Password</span>
                <input type="password" name="password" required autoComplete="current-password" className="ep-input" />
              </label>
              <EpButton type="submit" fullWidth size="lg">
                Open my workbench
              </EpButton>
            </form>
          ) : (
            <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">Dev mode — workbench opens without password.</p>
          )}
        </div>
      </div>
    </>
  );
}
