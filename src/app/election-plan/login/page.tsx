import Link from "next/link";
import type { Metadata } from "next";

import { EpButton } from "@/components/election-plan/ui/EpButton";
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
    <div className="ep-login-shell">
      <div className="ep-login-brand-panel">
        <div className="relative z-10 max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Internal · Kelly Grappe</p>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-white">Election Plan</h1>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Leadership strategy, coalition command, county playbooks, and debate prep — one secure workspace for the
            campaign team.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ep-gold)]" aria-hidden />
              Executive war room &amp; 20-week activation timeline
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ep-gold)]" aria-hidden />
              County playbooks &amp; priority city intelligence
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ep-gold)]" aria-hidden />
              Debate prep command course &amp; forum transcript lab
            </li>
          </ul>
        </div>
      </div>

      <div className="ep-login-form-panel">
        <div className="ep-login-card">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ep-gold)]">Secure access</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Sign in</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
            Password required. Not indexed or publicly shared.
          </p>

          {sp.error === "config" ? (
            <p className="ep-warning mt-4 text-sm">
              <strong>Not configured.</strong> Set <code className="rounded bg-white/60 px-1">ELECTION_PLAN_PASSWORD</code>{" "}
              in Netlify environment variables, redeploy, then return here.
            </p>
          ) : null}
          {sp.error === "auth" ? (
            <p className="ep-warning mt-4 text-sm">
              That password did not match. Try again.
            </p>
          ) : null}

          {!configured && process.env.NODE_ENV === "production" ? (
            <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">
              Login is disabled until <code className="rounded bg-[var(--ep-cream)] px-1">ELECTION_PLAN_PASSWORD</code> is
              set.
            </p>
          ) : !configured ? (
            <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">
              No password configured locally — Election Plan is open in development.
            </p>
          ) : (
            <form action={electionPlanLoginAction} className="mt-6 space-y-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <label className="block">
                <span className="ep-input-label">Password</span>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  className="ep-input"
                />
              </label>
              <EpButton type="submit" fullWidth size="lg">
                Enter Election Plan
              </EpButton>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-[var(--ep-navy-muted)]">
            <Link href="/" className="font-semibold text-[var(--ep-blue)] hover:underline">
              Back to public site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
