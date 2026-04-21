import Link from "next/link";
import type { Metadata } from "next";
import { adminLoginAction } from "@/app/admin/actions";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { getAdminSecret } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Admin · Content board",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const configured = Boolean(getAdminSecret());

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-deep-soil px-4 py-16 text-cream-canvas">
      <div className="w-full max-w-md rounded-card border border-cream-canvas/15 bg-cream-canvas/[0.07] p-8 shadow-2xl backdrop-blur-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-cream-canvas/50">
          Kelly Grappe campaign
        </p>
        <h1 className="mt-3 font-heading text-2xl font-bold">Content board</h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-cream-canvas/75">
          Sign in with the shared admin passphrase. This area manages public website content and Substack sync
          only.
        </p>

        {sp.error === "config" ? (
          <p className="mt-4 rounded-lg border border-sunlight-gold/40 bg-sunlight-gold/10 px-3 py-2 font-body text-sm text-cream-canvas">
            <strong className="font-semibold">Not configured.</strong> Set{" "}
            <code className="rounded bg-deep-soil/40 px-1">ADMIN_SECRET</code> in the environment, deploy, then
            return here.
          </p>
        ) : null}
        {sp.error === "auth" ? (
          <p className="mt-4 rounded-lg border border-red-dirt/50 bg-red-dirt/15 px-3 py-2 font-body text-sm">
            That passphrase did not match. Try again.
          </p>
        ) : null}

        {!configured ? (
          <p className="mt-6 font-body text-xs text-cream-canvas/55">
            Login is disabled until <code className="rounded bg-deep-soil/40 px-1">ADMIN_SECRET</code> is set.
          </p>
        ) : (
          <form action={adminLoginAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-cream-canvas/60">
                Passphrase
              </span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-md border border-cream-canvas/20 bg-deep-soil/40 px-3 py-2.5 font-body text-cream-canvas outline-none ring-red-dirt/0 transition focus:ring-2 focus:ring-red-dirt/40"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-btn bg-red-dirt px-4 py-3 font-body text-sm font-bold text-cream-canvas shadow-soft transition hover:-translate-y-0.5 hover:bg-[#8f3d24]"
            >
              Enter content board
            </button>
          </form>
        )}

        <p className="mt-8 text-center font-body text-xs text-cream-canvas/45">
          <Link href="/" className="underline-offset-2 hover:text-cream-canvas hover:underline">
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
