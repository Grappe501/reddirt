import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";

export default async function KellyCalendarInstallPage() {
  const secret = getAdminSecret();
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (secret && verifyAdminSessionToken(token, secret)) {
    redirect("/admin/calendar-command-center/kelly");
  }
  return (
    <div className="min-h-screen bg-[#1a120c] px-4 py-10 font-body text-[#f5f0e6]">
      <div className="mx-auto max-w-md space-y-4">
        <p className="font-heading text-2xl font-bold">Kelly Calendar</p>
        <p className="text-sm leading-relaxed text-[#f5f0e6]/75">
          Sign in to the campaign admin first, then return here on your iPhone and use{" "}
          <span className="font-semibold">Add to Home Screen</span> for a full-screen app shell.
        </p>
        <Link
          href="/admin/login?next=/admin/calendar-command-center/kelly"
          className="inline-block rounded-lg bg-amber-400 px-4 py-3 text-sm font-bold text-black"
        >
          Admin sign-in
        </Link>
        <p className="text-xs text-[#f5f0e6]/50">
          The service worker only registers under <code className="text-[#f5f0e6]/80">/kelly/</code> and does not cache
          private event data.
        </p>
      </div>
    </div>
  );
}
