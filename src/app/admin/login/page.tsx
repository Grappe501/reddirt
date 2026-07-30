import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminLoginAction } from "@/lib/admin/admin-auth-actions";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { getAdminSecret } from "@/lib/admin/session";
import { isLocalAdminHost } from "@/lib/admin/local-admin-host";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import {
  CAMPAIGN_MANAGER_WORKBENCH_NAME,
  campaignManagerPageTitle,
} from "@/lib/admin/campaign-manager-workbench-labels";

function getAdminLoginDefaultPath(): string {
  return process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE === "opposition_debate"
    ? "/admin/intelligence"
    : "/admin/content";
}

export const metadata: Metadata = {
  title: campaignManagerPageTitle("Sign in"),
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const configured = Boolean(getAdminSecret());
  const localHost = await isLocalAdminHost();
  const nextPath = sp.next?.trim();
  const defaultPath = getAdminLoginDefaultPath();
  const redirectTo =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") && !nextPath.includes("\n")
      ? nextPath
      : defaultPath;
  const debateLaunch = isIntelligenceOppositionDebateLaunchMode();

  // Local loop: skip the passphrase screen entirely.
  if (localHost) {
    redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin/evidence-workbench");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#000066] px-4 py-16 text-white">
      <div className="w-full max-w-md rounded-card border border-white/25 bg-[#07074a] p-8 shadow-2xl">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#c5d2ea]">
          Kelly Grappe campaign
        </p>
        <h1 className="mt-3 font-heading text-2xl font-bold text-white">
          {debateLaunch ? "Debate intelligence workbench" : CAMPAIGN_MANAGER_WORKBENCH_NAME}
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-[#c5d2ea]">
          {debateLaunch
            ? "Sign in to access opposition research, debate prep, claims review, and action queues. Internal use only."
            : "Sign in with your Campaign Manager passphrase. This is your statewide operations workbench—content, field, calendar, and fundraising."}
        </p>

        {sp.error === "config" ? (
          <p className="mt-4 rounded-lg border border-[#ca913d]/60 bg-[#ca913d]/15 px-3 py-2 font-body text-sm text-white">
            <strong className="font-semibold">Not configured.</strong> Set{" "}
            <code className="rounded bg-black/40 px-1 text-[#e0b56a]">ADMIN_SECRET</code> in the environment, deploy,
            then return here.
          </p>
        ) : null}
        {sp.error === "auth" ? (
          <p className="mt-4 rounded-lg border border-white/30 bg-white/10 px-3 py-2 font-body text-sm text-white">
            That passphrase did not match. Try again.
          </p>
        ) : null}

        {!configured ? (
          <p className="mt-6 font-body text-xs text-[#9eb4d8]">
            Login is disabled until <code className="rounded bg-black/40 px-1">ADMIN_SECRET</code> is set.
          </p>
        ) : (
          <form action={adminLoginAction} className="mt-6 space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-[#c5d2ea]">
                Passphrase
              </span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2.5 font-body text-[#12124a] caret-[#000066] outline-none placeholder:text-[#364272] focus:ring-2 focus:ring-[#ca913d]"
                placeholder="Type passphrase"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-btn bg-[#ca913d] px-4 py-3 font-body text-sm font-bold text-[#000066] shadow-soft transition hover:-translate-y-0.5 hover:brightness-105"
            >
              {debateLaunch ? "Enter intelligence workbench" : `Enter ${CAMPAIGN_MANAGER_WORKBENCH_NAME}`}
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
