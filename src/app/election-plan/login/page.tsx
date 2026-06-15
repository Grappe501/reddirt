import Link from "next/link";
import type { Metadata } from "next";
import { electionPlanLoginAction } from "@/lib/election-plan/auth/election-plan-auth-actions";
import { getElectionPlanPassword } from "@/lib/election-plan/auth/session";

export const metadata: Metadata = {
  title: "Election Plan · Sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function ElectionPlanLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const configured = Boolean(getElectionPlanPassword());
  const nextPath = sp.next?.trim();
  const redirectTo =
    nextPath &&
    nextPath.startsWith("/election-plan") &&
    !nextPath.startsWith("//") &&
    !nextPath.includes("\n") &&
    !nextPath.startsWith("/election-plan/login")
      ? nextPath
      : "/election-plan";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ep-navy)] px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Internal · Kelly Grappe</p>
        <h1 className="mt-3 font-heading text-2xl font-bold text-[var(--ep-navy)]">Election Plan</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          Leadership, coalition, and volunteer strategy — password required. Not indexed or publicly shared.
        </p>

        {sp.error === "config" ? (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <strong>Not configured.</strong> Set <code className="rounded bg-amber-100 px-1">ELECTION_PLAN_PASSWORD</code>{" "}
            in Netlify environment variables, redeploy, then return here.
          </p>
        ) : null}
        {sp.error === "auth" ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            That password did not match. Try again.
          </p>
        ) : null}

        {!configured && process.env.NODE_ENV === "production" ? (
          <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">
            Login is disabled until <code className="rounded bg-slate-100 px-1">ELECTION_PLAN_PASSWORD</code> is set.
          </p>
        ) : !configured ? (
          <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">
            No password configured locally — Election Plan is open in development. Set{" "}
            <code className="rounded bg-slate-100 px-1">ELECTION_PLAN_PASSWORD</code> in <code>.env</code> to test the
            gate.
          </p>
        ) : (
          <form action={electionPlanLoginAction} className="mt-6 space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ep-navy-muted)]">Password</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-md border border-[var(--ep-border)] px-3 py-2.5 text-[var(--ep-navy)] outline-none focus:ring-2 focus:ring-[var(--ep-gold)]"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-md bg-[var(--ep-navy)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--ep-navy)]/90"
            >
              Enter Election Plan
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-[var(--ep-navy-muted)]">
          <Link href="/" className="hover:text-[var(--ep-navy)] hover:underline">
            Back to public site
          </Link>
        </p>
      </div>
    </div>
  );
}
