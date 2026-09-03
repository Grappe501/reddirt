import type { Metadata } from "next";
import Link from "next/link";
import { schedulerLoginAction } from "@/lib/scheduler/auth-actions";
import { isSchedulerConfigured } from "@/lib/scheduler/session";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";

export const metadata: Metadata = {
  title: "Scheduler sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SchedulerLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; next?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const configured = isSchedulerConfigured();
  const nextPath = sp.next?.trim();
  const redirectTo =
    nextPath && nextPath.startsWith("/scheduler") && !nextPath.startsWith("//") ? nextPath : "/scheduler";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#000066] px-4 py-16 text-white">
      <div className="w-full max-w-md rounded-card border border-white/25 bg-[#07074a] p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#c5d2ea]">Scheduler Dashboard</p>
        <h1 className="mt-3 font-heading text-2xl font-bold">Calendar desk</h1>
        <p className="mt-3 font-body text-sm text-[#c5d2ea]">
          Calendar only. This login does not open finance, intel, or the campaign manager board.
        </p>
        {sp.error === "config" ? (
          <p className="mt-4 rounded-lg border border-[#ca913d]/60 bg-[#ca913d]/15 px-3 py-2 font-body text-sm">
            Set SCHEDULER_OPERATOR_EMAIL and SCHEDULER_OPERATOR_PASSWORD in the environment, then return here.
          </p>
        ) : null}
        {sp.error === "auth" ? (
          <p className="mt-4 rounded-lg border border-white/30 bg-white/10 px-3 py-2 font-body text-sm">
            That email or password did not match.
          </p>
        ) : null}
        {!configured ? (
          <p className="mt-6 font-body text-xs text-[#9eb4d8]">
            Login is disabled until the scheduler operator env vars are set.
          </p>
        ) : (
          <form action={schedulerLoginAction} className="mt-6 space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-[#c5d2ea]">Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="username"
                className="mt-2 w-full rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2.5 font-body text-[#12124a]"
              />
            </label>
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-[#c5d2ea]">Password</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2.5 font-body text-[#12124a]"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-btn bg-[#ca913d] px-4 py-3 font-body text-sm font-bold text-[#000066]"
            >
              Enter scheduler
            </button>
          </form>
        )}
        <p className="mt-8 text-center font-body text-xs text-[#9eb4d8]">
          <Link href="/" className="text-white underline-offset-2 hover:underline">
            Back to site
          </Link>
        </p>
      </div>
      <div className="mt-8 max-w-md px-2">
        <CampaignPaidForBar variant="dark" />
      </div>
    </div>
  );
}
