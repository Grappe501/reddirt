import type { ReactNode } from "react";
import Link from "next/link";
import { adminLogoutAction } from "@/app/admin/actions";

/**
 * Full-bleed admin chrome for Kelly Calendar Cockpit (no left site-admin sidebar).
 */
export function KellyCalendarCockpitChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a120c] text-[#f5f0e6]">
      <header className="sticky top-0 z-40 border-b border-[#f5f0e6]/10 bg-[#1a120c]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.28em] text-[#f5f0e6]/45">Kelly Calendar</p>
            <p className="font-heading text-base font-bold leading-tight">Cockpit</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/calendar-command-center"
              className="rounded-md border border-[#f5f0e6]/20 px-3 py-1.5 font-body text-xs font-semibold text-[#f5f0e6] hover:bg-[#f5f0e6]/10"
            >
              Desktop
            </Link>
            <Link
              href="/admin/workbench/calendar"
              className="rounded-md border border-[#f5f0e6]/20 px-3 py-1.5 font-body text-xs font-semibold text-[#f5f0e6] hover:bg-[#f5f0e6]/10"
            >
              HQ
            </Link>
            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="rounded-md border border-[#f5f0e6]/20 px-3 py-1.5 font-body text-xs font-semibold text-[#f5f0e6] hover:bg-[#f5f0e6]/10"
              >
                Out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-3 pb-36 pt-4">{children}</div>
    </div>
  );
}
