import Link from "next/link";
import { schedulerLogoutAction } from "@/lib/scheduler/auth-actions";

export function SchedulerShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-kelly-page text-kelly-text">
      <header className="border-b border-kelly-navy/15 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Scheduler Dashboard</p>
            <p className="font-heading text-lg font-bold text-kelly-text">OSCAR calendar desk</p>
          </div>
          <nav className="flex flex-wrap items-center gap-3 font-body text-sm font-semibold">
            <Link href="/scheduler" className="text-kelly-navy underline-offset-4 hover:underline">
              Queue
            </Link>
            <Link href="/scheduler/inbox" className="text-kelly-navy underline-offset-4 hover:underline">
              OSCAR inbox
            </Link>
            <Link href="/events" className="text-kelly-text/70 underline-offset-4 hover:underline">
              Public /events
            </Link>
            <span className="text-kelly-text/55">{email}</span>
            <form action={schedulerLogoutAction}>
              <button type="submit" className="text-kelly-text/70 underline-offset-4 hover:underline">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
